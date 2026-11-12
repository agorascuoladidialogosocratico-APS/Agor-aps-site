#!/usr/bin/env python3
"""Restore editorial articles from archived Altervista WordPress."""
import argparse,concurrent.futures,json,re,urllib.request,urllib.parse,time
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
('il-legge-per-chi-legge-tra-anomia-e-disinformazione','La legge per chi legge, tra anomia e disinformazione','2023-03-29')]
HEADERS={'User-Agent':'Mozilla/5.0 (compatible; AgoraAPS-EditorialArchivalRecovery/1.0)','Accept':'text/html,application/json'}
def fetch(url,timeout=24,maxbytes=2_000_000):
    req=urllib.request.Request(url,headers=HEADERS)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req,timeout=timeout) as res:
                if res.status!=200: raise ValueError('HTTP '+str(res.status))
                return res.read(maxbytes)
        except (urllib.error.URLError,TimeoutError) as exc:
            if attempt>=2:raise
            time.sleep(2*(attempt+1))
def links(slug,date):
    src=ROOT+'/'+slug+'/'
    u='https://archive.org/wayback/available?'+urllib.parse.urlencode({'url':src,'timestamp':date.replace('-','')+'120000'})
    a=json.loads(fetch(u,timeout=16,maxbytes=40000))
    close=(a.get('archived_snapshots') or {}).get('closest') or {}
    if close.get('status')!='200' or not close.get('timestamp'):raise ValueError('snapshot assente')
    stamp=close['timestamp']
    return ('https://web.archive.org/web/'+stamp+'/'+src,'https://web.archive.org/web/'+stamp+'id_/'+src)
def extract(raw):
    soup=BeautifulSoup(raw,'html.parser')
    head=soup.select_one('article h1.entry-title, .entry-header h1, h1.entry-title, article h1')
    title=head.get_text(' ',strip=True) if head else ''
    if AUTHOR.lower() not in soup.get_text(' ',strip=True)[:16000].lower():raise ValueError('autore non verificato')
    css='script,style,noscript,iframe,form,button,.sharedaddy,.sd-sharing-enabled,.jp-relatedposts,.wp-block-jetpack-likes,.post-navigation,.yarpp-related,.related-posts,.comments-area,.pum-container,.entry-footer,.post-tags,.share-buttons'
    for node in soup.select(css):node.decompose()
    body=None
    for selector in ['article .entry-content','article .post-content','main .entry-content','.single-post .entry-content','.entry-content','article .content']:
        for candidate in soup.select(selector):
            if len(candidate.get_text(' ',strip=True))>150:
                body=candidate;break
        if body:break
    if body is None:raise ValueError('area testuale WordPress assente')
    for elem in body.select('img,picture,video,audio,iframe,script,style,noscript,form,input,button,svg'):
        elem.decompose()
    for a in body.select('a[href]'):
        href=a.get('href','')
        if any(q in href for q in ('facebook.com/sharer','twitter.com/intent','pinterest.com/pin/create','linkedin.com/shareArticle','addtoany.com/add_to')):a.decompose()
        elif not href.startswith(('https://','http://','/')):a.unwrap()
    markdown=md(str(body),heading_style='ATX',bullets='-',strip=['img']).strip()
    markdown=re.sub(r'\n{3,}','\n\n',markdown)
    markdown=re.sub(r'(?im)^\s*(Vuoi abilitare le notifiche\?|Attiva|Notifiche push abilitate|Condividi sui social|Stampa)\s*$','',markdown).strip()
    if len(markdown)<160 or len(markdown)>54000:raise ValueError('lunghezza contenuto anomala: '+str(len(markdown)))
    if 'Questo contenuto è protetto' in markdown[:500]:raise ValueError('contenuto protetto')
    return title,markdown
def preview(slug):
    return str(Path('content/magazine/archivio-'+slug+'.json'))
def one(article):
    slug,title,date=article
    try:
        archive,raw=links(slug,date)
        html=fetch(raw,timeout=29)
        heading,text=extract(html)
        clean=re.sub(r'\s+',' ',re.sub(r'[#*<>_\[\]\x60]',' ',text)).strip()
        excerpt=clean[:230].rsplit(' ',1)[0].rstrip(' ,.;')+('…' if len(clean)>230 else '')
        body=text+'\n\n---\n\n*Articolo storico di '+AUTHOR+', originariamente pubblicato su «Filosofia sul divano» il '+date[8:10]+'/'+date[5:7]+'/'+date[:4]+'. [Copia originale nella Wayback Machine]('+archive+').*'
        obj={'title':heading or title,'date':date,'category':'Archivio Filosofia sul divano','author':AUTHOR,'excerpt':excerpt,'cover':'/assets/agora_dialogo.webp','coverAlt':'Immagine editoriale Agorà APS dedicata al dialogo filosofico','published':True,'featured':False,'body':body,'sourceUrl':archive,'sourceTitle':'Filosofia sul divano (archivio storico)','socialFacebook':False,'socialInstagram':False,'socialX':False,'socialFacebookText':'','socialInstagramText':'','socialXText':''}
        return {'slug':slug,'date':date,'status':'ready','originalTitle':heading,'length':len(text),'target':preview(slug),'data':obj}
    except Exception as exc:
        return {'slug':slug,'status':'skipped','reason':type(exc).__name__+': '+str(exc)[:150]}
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');args=parser.parse_args()
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as p:
        results=list(p.map(one,ARTICLES))
    ready=[r for r in results if r['status']=='ready']
    for result in results:print(json.dumps({k:v for k,v in result.items() if k!='data'},ensure_ascii=False),flush=True)
    if args.write:
        if len(ready)<8:raise SystemExit('Meno di 8 articoli completi: annullato per evitare pubblicazioni parziali')
        for row in ready:
            path=Path(row['target'])
            if path.exists():print('SKIP existing',path);continue
            path.parent.mkdir(parents=True,exist_ok=True)
            path.write_text(json.dumps(row['data'],indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps({'ready':len(ready),'skipped':len(results)-len(ready),'mode':'write' if args.write else 'preview'},ensure_ascii=False),flush=True)
if __name__=='__main__':main()
