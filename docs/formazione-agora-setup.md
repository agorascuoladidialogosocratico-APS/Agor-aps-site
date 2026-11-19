# Agorà | Accademia del Dialogo — impostazione 19/11/2026

## Obiettivo
Aprire `/formazione/` come pagina pubblica e `/soci/` come portale realmente riservato. Tutti i contenuti individuali (identità, registro soci, risultati, attestati) devono rimanere fuori dal repository pubblico. Le URL preesistenti e il menu esistente non vengono spostati.

## Architettura di accesso
- Cloudflare Zero Trust Access protegge `/soci/*` con OTP email/SSO; non memorizzare password nel codice o nelle pagine statiche.
- Il Worker verifica anche autonomamente il JWT firmato da Cloudflare Access, `aud`, emittente e scadenza. Se manca una configurazione, una firma o un'email ammessa, risponde chiuso.
- Configurare variabile `CF_ACCESS_TEAM_DOMAIN=https://<nome-team>.cloudflareaccess.com` e secret `CF_ACCESS_AUD` dell'applicazione Access.
- Inserire gli indirizzi dei soci autorizzati soltanto in `AGORA_MEMBER_EMAILS` come secret/variabile privata, separati da virgole; NON nel repository. Configurare la policy Cloudflare Access coerente con tale allowlist.
- In futuro sostituire la lista temporanea con un registro soci D1/KV approvato dal direttivo, con scadenze e permessi granulari.
- Applicare permessi: `socio`, `docente`, `segreteria`, `amministratore` e revoca al venir meno del requisito associativo.

## Percorsi proposti
1. Fondamenti di filosofia e storia delle idee.
2. Dialogo socratico e facilitazione filosofica.
3. Logica, argomentazione e pensiero critico.
4. Etica applicata e cittadinanza democratica.
5. Pratiche filosofiche e dialogo nei contesti educativi.

Catalogo, docenti, ore, programma, prove e quote sono **proposte**, non ancora corsi approvati.

## Attestati e verificabilità
Il portale in questa fase NON emette attestati. Prima del rilascio: approvazione dei percorsi e criteri dal direttivo, registro presenze, prove e verbali finali, modello PDF, numero univoco, firma autorizzata e verifica pubblica con soli dati indispensabili e corretta informativa GDPR. Indicare **«Attestato di frequenza»** o **«Attestato di profitto»** se supportato dai registri e dagli esiti. Non utilizzare «certificazione professionale accreditata», «qualifica riconosciuta», «crediti universitari» o formule equivalenti senza titolo/autorizzazione specifici.

## Media editoriali
Il reel `libro-presente-reel.mp4` è destinato a Instagram/Facebook e al sito. Il file `libro-presente-capitolo-1.mp4` è destinato **solo al sito**. I file originali sono archiviati nel Drive Agorà ma non sono URL video pubblici adatti a Buffer. Conservare bozza `content/magazine/il-libro-presente.json` con `published:false` finché le sorgenti MP4 non sono pubblicate su hosting video idoneo, accessibili senza login e collaudate. Non inviare ad Instagram come semplice post fotografico: usare `assets.video` e `metadata.instagram.type=reel` nelle API Buffer.

## Collaudo prima dell'attivazione
1. Senza JWT `/soci/` deve rispondere 401 o, prima della configurazione, 503.
2. JWT invalido, altro audience, firma falsa, email non abilitata devono rispondere 403.
3. Solo un socio valido, in possesso di un JWT Access verificato, visualizza la pagina privata.
4. Le risposte riservate sono `no-store`, `noindex` e non mostrano dati personali nei log.
5. Nessun PDF o elenco nominativo deve essere nel repository statico.
6. Verificare link e riproduzione su browser mobile prima di abilitare contenuti o pubblicazione social.
