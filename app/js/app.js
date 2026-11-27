// Ottoteca — app principale.
import * as db from "./db.js";
import { LANGS, detect, setLang, lang, t, apply, size, date, collator } from "./i18n.js";
import { mountOttos, mood, confetti, sparkle, startOttoLife } from "./otto.js";
import { mountHabitat } from "./habitat.js";
import { classify, KINDS, KIND_ICON } from "./kinds.js";
import { analyze, openPdf, isPasswordError, renderToCanvas, pdfjs, closePdf } from "./pdf.js";
import { scanDoc, codeSVG, formatName, readImage } from "./codes.js";
import { WALLET_PROXY } from "./config.js";

export const VERSION = "1.6.3";
const HEAVY = 5 * 1024 * 1024;                     // oltre questa soglia si suggerisce Schiaccia PDF
const SQUASH_URL = "https://marketto.github.io/pdf-tiny-tools/";
const COLORS = ["#e5637a", "#f29e4c", "#e8c547", "#7cc46b", "#3fb5a9", "#4f9ae0", "#8f7ae5", "#d06fc0", "#a07b62", "#7d8796"];
const SQUASH_NAME = { ar: "مكبس PDF", be: "Сплюшч PDF", bg: "Мачкай PDF", bs: "Zgnječi PDF", cs: "Zmáčkni PDF", da: "Mas PDF", de: "PDF-Presse", el: "Ζούλα PDF", es: "Aplasta PDF", et: "Lömasta PDF", fi: "Litistä PDF", fr: "Presse-PDF", ga: "Brúiteoir PDF", hr: "Zgnječi PDF", hu: "PDF-lapító", is: "Kreistu PDF", it: "Schiaccia PDF", lt: "Sutraiškyk PDF", lv: "Saspied PDF", mk: "Згмечи PDF", mt: "Ifgħas il-PDF", nl: "PDF Pletter", no: "Knus PDF", pl: "Zgniatacz PDF", pt: "Esmaga PDF", ro: "Turtește PDF", ru: "PDF-пресс", sk: "Stlač PDF", sl: "Zmečkaj PDF", sq: "Shtrydh PDF", sr: "Згњечи PDF", sv: "Kläm PDF", uk: "Розчави PDF", zh: "PDF 压一压" };
const squashName = () => SQUASH_NAME[lang()] || "PDF Squasher";

const $ = s => document.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v; else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (k === "style") e.style.cssText = v;
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};
const ic = n => el("span", { class: "ic ic-" + n, "aria-hidden": "true" });

const S = { docs: [], cats: [], passes: [], roots: [], filter: "all", q: "", sort: localStorage.getItem("otto.sort") || "added", selecting: false, sel: new Set(),
  mode: localStorage.getItem("otto.mode") || "grid", kind: null, basis: localStorage.getItem("otto.basis") || "added", folder: null };
const thumbURLs = new Map();
function thumbURL(d) {
  if (!d.thumb) return null;
  if (!thumbURLs.has(d.id)) thumbURLs.set(d.id, URL.createObjectURL(d.thumb));
  return thumbURLs.get(d.id);
}

/* ================= impostazioni ================= */
function applyTextSize() {
  const v = localStorage.getItem("otto.text") || "m";
  document.documentElement.style.fontSize = { s: "93.75%", m: "100%", l: "112.5%", xl: "125%" }[v] || "100%";
  document.querySelectorAll("input[name=textsize]").forEach(r => r.checked = r.value === v);
}
// niente zoom accidentale con due dita o doppio tocco (il testo si ingrandisce dalle Impostazioni; nel visore il pizzico ingrandisce il PDF)
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("gesturechange", e => e.preventDefault());
document.addEventListener("touchmove", e => { if (e.touches.length > 1 && !e.target.closest?.("#vPages")) e.preventDefault(); }, { passive: false });
function applyTheme() {
  const th = localStorage.getItem("otto.theme") || "auto", mo = localStorage.getItem("otto.motion") || "auto";
  const h = document.documentElement;
  if (th === "auto") delete h.dataset.theme; else h.dataset.theme = th;
  if (mo === "auto") delete h.dataset.motion; else h.dataset.motion = mo;
  h.dataset.motionEff = mo === "reduced" || (mo === "auto" && matchMedia("(prefers-reduced-motion: reduce)").matches) ? "reduced" : "full";
  document.querySelectorAll('input[name=theme]').forEach(r => r.checked = r.value === th);
  document.querySelectorAll('input[name=motion]').forEach(r => r.checked = r.value === mo);
  const dark = h.dataset.theme === "dark" || (th === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll('meta[name=theme-color]').forEach(m => { m.content = dark ? "#1d1a24" : "#fff6ec"; m.removeAttribute("media"); });
}

/* ================= mascotte ================= */
const bubble = $("#bubble");
let bubbleT, lastAct = Date.now(), cheerIdx = Math.floor(Math.random() * 12);
function say(msg, state = "happy", { live = true, ms = 5200 } = {}) {
  bubble.setAttribute("aria-live", live ? "polite" : "off");
  bubble.textContent = msg;
  bubble.classList.remove("show"); void bubble.offsetWidth; bubble.classList.add("show");
  clearTimeout(bubbleT);
  bubbleT = setTimeout(() => bubble.classList.remove("show"), ms);
  if (state) mood(state);
}
function cheer(live = true) {
  cheerIdx = (cheerIdx + 1) % 12;
  say(t("cheer." + (cheerIdx + 1)), ["happy", "wiggle", "love", "trick"][cheerIdx % 4], { live });
}
// Otto interattivo: tocco = reazione a sorpresa, tieni premuto = abbraccio, strofina = coccole, tanti tocchi = gira la testa
{
  const btn = $("#buddyBtn");
  let down = null, taps = [], lastPetSay = 0, lastHeart = 0;
  const reactions = [
    () => { cheer(true); mood("happy"); },
    () => { say(t("ev.wave"), "wave"); },
    () => { say(t("ev.juggle"), "juggle", { ms: 3500 }); mood("juggle", 3200); },
    () => { cheer(true); mood("trick"); },
    () => { cheer(true); mood("love"); }
  ];
  let ri = 0;
  const react = (x, y) => {
    const now = Date.now();
    taps = taps.filter(tt => now - tt < 2200); taps.push(now);
    if (taps.length >= 5) { taps = []; say(t("ev.dizzy"), "dizzy", { ms: 3000 }); mood("dizzy", 2600); return; }
    ri = (ri + 1 + Math.floor(Math.random() * 3)) % reactions.length;
    reactions[ri]();
    if (x != null) sparkle(x, y, 7);
  };
  btn.addEventListener("pointerdown", e => {
    down = { x: e.clientX, y: e.clientY, t: Date.now(), dist: 0, pet: false, hug: false, px: e.clientX, py: e.clientY };
    try { btn.setPointerCapture(e.pointerId); } catch {}
    down.timer = setTimeout(() => {
      if (!down || down.pet || down.dist > 14) return;
      down.hug = true; mood("hug", 1800); say(t("ev.hug"), null);
      const r = btn.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 3, 18); navigator.vibrate?.(30);
    }, 650);
  });
  btn.addEventListener("pointermove", e => {
    if (!down) return;
    down.dist += Math.hypot(e.clientX - down.px, e.clientY - down.py); down.px = e.clientX; down.py = e.clientY;
    if (!down.pet && down.dist > 50 && !down.hug) { down.pet = true; mood("pet", 0); }
    if (down.pet) {
      const now = Date.now();
      if (now - lastHeart > 140) { lastHeart = now; sparkle(e.clientX, e.clientY, 2, "heart"); }
      if (now - lastPetSay > 2600) { lastPetSay = now; say(t("pet." + (1 + Math.floor(Math.random() * 6))), null, { live: false, ms: 2600 }); }
    }
  });
  const end = e => {
    if (!down) return;
    clearTimeout(down.timer);
    const d = down; down = null;
    if (d.pet) { mood("love", 1600); bubble.setAttribute("aria-live", "polite"); bubble.textContent = t("pet." + (1 + Math.floor(Math.random() * 6))); return; }
    if (d.hug || e.type === "pointercancel") return;
    react(e.clientX, e.clientY);
  };
  btn.addEventListener("pointerup", end);
  btn.addEventListener("pointercancel", end);
  btn.addEventListener("click", e => { if (e.detail === 0) react(); }); // tastiera: Invio o Spazio
  btn.addEventListener("contextmenu", e => e.preventDefault());
}
// rimbalzo e scintille su pulsanti, schede e filtri
{
  let pt = null;
  addEventListener("pointerdown", e => { pt = { x: e.clientX, y: e.clientY }; }, { passive: true });
  addEventListener("click", e => {
    const el2 = e.target.closest?.(".btn,.chip,.icon-btn,.doc,.fopen,.source,.tabs a,.seg label");
    if (!el2 || e.detail === 0 || el2.closest("#buddyBtn")) return;
    el2.classList.remove("boing"); void el2.offsetWidth; el2.classList.add("boing");
    el2.addEventListener("animationend", () => el2.classList.remove("boing"), { once: true });
    if (pt) sparkle(pt.x, pt.y, 5);
  }, true);
}
["pointerdown", "keydown"].forEach(ev => addEventListener(ev, () => { if (Date.now() - lastAct > 90000) mood(null); lastAct = Date.now(); }, { passive: true }));
setInterval(() => {
  if (document.hidden || !$("#viewer").hidden) return;
  const idle = Date.now() - lastAct;
  if (idle > 120000) mood("sleep", 0);
  else if (idle > 45000 && Math.random() < .5) cheer(false);
}, 30000);

/* ================= toast e dialoghi ================= */
// Avvisi in stile Ottoteca: nuvoletta con Otto, pulsante d'azione, barra del tempo e chiusura
let toastT;
function hideToast() { const tEl = $("#toast"); if (tEl.hidden) return; tEl.classList.add("out"); setTimeout(() => { tEl.hidden = true; tEl.classList.remove("out"); }, 260); }
function toast(msg, action) {
  const tEl = $("#toast"), ms = action ? 9000 : 4000;
  mountOttos(tEl);
  $("#toastMsg").textContent = msg;
  $("#toastAct").replaceChildren(action ? el("button", { type: "button", class: "btn btn-primary", onclick: () => { hideToast(); action.fn(); } }, action.label) : "");
  tEl.style.setProperty("--ms", ms + "ms");
  tEl.hidden = false; tEl.classList.remove("out", "in"); void tEl.offsetWidth; tEl.classList.add("in");
  mood(action ? "wave" : "happy", 1500, tEl);
  clearTimeout(toastT);
  toastT = setTimeout(hideToast, ms);
}
$("#toastX").onclick = () => { clearTimeout(toastT); hideToast(); };
$("#toast").addEventListener("pointerenter", () => clearTimeout(toastT));
$("#toast").addEventListener("pointerleave", () => { clearTimeout(toastT); toastT = setTimeout(hideToast, 2500); });
// Condividi l'app
$("#shareApp").onclick = async () => {
  const url = location.origin + location.pathname;
  const data = { title: "Ottoteca", text: t("share.text"), url };
  try { if (navigator.share) { await navigator.share(data); return; } } catch (e) { if (e?.name === "AbortError") return; }
  try { await navigator.clipboard.writeText(url); toast(t("share.copied")); } catch { toast(url); }
};

function dialog({ title, body, actions, onOpen, init }) {
  const d = $("#dlg");
  $("#dlgTitle").textContent = title;
  const b = $("#dlgBody"); b.replaceChildren(); if (body) b.append(...[].concat(body));
  const a = $("#dlgActions"); a.replaceChildren();
  for (const x of actions || [{ label: t("common.close"), value: "close", cls: "btn-primary" }])
    a.append(el("button", { class: "btn " + (x.cls || "btn-ghost"), value: x.value, type: x.submit ? "submit" : "submit", formnovalidate: x.value === "cancel" ? true : null }, x.label));
  return new Promise(res => {
    const prev = document.activeElement;
    d.returnValue = "";
    d.onclose = () => { res(d.returnValue || "cancel"); prev?.focus?.(); };
    d.showModal();
    init?.(d);
    (d.querySelector("[autofocus]") || a.querySelector(".btn-primary") || a.lastChild)?.focus();
    onOpen?.(d);
  });
}
const confirmBox = (title, text, okLabel, danger = true) => dialog({
  title, body: el("p", {}, text),
  actions: [{ label: t("common.cancel"), value: "cancel" }, { label: okLabel, value: "ok", cls: danger ? "btn-danger-soft" : "btn-primary" }]
}).then(v => v === "ok");

async function promptBox(title, label, value = "", extra) {
  const inp = el("input", { type: "text", id: "dlgInput", value, autofocus: true, required: true, maxlength: 120, autocomplete: "off" });
  const body = [el("label", { class: "lbl", for: "dlgInput" }, label), inp];
  if (extra) body.push(...extra.nodes);
  inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); if (inp.value.trim()) $("#dlg").close("ok"); } });
  const v = await dialog({ title, body, actions: [{ label: t("common.cancel"), value: "cancel" }, { label: t("common.save"), value: "ok", cls: "btn-primary" }], init: () => { inp.select(); } });
  if (v !== "ok" || !inp.value.trim()) return null;
  return extra ? { value: inp.value.trim(), ...extra.read() } : inp.value.trim();
}

