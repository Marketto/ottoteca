# ottoteca-wallet (Cloudflare Worker, piano gratuito)

Tiene segreta la chiave WalletWallet del proprietario e crea i pass Apple Wallet per tutti gli utenti di Ottoteca.

- `POST /pkpass` con `{ barcodeValue, barcodeFormat, title, logoText, description, colorPreset }` → `.pkpass` firmato.
- Accetta solo richieste da `https://marketto.github.io` (CORS), al massimo 5 al minuto per persona.
- Limite totale: quello della chiave gratuita (1000 pass al mese). Finito quello, l'app propone la chiave personale o i passi manuali.

## Pubblicazione (una volta)

Nel repo GitHub → Settings → Secrets and variables → Actions → New repository secret:

| Nome | Valore |
|---|---|
| `CLOUDFLARE_API_TOKEN` | token Cloudflare con il modello «Edit Cloudflare Workers» |
| `CLOUDFLARE_ACCOUNT_ID` | ID dell'account (pagina Workers, a destra) |
| `WALLETWALLET_KEY` | la chiave `ww_live_…` arrivata per email |

Poi Actions → «Pubblica il Worker del wallet» → Run workflow. Il workflow pubblica il Worker, salva l'indirizzo in `app/js/config.js` e ripubblica l'app.
