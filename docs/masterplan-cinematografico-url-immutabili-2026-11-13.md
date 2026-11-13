# MASTERPLAN — AGORÀ, SITO CINEMATOGRAFICO A URL INVARIATI

**Versione 1.0 · 13 novembre 2026**  
**Sito:** https://agora-scuoladidialogosocraticoecittadinanzattiva.site/  
**Repository:** `agorascuoladidialogosocratico-APS/Agor-aps-site`  
**Direzione:** narrazione filosofica immersiva, composizione classica e mediterranea, palette blu cobalto, arte originale con riferimenti culturali leciti, scroll continuo e menu sempre disponibile.  
**Vincolo prioritario:** NON cambiare dominio, nomi delle cartelle, permalink, slug, canonical, permalink social, sitemap esistente o API editoriali.

---

## 1. Principio creativo

Agorà non deve imitare i contenuti, il marchio o le illustrazioni proprietarie di Pear. Il riferimento fornito dall'utente indica un **linguaggio di regia**: scenografie classiche su fondale saturo, profondità stratificata, titoli monumentali, movimenti guidati dalla progressione della pagina, atmosfera teatrale, transizioni fra capitoli.

La narrazione originale di Agorà:

> **Le domande aprono mondi. Le idee si coltivano. La filosofia è di tutti.**

L'esperienza deve rendere riconoscibile l'associazione e spiegare concretamente **dialogo socratico, educazione non formale, cittadinanza attiva e progetti europei**. Ogni passaggio visivo deve avere un obiettivo editoriale o un invito alla partecipazione; niente animazioni gratuithe.

### Linguaggio e sistema visivo

| Dimensione | Regola di progetto |
|---|---|
| Palette | Cobalto `#075fdf`, blu profondo `#053b9a`, notte `#072962`, avorio `#fff8e9`, oro `#f0c88c`, salvia `#b6daca` |
| Tipografia | Newsreader per titoli scenici, DM Sans per navigazione e testi; utilizzare i font già serviti dal sito |
| H1 e SEO | Un solo H1 per pagina; heading e testo in DOM, mai soltanto su canvas |
| Fotografia | Foto autentiche dell'associazione con alt; evitarne riuso improprio su copertine di articoli diversi |
| Illustrazioni | SVG originali per colonne, ulivo, drappo; immagini di Raffaello in pubblico dominio per apertura |
| Profondità | 3 o 4 piani: sfondo cromatico, architettura, opera/figura, titolo e CTA; parallasse discreta |
| Movimento | Scroll nativo, RequestAnimationFrame, IntersectionObserver, niente scroll hijacking |
| Menu | Sempre disponibile su desktop, accessibile e scrollabile orizzontalmente su schermi piccoli, senza rimuovere collegamenti |
| Fallback | Con JS disabilitato tutto il contenuto resta leggibile; `prefers-reduced-motion` e Save-Data non forzano effetti |
| Licenze | Fonte, autore, licenza o pubblico dominio per ogni opera esterna; file originali SVG e crediti per quelli propri |

## 2. Architettura della homepage — otto momenti narrativi

La homepage attuale ha già tre grandi scene; il redesign estende il racconto alle sezioni successive.

| Momento | Narrazione | Regia visiva | Destinazione invariata |
|---|---|---|---|
| 01 — Domanda | «Le domande aprono mondi» | Platone, Aristotele, drappo, luce, cobalto | `/dialogo-socratico/` |
| 02 — Pensiero | «Le idee si coltivano» | Ulivo originale, frutti dorati, profondità e scroll | `/progetti/` |
| 03 — Piazza | «La filosofia è di tutti» | Colonne, manifesto, architettura | `/magazine/`, `/partecipa/` |
| 04 — Percorsi | «Da quale domanda vuoi partire?» | Carte di scelta autentiche, transizione crema/azzurro | `/chi-siamo/`, `/progetti/`, `/tirocini/`, `/contatti/` |
| 05 — Impegno | «Le idee hanno bisogno di spazio» | Scena a colonne originale con movimento 2.5D | `/progetti/` |
| 06 — Persone | «Il dialogo si vede» | Fotografie reali dell'associazione, no foto AI di falsi partecipanti | `/chi-siamo/` |
| 07 — Editoriale | «Ogni domanda è una pagina nuova» | Magazine e copertine editoriali autentiche | `/magazine/` |
| 08 — Comunità | «Il dialogo continua» | Ulivo su fondo cobalto, invito alla partecipazione | `/partecipa/` |

Il libro interattivo storico della homepage resta raggiungibile: non si cancella il materiale già scritto, non si ricrea il sito da zero e non si perde la navigazione per ancore.

## 3. Pagine istituzionali — stesso URL, scenografie dedicate

