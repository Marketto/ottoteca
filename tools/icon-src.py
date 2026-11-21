#!/usr/bin/env python3
"""Disegni delle icone di Ottoteca (tema: l'habitat di Otto — foglie, fiori, ninfee, facce kawaii).
Scrive design/icons/<nome>.svg (griglia 24x24, tratto 2 arrotondato). Poi: python3 tools/build-icons.py"""
import math
from pathlib import Path
import pathops

OUT = Path(__file__).resolve().parent.parent / 'design' / 'icons'
S = 'fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
DOT = 'fill="#000" stroke="none"'

def circles_union(cs):
    """Contorno dell'unione di più cerchi (per i fiori): restituisce un path d."""
    acc = pathops.Path()
    for (cx, cy, r) in cs:
        p = pathops.Path()
        k = 0.5523 * r
        p.moveTo(cx + r, cy)
        p.cubicTo(cx + r, cy + k, cx + k, cy + r, cx, cy + r)
        p.cubicTo(cx - k, cy + r, cx - r, cy + k, cx - r, cy)
        p.cubicTo(cx - r, cy - k, cx - k, cy - r, cx, cy - r)
        p.cubicTo(cx + k, cy - r, cx + r, cy - k, cx + r, cy)
        p.close()
        acc = pathops.op(acc, p, pathops.PathOp.UNION)
    d = []
    for verb, pts in acc.segments:
        if verb == 'moveTo': d.append('M%.2f %.2f' % pts[0])
        elif verb == 'lineTo': d.append('L%.2f %.2f' % pts[0])
        elif verb == 'curveTo': d.append('C' + ' '.join('%.2f %.2f' % p for p in pts))
        elif verb == 'qCurveTo': d.append('Q' + ' '.join('%.2f %.2f' % p for p in pts))
        elif verb == 'closePath': d.append('Z')
    return ''.join(d)

def flower(cx, cy, R, r, n=5, rot=-90):
    return circles_union([(cx, cy, R * 0.92)] + [(cx + R * math.cos(math.radians(rot + i * 360 / n)), cy + R * math.sin(math.radians(rot + i * 360 / n)), r) for i in range(n)])

def face(x1, x2, y, smile=True, r=0.9):
    s = f'<circle cx="{x1}" cy="{y}" r="{r}" {DOT}/><circle cx="{x2}" cy="{y}" r="{r}" {DOT}/>'
    if smile:
        m = (x1 + x2) / 2
        s += f'<path d="M{m-0.9} {y+1.4}q0.9 0.9 1.8 0" stroke-width="1.4"/>'
    return s

