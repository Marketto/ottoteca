// Otto, la lontra kawaii in cel shading: contorno a inchiostro, ombre e luci a bande nette, occhioni lucidi.
// Interattivo: segue con lo sguardo, si fa accarezzare, abbracciare, saluta, fa il giocoliere coi sassolini.
let uid = 0;
export function ottoSVG() {
  const u = "o" + (++uid);
  return `<svg class="otto" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
  <defs>
    <clipPath id="${u}h"><ellipse cx="100" cy="90" rx="70" ry="56"/></clipPath>
    <clipPath id="${u}b"><ellipse cx="100" cy="162" rx="54" ry="48"/></clipPath>
    <clipPath id="${u}e1"><ellipse cx="72" cy="88" rx="17" ry="21"/></clipPath>
    <clipPath id="${u}e2"><ellipse cx="128" cy="88" rx="17" ry="21"/></clipPath>
    <clipPath id="${u}f"><path d="M42 104c2-21 27-31 58-23 31-8 56 2 58 23 3 25-25 41-58 41S39 129 42 104z"/></clipPath>
  </defs>
  <ellipse class="o-shadow" cx="100" cy="212" rx="60" ry="7" fill="var(--ink)" opacity=".18"/>
  <g class="o-all">
    <g class="o-squish">
    <g class="o-tail">
      <path d="M138 188c26 4 44-8 50-28 2-8-7-12-12-6-9 12-22 17-40 16z" fill="var(--otto)" stroke="var(--ink)" stroke-width="5" stroke-linejoin="round"/>
      <path d="M150 190c16-1 28-8 34-20l-4-6c-8 11-18 16-32 17z" fill="var(--otto-dark)"/>
    </g>
    <ellipse cx="100" cy="162" rx="54" ry="48" fill="var(--otto)"/>
    <g clip-path="url(#${u}b)">
      <ellipse cx="128" cy="176" rx="50" ry="50" fill="var(--otto-dark)"/>
      <ellipse cx="72" cy="130" rx="22" ry="12" fill="var(--otto-light)"/>
      <ellipse cx="96" cy="172" rx="36" ry="34" fill="var(--otto-cream)"/>
      <path d="M112 150c14 10 18 30 6 50h20v-50z" fill="var(--cream-dark)"/>
    </g>
    <ellipse cx="100" cy="162" rx="54" ry="48" fill="none" stroke="var(--ink)" stroke-width="5"/>
    <g class="o-feet">
      <ellipse cx="72" cy="207" rx="17" ry="9" fill="var(--otto-dark)" stroke="var(--ink)" stroke-width="4"/>
      <ellipse cx="128" cy="207" rx="17" ry="9" fill="var(--otto-dark)" stroke="var(--ink)" stroke-width="4"/>
      <g fill="#ffb3c8"><ellipse cx="72" cy="208" rx="6" ry="3.5"/><circle cx="63" cy="203" r="2.2"/><circle cx="81" cy="203" r="2.2"/><ellipse cx="128" cy="208" rx="6" ry="3.5"/><circle cx="119" cy="203" r="2.2"/><circle cx="137" cy="203" r="2.2"/></g>
    </g>
    <g class="o-paper">
      <rect x="77" y="136" width="46" height="56" rx="7" fill="#fff" stroke="var(--ink)" stroke-width="4"/>
      <path d="M79 140a5 5 0 0 1 5-3h32a5 5 0 0 1 5 3v11H79z" fill="#ff5c8a"/>
      <text x="100" y="149" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="10" fill="#fff">PDF</text>
      <rect x="85" y="158" width="30" height="4" rx="2" fill="#c9b8ff"/>
      <rect x="85" y="166" width="22" height="4" rx="2" fill="#9fe6d9"/>
      <rect x="85" y="174" width="27" height="4" rx="2" fill="#ffd166"/>
      <path d="M103 183c-2-3 2-5 3-2 1-3 5-1 3 2l-3 3z" fill="#ff8fb8"/>
      <ellipse cx="77" cy="166" rx="12" ry="14" fill="var(--otto)" stroke="var(--ink)" stroke-width="4"/>
      <ellipse cx="74" cy="160" rx="4" ry="3" fill="var(--otto-light)"/>
    </g>
    <g class="o-head">
    <g class="o-ear"><circle cx="40" cy="68" r="13" fill="var(--otto)" stroke="var(--ink)" stroke-width="5"/><circle cx="41" cy="69" r="6" fill="var(--cheek)"/></g>
    <g class="o-ear r"><circle cx="160" cy="68" r="13" fill="var(--otto)" stroke="var(--ink)" stroke-width="5"/><circle cx="159" cy="69" r="6" fill="var(--cheek)"/></g>
    <ellipse cx="100" cy="90" rx="70" ry="56" fill="var(--otto)"/>
    <g clip-path="url(#${u}h)">
      <ellipse cx="124" cy="112" rx="78" ry="58" fill="var(--otto-dark)"/>
      <ellipse cx="94" cy="84" rx="74" ry="52" fill="var(--otto)"/>
      <path d="M52 52c14-14 40-20 62-16-24 2-44 10-56 24z" fill="var(--otto-light)"/>
      <ellipse cx="64" cy="50" rx="7" ry="4" fill="#fff" opacity=".7" transform="rotate(-25 64 50)"/>
    </g>
    <path d="M42 104c2-21 27-31 58-23 31-8 56 2 58 23 3 25-25 41-58 41S39 129 42 104z" fill="var(--otto-cream)"/>
    <g clip-path="url(#${u}f)"><path d="M150 96c6 26-18 46-54 48 40 6 70-8 64-40z" fill="var(--cream-dark)"/></g>
    <ellipse cx="100" cy="90" rx="70" ry="56" fill="none" stroke="var(--ink)" stroke-width="5"/>
    <path class="o-tuft" d="M88 38c-2-10 6-15 11-9 1-9 12-9 12 0 5-5 12 0 8 7" fill="var(--otto)" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="o-eyes">
      <g class="o-eye"><g class="o-look">
        <ellipse cx="72" cy="88" rx="17" ry="21" fill="var(--eye)"/>
        <g clip-path="url(#${u}e1)"><ellipse cx="72" cy="108" rx="18" ry="12" fill="var(--iris)"/><ellipse cx="72" cy="112" rx="12" ry="6" fill="var(--iris-light)"/></g>
        <ellipse cx="65" cy="79" rx="7" ry="8" fill="#fff"/><circle cx="79" cy="97" r="3.2" fill="#fff"/>
        <path class="o-star" d="M77 74l1.2 2.6 2.6 1.2-2.6 1.2L77 81.6l-1.2-2.6-2.6-1.2 2.6-1.2z" fill="#fff"/>
      </g></g>
      <g class="o-eye"><g class="o-look">
        <ellipse cx="128" cy="88" rx="17" ry="21" fill="var(--eye)"/>
        <g clip-path="url(#${u}e2)"><ellipse cx="128" cy="108" rx="18" ry="12" fill="var(--iris)"/><ellipse cx="128" cy="112" rx="12" ry="6" fill="var(--iris-light)"/></g>
        <ellipse cx="121" cy="79" rx="7" ry="8" fill="#fff"/><circle cx="135" cy="97" r="3.2" fill="#fff"/>
        <path class="o-star" d="M133 74l1.2 2.6 2.6 1.2-2.6 1.2-1.2 2.6-1.2-2.6-2.6-1.2 2.6-1.2z" fill="#fff"/>
      </g></g>
    </g>
    <g class="o-joy" fill="none" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"><path d="M58 92q14-16 28 0"/><path d="M114 92q14-16 28 0"/></g>
    <g class="o-dizzy" fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round">
      <path d="M72 88m-2 0a2 2 0 1 1 4 0a5 5 0 1 1-10 0a8 8 0 1 1 16 0a11 11 0 1 1-22 0"/>
      <path d="M128 88m-2 0a2 2 0 1 1 4 0a5 5 0 1 1-10 0a8 8 0 1 1 16 0a11 11 0 1 1-22 0"/>
    </g>
    <g class="o-cheeks">
      <ellipse cx="48" cy="114" rx="12" ry="7" fill="var(--cheek)"/>
      <ellipse cx="152" cy="114" rx="12" ry="7" fill="var(--cheek)"/>
      <g stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".85"><path d="M42 116l3-5M48 116l3-5M54 116l3-5M146 116l3-5M152 116l3-5M158 116l3-5"/></g>
    </g>
    <path d="M90 104c0-6 20-6 20 0 0 5-6 9-10 9s-10-4-10-9z" fill="var(--eye)" stroke="var(--ink)" stroke-width="2"/>
    <ellipse cx="96" cy="103" rx="3" ry="1.8" fill="#fff" opacity=".9"/>
    <g class="o-m-smile"><path d="M96 121c1 5 7 5 8 0z" fill="#ff7a9c"/><path d="M88 119c3 5 9 5 12 0 3 5 9 5 12 0" fill="none" stroke="var(--ink)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></g>
    <g class="o-m-grin"><path d="M87 117c2 12 24 12 26 0z" fill="#7a2140" stroke="var(--ink)" stroke-width="3.2" stroke-linejoin="round"/><path d="M93 124c3-4 11-4 14 0-3 3-11 3-14 0z" fill="#ff7a9c"/></g>
    <g class="o-m-open"><ellipse cx="100" cy="123" rx="6" ry="7" fill="#7a2140" stroke="var(--ink)" stroke-width="3"/><ellipse cx="100" cy="126" rx="3.5" ry="2.5" fill="#ff7a9c"/></g>
    <g stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round" opacity=".55"><path d="M66 118 44 115M66 124 46 129"/><path d="M134 118l22-3M134 124l20 5"/></g>
    </g>
    <g class="o-pawR">
      <ellipse cx="123" cy="166" rx="12" ry="14" fill="var(--otto)" stroke="var(--ink)" stroke-width="4"/>
      <path d="M126 158a10 12 0 0 1 4 16l-6 2z" fill="var(--otto-dark)"/>
      <g fill="#ffb3c8"><ellipse cx="123" cy="170" rx="4" ry="3"/><circle cx="118" cy="163" r="1.6"/><circle cx="123" cy="161" r="1.6"/><circle cx="128" cy="163" r="1.6"/></g>
    </g>
    <g class="o-glass"><circle cx="150" cy="140" r="15" fill="rgba(170,230,255,.55)" stroke="var(--ink)" stroke-width="5"/><path d="M144 134a8 8 0 0 1 8-3" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M161 151l12 12" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/></g>
    </g>
  </g>
  <g class="o-pebbles" stroke="var(--ink)" stroke-width="3"><circle class="p1" cx="80" cy="20" r="7" fill="#b9a2ff"/><circle class="p2" cx="120" cy="20" r="7" fill="#7fe3ff"/><circle class="p3" cx="100" cy="10" r="6" fill="#ffd166"/></g>
  <g class="o-spark" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round">
    <path d="M22 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#ffd166"/><path d="M180 108l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#7fe3ff"/>
  </g>
  <g class="o-hearts" fill="#ff5c8a" stroke="var(--ink)" stroke-width="2"><path d="M40 60c-6-8 4-14 8-6 4-8 14-2 8 6l-8 8z"/><path d="M150 30c-5-7 3-12 7-5 4-7 12-2 7 5l-7 7z"/><path d="M168 80c-4-6 3-10 6-4 3-6 10-2 6 4l-6 6z"/></g>
  <g class="o-zzz" fill="#8b7cff" stroke="var(--ink)" stroke-width="1.5" font-family="Nunito,sans-serif" font-weight="900"><text x="150" y="40" font-size="22">z</text><text x="168" y="22" font-size="15">z</text></g>
</svg>`;
}

