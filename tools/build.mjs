// Genera app/sw.js: elenco dei file principali e versione (hash dei contenuti).
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative } from "node:path";
const APP = new URL("../app/", import.meta.url).pathname;
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const core = walk(APP).filter(p => !p.includes("/vendor/") && !p.endsWith("sw.js") && !p.includes("/i18n/")).map(p => relative(APP, p)).sort();
core.push("i18n/en.json");
const h = createHash("sha256"); for (const f of core) h.update(f).update(readFileSync(join(APP, f)));
const vh = createHash("sha256"); for (const f of walk(join(APP, "vendor")).sort()) vh.update(f).update(readFileSync(f));
const files = ["./", ...core.filter(f => f !== "index.html" || true).map(f => "./" + f)];
const tpl = readFileSync(new URL("./sw.template.js", import.meta.url), "utf8");
writeFileSync(join(APP, "sw.js"), tpl.replace("__VERSION__", h.digest("hex").slice(0, 12)).replace("__VENDOR__", vh.digest("hex").slice(0, 8)).replace("__CORE__", JSON.stringify(files, null, 0)));
console.log("sw.js:", files.length, "file nel precache");
