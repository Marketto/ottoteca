// Copia in app/vendor le librerie da node_modules (dopo un aggiornamento con npm update).
import { cpSync, rmSync, mkdirSync } from "node:fs";
const nm = p => new URL("../node_modules/" + p, import.meta.url).pathname, app = p => new URL("../app/" + p, import.meta.url).pathname;
rmSync(app("vendor"), { recursive: true, force: true });
mkdirSync(app("vendor/pdfjs"), { recursive: true }); mkdirSync(app("vendor/zxing"), { recursive: true });
for (const f of ["build/pdf.min.mjs", "build/pdf.worker.min.mjs", "LICENSE"]) cpSync(nm("pdfjs-dist/" + f), app("vendor/pdfjs/" + f.split("/").pop()));
for (const d of ["cmaps", "standard_fonts", "wasm"]) cpSync(nm("pdfjs-dist/" + d), app("vendor/pdfjs/" + d), { recursive: true, filter: s => !/quickjs/.test(s) });
cpSync(nm("zxing-wasm/dist/iife/full/index.js"), app("vendor/zxing/zxing.js"));
cpSync(nm("zxing-wasm/dist/full/zxing_full.wasm"), app("vendor/zxing/zxing_full.wasm"));
cpSync(nm("zxing-wasm/LICENSE"), app("vendor/zxing/LICENSE"));
console.log("vendor aggiornato");
