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

## Cloudflare Pages

Il sito non richiede una build: framework `None`, comando build vuoto, directory output `.`, branch production `main`. Il contenuto JSON viene caricato dal browser; l'HTML include testo di riserva per motori di ricerca e browser senza JavaScript.

**Il branch `feature/agora-studio-cms` è una proposta da verificare prima di unirlo a main.** Finché il PR non è approvato, il sito pubblico non viene sostituito.

Per istruzioni dettagliate consulta [EDITOR-GUIDA.md](EDITOR-GUIDA.md).

## Sicurezza e privacy

Nessun token GitHub o segreto è presente nel codice. Solo i collaboratori autorizzati sul repository possono modificare i contenuti tramite Pages CMS. Le fotografie pubblicate su un repository pubblico sono accessibili senza autenticazione: verificare i consensi prima di aggiungere nuove fotografie. Conservare i DNS email esistenti su Namecheap durante il passaggio a Cloudflare.
