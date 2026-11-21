// pdf.js caricato solo quando serve. Miniature, testo per la ricerca, link dei wallet.
let lib;
export async function pdfjs() {
  if (lib) return lib;
  lib = await import("../vendor/pdfjs/pdf.min.mjs");
  lib.GlobalWorkerOptions.workerSrc = new URL("../vendor/pdfjs/pdf.worker.min.mjs", import.meta.url).href;
  return lib;
}
const V = new URL("../vendor/pdfjs/", import.meta.url).href;
export async function openPdf(data, password) {
  const p = await pdfjs();
  const task = p.getDocument({
    data, password,
    cMapUrl: V + "cmaps/", cMapPacked: true,
    standardFontDataUrl: V + "standard_fonts/",
    wasmUrl: V + "wasm/",
    isEvalSupported: false, enableXfa: false
  });
  return task.promise;
}
export function isPasswordError(e) { return e && (e.name === "PasswordException"); }

export async function renderToCanvas(page, scale, canvas = document.createElement("canvas")) {
  const vp = page.getViewport({ scale });
  canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, canvas, viewport: vp }).promise;
  return canvas;
}

// Analisi all'importazione: pagine, miniatura della prima pagina, testo delle prime pagine (per cercare).
export async function analyze(buf) {
  const doc = await openPdf(buf.slice(0));
  try {
    const page = await doc.getPage(1);
    const vp1 = page.getViewport({ scale: 1 });
    const c = await renderToCanvas(page, 360 / vp1.width);
    const thumb = await new Promise(r => c.toBlob(r, "image/webp", .82)) || await new Promise(r => c.toBlob(r, "image/jpeg", .82));
    let text = "", title = "";
    try { const m = await doc.getMetadata(); title = m?.info?.Title || ""; } catch {}
    for (let i = 1; i <= Math.min(doc.numPages, 12) && text.length < 20000; i++) {
      const pg = i === 1 ? page : await doc.getPage(i);
      const tc = await pg.getTextContent();
      text += " " + tc.items.map(x => x.str).join(" ");
    }
    return { pages: doc.numPages, thumb, text: text.replace(/\s+/g, " ").trim().slice(0, 20000), title, ratio: vp1.height / vp1.width };
  } finally { closePdf(doc); }
}
export function closePdf(doc) { try { return doc.destroy ? doc.destroy() : doc.loadingTask?.destroy(); } catch {} }
