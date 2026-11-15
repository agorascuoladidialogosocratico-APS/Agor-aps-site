# Osservatorio Chirurgia vascolare Sicilia
Pagina pubblicabile nella cartella `/osservatorio-vascolare/` del sito statico esistente. Non sostituisce nessuna pagina Agorà.
Il workflow `.github/workflows/monitor-vascolare-sicilia.yml` esegue ogni giorno alle 06:30 UTC lo script `scripts/monitor_vascolare_update.py`, aggiorna `live.json` e `feed.xml` e li conserva su GitHub.
La pagina legge `registry.json` e `live.json` all'apertura e ogni 15 minuti. L'archivio `registry.json` è una ricognizione editoriale iniziale al 15/11/2026, da revisionare periodicamente; i nuovi RSS sono indicati come segnalazioni non verificate. Non garantisce copertura completa degli albi aziendali.
La pubblicazione effettiva sul dominio Cloudflare dipende dal collegamento di deploy dell'hosting con il repository; il workflow non contiene chiavi Cloudflare.
