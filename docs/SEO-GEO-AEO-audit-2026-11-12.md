# Ricognizione SEO, AEO e visibilità AI — Agorà APS

**Data:** 12 novembre 2026. **Sito:** https://agora-scuoladidialogosocraticoecittadinanzattiva.site/

## Evidenze iniziali

- OpenSEO audit ID `8f7f2256-3f01-4251-9e9e-9a4d41e8551b`: 25 pagine esaminate, HTTP 200 e indicizzabili dal crawler; limite di scansione raggiunto (1 URL non esaminata).
- Prima dell'intervento: 3 pagine con poco testo (SODA-LABS 123 parole, Odisseo Philosophorum 136, Volontariato ESC 145); 10 meta-descrizioni storiche oltre i 160 caratteri; 7 titoli lunghi.
- OpenSEO project: `344bb66e-efa8-4569-9d79-f62532a9a6af`; non risulta connessa alcuna proprietà Google Search Console. Non esiste ancora un tracking osservazionale AI di Agorà in OpenSEO. Non si devono attribuire risultati, posizioni o citazioni AI non misurati.
- Il dominio era raggiungibile dal crawler OpenSEO, ma non è stato possibile interrogare direttamente il sito tramite il client web di ChatGPT. Verificare il deploy Cloudflare dopo la rigenerazione.

## Interventi implementati nel codice

1. **Identità dell'ente:** dati strutturati `NGO` e `WebSite` con identificatore coerente, logo, email, descrizione verificabile. Nessun accreditamento non confermato.
2. **Architettura:** guida completa e navigabile al dialogo socratico (`/dialogo-socratico/`), pagine SODA-LABS, DiscoverEU e ESC integrate con spiegazioni, domande e limiti delle affermazioni; collegamenti contestuali.
3. **Magazine:** 23 descrizioni SEO specifiche, titolo SEO separato dal titolo storico, argomenti editoriali, italiano/inglese impostato correttamente, link tematici ai contenuti connessi.
4. **Metadati tecnici:** canonical assoluti, descrizioni sintetiche, anteprime Open Graph/Twitter, `meta robots` con anteprime immagini; dati `BlogPosting` per singolo articolo, `datePublished` originaria e `dateModified` dell'ultima revisione, `Person` per gli autori, `BreadcrumbList` per le sezioni.
5. **Provenienza e affidabilità:** `isBasedOn` verso Wayback Machine nei 23 contenuti recuperati; pagina `/magazine/criteri-editoriali/` su firme, revisione, immagini, licenze e segnalazioni di errori.
6. **Scansione:** sitemap XML con namespace immagini e `lastmod` aggiornato dove pertinente, `robots.txt` che conserva `Allow: /` ma esclude API/editor, corretta intestazione MIME per sitemap, RSS e robots.
7. **Qualità automatica:** test `scripts/verify-seo.mjs` per date, autori, copertine distinte, tag e sitemap, integrato nel workflow CMS.

## Attività esterne ancora necessarie

- Collegare il dominio e l'account Google al progetto OpenSEO e verificare Google Search Console. Inviare la sitemap con URL completo; controllare indicizzazione reale e ispezione URL su homepage, Magazine, nuova guida e singoli articoli. Search Console misura clic e impressioni, non garantisce la visibilità AI.
- Configurare Bing Webmaster Tools / IndexNow dopo il deploy verificato. Una notifica IndexNow accelera *la scoperta* su motori partecipanti; non è una promessa di indicizzazione.
- Ripetere audit OpenSEO dopo la pubblicazione sul dominio (almeno 50 pagine), monitorare title, snippet, link rotti, pagine poco utili, performance e accessibilità.
- Per la presenza in ChatGPT, Gemini, Google AI Mode e Perplexity: costruire un set di prompt neutrali in italiano e avviare un tracker **solo dopo stima dei crediti e approvazione di eventuali costi**. Nessun punteggio inventato.
- Continuare la produzione di materiali realmente originali e documentabili: schede progettuali con risultati e date verificati, guide operative, materiali metodologici, relazioni e risorse accessibili. Cercare citazioni e collegamenti pertinenti da partner effettivi e istituzioni, senza acquistare backlink o fabbricare menzioni.

## Fonti guida

- Google Search Central: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- Google Search Central: [Optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- Google Search Central: [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Schema.org](https://schema.org/)
- [IndexNow documentation](https://www.indexnow.org/documentation)
- [Google Search Console](https://search.google.com/search-console)

Le ottimizzazioni migliorano interpretabilità, coerenza e idoneità alla scoperta, **non garantiscono** posizioni, indicizzazione o citazioni da motori e modelli.
