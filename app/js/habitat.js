// L'habitat di Otto: cielo, sole (o luna), nuvole, colline fiorite, fiume con ninfee, canne, farfalle e petali.
// Tutto decorativo (aria-hidden), colori dalle variabili CSS, animazioni solo transform/opacity.
const INK = 'stroke="var(--ink)" stroke-width="3" stroke-linejoin="round"';

// generatore pseudo-casuale con seme fisso: il paesaggio è sempre lo stesso
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

const PETALS = ["#ff8fb8", "#ffd166", "#b9a2ff", "#7fe3ff", "#ffb37a", "#ffffff"];
function flower(x, y, r, color, i) {
  const p = [];
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
    p.push(`<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${(r * .78).toFixed(1)}" fill="${color}" ${INK.replace("3", "2")}/>`);
  }
  return `<g class="h-flower" style="--d:${(i % 7) * .45}s;transform-origin:${x}px ${y + r * 4}px">
    <path d="M${x} ${y + r * 4.2}q${r * .6} ${-r * 1.6} 0 ${-r * 3.4}" stroke="var(--stem)" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M${x} ${y + r * 3}q${r * 1.6} ${-r * .4} ${r * 1.8} ${-r * 1.4}q${-r * 1.2} 0 ${-r * 1.8} ${r * 1.4}z" fill="var(--leaf)" ${INK.replace("3", "1.6")}/>
    ${p.join("")}<circle cx="${x}" cy="${y}" r="${(r * .62).toFixed(1)}" fill="#ffd166" ${INK.replace("3", "2")}/>
    <circle cx="${x - r * .2}" cy="${y - r * .2}" r="${(r * .18).toFixed(1)}" fill="#fff"/></g>`;
}
function tree(x, y, s) {
  return `<g class="h-tree" style="transform-origin:${x}px ${y}px">
    <rect x="${x - 5 * s}" y="${y - 26 * s}" width="${10 * s}" height="${28 * s}" rx="${3 * s}" fill="#b07a4f" ${INK}/>
    <circle cx="${x}" cy="${y - 44 * s}" r="${30 * s}" fill="var(--tree)" ${INK}/>
    <path d="M${x - 18 * s} ${y - 56 * s}a${20 * s} ${20 * s} 0 0 1 ${22 * s} ${-14 * s}" stroke="#fff" stroke-opacity=".6" stroke-width="${5 * s}" fill="none" stroke-linecap="round"/>
    <circle cx="${x + 10 * s}" cy="${y - 38 * s}" r="${4 * s}" fill="#ff6b8f" ${INK.replace("3", "1.5")}/><circle cx="${x - 12 * s}" cy="${y - 30 * s}" r="${4 * s}" fill="#ff6b8f" ${INK.replace("3", "1.5")}/></g>`;
}
function lily(x, y, s, lotus, i) {
  return `<g class="h-pad" style="--d:${i * .7}s">
    <path d="M${x} ${y}m${-40 * s} 0a${40 * s} ${14 * s} 0 1 0 ${80 * s} 0a${40 * s} ${14 * s} 0 0 0 ${-30 * s} ${-12 * s}l${-10 * s} ${12 * s}l${-6 * s} ${-13 * s}a${40 * s} ${14 * s} 0 0 0 ${-34 * s} ${13 * s}z" fill="var(--pad)" ${INK}/>
    <path d="M${x - 26 * s} ${y + 2 * s}q${20 * s} ${8 * s} ${46 * s} ${2 * s}" stroke="var(--pad-dark)" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${lotus ? `<g transform="translate(${x + 4 * s} ${y - 6 * s}) scale(${s})">
      <path d="M0 0c-18 0-26-14-24-22 10 0 18 8 24 22z" fill="#ffc2da" ${INK.replace("3", "2.4")}/>
      <path d="M0 0c18 0 26-14 24-22-10 0-18 8-24 22z" fill="#ffc2da" ${INK.replace("3", "2.4")}/>
      <path d="M0 0c-8-6-10-22 0-32 10 10 8 26 0 32z" fill="#ff8fb8" ${INK.replace("3", "2.4")}/>
      <circle cx="0" cy="-4" r="4" fill="#ffd166" ${INK.replace("3", "1.6")}/></g>` : ""}</g>`;
}
function reeds(x, flip, n) {
  let out = "";
  for (let k = 0; k < n; k++) {
    const xx = x + (flip ? -k * 22 : k * 22), h = 120 + (k % 3) * 34;
    out += `<g class="h-reed" style="--d:${k * .6}s;transform-origin:${xx}px 470px">
      <path d="M${xx} 470q${flip ? -6 : 6} ${-h / 2} 0 ${-h}" stroke="var(--reed)" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M${xx} ${470 - h * .45}q${flip ? -34 : 34} -30 ${flip ? -40 : 40} -70q${flip ? 10 : -10} 40 ${flip ? 40 : -40} 70z" fill="var(--leaf)" ${INK.replace("3", "2")}/>
      ${k % 2 === 0 ? `<rect x="${xx - 6}" y="${470 - h - 30}" width="12" height="38" rx="6" fill="#a86a3c" ${INK.replace("3", "2.4")}/>` : ""}</g>`;
  }
  return out;
}
function wave(y, amp, cls, fill) {
  let d = `M0 ${y}`;
  for (let x = 0; x < 2880; x += 120) d += ` q30 ${-amp} 60 0 t60 0`;
  return `<path class="${cls}" d="${d} V500 H0z" fill="${fill}" ${INK.replace("3", "2.5")}/>`;
}

