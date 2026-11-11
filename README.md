# Agorà APS — sito istituzionale e libro digitale

Sito dell'associazione Agorà – Scuola di Dialogo Socratico e Cittadinanza Attiva APS.

## Architettura e navigazione
La homepage conserva il **libro digitale interattivo**. Sono disponibili anche pagine HTML **statiche e indicizzabili** per Chi siamo, Progetti (e schede SODA-LABS / Odisseo Philosophorum), Tirocini, Volontariato ESC, Partecipa, Contatti, Trasparenza, Privacy e Accessibilità.

Le pagine sono incluse in `sitemap.xml` e i link sono HTML normali, fruibili anche senza JavaScript. Il progetto mantiene un solo URL canonico per ogni pagina.

## Pubblicazione e hosting
Hosting: **Cloudflare Workers Static Assets** con `wrangler.jsonc` (non Cloudflare Pages classico).

Comandi:
- `npm install`
- `npm run build` — genera le pagine dalla configurazione editoriale JSON e valida il sito.
- `npm run check` — verifica l'integrità dei file e dei collegamenti locali.
- `npm run deploy` — esegue la build e poi il deploy Wrangler.

**Requisito per modifiche effettuate tramite Pages CMS:** nel Worker, impostare il comando di build `npm run build`, in modo che i contenuti aggiornati in `content/*.json` siano riflessi nelle pagine HTML statiche. Se il pannello Build non lancia questo comando, il JSON della homepage si aggiornerà al caricamento ma le pagine autonome manterranno la copia generata nell'ultimo commit. Verificare la configurazione nel pannello Cloudflare prima della pubblicazione.

Root directory `/`, branch di produzione `main`; deploy `npx wrangler deploy`. La connessione GitHub e l'aggancio del dominio devono essere verificati separatamente nel pannello Cloudflare.

## Editor del sito
Pages CMS: https://app.pagescms.org/

1. Accedi usando GitHub autorizzato al repository `agorascuoladidialogosocratico-APS/Agor-aps-site`.
2. Modifica i dati in `content/*.json` tramite la configurazione `.pages.yml`.
3. Salva: GitHub registra i nuovi contenuti; la build Cloudflare li pubblica **se il deploy automatico è attivo e `npm run build` viene eseguito**.

La copertina è una scena SVG: non è un campo fotografico nel CMS. L'editor delle altre immagini e delle sezioni continua a essere disponibile dove il layout corrisponde alle voci.
La pagina `/editor/` è solo una guida; le credenziali e i permessi sono gestiti da GitHub e Pages CMS, mai dal sito stesso.

## Trasparenza, dati e accessibilità
Gli atti depositati sono consultabili nel **RUNTS**:
https://servizi.lavoro.gov.it/runts/it-it/Ricerca-enti/Ente

Il sito non mantiene un duplicato pubblicitario degli atti depositati. Le informazioni sui progetti devono essere distinte per stato documentale; non pubblicare dati personali di candidati senza adeguata base giuridica e verifica.

`/accessibilita/` offre indicazioni per navigazione da tastiera, ingrandimento testo, contrasto elevato e segnalazione dei problemi. Sono presenti focus visibile, skip link e supporto al movimento ridotto. **Questi strumenti non costituiscono certificazione di conformità WCAG**: sono necessari test con lettori di schermo, tastiera e strumenti automatici e manuali.

L'informativa privacy e i singoli moduli di candidatura devono essere validati dall'associazione per finalità, basi giuridiche, tempi di conservazione e soggetti coinvolti.

## Verifiche prima e dopo il rilascio
- Eseguire `npm run build` e verificare i controlli GitHub Actions.
- Provare menu, capitoli, footer e pagine HTML su desktop e mobile.
- Controllare HTTPS, codici 404, redirect e risposta di `/sitemap.xml` in produzione.
- Verificare Search Console con Ispezione URL e inviare la sitemap dopo il deploy.
- Misurare Core Web Vitals e testare contrasto, focus, ingrandimento e lettori di schermo.

I segreti, i token, le password e i dati dei candidati non devono mai essere salvati in questo repository pubblico.

## Direttivo e collegamento RUNTS
La homepage e /chi-siamo/ mostrano gli incarichi indicati negli allegati associativi per le convenzioni universitarie del giugno 2026. Questi dati **non sono una trascrizione certificata della visura RUNTS**. Prima di segnare come confermato il direttivo, aprire <https://servizi.lavoro.gov.it/runts/it-it/Ricerca-enti>, cercare il **codice fiscale 93254890879**, cliccare Dettaglio ed esaminare i dati attuali di amministrazione. Qualora diversi, aggiornare `content/governance.json` tramite Pages CMS e rieseguire la build. La versione iniziale dell'atto costitutivo (2024) e la scheda per atenei (2026) non sono documenti equivalenti nel tempo.

## Modulo di contatto e consegna email
La pagina `/contatti/#scrivici` ora contiene un modulo nativo accessibile, progressivamente migliorato con JavaScript. L'endpoint del Worker è `POST /api/contact`. Il backend convalida campi, origine e consenso, e inoltra una email all'indirizzo associativo. **Non memorizza il contenuto dei messaggi nel Worker**, ma il destinatario li riceverà nella propria casella email.

Requisiti Cloudflare per la consegna reale:
1. Abilitare **Email Routing / Email Service** nel dominio.
2. Verificare nell'account Cloudflare la destinazione `agora.scuoladidialogosocratico@gmail.com` (non basta che sia una casella Gmail funzionante).
3. Autorizzare un dominio mittente per la funzione di invio da Workers; il Worker usa come mittente `contatti@agora-scuoladidialogosocraticoecittadinanzattiva.site`.
4. La binding in `wrangler.jsonc` è `CONTACT_EMAIL`, limitata alla sola destinazione associativa.
5. Eseguire un invio reale da `/contatti/` dopo la pubblicazione, controllare la ricezione nella posta dell'associazione e solo allora considerare il modulo attivo.

**In assenza di verifica del binding o se la consegna fallisce, il modulo mostra un errore**, non una conferma fittizia. Il visitatore può usare il collegamento diretto all'email. I test automatizzati fanno invii simulati, non garantiscono la consegna reale.

Protezione da abuso: honeypot, limiti di lunghezza e verifica origine; prima di ricevere molto traffico è raccomandata una regola di rate limiting Cloudflare o Turnstile, configurata e verificata in produzione. Non pubblicare chiavi API. La pagina privacy dev'essere completata per conservazione e operatività dell'email.

## Revisione visuale
Il design mantiene il libro in homepage ma aggiunge quattro percorsi d'ingresso interattivi, dock mobile, header fisso, animazioni leggere e card migliorate con attenzione alla preferenza per movimento ridotto.
