# Chat Agorà sul sito: collegamento bidirezionale WhatsApp Business

## Esperienza richiesta
Il visitatore scrive e legge le risposte esclusivamente nel widget sul sito Agorà, senza aprire WhatsApp. L'associazione usa il proprio numero WhatsApp Business +32 466 90 21 27 per rispondere.

## Perché serve un numero tecnico separato
Il numero +32 è il destinatario delle notifiche per l'operatore. Per scrivergli da WhatsApp occorre un **secondo numero distinto**, attivato sulla WhatsApp Business Platform (Cloud API) di Meta: è il numero tecnico del ponte. Non bisogna cancellare, migrare o disconnettere l'account WhatsApp Business esistente +32. La modalità Coexistence da sola NON collega una chat web anonima al WhatsApp dell'operatore.

## Flusso
1. Il visitatore apre la chat nel sito e supera la verifica Turnstile.
2. Il Worker crea una sessione con identificatore segreto e registra il messaggio nel database D1.
3. Il numero tecnico Meta invia al +32 una notifica con il codice conversazione, usando un **template WhatsApp approvato**.
4. L'operatore dal suo WhatsApp Business risponde al numero tecnico con una frase che inizia con un codice: #F4A27B93D0 Ciao, come posso aiutarti?
5. Il webhook verifica la firma Meta, accetta soltanto messaggi del numero +32, identifica la sessione dal codice e registra la risposta.
6. Il widget del sito aggiorna la conversazione automaticamente (controllo ogni 5 secondi). Il visitatore non esce mai dal sito.

## Componenti preparati
- assets/site-chat.js e assets/site-chat.css: widget web con messaggi, cronologia, invio, controllo antispam e fallback onesto.
- src/site-chat.js: API, protezione accessi, D1, notifiche WhatsApp tramite template, webhook firmato, filtro numero operatore.
- migrations/0001_site_chat.sql: schema conversazioni e messaggi.
- src/worker.js: instradamento del servizio e cancellazione delle chat scadute.
- wrangler.jsonc: cron giornaliero alle 04:00 UTC, senza un database D1 inventato.