function landSVG() {
  const r = rnd(7);
  let flowers = "";
  for (let i = 0; i < 26; i++) {
    const x = 20 + (i / 26) * 1400 + r() * 40, y = 262 + r() * 56 + (i % 2) * 10;
    flowers += flower(Math.round(x), Math.round(y), 6 + Math.round(r() * 5), PETALS[i % PETALS.length], i);
  }
  return `<svg class="h-land" viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" focusable="false">
    <path d="M0 200C200 110 380 140 560 185S900 120 1100 165S1350 110 1440 150V500H0z" fill="var(--hill1)" ${INK}/>
    ${tree(250, 168, 1)}${tree(330, 175, .7)}${tree(1110, 162, .9)}${tree(1190, 150, 1.1)}${tree(700, 170, .75)}
    <path d="M0 270C160 215 340 235 520 262S860 222 1060 252S1320 212 1440 240V500H0z" fill="var(--hill2)" ${INK}/>
    <g fill="#fff" opacity=".5"><ellipse cx="300" cy="250" rx="60" ry="6"/><ellipse cx="980" cy="246" rx="70" ry="6"/></g>
    ${flowers}
    <path d="M0 352C240 332 480 372 720 352S1200 332 1440 357V500H0z" fill="var(--water1)" ${INK}/>
    ${wave(392, 10, "h-wave w1", "var(--water2)")}
    ${wave(436, 8, "h-wave w2", "var(--water3)")}
    <g class="h-glint" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M120 376h40M600 370h26M1010 380h44M1320 372h22M420 412h30M840 420h36"/></g>
    ${lily(170, 404, 1, true, 0)}${lily(520, 448, .8, false, 1)}${lily(760, 400, .9, true, 2)}${lily(1040, 452, 1.1, false, 3)}${lily(1290, 410, .85, true, 4)}
    ${reeds(30, false, 4)}${reeds(1410, true, 4)}
  </svg>`;
}
const SUN = `<svg class="h-sun" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" focusable="false">
  <g class="h-rays" fill="#ffd166" ${INK}>${Array.from({ length: 10 }, (_, k) => `<path d="M80 6l9 20h-18z" transform="rotate(${k * 36} 80 80)"/>`).join("")}</g>
  <g class="h-sunface"><circle cx="80" cy="80" r="42" fill="#ffd84d" ${INK.replace("3", "4")}/>
    <path d="M62 56a26 26 0 0 1 22-10" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M62 80q6-7 12 0M86 80q6-7 12 0" stroke="var(--ink)" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="58" cy="92" rx="8" ry="5" fill="#ff8fb1"/><ellipse cx="102" cy="92" rx="8" ry="5" fill="#ff8fb1"/>
    <path d="M73 94q7 8 14 0" stroke="var(--ink)" stroke-width="4" fill="none" stroke-linecap="round"/></g>
  <g class="h-moon"><path d="M104 40a46 46 0 1 0 0 80a38 38 0 1 1 0-80z" fill="#fff3c4" ${INK.replace("3", "4")}/>
    <path d="M70 84q5-6 10 0" stroke="var(--ink)" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="66" cy="96" rx="7" ry="4" fill="#ff8fb1"/></g>
</svg>`;
const CLOUD = `<svg viewBox="0 0 200 90" xmlns="http://www.w3.org/2000/svg" focusable="false"><path d="M30 78a24 24 0 0 1 4-46a32 32 0 0 1 58-14a28 28 0 0 1 48 8a26 26 0 0 1 30 52z" fill="var(--cloud)" ${INK}/><path d="M48 42a18 18 0 0 1 20-14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/></svg>`;
const FLY = `<svg viewBox="0 0 60 50" xmlns="http://www.w3.org/2000/svg" focusable="false"><g class="h-wing"><path d="M30 25C18 2 2 6 6 20c3 9 16 9 24 5z" fill="var(--c)" ${INK.replace("3", "2.4")}/><path d="M30 25C20 38 8 44 10 34c2-6 12-10 20-9z" fill="var(--c2)" ${INK.replace("3", "2.4")}/></g><g class="h-wing r"><path d="M30 25C42 2 58 6 54 20c-3 9-16 9-24 5z" fill="var(--c)" ${INK.replace("3", "2.4")}/><path d="M30 25C40 38 52 44 50 34c-2-6-12-10-20-9z" fill="var(--c2)" ${INK.replace("3", "2.4")}/></g><rect x="27.5" y="14" width="5" height="24" rx="2.5" fill="var(--ink)"/></svg>`;

