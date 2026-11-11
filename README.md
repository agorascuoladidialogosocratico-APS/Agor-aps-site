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


## Pagine visive, fotografie e navigazione
La homepage a libro include una sezione fotografica con immagini originali già presenti nel repository: \`agora_gruppo_home.webp\`, \`agora_dialogo.webp\`, \`agora_viaggio.webp\`. Le pagine interne non sono un blog: copertine editoriali fotografiche, sezioni con ampio respiro, gallerie per Chi siamo/Progetti/Tirocini/Partecipa, composizione responsive e microinterazioni rispettose di \`prefers-reduced-motion\`.

Le immagini vengono **riusate, non inventate**. Gli asset derivati \`-480.webp\` e \`-800.webp\` sono parte del repository. Per aggiornare le foto attraverso il CMS, usare i campi immagine di \`content/home.json\`, \`content/association.json\`, \`content/method.json\` e \`content/projects.json\`; il generatore \`scripts/generate-pages.mjs\` rigenera le pagine.

## Chat del sito verso WhatsApp Business
La finestra "Parliamone" compare su homepage e pagine interne. Il pulsante può aprire il link WhatsApp **click-to-chat** con messaggio già composto; il visitatore sceglie di inviarlo nell'app WhatsApp/WhatsApp Web. La risposta avviene nell'account WhatsApp Business associato al numero, non in un inbox separato sul sito. Non si tratta della WhatsApp Business Platform API e non mostra risposte in tempo reale nel widget stesso.

Configurazione in Pages CMS → "00 · Chat WhatsApp Business", file \`content/whatsapp.json\`:
1. Identificare e verificare il numero **WhatsApp Business ufficiale** dell'associazione (non basta un numero telefonico generico).
2. Inserirlo in \`phoneNumber\`, nel formato internazionale con **sole cifre** (per l'Italia: 39 seguito dal numero).
3. Impostare \`enabled: true\` e pubblicare le modifiche.
4. Aprire il sito da smartphone e computer, digitare un messaggio e verificare che venga aperta **la chat corretta** nell'app WhatsApp Business. Verificare anche l'effettiva ricezione inviando il messaggio dall'app.

Il numero WhatsApp Business comunicato dall'associazione l'11 novembre 2026 è **+32 466 90 21 27** (configurazione `enabled:true`, `phoneNumber:32466902127`). Il recapito italiano dedicato alle **chiamate** è **+39 333 883 9329**. Il sito distingue le due funzioni: il collegamento WhatsApp apre la chat sul numero belga; il collegamento `tel:` chiama il numero italiano. L'invio del messaggio va confermato dall'utente in WhatsApp. Testare la ricezione da un telefono esterno all'associazione.

Il widget non memorizza messaggi, non apre connessioni a terze parti finché il visitatore non segue il link WhatsApp e non dichiara di essere un operatore online. Per una conversazione bidirezionale incorporata realmente nella pagina occorrerebbe la WhatsApp Business Platform con autorizzazione Meta, webhook, backend, gestione delle conversazioni e requisiti privacy.


## Chat interna al sito (in preparazione)
Il widget precedente che apriva WhatsApp è stato sostituito con la nuova chat interna, che **non trasferisce il visitatore su WhatsApp**. La conversazione bidirezionale richiede ancora l'attivazione Cloudflare D1, Turnstile e un numero tecnico WhatsApp Business Platform distinto dal numero dell'operatore +32 466 90 21 27. Finché i collegamenti non sono disponibili, la chat indica chiaramente che il servizio è in preparazione e offre il modulo contatti, senza false conferme. Per architettura, sicurezza, privacy e passi di attivazione vedere **CHAT-BIDIREZIONALE.md**.
