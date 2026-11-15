#!/usr/bin/env python3
"""Aggiorna le segnalazioni RSS; non certifica l'apertura di bandi."""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta, timezone
from email.utils import format_datetime, parsedate_to_datetime
from hashlib import sha256
from html import unescape
from pathlib import Path
from zoneinfo import ZoneInfo
from xml.sax.saxutils import escape
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

BASE = Path(__file__).resolve().parents[1] / "osservatorio-vascolare"
ROME = ZoneInfo("Europe/Rome")
TERMS = [
  '"chirurgia vascolare" (concorso OR mobilità OR incarico OR assunzione) (Sicilia OR Palermo OR Catania OR Messina)',
  '"chirurgia vascolare" (bando OR concorso OR selezione) (Agrigento OR Caltanissetta OR Enna OR Ragusa OR Siracusa OR Trapani)',
  '"chirurgia vascolare" (fabbisogno OR graduatoria OR stabilizzazione) Sicilia',
  '"chirurgo vascolare" (ricerca OR lavoro OR selezione) Sicilia',
  'site:inpa.gov.it "chirurgia vascolare" Sicilia',
  '"chirurgia vascolare" (Garibaldi OR Cannizzaro OR Papardo OR Sant’Elia OR Rodolico OR Giglio)'
]
FEEDS = [("Gazzetta Ufficiale – Concorsi", "https://www.gazzettaufficiale.it/rss/S4")]
for n, term in enumerate(TERMS, 1):
    FEEDS.append((f"Ricerca RSS {n}", "https://news.google.com/rss/search?q=" + urllib.parse.quote(term) + "&hl=it&gl=IT&ceid=IT:it"))
AREA = re.compile(r"sicili|catan|palerm|messin|siracus|ragu|caltan|agrigent|trapan|marsal|patti|cefal|enna|ospedal|policlinic|asp|arnas|papardo|cannizzaro|garibaldi|giglio|morgagni|scalabrino", re.I)
VASC = re.compile(r"vascolar", re.I)
TOPIC = re.compile(r"concors|band|avvis|incaric|assunz|selezion|reclut|graduator|stabilizz|mobilit|fabbisogn|chirurg", re.I)

def fetch(source):
    label, url = source
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0 (compatible; SicilianVascularMonitor/1.0)", "Accept":"application/rss+xml, application/atom+xml, application/xml, text/xml"})
    with urllib.request.urlopen(req, timeout=20) as res:
        content = res.read(3_000_000)
    result=[]
    root=ET.fromstring(content)
    for item in root.findall(".//item"):
        def field(name):
            node=item.find(name)
            return unescape("".join(node.itertext()).strip()) if node is not None else ""
        title=re.sub(r"<[^>]+>", "", field("title")).strip()
        link=field("link").strip()
        desc=re.sub(r"<[^>]+>", " ", field("description"))
        body=title+" "+desc
        if not title or not link.startswith(("https://","http://")):
            continue
        if not (AREA.search(body) and VASC.search(body) and TOPIC.search(body)):
            continue
        published=""
        try:
            published=parsedate_to_datetime(field("pubDate")).astimezone(ROME).date().isoformat()
        except (ValueError,TypeError,OverflowError):
            pass
        result.append({"id":sha256(link.encode()).hexdigest()[:16], "title":title[:260], "url":link[:1500], "source":label, "date":published, "verified":False})
    return result

def safe_date(date, fallback):
    try:
        return datetime.fromisoformat(str(date)).date().isoformat()
    except (TypeError, ValueError):
        return fallback

def main():
    now=datetime.now(ROME)
    checked=now.isoformat(timespec="seconds")
    today=now.date().isoformat()
    try:
        old=json.loads((BASE/"live.json").read_text(encoding="utf-8")).get("alerts",[])
    except (OSError, ValueError):
        old=[]
    kept={}
    threshold=(now.date()-timedelta(days=100)).isoformat()
    for entry in old:
        if not isinstance(entry,dict) or not entry.get("url"):
            continue
        if entry.get("last_seen",entry.get("first_seen",today))>=threshold:
            entry["new"]=False
            kept[entry.get("id") or sha256(entry["url"].encode()).hexdigest()[:16]]=entry
    errors=[]
    received=0
    with ThreadPoolExecutor(max_workers=5) as pool:
        requests={pool.submit(fetch,feed):feed[0] for feed in FEEDS}
        for future in as_completed(requests):
            try:
                alerts=future.result()
                received+=1
                for a in alerts:
                    first=kept.get(a["id"],{}).get("first_seen",checked)
                    a.update({"first_seen":first, "last_seen":checked, "new":a["id"] not in kept})
                    kept[a["id"]]=a
            except Exception as exc:
                errors.append(requests[future]+": "+str(exc)[:200])
    alerts=sorted(kept.values(),key=lambda a:(a.get("last_seen",""),a.get("date","")),reverse=True)[:120]
    registry=json.loads((BASE/"registry.json").read_text(encoding="utf-8"))
    status="partial" if errors else "checked"
    payload={"generated_at":checked,"status":status,"scope":"Segnalazioni RSS automatiche da verificare; non dimostrano bandi aperti","sources_checked":received,"sources_total":len(FEEDS),"alerts":alerts,"new_items":sum(bool(a.get("new")) for a in alerts),"errors":errors,"registry_snapshot":registry["as_of"],"official_gazzetta_rss":FEEDS[0][1]}
    (BASE/"live.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    lines=['<?xml version="1.0" encoding="UTF-8"?>','<rss version="2.0"><channel>','<title>Chirurgia vascolare Sicilia — avvisi e segnalazioni</title>','<description>Registro curato e segnalazioni RSS automatiche da verificare</description>','<link>https://www.inpa.gov.it/bandi-e-avvisi/</link>','<language>it-IT</language>',f'<lastBuildDate>{format_datetime(now)}</lastBuildDate>']
    for opp in registry.get("opportunities",[]):
        title=f"[Registro {opp.get('status','da verificare')}] {opp.get('title','')} — {opp.get('employer','')}"
        url=opp.get("url","")
        if not url.startswith(("http://","https://")):continue
        desc=f"Ricognizione {registry['as_of']}. Scadenza: {opp.get('deadline') or 'da verificare'}. Verificare fonte ufficiale."
        lines.append("<item><title>"+escape(title)+"</title><link>"+escape(url)+"</link><guid isPermaLink=\"false\">registry-"+escape(str(opp.get("id","")))+"</guid><description>"+escape(desc)+"</description></item>")
    for a in alerts:
        lines.append("<item><title>"+escape("[Segnalazione da verificare] "+a["title"])+"</title><link>"+escape(a["url"])+"</link><guid isPermaLink=\"false\">signal-"+escape(a["id"])+"</guid><description>Segnalazione RSS, non un bando aperto confermato.</description></item>")
    lines.extend(["</channel></rss>",""])
    rss="\n".join(lines)
    ET.fromstring(rss)
    (BASE/"feed.xml").write_text(rss,encoding="utf-8")
    print(f"Raccolta completata: {len(alerts)} segnalazioni, {received}/{len(FEEDS)} fonti, {len(errors)} errori.")

if __name__=="__main__":
    main()
