// Controlla le traduzioni: stesse chiavi di en.json, stessi segnaposto {…}, nessun valore vuoto, chiavi usate nel codice presenti.
import { readFileSync, readdirSync } from "node:fs";
const dir = new URL("../app/i18n/", import.meta.url);
const en = JSON.parse(readFileSync(new URL("en.json", dir)));
const ph = s => (s.match(/\{\w+\}/g) || []).sort().join();
let bad = 0;
const src = ["js/app.js", "js/codes.js", "index.html"].map(f => readFileSync(new URL("../app/" + f, import.meta.url), "utf8")).join("\n");
for (const m of src.matchAll(/(?:\bt\(|data-i18n(?:-ph|-label)?=)["']([a-z0-9]+\.[a-zA-Z0-9.]+)["']/g)) if (!(m[1] in en)) { console.log("manca in en.json:", m[1]); bad++; }
const langs = readFileSync(new URL("../app/js/i18n.js", import.meta.url), "utf8").match(/^\s+(?:[a-z]{2}: "[^"]+",?\s*)+/gm).join(" ").match(/\b[a-z]{2}(?=:)/g);
for (const l of langs) {
  let d; try { d = JSON.parse(readFileSync(new URL(l + ".json", dir))); } catch { console.log(l, "file mancante o non valido"); bad++; continue; }
  for (const k of Object.keys(en)) {
    if (!(k in d)) { console.log(l, "manca", k); bad++; }
    else if (!String(d[k]).trim()) { console.log(l, "vuota", k); bad++; }
    else if (ph(d[k]) !== ph(en[k])) { console.log(l, "segnaposto diversi", k); bad++; }
  }
  for (const k of Object.keys(d)) if (!(k in en)) { console.log(l, "chiave in più", k); bad++; }
}
for (const f of readdirSync(dir)) if (!langs.includes(f.replace(".json", ""))) { console.log("file non in elenco:", f); bad++; }
console.log(bad ? `${bad} problemi` : `i18n ok: ${langs.length} lingue, ${Object.keys(en).length} testi`);
process.exit(bad ? 1 : 0);
