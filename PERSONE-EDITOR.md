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

## Aggiornamento 22 novembre 2026

L'atto costitutivo elenca sette fondatori storici. Per la sezione pubblica, su richiesta della Presidenza, il profilo di Federica Stefania Catalano non viene incluso nei dati pubblicati dal sito; la sua qualità storica di fondatrice resta documentata nell'atto costitutivo ufficiale senza essere attribuita a Silvia.

**Silvia Morreale** compare separatamente fra i collaboratori con il ruolo di **socia e consulente scientifica** su indicazione della Presidenza; non è fondatrice.

Per **Alessia Infantolino** e **Rossano Pio Fragale** il profilo riporta soltanto la qualifica storica di fondatori, senza presumere una carica nel Direttivo o un'iscrizione associativa attuale. Mancano informazioni certificate sull'elenco completo dei sei consiglieri indicati nei documenti assembleari del 19 novembre 2026.

### Fotografie identificabili

Il 22 novembre 2026 la Presidenza ha identificato nelle due immagini originali ricevute Mario Guarnera **a sinistra** e Gioele Pio Fragale **a destra**. I ritratti vanno caricati dall'editor con il consenso della persona e con l'interruttore `photoApproved` attivo. Non confondere la foto di gruppo con la scheda individuale.

## Curriculum individuali e pubblicazione (22/11/2026)

Il CMS dispone di un campo **Curriculum pubblico (solo PDF)** con caricamento nel repository `assets/cv/`, interruttore **Curriculum approvato per il sito pubblico** e data di aggiornamento. La pagina individuale e la scheda di riepilogo mostrano il collegamento soltanto quando esiste il PDF e l'approvazione è attiva. Il test di build controlla che il file sia un PDF valido.

Alla verifica di Drive e delle email del 22/11/2026, è stato trovato un CV individuale di Gioele Pio Fragale; ne è stata prodotta una versione pubblica derivata dal documento dell'interessato, senza telefono, email privata e firma. Per Mario Guarnera, Benedetta Spampinato, Paolo Putrino, Silvia Morreale, Alessia Infantolino e Rossano Pio Fragale non risultava disponibile un CV individuale identificato con sufficiente certezza. Le loro schede attendono i rispettivi PDF approvati: NON attribuire loro titoli inventati e NON sostituire un dossier interno con un CV personale.


## Aggiornamento coordinato del 22 novembre 2026
Sono state ricevute le fotografie e le identificazioni di Benedetta Spampinato, Paolo Putrino, Rossano Pio Fragale, Alessia Infantolino; ritratti di Mario Guarnera e Gioele Pio Fragale già pubblicati. Per Silvia Morreale nessuna fotografia è stata associata con sufficiente certezza: mantenere il monogramma, senza usare immagini di altre persone. Il collegamento al curriculum (dove effettivamente esiste) compare **solo in piccolo alla fine** del profilo, non nella scheda principale.

La presentazione delle persone privilegia: identità professionale, percorso e studi documentati, contributo specifico all'APS, pubblicazioni e progetti attribuibili. I dati sono modificabili nel CMS nei campi `specialty`, `bio`, `education`, `contribution`, `projects`, `links`. La presenza come socio fondatore non implica automaticamente l'incarico di consigliere in carica. Prima di aggiornare cariche, tesoreria o segreteria confrontare le delibere sottoscritte e il RUNTS.

Foto originali: file dell'utente del 22/11/2026; i ritagli sono fotografie autentiche senza generazione artificiale dei volti.