## Procedura di attivazione (richiede accesso agli account)
1. Registrare un numero tecnico dedicato WhatsApp Business Platform, **diverso dal +32**, tramite Meta Business, e ottenere il Phone Number ID, un token Cloud API e l'App Secret. Il +32 resta nell'app WhatsApp Business dell'operatore.
2. Ottenere approvazione di un template di messaggio WhatsApp con due parametri testuali nell'ordine **codice conversazione**, **anteprima messaggio**. Il numero +32 deve poter ricevere queste notifiche rispettando l'opt-in e le condizioni Meta. Possono esserci costi.
3. Creare in Cloudflare un database D1 (preferibilmente localizzato nell'UE secondo la valutazione privacy), aggiungerlo alla configurazione Wrangler come binding CHAT_DB con il vero database_id generato da Cloudflare e applicare migrations/0001_site_chat.sql.
4. Creare una configurazione Cloudflare Turnstile per il dominio (Site Key, Secret).
5. Impostare nel Worker le variabili/segreti: CHAT_OWNER_NUMBER=32466902127, CHAT_ENABLED=true, META_PHONE_NUMBER_ID (numero tecnico), META_TOKEN, META_APP_SECRET, META_WEBHOOK_VERIFY_TOKEN (scelto casualmente), META_TEMPLATE_NAME (approvato), META_TEMPLATE_LANGUAGE (es. it), META_GRAPH_VERSION (versione supportata), TURNSTILE_SITE_KEY e TURNSTILE_SECRET.
6. Configurare in Meta il webhook HTTPS pubblico sul percorso /api/meta-whatsapp-webhook del dominio Agorà, con il verify token configurato, e sottoscrivere gli eventi messages del numero tecnico.
7. Proteggere l'API chat con regole Cloudflare di rate limiting, aggiornare e validare l'informativa privacy del sito, testare con sessioni browser diverse ed effettuare una prova reale di risposta dal +32.

**Non inserire access token, password o App Secret nel repository né nei messaggi di ChatGPT.** In Cloudflare usare Secrets.

## Comportamento prima della configurazione
L'interfaccia chat compare nel sito ma segnala che la conversazione bidirezionale è in attivazione e propone il modulo contatti già esistente. Non permette di inviare messaggi che non potrebbero essere letti. Non apre più WhatsApp sul dispositivo del visitatore.

## Sicurezza e conservazione
Le sessioni usano token casuali a 256 bit, salvati come hash nel D1; il browser tiene il token in sessionStorage. La verifica Turnstile protegge l'apertura della chat. Il webhook usa HMAC SHA-256 e controlla che risponda soltanto il numero dell'operatore. Ogni sessione ha un codice univoco. Sono previsti limiti di messaggi e cancellazione delle conversazioni dopo 30 giorni dall'ultima attività tramite cron. I messaggi notificati a Meta possono essere conservati separatamente secondo i termini Meta: verificare GDPR, base giuridica e informativa prima di abilitare.

## Limitazione importante
Non si può promettere la chat operativa prima che il numero tecnico, Meta Cloud API, il database D1, Turnstile, template approvato e il webhook siano configurati. Nessuna credenziale o numero Meta è stato inventato; la modalità reale resta disabilitata fino alla connessione.


## Alternativa gratuita: Free Dashboard (senza Meta)
Questa modalità **non manda messaggi su WhatsApp**, quindi non richiede un secondo numero né template/API Meta. Il visitatore scrive sempre nella chat del sito; l'operatore legge e risponde dalla pagina riservata /operatore/, utilizzabile da smartphone. I messaggi sono conservati su Cloudflare D1 e il widget del visitatore aggiorna le risposte circa ogni cinque secondi.

### Configurazione Cloudflare (necessaria per attivarla)
1. Apri il tuo account Cloudflare, nella sezione D1 SQL Database crea il database gratuito agora-site-chat e conserva il suo vero Database ID.
2. Nel file wrangler.jsonc aggiungi il binding D1 CHAT_DB con il vero database_id. L'ID non deve essere inventato.
3. Esegui migrations/0001_site_chat.sql sul database remoto tramite pannello D1 Console o comando Wrangler "npx wrangler d1 migrations apply agora-site-chat --remote".
4. Crea un widget Turnstile Free sul dominio del sito e ottieni Site Key + Secret.
5. Nel Worker imposta variabili: CHAT_MODE=free-dashboard, TURNSTILE_SITE_KEY=chiave pubblica. Imposta Secrets: TURNSTILE_SECRET=chiave privata, CHAT_ADMIN_TOKEN=chiave casuale forte di almeno 40 caratteri. Configura binding CHAT_DB.
6. Imposta CHAT_ENABLED=true solo dopo le verifiche, poi pubblica il Worker e prova GET /api/site-chat/status: deve restituire enabled:true.
7. Apri la pagina riservata https://agora-scuoladidialogosocraticoecittadinanzattiva.site/operatore/ sul tuo telefono e inserisci la chiave operatore. Puoi aggiungere il collegamento alla schermata Home.
8. Prova con un browser in incognito la chat del sito. Controlla la conversazione nella posta operatore e rispondi. La risposta deve apparire sul sito, senza WhatsApp.
9. Proteggi in aggiunta /operatore/ e /api/site-chat/admin/ con Cloudflare Access Free, limitando gli accessi all'indirizzo email aziendale, e verifica GDPR e conservazione prima di raccogliere conversazioni reali.

### Limitazioni e costi
La modalità free-dashboard non effettua chiamate alle API Meta, quindi non genera costi WhatsApp. Workers, D1 e Turnstile hanno quote gratuite, non risorse illimitate. Raggiunto il limite Free, il servizio può smettere di rispondere finché non si ripristina la quota. Non abilitare upgrade automatici o piani a pagamento. La modalità che consente di rispondere **dentro WhatsApp Business** tramite il numero +32 resta separata e non è garantita a costo zero: può necessitare di template WhatsApp a pagamento.

### Sicurezza
La chiave operatore va inserita esclusivamente nella pagina di accesso e salvata tra i secrets di Cloudflare, mai in GitHub o in chat. L'API dell'operatore confronta la chiave con il secret dal server prima di mostrare conversazioni. I messaggi sono visualizzati come testo (mai come HTML); i risultati non devono essere memorizzati in cache. La protezione con Cloudflare Access aggiunge autenticazione personale alla chiave. Le chat vengono eliminate automaticamente dopo 30 giorni dall'ultima attività.

### Stato attuale
Codice, pagina operatore, schema D1 e controlli di sicurezza sono preparati. Non risultano ancora creati in questo ambiente il database Cloudflare D1, Turnstile e i segreti di produzione; non dichiarare il servizio attivo prima di queste operazioni e del test di invio e risposta.