/* ================= menu contestuale ================= */
const menu = $("#menu");
let menuOwner;
function openMenu(anchor, items) {
  menu.replaceChildren(...items.map(it => el("button", { role: "menuitem", class: it.danger ? "danger" : "", type: "button", onclick: () => { closeMenu(); it.fn(); } }, ic(it.icon), it.label)));
  menu.hidden = false;
  menuOwner = anchor; anchor.setAttribute("aria-expanded", "true");
  const r = anchor.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight;
  let x = document.dir === "rtl" ? r.left : r.right - mw; x = Math.max(8, Math.min(x, innerWidth - mw - 8));
  let y = r.bottom + 6; if (y + mh > innerHeight - 8) y = Math.max(8, r.top - mh - 6);
  menu.style.left = x + "px"; menu.style.top = y + "px";
  menu.querySelector("button")?.focus();
}
function closeMenu() { if (menu.hidden) return; menu.hidden = true; menuOwner?.setAttribute("aria-expanded", "false"); menuOwner?.focus(); menuOwner = null; }
menu.addEventListener("keydown", e => {
  const b = [...menu.querySelectorAll("button")], i = b.indexOf(document.activeElement);
  if (e.key === "ArrowDown") { e.preventDefault(); b[(i + 1) % b.length].focus(); }
  else if (e.key === "ArrowUp") { e.preventDefault(); b[(i - 1 + b.length) % b.length].focus(); }
  else if (e.key === "Home") { e.preventDefault(); b[0].focus(); }
  else if (e.key === "End") { e.preventDefault(); b.at(-1).focus(); }
  else if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); closeMenu(); }
});
addEventListener("pointerdown", e => { if (!menu.hidden && !menu.contains(e.target) && e.target !== menuOwner && !menuOwner?.contains(e.target)) { menu.hidden = true; menuOwner?.setAttribute("aria-expanded", "false"); menuOwner = null; } });

/* ================= dati ================= */
async function loadAll() {
  [S.docs, S.cats, S.passes, S.roots] = await Promise.all([db.all("docs"), db.all("cats"), db.all("passes"), db.all("roots")]);
  S.cats.sort((a, b) => a.order - b.order);
  for (const d of S.docs) { // tipo riconosciuto anche per i PDF già in libreria
    if (d.kindManual !== undefined || d.pending) continue;
    const k = classify(d.text, d.name);
    if (k !== (d.kind ?? null)) { d.kind = k; db.put("docs", d); }
  }
}
const docById = id => S.docs.find(d => d.id === id);
const catById = id => S.cats.find(c => c.id === id);
const children = pid => S.cats.filter(c => (c.parent || null) === pid).sort((a, b) => collator().compare(a.name, b.name));
const ancestors = c => { const out = []; let x = c, g = 0; while (x && g++ < 50) { out.unshift(x); x = catById(x.parent); } return out; };
const catPath = c => ancestors(c).map(x => x.name).join(" / ");
const descendants = id => { const out = []; const walk = p => children(p).forEach(c => { out.push(c.id); walk(c.id); }); walk(id); return out; };
const countIn = id => { const ids = new Set([id, ...descendants(id)]); return S.docs.filter(d => d.cats.some(c => ids.has(c))).length; };
function treeOrder() { const out = []; const walk = (p, depth) => children(p).forEach(c => { out.push({ c, depth }); walk(c.id, depth + 1); }); walk(null, 0); return out; }

async function sha(buf) {
  try { const h = await crypto.subtle.digest("SHA-256", buf); return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join(""); }
  catch { return buf.byteLength + ":" + Date.now(); }
}
const isPdf = async f => {
  if (f.type === "application/pdf" || /\.pdf$/i.test(f.name)) return true;
  const h = new Uint8Array(await f.slice(0, 1024).arrayBuffer());
  return new TextDecoder().decode(h).includes("%PDF-");
};

let persistAsked = false;
function importTarget() { return S.mode === "folders" ? S.folder : (S.filter !== "all" && S.filter !== "none" && S.mode !== "folders" ? S.filter : null); }
async function folderFor(path, base, rootId) { // "A/B/x.pdf" -> cartella virtuale B dentro A (creata se manca)
  let parent = base;
  for (const name of path.split("/").slice(0, -1).filter(Boolean)) {
    let c = S.cats.find(x => (x.parent || null) === parent && x.name === name);
    if (!c) { c = { id: db.uid(), name, color: COLORS[S.cats.length % COLORS.length], order: Date.now(), parent, rootId: rootId || null }; await db.put("cats", c); S.cats.push(c); }
    parent = c.id;
  }
  return parent;
}
async function importFiles(files) {
  files = [...files];
  const target = importTarget();
  if (!files.length) return;
  let added = 0, heavy = null, lastId;
  mood("think", 0);
  for (const f of files) {
    if (!(await isPdf(f))) { toast(t("import.notPdf", { name: f.name })); continue; }
    say(t("import.adding", { name: f.name }), "think", { ms: 60000 });
    const buf = await f.arrayBuffer();
    const hash = await sha(buf);
    const dup = S.docs.find(d => d.hash === hash);
    const fold = f.webkitRelativePath ? await folderFor(f.webkitRelativePath, target) : target;
    if (dup) { if (fold && !dup.cats.includes(fold)) { dup.cats.push(fold); await db.put("docs", dup); added++; } else toast(t("import.dup", { name: dup.name })); continue; }
    let info = { pages: 0, thumb: null, text: "", locked: false, ratio: 1.414 };
    try { info = await analyze(buf); } catch (e) { if (isPasswordError(e)) info.locked = true; else { console.warn(e); toast(t("view.error")); continue; } }
    const doc = {
      id: db.uid(), hash, name: f.name.replace(/\.pdf$/i, ""), size: f.size, pages: info.pages, thumb: info.thumb, text: info.text, locked: info.locked, ratio: info.ratio,
      added: Date.now(), opened: 0, cats: fold ? [fold] : []
    };
    await db.addDoc(doc, new Blob([buf], { type: "application/pdf" }));
    doc.kind = classify(doc.text, doc.name);
    S.docs.push(doc); added++; lastId = doc.id;
    if (f.size > HEAVY) heavy = doc;
  }
  mood(null);
  if (!added) { bubble.classList.remove("show"); return; }
  if (!persistAsked && navigator.storage?.persist) { persistAsked = true; navigator.storage.persist().catch(() => {}); }
  renderLibrary(lastId);
  const r = $("#buddyBtn").getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top + 10, 34);
  say(t("ev.import"), "happy");
  toast(t("import.done", { n: added }));
  if (heavy) setTimeout(() => {
    say(t("ev.heavy"), "wiggle");
    toast(t("squash.toast", { name: heavy.name, size: size(heavy.size) }), { label: t("squash.short"), fn: () => squashDialog(heavy) });
  }, 3800);
}

/* ================= libreria ================= */
function visibleDocs() {
  const q = S.q.trim().toLowerCase();
  let list;
  if (S.mode === "folders") list = (q || S.kind) ? S.docs.slice() : S.docs.filter(d => S.folder ? d.cats.includes(S.folder) : !d.cats.length);
  else if (S.filter === "all") list = S.docs.slice();
  else if (S.filter === "none") list = S.docs.filter(d => !d.cats.length);
  else { const ids = new Set([S.filter, ...descendants(S.filter)]); list = S.docs.filter(d => d.cats.some(c => ids.has(c))); }
  if (S.kind) list = list.filter(d => d.kind === S.kind);
  if (q) {
    const words = q.split(/\s+/);
    list = list.filter(d => { const h = (d.name + " " + (d.text || "")).toLowerCase(); return words.every(w => h.includes(w)); });
  }
  const c = collator();
  const by = { added: (a, b) => b.added - a.added, opened: (a, b) => (b.opened || 0) - (a.opened || 0) || b.added - a.added, name: (a, b) => c.compare(a.name, b.name), size: (a, b) => b.size - a.size };
  return list.sort(by[S.sort] || by.added);
}

function renderChips() {
  const box = $("#chips"); box.replaceChildren();
  const mk = (id, label, n, color, full) => {
    const b = el("button", { class: "chip", type: "button", "aria-pressed": String(S.filter === id), "data-cat": id, title: full || null, onclick: () => { S.filter = id; renderLibrary(); } },
      color ? el("span", { class: "dot", style: `--c:${color}`, "aria-hidden": "true" }) : null, el("span", { class: "lbl" }, label), el("span", { class: "n" }, String(n)));
    if (color) {
      b.addEventListener("dragover", e => { if (e.dataTransfer.types.includes("text/otto-doc")) { e.preventDefault(); b.classList.add("drop-over"); } });
      b.addEventListener("dragleave", () => b.classList.remove("drop-over"));
      b.addEventListener("drop", async e => {
        e.preventDefault(); b.classList.remove("drop-over");
        const ids = e.dataTransfer.getData("text/otto-doc").split(",");
        for (const did of ids) { const d = docById(did); if (d && !d.cats.includes(id)) { d.cats.push(id); await db.put("docs", d); } }
        mood("love"); say(t("ev.dropped", { cat: label }), "love"); renderLibrary();
      });
    }
    box.append(b);
    if (color && S.filter === id) box.append(el("button", { class: "icon-btn", type: "button", "aria-label": t("cat.edit", { name: label }), title: t("cat.edit", { name: label }), onclick: () => editCat(catById(id)) }, ic("edit")));
  };
  mk("all", t("lib.all"), S.docs.length);
  // solo i primi due livelli (gli altri si raggiungono dalla vista Cartelle): con tutto il telefono sarebbero centinaia
  for (const { c, depth } of treeOrder()) if (depth <= 1 || S.filter === c.id) mk(c.id, c.name, countIn(c.id), c.color, catPath(c));
  const nNone = S.docs.filter(d => !d.cats.length).length;
  if (S.cats.length && nNone) mk("none", t("lib.uncat"), nNone);
}

function docCard(d, i, showTime) {
  const sel = S.sel.has(d.id);
  const li = el("li", { class: "card-doc" + (sel ? " sel" : ""), style: `--i:${Math.min(i, 20)}`, "data-id": d.id, draggable: S.selecting ? null : "true" });
  const thumb = el("div", { class: "thumb" });
  const u = thumbURL(d);
  if (u) thumb.append(el("img", { src: u, alt: "", loading: "lazy", decoding: "async" }));
  else thumb.append(ic("pdf"));
  if (d.pending) thumb.append(el("span", { class: "loading", "aria-hidden": "true" }));
  if (d.kind) thumb.append(el("span", { class: "kind-badge k-" + d.kind, title: t("kind." + d.kind), "aria-hidden": "true" }, ic(KIND_ICON[d.kind])));
  if (d.size > HEAVY) thumb.append(el("span", { class: "badge-heavy", "aria-hidden": "true" }, size(d.size)));
  const cats = d.cats.map(catById).filter(Boolean);
  const meta = [d.pages ? t("meta.pages", { n: d.pages }) : null, size(d.size)].filter(Boolean).join(" · ");
  const label = [d.name, d.kind ? t("kind." + d.kind) : "", meta, cats.length ? t("cat.manage") + ": " + cats.map(c => c.name).join(", ") : ""].filter(Boolean).join(". ");
  const btn = el("button", { class: "doc", type: "button", "aria-label": label, "aria-pressed": S.selecting ? String(sel) : null,
    onclick: () => S.selecting ? toggleSel(d.id, li, btn) : openViewer(d.id) },
    thumb,
    el("span", { class: "doc-info" },
      el("span", { class: "doc-name" }, d.name),
      el("span", { class: "doc-meta" }, showTime ? el("span", { class: "doc-time" }, timeOf(showTime)) : null, meta),
      cats.length ? el("span", { class: "doc-cats", "aria-hidden": "true" }, cats.map(c => el("i", { style: `--c:${c.color}`, title: c.name }))) : null));
  const more = el("button", { class: "icon-btn doc-more", type: "button", "aria-haspopup": "menu", "aria-expanded": "false", "aria-label": t("doc.more", { name: d.name }), title: t("doc.more", { name: d.name }) }, ic("dots"));
  more.addEventListener("click", e => { e.stopPropagation(); openMenu(more, docMenu(d)); });
  li.append(btn, more, el("span", { class: "selmark", "aria-hidden": "true" }, ic("check")));
  li.addEventListener("dragstart", e => {
    const ids = S.sel.size && S.sel.has(d.id) ? [...S.sel] : [d.id];
    e.dataTransfer.setData("text/otto-doc", ids.join(",")); e.dataTransfer.effectAllowed = "copy";
  });
  let lp; // pressione lunga = selezione
  btn.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") lp = setTimeout(() => { if (!S.selecting) { setSelecting(true); toggleSel(d.id); } }, 550); });
  ["pointerup", "pointerleave", "pointercancel", "pointermove"].forEach(ev => btn.addEventListener(ev, e => { if (ev !== "pointermove" || Math.abs(e.movementX) + Math.abs(e.movementY) > 6) clearTimeout(lp); }));
  return li;
}

function docMenu(d) {
  return [
    { icon: "eye", label: t("doc.open"), fn: () => openViewer(d.id) },
    { icon: "tag", label: t("doc.categories"), fn: () => assignCats([d.id]) },
    { icon: d.kind ? KIND_ICON[d.kind] : "flower", label: t("kind.change"), fn: () => changeKind(d) },
    { icon: "edit", label: t("doc.rename"), fn: () => renameDoc(d) },
    { icon: "qr", label: t("doc.codes"), fn: () => openViewer(d.id, true) },
    { icon: "squash", label: t("squash.short"), fn: () => squashDialog(d) },
    navigator.canShare ? { icon: "share", label: t("doc.share"), fn: () => shareDoc(d) } : null,
    { icon: "download", label: t("doc.download"), fn: () => downloadDoc(d) },
    { icon: "trash", label: t("doc.delete"), danger: true, fn: () => deleteDocs([d.id]) }
  ].filter(Boolean);
}

