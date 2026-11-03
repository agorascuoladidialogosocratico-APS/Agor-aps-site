# Agorà APS — sito web statico 2026

Versione di lavoro per GitHub + Cloudflare Pages. Il progetto non include un backend, database o moduli che raccolgono dati personali.

## Contenuto

- `index.html`: sito completo a pagina singola con navigazione per sezioni.
- `assets/`: logo ufficiale Agorà e fotografie inviate per il sito (WebP ottimizzati).
- `_headers`: intestazioni HTTP per Cloudflare Pages.
- `404.html`, `robots.txt`, `sitemap.xml`: file di servizio.

## Distribuzione consigliata: GitHub → Cloudflare Pages

1. Crea un repository GitHub (privato fino alla verifica di autorizzazioni e contenuti), ad esempio `agora-aps-sito`.
2. Carica **il contenuto** di questo pacchetto nella radice del repository, non la cartella ZIP.
3. Cloudflare → Workers & Pages → Create application → Pages → Connect to Git → seleziona repository.
4. Configura: framework `None`, production branch `main`, build command **vuoto**, build output directory **`.`** (radice).
5. Verifica il sito sul dominio provvisorio `*.pages.dev`, anche da smartphone.
6. Solo dopo l'approvazione, associa il dominio personalizzato tramite Pages → Custom domains.
7. Prima di modificare il DNS presso Namecheap, preserva eventuali record preesistenti (MX, SPF, DKIM, DMARC, verifiche). Per un dominio root/apex Cloudflare richiede la gestione della zona DNS sui nameserver Cloudflare.

> Attenzione: non creare un progetto **Direct Upload** se vuoi la sincronizzazione automatica con GitHub. Le modalità non sono convertibili sullo stesso progetto Pages.

Dominio previsto: `agora-scuoladidialogosocraticoecittadinanzattiva.site`.

## Controlli editoriali indispensabili prima di andare online

- Verificare i permessi di pubblicazione delle fotografie, con attenzione ai minorenni.
- Approvare contenuti, dati associativi, stato dei progetti, recapiti e informazioni di trasparenza.
- Predisporre una informativa privacy adeguata all'effettivo trattamento dati e ai servizi inseriti in futuro.
- Verificare che HTTPS, mobile navigation, contatti e collegamenti funzionino nel deployment effettivo.

Il sito attuale deve rimanere online fino al collaudo e al passaggio del dominio.