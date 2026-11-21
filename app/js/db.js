// IndexedDB: documenti (metadati + miniatura), file (blob del PDF), categorie, pass del portafoglio.
const NAME = "ottoteca", VER = 2;
let dbp;
function open() {
  return dbp ||= new Promise((res, rej) => {
    const r = indexedDB.open(NAME, VER);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains("docs")) d.createObjectStore("docs", { keyPath: "id" });
      if (!d.objectStoreNames.contains("files")) d.createObjectStore("files");
      if (!d.objectStoreNames.contains("cats")) d.createObjectStore("cats", { keyPath: "id" });
      if (!d.objectStoreNames.contains("passes")) d.createObjectStore("passes", { keyPath: "id" });
      if (!d.objectStoreNames.contains("roots")) d.createObjectStore("roots", { keyPath: "id" }); // cartelle del dispositivo collegate
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
function req(r) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function tx(stores, mode, fn) {
  const d = await open();
  return new Promise((res, rej) => {
    const t = d.transaction(stores, mode);
    let out;
    Promise.resolve(fn(...[].concat(stores).map(s => t.objectStore(s)))).then(v => { out = v; }, rej);
    t.oncomplete = () => res(out);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  });
}
export const all = s => tx(s, "readonly", st => req(st.getAll()));
export const get = (s, k) => tx(s, "readonly", st => req(st.get(k)));
export const put = (s, v, k) => tx(s, "readwrite", st => req(k === undefined ? st.put(v) : st.put(v, k)));
export const del = (s, k) => tx(s, "readwrite", st => req(st.delete(k)));
export async function addDoc(doc, blob) {
  return tx(["docs", "files"], "readwrite", (d, f) => { d.put(doc); f.put(blob, doc.id); });
}
export async function removeDoc(id) {
  return tx(["docs", "files"], "readwrite", (d, f) => { d.delete(id); f.delete(id); });
}
export async function clearAll() {
  return tx(["docs", "files", "cats", "passes", "roots"], "readwrite", (...s) => s.forEach(x => x.clear()));
}
export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
