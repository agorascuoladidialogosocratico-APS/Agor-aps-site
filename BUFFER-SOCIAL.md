# Agorà Magazine → Buffer Free → Instagram, Facebook e X

## Scopo
Si scrive una volta in Pages CMS e si pubblica l'articolo su Agorà Magazine. Dalla scheda dell'articolo si può premere **Prepara post per Instagram, Facebook e X**: l'azione richiede conferma e offre due modalità:
- **Bozze su Buffer (predefinita)**: nessun post viene pubblicato prima della revisione in Buffer.
- **Coda Buffer**: il post viene programmato sugli account collegati secondo gli orari della relativa coda.

La semplice pubblicazione o modifica di un articolo sul sito NON invia automaticamente nulla ai social. È necessario autorizzare l'azione nell'editor.

## Piano gratuito
Buffer Free comprende fino a tre canali, dieci post programmati contemporaneamente per canale e una chiave API. Limiti e funzioni possono cambiare; confermarli in https://buffer.com/pricing prima dell'attivazione.

## Collegamento (richiede accesso agli account dell'associazione)
1. Apri https://buffer.com/ e accedi o crea un account Free, senza acquistare un piano. Collega la **Pagina Facebook ufficiale**, l'**Instagram Business o Creator dell'associazione** e il suo **profilo X**. Non collegare profili personali di collaboratori al posto delle pagine dell'ente.
2. Apri Buffer Settings → API e genera la chiave personale. Non pubblicarla in GitHub e non inviarla tramite email o chat.
3. Apri GitHub, repository agorascuoladidialogosocratico-APS/Agor-aps-site → Settings → Secrets and variables → Actions → Secrets. Crea il secret BUFFER_API_KEY con il valore della chiave.
4. Apri GitHub Actions → **Agorà Magazine - Buffer social** → Run workflow. Imposta task = channels, branch main, quindi avvia. Leggi gli ID dei tre canali restituiti dall'API (sono identificativi Buffer, non nomi utente social).
5. **Gli ID non servono più quando Buffer contiene un solo canale attivo per piattaforma.** L'automazione identifica Facebook, Instagram e X direttamente tramite API e verifica che non siano disconnessi o bloccati. Prima di inviare bozze, controlla che siano gli account ufficiali Agorà. Se esistono più canali della stessa rete, inserisci esplicitamente i tre ID tramite GitHub → Settings → Secrets and variables → Actions → Variables con i nomi BUFFER_CHANNEL_FACEBOOK, BUFFER_CHANNEL_INSTAGRAM, BUFFER_CHANNEL_X. Con canali ambigui, l'invio viene bloccato.
6. In GitHub Actions lancia una prova con task = preview. Stampa i tre testi e le foto senza alcun invio social.
7. In https://app.pagescms.org/ apri la raccolta Agorà Magazine, scegli un articolo già pubblicato e modifica le tre selezioni social o le didascalie, se necessario. Salva e attendi la pubblicazione della pagina.
8. Premi il pulsante **Prepara post per Instagram, Facebook e X** nella scheda articolo e scegli **Bozze**. Controlla le bozze nel tuo Buffer; poi, per gli articoli successivi, usa **Coda** se vuoi programmarli direttamente.

## Impostazioni editoriali
- Facebook riceve titolo, sommario, link all'articolo e hashtag.
- Instagram riceve fotografia e didascalia: il link nella didascalia non sarebbe cliccabile, quindi il testo invita a leggere sul sito. È richiesto un account Instagram professionale collegato.
- X riceve un post breve con collegamento all'articolo, mantenuto prudenzialmente entro 280 caratteri.
- Puoi personalizzare le tre didascalie in Pages CMS. Le foto devono essere pubbliche sul dominio, autorizzate e accettate dalla piattaforma.

## Sicurezza e duplicazioni
L'azione CMS usa la conferma e imposta **bozza** come scelta iniziale. Il codice controlla che il percorso appartenga alla raccolta Magazine, che l'articolo sia pubblico e che ciascun Channel ID Buffer corrisponda al servizio previsto. La chiave rimane nei GitHub Secrets.

Il registro data/buffer-posts.json conserva gli ID dei post creati, evitando un nuovo invio se ripeti l'azione per lo stesso articolo e lo stesso canale. Se crei prima una bozza, per metterla in coda dovrai usare Buffer direttamente: la seconda pressione del pulsante non duplica la bozza. Se una richiesta API riesce ma il workflow si interrompe prima del salvataggio del registro, controlla la coda Buffer prima di ritentare.

## Collaudo finale
- [ ] Buffer Free collegato agli account Facebook, Instagram e X ufficiali.
- [ ] Secret API e tre Channel ID configurati senza esporre credenziali.
- [ ] Anteprima dell'articolo eseguita tramite GitHub Actions.
- [ ] Tre bozze create realmente su Buffer e controllate.
- [ ] Pubblicazione effettiva da Buffer verificata su tutte le piattaforme.
- [ ] Nessun doppione dopo un secondo invio.

Fonti:
https://developers.buffer.com/guides/posts-and-scheduling.html
https://developers.buffer.com/guides/authentication.html
https://pagescms.org/docs/configuration/actions/
