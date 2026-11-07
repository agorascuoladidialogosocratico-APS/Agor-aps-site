# Agorà — una piazza aperta

## Direzione

Un'associazione di persone che pensano insieme: fotografie autentiche, parole leggibili e una composizione aperta. Conservare il logo ufficiale e l'identità cromatica già scelta. La fotografia collettiva, non un ornamento classico, è il centro visivo.

## Sistema

- Petrolio `#193b4a`: testo, navigazione e superfici istituzionali.
- Carta `#fffaf5`: fondo principale.
- Avorio `#f8f0e6`: raccordi tra sezioni.
- Terracotta `#b85628`: azioni e piccoli accenti.
- Salvia `#e5ebe6`: progetti e metodo.
- Oro `#efbb82`: accenti sulle superfici scure.
- Newsreader: titoli e citazioni. DM Sans: testi, navigazione, comandi. Font locali, senza richieste a servizi esterni.
- Contenitore massimo 1320 px, margini fluidi; testo allineato a sinistra, righe inferiori a 72 caratteri.

## Composizione e interazione

Hero a due colonne: titolo naturale e foto di gruppo senza tagli dei volti. Didascalia come parte del racconto. Su mobile, testo e fotografia in sequenza, pulsanti comodamente raggiungibili.

Progetti con gerarchia distinta: una storia fotografica principale, due approfondimenti più brevi. Metodo con foto panoramica e punti di pratica. Associazione, trasparenza e contatti hanno layout propri senza ripetere una griglia di schede identiche.

Un solo gesto grafico riconoscibile: il bordo aperto e arrotondato delle fotografie. Niente animazioni automatiche ripetute, grandi glifi decorativi o titoli con una sola parola colorata.

Navigazione mobile con etichetta visibile, stato accessibile, chiusura con Escape e gestione del focus. Link e pulsanti con area interattiva minima di 44 px. Nessuna informazione affidata al solo colore.

## Fonte del metodo

Applicare la skill [Frontend Design, Anthropic](https://github.com/anthropics/skills/tree/main/skills/frontend-design), letta al blob `a5333457c414d20d625f307df945842c0952ecc3`. Revisione del piano: il sito precedente usa già avorio, serif e terracotta; mantenere questa identità, ma eliminare i titoli spezzati artificialmente, gli accenti corsivi sistematici e le foto verticali ricavate da scatti di gruppo orizzontali.

## Verifica

Collaudare a 320, 375, 390, 768, 1024 e 1440 px; controllare overflow reale, menu da tastiera, immagini caricate, link interni, contenuti CMS e movimento ridotto. Pubblicare lo stesso codice verificato in anteprima.

## Revisione: il libro animato di Agorà

Il sito diventa un libro illustrato da sfogliare, con sei capitoli: copertina,
associazione, dialogo, progetti, trasparenza e partecipazione. Ogni doppia pagina
ha un messaggio principale, un'illustrazione o una fotografia reale e un invito
chiaro. L'indice e i tre collegamenti rapidi permettono di saltare il racconto.

Carta avorio, coperta verde salvia e inchiostro petrolio riprendono l'identità
Agorà. Le illustrazioni sono SVG originali, leggere e scalabili: un piccolo
teatro di carta per la copertina e una lettera per i contatti. Le fotografie
restano testimonianze delle persone e dei viaggi. Non si aggiungono librerie.

Il cambio pagina usa una piega tridimensionale della carta; gli elementi
illustrati si aprono come in un libro pop-up. Non c'è avanzamento automatico.
Il comando per fermare le animazioni salva solo la preferenza nel browser.
La preferenza di sistema `prefers-reduced-motion` elimina tutti i movimenti.

Su telefono ogni doppia pagina diventa un capitolo verticale; la copertina
mostra titolo e pulsante prima dell'illustrazione. Tutti i collegamenti sono
ancore reali, la cronologia del browser funziona e il contenuto resta leggibile
senza JavaScript. Il focus segue il titolo del capitolo, i tasti freccia
funzionano fuori dai controlli e l'indice si chiude con Escape. I progetti e
gli approfondimenti usano `details`/`summary` nativi.

I campi editoriali continuano a provenire dai JSON. L'ordine e la visibilità
dei capitoli seguono `content/layout.json`; i blocchi secondari restano nel
capitolo pertinente. L'editor e la pagina 404 conservano il proprio foglio stile.

Verifica finale: 36 combinazioni (6 capitoli × 320, 375, 390, 768, 1024,
1440 px), senza scorrimento orizzontale, immagini mancanti o capitoli multipli
visibili. Verificati apertura dei progetti, indice/Escape, navigazione da tastiera,
cronologia avanti/indietro, ritorno alla copertina e arresto delle animazioni.
Controlli statici dei contenuti, riferimenti ARIA e deploy Worker superati.

## Fluidità e opportunità formative

Lo sfoglio usa Web Animations per poter annullare in modo pulito una transizione
quando il visitatore sceglie subito un altro capitolo. Il cambio di altezza del
libro viene accompagnato da una transizione breve; sui telefoni si evita la
rotazione 3D e si privilegia l'entrata morbida del contenuto. La pagina non viene
più riportata istantaneamente in alto ad ogni clic. La cronologia ha un solo
punto di gestione e la pausa ferma anche le animazioni avviate da JavaScript.

Due capitoli rendono visibili i percorsi universitari e il volontariato ESC.
La convenzione attiva con Ca' Foscari è confermata dal Settore Tirocini il
28 settembre 2026. Per UniMe e UniDaV sono stati reperiti moduli e richieste:
non vengono presentati come accordi già perfezionati. Il Marchio di Qualità ESC
di Agorà, comunicato il 30 luglio 2026 con riferimento
2026-1-IT03-ESC50-QLA-000469866, viene presentato nel ruolo di sostegno.
Le fonti amministrative complete restano private: il sito mostra soltanto
le informazioni utili ai visitatori e i recapiti ufficiali dell'associazione.

Le fotografie aggiunte alle nuove pagine provengono dagli asset già pubblicati
di Agorà e sono modificabili nel CMS. Ulteriori fotografie saranno integrate
quando l'associazione le fornirà.

Verificati 48 casi responsive (8 capitoli × 6 larghezze da 320 a 1440 px),
con un solo capitolo visibile, senza overflow o immagini mancanti. Verificati
sfoglio rapido, ritorno alla copertina, pausa con cancellazione della transizione
e apertura dei dettagli dei percorsi. Check editoriali, sintassi JavaScript,
riferimenti ARIA e dry run del deploy superati.
