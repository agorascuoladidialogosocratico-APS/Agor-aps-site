# Editor del sito Agorà APS

## Accesso

Apri `https://app.pagescms.org/`, accedi con l'account GitHub `agorascuoladidialogosocratico-APS` e autorizza Pages CMS a utilizzare il repository `Agor-aps-site`. Per impostazione di sicurezza seleziona solo questo repository. L'editor legge `.pages.yml`.

Puoi anche aprire `/editor/` sul dominio del sito per trovare i collegamenti e un'anteprima. La vera interfaccia di modifica con autenticazione è Pages CMS.

## Modifiche disponibili

- **Identità, logo e colori**: logo, palette esadecimale, titolo e metadati.
- **Homepage**: titolo, descrizioni, bottoni, fotografia, didascalie e valori.
- **Progetti**: modifica/aggiungi/elimina/riordina le schede dei progetti; personalizza DiscoverEU.
- **Metodo**: testo filosofico, manifesto, strumenti ed esperienze.
- **Chi siamo, Trasparenza, Contatti**: aggiornamenti istituzionali.
- **Nuove sezioni**: aggiungi blocchi personalizzati con titolo, testo, immagine e pulsante.
- **Ordine e visibilità**: riordina le sezioni e attiva/disattiva i blocchi.

## Salvataggio e pubblicazione

Salvando su Pages CMS, il contenuto JSON viene aggiornato direttamente su GitHub con cronologia delle versioni. Se il Worker Cloudflare `agor-aps-site` è collegato via GitHub al branch `main`, un salvataggio su quel ramo può avviare il deploy automatico tramite Cloudflare Workers Builds. Controlla sempre l'esito del deploy nella dashboard Cloudflare; l'editor non pubblica direttamente sul dominio.

**Nota**: per ora l'editor non modifica liberamente il codice, la struttura CSS o l'impaginazione al pixel. Queste modifiche continuano a richiedere sviluppo.

## Sicurezza

Non inserire password o token GitHub nel sito o nel repository. Le modifiche sono autorizzate dalla piattaforma Pages CMS tramite l'accesso GitHub. La pagina `/editor/` è una schermata pubblica di orientamento: non contiene credenziali né endpoint di modifica. Il repository è attualmente pubblico: evita di caricare materiali interni o fotografie prive di consenso.

## Test

Apri il sito e verifica: logo, tutte le immagini, navigazione, dettagli progetto, 320/390/1440 px, aggiunta/rimozione di un progetto, cambio colore e modifica testo. Verifica il deploy di Cloudflare Workers Builds e l'eventuale collegamento del dominio personalizzato, se configurati.