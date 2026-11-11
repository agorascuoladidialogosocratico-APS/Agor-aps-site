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
