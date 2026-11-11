# Agorà APS · Botta e risposta Gmail ↔ Chat del sito

## Risultato
Il visitatore scrive soltanto nella chat del sito. Non usa WhatsApp o Gmail. Riceverai una copia dei messaggi nella casella agora.scuoladidialogosocratico@gmail.com.

Premi **Rispondi** nell'app Gmail, scrivi all'inizio del messaggio senza cambiare l'oggetto e invia. La risposta arriverà nella chat del sito. La pagina /operatore/ rimane come alternativa e per consultare lo storico, ma chi risponde solo da Gmail non deve inserire il suo codice.

## Codice preparato
- src/chat-email.js: email in uscita con cronologia e firma HMAC di conversazione; email in ingresso con verifica del mittente Gmail di Agorà, DMARC Cloudflare, parsing MIME e controllo dei messaggi duplicati.
- src/site-chat.js: invio copia email e risposte chat D1.
- src/worker.js: handler email per i messaggi ricevuti dal dominio.
- scripts/test-email-replies.mjs: test di risposta e sicurezza.

## Configurazione Cloudflare necessaria prima dell'attivazione
1. Il dominio deve usare Cloudflare DNS. Controlla gli MX esistenti prima di modificarli. Nel pannello Cloudflare apri Compute → Email Service → Email Routing e abilita il dominio, se non già attivo.
2. Email Routing → Destination Addresses: aggiungi e verifica agora.scuoladidialogosocratico@gmail.com.
3. Verifica che il mittente contatti@agora-scuoladidialogosocraticoecittadinanzattiva.site sia autorizzato dal dominio Email Service e che il binding CONTACT_EMAIL invii realmente alla casella verificata. Cloudflare Workers Free offre invio gratuito a destinatari verificati.
4. Crea regola Email Routing per risposte@agora-scuoladidialogosocraticoecittadinanzattiva.site con azione **Send to Worker**, scegliendo il Worker agor-aps-site. Non inoltrare questo indirizzo a Gmail: il Worker deve ricevere la risposta.
5. Completa CHAT_DB D1 e migrazione, Turnstile e CHAT_ADMIN_TOKEN come in CHAT-BIDIREZIONALE.md. Mantieni CHAT_ENABLED=false finché manca uno di questi componenti.
6. Crea un secret Cloudflare CHAT_EMAIL_REPLY_SECRET casuale, lungo almeno 32 caratteri, non da inviare in chat né salvare su GitHub. Configura CHAT_EMAIL_NOTIFICATIONS=true e, solo quando la regola email è pronta, CHAT_EMAIL_REPLY_ENABLED=true.
7. Valida GDPR e attiva CHAT_ENABLED=true. Apri il sito con un browser di prova e invia un messaggio. La Gmail riceverà l'email con l'oggetto contenente #CODICE/FIRMA.
8. In Gmail premi Rispondi: il destinatario deve essere risposte@agora-scuoladidialogosocraticoecittadinanzattiva.site. Mantieni l'oggetto invariato (prefisso automatico Re: consentito), scrivi prima del testo citato e invia.
9. Verifica che il testo appaia nella chat del visitatore, poi testa due sessioni distinte senza incroci di messaggi.

## Sicurezza e privacy
- L'indirizzo risposte@ è un recapito tecnico. La risposta è accettata solo dalla Gmail ufficiale, autenticata da Cloudflare (DMARC pass) e con la firma corretta nell'oggetto.
- Rifiuta allegati, testo fuori limite e email sospette. L'eventuale citazione del messaggio precedente viene rimossa prima di pubblicare la risposta.
- Le copie delle conversazioni rimangono in Gmail secondo la gestione della casella: non sono cancellate automaticamente quando il database D1 elimina le chat più vecchie di 30 giorni. Prevedere una politica di conservazione anche per Gmail.
- Adeguare l'informativa GDPR e non raccogliere dati sanitari o altamente sensibili.
- La consegna email può essere ritardata. La chat web aggiorna il contenuto ogni cinque secondi dopo la ricezione del messaggio dal server.
- Se il visitatore chiude la sessione del browser, potrebbe perdere l'accesso allo storico.

## Costi
Email Routing in ingresso e invii verso destinazioni verificate sono disponibili gratuitamente entro le regole Cloudflare; Workers e D1 hanno quote Free. Non è richiesto WhatsApp o Meta API. Non acquistare piani a pagamento.

## Fonti
- https://developers.cloudflare.com/email-service/get-started/route-emails/
- https://developers.cloudflare.com/email-service/api/route-emails/email-handler/
- https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- https://developers.cloudflare.com/email-service/platform/pricing/