const timeOf = ts => new Intl.DateTimeFormat(lang(), { hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
function dayLabel(ts) {
  if (!ts) return t("tl.never");
  const d = new Date(ts), n = new Date(); const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(n) - day(d)) / 864e5);
  if (diff === 0) return t("tl.today");
  if (diff === 1) return t("tl.yesterday");
  return new Intl.DateTimeFormat(lang(), { weekday: "long", day: "numeric", month: "long", year: d.getFullYear() === n.getFullYear() ? undefined : "numeric" }).format(d);
}
function renderCrumbs() {
  const ol = $("#crumbList"); ol.replaceChildren();
  const trail = S.folder ? ancestors(catById(S.folder)) : [];
  const items = [{ id: null, name: t("folder.root") }, ...trail];
  items.forEach((c, i) => {
    const last = i === items.length - 1;
    ol.append(el("li", {}, last ? el("span", { "aria-current": "location" }, c.name) : el("button", { type: "button", onclick: () => goFolder(c.id) }, c.name)));
  });
}
function goFolder(id) { S.folder = id; localStorage.setItem("otto.folder", id || ""); renderLibrary(); }
function folderTile(c, i) {
  const n = countIn(c.id), sub = children(c.id).length;
  const li = el("li", { class: "folder", style: `--i:${i}` });
  const b = el("button", { type: "button", class: "fopen", "aria-label": t("folder.open", { name: c.name }) + ". " + t("folder.count", { n, s: sub }), onclick: () => goFolder(c.id) },
    el("span", { class: "ficon", style: `--c:${c.color}`, "aria-hidden": "true" }, ic("folder")),
    el("span", {}, el("span", { class: "fname" }, c.name), el("span", { class: "fcount", "aria-hidden": "true" }, t("folder.count", { n, s: sub }))));
  const ed = el("button", { type: "button", class: "icon-btn", "aria-label": t("cat.edit", { name: c.name }), title: t("cat.edit", { name: c.name }), onclick: () => editCat(c) }, ic("edit"));
  li.append(b, ed);
  li.addEventListener("dragover", e => { if (e.dataTransfer.types.includes("text/otto-doc")) { e.preventDefault(); li.classList.add("drop-over"); } });
  li.addEventListener("dragleave", () => li.classList.remove("drop-over"));
  li.addEventListener("drop", async e => {
    e.preventDefault(); li.classList.remove("drop-over");
    const ids = e.dataTransfer.getData("text/otto-doc").split(",");
    for (const did of ids) { const d = docById(did); if (!d) continue; if (S.folder) d.cats = d.cats.filter(x => x !== S.folder); if (!d.cats.includes(c.id)) d.cats.push(c.id); await db.put("docs", d); }
    say(t("ev.dropped", { cat: c.name }), "love"); renderLibrary();
  });
  return li;
}
// Filtri per tipo riconosciuto (fatture, scontrini, viaggi, spettacoli): compaiono solo se ce ne sono
function renderKinds() {
  const box = $("#kinds"); box.replaceChildren();
  const counts = Object.fromEntries(KINDS.map(k => [k, S.docs.filter(d => d.kind === k).length]));
  if (S.kind && !counts[S.kind]) S.kind = null;
  for (const k of KINDS) if (counts[k]) box.append(el("button", { type: "button", class: "chip kind-chip k-" + k, "aria-pressed": String(S.kind === k),
    onclick: () => { S.kind = S.kind === k ? null : k; renderLibrary(); if (S.kind) mood("happy", 1200); } },
    el("span", { class: "kind-dot", "aria-hidden": "true" }, ic(KIND_ICON[k])), t("kind." + k + "s"), el("span", { class: "n" }, String(counts[k]))));
  box.hidden = !box.childElementCount;
}
async function changeKind(d) {
  const opts = [["auto", t("theme.auto")], ...KINDS.map(k => [k, t("kind." + k)]), ["none", t("kind.none")]];
  const cur = d.kindManual === undefined ? "auto" : (d.kindManual || "none");
  const list = el("ul", { class: "checklist" }, opts.map(([v, l]) => el("li", {}, el("label", {}, el("input", { type: "radio", name: "kind", value: v, checked: v === cur ? true : null }),
    v !== "auto" && v !== "none" ? el("span", { class: "kind-dot k-" + v, "aria-hidden": "true" }, ic(KIND_ICON[v])) : null, l))));
  const r = await dialog({ title: t("kind.change"), body: [el("p", { class: "muted" }, t("kind.hint")), list], actions: [{ label: t("common.cancel"), value: "cancel" }, { label: t("common.save"), value: "ok", cls: "btn-primary" }] });
  if (r !== "ok") return;
  const v = list.querySelector("input:checked")?.value || "auto";
  if (v === "auto") { delete d.kindManual; d.kind = classify(d.text, d.name); }
  else { d.kindManual = v === "none" ? null : v; d.kind = d.kindManual; }
  await db.put("docs", d); renderLibrary(d.id); mood("love", 1500);
}
function renderLibrary(focusId) {
  const mode = S.mode, grid = $("#grid"), empty = !S.docs.length && !S.cats.length;
  document.querySelectorAll("input[name=vmode]").forEach(r => r.checked = r.value === mode);
  document.querySelectorAll("input[name=basis]").forEach(r => r.checked = r.value === S.basis);
  if (S.folder && !catById(S.folder)) S.folder = null;
  if (S.filter !== "all" && S.filter !== "none" && !catById(S.filter)) S.filter = "all";
  $(".cats").hidden = empty || mode === "folders";
  $("#crumbs").hidden = empty || mode !== "folders";
  $("#basisSeg").hidden = mode !== "date";
  $("#sort").hidden = mode === "date" || empty;
  $(".modebar").hidden = empty;
  $("#selectBtn").hidden = empty;
  if (mode !== "folders") renderChips(); else renderCrumbs();
  renderKinds();
  const list = visibleDocs();
  grid.classList.toggle("selecting", S.selecting);
  $("#timeline").classList.toggle("selecting", S.selecting);
  // cartelle
  const fl = $("#folders"); fl.replaceChildren();
  const showFolders = mode === "folders" && !S.q.trim() && !S.kind && !empty;
  fl.hidden = !showFolders;
  if (showFolders) {
    let i = 0;
    if (S.folder) { const up = catById(S.folder).parent || null; fl.append(el("li", { class: "folder up", style: "--i:0" }, el("button", { type: "button", class: "fopen", onclick: () => goFolder(up) }, el("span", { class: "ficon", style: "--c:var(--muted)", "aria-hidden": "true" }, ic("up")), el("span", { class: "fname" }, t("folder.up"))))); i++; }
    children(S.folder).forEach(c => fl.append(folderTile(c, i++)));
    fl.append(el("li", { class: "folder up", style: `--i:${i}` }, el("button", { type: "button", class: "fopen", onclick: async () => { const c = await newCat(S.folder); if (c) renderLibrary(); } }, el("span", { class: "ficon", style: "--c:var(--primary)", "aria-hidden": "true" }, ic("plus")), el("span", { class: "fname" }, t("folder.new")))));
  }
  // documenti
  const tl = $("#timeline"); tl.replaceChildren();
  if (mode === "date") {
    grid.replaceChildren(); grid.hidden = true;
    const key = S.basis === "opened" ? "opened" : "added";
    const sorted = list.sort((a, b) => (b[key] || 0) - (a[key] || 0) || b.added - a.added);
    const groups = new Map();
    for (const d of sorted) { const g = dayLabel(d[key]); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(d); }
    let gi = 0;
    for (const [label, docs] of groups) {
      const hid = "tlh" + gi++;
      tl.append(el("section", { class: "tl-group", "aria-labelledby": hid }, el("h2", { id: hid }, label), el("ul", { class: "grid" + (S.selecting ? " selecting" : "") }, docs.map((d, i) => docCard(d, i, d[key])))));
    }
  } else {
    grid.hidden = false;
    grid.replaceChildren(...list.map((d, i) => docCard(d, i)));
  }
  $("#empty").hidden = !empty;
  const folderEmpty = mode === "folders" && !list.length && !S.q.trim() && !empty;
  $("#noResults").hidden = empty || list.length > 0 || (mode === "folders" && !S.q.trim());
  $("#libCount").textContent = empty ? "" : folderEmpty ? (S.folder ? t("folder.empty") : "") : (mode === "folders" && !S.folder && !S.q.trim() ? t("folder.loose") + " · " : "") + t("lib.count", { n: list.length });
  if (empty) mountOttos($("#empty"));
  if (focusId) document.querySelector(`#view-library [data-id="${focusId}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function setSelecting(on) {
  S.selecting = on; if (!on) S.sel.clear();
  $("#selectBtn").setAttribute("aria-pressed", String(on));
  $("#selbar").hidden = !on;
  updateSelCount();
  renderLibrary();
}
function toggleSel(id, li, btn) {
  S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id);
  li ||= $(`#view-library [data-id="${id}"]`); btn ||= li?.querySelector(".doc");
  li?.classList.toggle("sel", S.sel.has(id)); btn?.setAttribute("aria-pressed", String(S.sel.has(id)));
  updateSelCount();
}
function updateSelCount() { $("#selCount").textContent = t("sel.count", { n: S.sel.size }); $("#selCats").disabled = $("#selDel").disabled = !S.sel.size; }

/* ================= categorie ================= */
function colorPicker(cur) {
  const box = el("div", { class: "swatches", role: "radiogroup", "aria-label": t("cat.color") });
  COLORS.forEach((c, i) => box.append(el("label", {}, el("input", { type: "radio", name: "catColor", value: c, checked: c === cur ? true : null, "aria-label": t("cat.color") + " " + (i + 1) }), el("span", { style: `--c:${c}` }))));
  return { nodes: [el("span", { class: "lbl", "aria-hidden": "true" }, t("cat.color")), box], read: () => ({ color: box.querySelector("input:checked")?.value || cur }) };
}
async function newCat(parent = null) {
  const color = COLORS[S.cats.length % COLORS.length];
  const r = await promptBox(parent ? t("folder.newIn", { name: catById(parent).name }) : t("cat.new"), t("cat.name"), "", colorPicker(color));
  if (!r) return null;
  const c = { id: db.uid(), name: r.value, color: r.color, order: Date.now(), parent };
  await db.put("cats", c); S.cats.push(c);
  say(t("ev.cat"), "love");
  return c;
}
async function editCat(c) {
  const v = await dialog({
    title: c.name, body: el("p", { class: "muted" }, t("cat.hint")),
    actions: [{ label: t("cat.delete"), value: "del", cls: "btn-danger-soft" }, { label: t("cat.rename"), value: "ren", cls: "btn-primary" }]
  });
  if (v === "ren") {
    const r = await promptBox(t("cat.rename"), t("cat.name"), c.name, colorPicker(c.color));
    if (!r) return;
    c.name = r.value; c.color = r.color; await db.put("cats", c); renderLibrary();
  } else if (v === "del") {
    if (!(await confirmBox(t("cat.delete"), t("cat.deleteConfirm", { name: c.name }), t("common.delete")))) return;
    const gone = new Set([c.id, ...descendants(c.id)]);
    for (const id of gone) await db.del("cats", id);
    S.cats = S.cats.filter(x => !gone.has(x.id));
    for (const d of S.docs) if (d.cats.some(x => gone.has(x))) { d.cats = d.cats.filter(x => !gone.has(x)); await db.put("docs", d); }
    if (gone.has(S.folder)) S.folder = c.parent || null;
    S.filter = "all"; renderLibrary(); say(t("ev.delete"), "wiggle");
  }
}
async function assignCats(ids) {
  const docs = ids.map(docById).filter(Boolean);
  const list = el("ul", { class: "checklist" });
  const draw = () => {
    list.replaceChildren(...treeOrder().map(({ c, depth }) => {
      const n = docs.filter(d => d.cats.includes(c.id)).length;
      const cb = el("input", { type: "checkbox", value: c.id, checked: n === docs.length ? true : null });
      if (n && n < docs.length) cb.indeterminate = true;
      return el("li", { style: `margin-inline-start:${depth * 18}px` }, el("label", {}, cb, el("span", { class: "dot", style: `--c:${c.color}`, "aria-hidden": "true" }), c.name));
    }));
  };
  draw();
  const addB = el("button", { type: "button", class: "chip chip-add", style: "margin-top:10px", onclick: async () => { $("#dlg").close("new"); } }, ic("plus"), t("cat.new"));
  const v = await dialog({
    title: docs.length === 1 ? t("cat.assign") : t("sel.count", { n: docs.length }),
    body: [el("p", { class: "muted" }, t("cat.hint")), S.cats.length ? list : el("p", {}, t("cat.none")), addB],
    actions: [{ label: t("common.cancel"), value: "cancel" }, { label: t("common.save"), value: "ok", cls: "btn-primary" }]
  });
  if (v === "new") { const c = await newCat(S.mode === "folders" ? S.folder : null); if (c) { for (const d of docs) if (!d.cats.includes(c.id)) { d.cats.push(c.id); await db.put("docs", d); } } renderLibrary(); return assignCats(ids); }
  if (v !== "ok") return;
  for (const cb of list.querySelectorAll("input")) {
    if (cb.indeterminate) continue;
    for (const d of docs) {
      const has = d.cats.includes(cb.value);
      if (cb.checked && !has) d.cats.push(cb.value);
      if (!cb.checked && has) d.cats = d.cats.filter(x => x !== cb.value);
    }
  }
  for (const d of docs) await db.put("docs", d);
  say(t("ev.sorted"), "love"); renderLibrary();
}

/* ================= azioni sui documenti ================= */
async function renameDoc(d) {
  const v = await promptBox(t("doc.rename"), t("doc.name"), d.name);
  if (!v) return; d.name = v; await db.put("docs", d); renderLibrary();
  if (cur?.id === d.id) $("#vTitle").textContent = v;
}
async function deleteDocs(ids) {
  const one = ids.length === 1 ? docById(ids[0]) : null;
  const ok = await confirmBox(t("doc.delete"), one ? t("doc.deleteConfirm", { name: one.name }) : t("doc.deleteMany", { n: ids.length }), t("common.delete"));
  if (!ok) return;
  for (const id of ids) {
    $(`#view-library [data-id="${id}"]`)?.classList.add("leaving");
    const d = docById(id), root = d?.src === "fs" && S.roots.find(r => r.id === d.rootId);
    if (root) { root.excluded = [...new Set([...(root.excluded || []), d.path])]; await db.put("roots", root); } // non ricompare alla prossima ricerca
    await db.removeDoc(id);
    const u = thumbURLs.get(id); if (u) { URL.revokeObjectURL(u); thumbURLs.delete(id); }
  }
  S.docs = S.docs.filter(d => !ids.includes(d.id)); S.sel.clear();
  if (cur && ids.includes(cur.id)) closeViewer();
  setTimeout(() => { if (S.selecting) setSelecting(false); else renderLibrary(); }, 320);
  say(t("ev.delete"), "wiggle");
}
// Il PDF vero: copia interna (IndexedDB) o file nella cartella del dispositivo collegata (senza copiarlo).
async function getBlob(d) {
  if (d.src !== "fs") return db.get("files", d.id);
  const root = S.roots.find(r => r.id === d.rootId);
  if (!(await askPerm(root || d, true))) throw new Error("perm");
  try { return await d.handle.getFile(); } catch { throw new Error("missing"); }
}
const fileOf = async d => new File([await getBlob(d)], d.name + ".pdf", { type: "application/pdf" });
async function downloadDoc(d) {
  const f = await fileOf(d), u = URL.createObjectURL(f);
  el("a", { href: u, download: f.name }).click();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
}
async function shareDoc(d) {
  const f = await fileOf(d);
  try { if (navigator.canShare?.({ files: [f] })) await navigator.share({ files: [f], title: d.name }); else downloadDoc(d); } catch {}
}
async function squashDialog(d) {
  const otto = el("div", { "data-otto": "s", "aria-hidden": "true" });
  const v = await dialog({
    title: t("squash.title"),
    body: el("div", { class: "squashbox" }, otto, el("div", {}, el("p", {}, t("squash.text", { size: size(d.size), app: squashName() })), el("p", { class: "muted" }, t("squash.how", { app: squashName() })))),
    actions: [{ label: t("doc.download"), value: "dl" }, { label: t("squash.btn", { app: squashName() }), value: "go", cls: "btn-primary" }],
    onOpen: dd => { mountOttos(dd); mood("wiggle", 1800, dd); }
  });
  if (v === "dl") downloadDoc(d);
  if (v === "go") window.open(SQUASH_URL, "_blank", "noopener");
}

/* ================= visore ================= */
let pushed = false;
let cur = null; // { id, doc(pdf), zoom, fit, pages:[], obs, rendered:Set }
const vp = $("#vPages");
async function openViewer(id, scan = false) {
  const d = docById(id); if (!d) return;
  closeViewer(true);
  if (location.hash !== "#/doc/" + id) { history.pushState({ doc: id }, "", "#/doc/" + id); pushed = true; }
  const V = $("#viewer");
  V.hidden = false; document.body.style.overflow = "hidden";
  $("#vTitle").textContent = d.name;
  $("#vSquash").classList.toggle("btn-squash", d.size > HEAVY);
  $("#vSquash").classList.toggle("btn-ghost", d.size <= HEAVY);
  vp.replaceChildren(el("p", { class: "vmsg" }, t("view.loading")));
  $("#vPageInfo").textContent = "";
  $("#vClose").focus();
  cur = { id, d, zoom: 1, rendered: new Map(), pages: [] };
  const me = cur;
  let data;
  try { data = new Uint8Array(await (await getBlob(d)).arrayBuffer()); }
  catch (e) {
    vp.replaceChildren(el("div", { class: "vmsg" }, el("div", { "data-otto": "e", "aria-hidden": "true" }), el("p", {}, t(e.message === "perm" ? "scan.perm" : "scan.missing"))));
    mountOttos(vp); mood("sad", 1500, vp); return;
  }
  let pdf, pw;
  for (;;) {
    try { pdf = await openPdf(data.slice(0), pw); break; }
    catch (e) {
      if (!isPasswordError(e)) { vp.replaceChildren(el("div", { class: "vmsg" }, el("div", { "data-otto": "e", "aria-hidden": "true" }), el("p", {}, t("view.error")))); mountOttos(vp); mood("sad", 1500, vp); return; }
      const inp = el("input", { type: "password", id: "pw", autofocus: true, autocomplete: "off" });
      inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); $("#dlg").close("ok"); } });
      const r = await dialog({ title: d.name, body: [el("label", { class: "lbl", for: "pw" }, t("view.password")), inp], actions: [{ label: t("common.cancel"), value: "cancel" }, { label: t("common.ok"), value: "ok", cls: "btn-primary" }] });
      if (r !== "ok") return closeViewer();
      pw = inp.value;
    }
  }
  if (cur !== me) return closePdf(pdf);
  cur.pdf = pdf;
  d.opened = Date.now();
  if (d.locked || !d.thumb) { // genera miniatura dopo lo sblocco
    try { const p1 = await pdf.getPage(1), v1 = p1.getViewport({ scale: 1 }); const c = await renderToCanvas(p1, 360 / v1.width); d.thumb = await new Promise(r => c.toBlob(r, "image/webp", .82)); d.pages = pdf.numPages; d.ratio = v1.height / v1.width; } catch {}
  }
  db.put("docs", d);
  // misure delle pagine
  const n = pdf.numPages;
  const first = (await pdf.getPage(1)).getViewport({ scale: 1 });
  for (let i = 1; i <= n; i++) {
    let w = first.width, h = first.height;
    if (n <= 400 && i > 1) { const v = (await pdf.getPage(i)).getViewport({ scale: 1 }); w = v.width; h = v.height; }
    cur.pages.push({ w, h });
  }
  if (cur !== me) return;
  buildPages();
  buildThumbs();
  if (scan) findCodes();
}
function fitScale() { const maxW = Math.min(vp.clientWidth - 24, 1100); return maxW / Math.max(...cur.pages.slice(0, 5).map(p => p.w)); }
function buildPages() {
  const frag = document.createDocumentFragment();
  cur.fit = fitScale();
  cur.pages.forEach((p, i) => {
    const s = cur.fit * cur.zoom;
    frag.append(el("div", { class: "page ph", "data-p": i + 1, style: `width:${p.w * s}px;height:${p.h * s}px`, role: "group", "aria-label": t("view.page", { n: i + 1, t: cur.pages.length }) }, el("span", { class: "pnum", "aria-hidden": "true" }, String(i + 1))));
  });
  vp.replaceChildren(frag);
  cur.obs?.disconnect();
  cur.obs = new IntersectionObserver(ents => {
    for (const e of ents) {
      const n = +e.target.dataset.p;
      if (e.isIntersecting) renderPage(n, e.target); else unrender(n, e.target);
    }
  }, { root: vp, rootMargin: "120% 0px" });
  vp.querySelectorAll(".page").forEach(p => cur.obs.observe(p));
  cur.vis?.disconnect();
  cur.vis = new IntersectionObserver(ents => {
    const best = ents.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (best) setCurPage(+best.target.dataset.p);
  }, { root: vp, threshold: [.25, .5, .75] });
  vp.querySelectorAll(".page").forEach(p => cur.vis.observe(p));
  setCurPage(cur.page || 1);
  $("#vZoom").textContent = Math.round(cur.zoom * 100) + "%";
}
async function renderPage(n, box) {
  if (!cur || cur.rendered.has(n)) return;
  const me = cur, token = {};
  cur.rendered.set(n, token);
  const page = await cur.pdf.getPage(n);
  if (cur !== me || cur.rendered.get(n) !== token) return;
  const s = cur.fit * cur.zoom, dpr = Math.min(devicePixelRatio || 1, 2.5);
  const vpt = page.getViewport({ scale: s * dpr }), cssVp = page.getViewport({ scale: s });
  const c = el("canvas", { "aria-hidden": "true" });
  c.width = Math.floor(vpt.width); c.height = Math.floor(vpt.height);
  const task = page.render({ canvasContext: c.getContext("2d", { alpha: false }), canvas: c, viewport: vpt });
  token.task = task;
  try { await task.promise; } catch { return; }
  if (cur !== me || cur.rendered.get(n) !== token) return;
  box.classList.remove("ph");
  box.querySelectorAll("canvas,.textLayer").forEach(x => x.remove());
  box.prepend(c);
  try { // livello di testo: selezionabile e leggibile dai lettori di schermo
    const lib = await pdfjs();
    const tl = el("div", { class: "textLayer" });
    tl.style.setProperty("--total-scale-factor", s); tl.style.setProperty("--scale-factor", s);
    box.append(tl);
    await new lib.TextLayer({ textContentSource: page.streamTextContent(), container: tl, viewport: cssVp }).render();
  } catch {}
}
function unrender(n, box) {
  const tk = cur?.rendered.get(n); if (!tk) return;
  if (cur.rendered.size < 10) return;
  tk.task?.cancel?.();
  cur.rendered.delete(n);
  box.querySelectorAll("canvas,.textLayer").forEach(x => { if (x.width) x.width = 0; x.remove(); });
  box.classList.add("ph");
}
function setCurPage(n) {
  if (!cur) return;
  cur.page = n;
  $("#vPageInfo").textContent = t("view.page", { n, t: cur.pages.length });
  $("#vPrev").disabled = n <= 1; $("#vNext").disabled = n >= cur.pages.length;
  $("#vThumbList").querySelectorAll("button").forEach(b => b.setAttribute("aria-current", String(+b.dataset.p === n)));
}
function goPage(n) {
  if (!cur) return;
  n = Math.max(1, Math.min(cur.pages.length, n));
  vp.querySelector(`[data-p="${n}"]`)?.scrollIntoView({ block: "start" });
  setCurPage(n);
}
function setZoom(z, keepPage = true) {
  if (!cur?.pages.length) return;
  const page = cur.page;
  cur.zoom = Math.max(.4, Math.min(5, z));
  cur.rendered.forEach(tk => tk.task?.cancel?.()); cur.rendered.clear();
  buildPages();
  if (keepPage) requestAnimationFrame(() => vp.querySelector(`[data-p="${page}"]`)?.scrollIntoView({ block: "start", behavior: "instant" }));
}
function buildThumbs() {
  const ol = $("#vThumbList"); ol.replaceChildren();
  const io = new IntersectionObserver(async ents => {
    for (const e of ents) if (e.isIntersecting && !e.target.dataset.done && cur) {
      e.target.dataset.done = 1; io.unobserve(e.target);
      const pg = await cur.pdf.getPage(+e.target.dataset.p);
      const c = await renderToCanvas(pg, 110 / pg.getViewport({ scale: 1 }).width);
      c.setAttribute("aria-hidden", "true");
      e.target.prepend(c);
    }
  }, { root: $("#vSide"), rootMargin: "200px" });
  cur.pages.forEach((p, i) => {
    const b = el("button", { type: "button", "data-p": i + 1, "aria-label": t("view.page", { n: i + 1, t: cur.pages.length }), onclick: () => { goPage(i + 1); if (innerWidth < 720) toggleThumbs(false); } }, String(i + 1));
    ol.append(el("li", {}, b)); io.observe(b);
  });
  cur.thumbIO = io;
}
function toggleThumbs(on) {
  const side = $("#vSide"); on ??= side.hidden;
  side.hidden = !on; $("#vThumbs").setAttribute("aria-pressed", String(on));
  if (on) side.querySelector(`[data-p="${cur?.page || 1}"]`)?.scrollIntoView({ block: "nearest" });
}
function closeViewer(silent) {
  if (cur) { cur.obs?.disconnect(); cur.vis?.disconnect(); cur.thumbIO?.disconnect(); cur.rendered.forEach(tk => tk.task?.cancel?.()); if (cur.pdf) closePdf(cur.pdf); }
  const wasOpen = !!cur; cur = null;
  if (silent) return;
  $("#viewer").hidden = true; document.body.style.overflow = "";
  vp.replaceChildren(); $("#vThumbList").replaceChildren();
  if (location.hash.startsWith("#/doc/")) { if (pushed) history.back(); else history.replaceState(null, "", "#/"); }
  pushed = false;
  if (wasOpen) renderLibrary();
}
$("#vClose").onclick = () => closeViewer();
$("#vZoomIn").onclick = () => setZoom((cur?.zoom || 1) * 1.25);
$("#vZoomOut").onclick = () => setZoom((cur?.zoom || 1) / 1.25);
$("#vFit").onclick = () => setZoom(1);
$("#vPrev").onclick = () => goPage((cur?.page || 1) - 1);
$("#vNext").onclick = () => goPage((cur?.page || 1) + 1);
$("#vThumbs").onclick = () => toggleThumbs();
$("#vCodes").onclick = () => findCodes();
$("#vSquash").onclick = () => cur && squashDialog(cur.d);
$("#vMore").onclick = () => cur && openMenu($("#vMore"), [
  { icon: "tag", label: t("doc.categories"), fn: () => assignCats([cur.id]) },
  { icon: "edit", label: t("doc.rename"), fn: () => renameDoc(cur.d) },
  navigator.canShare ? { icon: "share", label: t("doc.share"), fn: () => shareDoc(cur.d) } : null,
  { icon: "download", label: t("doc.download"), fn: () => downloadDoc(cur.d) },
  { icon: "trash", label: t("doc.delete"), danger: true, fn: () => deleteDocs([cur.id]) }
].filter(Boolean));
$("#viewer").addEventListener("keydown", e => {
  if (e.target.closest("dialog,input,.menu")) return;
  const k = e.key;
  if (k === "Escape") { e.preventDefault(); closeViewer(); }
  else if ((k === "+" || k === "=") && !e.altKey) { e.preventDefault(); $("#vZoomIn").click(); }
  else if (k === "-" && !e.altKey) { e.preventDefault(); $("#vZoomOut").click(); }
  else if (k === "0" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setZoom(1); }
  else if (k === "PageDown" || (k === "ArrowRight" && !e.target.closest(".vbar"))) { e.preventDefault(); goPage(cur.page + 1); }
  else if (k === "PageUp" || (k === "ArrowLeft" && !e.target.closest(".vbar"))) { e.preventDefault(); goPage(cur.page - 1); }
  else if (k === "Home" && e.target === vp) { e.preventDefault(); goPage(1); }
  else if (k === "End" && e.target === vp) { e.preventDefault(); goPage(cur.pages.length); }
  else if (k === "Tab") trapFocus(e, $("#viewer"));
});
function trapFocus(e, box) {
  const f = [...box.querySelectorAll("button:not([disabled]),[tabindex='0'],a[href],input")].filter(x => x.offsetParent !== null);
  if (!f.length) return;
  if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
  else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
}
vp.addEventListener("wheel", e => { if (e.ctrlKey && cur) { e.preventDefault(); clearTimeout(cur.wt); cur.wz = (cur.wz || cur.zoom) * (e.deltaY < 0 ? 1.1 : 1 / 1.1); cur.wt = setTimeout(() => { setZoom(cur.wz); cur.wz = 0; }, 160); } }, { passive: false });
// pizzico per lo zoom
{
  const pts = new Map(); let d0 = 0, z0 = 1;
  vp.addEventListener("pointerdown", e => { pts.set(e.pointerId, e); if (pts.size === 2 && cur) { const [a, b] = [...pts.values()]; d0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); z0 = cur.zoom; } });
  vp.addEventListener("pointermove", e => {
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e);
    if (pts.size === 2 && d0 && cur) { const [a, b] = [...pts.values()]; const k = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / d0; vp.style.transform = `scale(${Math.max(.5, Math.min(3, k))})`; vp.style.transformOrigin = "50% 30%"; cur.pz = z0 * k; }
  });
  const end = e => { pts.delete(e.pointerId); if (pts.size < 2 && d0) { d0 = 0; vp.style.transform = ""; if (cur?.pz) { setZoom(cur.pz); cur.pz = 0; } } };
  ["pointerup", "pointercancel", "pointerleave"].forEach(ev => vp.addEventListener(ev, end));
}
let rzT; addEventListener("resize", () => { clearTimeout(rzT); rzT = setTimeout(() => { if (cur?.pages.length && Math.abs(fitScale() - cur.fit) > .02) setZoom(cur.zoom); }, 250); });

