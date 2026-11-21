// Otto, la lontra kawaii in cel shading: contorno a inchiostro, ombre e luci a bande nette, occhioni lucidi.
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
  <ellipse cx="100" cy="212" rx="60" ry="7" fill="var(--ink)" opacity=".18"/>
  <g class="o-all">
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
    <ellipse cx="72" cy="207" rx="17" ry="9" fill="var(--otto-dark)" stroke="var(--ink)" stroke-width="4"/>
    <ellipse cx="128" cy="207" rx="17" ry="9" fill="var(--otto-dark)" stroke="var(--ink)" stroke-width="4"/>
    <g class="o-paper">
      <rect x="77" y="136" width="46" height="56" rx="7" fill="#fff" stroke="var(--ink)" stroke-width="4"/>
      <path d="M79 140a5 5 0 0 1 5-3h32a5 5 0 0 1 5 3v11H79z" fill="#ff5c8a"/>
      <text x="100" y="149" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="10" fill="#fff">PDF</text>
      <rect x="85" y="158" width="30" height="4" rx="2" fill="#c9b8ff"/>
      <rect x="85" y="166" width="22" height="4" rx="2" fill="#9fe6d9"/>
      <rect x="85" y="174" width="27" height="4" rx="2" fill="#ffd166"/>
      <ellipse cx="77" cy="166" rx="12" ry="14" fill="var(--otto)" stroke="var(--ink)" stroke-width="4"/>
      <ellipse cx="123" cy="166" rx="12" ry="14" fill="var(--otto)" stroke="var(--ink)" stroke-width="4"/>
      <path d="M126 158a10 12 0 0 1 4 16l-6 2z" fill="var(--otto-dark)"/>
      <ellipse cx="74" cy="160" rx="4" ry="3" fill="var(--otto-light)"/>
    </g>
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
    <g class="o-eye">
      <ellipse cx="72" cy="88" rx="17" ry="21" fill="var(--eye)"/>
      <g clip-path="url(#${u}e1)"><ellipse cx="72" cy="108" rx="18" ry="12" fill="var(--iris)"/><ellipse cx="72" cy="112" rx="12" ry="6" fill="var(--iris-light)"/></g>
      <ellipse cx="65" cy="79" rx="7" ry="8" fill="#fff"/><circle cx="79" cy="97" r="3.2" fill="#fff"/><circle cx="76" cy="77" r="2" fill="#fff"/>
    </g>
    <g class="o-eye">
      <ellipse cx="128" cy="88" rx="17" ry="21" fill="var(--eye)"/>
      <g clip-path="url(#${u}e2)"><ellipse cx="128" cy="108" rx="18" ry="12" fill="var(--iris)"/><ellipse cx="128" cy="112" rx="12" ry="6" fill="var(--iris-light)"/></g>
      <ellipse cx="121" cy="79" rx="7" ry="8" fill="#fff"/><circle cx="135" cy="97" r="3.2" fill="#fff"/><circle cx="132" cy="77" r="2" fill="#fff"/>
    </g>
    <ellipse cx="48" cy="114" rx="12" ry="7" fill="var(--cheek)"/>
    <ellipse cx="152" cy="114" rx="12" ry="7" fill="var(--cheek)"/>
    <g stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".85"><path d="M42 116l3-5M48 116l3-5M54 116l3-5M146 116l3-5M152 116l3-5M158 116l3-5"/></g>
    <path d="M90 104c0-6 20-6 20 0 0 5-6 9-10 9s-10-4-10-9z" fill="var(--eye)" stroke="var(--ink)" stroke-width="2"/>
    <ellipse cx="96" cy="103" rx="3" ry="1.8" fill="#fff" opacity=".9"/>
    <path d="M96 121c1 5 7 5 8 0z" fill="#ff7a9c"/>
    <path d="M88 119c3 5 9 5 12 0 3 5 9 5 12 0" fill="none" stroke="var(--ink)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <g stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round" opacity=".55"><path d="M66 118 44 115M66 124 46 129"/><path d="M134 118l22-3M134 124l20 5"/></g>
    <g class="o-glass"><circle cx="150" cy="140" r="15" fill="rgba(170,230,255,.55)" stroke="var(--ink)" stroke-width="5"/><path d="M144 134a8 8 0 0 1 8-3" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M161 151l12 12" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/></g>
  </g>
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

const STATES = ["is-happy", "is-wiggle", "is-spin", "is-think", "is-love", "is-sleep", "is-sad"];
export function mood(state, ms = 2200, scope = document) {
  scope.querySelectorAll(".otto").forEach(svg => {
    STATES.forEach(s => svg.classList.remove(s));
    if (!state) return;
    void svg.getBoundingClientRect();
    svg.classList.add("is-" + state);
    clearTimeout(svg._t);
    if (ms) svg._t = setTimeout(() => svg.classList.remove("is-" + state), ms);
  });
}

export function confetti(x = innerWidth / 2, y = innerHeight / 2, n = 28) {
  if (document.documentElement.dataset.motionEff === "reduced") return;
  const fx = document.getElementById("fx");
  const colors = ["#ff8fb8", "#ffd166", "#4fd8c4", "#b9a2ff", "#ffb37a", "#7fe3ff", "#8fe08a"];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("i");
    s.className = ["star", "petal", "flower", ""][i % 4];
    const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 160;
    s.style.cssText = `left:${x}px;top:${y}px;--c:${colors[i % colors.length]};--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d + 120}px;--r:${(Math.random() * 720 - 360) | 0}deg;--d:${1 + Math.random() * .8}s`;
    fx.appendChild(s);
    setTimeout(() => s.remove(), 2000);
  }
}
