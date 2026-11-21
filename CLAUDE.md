# Ottoteca — note per lo sviluppo

- Sito statico in `app/`, nessun bundler. Moduli: `js/app.js` (UI e stato), `db.js` (IndexedDB: docs, files, cats, passes), `pdf.js` (pdf.js), `codes.js` (zxing + codici di prenotazione), `otto.js` (mascotte SVG e animazioni), `i18n.js`.
- Le cartelle sono il negozio `cats` con `parent` (null = radice); un documento ha `cats: [id…]`.
- PDF del dispositivo: negozio `roots` (handle di cartelle scelte con `showDirectoryPicker`). I documenti con `src: "fs"` hanno `handle`, `rootId`, `path` e NON sono copiati: si leggono con `getBlob(d)`. Ogni avvio ricontrolla le cartelle (permesso già dato) e aggiunge/toglie i PDF; le cartelle virtuali create hanno `rootId`. Dove l'API manca (iOS, Firefox) si copia nel database.
- Icone: font `Ottoteca Icons`. Disegni in `tools/icon-src.py` → `python3 tools/icon-src.py && python3 tools/build-icons.py` (serve `pip install picosvg skia-pathops fonttools brotli`). Uso: `<span class="ic ic-nome" aria-hidden="true">`.
- Testi: aggiungi la chiave in `app/i18n/en.json` e in **tutte** le altre lingue, poi `npm run check`.
- Dopo ogni modifica: `npm test` (rigenera `app/sw.js`; deve finire con «Tutto ok», axe senza violazioni).
- Stile pop in cel shading: contorni `--ink`, ombre nette (`--shadow`), gradienti `--grad`. Sfondo = habitat di Otto (`js/habitat.js`: cielo, sole/luna, nuvole, farfalle, colline fiorite, fiume con ninfee; di notte stelle e lucciole). Icone app: `node tools/icons.mjs` (dalla mascotte).
- Animazioni: sempre dentro le regole di `prefers-reduced-motion` / `data-motion` già in `app.css`.
- Mascotte: lontra. Non usare conigli, ricci, capibara, suricati, polpi (già usati in altre app).
