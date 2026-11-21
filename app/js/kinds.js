// Riconosce il tipo di documento dal testo (prime pagine) e dal nome del file:
// fattura, scontrino, biglietto di viaggio, biglietto per spettacoli/eventi. Parole in molte lingue.
export const KINDS = ["invoice", "receipt", "travel", "event"];
export const KIND_ICON = { invoice: "invoice", receipt: "receipt", travel: "plane", event: "event" };

// [peso, parole]: peso 3 = parola che da sola basta, 1 = indizio
const W = {
  invoice: [
    [3, ["fattura", "fattura elettronica", "nota di credito", "invoice", "tax invoice", "rechnung", "rechnungsnummer", "facture", "factura", "fatura", "factuur", "faktura", "faktúra", "számla", "lasku", "arve", "rēķins", "saskaita faktura", "τιμολογιο", "счет-фактура", "счет на оплату", "рахунок-фактура", "фактура", "請求書", "发票", "發票", "세금계산서", "인보이스", "فاتورة"]],
    [1, ["partita iva", "p.iva", "p. iva", "codice fiscale", "imponibile", "aliquota", "vat", "vat number", "ust-idnr", "mwst", "tva", "iva", "nif", "cif", "due date", "scadenza", "total due", "importo dovuto", "bonifico", "iban", "invoice number", "numero fattura", "fattura n", "bill to", "fatturato a", "intestatario"]]
  ],
  receipt: [
    [3, ["scontrino", "documento commerciale", "ricevuta fiscale", "receipt", "kassenbon", "kassenbeleg", "quittung", "ticket de caisse", "ticket de compra", "recibo", "kassabon", "kvitto", "kvittering", "kuitti", "paragon", "účtenka", "blocek", "nyugta", "bon fiscal", "кассовый чек", "чек", "квитанция", "領収書", "レシート", "收据", "小票", "영수증", "إيصال"]],
    [1, ["totale complessivo", "di cui iva", "pagamento elettronico", "pagamento contante", "contanti", "resto", "cassa", "cassiere", "subtotal", "subtotale", "change", "cash", "card payment", "bancomat", "pos", "grazie e arrivederci", "thank you for your purchase", "vielen dank für ihren einkauf", "merci de votre visite", "ricevuta", "reçu"]]
  ],
  travel: [
    [3, ["boarding pass", "carta d'imbarco", "carta di imbarco", "bordkarte", "carte d'embarquement", "tarjeta de embarque", "cartão de embarque", "instapkaart", "karta pokładowa", "посадочный талон", "搭乗券", "登机牌", "탑승권", "بطاقة صعود", "biglietto ferroviario", "titolo di viaggio", "fahrkarte", "fahrschein", "billet de train", "billete de tren", "trenitalia", "frecciarossa", "frecciargento", "italo", "italotreno", "trenord", "deutsche bahn", "db fernverkehr", "sncf", "ouigo", "renfe", "eurostar", "öbb", "sbb", "flixbus", "ryanair", "easyjet", "wizz air", "vueling", "lufthansa", "ita airways", "alitalia", "air france", "klm", "british airways", "iberia", "volotea", "e-ticket receipt", "itinerary receipt", "itinerario", "traghetto", "ferry", "moby", "tirrenia", "grimaldi"]],
    [1, ["volo", "flight", "flug", "vol", "vuelo", "voo", "gate", "imbarco", "boarding", "departure", "partenza", "abfahrt", "départ", "salida", "arrivo", "arrival", "ankunft", "treno", "train", "zug", "tren", "binario", "gleis", "platform", "carrozza", "wagen", "voiture", "coach", "pnr", "bagaglio", "baggage", "gepäck", "terminal", "aeroporto", "airport", "flughafen", "aéroport", "aeropuerto", "passeggero", "passenger", "fahrgast", "passager", "pasajero", "bus", "pullman", "stazione", "station", "bahnhof", "gare"]]
  ],
  event: [
    [3, ["concerto", "concert", "konzert", "concierto", "koncert", "konsertti", "spettacolo", "teatro", "theatre", "theater", "théâtre", "opera", "balletto", "musical", "cinema", "kino", "cine", "museo", "museum", "musée", "mostra", "exhibition", "ausstellung", "festival", "stadio", "stadium", "stade", "partita", "match", "ticketone", "ticketmaster", "eventim", "vivaticket", "dice.fm", "biglietto d'ingresso", "eintrittskarte", "billet d'entrée", "entrada", "admission ticket", "concerto", "コンサート", "演唱会", "콘서트", "حفل"]],
    [1, ["settore", "fila", "row", "reihe", "rang", "posto", "seat", "platz", "place", "ingresso", "entrance", "einlass", "entrée", "doors open", "apertura porte", "inizio spettacolo", "evento", "event", "veranstaltung", "événement", "evento", "tribuna", "parterre", "platea", "galleria", "balconata", "curva", "tour"]]
  ]
};
const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const LIST = Object.fromEntries(Object.entries(W).map(([k, groups]) => [k, groups.flatMap(([w, words]) => words.map(x => [w, norm(x)]))]));
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const RX = {};
for (const [k, ws] of Object.entries(LIST)) RX[k] = ws.map(([w, x]) => [w, /^[a-z0-9 .'-]+$/.test(x) ? new RegExp("(^|[^a-z0-9])" + escape(x) + "($|[^a-z0-9])", "g") : new RegExp(escape(x), "g")]);

export function classify(text, name = "") {
  const hay = norm(name) + " " + norm(name) + " " + norm(text).slice(0, 12000);
  let best = null, bestScore = 0;
  for (const k of KINDS) {
    let score = 0;
    for (const [w, rx] of RX[k]) { const m = hay.match(rx); if (m) score += w * Math.min(m.length, 3); }
    if (score > bestScore) { best = k; bestScore = score; }
  }
  return bestScore >= 3 ? best : null;
}
