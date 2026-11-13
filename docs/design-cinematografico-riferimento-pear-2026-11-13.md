# Agorà APS — Direzione cinematografica della homepage

**Riferimento fornito dall'utente:** reel Instagram `Dci-Pn-vvnH`, con registrazione schermo del 13/11/2026. Il sito rappresentato è **Pear (pear.no)**.

## Analisi del riferimento

Il reel documenta una landing page dall'impostazione teatrale, non una piccola sezione 3D: fondale blu cobalto saturo, personaggi ispirati alla pittura classica, drappeggi, frutti e architetture, titoli serif monumentali, scritte tecniche sottili, inquadrature full-screen e sequenze narrative con movimenti guidati dallo scroll. Il video **non** dimostra necessariamente l'uso di una specifica libreria (Three.js, R3F, GSAP): la tecnologia non si deduce dalle sole immagini.

## Interpretazione originale per Agorà

- **Atto 01 — La domanda:** due personaggi storici di Raffaello, Platone e Aristotele, con fondale blu cobalto, sipario e basamento originali in SVG. Titolo «Le domande aprono mondi».
- **Atto 02 — Coltivare:** un ulivo simbolico originale con frutti dorati, metafora mediterranea della cura per il pensiero. Titolo «Le idee si coltivano».
- **Atto 03 — Piazza:** architettura classica originale e frammento di manifesto sul dialogo. Titolo «La filosofia è di tutti».
- Tutte le scene includono contenuti HTML reali, CTA alle pagine esistenti e un'opzione per saltare l'esperienza.
- Desktop: tre quadri a schermo intero con avanzamento naturale da scroll, parallax a più profondità e passaggi dissolvenza; nessuna scroll hijacking.
- Mobile, dispositivi con risparmio dati e preferenze di movimento ridotto: scene lineari e statiche con scroll normale.
- I contenuti del Magazine, i moduli, i progetti Erasmus+, il vecchio libro interattivo e la programmazione Buffer restano intatti sotto l'esperienza principale.

## Diritti e crediti delle immagini

Le **figure di Platone e Aristotele** provengono da estratti di *La Scuola di Atene* di Raffaello Sanzio (1509–1511). L'opera è di **pubblico dominio** ed è marcata Public Domain Mark su Wikimedia Commons; gli estratti digitali sono:

- Platone — https://commons.wikimedia.org/wiki/File:The_School_of_Athens,_Plato.png
- Aristotele — https://commons.wikimedia.org/wiki/File:The_School_of_Athens,_Aristotle.png
- Public Domain Mark — https://creativecommons.org/publicdomain/mark/1.0/

Il sito mostra i crediti e i link alle fonti nel primo quadro. In build, `scripts/cache-cinematic-art.mjs` tenta di salvare localmente gli originali validi per ridurre dipendenza e trasferimenti a servizi terzi: se la richiesta non va a buon fine mantiene l'URL di Wikimedia, senza attribuire un successo inesistente. Non sono state copiate le fotografie, le illustrazioni o l'identità grafica proprietaria di Pear.

Le scenografie aggiunte da Agorà (`cinema-curtain.svg`, `cinema-olive-tree.svg`, `cinema-columns.svg`) sono disegni originali; hanno un'identità autonoma e non sono ricalchi del sito di riferimento.

## Test e miglioramenti

La pipeline verifica: presenza e sequenza delle tre scene, link, attribuzioni, fallback senza motion, un solo CSS e presenza dell'intero libro storico. Dopo la pubblicazione testare su Safari iOS, Chrome Android e desktop e ripetere Lighthouse/PageSpeed; non promettere il mantenimento automatico del precedente 98–100, perché si tratta di un nuovo carico visivo significativo.

**La corrispondenza con Pear è di art direction e forma narrativa, non di riproduzione pixel-perfect o di copia delle risorse visive originali.**