Ogni pagina conserva esattamente il proprio path (vedere inventario completo sotto).

| Percorso | Tema di scena | Comportamento editoriale |
|---|---|---|
| `/chi-siamo/` | Persone e ulivo | La foto autentica rimane, livelli originali creano profondità |
| `/dialogo-socratico/` | Drappo, parola, confronto | Titolo monumentale, capitoli di metodo realmente leggibili |
| `/progetti/` | Colonne / architettura | Percorso tra progetti, card esistenti e link intatti |
| `/progetti/soda-labs/` | Metodologia e democrazia | Tutte le informazioni e cautele progettuali preservate |
| `/progetti/odisseo-philosophorum/` | Viaggio e mutamento di sguardo | Nessun risultato di attività inventato |
| `/tirocini/` | Metodo / formazione | Requisiti e link esistenti intatti |
| `/volontariato-esc/` | Mobilità, orientamento | Riferimenti ufficiali e ruolo ESC non sovrastimati |
| `/partecipa/` | Comunità / ulivo | CTA visibile, moduli e iscrizioni invariati |
| `/contatti/` | Piazza e incontro | Form di contatto invariato, priorità alla funzionalità |
| `/trasparenza/` | Identità | Atmosfera grafica sobria, documenti sempre accessibili |
| `/privacy/` | Tutela e affidabilità | Nessun intermezzo scenico tra parti legali; priorità al testo |
| `/accessibilita/` | Inclusione | Comandi di accessibilità e testo primari, riduzione motion |

Le pagine istituzionali ricevono: menu sticky, hero in blu cobalto, fotografie reali, profondità decorativa originale, una parte dei capitoli che reagisce discretamente allo scroll e — solo dove appropriato — un intermezzo visivo con CTA contestuale. **Il contenuto istituzionale rimane HTML, non viene trasferito in una sequenza di immagini.**

## 4. Magazine — identità visiva senza penalizzare lettura e SEO

Il **Magazine è il centro editoriale di Agorà**; rappresenta un prodotto culturale, non soltanto un elenco di cards.

- `/magazine/`: copertina scenica piena altezza, arte originale sovrapposta, griglia degli articoli con micro-profondità su hover.
- `/magazine/criteri-editoriali/`: pagina di trasparenza editoriale protetta e leggibile.
- `/magazine/{slug}/`: titoli grandi, copertina specifica, crediti e licenze già conservati, testo a larghezza di lettura corretta, nessuna alterazione dei contenuti.
- Il CMS Pages CMS resta utilizzabile. Nuovi articoli continuano a generare un `index.html` in `/magazine/{slug}/` senza cambiare gli URL esistenti.
- La pubblicazione Buffer/Instagram/Facebook, le 23 uscite storiche e le 5 nuove uscite rimangono indipendenti dal redesign. L'immagine per social è quella dell'articolo, non la scenografia generica del sito.

## 5. Contratto permanente di conservazione degli indirizzi

**Inventario di riferimento:** `data/url-contract-2026-11-13.json` — **45 URL pubblici** censiti dalla sitemap.  
**Test automatico:** `scripts/verify-url-contract.mjs`.

La build deve interrompersi se anche **uno solo** dei 45 percorsi protetti:
1. scompare da `sitemap.xml`;
2. non ha più il relativo file `index.html`;
3. perde il canonical autoreferenziale;
4. viene marcato `noindex`;
5. perde l'H1;
6. cambia il proprio URL Open Graph dove dichiarato.

Gli URL nuovi (nuovi articoli futuri) sono ammessi. **Non serve alcun redirect 301 per questo redesign, perché gli URL non vengono modificati.** In un futuro eventuale cambio di slug, fare prima una mappatura 1:1, poi redirect permanente specifico, aggiornamento dei link interni e della sitemap. Non usare redirect massivi alla homepage.

Esempi protetti:
`/`, `/chi-siamo/`, `/dialogo-socratico/`, `/progetti/`, `/progetti/soda-labs/`, `/progetti/odisseo-philosophorum/`, `/volontariato-esc/`, `/tirocini/`, `/magazine/`, `/magazine/archivio-la-filosofia-kantiana-cose/`, `/magazine/intelligenza-artigianale-ai-e-liberta-di-giudizio/`, `/contatti/`, `/trasparenza/`, `/sostienici/`.

## 6. Scelte tecniche e percorso di miglioramento

**Fase A — Infrastruttura e URL (inclusa in questo intervento):**
- Baseline dei permalink.
- Test di regressione URL, canonical e sitemap.
- CSS cinematico condiviso e JS leggero condiviso, senza passare da HTML statico a un'app React pesante.
- Menu sticky, colori, tipografia e motion ridotto.

