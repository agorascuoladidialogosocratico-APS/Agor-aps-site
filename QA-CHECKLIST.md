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
