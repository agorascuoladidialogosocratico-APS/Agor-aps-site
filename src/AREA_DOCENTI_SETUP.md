# Area docenti Cornaredo — pagina informativa accessibile tramite link

## Stato e indirizzo
Pagina informativa prevista: `/area-docenti/cornaredo/`.
È una pagina del sito Agorà **accessibile senza password** e non inclusa nei menu o nella sitemap. La mancata indicizzazione (`noindex`) non è una misura di sicurezza: qualunque persona in possesso del link può consultarla.

## Contenuti ammessi
Solo spiegazioni non riservate sull'organizzazione dei colloqui Erasmus+, sintesi delle pratiche educative, domande formative e aggiornamenti generali sui partner. Nel repository PUBBLICO non pubblicare: nomi o casi degli alunni, allegati del questionario, firme o timbri, password, link Meet, contenuti di email non destinati al pubblico o informazioni individuali delle insegnanti.

## Documenti completi
Le due guide Google Docs e il questionario corretto sono nel Drive della scuola. I documenti sono condivisi in sola lettura esclusivamente con le cinque docenti autorizzate e non si aprono automaticamente a chi visita la pagina informativa.

Guida rapida: https://docs.google.com/document/d/1z_rnBKVo35XdTxElyDK0wy1Y02mNFwiJ61fCG1_UxpI/edit
Guida completa: https://docs.google.com/document/d/1wYMBUlvfVKdvyZDrkyAErIRV3A0dZWroHUJheO0lSGY/edit

## Pubblicazione e controlli
1. `npm run build` deve superare i test del sito e `scripts/test-teacher-area.mjs`.
2. `wrangler deploy --dry-run` deve verificare la configurazione Cloudflare Worker Static Assets.
3. Pubblicare su `main` solo dopo i controlli. Per il deploy Cloudflare controllare la pipeline disponibile oppure usare il deploy ufficiale del Worker.
4. Dal dominio reale verificare risposta HTTP 200 senza login, presenza del banner di non indicizzazione e dei link alla documentazione privata.
5. Non aggiungere questa pagina ai menu pubblici, alla sitemap o ai feed; usare i link diretti soltanto per il gruppo.
6. Dopo ogni call aggiornare sintesi e decisioni verificabili, indicando la data dell'ultimo aggiornamento.

## Limiti e scelta futura
L'URL senza password **non è riservato in senso tecnico**. Se si desidera pubblicare verbali interni, liste di persone, dati specifici, documenti integrali, accessi per ruolo o allegati, integrare Cloudflare Access con allowlist di email e OTP, oppure lasciare tali materiali nel Drive scolastico con accesso personale.

Il sito offre orientamento; il Drive rimane l'archivio controllato. Nessuna presenza ai colloqui, candidatura o mobilità è autorizzata automaticamente.
