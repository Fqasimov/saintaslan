# Design System: Saint Aslan

## World

Two grounds, both taken from the photographs: **velvet** (the winter pieces) and **stone** (the studio sweep behind the summer looks), with an **ivory** step for the stock. The page is dyed in the ground of whichever section is in the middle of the screen (900ms), so scrolling from winter to summer is the season turning.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `--velvet` | `#0e0d0c` | Winter ground, intro curtain, footer. |
| `--stone` | `#e2ddd4` | Summer ground; paper behind the drawn flats. |
| `--ivory` | `#f1ede6` | Stock ground; text on velvet. |
| `--taupe` | `#b9ad9e` | The name (as on the cover), section numbers on velvet. Large type only. |
| `--taupe-ink` | `#6b5f51` | Seams in the drawings. |
| `--ink` / `--ink-2` | `#161412` / `#4f4a43` | Text on stone and ivory. |
| `--oxblood` | `#8c1d1f` | The "2026" of the cover; the chosen boutique; the route on the globe; hover on solid buttons. Never a large fill. |

Roles (`--ground`, `--fg`, `--fg-2`, `--line`, `--accent`) are re-pointed under `html[data-ground]`.

## Type

- **Montserrat** (variable): the name, section titles and labels. Titles 520 weight, uppercase; labels 11px, +0.22em.
- **Bodoni Moda italic** (variable, optical size): piece names, ledes, numerals. The product-card voice.
- Body 16px / 1.6.

## Motion

| Moment | Treatment |
| --- | --- |
| Intro | Remotion: letters rise (outExpo, 3-frame stagger), tracking closes 0.62em → 0.2em, thread draws (ease-in-out) and becomes the Baku–Dubai route. Curtain halves part, 1250ms `cubic-bezier(.76,0,.24,1)`. |
| Hero divider | Eased towards the pointer every frame (no springs that overshoot). |
| Flats | Outline 1.9s ease-in-out, then seams and buttons, then the velvet wipes down 1.4s. Tilt ≤ 6°, 160ms while moving, 700ms ease-out back. Sheen masked to the garment's own alpha. |
| Pictures | Unveil upward with `clip-path` 1250ms, settle from 1.12 scale. |
| Stock | Cards leave in 220ms (blur + 0.96), arrive in 550ms, re-flow with layout animation 600ms; all `cubic-bezier(.23,1,.32,1)`. |
| Controls | Press scales to 0.97 in 160ms; hover only on fine pointers. |

Reduced motion: no curtain or tilt, drawings complete, fades only.

## Layout

12 columns, gutter `clamp(16px, 4vw, 56px)`. Section titles span the width; their copy sits in columns 7–12 below. Square corners everywhere; circles only for dots, pins and the divider handle.

## Don't

- No gradients for decoration, no glass, no rounded cards, no drop shadows (the curtain's edge is the one exception).
- No second sans or second serif.
- No invented facts: prices, sizes, addresses, dates, fabric content.
