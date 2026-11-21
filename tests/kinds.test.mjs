import { classify } from "../app/js/kinds.js";
const cases = [["Frecciarossa Roma - Milano Codice prenotazione: QX7P2L PNR: ABC123","biglietto","travel"],
["Rossi Srl P.IVA FATTURA N. 2026/118 Imponibile IVA Scadenza IBAN","fattura","invoice"],
["DOCUMENTO COMMERCIALE TOTALE COMPLESSIVO di cui IVA Pagamento elettronico","scontrino","receipt"],
["TicketOne Concerto Arena Settore A Fila 12 Posto 8","concerto","event"],
["Manuale lavatrice pagina 1 Riga 0 del capitolo 1: istruzioni per un bucato perfetto.","manuale",null],
["Boarding pass Ryanair Flight FR1234 Gate B12 Seat 14A","x","travel"],
["Rechnung Nr. 55 MwSt USt-IdNr","x","invoice"],
["Kassenbon Summe Bar","x","receipt"]];
let bad=0; for (const [t,n,e] of cases){const k=classify(t,n); if(k!==e){bad++;console.log("✗",n,t.slice(0,30),k,"≠",e);}}
console.log(bad?bad+" errori":"classificatore ok"); process.exit(bad?1:0);
