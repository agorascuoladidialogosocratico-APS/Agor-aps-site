#!/usr/bin/env python3
"""Check public restoration sources without importing or modifying data."""
import json
import urllib.request
import urllib.error
from urllib.parse import urlencode

BASES = ["https://www.filosofiasuldivano.org", "https://filosofiasuldivano.altervista.org"]
CHECKS = [
    ("/wp-json/wp/v2/posts?" + urlencode({"per_page": 100, "after": "2021-01-01T00:00:00", "before": "2024-01-01T00:00:00", "_fields": "id,date,slug,title,author,status"}), "wp_posts"),
    ("/?rest_route=%2Fwp%2Fv2%2Fposts&per_page=5", "wp_query"),
    ("/feed/", "rss"),
    ("/articoli/", "archive"),
]
def fetch(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent":"AgoràAPS-ArchiveRecovery/1.0 (+editorial nonprofit archival request)", "Accept":"application/json, application/rss+xml, text/html; q=0.8"})
        with urllib.request.urlopen(req, timeout=16) as resp:
            body=resp.read(1024*1024)
            return resp.status, resp.headers.get("Content-Type",""), body
    except urllib.error.HTTPError as err:
        return err.code, "", b""
    except Exception as err:
        return "ERROR:"+type(err).__name__, "", b""

def main():
    for base in BASES:
        for path,kind in CHECKS:
            url=base+path
            status,content_type,data=fetch(url)
            out={"host":base,"kind":kind,"status":status,"bytes":len(data),"content_type":content_type[:80]}
            if kind.startswith("wp") and data:
                try:
                    decoded=json.loads(data)
                    if isinstance(decoded,list):
                        out["post_count"]=len(decoded)
                        out["sample"]=[{"slug":p.get("slug"),"date":p.get("date"),"author":p.get("author")} for p in decoded[:8]]
                    else:out["json_shape"]=list(decoded)[:5] if isinstance(decoded,dict) else str(type(decoded))
                except ValueError: out["json"]="invalid or HTML challenge"
            print(json.dumps(out,ensure_ascii=False),flush=True)
    urls=[
      "https://archive.org/wayback/available?url=www.filosofiasuldivano.org",
      "https://web.archive.org/cdx/search/cdx?url=www.filosofiasuldivano.org%2F*&output=json&filter=statuscode%3A200&collapse=urlkey&pageSize=3"
    ]
    for url in urls:
        status,ct,data=fetch(url)
        print(json.dumps({"wayback":url.split("/")[2],"status":status,"type":ct[:60],"bytes":len(data),"response":data[:400].decode("utf-8","replace") if ct.startswith("application/json") else ""}),flush=True)

if __name__ == "__main__":
    main()
