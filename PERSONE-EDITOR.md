# Schede personali · Agorà APS

La sezione pubblica è /chi-siamo/. Ogni persona ha un indirizzo del tipo /chi-siamo/nome-cognome/.

**Modifica dal CMS:** apri la raccolta «04 · Direttivo e incarichi (verificare RUNTS)». I dati sono in content/governance.json.

- Direttivo: rispetta gli incarichi documentati e verifica eventuali variazioni al RUNTS.
- Collaboratori: usa il campo dedicato, senza attribuire cariche sociali non ricoperte.
- Fondatori: seleziona «Fondatore» soltanto per chi compare nell'atto costitutivo. La sezione appare quando è presente almeno un profilo pubblicato con questo attributo.
- Scheda: nome, incarico, URL (slug minuscolo con trattini), sommario, biografia, progetti documentati, collegamenti autorizzati.
- Fotografìe: aggiungi il ritratto e attiva il permesso di pubblicazione solo dopo il consenso. Prima, si mostra un monogramma grafico; non viene generata alcuna faccia.
- Interruttore «Profilo visibile»: disattivalo per non produrre una scheda pubblica.
- Non modificare gli slug di URL già pubblici senza prevedere un reindirizzamento.
- Non pubblicare email o contatti personali senza autorizzazione.

Per rigenerare il sito: npm run build:content. Il workflow GitHub publish-cms.yml ripubblica automaticamente le pagine derivate dal CMS su main.

Le fotografie andranno caricate individualmente da Pages CMS e associate al profilo corretto.