export function mountOttos(root = document) {
  root.querySelectorAll("[data-otto]:not([data-otto-ready])").forEach(el => {
    el.innerHTML = ottoSVG();
    el.dataset.ottoReady = "1";
  });
}

const STATES = ["happy", "wiggle", "spin", "think", "love", "sleep", "sad", "wave", "juggle", "pet", "hug", "dizzy", "surprised", "yawn"];
export function mood(state, ms = 2200, scope = document) {
  scope.querySelectorAll(".otto").forEach(svg => {
    STATES.forEach(s => svg.classList.remove("is-" + s));
    if (!state) return;
    void svg.getBoundingClientRect();
    svg.classList.add("is-" + state);
    clearTimeout(svg._t);
    if (ms) svg._t = setTimeout(() => svg.classList.remove("is-" + state), ms);
  });
}

const reduced = () => document.documentElement.dataset.motionEff === "reduced";

export function confetti(x = innerWidth / 2, y = innerHeight / 2, n = 28) {
  if (reduced()) return;
  const fx = document.getElementById("fx");
  const colors = ["#ff8fb8", "#ffd166", "#4fd8c4", "#b9a2ff", "#ffb37a", "#7fe3ff", "#8fe08a"];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("i");
    s.className = ["star", "petal", "flower", "heart"][i % 4];
    const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 160;
    s.style.cssText = `left:${x}px;top:${y}px;--c:${colors[i % colors.length]};--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d + 120}px;--r:${(Math.random() * 720 - 360) | 0}deg;--d:${1 + Math.random() * .8}s`;
    fx.appendChild(s);
    setTimeout(() => s.remove(), 2000);
  }
}

