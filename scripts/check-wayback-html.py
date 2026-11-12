#!/usr/bin/env python3
"""Best effort check of archived public article HTML; no writes or personal content."""
import urllib.request, urllib.error, ssl, json, time
ROOT="https://filosofiasuldivano.altervista.org"
SAMPLES=[
 ("20210801213842", "il-reale-colpevole/"),
 ("20221115164935", "la-filosofia-kantiana-cose/"),
]
for stamp,slug in SAMPLES:
 for marker in ("id_",""):
  u="https://web.archive.org/web/"+stamp+marker+"/"+ROOT+"/"+slug
  try:
   req=urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0 (compatible; HistoricalPreservationResearch/1.0)", "Accept":"text/html,application/xhtml+xml"})
   with urllib.request.urlopen(req,timeout=17) as res:
    content=res.read(1500000)
    text=content.decode("utf-8","replace")
    print(json.dumps({"slug":slug,"marker":marker,"http":res.status,"bytes":len(content),"containsTitle":("Il reale, colpevole" in text or "kantiana" in text.lower()),"contentType":res.headers.get("Content-Type",""),"sample":text[:95]}),flush=True)
  except Exception as e:
   print(json.dumps({"slug":slug,"marker":marker,"error":type(e).__name__,"detail":str(e)[:140]}),flush=True)
