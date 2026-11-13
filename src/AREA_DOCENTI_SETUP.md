# Area riservata docenti Cornaredo — configurazione sicura

## Stato
La rotta `/area-docenti/cornaredo/` è implementata nel Worker in `src/teacher-area.js`, ma **rimane chiusa se non è configurato il secret server** `ERASMUS_DAVINCI_PASSWORD` (almeno 20 caratteri).

Il repository è pubblico. Non inserire mai nel repository una password, un hash di password utilizzabile, link Google Meet, dati identificativi di studenti, documenti interni o riferimenti a casi individuali.

## Attivazione
1. Aprire Cloudflare → Workers & Pages → Worker `agor-aps-site` → Settings → Variables and Secrets.
2. Aggiungere `ERASMUS_DAVINCI_PASSWORD` come **Secret**, con password casuale lunga almeno 24 caratteri. Non aggiungerla in `wrangler.jsonc`, GitHub o documenti pubblici.
3. Pubblicare il ramo solo dopo verifica dei test e controllo dell’assetto del Worker.
4. Testare il sito: una visita anonima deve mostrare la schermata login, una password sbagliata non concede l’accesso, la password corretta imposta cookie HttpOnly/Secure/SameSite=Strict, `logout` chiude la sessione.
5. Configurare nel pannello Cloudflare una regola di rate limiting per `POST /area-docenti/cornaredo/login` (es. massimo 5 tentativi/minuto/IP) e, se possibile, protezione bot.
6. Distribuire la password alle sole insegnanti tramite un canale adeguato; non pubblicarla sul sito né nella corrispondenza aperta a soggetti terzi.

## Separazione dati
Il portale contiene una sintesi metodologica non sensibile. I documenti completi restano nel Drive istituzionale e richiedono autorizzazioni Drive distinte. Le guide non vanno copiate nel repo pubblico se contengono elementi non destinati a essere divulgati.

## Limiti
- La pagina non sincronizza automaticamente Gmail o Google Calendar; le date e le schede vanno aggiornate nel codice dopo verifica.
- La password è condivisa: tutti gli utenti autorizzati hanno lo stesso accesso e non esiste un audit per singolo utente. Per accesso nominativo e revoca per persona, preferire Cloudflare Access con allowlist di email e codice OTP.
- I dati reali su partecipazioni, mobilità e finanziamenti devono essere confermati dalla dirigenza scolastica.
- Non aggiungere l'area a sitemap o indicizzatori.

## Test
`node scripts/test-teacher-area.mjs`
`npm run build`
`npx wrangler deploy --dry-run --outdir .wrangler-check`

## URL previsto
`https://agora-scuoladidialogosocraticoecittadinanzattiva.site/area-docenti/cornaredo/`
Non comunicare il link come **attivo** finché Cloudflare non ha distribuito la versione con il secret configurato e i test dal dominio reale non sono passati.
