# Guida candidature riservata — attivazione e criteri (22/11/2026)

## Stato
Prima implementazione in un ramo GitHub, NON attiva finché la PR non è approvata/mergiata, il deploy non è avvenuto e la configurazione Cloudflare Access + secrets non è completata.

Percorso previsto: `https://agora-scuoladidialogosocraticoecittadinanzattiva.site/guida-candidature/`.

La pagina non è nel menu, non è nella sitemap, ha `X-Robots-Tag: noindex, nofollow, noarchive`, `Cache-Control: private, no-store` ed è servita attraverso il Worker. I bot non la indicizzano per scelta editoriale, ma **solo Cloudflare Access + verifica JWT + allowlist** realizza il controllo accessi.

## Configurazione obbligatoria, senza dati personali nel repository
1. Cloudflare Zero Trust -> Access -> Applications -> crea applicazione **Self-hosted** per il percorso `/guida-candidature*` sul dominio Agorà. Usa login individuale (es. one-time PIN) e policy **Allow** riservata solo agli indirizzi autorizzati. Verifica che il JWT sia passato al Worker in `Cf-Access-Jwt-Assertion`.
2. Il Worker riusa la validazione già sviluppata per i soci, ma con allowlist distinta: **AGORA_CANDIDATE_EMAILS**. Non inserire il candidato fra i soci solo per far funzionare la guida.
3. In Cloudflare imposta **secret** (non valori nel codice né nel file wrangler pubblico):
   - `CF_ACCESS_TEAM_DOMAIN`: issuer `https://<team>.cloudflareaccess.com` già previsto dal Worker.
   - `AGORA_CANDIDATE_ACCESS_AUD`: application AUD tag dedicato all'area candidature. Conserva `CF_ACCESS_AUD` dei soci senza cambiarlo.
   - `AGORA_CANDIDATE_EMAILS`: allowlist degli indirizzi autorizzati; separati da virgola.
   - `AGORA_CANDIDATE_NAME`: nome completo da mostrare solo dopo login.
   - `AGORA_CANDIDATE_CV_TEXT`: curriculum testuale essenziale, verificato sull'originale, evitando indirizzo domestico e data di nascita.
   - `AGORA_CANDIDATE_CREDIT`: formulazione editoriale autorizzata.
   - `AGORA_CANDIDATE_CONTACT_EMAIL`: recapito email del candidato.
   - `AGORA_CANDIDATE_CONTACT_PHONE`: recapito telefonico del candidato.
4. **Applicazioni Access distinte:** il Worker ora usa `AGORA_CANDIDATE_ACCESS_AUD` per questa guida e conserva `CF_ACCESS_AUD` esclusivamente per i soci. Verifica entrambi i percorsi prima del merge.
5. Esegui test anonimo: `GET /guida-candidature/` senza token -> **401** (o pagina Access prima del Worker). Con token valido e email non in allowlist -> **403**. Con secret mancanti -> **503**. Solo un token firmato con audience corretta e email autorizzata può visualizzare la pagina.
6. Verifica che il personale possa aprire i link, che le mailto contengano testo e contatto completi e che nessuna richiesta parta automaticamente. Non inviare email a insaputa dell'utente.

Per caricare valori da terminale nel progetto Cloudflare, il comando è `npx wrangler secret put NOME_SECRET` (dall'ambiente autorizzato). Non trasferire in chat pubblica password o token.

## Qualità delle candidature
Sono presenti **17 annunci nominativi**, **7 portali ufficiali** e **2 contatti email istituzionali**. Per ogni annuncio bisogna ricontrollare: posizione ancora aperta, luogo reale, retribuzione o forma contrattuale se indicata, requisiti obbligatori, scadenza, necessità di partita IVA e corretto pulsante di candidatura. I sette portali e due email NON sono nove posti di lavoro. L'obiettivo di 70 candidature individuali non è ancora raggiunto.

Criteri per arrivare a 70 senza fabbricare offerte:
- Prima individuare 70 opportunità effettivamente pubblicate (eventualmente in più Paesi, ma per trasferte fuori Sicilia chiedere conferma della disponibilità a trasferirsi).
- Tenere solo link specifici e verificabili, non risultati di ricerca duplicati o pagine scadute.
- Data di verifica per ogni annuncio e stato esatto: aperto verificato / incerto / chiuso.
- Un'istruzione operativa personalizzata per ciascuno; distinguere form dal contatto email pubblico.
- Privacy e trattamento dati, nessun invio automatico, progressi locali, prova della conferma.
- Accessibilità smartphone, caratteri grandi, italiano semplice con aiuto spagnolo dove necessario.

## Titolarità e diffusione
La dicitura di autore e mandato richiesta dall'utente va caricata come secret e mostrata soltanto nell'area autenticata. Prima di condividerla con terzi, verificare l'autorizzazione di tutte le persone nominate. Il CV integrale PDF e le anagrafiche non devono essere caricati su GitHub pubblico.
