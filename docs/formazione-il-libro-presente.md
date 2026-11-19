# Il libro presente — percorso audiovisivo Agorà APS

Questo catalogo separa la disponibilità degli originali, le pagine pubbliche di presentazione e il portale riservato.

| Capitolo | Video originale | Durata | Accesso sul sito | Drive istituzionale |
|---|---|---:|---|---|
| I | `libro-presente-capitolo-1.mp4` | 2:52 | `/soci/il-libro-presente/capitolo-1/` | `1lzF7DqVO67rqVvyudT9Ze4xbA4Sxvg2G` |
| II | `libro-presente-capitolo-2.mp4` | 2:38 | `/soci/il-libro-presente/capitolo-2/` | `1N1TLEByDJ9iqqXIHZFViioUVuOc4EGYG` |

Pagina di presentazione: `/formazione/il-libro-presente/`; riepilogo su `/formazione/`.

## Misure di accesso
- URL `/soci/*` serviti dal Worker dopo verifica Cloudflare Access con allowlist di email autorizzate. Configurazione assente = accesso bloccato.
- I video sono nel Drive dell'associazione e restano soggetti a un secondo livello di autorizzazione. L'iframe `drive.google.com/file/d/.../preview` non disattiva i permessi del file.
- Perché il video sia riproducibile da ciascun socio, autorizzare individualmente la sua email nella condivisione Drive e assicurarsi che possa aprire il file. Non rendere i video pubblici indiscriminatamente.
- Non esiste ancora un sistema di registrazione presenze/certificazioni operativo. Le lezioni non possono essere segnate come superate o usate per generare attestati automatici.
- Il Capitolo II è catalogato **solo nella Formazione**; nessuna pubblicazione social è programmata.

## Checklist
1. Configurare `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD` e `AGORA_MEMBER_EMAILS` senza registrarli nel repository.
2. Configurare policy Cloudflare Access `/soci/*` coerenti con la stessa allowlist.
3. Condividere ciascun video Drive esclusivamente con gli account soci autorizzati.
4. Verificare in produzione l'accesso del socio, la pagina Capitolo II, il player e il blocco per ospiti non autorizzati.
