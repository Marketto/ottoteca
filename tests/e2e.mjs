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
  await page.locator("#passes .pass .btn", { hasText: "Google Wallet" }).click();
  ok(await page.locator("#dlg .wsteps li").count() === 3, "istruzioni per Google Wallet");
  if (shots) await page.screenshot({ path: "tests/shots/16-google-wallet.png" });
  await page.keyboard.press("Escape");
  await page.locator("#passes .pass .btn", { hasText: "Apple Wallet" }).click();
  ok(await page.locator("#dlg .wsteps li").count() === 3 && await page.locator('#dlg a[href*="walletwallet"]').count() === 1, "istruzioni per Apple Wallet");
  if (shots) await page.screenshot({ path: "tests/shots/17-apple-wallet.png" });
  await page.keyboard.press("Escape");
  // carta fedeltà inserita a mano
  await page.click("#addCode");
  await page.fill("#acName", "Supermercato");
  await page.fill("#acValue", "8001234567897");
  await page.check("#acLoyal");
  if (shots) await page.screenshot({ path: "tests/shots/18-aggiungi-codice.png" });
  await page.locator("#dlg button[value=ok]").click();
  await page.waitForFunction(() => document.querySelectorAll("#passes .pass").length === 2);
  await page.waitForSelector("#passes .pass:first-child .mini svg");
  ok((await page.textContent("#passes .pass:first-child")).includes("Supermercato"), "carta fedeltà aggiunta a mano");
  ok((await page.textContent("#passes .pass:first-child .from")).includes("EAN-13"), "tipo di codice riconosciuto da solo (EAN-13)");
  // Apple Wallet con un tocco (chiave gratuita WalletWallet, API simulata)
  let sent = null;
  await page.route("https://api.walletwallet.dev/api/pkpass", r => { sent = { auth: r.request().headers().authorization, body: JSON.parse(r.request().postData()) }; r.fulfill({ status: 200, contentType: "application/vnd.apple.pkpass", body: "PK" }); });
  await page.evaluate(() => localStorage.setItem("otto.awkey", "ww_live_test"));
  await page.locator("#passes .pass:first-child .btn", { hasText: "Apple Wallet" }).click();
  await page.waitForFunction(() => true);
  await page.waitForTimeout(800);
  ok(sent && sent.auth === "Bearer ww_live_test" && sent.body.barcodeValue === "8001234567897" && sent.body.barcodeFormat === "Code128", "Apple Wallet con un tocco (chiave WalletWallet)");
  ok(!(await page.locator("#dlg[open]").count()), "nessun passo manuale con la chiave");
  await page.evaluate(() => localStorage.removeItem("otto.awkey"));
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
  // nomi di cartella lunghi non devono allargare la pagina (la mascotte finirebbe fuori schermo)
  await mp.evaluate(async () => {
    const r = indexedDB.open("ottoteca"); await new Promise(x => r.onsuccess = x);
    const tx = r.result.transaction("cats", "readwrite");
    tx.objectStore("cats").put({ id: "long1", name: "Documenti molto molto lunghi del telefono di casa", color: "#e5637a", order: 1, parent: null });
    await new Promise(x => tx.oncomplete = x);
  });
  await mp.reload(); await mp.waitForTimeout(1500);
  const wide = await mp.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, br: document.getElementById("buddyBtn").getBoundingClientRect().right }));
  ok(wide.sw <= wide.cw && wide.br <= wide.cw, "pagina mai più larga dello schermo, Otto visibile");

  const axe5 = await new AxeBuilder({ page: mp }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  ok(!axe5.violations.length, "axe telefono: " + axe5.violations.map(v => v.id).join(", "));
  axe5.violations.forEach(v => console.log("   ", v.id, v.nodes.slice(0, 3).map(n => n.target.join(" ") + " " + (n.any[0]?.message || "")).join(" | ")));

  // Otto interattivo, versione, condividi
  ok((await page.textContent("#verBadge")).startsWith("v"), "versione visibile");
  ok(await page.locator("#shareApp").isVisible(), "pulsante Condividi");
  await page.goto(BASE + "#/");
  await page.waitForTimeout(600);
  const bb = await page.locator("#buddyBtn").boundingBox();
  const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let i = 0; i < 12; i++) await page.mouse.move(cx + (i % 2 ? 18 : -18), cy + 4, { steps: 3 });
  ok(await page.locator("#buddy .otto.is-pet").count() === 1, "coccole: Otto fa le fusa");
  if (shots) await page.screenshot({ path: "tests/shots/14-coccole.png" });
  await page.mouse.up();
  await page.waitForTimeout(1700);
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.waitForTimeout(800);
  ok(await page.locator("#buddy .otto.is-hug").count() === 1, "abbraccio tenendo premuto");
  await page.mouse.up(); await page.waitForTimeout(2000);
  for (let i = 0; i < 5; i++) { await page.mouse.click(cx, cy); await page.waitForTimeout(120); }
  ok(await page.locator("#buddy .otto.is-dizzy").count() === 1, "tanti tocchi: gira la testa");
  await page.waitForTimeout(2800);

  // tipi riconosciuti: fattura, scontrino, viaggio, spettacolo, con filtro
  const kx = await browser.newContext({ viewport: { width: 1200, height: 860 }, locale: "it-IT", serviceWorkers: "block" });
  const kp = await kx.newPage();
  kp.on("pageerror", e => errors.push(e.message));
  await kp.goto(BASE);
  await kp.setInputFiles("#fileInput", ["tests/fixtures/biglietto.pdf", "tests/fixtures/manuale.pdf", "tests/fixtures/fattura.pdf", "tests/fixtures/scontrino.pdf", "tests/fixtures/concerto.pdf"]);
  await kp.waitForFunction(() => document.querySelectorAll("#grid .card-doc").length === 5, null, { timeout: 30000 });
  const badges = await kp.evaluate(() => [...document.querySelectorAll("#grid .card-doc")].map(c => c.querySelector(".doc-name").textContent + ":" + ([...(c.querySelector(".kind-badge")?.classList || [])].find(x => x.startsWith("k-")) || "-")).sort().join(" "));
  ok(badges === "biglietto:k-travel concerto:k-event fattura:k-invoice manuale:- scontrino:k-receipt", "simboli dei tipi: " + badges);
  ok(await kp.locator("#kinds .kind-chip").count() === 4, "filtri per tipo");
  await kp.locator("#kinds .kind-chip.k-invoice").click();
  ok(await kp.locator("#grid .card-doc").count() === 1, "filtro Fatture");
  await kp.locator("#kinds .kind-chip.k-invoice").click();
  if (shots) { await kp.waitForTimeout(1200); await kp.screenshot({ path: "tests/shots/13-tipi.png" }); }
  const mcard = kp.locator("#grid .card-doc", { hasText: "manuale" });
  await mcard.locator(".doc-more").click();
  await kp.locator("#menu button").nth(2).click();
  await kp.locator('#dlg input[value="receipt"]').check();
  await kp.locator("#dlg button[value=ok]").click();
  await kp.locator("#kinds .kind-chip.k-receipt").click();
  ok(await kp.locator("#grid .card-doc").count() === 2, "tipo cambiato a mano");
  await kp.waitForTimeout(1200);
  const axe7 = await new AxeBuilder({ page: kp }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  ok(!axe7.violations.length, "axe tipi: " + axe7.violations.map(v => v.id).join(", "));
  axe7.violations.forEach(v => console.log("   ", v.id, v.nodes.slice(0, 3).map(n => n.target.join(" ") + " " + (n.any[0]?.message || "")).join(" | ")));

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
  // guida per la chiave WalletWallet
  await fp.click("#awGuide");
  ok(await fp.locator("#dlg .wsteps li").count() === 3, "guida alla chiave in 3 passi");
  await fp.fill("#gKey", "abc");
  await fp.locator("#dlg button[value=ok]").click();
  await fp.waitForSelector("#gKey");
  ok(!(await fp.evaluate(() => localStorage.getItem("otto.awkey"))), "chiave sbagliata non salvata");
  await fp.waitForTimeout(1000);
  const axeG = await new AxeBuilder({ page: fp }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  ok(!axeG.violations.length, "axe guida chiave: " + axeG.violations.map(v => v.id).join(", "));
  axeG.violations.forEach(v => console.log("   ", v.id, v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(" | ")));
  await fp.fill("#gKey", "ww_live_" + "a1".repeat(16));
  await fp.locator("#dlg button[value=ok]").click();
  await fp.waitForFunction(() => localStorage.getItem("otto.awkey"));
  ok((await fp.inputValue("#awKey")).startsWith("ww_live_"), "chiave salvata dalla guida");
  await fp.evaluate(() => localStorage.removeItem("otto.awkey"));

  // iPhone (Safari: niente File System Access): «Trova i miei PDF» apre la scelta di una cartella e copia i PDF
  const ix = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: "it-IT", serviceWorkers: "block",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1" });
  const ip = await ix.newPage();
  ip.on("pageerror", e => errors.push(e.message));
  await ip.addInitScript(() => { delete window.showDirectoryPicker; delete window.showOpenFilePicker; delete Window.prototype.showDirectoryPicker; delete Window.prototype.showOpenFilePicker; });
  await ip.goto(BASE);
  await ip.waitForSelector("#emptyScan");
  ok((await ip.textContent("#scanNote")).includes("iPhone"), "iPhone: spiegazione «Sul mio iPhone»");
  const [chooser] = await Promise.all([ip.waitForEvent("filechooser"), ip.click("#emptyScan")]);
  ok(chooser.isMultiple(), "iPhone: «Trova i miei PDF» apre la scelta della cartella");
  // caricare una cartella intera non funziona con tutte le versioni del Chrome di prova: se manca, si salta
  const dirOk = await chooser.setFiles("tests/fixtures/iphone", { timeout: 8000 }).then(() => true, () => false);
  if (dirOk) {
    await ip.waitForFunction(() => document.querySelectorAll("#grid .card-doc").length === 2, null, { timeout: 20000 });
    ok(true, "iPhone: cartella scelta, 2 PDF presi anche dalle sottocartelle");
  } else console.log("· iPhone: caricamento di cartelle non disponibile in questo browser di prova, controllo saltato");
  if (shots) { await ip.waitForTimeout(1200); await ip.screenshot({ path: "tests/shots/15-iphone.png" }); }

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
