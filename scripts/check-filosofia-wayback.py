#!/usr/bin/env python3
"""Scan only known public URLs for archived copies, without downloading full texts."""
import urllib.request, urllib.error, urllib.parse, json
HOSTS=["www.filosofiasuldivano.org","filosofiasuldivano.org","filosofiasuldivano.altervista.org"]
SLUGS=["","articoli/","il-reale-colpevole/","ll-ruolo-degli-intellettuali-nella-societa-odierna/","il-disconoscimento-del-mondo-attraverso-i-desideri-nascosti/","la-filosofia-kantiana-cose/"]
for host in HOSTS:
 for slug in SLUGS:
  url="https://"+host+"/"+slug
  u="https://archive.org/wayback/available?"+urllib.parse.urlencode({"url":url,"timestamp":"20230101"})
  try:
   req=urllib.request.Request(u,headers={"User-Agent":"AgoraArchiveRecovery/1.0"})
   with urllib.request.urlopen(req,timeout=7) as resp:
    content=json.loads(resp.read(30000))
   snapshots=content.get("archived_snapshots") or {}
   near=snapshots.get("closest") or {}
   print(json.dumps({"host":host,"slug":slug,"available":bool(near),"snapshot_status":near.get("status"),"timestamp":near.get("timestamp"),"archive_url":near.get("url")},ensure_ascii=False),flush=True)
  except Exception as e:
   print(json.dumps({"host":host,"slug":slug,"error":type(e).__name__}),flush=True)
