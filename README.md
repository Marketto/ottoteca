# Ottoteca 🦦

PWA per tenere i PDF in ordine, con **Otto la lontra** come mascotte. Tutto resta sul dispositivo: niente account, niente server.

## Cosa fa

- **PDF del dispositivo**: «Trova i PDF nel dispositivo» collega una o più cartelle (es. Documenti); Ottoteca trova tutti i PDF dentro, anche nelle sottocartelle, **senza copiarli**, ne ricrea la struttura come cartelle e le ricontrolla a ogni apertura. Un sito non può leggere da solo tutto il telefono: serve la scelta della cartella (File System Access API, Chrome/Edge su computer e Android). Su Android non si possono scegliere la memoria intera e Download. Dove l'API manca (Safari/iOS, Firefox) si scelgono i PDF o una cartella e Ottoteca ne tiene una copia.
- **Tipi riconosciuti**: dal testo e dal nome Ottoteca riconosce fatture, scontrini, biglietti di viaggio (treni, voli, bus, traghetti) e biglietti per spettacoli/eventi; mette un simbolo sulla scheda e aggiunge i filtri «Fatture / Scontrini / Viaggi / Spettacoli». Il tipo si può correggere dal menu della scheda.
- **Libreria con miniature**: anche «Scegli i PDF», trascina e rilascia, «Apri con» e «Condividi» quando l'app è installata. Ricerca nel nome e nel testo delle prime pagine.
- **Tre viste**: *Griglia* (con filtro per cartella e ordinamento), *Per data* (gruppi Oggi / Ieri / giorno, con l'ora; per data di aggiunta o di apertura) e *Cartelle* (come un esplora risorse: percorso, sottocartelle, su di un livello, Backspace per risalire).
- **Cartelle virtuali**: un PDF può stare in più cartelle insieme, nessun file viene spostato. Si creano, rinominano, colorano e annidano; si trascinano i PDF sulle cartelle. «Importa cartella» ricrea la struttura delle cartelle del dispositivo.
- **Visore**: tutte le pagine, zoom (pulsanti, Ctrl+rotella, pizzico), miniature delle pagine, testo selezionabile e leggibile dai lettori di schermo, tastiera (PagSu/PagGiù, +/−, Esc).
- **Codici e portafoglio**: «Trova codici» legge QR, Aztec, PDF417, Data Matrix e codici a barre (zxing-cpp) e i codici di prenotazione nel testo (PNR, codice prenotazione… in molte lingue). Il portafoglio li ridisegna nitidi a schermo intero, tiene lo schermo acceso e li salva come immagine.
  - Apple Wallet e Google Wallet accettano solo pass **firmati dall'emittente** (certificato Apple / account emittente Google, lato server): un'app statica su GitHub Pages non può crearli. Se il PDF contiene il pulsante ufficiale «Aggiungi a Wallet», Ottoteca lo mostra.
- **Schiaccia PDF**: per i PDF oltre 5 MB l'app lo suggerisce (badge, Otto e un avviso); il pulsante «Comprimi» è sempre nel visore e nel menu.
- **Otto**: sbatte gli occhi, galleggia, salta, festeggia con coriandoli, si addormenta se non lo tocchi, e dice frasi motivazionali (12) e commenti a ogni azione.
- **37 lingue**: tutte le europee + russo, coreano, giapponese, cinese e arabo (da destra a sinistra).
- **Icone**: font proprio «Ottoteca Icons» (33 icone a tema: foglie, fiori, facce kawaii), generato da `tools/icon-src.py` + `tools/build-icons.py`.
- **Accessibilità**: WCAG 2.2 AA verificata con axe (chiaro, scuro, RTL, telefono), tastiera completa, movimento ridotto, alto contrasto.
- Installabile (Android, iPhone, computer) e funziona offline.

## Sviluppo

```bash
npm install
npm start          # http://localhost:8080
npm run check      # traduzioni
npm test           # rigenera sw.js e prova tutto in Chrome (importazione, viste, visore, codici, axe, offline)
npm run vendor     # dopo aver aggiornato pdfjs-dist o zxing-wasm
```

Struttura: `app/` è il sito (nessuna build: HTML, CSS e moduli JS), `app/i18n/*.json` i testi (`en.json` è la fonte), `app/sw.js` è generato da `tools/build.mjs`.

## Pubblicazione

Ogni push su `main` controlla le traduzioni, esegue le prove e pubblica `app/` su GitHub Pages. Una volta sola: **Settings → Pages → Source: GitHub Actions**.

## Licenze

Codice MIT. Librerie in `app/vendor/`: pdf.js (Apache-2.0), zxing-wasm (MIT) / zxing-cpp (Apache-2.0). Carattere Nunito (OFL).
