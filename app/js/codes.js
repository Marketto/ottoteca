// Ricerca di QR / Aztec / PDF417 / codici a barre e codici di prenotazione dentro un PDF (tutto sul dispositivo).
import { renderToCanvas } from "./pdf.js";

let zx;
function loadZX() {
  return zx ||= new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = new URL("../vendor/zxing/zxing.js", import.meta.url).href;
    s.onload = () => {
      const Z = window.ZXingWASM;
      Z.prepareZXingModule({ overrides: { locateFile: p => new URL("../vendor/zxing/" + p, import.meta.url).href }, fireImmediately: true })
        .then(() => res(Z), rej);
    };
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

const b64 = u8 => { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

// Parole che precedono un codice di prenotazione, in molte lingue (minuscole, senza accenti).
const KEYS = [
  "pnr", "booking reference", "booking ref", "booking code", "booking number", "booking id", "reservation code", "reservation number", "confirmation code", "confirmation number", "record locator", "reference", "order number", "ticket number", "e-ticket",
  "codice prenotazione", "codice di prenotazione", "codice biglietto", "numero prenotazione", "codice pnr", "codice", "prenotazione", "biglietto n",
  "code de reservation", "reference de reservation", "numero de reservation", "dossier",
  "codigo de reserva", "localizador", "numero de reserva", "referencia",
  "buchungscode", "buchungsnummer", "auftragsnummer", "buchungsreferenz", "reservierungsnummer",
  "boekingscode", "reserveringsnummer", "kod rezerwacji", "numer rezerwacji", "rezervacni kod", "codigo da reserva",
  "bokningsnummer", "bestillingsnummer", "varausnumero", "foglalasi szam", "cod rezervare",
  "код бронирования", "номер бронирования", "номер заказа", "予約番号", "予約コード", "确认号", "预订号", "订单号", "예약번호", "예약 번호", "رقم الحجز", "رمز الحجز"
];
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function findBookingCodes(text) {
  const out = new Map();
  const n = norm(text);
  for (const k of KEYS) {
    let i = 0;
    while ((i = n.indexOf(k, i)) !== -1) {
      const after = text.slice(i + k.length, i + k.length + 40);
      const m = after.match(/^[\s:.#№\-–=/()a-zA-Z]{0,14}?\b([A-Z0-9]{5,12}|[A-Z0-9]{3,6}[- ][A-Z0-9]{3,6})\b/);
      if (m) {
        const c = m[1];
        if (/[0-9]/.test(c) || /^[A-Z]{6}$/.test(c)) if (!/^(PAGE|TOTAL|PRICE|EURO)/.test(c)) out.set(c, k);
      }
      i += k.length;
    }
  }
  return [...out.keys()].slice(0, 6);
}

// Link "Aggiungi a Google/Apple Wallet" messi dall'emittente nel PDF.
export function walletLink(url) {
  if (/pay\.google\.com\/gp\/v\/save|wallet\.google\.com|walletobjects/i.test(url)) return "google";
  if (/\.pkpass(\?|$)|passkit|apple\.com\/wallet|wallet\.apple/i.test(url)) return "apple";
  return null;
}

export async function scanDoc(doc, onProgress) {
  const Z = await loadZX();
  const found = [], seen = new Set(), links = [];
  let text = "";
  const N = Math.min(doc.numPages, 30);
  for (let p = 1; p <= N; p++) {
    const page = await doc.getPage(p);
    try {
      for (const a of await page.getAnnotations()) {
        const u = a.url || a.unsafeUrl;
        if (u) { const k = walletLink(u); if (k && !links.some(l => l.url === u)) links.push({ kind: k, url: u }); }
      }
    } catch {}
    try { const tc = await page.getTextContent(); const pt = tc.items.map(x => x.str + (x.hasEOL ? "\n" : " ")).join(""); text += "\n" + pt; for (const c of findBookingCodes(pt)) if (!seen.has("T" + c)) { seen.add("T" + c); found.push({ kind: "booking", text: c, page: p }); } } catch {}
    const vp = page.getViewport({ scale: 1 });
    const scale = Math.min(3, Math.sqrt(4.5e6 / (vp.width * vp.height)));
    const c = await renderToCanvas(page, scale);
    const img = c.getContext("2d").getImageData(0, 0, c.width, c.height);
    let res = [];
    try { res = await Z.readBarcodes(img, { tryHarder: true, maxNumberOfSymbols: 12, formats: [] }); } catch {}
    for (const r of res) {
      if (!r.isValid) continue;
      const bin = r.contentType === "Binary" || r.contentType === "Mixed";
      const key = r.format + ":" + (bin ? b64(r.bytes) : r.text);
      if (seen.has(key)) continue;
      seen.add(key);
      found.push({ kind: "barcode", format: r.format, text: bin ? "" : r.text, bytes: bin ? b64(r.bytes) : null, page: p });
    }
    c.width = c.height = 0;
    onProgress?.(p / N);
  }
  found.sort((a, b) => (a.kind === "booking") - (b.kind === "booking") || a.page - b.page);
  return { codes: found, links };
}

// Legge un codice da una foto o da uno screenshot (inserimento manuale nel portafoglio)
export async function readImage(blob) {
  const Z = await loadZX();
  const res = await Z.readBarcodes(blob, { tryHarder: true, maxNumberOfSymbols: 4, formats: [] });
  const r = res.find(x => x.isValid);
  if (!r) return null;
  const bin = r.contentType === "Binary" || r.contentType === "Mixed";
  return { format: r.format, text: bin ? "" : r.text, bytes: bin ? b64(r.bytes) : null };
}
const WRITE = { QRCode: "QRCode", MicroQRCode: "QRCode", RMQRCode: "QRCode", Aztec: "Aztec", PDF417: "PDF417", CompactPDF417: "PDF417", DataMatrix: "DataMatrix", Code128: "Code128", Code39: "Code39", Code93: "Code93", EAN13: "EAN13", EAN8: "EAN8", UPCA: "UPCA", UPCE: "UPCE", ITF: "ITF", Codabar: "Codabar" };
// Ridisegna il codice come SVG nitido (per il portafoglio e lo schermo intero).
export async function codeSVG(pass) {
  if (pass.kind === "booking") return null;
  const Z = await loadZX();
  const fmt = WRITE[pass.format] || "QRCode";
  try {
    const r = await Z.writeBarcode(pass.bytes ? unb64(pass.bytes) : pass.text, { format: fmt, scale: 0, withQuietZones: true, withHRT: false });
    if (r.error) return null;
    let svg = r.svg.replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>|<desc>.*?<\/desc>/gs, "").trim();
    const m = svg.match(/<svg[^>]*\swidth="([\d.]+)"[^>]*\sheight="([\d.]+)"/);
    if (m && !/viewBox/.test(svg)) svg = svg.replace("<svg", `<svg viewBox="0 0 ${m[1]} ${m[2]}" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges"`);
    return svg;
  } catch { return null; }
}
export const formatName = f => ({ QRCode: "QR", MicroQRCode: "Micro QR", PDF417: "PDF417", Aztec: "Aztec", DataMatrix: "Data Matrix", Code128: "Code 128", EAN13: "EAN-13" }[f] || f);
