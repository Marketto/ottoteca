// Otto, la lontra kawaii. SVG inline + stati animati (classi is-*) + coriandoli.
let uid = 0;
export function ottoSVG() {
  const u = "o" + (++uid);
  return `<svg class="otto" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
  <defs>
    <radialGradient id="${u}b" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="var(--otto)"/><stop offset="1" stop-color="var(--otto-dark)"/></radialGradient>
  </defs>
  <ellipse cx="100" cy="212" rx="58" ry="6" fill="#000" opacity=".10"/>
  <g class="o-all">
    <path class="o-tail" d="M140 190c22 2 40-8 46-26 2-7-6-10-10-5-8 11-20 16-38 16z" fill="var(--otto-dark)"/>
    <ellipse cx="100" cy="160" rx="56" ry="50" fill="url(#${u}b)"/>
    <ellipse cx="100" cy="168" rx="38" ry="36" fill="var(--otto-cream)"/>
    <ellipse cx="72" cy="206" rx="17" ry="9" fill="var(--otto-dark)"/>
    <ellipse cx="128" cy="206" rx="17" ry="9" fill="var(--otto-dark)"/>
    <g class="o-paper">
      <rect x="78" y="138" width="44" height="54" rx="6" fill="#fff" stroke="#e8d5c2" stroke-width="2"/>
      <rect x="78" y="138" width="44" height="13" rx="6" fill="#e5637a"/>
      <rect x="78" y="146" width="44" height="5" fill="#e5637a"/>
      <text x="100" y="149" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="10" fill="#fff">PDF</text>
      <rect x="85" y="158" width="30" height="4" rx="2" fill="#ead8c6"/>
      <rect x="85" y="166" width="22" height="4" rx="2" fill="#ead8c6"/>
      <rect x="85" y="174" width="27" height="4" rx="2" fill="#ead8c6"/>
      <ellipse cx="78" cy="166" rx="11" ry="13" fill="var(--otto)"/>
      <ellipse cx="122" cy="166" rx="11" ry="13" fill="var(--otto)"/>
    </g>
    <g class="o-ear"><circle cx="40" cy="68" r="12" fill="var(--otto-dark)"/><circle cx="41" cy="69" r="5.5" fill="var(--cheek)" opacity=".6"/></g>
    <g class="o-ear r"><circle cx="160" cy="68" r="12" fill="var(--otto-dark)"/><circle cx="159" cy="69" r="5.5" fill="var(--cheek)" opacity=".6"/></g>
    <ellipse cx="100" cy="92" rx="68" ry="54" fill="url(#${u}b)"/>
    <path d="M44 102c2-20 26-30 56-22 30-8 54 2 56 22 3 24-24 40-56 40S41 126 44 102z" fill="var(--otto-cream)"/>
    <ellipse class="o-eye" cx="73" cy="86" rx="13" ry="15.5" fill="var(--eye)"/>
    <ellipse class="o-eye" cx="127" cy="86" rx="13" ry="15.5" fill="var(--eye)"/>
    <g class="o-shine" fill="#fff">
      <circle cx="68" cy="80" r="5.2"/><circle cx="77" cy="92" r="2.4"/>
      <circle cx="122" cy="80" r="5.2"/><circle cx="131" cy="92" r="2.4"/>
    </g>
    <ellipse cx="54" cy="112" rx="10" ry="6" fill="var(--cheek)" opacity=".7"/>
    <ellipse cx="146" cy="112" rx="10" ry="6" fill="var(--cheek)" opacity=".7"/>
    <path d="M90 101c0-6 20-6 20 0 0 5-6 9-10 9s-10-4-10-9z" fill="var(--eye)"/>
    <path d="M89 116c3 4 8 4 11 0 3 4 8 4 11 0" fill="none" stroke="var(--eye)" stroke-width="2.6" stroke-linecap="round"/>
    <g stroke="var(--otto-dark)" stroke-width="2" stroke-linecap="round" opacity=".55">
      <path d="M70 112 46 108M70 118 47 124"/><path d="M130 112l24-4M130 118l23 6"/>
    </g>
    <g class="o-glass"><circle cx="150" cy="140" r="14" fill="rgba(180,230,255,.45)" stroke="#5a4a40" stroke-width="5"/><path d="M160 150l12 12" stroke="#5a4a40" stroke-width="6" stroke-linecap="round"/></g>
  </g>
  <g class="o-hearts" fill="#ff6f91"><path d="M40 60c-6-8 4-14 8-6 4-8 14-2 8 6l-8 8z"/><path d="M150 30c-5-7 3-12 7-5 4-7 12-2 7 5l-7 7z"/><path d="M168 80c-4-6 3-10 6-4 3-6 10-2 6 4l-6 6z"/></g>
  <g class="o-zzz" fill="var(--muted)" font-family="Nunito,sans-serif" font-weight="900"><text x="150" y="40" font-size="20">z</text><text x="166" y="24" font-size="14">z</text></g>
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
  const colors = ["#ff8fab", "#ffd84d", "#7fd8d6", "#b69cff", "#ffb36b", "#8fe08a"];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("i");
    if (i % 3 === 0) s.className = "star";
    const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 160;
    s.style.cssText = `left:${x}px;top:${y}px;--c:${colors[i % colors.length]};--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d + 120}px;--r:${(Math.random() * 720 - 360) | 0}deg;--d:${1 + Math.random() * .8}s`;
    fx.appendChild(s);
    setTimeout(() => s.remove(), 2000);
  }
}
