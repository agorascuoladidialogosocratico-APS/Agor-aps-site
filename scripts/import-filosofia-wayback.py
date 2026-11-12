#!/usr/bin/env python3
"""Restore editorial articles from archived Altervista WordPress."""
import argparse,concurrent.futures,json,re,urllib.request,urllib.parse,time,datetime as dt
from collections import deque
from pathlib import Path
from bs4 import BeautifulSoup
from markdownify import markdownify as md
ROOT='https://filosofiasuldivano.altervista.org'
AUTHOR='Gioele Pio Fragale'
ARTICLES=[
('il-reale-colpevole','Il reale, colpevole','2021-07-27'),
('vedere-la-realta-davanti-agli-occhi','Vedere la realtà davanti agli occhi','2021-08-30'),
('poesia-del-felice','Poesia del felice','2021-12-12'),
('ll-ruolo-degli-intellettuali-nella-societa-odierna','Il ruolo degli intellettuali nella società odierna','2022-01-18'),
('la-maggiore-ispirazione','La maggiore ispirazione','2022-01-25'),
('herman-hesse-autore-filosofico-che-spiega-loriente-con-la-narrazione','Herman Hesse, autore filosofico che spiega l’oriente con la narrazione','2022-11-04'),
('cosi-parlo-zarathustra-di-friedrich-nietzsche-e-la-filosofia-delleterno-ritorno','Così parlò Zarathustra e la filosofia dell’eterno ritorno','2022-11-04'),
('gli-anime-come-metodo-educativo-3-buoni-motivi-per-guardarli','Gli anime come metodo educativo','2022-11-05'),
('laurearsi-prima-subito-immediatamente-prematuramente','Laurearsi prima, subito, immediatamente… prematuramente (?)','2022-11-05'),
('aristotele-e-la-filosofia-del-tempo','Aristotele e la filosofia del tempo','2022-11-06'),
('due-nuovi-libri-due-momenti-di-crescita-individuale-e-collettiva','Due nuovi libri. Due momenti di crescita individuale e collettiva','2022-11-07'),
('perche-leggere-tre-buone-motivazioni-per-farlo','Perché leggere? Tre buone motivazioni per farlo','2022-11-10'),
('studiare-per-piacere-e-un-buon-motivo-per-andare-alluniversita','Studiare per piacere è un buon motivo per andare all’università?','2022-11-10'),
('la-filosofia-kantiana-cose','La filosofia kantiana cos’è?','2022-11-10'),
('il-disconoscimento-del-mondo-attraverso-i-desideri-nascosti','Il disconoscimento del mondo attraverso i desideri nascosti','2022-12-31'),
('la-legge-per-chi-legge-tra-anomia-e-disinformazione','La legge per chi legge, tra anomia e disinformazione','2023-03-29'),
('encomio-sullonesta-quando-un-folle-descrive-una-liberta-romantica-di-mario-guarnera-e-gioele-pio-fragale',"Encomio sull'onestà", '2021-11-09'),
('recensione-breve-del-libro-racconti-di-filo-sofia-racconto-i-lapertura-della-caverna','Recensione breve', '2022-09-30'),
('rosso-malpelo-ed-il-mito-della-caverna-due-fenomeni-a-confronto', 'Rosso malpelo', '2022-12-20'),
('three-ways-to-read-a-philosophy-book','Three ways to read a philosophy book',''),
('socrates-the-man-who-knew-not-to-know','Socrates the man who knew not to know','')]
HEADERS={'User-Agent':'Mozilla/5.0 (compatible; AgoraAPS-EditorialArchivalRecovery/1.0)','Accept':'text/html,application/json'}
def fetch(url,timeout=24,maxbytes=2_000_000):
    req=urllib.request.Request(url,headers=HEADERS)
    with urllib.request.urlopen(req,timeout=timeout) as res:
        if res.status!=200: raise ValueError('HTTP '+str(res.status))
        return res.read(maxbytes)
def links(slug,date):
    src=ROOT+'/'+slug+'/'
    u='https://archive.org/wayback/available?'+urllib.parse.urlencode({'url':src,'timestamp':(date or '2023-01-01').replace('-','')+'120000'})
    a=json.loads(fetch(u,timeout=16,maxbytes=40000))
    close=(a.get('archived_snapshots') or {}).get('closest') or {}
    if close.get('status')!='200' or not close.get('timestamp'):raise ValueError('snapshot assente')
    stamp=close['timestamp']
    return ('https://web.archive.org/web/'+stamp+'/'+src,'https://web.archive.org/web/'+stamp+'id_/'+src)
