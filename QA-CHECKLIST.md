# QA — audit Agorà APS, 11 novembre 2026

## Verifiche automatiche sulla codebase
- [x] Link MarLuna rimossi dalla homepage e dal JSON di visibilità.
- [x] Rimossa la copia del collegamento a Statuto/Atto dalla pagina Pubblicazioni.
- [x] Trasparenza rimanda alla consultazione ufficiale RUNTS.
- [x] Corretta la frase contraddittoria sulla graduatoria DiscoverEU.
- [x] Pagine informative SEO autonome: Chi siamo, Progetti, SODA-LABS, Odisseo, Tirocini, ESC, Partecipa, Contatti, Trasparenza, Privacy, Accessibilità.
- [x] Pagine con canonical, metadata e menu accessibile già presenti nel codice.
- [x] Controlli per aumento testo e contrasto elevato, preferenze locali e link accessibilità.
- [x] Generatore statico da JSON e sitemap allineata.
- [ ] Esecuzione GitHub Actions: `npm run build` + `wrangler deploy --dry-run` + JavaScript syntax check.
- [ ] Verifica che Cloudflare **esegua realmente `npm run build`** sui commit Pages CMS.

## Verifiche manuali indispensabili
- [ ] Test con tastiera, tabulazione, ordine focus, screen reader (VoiceOver/NVDA).
- [ ] Contrast check e zoom 200/400%; visualizzazione con animazioni ridotte.
- [ ] Test mobile in browser reali, landscape e tastiere mobili.
- [ ] Lighthouse desktop/mobile e Core Web Vitals reali, senza punteggi stimati.
- [ ] Search Console: Ispezione URL / robots / sitemap / copertura / performance.
- [ ] Link esterni RUNTS e atenei in finestra anonima.
- [ ] Revisione legale dell'informativa privacy e degli eventuali moduli online.
- [ ] Verifica DNS, HTTPS, www redirect, accesso al dominio e Cloudflare Worker Build.
- [ ] Verifica stato reale delle convenzioni/progetti e aggiornamento dati istituzionali.

Questa checklist non è una dichiarazione di conformità legale o tecnica.

## Miglioramento visuale e chat WhatsApp — 11 novembre 2026
- [x] Foto originali del repository reintegrate in homepage e copertine delle pagine interne.
- [x] Gallerie fotografiche di Chi siamo, Progetti, Tirocini e Partecipa.
- [x] Breakpoint mobile e prefers-reduced-motion nel design fotografico e nella chat.
- [x] Finestra di dialogo "Parliamone" con fallback al modulo quando manca un numero Business verificato.
- [x] Configurazione WhatsApp Business editabile nel CMS; numero inizialmente vuoto per sicurezza.
- [x] Controlli automatici sui file immagine, sugli alt, sui CSS/JS e sul formato E.164 digit-only.
- [ ] Test visuale su browser e schermi reali, contrasto, VoiceOver/NVDA e zoom 200–400%.
- [x] Numero WhatsApp Business +32 466 90 21 27 comunicato dall'associazione e attivato.
- [x] Numero telefonico italiano per chiamate +39 333 883 9329, inserito nella homepage e nei contatti.
- [ ] Test clic da smartphone e desktop e controllo ricezione effettiva messaggio nell'app Business.


## Free Dashboard per chat sul sito
- [x] Pannello operatore /operatore/ mobile-ready, non incluso in sitemap e con noindex.
- [x] API amministrative dedicate con chiave privata controllata sul server.
- [x] Invio e risposta tramite D1 in modalità free-dashboard, senza chiamate Meta.
- [x] Fallback sicuro finché CHAT_ENABLED=false.
- [x] Test automatizzati per chiave errata, accesso riservato e risposte simulate.
- [ ] Creare database D1 nel piano gratuito, associare binding CHAT_DB e applicare migrazione.
- [ ] Creare Turnstile Free e configurare Secret/Site Key.
- [ ] Generare e salvare CHAT_ADMIN_TOKEN solo nei segreti Cloudflare e attivare un controllo Cloudflare Access.
- [ ] Verificare informativa privacy, testare dal telefono invio e risposta, poi impostare CHAT_ENABLED=true.