**Fase B — Scenografia multipagina (inclusa in questo intervento):**
- Hero istituzionali full-bleed con architetture, ulivo e drappo SVG originali.
- Profondità con CSS 3D transforms e parallasse controllata dalla viewport.
- Nuovi intermezzi di scena, coerenti con il tema; contenuti e moduli originali preservati.
- Magazine visualmente allineato alla homepage.

**Fase C — Regia 3D avanzata (successiva, richiede verifica grafica reale):**
- Elaborare storyboard e animatic di ogni scena a partire da soggetti originali.
- Eventuali modelli GLB/GLTF in Blender con texture compresse e LOD.
- Se serve la fedeltà cinematografica a Pear: **un canvas WebGL fissato** e una progressione di frame/animazioni sincronizzata al movimento scroll, con overlay HTML per titoli, menu e CTA. Non copiare filmati di Pear.
- Per gli scorrimenti su smartphone predisporre poster statici o animazioni a basso costo, mai video pesanti in autoplay obbligatorio.
- Rendere possibile l'interruzione delle animazioni via controlli accessibili, anche con tastiera.

**Fase D — Collaudo e pubblicazione:**
- Test Chrome, Safari desktop/iOS e Chrome Android.
- Verifica 320/375/768/1024/1440 px; nessun testo tagliato, menu completo, focus visibile.
- Audit Lighthouse/PageSpeed mobile e desktop, con LCP, CLS, INP, TBT e peso rete, non soltanto punteggio.
- Test moduli, CMS, caricamento copertine e programmazione social.
- Controllo di 45 URL, dati strutturati, sitemap, `robots.txt`.
- Pubblicazione su GitHub/Cloudflare soltanto dopo il superamento dei controlli automatici.

## 7. Banca immagini, proprietà intellettuale e tracciabilità

**Attualmente utilizzati:**
- Raffaello, *La Scuola di Atene* (1509–1511): ritagli di Platone e Aristotele in pubblico dominio, crediti e link Wikimedia nella homepage; originali salvati localmente.
- `assets/cinema-curtain.svg`: scenografia originale Agorà.
- `assets/cinema-olive-tree.svg`: ulivo e frutti originali Agorà.
- `assets/cinema-columns.svg`: colonne originali Agorà.
- Immagini originali di Agorà già presenti nel repository e attribuzioni editoriali del Magazine.

**Nuove ricerche visive per la Fase C:** Met Open Access, Rijksmuseum, Wikimedia Commons e Europeana. Ogni asset deve avere un record: autore, titolo, URL sorgente stabile, licenza/stato dei diritti, trasformazioni apportate, posizione nel sito e testo alternativo. Non presumere che una fotografia d'epoca o la fotografia di un'opera in museo sia automaticamente libera senza controllare condizioni di riutilizzo.

## 8. Criteri di qualità e priorità

| Priorità | Vincolo | Test |
|---|---|---|
| P0 | Nessun URL esistente perso, H1/canonical preservati | `verify-url-contract.mjs` |
| P0 | Menu e link istituzionali non rimossi | `verify-cinematic-system.mjs` |
| P0 | Modulistica, dati personali, CMS e social intatti | Test funzionali esistenti |
| P1 | 100% leggibile senza JS o con reduced motion | Test CSS/statici e browser reali |
| P1 | Performance mobile accettabile | Nuovo PageSpeed mobile |
| P1 | Fonti/credit delle opere verificabili | Audit licenze e fonte per asset |
| P2 | Transizioni cinematografiche più sofisticate | Prototipo GLB/animatic poi collaudo |
| P2 | Nuove sezioni e contenuti | Editorial review prima della pubblicazione |

### Decisione architetturale

**Conservare il frontend attuale.** Il sito pubblica HTML statico da GitHub e Pages CMS e ha una sitemap già verificata, con 45 URL. Convertirlo immediatamente a Next.js/React Three Fiber introdurrebbe rischio inutile ai permalink, ai moduli e al tempo di caricamento. La strategia è una **progressive enhancement** della regia grafica; solo se i test e il valore narrativo lo giustificano si aggiungerà un canvas WebGL per le scene più importanti.

### Stato e limiti delle conferme

Le modifiche al codice e i test di build permettono di verificare struttura e riferimenti. **Una resa identica a Pear non è promessa**: servono nuove scene illustrate/animate originali e test visivi su browser reali. Non usare il termine «3D fotorealistico completo» per i livelli CSS; chiamarli **profondità scenografica 2.5D**. La Fase C sarà invece vera grafica WebGL/3D se implementata.

---

**Documenti collegati:** `docs/design-cinematografico-riferimento-pear-2026-11-13.md`; `docs/linea-editoriale-filosofia-attualita-2026-11-13.md`; `data/url-contract-2026-11-13.json`.
