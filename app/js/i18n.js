// Lingue: tutte le europee + russo, coreano, giapponese, cinese e arabo. Un file JSON per lingua, en.json è la fonte.
export const LANGS = {
  sq: "Shqip", be: "Беларуская", bs: "Bosanski", bg: "Български", cs: "Čeština", hr: "Hrvatski", da: "Dansk",
  de: "Deutsch", et: "Eesti", el: "Ελληνικά", en: "English", es: "Español", fr: "Français", ga: "Gaeilge",
  is: "Íslenska", it: "Italiano", lv: "Latviešu", lt: "Lietuvių", hu: "Magyar", mk: "Македонски", mt: "Malti",
  nl: "Nederlands", no: "Norsk", pl: "Polski", pt: "Português", ro: "Română", ru: "Русский", sk: "Slovenčina",
  sl: "Slovenščina", sr: "Српски", fi: "Suomi", sv: "Svenska", uk: "Українська",
  ar: "العربية", zh: "中文", ja: "日本語", ko: "한국어"
};
const RTL = new Set(["ar"]);
let dict = {}, base = {}, cur = "en";

export function detect() {
  const saved = localStorage.getItem("otto.lang");
  if (saved && LANGS[saved]) return saved;
  for (const l of navigator.languages || [navigator.language || "en"]) {
    let c = l.toLowerCase().split("-")[0];
    if (c === "nb" || c === "nn") c = "no";
    if (c === "hr" || c === "bs" || c === "sr") return c;
    if (LANGS[c]) return c;
  }
  return "en";
}
async function load(c) {
  const r = await fetch(`i18n/${c}.json`);
  if (!r.ok) throw new Error(c);
  return r.json();
}
export async function setLang(c) {
  if (!LANGS[c]) c = "en";
  if (!Object.keys(base).length) base = await load("en");
  dict = c === "en" ? base : await load(c).catch(() => base);
  cur = c;
  const h = document.documentElement;
  h.lang = c; h.dir = RTL.has(c) ? "rtl" : "ltr";
  apply();
}
export const lang = () => cur;
export function t(k, v) {
  let s = dict[k] ?? base[k] ?? k;
  if (v) s = s.replace(/\{(\w+)\}/g, (m, n) => (v[n] ?? m));
  return s;
}
export function apply(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(e => { e.textContent = t(e.dataset.i18n); });
  root.querySelectorAll("[data-i18n-ph]").forEach(e => { e.placeholder = t(e.dataset.i18nPh); });
  root.querySelectorAll("[data-i18n-label]").forEach(e => { const s = t(e.dataset.i18nLabel); e.setAttribute("aria-label", s); e.title = s; });
}
export const nf = (n, o) => new Intl.NumberFormat(cur, o).format(n);
export function size(b) {
  const u = ["byte", "kilobyte", "megabyte", "gigabyte"]; let i = 0;
  while (b >= 1024 && i < 3) { b /= 1024; i++; }
  try { return new Intl.NumberFormat(cur, { style: "unit", unit: u[i], unitDisplay: "short", maximumFractionDigits: i ? 1 : 0 }).format(b); }
  catch { return b.toFixed(1) + " " + ["B", "KB", "MB", "GB"][i]; }
}
export const date = d => new Intl.DateTimeFormat(cur, { dateStyle: "medium" }).format(new Date(d));
export const collator = () => new Intl.Collator(cur, { numeric: true, sensitivity: "base" });