export function mountHabitat() {
  const h = document.getElementById("habitat");
  if (!h || h.childElementCount) return;
  let stars = "";
  const r = rnd(3);
  for (let i = 0; i < 26; i++) stars += `<i style="left:${(r() * 100).toFixed(1)}%;top:${(r() * 45).toFixed(1)}%;--d:${(r() * 3).toFixed(2)}s"></i>`;
  let petals = "";
  for (let i = 0; i < 14; i++) petals += `<i style="left:${(r() * 100).toFixed(1)}%;--d:${(r() * 14).toFixed(1)}s;--t:${(12 + r() * 10).toFixed(1)}s;--x:${(r() * 160 - 80) | 0}px;--c:${PETALS[i % 5]}"></i>`;
  let bubbles = "";
  for (let i = 0; i < 9; i++) bubbles += `<i style="left:${(4 + r() * 92).toFixed(1)}%;--s:${(8 + r() * 14) | 0}px;--d:${(r() * 9).toFixed(1)}s;--t:${(6 + r() * 6).toFixed(1)}s;--x:${(r() * 40 - 20) | 0}px"></i>`;
  h.innerHTML = `<div class="h-stars">${stars}</div>${SUN}
    <div class="h-cloud c1">${CLOUD}</div><div class="h-cloud c2">${CLOUD}</div><div class="h-cloud c3">${CLOUD}</div>
    <div class="h-fly f1" style="--c:#ffb3d1;--c2:#ff8fb8">${FLY}</div><div class="h-fly f2" style="--c:#bfe9ff;--c2:#b9a2ff">${FLY}</div>
    ${landSVG()}<div class="h-petals">${petals}</div><div class="h-bubbles">${bubbles}</div>`;
}
