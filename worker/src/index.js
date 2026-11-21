// Ottoteca Wallet: crea pass Apple Wallet con la chiave WalletWallet gratuita del proprietario, tenuta segreta qui.
// L'app chiama POST /pkpass; il Worker accetta solo Ottoteca, limita le richieste per persona e inoltra solo i campi ammessi.
const API = "https://api.walletwallet.dev/api/pkpass";
const FORMATS = ["QR", "PDF417", "Aztec", "Code128"];
const COLORS = ["dark", "blue", "green", "red", "purple", "orange"];

function cors(origin, allowed) {
  const ok = allowed.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}
const json = (status, obj, h) => new Response(JSON.stringify(obj), { status, headers: { ...h, "Content-Type": "application/json" } });
const str = (v, max) => typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

export default {
  async fetch(req, env) {
    const allowed = (env.ALLOWED_ORIGINS || "https://marketto.github.io").split(",").map(s => s.trim());
    const origin = req.headers.get("Origin") || "";
    const h = cors(origin, allowed);
    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (url.pathname === "/" && req.method === "GET") return json(200, { ok: true, service: "ottoteca-wallet" }, h);
    if (url.pathname !== "/pkpass" || req.method !== "POST") return json(404, { error: "not found" }, h);
    if (!allowed.includes(origin)) return json(403, { error: "origin" }, h);
    if (!env.WW_KEY) return json(503, { error: "not configured" }, h);

    const ip = req.headers.get("CF-Connecting-IP") || "?";
    if (env.PER_PERSON) {
      const { success } = await env.PER_PERSON.limit({ key: ip });
      if (!success) return json(429, { error: "slow down", scope: "person" }, h);
    }

    let b;
    try { b = await req.json(); } catch { return json(400, { error: "json" }, h); }
    const body = {
      barcodeValue: str(b.barcodeValue, 512),
      barcodeFormat: FORMATS.includes(b.barcodeFormat) ? b.barcodeFormat : "QR",
      title: str(b.title, 64) || "Ottoteca",
      logoText: str(b.logoText, 64),
      description: str(b.description, 128),
      organizationName: "Ottoteca",
      colorPreset: COLORS.includes(b.colorPreset) ? b.colorPreset : "dark",
      sharingProhibited: false
    };
    if (!body.barcodeValue) return json(400, { error: "barcodeValue" }, h);

    const r = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.WW_KEY, "User-Agent": "ottoteca-wallet" }, body: JSON.stringify(body) });
    if (!r.ok) {
      let e = {}; try { e = await r.json(); } catch {}
      // 401 = chiave del proprietario non valida, 429 = finiti i pass gratuiti del mese: per l'app è «servizio condiviso esaurito»
      return json(r.status === 429 ? 429 : r.status === 400 ? 400 : 502, { error: e.error || "upstream " + r.status, scope: r.status === 429 ? "month" : undefined, resetDate: e.resetDate }, h);
    }
    return new Response(r.body, { status: 200, headers: { ...h, "Content-Type": "application/vnd.apple.pkpass", "Content-Disposition": 'attachment; filename="ottoteca.pkpass"', "Cache-Control": "no-store" } });
  }
};