ICONS = {
 # navigazione
 'books': f'<path d="M4 20V8.5A1.5 1.5 0 0 1 5.5 7H9v13z"/><path d="M9 20V5.5A1.5 1.5 0 0 1 10.5 4H13a1 1 0 0 1 1 1v15z"/><path d="M15 8.4l2.4-.8 3.3 10.6-2.5.8"/><path d="M3 20.5h18"/><path d="M5.8 6.9C5.4 4.8 6.6 3.4 8.4 3.2c.3 2-.9 3.5-2.6 3.7z"/>' + face(10.4, 12.6, 11),
 'wallet': f'<rect x="3" y="7" width="18" height="13" rx="4"/><path d="M6.5 7l8.5-3.3 1.5 3.3"/><path d="M21 11h-3.5a2 2 0 0 0 0 4H21"/><circle cx="17.6" cy="13" r="1" {DOT}/>' + face(7.5, 11, 13),
 'gear': f'<path d="{flower(12, 12, 6.3, 2.6, 6)}"/><circle cx="12" cy="12" r="2.3"/>',
 # azioni principali
 'phone-search': f'<rect x="4" y="2.5" width="11" height="19" rx="2.6"/><path d="M8.2 5.2h2.6"/><circle cx="16" cy="14.5" r="3.6"/><path d="M18.6 17.1 21 19.5"/><path d="M7.5 11.5l1-1M7.5 15l1.6-1.6"/><path d="M19.8 2.4q.5 2.1 2.6 2.6-2.1.5-2.6 2.6-.5-2.1-2.6-2.6 2.1-.5 2.6-2.6z"/>',
 'file-plus': f'<path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M13.5 3 19 8.5V12"/><path d="M13.5 3v5.5H19"/><path d="M17.5 15v6M14.5 18h6"/>',
 'folder': f'<path d="M3 8a2 2 0 0 1 2-2h4l2 2.2h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M14.5 8.2C14.6 5.8 16.3 4.4 18.6 4.6c-.1 2.3-1.8 3.6-4.1 3.6z"/>' + face(10, 14, 14),
 'folder-plus': f'<path d="M12 20H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2 2.2h8a2 2 0 0 1 2 2V12"/><path d="M18 15v6M15 18h6"/><circle cx="8" cy="13" r="0.9" {DOT}/><circle cx="11.5" cy="13" r="0.9" {DOT}/>',
 'refresh': f'<path d="M19.5 9.5A8 8 0 0 0 5 8"/><path d="M4.5 14.5A8 8 0 0 0 19 16"/><path d="M19.8 4.5v5h-5"/><path d="M4.2 19.5v-5h5"/>',
 # viste
 'grid': f'<rect x="3.5" y="3.5" width="7" height="7" rx="2.4"/><rect x="13.5" y="3.5" width="7" height="7" rx="2.4"/><rect x="3.5" y="13.5" width="7" height="7" rx="2.4"/><path d="M17 20.5c-2.2 0-3.5-1.6-3.5-3.5s1.3-3.5 3.5-3.5 3.5 1.3 3.5 3.5"/><path d="M17 17l3.5 3.5"/>',
 'clock': f'<circle cx="12" cy="12.5" r="6.3"/><path d="M12 9.5v3.2l2.2 1.5"/><path d="M12 2.6v1.4M19.8 5.6l-1 1M21.4 12.5H20M4.2 5.6l1 1M2.6 12.5H4M19.8 19.4l-1-1M4.2 19.4l1-1"/>',
 # cartelle / etichette
 'tag': f'<path d="M5 19C5 10.5 10.5 5 19 5c0 8.5-5.5 14-14 14z"/><path d="M5 19l9-9"/><path d="M9.5 14.5h3M12 12v-3"/>',
 # controlli
 'search': f'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/><path d="M8 8.5a3 3 0 0 1 2.5-1.5"/><path d="M19.6 1.9999999999999996q.5 2.1 2.6 2.6-2.1.5-2.6 2.6-.5-2.1-2.6-2.6 2.1-.5 2.6-2.6z"/>',
 'plus': f'<path d="M12 5v14M5 12h14"/>',
 'minus': f'<path d="M5 12h14"/>',
 'check': f'<rect x="3.5" y="3.5" width="17" height="17" rx="5.5"/><path d="M8 12.5l3 3 5-6"/>',
 'x': f'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
 'back': f'<path d="M15 5l-7 7 7 7"/>',
 'up': f'<path d="M5 15l7-7 7 7"/>',
 'down': f'<path d="M5 9l7 7 7-7"/>',
 'fit': f'<path d="M3.5 12h17M7 8.5 3.5 12 7 15.5M17 8.5l3.5 3.5-3.5 3.5"/><path d="M12 4v2M12 18v2"/>',
 'dots': f'<circle cx="12" cy="5.5" r="1.8" {DOT}/><circle cx="12" cy="12" r="2.2" {DOT}/><circle cx="12" cy="18.5" r="1.8" {DOT}/>',
 # documento e codici
 'pdf': f'<path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/><path d="M13.5 3v5.5H19"/>' + face(9.6, 14.4, 14),
 'qr': f'<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="2"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="2"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="2"/><circle cx="6.75" cy="6.75" r="1" {DOT}/><circle cx="17.25" cy="6.75" r="1" {DOT}/><circle cx="6.75" cy="17.25" r="1" {DOT}/><path d="M14 14h2.5v2.5M20.5 14v.1M14 20.5h2.5M20.5 18v2.5H18"/>',
 'ticket': f'<path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h14A1.5 1.5 0 0 1 20.5 7v2.5a2.5 2.5 0 0 0 0 5V17a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17v-2.5a2.5 2.5 0 0 0 0-5z"/><path d="M15 6v1.5M15 11v2M15 16.5V18"/><path d="M8.5 9.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z"/>',
 'squash': f'<path d="M12 2.5v5M9.5 5 12 7.5 14.5 5M12 21.5v-5M9.5 19l2.5-2.5 2.5 2.5"/><path d="M5 12c0-1.4 3.1-2 7-2s7 .6 7 2-3.1 2-7 2-7-.6-7-2z"/>',
 'eye': f'<path d="M2.5 13S6 7 12 7s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="13" r="2.8"/><path d="M12 4v1.5M7.5 5l.7 1.4M16.5 5l-.7 1.4"/>',
 'edit': f'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/><path d="M15 20h5"/>',
 'copy': f'<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 5.2A2 2 0 0 0 14 4H6a2 2 0 0 0-2 2v8a2 2 0 0 0 1.2 1.8"/>' + face(12.3, 15.7, 13.2),
 'share': f'<circle cx="18" cy="5.5" r="2.8"/><circle cx="6" cy="12" r="2.8"/><circle cx="18" cy="18.5" r="2.8"/><path d="M8.5 10.7l7-3.9M8.5 13.3l7 3.9"/>',
 'download': f'<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5"/><path d="M4 19c1.3 1 2.7 1 4 0 1.3 1 2.7 1 4 0 1.3 1 2.7 1 4 0 1.3 1 2.7 1 4 0"/>',
 'trash': f'<path d="M4 6.5h16M9.5 6.5V4.5h5v2"/><path d="M6 6.5l1 13a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4l1-13"/>' + face(10.2, 13.8, 12.5),
 # tipi di documento riconosciuti
 'invoice': f'<path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/><path d="M13.5 3v5.5H19"/><path d="M14 12.6a3 3 0 1 0 0 3.8"/><path d="M9 13.6h4M9 15.4h4"/>',
 'receipt': f'<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 7.5h6M9 11h6M9 14.5h3.5"/>',
 'plane': f'<path d="M10.5 13.5 4 11l1.6-1.6 7.3.6 3.6-3.6a2 2 0 0 1 2.9 2.9l-3.6 3.6.6 7.3L14.8 21l-2.5-6.5"/><path d="M8 16l-3 .5L4 18.5 6.6 19 8.5 20l.5-1.5L9 16"/>',
 'event': f'<path d="M9 18V6.5l10-2.5V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/><path d="M9 10l10-2.5"/><path d="M4.5 4.3q.4 1.7 2 2-1.6.4-2 2-.4-1.6-2-2 1.6-.3 2-2z"/>',
 'heart': f'<path d="M12 20s-7.5-4.5-7.5-10A4.2 4.2 0 0 1 12 7.5 4.2 4.2 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>',
 'flower': f'<path d="{flower(12, 12, 5, 3.3, 5)}"/><circle cx="12" cy="12" r="2"/>',
}

OUT.mkdir(parents=True, exist_ok=True)
for name, body in ICONS.items():
    (OUT / f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g {S}>{body}</g></svg>\n')
print(len(ICONS), 'icone scritte in', OUT)
