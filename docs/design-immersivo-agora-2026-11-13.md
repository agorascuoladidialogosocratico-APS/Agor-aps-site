> **Superato dalla revisione cinematografica del 13 novembre 2026.** Questo documento descrive la prima proposta con scultura astratta WebGL, non più presente nella homepage. Il progetto attuale è documentato in `docs/design-cinematografico-riferimento-pear-2026-11-13.md`.

# Agorà — una nuova esperienza web immersiva

**Data:** 13 novembre 2026 · **Ambito:** homepage istituzionale, nessun cambiamento al Magazine o alle automazioni social.

## Obiettivo narrativo

Creare una forma visiva originale coerente con la filosofia di Agorà: due traiettorie differenti si avvicinano, si incrociano, cambiano angolazione, senza fondersi in un'unica verità prestabilita. Il 3D ha un ruolo semantico: rende tangibile il **dialogo**, non è decorazione fine a sé stessa.

**Messaggio visibile:** «Le idee prendono forma.»
**CTA:** «Scopri il dialogo socratico» e «Leggi le nostre idee».

## Scelte tecniche

- **WebGL nativo e shader originali**, senza librerie esterne, CDN, modelli di terzi o asset acquistati. Non introdurre React/Next/Three.js/GSAP in questa fase: il sito è già statico, accessibile e veloce, e un rifacimento del frontend sarebbe sproporzionato.
- Due superfici parametriche e una sfera centrale; rendering limitato a ~26 frame al secondo e pixel ratio massimo 1,55, inferiore su mobile.
- Avvio automatico soltanto **su desktop, quando la sezione entra nel viewport, a browser inattivo, senza risparmio dati e senza preferenza di movimento ridotto**. Su mobile e con motion reduction rimane il poster SVG, salvo attivazione volontaria.
- Quando la sezione esce dallo schermo o la scheda browser diventa nascosta, nessuna nuova frame GPU viene renderizzata.
- Interazione con puntatore e lieve reazione alla posizione dello scroll, nessun blocco dello scroll nativo.
- Fallback SVG originale visibile immediatamente, anche senza JavaScript o WebGL, con spiegazione HTML accessibile.
- Pulsante 3D con `aria-pressed` e possibilità di arresto; le preferenze globali di animazione della homepage arrestano anche la nuova scena.
- CSS incluso nel file unico della homepage tramite `scripts/bundle-home-css.mjs` per non aggiungere richieste bloccanti.

## Pubblicazione

- `assets/dialogue-3d.js` — scena WebGL originale e lifecycle.
- `assets/dialogue-sculpture.svg` — fallback statico originale.
- `assets/dialogue-3d.css` — layout e transizioni, compresi mobile, forced colors e reduced motion.
- `scripts/verify-immersion.mjs` — test di struttura e funzionalità minima, eseguito nel build.
- `assets/book.js` — notifica al controller 3D quando l'utente arresta le animazioni generali.
- La pipeline CMS ricostruisce `assets/agora-home.css` con hash e versiona la pagina.

## Criteri di accettazione

1. Homepage e collegamenti continuano a essere leggibili con JS disabilitato; non si introducono altre intestazioni H1.
2. La scena può essere avviata e fermata senza perdita di contenuti o focus, e non deve muovere oggetti se l'utente richiede movimento ridotto.
3. Il Magazine, i moduli, il libro sfogliabile, le campagne social e gli URL restano invariati.
4. Rifare PageSpeed mobile e desktop dopo la pubblicazione; confrontare anche CLS, LCP e Total Blocking Time, non soltanto il punteggio globale. In caso di regressioni importanti, disabilitare l'avvio automatico e mantenere il pulsante opt-in.
5. In futuro, espandere l'esperienza eventualmente ai **progetti**, con narrazioni per tappe e visualizzazioni interattive pertinenti, soltanto dopo test reali su device diversi.

## Fonti estetiche

Il testo fornito dall'utente cita Three.js, React Three Fiber, Drei, Blender, Spline, GSAP e siti di riferimento come Pasqua, Pear e Zoo. È un'indicazione di linguaggio visivo, **non una specifica che imponga di migrare l'intero sito** a quelle tecnologie. La scena e il materiale grafico sono originali.
