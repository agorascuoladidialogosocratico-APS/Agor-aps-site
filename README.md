# Agorà APS — sito istituzionale ed editor

Sito statico responsive di Agorà – Scuola di Dialogo Socratico e Cittadinanza Attiva APS, con fotografie originali e logo ufficiale.

## Editor senza codice

L'editor dei contenuti è **Pages CMS**: https://app.pagescms.org/.

1. Entra con GitHub.
2. Installa/autorizza l'app Pages CMS soltanto per il repository `agorascuoladidialogosocratico-APS/Agor-aps-site`.
3. Apri il repository; l'editor legge `.pages.yml`.
4. Modifica gli argomenti in `content/*.json`, aggiungi foto da `assets/` e salva.

La pagina pubblica `/editor/` offre un accesso guidato e un'anteprima. L'autenticazione e il salvataggio avvengono **su Pages CMS**, non tramite una password dentro il sito.

L'editor consente di modificare: homepage, progetti, metodo, chi siamo, trasparenza, contatti, logo, colori, nuove sezioni e ordine/visibilità. Il layout avanzato e gli stili CSS restano modifiche per sviluppatori.

## Hosting Cloudflare: Workers Static Assets

Il progetto Cloudflare collegato è un **Worker con Builds**, e non un classico progetto Pages: per questo è incluso `wrangler.jsonc` con `name: agor-aps-site`, `assets.directory: ./` e pagina di errore 404. La nuova configurazione consente a Wrangler di pubblicare HTML, CSS, JavaScript, fotografie e contenuti JSON senza un framework. `package.json` offre uno script `build` senza compilazione, per le configurazioni Cloudflare che lo richiedono. `.assetsignore` impedisce il caricamento di file tecnici riservati al repository.

Nel pannello del Worker, controllare **Settings → Builds**: repository `Agor-aps-site`, production branch `main`, root directory `/`; comando build vuoto oppure `npm run build`, deploy `npx wrangler deploy`, preview `npx wrangler preview`. La prima pubblicazione si prova sull'URL fornito da Cloudflare (`workers.dev` o URL Preview). **Non spostare il dominio Namecheap finché la preview non è approvata.**

I JSON sono letti dal browser; la pagina contiene già i testi fondamentali come fallback senza JavaScript.

**Il branch `feature/agora-studio-cms` contiene la proposta editoriale. Per pubblicarla sul dominio configurato, unire la PR a `main` solo dopo aver verificato il deploy di anteprima e i controlli automatici.** Finché il PR non è approvato, il sito pubblico non viene sostituito.

Il comando `npm run build` esegue anche verifiche su file JSON, immagini, collegamenti interni e configurazione degli header Cloudflare. Il file `_headers` resta incluso come regola di risposta di Workers Static Assets (non è servito pubblicamente come documento).

Per istruzioni dettagliate consulta [EDITOR-GUIDA.md](EDITOR-GUIDA.md).

## Sicurezza e privacy

Nessun token GitHub o segreto è presente nel codice. Solo i collaboratori autorizzati sul repository possono modificare i contenuti tramite Pages CMS. Le fotografie pubblicate su un repository pubblico sono accessibili senza autenticazione: verificare i consensi prima di aggiungere nuove fotografie. Conservare i DNS email esistenti su Namecheap durante il passaggio a Cloudflare.
