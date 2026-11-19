# Il libro presente — anteprima, adesione e Capitolo I esteso

Aggiornamento editoriale del 19 novembre 2026: il video consegnato con il nome `libro-presente-capitolo-2.mp4` **non è il Capitolo II**. È un video di presentazione breve per invitare le persone a conoscere e ad aderire ad Agorà APS.

## Materiali e destinazioni

| Risorsa | Durata | Funzione aggiornata | Stato |
|---|---|---|---|
| Video consegnato come `libro-presente-capitolo-2.mp4`; ora rinominato su Drive `Agorà - Il libro presente - Anteprima per adesione (2m38s).mp4` | 2:38 | **Anteprima promozionale** per la pagina `/formazione/il-libro-presente/` | In Drive, condivisione esterna da abilitare |
| Video precedente `libro-presente-capitolo-1.mp4` | 2:52 | Materiale breve preesistente; **non è** la futura versione integrale | Conservato in Drive, non promosso come integrale |
| **Capitolo I esteso** | Da determinare | Video integrale per soci ammessi e autorizzati | **Ancora in produzione; file non consegnato** |

Drive anteprima: `1N1TLEByDJ9iqqXIHZFViioUVuOc4EGYG`.
Drive video precedente: `1lzF7DqVO67rqVvyudT9Ze4xbA4Sxvg2G`.

La pagina pubblica **non presenta più due capitoli** e ora descrive il flusso di adesione associativa. La pagina `/soci/il-libro-presente/` è solo una scheda informativa riservata, non mostra video integrali inesistenti. I vecchi percorsi `/soci/il-libro-presente/capitolo-1/` e `/soci/il-libro-presente/capitolo-2/` mantengono una risposta informativa, senza pubblicare file brevi come contenuti integrali.

## Procedura associativa

1. L'interessato **contatta la segreteria** tramite `/partecipa/`, `/contatti/` o email istituzionale, citando «Il libro presente».
2. La segreteria comunica i requisiti, valuta/gestisce la domanda secondo le regole dell'associazione e **conferma l'importo vigente** della quota.
3. L'interessato versa la quota via **bonifico bancario**, seguendo le coordinate già pubblicate in `/sostienici/#bonifico` e le indicazioni ricevute.
4. Solo dopo **ammissione, verifica del pagamento e attivazione individuale** la segreteria abilita l'accesso al materiale soci, una volta caricata la versione integrale.

L'adesione non viene descritta come una compravendita del video, e nessun bonifico attiva automaticamente credenziali o certificazioni.

## Limiti tecnici attuali e checklist

- Il video anteprima è privato nel Drive istituzionale: permessi consultati al momento del riordino, solo utente proprietario. La pagina pubblica non incorpora un player che rimarrebbe inutilizzabile per i visitatori.
- La pubblicazione visibile dell'anteprima richiede autorizzare la visualizzazione pubblica o scegliere un hosting video; va verificato che **solo l'anteprima**, non le lezioni integrali, sia pubblica.
- Autenticazione `/soci/*` richiede configurazione Cloudflare Access e secrets `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `AGORA_MEMBER_EMAILS`; se assenti il server nega accesso.
- Gli eventuali video integrali restano in Drive protetto e richiedono permessi di file allineati ai soci autorizzati.
- Non sono state attivate pubblicazioni social nuove né una quota numerica, poiché l'importo va verificato.
- Nessun contenuto di questa serie costituisce da solo attestazione o certificazione.

## Verifica editoriale prima del lancio

- [ ] Concordare e verificare l'importo attuale della quota associativa.
- [ ] Abilitare l'accesso pubblico **solo per il video di anteprima**.
- [ ] Incorporare il player pubblico dell'anteprima nella pagina Formazione.
- [ ] Ricevere il file definitivo del Capitolo I esteso e conservarlo con permessi privati.
- [ ] Configurare accesso soci, verifica iscrizione e controllo versamenti.
- [ ] Testare un socio autorizzato e un visitatore non autorizzato.
