// Service worker di Ottoteca (generato da tools/build.mjs: non modificare app/sw.js a mano).
const VERSION = "604d801031aa";
const CORE = "otto-core-" + VERSION, VENDOR = "otto-vendor-ccbeab29";
const CORE_FILES = ["./","./css/app.css","./css/icons.css","./fonts/OFL.txt","./fonts/nunito-cyrillic-ext-wght-normal.woff2","./fonts/nunito-cyrillic-wght-normal.woff2","./fonts/nunito-latin-ext-wght-normal.woff2","./fonts/nunito-latin-wght-normal.woff2","./fonts/ottoteca-icons.woff2","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon.svg","./icons/maskable-512.png","./index.html","./js/app.js","./js/codes.js","./js/db.js","./js/habitat.js","./js/i18n.js","./js/kinds.js","./js/otto.js","./js/pdf.js","./manifest.webmanifest","./i18n/en.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CORE).then(c => c.addAll(CORE_FILES))); });
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if ((k.startsWith("otto-core-") && k !== CORE) || (k.startsWith("otto-vendor-") && k !== VENDOR)) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("message", e => { if (e.data === "skip") self.skipWaiting(); });
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // PDF condivisi da altre app (share_target): si parcheggiano e si apre l'app
  if (req.method === "POST" && url.pathname.endsWith("/share-target")) {
    e.respondWith((async () => {
      const fd = await req.formData(), inbox = await caches.open("otto-inbox");
      let i = 0;
      for (const f of fd.getAll("pdf")) if (f && f.size) await inbox.put("./inbox/" + Date.now() + "-" + (i++), new Response(f, { headers: { "x-name": encodeURIComponent(f.name || "shared.pdf"), "content-type": "application/pdf" } }));
      return Response.redirect("./?shared=1", 303);
    })());
    return;
  }
  if (req.method !== "GET") return;
  if (url.pathname.includes("/vendor/")) {
    e.respondWith(caches.open(VENDOR).then(async c => (await c.match(req)) || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; })));
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(CORE);
    const hit = await c.match(req, { ignoreSearch: req.mode === "navigate" });
    if (hit) return hit;
    try { const r = await fetch(req); if (r.ok && url.pathname.includes("/i18n/")) c.put(req, r.clone()); return r; }
    catch { if (req.mode === "navigate") return c.match("./index.html"); throw new Error("offline"); }
  })());
});