def slug_from_url(url):
    if not url: return None
    import urllib.parse as up
    url=up.unquote(str(url))
    if '/web/' in url and 'filosofiasuldivano.altervista.org/' in url:
        url=url[url.find('https://filosofiasuldivano.altervista.org/'):]
    parsed=up.urlsplit(url)
    if parsed.netloc not in ('filosofiasuldivano.altervista.org','www.filosofiasuldivano.altervista.org'):return None
    p=[part for part in parsed.path.split('/') if part]
    if len(p)!=1 or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',p[0]):return None
    if p[0].startswith(('category','tag','author','page','articoli','contact','wp-','feed','privacy','contatti','about','login')):return None
    return p[0]
def find_article_urls(soup):
    selectors='.post-title a[href],.entry-title a[href],.nav-links a[href],.post-navigation a[href],.related-posts a[href],a[rel=prev],a[rel=next]'
    found=set()
    for a in soup.select(selectors):
        slug=slug_from_url(a.get('href'))
        if slug:found.add(slug)
    return sorted(found)
def get_meta(soup):
    for node in soup.select('script[type="application/ld+json"]'):
        try:data=json.loads(node.get_text())
        except (ValueError,TypeError):continue
        nodes=data.get('@graph',[]) if isinstance(data,dict) else []
        if isinstance(data,dict):nodes=[data]+(nodes if isinstance(nodes,list) else [])
        for row in nodes:
            if isinstance(row,dict) and any(k in str(row.get('@type','')) for k in ('Article','BlogPosting')):
                return row
    return {}
def original_date(article,soup):
    meta=get_meta(soup)
    for sel in ('time.entry-date.published[datetime]','time.published[datetime]','time[datetime]'):
        node=article.select_one(sel)
        if node:
            match=re.search(r'(20\d\d)[-/](\d\d)[-/](\d\d)',str(node.get('datetime','')))
            if match:
                date='-'.join(match.groups())
                try:dt.date.fromisoformat(date);return date
                except ValueError:pass
    for candidate in (meta.get('datePublished'), (soup.select_one('meta[property="article:published_time"]') or {}).get('content')):
        match=re.search(r'(20\d\d)[-/](\d\d)[-/](\d\d)',str(candidate or ''))
        if match:
            date='-'.join(match.groups())
            try:dt.date.fromisoformat(date);return date
            except ValueError:pass
    return None
def original_author(article,soup):
    for sel in ('.post-meta-author a','.post-author a','.author.vcard a','.author-name a','a[rel=author]','.author.vcard'):
        node=article.select_one(sel)
        if node:
            value=node.get_text(' ',strip=True)
            value=re.sub(r'^(?:Author|By)\s+','',value,flags=re.I).strip()
            if value and value.lower() not in ('author','by'):return value[:150]
    author=get_meta(soup).get('author')
    if isinstance(author,list):author=author[0] if author else None
    if isinstance(author,dict) and author.get('name'):return str(author['name'])[:150]
    return 'Redazione Filosofia sul divano'
