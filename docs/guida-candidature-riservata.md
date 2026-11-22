# Guida candidature riservata

Il libro è nella PR #52. Il percorso di produzione previsto è `/guida-candidature/` sul dominio Agorà. Configurazione e collaudo vanno svolti prima del rilascio.

## Catalogo al 22 novembre 2026

Il catalogo contiene 70 annunci identificabili. Sono 49 in Sicilia, 19 in Lombardia, uno in Emilia-Romagna e uno da remoto dall’Italia. Le schede fuori Sicilia indicano la presenza richiesta. Quattro annunci indicano un indirizzo email per candidarsi. Il Worker prepara oggetto e CV testuale dopo l’accesso e l’invio resta manuale.

L’annuncio è stato letto sulla pagina specifica del selezionatore o sul canale pubblicato dall’azienda. Il controllo usa il pulsante o il modulo disponibile, oppure l’invito esplicito a inviare il CV all’indirizzo indicato, e la data di chiusura quando pubblicata. Le posizioni con sede o stato incongruenti e le copie della stessa ricerca sono escluse. Ricerche distinte per sedi effettivamente diverse hanno ciascuna una scheda. Quando un’agenzia omette il nome del cliente, la scheda dichiara l’agenzia e l’assenza del nominativo. Le informazioni riflettono la data di controllo. Il candidato deve verificare la compatibilità di qualifiche, trasferte, lingua, turni ed eventuali abilitazioni con la propria situazione.

## Access e dati privati

1. Crea un’applicazione Cloudflare Access self-hosted dedicata al percorso `/guida-candidature*`. Usa una policy **Allow** con i soli indirizzi individuali autorizzati e un metodo di login individuale, per esempio un PIN monouso. L’applicazione deve passare al Worker l’header `Cf-Access-Jwt-Assertion`.
2. Configura i valori di produzione tramite Cloudflare. Conserva i dati personali nei secrets del Worker. Usa `CF_ACCESS_TEAM_DOMAIN` per l’issuer e `AGORA_CANDIDATE_ACCESS_AUD` per l’audience di questa applicazione. Imposta `AGORA_CANDIDATE_EMAILS` con gli indirizzi individuali autorizzati. L’area soci usa una propria audience e una propria lista.
3. Imposta `AGORA_CANDIDATE_HOST` con il solo host di produzione, senza schema o percorso. Carica `AGORA_CANDIDATE_NAME`, `AGORA_CANDIDATE_CV_TEXT`, `AGORA_CANDIDATE_CONTACT_EMAIL`, `AGORA_CANDIDATE_CONTACT_PHONE` e `AGORA_CANDIDATE_CREDIT` come secrets. La dicitura di attribuzione va copiata integralmente dal mandato. Per il CV testuale usa il documento originale e ometti indirizzo domestico e data di nascita.
4. In un ambiente di collaudo protetto, controlla che la richiesta anonima arrivi al login o sia rifiutata, che l’account estraneo resti bloccato e che l’account autorizzato possa leggere il libro. Verifica anche i percorsi con e senza slash, le anteprime, la cache, l’assenza del profilo nei file pubblici e il funzionamento dell’area soci.
5. Imposta `AGORA_CANDIDATE_ENABLED=true` per il rilascio solo dopo aver verificato Access e i dati privati. Con il flag assente il Worker risponde 503. Gli host diversi da quello autorizzato sono respinti prima della lettura dei dati. Verifica nuovamente l’accesso sul dominio di produzione e completa un test su smartphone con l’account abilitato.

Il Worker verifica firma JWT Cloudflare Access, scadenza, audience e identità. Le risposte della guida richiedono `no-store` e `noindex` e usano una Content Security Policy con nonce. Il browser salva solo gli identificativi delle schede spuntate. Le email si aprono nell’app di posta. L’utente decide se inviarle. I dati del candidato non vanno inclusi nei test, nei file pubblici o in output di compilazione.
