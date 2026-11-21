// Prova completa in un browser vero: importazione, visore, codici, portafoglio, cartelle, viste, accessibilità.
// Uso: node tests/e2e.mjs [--shots]
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const PORT = 8765, BASE = `http://localhost:${PORT}/`;
const shots = process.argv.includes("--shots");
mkdirSync("tests/shots", { recursive: true });
const srv = spawn("python3", ["-m", "http.server", String(PORT), "-d", "app"], { stdio: "ignore" });
await new Promise(r => setTimeout(r, 800));
const fail = [];
const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fail.push(m); };

const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", args: ["--no-sandbox"] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, locale: "it-IT", serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(BASE);
  await page.waitForSelector("#empty:not([hidden])");
  ok(await page.locator("html").getAttribute("lang") === "it", "lingua italiana dal browser");
  if (shots) await page.screenshot({ path: "tests/shots/01-vuota.png" });

  await page.setInputFiles("#fileInput", ["tests/fixtures/biglietto.pdf", "tests/fixtures/manuale.pdf"]);
  await page.waitForFunction(() => document.querySelectorAll("#grid .card-doc").length === 2, null, { timeout: 30000 });
  ok(true, "due PDF importati");
  await page.waitForSelector("#grid .thumb img");
  ok(await page.locator("#grid .thumb img").count() === 2, "miniature create");
  if (shots) { await page.waitForTimeout(900); await page.screenshot({ path: "tests/shots/02-griglia.png" }); }

  // ricerca nel testo
  await page.fill("#q", "lavatrice"); await page.waitForTimeout(300);
  ok(await page.locator("#grid .card-doc").count() === 1, "ricerca nel testo del PDF");
  await page.fill("#q", ""); await page.waitForTimeout(300);

  // nuova cartella e assegnazione
  await page.click("#newCatBtn");
  await page.fill("#dlgInput", "Viaggi");
  await page.keyboard.press("Enter");
  await page.waitForSelector('#chips .chip:has-text("Viaggi")');
  await page.click('#chips .chip:has-text("Tutti")').catch(() => page.click('#chips .chip >> nth=0'));
  const card = page.locator('#grid .card-doc', { hasText: "biglietto" });
  await card.locator(".doc-more").click();
  await page.locator('#menu button').nth(1).click();
  await page.locator('#dlg .checklist input').first().check();
  await page.locator('#dlg button[value=ok]').click();
  await page.click('#chips .chip:has-text("Viaggi")');
  ok(await page.locator("#grid .card-doc").count() === 1, "filtro per cartella");

  // vista cartelle
  await page.check('input[name=vmode][value=folders]', { force: true });
  await page.waitForSelector("#folders .folder");
  ok(await page.locator('#folders .folder', { hasText: "Viaggi" }).count() === 1, "esplora cartelle: cartella visibile");
  await page.locator('#folders .folder', { hasText: "Viaggi" }).locator(".fopen").click();
  ok(await page.locator("#grid .card-doc").count() === 1 && await page.locator("#crumbList li").count() === 2, "dentro la cartella con percorso");
  if (shots) await page.screenshot({ path: "tests/shots/03-cartelle.png" });
  await page.locator("#crumbList button").first().click();
  ok(await page.locator("#grid .card-doc").count() === 1, "radice: PDF fuori dalle cartelle");

  // vista per data
  await page.check('input[name=vmode][value=date]', { force: true });
  await page.click('#chips .chip >> nth=0');
  await page.waitForSelector(".tl-group h2");
  ok((await page.locator(".tl-group h2").first().textContent()).includes("Oggi"), "vista per data: gruppo Oggi");
  ok(await page.locator(".doc-time").count() === 2, "ora su ogni PDF");
  if (shots) await page.screenshot({ path: "tests/shots/04-data.png" });
  await page.check('input[name=vmode][value=grid]', { force: true });
  await page.click('#chips .chip >> nth=0');

  // axe sulla libreria
  await page.waitForTimeout(1200);
  const axe1 = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  ok(!axe1.violations.length, "axe libreria: " + axe1.violations.map(v => v.id + "(" + v.nodes.length + ")").join(", "));
  axe1.violations.forEach(v => console.log("   ", v.id, v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")));

  // visore
  await page.locator('#grid .card-doc', { hasText: "manuale" }).locator(".doc").click();
  await page.waitForSelector("#vPages .page canvas", { timeout: 20000 });
  ok((await page.textContent("#vPageInfo")).includes("12"), "visore: 12 pagine");
  await page.waitForSelector("#vPages .textLayer span");
  ok(true, "livello di testo");
  await page.click("#vZoomIn"); await page.waitForSelector("#vPages .page canvas");
  ok((await page.textContent("#vZoom")).trim() === "125%", "zoom");
  await page.click("#vNext"); await page.waitForTimeout(500);
  await page.click("#vThumbs"); await page.waitForSelector("#vSide canvas");
  ok(true, "miniature delle pagine");
  if (shots) await page.screenshot({ path: "tests/shots/05-visore.png" });
  await page.waitForTimeout(1200);
  const axe2 = await new AxeBuilder({ page }).include("#viewer").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  ok(!axe2.violations.length, "axe visore: " + axe2.violations.map(v => v.id).join(", "));
  axe2.violations.forEach(v => console.log("   ", v.id, v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")));
  await page.keyboard.press("Escape");
  await page.waitForSelector("#viewer", { state: "hidden" });
  ok(true, "Esc chiude il visore");

  // codici
  await page.locator('#grid .card-doc', { hasText: "biglietto" }).locator(".doc").click();
  await page.waitForSelector("#vPages .page canvas");
  await page.click("#vCodes");
  await page.waitForSelector("#dlg .codes li", { timeout: 30000 });
  const txt = await page.textContent("#dlg .codes");
  ok(txt.includes("TICKET:FR1234"), "QR letto");
  ok(txt.includes("QX7P2L") && txt.includes("ABC123"), "codici di prenotazione trovati");
  await page.waitForSelector("#dlg .codes .cimg svg");
  if (shots) await page.screenshot({ path: "tests/shots/06-codici.png" });
  await page.locator("#dlg .codes li").first().locator(".btn-primary").click();
  await page.locator("#dlg button[value=close]").click();
  await page.keyboard.press("Escape");
  await page.goto(BASE + "#/wallet");
  await page.waitForSelector("#passes .pass .mini svg");
  ok(await page.locator("#passes .pass").count() === 1, "pass nel portafoglio");
  if (shots) await page.screenshot({ path: "tests/shots/07-portafoglio.png" });
  await page.waitForTimeout(1200);
  const axe3 = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  ok(!axe3.violations.length, "axe portafoglio: " + axe3.violations.map(v => v.id).join(", "));
  axe3.violations.forEach(v => console.log("   ", v.id, v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")));

  // tema scuro + arabo
  await page.goto(BASE + "#/settings");
  await page.selectOption("#langSel", "ar");
  await page.waitForFunction(() => document.documentElement.dir === "rtl");
  await page.check("input[name=theme][value=dark]", { force: true });
  await page.goto(BASE + "#/");
  await page.waitForSelector("#grid .card-doc");
  ok(true, "arabo RTL + tema scuro");
  if (shots) await page.screenshot({ path: "tests/shots/08-arabo-scuro.png" });
  await page.waitForTimeout(1200);
  const axe4 = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  ok(!axe4.violations.length, "axe scuro/RTL: " + axe4.violations.map(v => v.id).join(", "));
  axe4.violations.forEach(v => console.log("   ", v.id, v.nodes.slice(0, 3).map(n => n.target.join(" ") + " " + (n.any[0]?.message || "")).join(" | ")));

  // telefono
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "ja-JP", serviceWorkers: "block" });
  const mp = await mob.newPage();
  mp.on("pageerror", e => errors.push(e.message));
  await mp.goto(BASE);
  await mp.setInputFiles("#fileInput", ["tests/fixtures/biglietto.pdf"]);
  await mp.waitForSelector("#grid .thumb img");
  await mp.waitForTimeout(1200);
  if (shots) await mp.screenshot({ path: "tests/shots/09-telefono.png" });
  ok(await mp.locator("html").getAttribute("lang") === "ja", "giapponese dal browser");

  const axe5 = await new AxeBuilder({ page: mp }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  ok(!axe5.violations.length, "axe telefono: " + axe5.violations.map(v => v.id).join(", "));
  axe5.violations.forEach(v => console.log("   ", v.id, v.nodes.slice(0, 3).map(n => n.target.join(" ") + " " + (n.any[0]?.message || "")).join(" | ")));

  // cartelle del dispositivo (showDirectoryPicker simulato con il file system privato del browser)
  const fsx = await browser.newContext({ viewport: { width: 1100, height: 800 }, locale: "it-IT", serviceWorkers: "block" });
  const fp = await fsx.newPage();
  fp.on("pageerror", e => errors.push(e.message));
  const b64 = f => readFileSync(f).toString("base64");
  await fp.addInitScript(() => { window.showDirectoryPicker = async () => (await navigator.storage.getDirectory()).getDirectoryHandle("Documenti"); });
  await fp.goto(BASE);
  await fp.evaluate(async ([a, b]) => {
    const root = await navigator.storage.getDirectory();
    const docs = await root.getDirectoryHandle("Documenti", { create: true });
    const sub = await docs.getDirectoryHandle("Viaggi", { create: true });
    const put = async (dir, name, data) => { const h = await dir.getFileHandle(name, { create: true }); const w = await h.createWritable(); await w.write(Uint8Array.from(atob(data), c => c.charCodeAt(0))); await w.close(); };
    await put(sub, "biglietto.pdf", a); await put(docs, "manuale.pdf", b);
    const n = await docs.getFileHandle("note.txt", { create: true }); const w = await n.createWritable(); await w.write("ciao"); await w.close();
  }, [b64("tests/fixtures/biglietto.pdf"), b64("tests/fixtures/manuale.pdf")]);
  await fp.reload();
  ok(!!(await fp.waitForSelector("#emptyScan:not([hidden])")), "pulsante «Trova i PDF nel dispositivo»");
  await fp.click("#emptyScan");
  await fp.waitForFunction(() => document.querySelectorAll("#grid .card-doc").length === 2, null, { timeout: 20000 });
  await fp.waitForFunction(() => document.querySelectorAll("#grid .thumb img").length === 2, null, { timeout: 20000 });
  ok(true, "cartella collegata: 2 PDF trovati con miniature, il .txt ignorato");
  await fp.check('input[name=vmode][value=folders]', { force: true });
  await fp.locator('#folders .folder', { hasText: "Documenti" }).locator(".fopen").click();
  ok(await fp.locator('#folders .folder', { hasText: "Viaggi" }).count() === 1, "struttura delle cartelle del dispositivo");
  if (shots) await fp.screenshot({ path: "tests/shots/12-dispositivo.png" });
  await fp.check('input[name=vmode][value=grid]', { force: true });
  await fp.locator("#grid .card-doc .doc").first().click();
  await fp.waitForSelector("#vPages .page canvas", { timeout: 15000 });
  ok(true, "PDF aperto direttamente dalla cartella, senza copia");
  await fp.keyboard.press("Escape");
  // un PDF nuovo nella cartella: «Ricontrolla» lo trova (niente ricarica: nel Chrome di prova rileggere da
  // IndexedDB un handle del file system privato fa chiudere il browser; con le cartelle vere non succede)
  await fp.evaluate(async a => { const d = await (await navigator.storage.getDirectory()).getDirectoryHandle("Documenti"); const h = await d.getFileHandle("nuovo.pdf", { create: true }); const w = await h.createWritable(); await w.write(Uint8Array.from(atob(a), c => c.charCodeAt(0))); await w.close(); }, b64("tests/fixtures/manuale.pdf"));
  await fp.evaluate(() => location.hash = "#/settings");
  await fp.waitForSelector("#rootsList li .rname");
  ok((await fp.textContent("#rootsList")).includes("Documenti"), "cartella elencata nelle impostazioni");
  await fp.locator("#rootsList .btn").first().click();
  await fp.waitForFunction(() => /3/.test(document.querySelector("#rootsList small")?.textContent || ""), null, { timeout: 15000 });
  ok(true, "«Ricontrolla» trova il PDF nuovo");
  await fp.waitForTimeout(1000);
  const axe6 = await new AxeBuilder({ page: fp }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  ok(!axe6.violations.length, "axe impostazioni: " + axe6.violations.map(v => v.id).join(", "));
  axe6.violations.forEach(v => console.log("   ", v.id, v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")));

  // offline con il service worker
  const off = await browser.newContext({ viewport: { width: 1000, height: 800 }, locale: "de-DE" });
  const op = await off.newPage();
  await op.goto(BASE);
  await op.evaluate(() => navigator.serviceWorker.ready);
  await op.reload(); await op.waitForTimeout(800);
  await op.setInputFiles("#fileInput", ["tests/fixtures/biglietto.pdf"]);
  await op.waitForSelector("#grid .thumb img");
  await off.setOffline(true);
  await op.reload();
  await op.waitForSelector("#grid .card-doc .doc");
  await op.locator("#grid .card-doc .doc").first().click();
  await op.waitForSelector("#vPages .page canvas", { timeout: 15000 });
  ok((await op.textContent("#vPageInfo")).includes("2"), "funziona offline (tedesco)");
  ok(!errors.length, "nessun errore in console" + (errors.length ? ": " + errors.slice(0, 4).join(" | ") : ""));
} finally {
  await browser.close(); srv.kill();
}
console.log(fail.length ? `\n${fail.length} prove fallite` : "\nTutto ok");
process.exit(fail.length ? 1 : 0);