// piccole scintille dove si tocca (stelline e cuoricini)
export function sparkle(x, y, n = 6, kind) {
  if (reduced()) return;
  const fx = document.getElementById("fx");
  for (let i = 0; i < n; i++) {
    const s = document.createElement("b");
    s.className = "tap " + (kind || (i % 2 ? "heart" : "star"));
    const a = (i / n) * Math.PI * 2 + Math.random() * .5, d = 22 + Math.random() * 26;
    s.style.cssText = `left:${x}px;top:${y}px;--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d - 10}px;--c:${["#ff8fb8", "#ffd166", "#b9a2ff", "#7fe3ff"][i % 4]}`;
    fx.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}

// Gli occhi seguono il dito o il puntatore
let lookRAF = 0, lastPt = null;
function updateLook() {
  lookRAF = 0;
  document.querySelectorAll(".otto").forEach(svg => {
    const r = svg.getBoundingClientRect();
    if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
    let lx = 0, ly = 0;
    if (lastPt) {
      const cx = r.left + r.width / 2, cy = r.top + r.height * .4;
      const dx = lastPt.x - cx, dy = lastPt.y - cy, dist = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, dist / 260);
      lx = dx / dist * 4 * k; ly = dy / dist * 3.5 * k;
    }
    svg.style.setProperty("--lx", lx.toFixed(2) + "px");
    svg.style.setProperty("--ly", ly.toFixed(2) + "px");
  });
}
export function lookAt(x, y) { lastPt = x == null ? null : { x, y }; if (!lookRAF) lookRAF = requestAnimationFrame(updateLook); }

let started = false;
export function startOttoLife() {
  if (started) return; started = true;
  addEventListener("pointermove", e => lookAt(e.clientX, e.clientY), { passive: true });
  addEventListener("pointerdown", e => lookAt(e.clientX, e.clientY), { passive: true });
  document.addEventListener("pointerleave", () => lookAt(null));
  // ogni tanto, da solo: si guarda intorno, sbadiglia, saluta, fa il giocoliere
  setInterval(() => {
    if (document.hidden || reduced()) return;
    const busy = [...document.querySelectorAll(".otto")].some(s => STATES.some(x => s.classList.contains("is-" + x)));
    if (busy) return;
    const r = Math.random();
    if (r < .3) { const x = innerWidth * Math.random(), y = innerHeight * Math.random(); lookAt(x, y); setTimeout(() => lookAt(null), 1400); }
    else if (r < .45) mood("juggle", 3200);
    else if (r < .55) mood("yawn", 2000);
    else if (r < .65) mood("wave", 2000);
  }, 9000);
}
