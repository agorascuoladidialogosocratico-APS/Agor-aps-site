#!/usr/bin/env python3
"""Read-only diagnosis of public WordPress history saved by Wayback."""
import json, re, urllib.request, urllib.parse, urllib.error
from collections import Counter
from bs4 import BeautifulSoup
BASE='https://filosofiasuldivano.altervista.org'
ARCH='https://web.archive.org/web/'
def fetch(ts,path):
    u=ARCH+ts+'id_/'+BASE+'/'+path.lstrip('/')
    req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (compatible; AgoraAPSArchivalRecovery/1.0)','Accept':'text/html,application/xhtml+xml'})
    with urllib.request.urlopen(req,timeout=26) as r:
        return r.read(1800000).decode('utf-8','replace')
def inspect(ts,path):
    try:
        html=fetch(ts,path)
        soup=BeautifulSoup(html,'html.parser')
        print('PAGE',json.dumps({'path':path,'htmlBytes':len(html),'title':soup.title.get_text(" ",strip=True) if soup.title else None},ensure_ascii=False),flush=True)
        for selector in ['article','.entry-content','.post-content','.wp-block-post-content','.content-area','.site-main','.entry-header','.entry-title','.post-title','.author','.posted-on','time','.pagination','.nav-links']:
            blocks=soup.select(selector)
            if blocks:
                sample=[]
                for b in blocks[:4]:
                    sample.append({'tag':b.name,'class':b.get('class'),'text':b.get_text(' ',strip=True)[:190],'links':[a.get('href') for a in b.select('a[href]')[:2]]})
                print('SELECTOR',json.dumps({'selector':selector,'count':len(blocks),'sample':sample},ensure_ascii=False),flush=True)
        for s in soup.select('script[type="application/ld+json"]')[:3]:
            try:
                obj=json.loads(s.get_text());print('SCHEMA',json.dumps({'keys':list(obj)[:12],'headline':obj.get('headline'),'author':obj.get('author'),'datePublished':obj.get('datePublished')},ensure_ascii=False),flush=True)
            except Exception: pass
        links=[]
        for a in soup.select('article a[href],.entry-title a[href],.post-title a[href],main h2 a[href]'):
            url=a.get('href')
            if url and 'filosofiasuldivano' in url and not ('/tag/' in url or '/author/' in url):
                links.append((a.get_text(' ',strip=True)[:110],url[:230]))
        print('POST_LINKS',json.dumps({'path':path,'count':len(links),'values':links[:50]},ensure_ascii=False),flush=True)
    except Exception as e:
        print('ERR',json.dumps({'path':path,'error':type(e).__name__,'message':str(e)[:200]},ensure_ascii=False),flush=True)
for ts,path in [('20221010221055','articoli/'),('20230109193557',''),('20210801213842','il-reale-colpevole/'),('20221115164935','la-filosofia-kantiana-cose/')]:
    inspect(ts,path)
