# Ottoteca — note per lo sviluppo

- Sito statico in `app/`, nessun bundler. Moduli: `js/app.js` (UI e stato), `db.js` (IndexedDB: docs, files, cats, passes), `pdf.js` (pdf.js), `codes.js` (zxing + codici di prenotazione), `otto.js` (mascotte SVG e animazioni), `i18n.js`.
- Le cartelle sono il negozio `cats` con `parent` (null = radice); un documento ha `cats: [id…]`.
- Testi: aggiungi la chiave in `app/i18n/en.json` e in **tutte** le altre lingue, poi `npm run check`.
- Dopo ogni modifica: `npm test` (rigenera `app/sw.js`; deve finire con «Tutto ok», axe senza violazioni).
- Animazioni: sempre dentro le regole di `prefers-reduced-motion` / `data-motion` già in `app.css`.
- Mascotte: lontra. Non usare conigli, ricci, capibara, suricati, polpi (già usati in altre app).
