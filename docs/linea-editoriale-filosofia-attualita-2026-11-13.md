# Agorà Magazine — filosofia del vissuto e attualità

**Data redazionale:** 13 novembre 2026 · **Responsabilità editoriale:** Redazione Agorà APS

## Criterio di selezione

I nuovi contenuti reinterpretano **idee editoriali e materiali didattici dell'associazione**, non trascrivono documenti riservati o opere terze. Non attribuire a Gioele Pio Fragale o ad altri firmatari parole generate/redatte successivamente. I testi originali di autori terzi e i file personali rimangono nel Drive, non nel sito. Evitare comunicazioni interne, dati sensibili o di minori, rendicontazioni, liberatorie, email e accordi non pubblicati.

## I cinque editoriali e le fonti

| Articolo | Materiale Agorà di riferimento | Verifica pubblica esterna |
| --- | --- | --- |
| L'AI risponde. Ma chi decide? | Scheda di sintesi «Consulenza filosofica tra Intelligenza Artigianale e AI», quattro principi Agorà | UNESCO, «AI Answers. You Decide», 10/11/2026; Commissione UE, AI Act |
| Il feed è la nuova piazza? | Principio «informazione che non ti forma, ma ti informa», dialogo e pensiero critico | Commissione UE, DSA: consultazione sulle linee guida elettorali novembre 2026, registri pubblicitari 04/11/2026 |
| Essere invitati non significa poter partecipare | Restituzione formativa inclusione e diversità, 10/11/2026 | Nessuna notizia inventata: commento filosofico e pedagogico |
| Essere cittadini: obbedire, partecipare, dissentire | Bozza di dialogo cittadino–tiranno, potere «di»/«su» | Nessuna citazione falsa di Socrate: testo editoriale autonomo |
| Viaggiare non basta: bisogna imparare a guardare | «Odisseo Philosophorum — Attraversare il mondo. Interrogare la realtà» | Non dichiarare pubblicato il podcast o rilasciate testimonianze |

## Produzione visual

- `scripts/generate-editorial-social.mjs` produce **40 SVG originali** (5 copertine, 25 slide verticali 1080×1350, 10 storie 1080×1920). La build CMS li converte in PNG.
- Non utilizzare fotografie di persone, mappe proprietarie, simboli protetti o immagini esterne. Credito di ciascuna cover: «Agorà APS — illustrazione editoriale originale (2026)» con link al corrispondente SVG e condizioni d'uso.
- Il Magazine continua a mostrare una copertina distinta per ciascun articolo. Le infografiche sono pubblicate come asset statici, ma il feed editoriale principale mostra soltanto la cover.

## Programmazione e responsabilità

- **Serie storica già attiva:** 23 articoli, 13 novembre–5 dicembre 2026 ore 11:00, una pubblicazione al giorno.
- **Nuova serie:** 6–10 dicembre 2026, ore 11:00 Europe/Rome, un articolo al giorno; non anticiparla né sovrapporla all'archivio.
- Facebook: un post con copertina, riassunto e collegamento.
- Instagram: **carosello a 5 immagini** via Buffer quando gli account e il piano lo permettono.
- X: soltanto se un canale è collegato e verificato; opzionale.
- Instagram Stories: prima creatività 9:16 inviata come **storia separata**, in modalità automatica se il canale e l'API la supportano. La seconda è un asset pronto per un eventuale secondo frame manuale. Una notifica o un errore Buffer non equivale a una pubblicazione avvenuta.
- `data/buffer-posts.json` conserva gli ID Buffer e impedisce il doppio invio; anche le storie usano una chiave separata `slug-storia`.
- In caso di errore sulle storie non bloccare i post principali e segnalare l'esito, senza dichiarare successi non verificati.

## Controlli prima e dopo il deploy

`node scripts/generate-editorial-social.mjs` produce gli SVG; CairoSVG crea i PNG; `node scripts/verify-editorial-social.mjs` verifica dimensioni e presenza, oltre al calendario e alla corretta attribuzione. La pipeline ripubblica le pagine prima che le immagini siano utilizzate dai social.

**Etica editoriale:** distinguere fatti pubblici citati, interpretazioni e materiali progettuali; non presentare idee di progetto come attività realizzate o podcast già pubblicati. Il presente documento descrive il processo e non costituisce una liberatoria per materiali di terzi.
