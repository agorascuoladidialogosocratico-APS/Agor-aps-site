# Ottimizzazione PageSpeed — 12 novembre 2026

## Report di partenza (Google PageSpeed Insights)

- **Mobile**: Performance 98/100, Accessibilità 100, Best Practices 100, SEO 100. LCP 1,1 s; FCP 1,1 s; TBT 20 ms; CLS 0. Opportunità: caricamento CSS (risparmio stimato 430 ms), consegna immagini (~425 KiB), forced reflow su `assets/book.js:82` (~110 ms).
- **Desktop**: Performance 100/100, Accessibilità 100, Best Practices 100, SEO 100. LCP 0,5 s; FCP 0,3 s; TBT 0 ms; CLS 0. Opportunità: immagini (~216 KiB), CSS (~80 ms), LCP caricato con lazy loading.
- Entrambi i report indicano **No Data** per le misure reali degli utenti. I punteggi sono misure di laboratorio, non una garanzia futura né una misura delle visite organiche.

## Modifiche del sito

1. **Un unico CSS bloccante in homepage**: `scripts/bundle-home-css.mjs` concatena nell'ordine originale i sei fogli CSS, preservando la cascata, le impostazioni di accessibilità e i riferimenti ai font. Usa un hash SHA-256 nel parametro URL per invalidare la cache quando cambia il contenuto.
2. **Immagini**: `scripts/optimize-home-images.py` ricomprime solo le dodici varianti WebP delle fotografie homepage presenti in `assets/`, mantenendone dimensioni/crop e accettando esclusivamente risparmi materiali con errore medio RGB controllato. Non tocca le copertine del Magazine. La procedura è idempotente tramite `assets/image-optimization-manifest.json`. Crea una versione WebP ridimensionata del logo per l'intestazione, lasciando invariato il PNG originale e le sue altre funzioni.
3. **Immagini responsive**: la fotografia `agora_dialogo.webp` priva di `srcset` lo riceve, insieme a `sizes`, per non costringere gli schermi piccoli a scaricare l'immagine piena.
4. **LCP**: la prima immagine della galleria iniziale, segnalata nel report desktop, usa `loading=eager` e `fetchpriority=high`; le fotografie fuori schermo mantengono `loading=lazy`. Dimensioni HTML e testi alternativi restano invariati.
5. **JavaScript**: `assets/book.js` non legge più sincronicamente l'altezza dello stage nell'inizializzazione senza animazioni. Le misurazioni necessarie durante una vera animazione restano attive.
6. **Controlli**: `scripts/verify-performance.mjs` assicura che CSS, immagini, priorità LCP e manifest rimangano coerenti; la pipeline GitHub lo esegue prima di pubblicare.

## Verifica e limiti

Le stime di risparmio sono **opportunità fornite da Google, non guadagni effettivi già misurati**. Dopo il deploy occorre rieseguire PageSpeed Insights su **mobile e desktop**: un punteggio precedentemente 98/100 non garantisce che la misura successiva salga o rimanga invariata. Occorre inoltre verificare visivamente le immagini, il menu, lo sfoglio, la tastiera e le preferenze di movimento ridotto.

L'intervento non modifica le informazioni dell'associazione, i contenuti editoriali, le licenze delle copertine, il sistema social Buffer, l'accessibilità deliberata o i riferimenti del CMS.
