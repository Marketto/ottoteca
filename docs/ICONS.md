# Icon font — Ottoteca Icons

Kawaii icon set used for every interface control (navigation, buttons, dialogs).
Theme: Otto's habitat (leaves, flowers, lily pads, tiny kawaii faces). Drawings live in `tools/icon-src.py`.

## Use
```js
ic('folder')                 // -> <span class="ic ic-folder" aria-hidden="true"></span>
```
Icons are always decorative (`aria-hidden`): the button next to them must have visible text or an `aria-label`.
Colour follows `currentColor`; size follows `font-size` (1.25em of the parent by default).

## Style rules for new icons
- 24×24 `viewBox`, everything inside a 2 px margin.
- Strokes: `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, no fill.
- Kawaii details: dot eyes `r≈1` (`fill="#000" stroke="none"`) and a tiny smile on "friendly" objects.
- Single colour: no gradients, no opacity.
- Add the drawing to `tools/icon-src.py`, run it, then `python3 tools/build-icons.py` (needs `picosvg skia-pathops fonttools brotli`).
  Codepoints are stored in `design/icons/codepoints.json` and never change.

## Catalogue (33 icons)
| Icon | Name | Codepoint |
|:-:|---|---|
| ![back](../design/icons/back.svg) | `back` | `\e900` |
| ![books](../design/icons/books.svg) | `books` | `\e901` |
| ![check](../design/icons/check.svg) | `check` | `\e902` |
| ![clock](../design/icons/clock.svg) | `clock` | `\e903` |
| ![copy](../design/icons/copy.svg) | `copy` | `\e904` |
| ![dots](../design/icons/dots.svg) | `dots` | `\e905` |
| ![down](../design/icons/down.svg) | `down` | `\e906` |
| ![download](../design/icons/download.svg) | `download` | `\e907` |
| ![edit](../design/icons/edit.svg) | `edit` | `\e908` |
| ![eye](../design/icons/eye.svg) | `eye` | `\e909` |
| ![file-plus](../design/icons/file-plus.svg) | `file-plus` | `\e90a` |
| ![fit](../design/icons/fit.svg) | `fit` | `\e90b` |
| ![flower](../design/icons/flower.svg) | `flower` | `\e90c` |
| ![folder](../design/icons/folder.svg) | `folder` | `\e90d` |
| ![folder-plus](../design/icons/folder-plus.svg) | `folder-plus` | `\e90e` |
| ![gear](../design/icons/gear.svg) | `gear` | `\e90f` |
| ![grid](../design/icons/grid.svg) | `grid` | `\e910` |
| ![heart](../design/icons/heart.svg) | `heart` | `\e911` |
| ![minus](../design/icons/minus.svg) | `minus` | `\e912` |
| ![pdf](../design/icons/pdf.svg) | `pdf` | `\e913` |
| ![phone-search](../design/icons/phone-search.svg) | `phone-search` | `\e914` |
| ![plus](../design/icons/plus.svg) | `plus` | `\e915` |
| ![qr](../design/icons/qr.svg) | `qr` | `\e916` |
| ![refresh](../design/icons/refresh.svg) | `refresh` | `\e917` |
| ![search](../design/icons/search.svg) | `search` | `\e918` |
| ![share](../design/icons/share.svg) | `share` | `\e919` |
| ![squash](../design/icons/squash.svg) | `squash` | `\e91a` |
| ![tag](../design/icons/tag.svg) | `tag` | `\e91b` |
| ![ticket](../design/icons/ticket.svg) | `ticket` | `\e91c` |
| ![trash](../design/icons/trash.svg) | `trash` | `\e91d` |
| ![up](../design/icons/up.svg) | `up` | `\e91e` |
| ![wallet](../design/icons/wallet.svg) | `wallet` | `\e91f` |
| ![x](../design/icons/x.svg) | `x` | `\e920` |
