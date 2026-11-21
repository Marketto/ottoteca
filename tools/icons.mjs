// Genera le icone dell'app dalla mascotte (stesso SVG di js/otto.js) con i colori del tema chiaro.
import { writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { ottoSVG } from "../app/js/otto.js";
const css = readFileSync(new URL("../app/css/app.css", import.meta.url), "utf8");
const root = css.slice(css.indexOf(":root{"), css.indexOf("}", css.indexOf(":root{")));
const vars = Object.fromEntries([...root.matchAll(/--([\w-]+):([^;]+);/g)].map(m => [m[1], m[2].trim()]));
const inner = ottoSVG().replace(/var\(--([\w-]+)\)/g, (m, k) => vars[k] || "#000").replace(/<svg[^>]*>|<\/svg>/g, "").replace(/<g class="o-(spark|hearts|zzz|glass)"[\s\S]*?<\/g>\s*(?=<g|<\/g>|$)/g, "");
const icon = (pad, rx) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb3d1"/><stop offset=".5" stop-color="#ffd3a8"/><stop offset="1" stop-color="#c9b8ff"/></linearGradient></defs>
<rect width="512" height="512" rx="${rx}" fill="url(#bg)"/>
<g fill="#fff" opacity=".55"><circle cx="90" cy="96" r="10"/><circle cx="430" cy="140" r="7"/><circle cx="420" cy="420" r="11"/><circle cx="70" cy="400" r="6"/></g>
<g transform="translate(256 ${pad ? 262 : 268}) scale(${pad ? 1.7 : 2.25}) translate(-100 -118)">${inner}</g></svg>`;
const dir = new URL("../app/icons/", import.meta.url).pathname;
writeFileSync(dir + "icon.svg", icon(false, 112));
writeFileSync("/tmp/maskable.svg", icon(true, 0));
const r = (src, w, out) => execFileSync("rsvg-convert", ["-w", String(w), src, "-o", dir + out]);
r(dir + "icon.svg", 192, "icon-192.png"); r(dir + "icon.svg", 512, "icon-512.png");
r("/tmp/maskable.svg", 512, "maskable-512.png"); r("/tmp/maskable.svg", 180, "apple-touch-icon.png");
console.log("icone generate");