def extract(raw):
    soup=BeautifulSoup(raw,'html.parser')
    post=soup.select_one('article.status-publish') or soup.select_one('article.post')
    if not post:raise ValueError('pagina non riconosciuta come articolo WordPress pubblico')
    head=post.select_one('h1.entry-title, h1.post-title') or soup.select_one('h1.entry-title, article h1')
    title=head.get_text(' ',strip=True) if head else ''
    if re.match(r'^(Protetto:|Protected:)',title,re.I) or post.select_one('input[type=password]'):
        raise ValueError('articolo protetto')
    observed_date=original_date(post,soup)
    observed_author=original_author(post,soup)
    discovered=find_article_urls(soup)
    css='script,style,noscript,iframe,form,button,.sharedaddy,.sd-sharing-enabled,.jp-relatedposts,.wp-block-jetpack-likes,.post-navigation,.yarpp-related,.related-posts,.comments-area,.pum-container,.entry-footer,.post-tags,.share-buttons'
    for node in soup.select(css):node.decompose()
    body=None
    for selector in ['article .entry-content','article .post-content','main .entry-content','.single-post .entry-content','.entry-content','article .content']:
        for candidate in soup.select(selector):
            if len(candidate.get_text(' ',strip=True))>90:
                body=candidate;break
        if body:break
    if body is None:raise ValueError('area testuale WordPress assente')
    for elem in body.select('img,picture,video,audio,iframe,script,style,noscript,form,input,button,svg'):
        elem.decompose()
    for a in body.select('a[href]'):
        if not a.get('href','').startswith(('https://','http://','/')):a.unwrap()
    markdown=md(str(body),heading_style='ATX',bullets='-',strip=['img']).strip()
    # WordPress/Jetpack inject sharing buttons as Markdown hyperlinks.
    # Remove only links to sharing services, not editorial hyperlinks.
    markdown=re.sub(r'(?im)^\s*\[(?:Facebook|Twitter|Pinterest|LinkedIn)\]\(https?://[^\n]+?\)\s*
    if len(markdown)<110 or len(markdown)>80000:raise ValueError('lunghezza contenuto anomala: '+str(len(markdown)))
    if 'Questo contenuto è protetto' in markdown[:500]:raise ValueError('contenuto protetto')
    return title,markdown,observed_date,observed_author,discovered
def preview(slug):
    return str(Path('content/magazine/archivio-'+slug+'.json'))
def one(article):
    slug,guess_title,guess_date=article
    try:
        archive,raw=links(slug,guess_date)
        html=fetch(raw,timeout=29)
        heading,text,published,byline,more=extract(html)
        date=published or guess_date
        if not date:raise ValueError('data di pubblicazione originale non verificata')
        clean=re.sub(r'\s+',' ',re.sub(r'[#*<>_\[\]\x60]',' ',text)).strip()
        excerpt=clean[:230].rsplit(' ',1)[0].rstrip(' ,.;')+('…' if len(clean)>230 else '')
        original_url=ROOT+'/'+slug+'/'
        obj={'title':heading or guess_title,'date':date,'category':'Archivio Filosofia sul divano',
          'author':byline,'excerpt':excerpt,'cover':'/assets/agora_dialogo.webp',
          'coverAlt':'Immagine illustrativa della redazione Agorà APS, non originale dell’articolo',
          'published':True,'featured':False,'body':text,
          'archiveSource':'Filosofia sul divano','archiveOriginalUrl':original_url,'archiveUrl':archive,'sourceUrl':archive,'sourceTitle':'Filosofia sul divano (archivio storico)',
          'socialFacebook':False,'socialInstagram':False,'socialX':False,
          'socialFacebookText':'','socialInstagramText':'','socialXText':''}
        return {'slug':slug,'date':date,'author':byline,'status':'ready','originalTitle':heading,
                'length':len(text),'target':preview(slug),'data':obj,'discovered':more}
    except Exception as exc:
        return {'slug':slug,'status':'skipped','reason':type(exc).__name__+': '+str(exc)[:150]}
def discover():
    found={slug:(slug,title,date) for slug,title,date in ARTICLES}
    # Historical public homepage captured in January 2023 contains a long index of original posts.
    try:
        url='https://web.archive.org/web/20230109193557id_/'+ROOT+'/'
        html=fetch(url,timeout=27,maxbytes=1000000)
        soup=BeautifulSoup(html,'html.parser')
        for slug in find_article_urls(soup):
            found.setdefault(slug,(slug,'',''))
    except Exception as exc:print('INDEX_SNAPSHOT_ERROR',type(exc).__name__,flush=True)
    # CDX can return every historically captured permalink in a single bounded request.
    try:
        api='https://web.archive.org/cdx/search/cdx?'+urllib.parse.urlencode({
            'url':'filosofiasuldivano.altervista.org/*','output':'json',
            'fl':'timestamp,original','filter':'statuscode:200','collapse':'urlkey','limit':500})
        items=json.loads(fetch(api,timeout=18,maxbytes=550000))
        for row in items[1:]:
            if not isinstance(row,list) or len(row)<2:continue
            slug=slug_from_url(row[1])
            if slug:found.setdefault(slug,(slug,'',''))
    except Exception as exc:print('CDX_UNAVAILABLE',type(exc).__name__,flush=True)
    print('DISCOVERED_INITIAL',len(found),flush=True)
    return found
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');args=parser.parse_args()
    found=discover()
    queue=deque(found.values())
    seen=set()
    results=[]
    while queue and len(seen)<110:
        batch=[]
        while queue and len(batch)<5 and len(seen)+len(batch)<110:
            entry=queue.popleft()
            if entry[0] not in seen and entry[0] not in [b[0] for b in batch]:
                batch.append(entry)
        if not batch:continue
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
            bunch=list(pool.map(one,batch))
        for row in bunch:
            seen.add(row['slug'])
            for slug in row.pop('discovered',[]):
                if slug not in seen and slug not in found:
                    found[slug]=(slug,'','')
                    queue.append(found[slug])
            results.append(row)
        ready=sum(row['status']=='ready' for row in results)
        print('ARCHIVE_PROGRESS',json.dumps({'attempted':len(seen),'complete':ready,'pending':len(queue)}),flush=True)
    ready=[r for r in results if r['status']=='ready']
    if args.write and len(ready)<3:raise SystemExit('Meno di 3 articoli completi: importazione annullata')
    if args.write:
        for row in ready:
            path=Path(row['target'])
            if path.exists():continue
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_text(json.dumps(row['data'],indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    inventory={'total_candidates':len(found),'attempted':len(results),'complete':len(ready),
               'unprocessed':len(queue),'not_recovered':len(results)-len(ready),
               'items':[{k:v for k,v in row.items() if k!='data'} for row in results]}
    Path('data').mkdir(exist_ok=True)
    Path('data/filosofia-archive-inventory.json').write_text(json.dumps(inventory,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    for row in results:
        print('ARTICLE_RESULT',json.dumps({k:v for k,v in row.items() if k!='data'},ensure_ascii=False),flush=True)
    print('RECOVERY_SUMMARY',json.dumps({k:v for k,v in inventory.items() if k!='items'},ensure_ascii=False),flush=True)
if __name__=='__main__':main()
,'',markdown)
    markdown=re.sub(r'(?im)^\s*(?:Facebook|Twitter|Pinterest|LinkedIn|Oggi ho letto su.*|Vuoi abilitare le notifiche\?|Notifiche push abilitate|Condividi sui social|Stampa)\s*
    if len(markdown)<110 or len(markdown)>80000:raise ValueError('lunghezza contenuto anomala: '+str(len(markdown)))
    if 'Questo contenuto è protetto' in markdown[:500]:raise ValueError('contenuto protetto')
    return title,markdown,observed_date,observed_author,discovered
def preview(slug):
    return str(Path('content/magazine/archivio-'+slug+'.json'))
def one(article):
    slug,guess_title,guess_date=article
    try:
        archive,raw=links(slug,guess_date)
        html=fetch(raw,timeout=29)
        heading,text,published,byline,more=extract(html)
        date=published or guess_date
        if not date:raise ValueError('data di pubblicazione originale non verificata')
        clean=re.sub(r'\s+',' ',re.sub(r'[#*<>_\[\]\x60]',' ',text)).strip()
        excerpt=clean[:230].rsplit(' ',1)[0].rstrip(' ,.;')+('…' if len(clean)>230 else '')
        original_url=ROOT+'/'+slug+'/'
        obj={'title':heading or guess_title,'date':date,'category':'Archivio Filosofia sul divano',
          'author':byline,'excerpt':excerpt,'cover':'/assets/agora_dialogo.webp',
          'coverAlt':'Immagine illustrativa della redazione Agorà APS, non originale dell’articolo',
          'published':True,'featured':False,'body':text,
          'archiveSource':'Filosofia sul divano','archiveOriginalUrl':original_url,'archiveUrl':archive,'sourceUrl':archive,'sourceTitle':'Filosofia sul divano (archivio storico)',
          'socialFacebook':False,'socialInstagram':False,'socialX':False,
          'socialFacebookText':'','socialInstagramText':'','socialXText':''}
        return {'slug':slug,'date':date,'author':byline,'status':'ready','originalTitle':heading,
                'length':len(text),'target':preview(slug),'data':obj,'discovered':more}
    except Exception as exc:
        return {'slug':slug,'status':'skipped','reason':type(exc).__name__+': '+str(exc)[:150]}
def discover():
    found={slug:(slug,title,date) for slug,title,date in ARTICLES}
    # Historical public homepage captured in January 2023 contains a long index of original posts.
    try:
        url='https://web.archive.org/web/20230109193557id_/'+ROOT+'/'
        html=fetch(url,timeout=27,maxbytes=1000000)
        soup=BeautifulSoup(html,'html.parser')
        for slug in find_article_urls(soup):
            found.setdefault(slug,(slug,'',''))
    except Exception as exc:print('INDEX_SNAPSHOT_ERROR',type(exc).__name__,flush=True)
    # CDX can return every historically captured permalink in a single bounded request.
    try:
        api='https://web.archive.org/cdx/search/cdx?'+urllib.parse.urlencode({
            'url':'filosofiasuldivano.altervista.org/*','output':'json',
            'fl':'timestamp,original','filter':'statuscode:200','collapse':'urlkey','limit':500})
        items=json.loads(fetch(api,timeout=18,maxbytes=550000))
        for row in items[1:]:
            if not isinstance(row,list) or len(row)<2:continue
            slug=slug_from_url(row[1])
            if slug:found.setdefault(slug,(slug,'',''))
    except Exception as exc:print('CDX_UNAVAILABLE',type(exc).__name__,flush=True)
    print('DISCOVERED_INITIAL',len(found),flush=True)
    return found
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');args=parser.parse_args()
    found=discover()
    queue=deque(found.values())
    seen=set()
    results=[]
    while queue and len(seen)<110:
        batch=[]
        while queue and len(batch)<5 and len(seen)+len(batch)<110:
            entry=queue.popleft()
            if entry[0] not in seen and entry[0] not in [b[0] for b in batch]:
                batch.append(entry)
        if not batch:continue
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
            bunch=list(pool.map(one,batch))
        for row in bunch:
            seen.add(row['slug'])
            for slug in row.pop('discovered',[]):
                if slug not in seen and slug not in found:
                    found[slug]=(slug,'','')
                    queue.append(found[slug])
            results.append(row)
        ready=sum(row['status']=='ready' for row in results)
        print('ARCHIVE_PROGRESS',json.dumps({'attempted':len(seen),'complete':ready,'pending':len(queue)}),flush=True)
    ready=[r for r in results if r['status']=='ready']
    if args.write and len(ready)<3:raise SystemExit('Meno di 3 articoli completi: importazione annullata')
    if args.write:
        for row in ready:
            path=Path(row['target'])
            if path.exists():continue
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_text(json.dumps(row['data'],indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    inventory={'total_candidates':len(found),'attempted':len(results),'complete':len(ready),
               'unprocessed':len(queue),'not_recovered':len(results)-len(ready),
               'items':[{k:v for k,v in row.items() if k!='data'} for row in results]}
    Path('data').mkdir(exist_ok=True)
    Path('data/filosofia-archive-inventory.json').write_text(json.dumps(inventory,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    for row in results:
        print('ARTICLE_RESULT',json.dumps({k:v for k,v in row.items() if k!='data'},ensure_ascii=False),flush=True)
    print('RECOVERY_SUMMARY',json.dumps({k:v for k,v in inventory.items() if k!='items'},ensure_ascii=False),flush=True)
if __name__=='__main__':main()
,'',markdown)
    markdown=re.sub(r'\n{3,}','\n\n',markdown).strip()
    if len(markdown)<110 or len(markdown)>80000:raise ValueError('lunghezza contenuto anomala: '+str(len(markdown)))
    if 'Questo contenuto è protetto' in markdown[:500]:raise ValueError('contenuto protetto')
    return title,markdown,observed_date,observed_author,discovered
def preview(slug):
    return str(Path('content/magazine/archivio-'+slug+'.json'))
def one(article):
    slug,guess_title,guess_date=article
    try:
        archive,raw=links(slug,guess_date)
        html=fetch(raw,timeout=29)
        heading,text,published,byline,more=extract(html)
        date=published or guess_date
        if not date:raise ValueError('data di pubblicazione originale non verificata')
        clean=re.sub(r'\s+',' ',re.sub(r'[#*<>_\[\]\x60]',' ',text)).strip()
        excerpt=clean[:230].rsplit(' ',1)[0].rstrip(' ,.;')+('…' if len(clean)>230 else '')
        original_url=ROOT+'/'+slug+'/'
        obj={'title':heading or guess_title,'date':date,'category':'Archivio Filosofia sul divano',
          'author':byline,'excerpt':excerpt,'cover':'/assets/agora_dialogo.webp',
          'coverAlt':'Immagine illustrativa della redazione Agorà APS, non originale dell’articolo',
          'published':True,'featured':False,'body':text,
          'archiveSource':'Filosofia sul divano','archiveOriginalUrl':original_url,'archiveUrl':archive,'sourceUrl':archive,'sourceTitle':'Filosofia sul divano (archivio storico)',
          'socialFacebook':False,'socialInstagram':False,'socialX':False,
          'socialFacebookText':'','socialInstagramText':'','socialXText':''}
        return {'slug':slug,'date':date,'author':byline,'status':'ready','originalTitle':heading,
                'length':len(text),'target':preview(slug),'data':obj,'discovered':more}
    except Exception as exc:
        return {'slug':slug,'status':'skipped','reason':type(exc).__name__+': '+str(exc)[:150]}
def discover():
    found={slug:(slug,title,date) for slug,title,date in ARTICLES}
    # Historical public homepage captured in January 2023 contains a long index of original posts.
    try:
        url='https://web.archive.org/web/20230109193557id_/'+ROOT+'/'
        html=fetch(url,timeout=27,maxbytes=1000000)
        soup=BeautifulSoup(html,'html.parser')
        for slug in find_article_urls(soup):
            found.setdefault(slug,(slug,'',''))
    except Exception as exc:print('INDEX_SNAPSHOT_ERROR',type(exc).__name__,flush=True)
    # CDX can return every historically captured permalink in a single bounded request.
    try:
        api='https://web.archive.org/cdx/search/cdx?'+urllib.parse.urlencode({
            'url':'filosofiasuldivano.altervista.org/*','output':'json',
            'fl':'timestamp,original','filter':'statuscode:200','collapse':'urlkey','limit':500})
        items=json.loads(fetch(api,timeout=18,maxbytes=550000))
        for row in items[1:]:
            if not isinstance(row,list) or len(row)<2:continue
            slug=slug_from_url(row[1])
            if slug:found.setdefault(slug,(slug,'',''))
    except Exception as exc:print('CDX_UNAVAILABLE',type(exc).__name__,flush=True)
    print('DISCOVERED_INITIAL',len(found),flush=True)
    return found
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');args=parser.parse_args()
    found=discover()
    queue=deque(found.values())
    seen=set()
    results=[]
    while queue and len(seen)<110:
        batch=[]
        while queue and len(batch)<5 and len(seen)+len(batch)<110:
            entry=queue.popleft()
            if entry[0] not in seen and entry[0] not in [b[0] for b in batch]:
                batch.append(entry)
        if not batch:continue
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
            bunch=list(pool.map(one,batch))
        for row in bunch:
            seen.add(row['slug'])
            for slug in row.pop('discovered',[]):
                if slug not in seen and slug not in found:
                    found[slug]=(slug,'','')
                    queue.append(found[slug])
            results.append(row)
        ready=sum(row['status']=='ready' for row in results)
        print('ARCHIVE_PROGRESS',json.dumps({'attempted':len(seen),'complete':ready,'pending':len(queue)}),flush=True)
    ready=[r for r in results if r['status']=='ready']
    if args.write and len(ready)<3:raise SystemExit('Meno di 3 articoli completi: importazione annullata')
    if args.write:
        for row in ready:
            path=Path(row['target'])
            if path.exists():continue
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_text(json.dumps(row['data'],indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    inventory={'total_candidates':len(found),'attempted':len(results),'complete':len(ready),
               'unprocessed':len(queue),'not_recovered':len(results)-len(ready),
               'items':[{k:v for k,v in row.items() if k!='data'} for row in results]}
    Path('data').mkdir(exist_ok=True)
    Path('data/filosofia-archive-inventory.json').write_text(json.dumps(inventory,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    for row in results:
        print('ARTICLE_RESULT',json.dumps({k:v for k,v in row.items() if k!='data'},ensure_ascii=False),flush=True)
    print('RECOVERY_SUMMARY',json.dumps({k:v for k,v in inventory.items() if k!='items'},ensure_ascii=False),flush=True)
if __name__=='__main__':main()