/* ================= codici e portafoglio ================= */
async function findCodes() {
  if (!cur?.pdf) return;
  const me = cur;
  const prog = el("progress", { max: 1, value: 0, "aria-label": t("codes.scanning") });
  const otto = el("div", { "data-otto": "scan", "aria-hidden": "true" });
  const box = el("div", { class: "scanning" }, otto, el("p", {}, t("codes.scanning")), prog);
  const p = dialog({ title: t("codes.title"), body: box, actions: [{ label: t("common.close"), value: "close", cls: "btn-primary" }], onOpen: d => { mountOttos(d); mood("think", 0, d); } });
  let res;
  try { res = await scanDoc(me.pdf, v => prog.value = v); }
  catch (e) { console.warn(e); res = { codes: [], links: [] }; }
  if (!$("#dlg").open || cur !== me) return;
  const body = $("#dlgBody");
  const parts = [];
  if (res.links.length) {
    parts.push(el("p", {}, t("codes.issuerWallet")), el("div", { class: "issuer" }, res.links.map(l => el("a", { class: "btn btn-primary", href: l.url, target: "_blank", rel: "noopener" }, ic("wallet"), t(l.kind === "apple" ? "codes.apple" : "codes.google")))));
  }
  if (!res.codes.length) {
    parts.push(el("div", { class: "scanning" }, el("div", { "data-otto": "none", "aria-hidden": "true" }), el("p", {}, t("codes.none"))));
    say(t("ev.nocode"), "sad");
  } else {
    const ul = el("ul", { class: "codes" });
    res.codes.forEach((c, i) => {
      const img = el("div", { class: "cimg", "aria-hidden": "true" }, ic(c.kind === "booking" ? "ticket" : "qr"));
      codeSVG(c).then(svg => { if (svg) img.innerHTML = svg; });
      const label = c.kind === "booking" ? t("codes.booking", { p: c.page }) : t("codes.qr", { f: formatName(c.format), p: c.page });
      const already = S.passes.some(x => x.text === c.text && (x.bytes || null) === (c.bytes || null) && (x.format || null) === (c.format || null));
      const add = el("button", { type: "button", class: "btn " + (already ? "btn-ghost" : "btn-primary"), disabled: already ? true : null }, ic(already ? "check" : "wallet"), t(already ? "codes.added" : "codes.add"));
      add.onclick = async () => {
        await addPass(c, me.d);
        add.disabled = true; add.className = "btn btn-ghost"; add.replaceChildren(ic("check"), t("codes.added"));
        const r = add.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top, 24);
      };
      const shown = c.text ? (c.text.length > 90 ? c.text.slice(0, 90) + "…" : c.text) : t("codes.binary");
      const acts = el("div", { class: "cact" }, add);
      if (c.text) acts.append(el("button", { type: "button", class: "btn btn-ghost", onclick: async ev => { try { await navigator.clipboard.writeText(c.text); ev.currentTarget.replaceChildren(ic("check"), t("codes.copied")); } catch {} } }, ic("copy"), t("codes.copy")));
      ul.append(el("li", { style: `--i:${i}` }, img, el("div", { class: "ctxt" }, el("small", {}, label), el("b", {}, shown)), acts));
    });
    parts.push(ul);
    say(t("ev.code"), "happy");
  }
  body.replaceChildren(...parts);
  mountOttos(body); mood(res.codes.length ? "happy" : "sad", 2000, body);
  body.querySelector("button,a")?.focus();
  return p;
}
async function addPass(c, d) {
  const pass = { id: db.uid(), docId: d.id, title: d.name, kind: c.kind, format: c.format || null, text: c.text, bytes: c.bytes || null, page: c.page, added: Date.now() };
  await db.put("passes", pass); S.passes.push(pass);
  say(t("ev.wallet"), "love");
  toast(t("ev.wallet"), { label: t("wallet.title"), fn: () => { closeViewer(); setTimeout(() => location.hash = "#/wallet", 50); } });
}
const passColors = id => { let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const P = [["#2a7d84", "#5b4bb7"], ["#b23a5a", "#e07a3a"], ["#3a6fb2", "#2a9d8f"], ["#7b3fa0", "#d0508a"], ["#2f7d4a", "#2a7d84"], ["#9a5a2a", "#c03a4a"]]; return P[h % P.length]; };
function renderWallet() {
  const ul = $("#passes"); ul.replaceChildren();
  const list = [...S.passes].sort((a, b) => b.added - a.added);
  $("#walletEmpty").hidden = list.length > 0;
  if (!list.length) mountOttos($("#walletEmpty"));
  list.forEach((p, i) => {
    const [c1, c2] = passColors(p.id);
    const mini = el("div", { class: "mini" }, p.kind === "booking" ? el("span", { class: "code-txt" }, p.text) : ic("qr"));
    if (p.kind !== "booking") codeSVG(p).then(svg => { if (svg) { mini.innerHTML = svg; mini.firstElementChild?.setAttribute("aria-hidden", "true"); } else mini.replaceChildren(el("span", { class: "code-txt" }, p.text || "?")); });
    const doc = docById(p.docId);
    const sub = (p.loyalty ? t("add.loyalty") + " · " : "") + (p.kind === "booking" ? t("codes.bookingShort") : formatName(p.format)) + (doc ? " · " + t("wallet.from", { name: doc.name }) : "");
    const li = el("li", { class: "pass", style: `--p1:${c1};--p2:${c2};--i:${i}` },
      el("h3", {}, p.title), el("p", { class: "from" }, sub), mini,
      el("div", { class: "row" },
        el("button", { type: "button", class: "btn", onclick: () => showPass(p) }, ic("eye"), t("wallet.show")),
        p.kind !== "booking" ? el("button", { type: "button", class: "btn", onclick: () => toAppleWallet(p) }, ic("wallet"), "Apple Wallet") : null,
        p.kind !== "booking" ? el("button", { type: "button", class: "btn", onclick: () => toPhoneWallet(p) }, ic("wallet"), "Google Wallet") : null,
        doc ? el("button", { type: "button", class: "btn", onclick: () => openViewer(doc.id) }, ic("pdf"), t("wallet.openPdf")) : null,
        el("button", { type: "button", class: "icon-btn", "aria-label": t("doc.rename") + ": " + p.title, title: t("doc.rename"), onclick: async () => { const v = await promptBox(t("doc.rename"), t("wallet.name"), p.title); if (v) { p.title = v; delete p.pk; delete p.gUrl; await db.put("passes", p); renderWallet(); } } }, ic("edit")),
        el("button", { type: "button", class: "icon-btn", "aria-label": t("wallet.delete") + ": " + p.title, title: t("wallet.delete"), onclick: async () => { if (await confirmBox(t("wallet.delete"), p.title, t("common.delete"))) { await db.del("passes", p.id); S.passes = S.passes.filter(x => x.id !== p.id); renderWallet(); say(t("ev.delete"), "wiggle"); } } }, ic("trash"))));
    ul.append(li);
  });
}
let wake;
async function showPass(p) {
  const dlg = $("#passDlg");
  $("#passTitle").textContent = p.title;
  const box = $("#passCode"); box.replaceChildren();
  $("#passText").textContent = p.kind === "booking" ? p.text : (p.text && p.text.length < 40 ? p.text : "");
  if (p.kind !== "booking") { const svg = await codeSVG(p); if (svg) { box.innerHTML = svg; const s = box.querySelector("svg"); s.setAttribute("role", "img"); s.setAttribute("aria-label", formatName(p.format) + (p.text ? ": " + p.text : "")); } }
  $("#passSave").hidden = p.kind === "booking";
  $("#passSave").onclick = () => savePassImage(p, box.querySelector("svg"));
  dlg.showModal();
  try { wake = await navigator.wakeLock?.request("screen"); } catch {}
  dlg.onclose = () => { wake?.release?.(); wake = null; };
}
$("#passClose").onclick = () => $("#passDlg").close();
// Immagine nitida del codice con il titolo sopra (per la galleria o per Google Wallet «Tutto il resto»)
async function passImage(p, svg) {
  svg ||= new DOMParser().parseFromString(await codeSVG(p) || "<svg/>", "image/svg+xml").documentElement;
  const xml = new XMLSerializer().serializeToString(svg);
  const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  await img.decode();
  const W = 1000, k = W / (img.naturalWidth || 300), H = Math.round((img.naturalHeight || 300) * k);
  const c = el("canvas"); c.width = W + 160; c.height = H + 260;
  const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = "#2b1d4a"; x.font = "800 56px Nunito, sans-serif"; x.textAlign = "center";
  x.fillText(p.title.length > 30 ? p.title.slice(0, 29) + "…" : p.title, c.width / 2, 110, c.width - 80);
  x.imageSmoothingEnabled = false; x.drawImage(img, 80, 180, W, H);
  const blob = await new Promise(r => c.toBlob(r, "image/png"));
  return new File([blob], p.title.replace(/[\\/:*?"<>|]+/g, "_") + ".png", { type: "image/png" });
}
function downloadFile(f) { const u = URL.createObjectURL(f); el("a", { href: u, download: f.name }).click(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
async function savePassImage(p, svg) {
  if (!svg) return;
  const f = await passImage(p, svg);
  try { if (navigator.canShare?.({ files: [f] })) return await navigator.share({ files: [f], title: p.title }); } catch { return; }
  downloadFile(f);
}
// Wallet del telefono: Google Wallet accetta passi creati da una foto del codice («Tutto il resto» / «Foto»).
// Apple Wallet accetta solo pass firmati dall'emittente: niente modo manuale.
async function toPhoneWallet(p) {
  if (p.gUrl || wwReady(p)) { if (await googleDirect(p, wwKey() || null)) return; }
  const steps = el("ol", { class: "wsteps" },
    el("li", {}, el("span", {}, t("gw.step1")), el("button", { type: "button", class: "btn btn-primary", onclick: async ev => { const b = ev.currentTarget; downloadFile(await passImage(p)); b.replaceChildren(ic("check"), t("codes.added")); } }, ic("download"), t("gw.save"))),
    el("li", {}, el("span", {}, t("gw.step2")), el("a", { class: "btn btn-soft", href: IS_ANDROID ? "intent://#Intent;package=com.google.android.apps.walletnfcrel;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.google.android.apps.walletnfcrel;end" : "https://wallet.google.com/", target: "_blank", rel: "noopener" }, ic("wallet"), t("gw.open"))),
    el("li", {}, el("span", {}, t("gw.step3"))));
  const key = wwKey();
  await dialog({ title: t("gw.title"), body: [steps, key ? null : el("p", { class: "muted tip" }, t("gw.oneTap"), " ", el("button", { type: "button", class: "linkish", onclick: () => { $("#dlg").close(); keyGuide(); } }, t("aw.howTo")))].filter(Boolean) });
}
// Apple Wallet vuole pass firmati: li firma WalletWallet (servizio gratuito con certificato Apple). Il codice va a loro.
// Con una chiave gratuita (1000 pass al mese) dell'utente il pass si crea con un tocco; la chiave resta nel dispositivo.
const AW_API = { QRCode: "QR", MicroQRCode: "QR", RMQRCode: "QR", DataMatrix: "QR", Aztec: "Aztec", PDF417: "PDF417", CompactPDF417: "PDF417" };
const awFmt = f => AW_API[f] || "Code128"; // i codici a barre lineari (EAN, Code 39…) diventano Code 128 con lo stesso numero
const AW_COLOR = ["blue", "red", "green", "purple", "orange", "dark"];
// Un'unica chiamata a WalletWallet crea il pass per entrambi i wallet: .pkpass (Apple) + link «Salva in Google Wallet».
// Il risultato si conserva nella carta (p.pk, p.gUrl) così non si consuma altra quota.
const b64blob = (b64, type) => new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))], { type });
async function wwCall(path, body, key) {
  const base = key ? "https://api.walletwallet.dev/api" : WALLET_PROXY.replace(/\/$/, "");
  return fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json", ...(key ? { Authorization: "Bearer " + key } : {}) }, body: JSON.stringify(body) });
}
async function makePass(p, key) {
  if (p.pk || p.gUrl) return { pk: p.pk || null, gUrl: p.gUrl || null };
  const body = { barcodeValue: p.text.slice(0, 512), barcodeFormat: awFmt(p.format), barcodeAltText: p.text.length <= 40 ? p.text : undefined, title: (p.title || "Ottoteca").slice(0, 64), logoText: (p.title || "Ottoteca").slice(0, 64), organizationName: "Ottoteca", description: (p.title || "Pass").slice(0, 128), colorPreset: AW_COLOR[parseInt(p.id.slice(-2), 36) % AW_COLOR.length || 0], sharingProhibited: false };
  let r = await wwCall("/passes", body, key), pk = null, gUrl = null;
  if (r.status === 404 || r.status === 405) { // servizio senza /passes: vecchio /pkpass, il link Google arriva nell'intestazione
    delete body.barcodeAltText;
    r = await wwCall("/pkpass", body, key);
    if (r.ok) { gUrl = r.headers.get("X-Google-Save-Url"); pk = new Blob([await r.blob()], { type: "application/vnd.apple.pkpass" }); }
  } else if (r.ok) {
    const j = await r.json();
    if (j.applePass) pk = b64blob(j.applePass, "application/vnd.apple.pkpass");
    gUrl = j.googleSaveUrl || null;
  }
  if (!r.ok) { let m = ""; try { m = (await r.json()).error || ""; } catch {} throw new Error(r.status + (m ? " " + m : "")); }
  p.pk = pk; p.gUrl = gUrl && /^https:\/\/pay\.google\.com\//.test(gUrl) ? gUrl : null;
  await db.put("passes", p);
  return { pk: p.pk, gUrl: p.gUrl };
}
function wwError(e, key) {
  mood("sad", 1500);
  const m = String(e.message);
  if (!key && m.startsWith("429")) toast(t(m.includes("slow") ? "aw.slow" : "aw.shared"), m.includes("slow") ? null : { label: t("aw.howTo"), fn: keyGuide });
  else toast(t(m.startsWith("401") ? "aw.badKey" : m.startsWith("429") ? "aw.limit" : "aw.fail"));
}
const wwKey = () => (localStorage.getItem("otto.awkey") || "").trim();
const wwReady = p => p.text && (wwKey() || WALLET_PROXY);
async function appleDirect(p, key) {
  mood("think", 0);
  try {
    const { pk } = await makePass(p, key);
    if (!pk) throw new Error("500");
    const url = URL.createObjectURL(pk);
    const a = el("a", { href: url, download: (p.title || "pass").replace(/[^\w.-]+/g, "_").slice(0, 40) + ".pkpass" });
    if (IS_IOS) a.removeAttribute("download"); // Safari apre «Aggiungi a Wallet»
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    mood(null); say(t("ev.wallet"), "love");
    return true;
  } catch (e) { wwError(e, key); return false; }
}
// Google Wallet automatico: il link ufficiale «Salva in Google Wallet» (va aperto con un tocco, non da solo)
async function googleDirect(p, key) {
  if (p.gUrl) { open(p.gUrl, "_blank", "noopener"); say(t("ev.wallet"), "love"); return true; }
  mood("think", 0);
  try {
    const { gUrl } = await makePass(p, key);
    mood(null);
    if (!gUrl) return false;
    toast(t("gw.ready"), { label: t("gw.addNow"), fn: () => { open(gUrl, "_blank", "noopener"); say(t("ev.wallet"), "love"); } });
    return true;
  } catch (e) { wwError(e, key); return false; }
}
async function toAppleWallet(p) {
  const key = wwKey();
  if ((p.pk || wwReady(p)) && await appleDirect(p, key || null)) return;
  const fmt = { QR: "QR", PDF417: "PDF417", Aztec: "Aztec", Code128: "Code 128" }[awFmt(p.format)];
  const value = p.text || "";
  const steps = el("ol", { class: "wsteps" },
    el("li", {}, el("span", {}, t("aw.step1")), value
      ? el("button", { type: "button", class: "btn btn-primary", onclick: async ev => { const b = ev.currentTarget; try { await navigator.clipboard.writeText(value); b.replaceChildren(ic("check"), t("codes.copied")); } catch { b.replaceChildren(value); } } }, ic("copy"), t("aw.copy"))
      : el("button", { type: "button", class: "btn btn-primary", onclick: async ev => { const b = ev.currentTarget; downloadFile(await passImage(p)); b.replaceChildren(ic("check"), t("codes.added")); } }, ic("download"), t("gw.save"))),
    el("li", {}, el("span", {}, t("aw.step2")), el("a", { class: "btn btn-soft", href: "https://walletwallet.alen.ro/", target: "_blank", rel: "noopener" }, ic("wallet"), t("aw.open"))),
    el("li", {}, el("span", {}, t("aw.step3", { f: fmt }))));
  await dialog({ title: t("aw.title"), body: [steps, el("p", { class: "muted tip" }, t("aw.privacy")), key ? null : el("p", { class: "muted tip" }, t("aw.oneTap"), " ", el("button", { type: "button", class: "linkish", onclick: () => { $("#dlg").close(); keyGuide(); } }, t("aw.howTo")))].filter(Boolean) });
}
// Inserimento manuale: qualsiasi QR o codice a barre (biglietti, carte fedeltà), da fotocamera, immagine o a mano
// Tipo scelto da solo: chi usa l'app non deve sapere cos'è un EAN
const gtinOk = d => { const n = d.split("").map(Number), c = n.pop(); const s = n.reverse().reduce((a, x, i) => a + x * (i % 2 ? 1 : 3), 0); return (10 - s % 10) % 10 === c; };
function autoFormat(text, loyalty) {
  if (/^\d{13}$/.test(text) && gtinOk(text)) return "EAN13";
  if (/^\d{8}$/.test(text) && gtinOk(text)) return "EAN8";
  if (/^\d{12}$/.test(text) && gtinOk(text)) return "UPCA";
  if (/^[\x20-\x7e]{1,24}$/.test(text) && (loyalty || /^[\dA-Z-]+$/.test(text))) return "Code128"; // numeri di tessere e codici brevi: codice a barre
  return "QRCode";
}
const MANUAL_FMT = [["auto", ""], ["QRCode", "QR"], ["Code128", "Code 128"], ["EAN13", "EAN-13"], ["EAN8", "EAN-8"], ["Code39", "Code 39"], ["PDF417", "PDF417"], ["Aztec", "Aztec"], ["DataMatrix", "Data Matrix"]];
async function addCodeDialog(pre = {}) {
  const name = el("input", { type: "text", id: "acName", value: pre.title || "", maxlength: 80, autocomplete: "off" });
  const value = el("input", { type: "text", id: "acValue", value: pre.text || "", autocomplete: "off", inputmode: "text" });
  const chosen = pre.manualFmt || "auto";
  const fmt = el("select", { id: "acFmt", class: "select" }, MANUAL_FMT.map(([v, l]) => el("option", { value: v, selected: v === chosen ? true : null }, v === "auto" ? t("add.auto") : l)));
  const loyalty = el("input", { type: "checkbox", id: "acLoyal", checked: pre.loyalty ? true : null });
  const fromCam = el("button", { type: "button", class: "btn btn-soft", onclick: () => { $("#dlg").close("cam"); } }, ic("qr"), t("add.scan"));
  const fromImg = el("button", { type: "button", class: "btn btn-soft", onclick: () => { $("#dlg").close("img"); } }, ic("file-plus"), t("add.fromImg"));
  const v = await dialog({
    title: t("wallet.add"),
    body: [el("div", { class: "addsrc" }, fromCam, fromImg),
      el("label", { class: "lbl", for: "acName" }, t("wallet.name")), name,
      el("label", { class: "lbl", for: "acValue" }, t("add.value")), value,
      el("label", { class: "check" }, loyalty, " ", t("add.loyalty")),
      el("details", { class: "adv", open: chosen !== "auto" ? true : null }, el("summary", {}, t("add.more")),
        el("label", { class: "lbl", for: "acFmt" }, t("add.format")), fmt)],
    actions: [{ label: t("common.cancel"), value: "cancel" }, { label: t("common.save"), value: "ok", cls: "btn-primary" }]
  });
  const draft = { title: name.value.trim(), text: value.value.trim(), manualFmt: fmt.value, scanned: pre.text === value.value.trim() ? pre.scanned : null, loyalty: loyalty.checked };
  draft.format = draft.manualFmt !== "auto" ? draft.manualFmt : draft.scanned || autoFormat(draft.text, draft.loyalty);
  if (v === "cam" || v === "img") {
    const input = $(v === "cam" ? "#codePhoto" : "#codeImage");
    input.onchange = async () => {
      const f = input.files[0]; input.value = "";
      if (!f) return addCodeDialog(draft);
      mood("think", 0);
      let r = null; try { r = await readImage(f); } catch {}
      mood(null);
      if (r) { say(t("add.found"), "happy"); addCodeDialog({ ...draft, ...r, scanned: r.format, manualFmt: "auto", title: draft.title || f.name.replace(/\.[^.]+$/, "") }); }
      else { toast(t("add.notFound")); mood("sad", 1200); addCodeDialog(draft); }
    };
    input.click(); return;
  }
  if (v !== "ok") return;
  if (!draft.text && !pre.bytes) { toast(t("add.value")); return addCodeDialog(draft); }
  const pass = { id: db.uid(), docId: null, title: draft.title || t(draft.loyalty ? "add.loyalty" : "kind.event"), kind: "barcode", format: draft.format, text: draft.text, bytes: draft.text ? null : pre.bytes || null, loyalty: draft.loyalty, added: Date.now() };
  if (!(await codeSVG(pass))) { toast(t("add.bad")); return addCodeDialog(draft); }
  await db.put("passes", pass); S.passes.push(pass);
  renderWallet(); say(t("ev.wallet"), "love");
  const r = $("#buddyBtn").getBoundingClientRect(); confetti(r.left + r.width / 2, r.top, 26);
}
$("#addCode").onclick = () => addCodeDialog();
/* ================= impostazioni ================= */
function renderRoots() {
  const ul = $("#rootsList"); ul.replaceChildren();
  if (!CAN_LINK) { $("#rootsCard").hidden = true; return; }
  if (!S.roots.length) ul.append(el("li", { class: "muted" }, t("roots.none")));
  for (const r of S.roots) {
    const n = S.docs.filter(d => d.rootId === r.id).length;
    ul.append(el("li", {}, el("span", { class: "ic ic-folder", "aria-hidden": "true" }), el("span", { class: "rname" }, el("b", {}, r.name), el("small", {}, t("roots.count", { n }))),
      el("button", { type: "button", class: "btn btn-soft", onclick: async () => { if (await askPerm(r, true)) await scanRoot(r, false); renderRoots(); } }, ic("refresh"), t("roots.refresh")),
      el("button", { type: "button", class: "icon-btn", "aria-label": t("roots.unlink") + ": " + r.name, title: t("roots.unlink"), onclick: () => unlinkRoot(r) }, ic("trash"))));
  }
}
async function renderSettings() {
  renderRoots();
  const sel = $("#langSel");
  if (!sel.options.length) for (const [c, n] of Object.entries(LANGS).sort((a, b) => a[1].localeCompare(b[1]))) sel.append(el("option", { value: c, lang: c }, n));
  sel.value = lang();
  $("#versionInfo").textContent = t("set.version", { v: VERSION });
  try { const e = await navigator.storage?.estimate(); if (e) $("#storageInfo").textContent = t("set.storage", { used: size(e.usage || 0) }); } catch {}
}
$("#langSel").onchange = async e => { localStorage.setItem("otto.lang", e.target.value); await setLang(e.target.value); afterLang(); say(t("ev.lang"), "happy"); };
document.querySelectorAll("input[name=theme]").forEach(r => r.onchange = () => { localStorage.setItem("otto.theme", r.value); applyTheme(); mood("trick"); });
document.querySelectorAll("input[name=textsize]").forEach(r => r.onchange = () => { localStorage.setItem("otto.text", r.value); applyTextSize(); mood("happy", 1200); });
// Guida per la chiave WalletWallet personale: 3 passi con Otto, incolla e salva
// formato largo: le chiavi vere possono essere più lunghe o con altri caratteri di «ww_live_» + 32 esadecimali
const KEY_RE = /^ww_[a-z]+_[A-Za-z0-9_-]{16,200}$/;
function saveKey(v, quiet) {
  v = cleanKey(v);
  if (v && !KEY_RE.test(v)) { if (!quiet) toast(t("aw.badFmt")); return false; }
  if (v) localStorage.setItem("otto.awkey", v); else localStorage.removeItem("otto.awkey");
  $("#awKey").value = v;
  if (v) { say(t("aw.saved"), "love"); const r = $("#buddyBtn").getBoundingClientRect(); confetti(r.left + r.width / 2, r.top, 20); }
  return true;
}
// Il sito della chiave non si può leggere da qui (altro sito, protetto dall'accesso): l'utente copia, l'app fa il resto.
const KEY_FIND = /ww_[a-z]+_[A-Za-z0-9_-]{16,200}/;
let keyWatch = null;
// Si aspetta la chiave anche se la finestra si chiude (tasto Indietro, cambio app, ricarica): il segno resta in localStorage.
const cleanKey = v => (v || "").replace(/[\s\u200B-\u200D\u2060\uFEFF]+/g, "");
const waitingKey = () => { const w = +localStorage.getItem("otto.awWait") || 0; return w && Date.now() - w < 30 * 60000 && !localStorage.getItem("otto.awkey"); };
async function keyFromClipboard(ask) {
  let granted = false;
  try { granted = (await navigator.permissions.query({ name: "clipboard-read" })).state === "granted"; } catch {}
  if (!granted && !ask) return false;
  try { const m = (await navigator.clipboard.readText() || "").match(KEY_FIND); if (m && saveKey(m[0], true)) { localStorage.removeItem("otto.awWait"); return true; } } catch {}
  return false;
}
document.addEventListener("visibilitychange", async () => {
  if (document.hidden || !waitingKey()) return;
  if (await keyFromClipboard(false)) { if ($("#dlg").open && $("#gKey")) $("#dlg").close("saved"); return; }
  if (!($("#dlg").open && $("#gKey"))) keyGuide(null, true);
  else { const pb = $("#gPaste"); pb?.classList.replace("btn-soft", "btn-primary"); pb?.focus(); say(t("aw.back"), "wave", { ms: 5000 }); }
});
async function keyGuide(bad, back) {
  const d = $("#dlg");
  const inp = el("input", { type: "text", id: "gKey", autocomplete: "off", spellcheck: "false", placeholder: "ww_live_…", value: localStorage.getItem("otto.awkey") || "" });
  const done = v => { inp.value = v; d.close("ok"); };
  const tryText = txt => { const m = (txt || "").match(KEY_FIND); if (m) { done(m[0]); return true; } return false; };
  const paste = el("button", { type: "button", class: back ? "btn btn-primary" : "btn btn-soft", id: "gPaste", onclick: async () => { let txt = ""; try { txt = await navigator.clipboard.readText(); } catch {} if (!tryText(txt)) { if (txt) inp.value = txt.trim(); inp.focus(); } } }, ic("copy"), t("aw.paste"));
  // solo quando la chiave arriva tutta insieme (incolla/riempimento), mai mentre si scrive a mano: si salverebbe a metà
  let prevLen = inp.value.length;
  inp.addEventListener("input", e => { const jump = inp.value.length - prevLen; prevLen = inp.value.length; if (jump > 8 || /^insertFrom/.test(e.inputType || "")) tryText(inp.value); });
  inp.addEventListener("paste", e => { if (tryText(e.clipboardData?.getData("text"))) e.preventDefault(); });
  const steps = el("ol", { class: "wsteps" },
    el("li", {}, el("span", {}, t("aw.g1")), el("a", { class: "btn btn-primary", href: "https://walletwallet.dev/signup/", target: "_blank", rel: "noopener", onclick: () => localStorage.setItem("otto.awWait", Date.now()) }, ic("wallet"), t("aw.getKey"))),
    el("li", {}, el("span", {}, t("aw.g2"))),
    el("li", {}, el("span", {}, t("aw.g3")), el("label", { class: "lbl", for: "gKey" }, t("aw.key")), inp, paste));
  const otto = el("div", { class: "guide-otto", "data-otto": "", "aria-hidden": "true" });
  if (typeof bad !== "string") bad = null;
  if (bad) inp.value = bad.trim();
  const err = bad ? el("p", { class: "form-err", role: "alert" }, t("aw.badFmt")) : null;
  const v = await dialog({ title: t("aw.guideTitle"), body: [otto, steps, err, el("p", { class: "muted tip" }, t("aw.keyLocal"))].filter(Boolean),
    onOpen: dd => { mountOttos(dd); mood("wave", 1600, dd); if (back) { paste.focus(); say(t("aw.back"), "wave", { ms: 5000 }); } },
    actions: [{ label: t("common.cancel"), value: "cancel" }, { label: t("common.save"), value: "ok", cls: "btn-primary" }] });
  if (v === "saved") return;
  const val = cleanKey(inp.value);
  // anche se la finestra si chiude in altro modo, una chiave valida già scritta non va persa
  if (v !== "ok") { if (val && KEY_RE.test(val) && val !== localStorage.getItem("otto.awkey")) { saveKey(val); localStorage.removeItem("otto.awWait"); } return; }
  if (!saveKey(val, true)) return keyGuide(inp.value || " ");
  localStorage.removeItem("otto.awWait");
}
$("#awGuide").onclick = () => keyGuide();
$("#awKey").value = localStorage.getItem("otto.awkey") || "";
$("#awKey").onchange = e => saveKey(e.target.value);
$("#awKey").addEventListener("paste", e => { const m = (e.clipboardData?.getData("text") || "").match(KEY_FIND); if (m) { e.preventDefault(); saveKey(m[0]); } });
$("#awSave").onclick = () => saveKey($("#awKey").value);
if (WALLET_PROXY) $("#awHint").dataset.i18n = "aw.keyHintShared";
document.querySelectorAll("input[name=motion]").forEach(r => r.onchange = () => { localStorage.setItem("otto.motion", r.value); applyTheme(); });
$("#clearAll").onclick = async () => {
  if (!(await confirmBox(t("set.clear"), t("set.clearConfirm"), t("common.delete")))) return;
  await db.clearAll(); thumbURLs.forEach(u => URL.revokeObjectURL(u)); thumbURLs.clear();
  await loadAll(); S.filter = "all"; renderLibrary(); renderWallet(); renderSettings(); say(t("ev.delete"), "wiggle");
};

/* ================= navigazione ================= */
function route() {
  const h = location.hash || "#/";
  const m = h.match(/^#\/doc\/(.+)$/);
  if (m) { if (!cur || cur.id !== m[1]) openViewer(m[1]); return; }
  if (cur || !$("#viewer").hidden) { closeViewer(true); $("#viewer").hidden = true; document.body.style.overflow = ""; renderLibrary(); }
  const tab = h.startsWith("#/wallet") ? "wallet" : h.startsWith("#/settings") ? "settings" : "library";
  for (const v of ["library", "wallet", "settings"]) $("#view-" + v).hidden = v !== tab;
  document.querySelectorAll(".tabs a").forEach(a => a.dataset.tab === tab ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  if (tab === "wallet") renderWallet();
  if (tab === "settings") renderSettings();
  document.title = (tab === "library" ? "" : t("nav." + tab) + " · ") + "Ottoteca";
}
addEventListener("hashchange", route);
document.querySelectorAll(".tabs a").forEach(a => a.addEventListener("click", () => setTimeout(() => $("#main").focus({ preventScroll: true }), 0)));

/* ================= eventi della libreria ================= */
const pick = () => $("#fileInput").click();
$("#scanBtn").onclick = $("#emptyScan").onclick = () => smartFind();
$("#rootAdd").onclick = () => linkFolder();
$("#permBtn").onclick = async () => { for (const r of S.roots) if (await askPerm(r, true)) await scanRoot(r, true); updatePermBar(); };
$("#addDirBtn").onclick = () => $("#dirInput").click();
$("#dirInput").onchange = async e => { const fs = [...e.target.files].filter(f => /\.pdf$/i.test(f.name) && !/(^|\/)(\.|android\/(data|obb)\/)/i.test(f.webkitRelativePath || "")); e.target.value = ""; if (fs.length) { await importFiles(fs); } else toast(t("folder.noPdf")); };
document.querySelectorAll("input[name=vmode]").forEach(r => r.onchange = () => { S.mode = r.value; localStorage.setItem("otto.mode", r.value); if (S.selecting) setSelecting(false); else renderLibrary(); mood("wiggle", 900); });
document.querySelectorAll("input[name=basis]").forEach(r => r.onchange = () => { S.basis = r.value; localStorage.setItem("otto.basis", r.value); renderLibrary(); });
S.folder = localStorage.getItem("otto.folder") || null;
$("#addBtn").onclick = $("#emptyAdd").onclick = () => chooseSource();
$("#fileInput").onchange = e => { importFiles(e.target.files); e.target.value = ""; };
let qT; $("#q").addEventListener("input", e => { clearTimeout(qT); qT = setTimeout(() => { S.q = e.target.value; renderLibrary(); }, 140); });
$("#sort").value = S.sort; $("#sort").onchange = e => { S.sort = e.target.value; localStorage.setItem("otto.sort", S.sort); renderLibrary(); };
$("#newCatBtn").onclick = async () => { const c = await newCat(); if (c) { S.filter = c.id; renderLibrary(); } };
// Backspace o Alt+↑ risale di una cartella
addEventListener("keydown", e => { if (S.mode === "folders" && S.folder && $("#viewer").hidden && !document.querySelector("dialog[open]") && !e.target.closest("input,select,textarea") && (e.key === "Backspace" || (e.altKey && e.key === "ArrowUp"))) { e.preventDefault(); goFolder(catById(S.folder)?.parent || null); } });
$("#selectBtn").onclick = () => setSelecting(!S.selecting);
$("#selDone").onclick = () => setSelecting(false);
$("#selCats").onclick = () => S.sel.size && assignCats([...S.sel]);
$("#selDel").onclick = () => S.sel.size && deleteDocs([...S.sel]);
addEventListener("keydown", e => {
  if (e.key === "Escape" && S.selecting && $("#viewer").hidden && !document.querySelector("dialog[open]")) setSelecting(false);
  if (e.key === "/" && !e.target.closest("input,textarea,select") && $("#viewer").hidden && !$("#view-library").hidden) { e.preventDefault(); $("#q").focus(); }
});
// trascina e rilascia file dal sistema
{
  let depth = 0; const dz = $("#dropzone");
  const hasFiles = e => [...(e.dataTransfer?.types || [])].includes("Files");
  addEventListener("dragenter", e => { if (!hasFiles(e)) return; depth++; dz.hidden = false; mountOttos(dz); mood("surprised", 900); mood("happy", 0, dz); });
  addEventListener("dragleave", e => { if (!hasFiles(e)) return; if (--depth <= 0) { depth = 0; dz.hidden = true; } });
  addEventListener("dragover", e => { if (hasFiles(e)) e.preventDefault(); });
  addEventListener("drop", e => { if (!hasFiles(e)) return; e.preventDefault(); depth = 0; dz.hidden = true; if (!$("#viewer").hidden) closeViewer(); location.hash = "#/"; importFiles(e.dataTransfer.files); });
}

/* ================= PDF del dispositivo: cartelle collegate (File System Access) ================= */
// Un sito non può leggere tutto il telefono da solo: l'utente sceglie una o più cartelle, Ottoteca trova
// tutti i PDF dentro (anche nelle sottocartelle) senza copiarli e li ricontrolla a ogni apertura.
const CAN_LINK = "showDirectoryPicker" in window;
const IS_ANDROID = /android/i.test(navigator.userAgent);
const IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
async function askPerm(root, ask) {
  try {
    if ((await root.handle.queryPermission({ mode: "read" })) === "granted") return true;
    if (ask && (await root.handle.requestPermission({ mode: "read" })) === "granted") return true;
  } catch {}
  return false;
}
async function updatePermBar() {
  let need = false;
  for (const r of S.roots) if (!(await askPerm(r, false))) need = true;
  $("#permBar").hidden = !need;
}
async function* walk(dir, path = "", depth = 0) {
  if (depth > 14) return;
  for await (const [name, h] of dir.entries()) {
    if (name.startsWith(".")) continue;
    if (h.kind === "directory") { if (!/^(android|node_modules|\$recycle\.bin|system volume information|thumbnails|cache)$/i.test(name)) yield* walk(h, path + name + "/", depth + 1); }
    else if (/\.pdf$/i.test(name)) yield { handle: h, path: path + name, name };
  }
}
// Una sola domanda semplice: «Dove sono i tuoi PDF?» → i PDF (anche tutti quelli di Download) o una cartella.
// Un solo tocco: apre la scelta migliore per il dispositivo (il browser non permette di leggere da solo)
const IOS_VER = (() => { const m = navigator.userAgent.match(/OS (\d+)_(\d+)/) || navigator.userAgent.match(/Version\/(\d+)\.(\d+)/); return m ? +m[1] + +m[2] / 100 : 0; })();
const CAN_DIR_INPUT = "webkitdirectory" in document.createElement("input") && (!IS_IOS || IOS_VER >= 18.04);
function findHint() {
  if (IS_ANDROID && CAN_DIR_INPUT) return t("find.android");
  if (IS_ANDROID && CAN_LINK) return t("pick.filesAndroid");
  if (IS_IOS) return CAN_DIR_INPUT ? t("find.ios") : t("scan.noApi");
  return CAN_LINK ? t("pick.folderHint") : t("scan.noApi");
}
function smartFind() {
  if (IS_ANDROID && CAN_DIR_INPUT) return $("#dirInput").click(); // come Schiaccia PDF: si può scegliere anche tutta la memoria
  if (IS_ANDROID && CAN_LINK) return pickHandles();
  if (CAN_LINK) return linkFolder();
  if (CAN_DIR_INPUT) return $("#dirInput").click();
  return pick();
}
async function chooseSource() {
  const opt = (icon, title, hint, value, primary) => el("button", { type: "submit", value, class: "source" + (primary ? " primary" : "") },
    el("span", { class: "ic ic-" + icon, "aria-hidden": "true" }), el("span", {}, el("b", {}, title), el("small", {}, hint)));
  const v = await dialog({
    title: t("pick.title"),
    body: [el("div", { class: "sources" },
      IS_ANDROID && CAN_DIR_INPUT ? opt("phone-search", t("find.btn"), t("find.android"), "dir", true) : null,
      opt("file-plus", t("scan.add"), CAN_LINK ? (IS_ANDROID ? t("pick.filesAndroid") : t("pick.files")) : t("scan.noApi"), "files", !(IS_ANDROID && CAN_DIR_INPUT)),
      CAN_LINK ? opt("folder-plus", t("pick.folder"), t("pick.folderHint"), "folder") : CAN_DIR_INPUT ? opt("folder-plus", t("folder.import"), t("find.ios"), "dir") : null),
      el("p", { class: "muted tip" }, el("span", { class: "ic ic-share", "aria-hidden": "true" }), " ", t("pick.share"))],
    actions: [{ label: t("common.cancel"), value: "cancel" }],
    onOpen: d => d.querySelector(".source.primary")?.focus()
  });
  if (v === "files") return CAN_LINK ? pickHandles() : pick();
  if (v === "dir") return $("#dirInput").click();
  if (v === "folder") return linkFolder();
}
// PDF scelti uno per uno (o «Seleziona tutto» in Download): si tengono i riferimenti, niente copie.
async function pickHandles() {
  let hs;
  try { hs = await showOpenFilePicker({ id: "otto-pdf", multiple: true, startIn: "downloads", types: [{ description: "PDF", accept: { "application/pdf": [".pdf"] } }], excludeAcceptAllOption: false }); }
  catch (e) { if (e?.name !== "AbortError") pick(); return; }
  let added = 0, last;
  for (const h of hs) {
    let f; try { f = await h.getFile(); } catch { continue; }
    if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") { toast(t("import.notPdf", { name: f.name })); continue; }
    const dup = S.docs.find(d => d.src === "fs" && !d.rootId && d.path === f.name && d.size === f.size);
    if (dup) { dup.handle = h; await db.put("docs", dup); continue; }
    const tgt = importTarget();
    const d = { id: db.uid(), src: "fs", rootId: null, path: f.name, handle: h, name: f.name.replace(/\.pdf$/i, ""), size: f.size, mtime: f.lastModified,
      pages: 0, thumb: null, text: "", added: Date.now(), opened: 0, cats: tgt ? [tgt] : [], pending: true };
    await db.put("docs", d); S.docs.push(d); enqueue(d); added++; last = d.id;
  }
  if (!added) return;
  if (location.hash !== "#/" && location.hash !== "") location.hash = "#/";
  renderLibrary(last);
  const r = $("#buddyBtn").getBoundingClientRect(); confetti(r.left + r.width / 2, r.top, 30);
  say(t(added > 3 ? "ev.scan" : "ev.import"), "happy");
  toast(t("import.done", { n: added }));
  if (!persistAsked && navigator.storage?.persist) { persistAsked = true; navigator.storage.persist().catch(() => {}); }
}
async function linkFolder() {
  if (!CAN_LINK) return pick();
  let handle;
  try { handle = await showDirectoryPicker({ id: "ottoteca", mode: "read", startIn: "documents" }); } catch { return; }
  for (const r of S.roots) if (await r.handle.isSameEntry?.(handle)) return scanRoot(r, false);
  const root = { id: db.uid(), name: handle.name || "PDF", handle, added: Date.now(), excluded: [] };
  await db.put("roots", root); S.roots.push(root);
  if (location.hash !== "#/" && location.hash !== "") location.hash = "#/";
  await scanRoot(root, false);
  renderRoots();
}
async function unlinkRoot(r) {
  if (!(await confirmBox(t("roots.unlink"), t("roots.unlinkConfirm", { name: r.name }), t("roots.unlink")))) return;
  const ids = S.docs.filter(d => d.rootId === r.id).map(d => d.id);
  for (const id of ids) { await db.removeDoc(id); const u = thumbURLs.get(id); if (u) { URL.revokeObjectURL(u); thumbURLs.delete(id); } }
  S.docs = S.docs.filter(d => d.rootId !== r.id);
  const cats = S.cats.filter(c => c.rootId === r.id).map(c => c.id);
  for (const c of cats) await db.del("cats", c);
  for (const d of S.docs) if (d.cats.some(c => cats.includes(c))) { d.cats = d.cats.filter(c => !cats.includes(c)); await db.put("docs", d); }
  S.cats = S.cats.filter(c => c.rootId !== r.id);
  await db.del("roots", r.id); S.roots = S.roots.filter(x => x.id !== r.id);
  renderRoots(); renderLibrary(); updatePermBar(); say(t("ev.delete"), "wiggle");
}
let scanning = false;
async function scanRoot(root, quiet) {
  if (scanning) return; scanning = true;
  try {
    if (!(await askPerm(root, !quiet))) { $("#permBar").hidden = false; return; }
    let rc = S.cats.find(c => c.rootId === root.id && !c.parent);
    if (!rc) { rc = { id: db.uid(), name: root.name, color: COLORS[S.cats.length % COLORS.length], order: Date.now(), parent: null, rootId: root.id }; await db.put("cats", rc); S.cats.push(rc); }
    const mine = new Map(S.docs.filter(d => d.rootId === root.id).map(d => [d.path, d]));
    const excl = new Set(root.excluded || []), seen = new Set();
    let found = 0, fresh = 0;
    if (!quiet) { mood("think", 0); say(t("scan.scanning", { name: root.name, n: 0 }), "think", { ms: 600000 }); }
    for await (const e of walk(root.handle)) {
      if (excl.has(e.path)) continue;
      seen.add(e.path); found++;
      let f; try { f = await e.handle.getFile(); } catch { continue; }
      let d = mine.get(e.path);
      if (!d) {
        d = { id: db.uid(), src: "fs", rootId: root.id, path: e.path, handle: e.handle, name: e.name.replace(/\.pdf$/i, ""), size: f.size, mtime: f.lastModified,
          pages: 0, thumb: null, text: "", added: f.lastModified || Date.now(), opened: 0, cats: [await folderFor(e.path, rc.id, root.id)], pending: true };
        await db.put("docs", d); S.docs.push(d); fresh++;
      } else if (d.mtime !== f.lastModified || d.size !== f.size) {
        Object.assign(d, { handle: e.handle, size: f.size, mtime: f.lastModified, pending: true }); await db.put("docs", d);
      } else d.handle = e.handle;
      if (d.pending) enqueue(d);
      if (!quiet && found % 20 === 0) { bubble.setAttribute("aria-live", "off"); bubble.textContent = t("scan.scanning", { name: root.name, n: found }); }
    }
    const gone = [...mine.values()].filter(d => !seen.has(d.path));
    for (const d of gone) await db.removeDoc(d.id);
    if (gone.length) S.docs = S.docs.filter(d => !gone.includes(d));
    root.lastScan = Date.now(); await db.put("roots", root);
    mood(null);
    renderLibrary();
    if (!quiet || fresh) {
      if (found) { say(t("ev.scan"), "happy"); toast(t("scan.done", { name: root.name, n: found })); const r = $("#buddyBtn").getBoundingClientRect(); confetti(r.left + r.width / 2, r.top, 30); }
      else say(t("scan.none", { name: root.name }), "sad");
    }
    if (!quiet && !persistAsked && navigator.storage?.persist) { persistAsked = true; navigator.storage.persist().catch(() => {}); }
  } finally { scanning = false; updatePermBar(); }
}
// Miniature e testo, uno alla volta, senza bloccare l'interfaccia
const queue = []; let working = false;
function enqueue(d) { if (!queue.includes(d)) queue.push(d); if (!working) work(); }
async function work() {
  working = true;
  while (queue.length) {
    const d = queue.shift();
    try {
      const buf = await (await d.handle.getFile()).arrayBuffer();
      try { Object.assign(d, await analyze(buf), { locked: false }); } catch (e) { if (isPasswordError(e)) d.locked = true; }
      if (d.kindManual === undefined) d.kind = classify(d.text, d.name);
    } catch {}
    d.pending = false;
    if (S.docs.includes(d)) { await db.put("docs", d); updateCard(d); }
    await new Promise(r => setTimeout(r, 30));
  }
  working = false;
}
function updateCard(d) {
  const old = document.querySelector(`#view-library [data-id="${d.id}"]`);
  if (!old) return;
  const i = [...old.parentNode.children].indexOf(old);
  const n = docCard(d, i, old.querySelector(".doc-time") ? (S.basis === "opened" ? d.opened : d.added) : 0);
  n.style.animation = "none";
  old.replaceWith(n);
}
async function setupDevice() {
  $("#scanNote").textContent = findHint();
  if (!CAN_LINK || !S.roots.length) return;
  await updatePermBar();
  for (const r of S.roots) if (await askPerm(r, false)) await scanRoot(r, true);
  for (const d of S.docs) if (d.pending && d.src === "fs") enqueue(d);
}

/* ================= installazione e aggiornamenti ================= */
let deferredPrompt;
const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredPrompt = e; $("#installBtn").hidden = false; });
addEventListener("appinstalled", () => { $("#installBtn").hidden = true; confetti(); say(t("ev.installed"), "love"); });
if (isIOS && !standalone()) $("#installBtn").hidden = false;
$("#installBtn").onclick = async () => {
  if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; $("#installBtn").hidden = true; return; }
  dialog({ title: t("install.iosTitle"), body: el("p", {}, t("install.ios")) });
};
function registerSW() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  let wantReload = false;
  navigator.serviceWorker.register("sw.js").then(reg => {
    const ask = w => toast(t("update.ready"), { label: t("update.reload"), fn: () => { wantReload = true; w.postMessage("skip"); } });
    if (reg.waiting && navigator.serviceWorker.controller) ask(reg.waiting);
    reg.addEventListener("updatefound", () => { const w = reg.installing; w?.addEventListener("statechange", () => { if (w.state === "installed" && navigator.serviceWorker.controller) ask(w); }); });
    setInterval(() => reg.update().catch(() => {}), 3600000);
  }).catch(() => {});
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (wantReload) { wantReload = false; location.reload(); } });
}
// file aperti con "Apri con" (file_handlers) e condivisi verso l'app (share_target)
async function inbox() {
  if ("launchQueue" in window) launchQueue.setConsumer(async p => { if (p.files?.length) importFiles(await Promise.all(p.files.map(h => h.getFile()))); });
  if (!new URLSearchParams(location.search).has("shared") || !("caches" in window)) return;
  const c = await caches.open("otto-inbox"), keys = await c.keys(), files = [];
  for (const k of keys) { const r = await c.match(k); files.push(new File([await r.blob()], decodeURIComponent(r.headers.get("x-name") || "shared.pdf"), { type: "application/pdf" })); await c.delete(k); }
  history.replaceState(null, "", location.pathname + location.hash);
  if (files.length) importFiles(files);
}

/* ================= avvio ================= */
function afterLang() {
  apply();
  if ($("#scanNote")) $("#scanNote").textContent = findHint();
  renderLibrary(); route();
  $("#sort").value = S.sort;
}
(async function init() {
  applyTheme(); applyTextSize();
  $("#verBadge").textContent = "v" + VERSION;
  mountHabitat();
  startOttoLife();
  const setHH = () => document.documentElement.style.setProperty("--hh", $(".topbar").offsetHeight + "px");
  setHH(); addEventListener("resize", setHH);
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", applyTheme);
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener?.("change", applyTheme);
  await setLang(detect());
  mountOttos();
  await loadAll();
  afterLang();
  registerSW(); inbox();
  setupDevice();
  setTimeout(() => {
    if (!localStorage.getItem("otto.hello")) { localStorage.setItem("otto.hello", "1"); say(t("ev.welcome"), "happy", { ms: 7000 }); }
    else if (!S.docs.length) say(t("ev.empty"), "wiggle");
    else cheer(false);
  }, 900);
})();
