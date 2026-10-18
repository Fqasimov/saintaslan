# Saint Aslan

One-page site for Saint Aslan, a couture house from Azerbaijan with stock in two boutiques, Baku and Dubai. In English.

The design comes from the house's own material: the logo (the name in thin, wide capitals across a red disc), black velvet for winter, the warm stone of the studio sweep for Summer 2026, and piece names in a Didone italic as on the product cards. See `DESIGN.md` for the system and `PRODUCT.md` for what the site is for.

## What happens on the page

| Moment | What it does |
| --- | --- |
| Intro | The **logo film**, a Remotion composition (`src/remotion/Intro.tsx`), played 1.3× faster than the master. Then the velvet curtain parts in two halves, one per city. Once per browser session; any click, key or scroll skips it. `?nointro` skips it too. |
| Hero | Winter and Summer share the screen. The divider follows the mouse (or a finger, or the arrow keys), and the name changes colour where it crosses. |
| Winter | Each velvet piece is **drawn before it appears**: its technical flat (outline, seams, buttons, traced from the house's product shot) draws in ink, then the velvet is laid over it. On a mouse the piece tilts in 3D and light runs over the nap. Then the gown opens out to the whole screen as you scroll. |
| Summer 2026 | Polka dots appear and leave on their own beats as the season scrolls in; the page turns from velvet to stone; the looks run sideways on a pinned rail (a swipeable row on phones). |
| In stock | Choose Baku or Dubai (also in the header, remembered per visitor). A dotted 3D globe turns to the boutique and draws the route; the grid re-flows to that boutique's stock; "Reserve" opens WhatsApp to that boutique with the piece named. |
| The house, Contact | The logo as a 3D object: a red disc with a real edge that turns as you scroll and settles face-on. A statement that lights up word by word; both boutiques with their live clock (both keep GMT+4); a form that writes the WhatsApp message for you. |

Everything respects "reduce motion": no curtain, no tilts, drawings shown complete.

## The logo film

One composition, rendered three ways for the house's own use (`media/`, 6.2 s, 60 fps):

| File | Size | For |
| --- | --- | --- |
| `media/saint-aslan-logo-16x9.mp4` | 1920×1080 | Website, YouTube, screens in the boutiques |
| `media/saint-aslan-logo-1x1.mp4` | 1080×1080 | Instagram feed |
| `media/saint-aslan-logo-9x16.mp4` | 1080×1920 | Stories and Reels |

What happens, beat by beat:

1. **The thread** (0–1.5 s). A red thread is sewn in from the left, a bright needle point at its tip, and wraps into a circle. Its tail follows, so only the circle is left.
2. **The dye** (1.2–2.7 s). Red dye rises inside the circle with a moving liquid surface: a deeper red layer behind, a thin bright meniscus on top. The thread outline melts into the full disc.
3. **The name** (1.7–3.2 s). The letters, traced from the logo file, glide together from wide spacing with motion blur, centre first. Outside the dye they are taupe on the velvet; wherever the dye reaches them, they turn black.
4. **The settle** (0–3.9 s). The camera starts turned in 3D and settles face-on; a slow light finds the disc; a satin sheen runs across it once.
5. **The route** (3.6–4.7 s). A line draws out beneath, to Baku on one side and Dubai on the other. The end frame holds, with a camera drift too slow to notice.

All timings are in `src/remotion/timing.ts`; colours and the traced letters come from the logo file.

```bash
npm run studio        # open Remotion Studio to preview and adjust
npm run render:film   # render the three films into out/
```

## Run it

```bash
npm install
npm run dev       # local development
npm run build     # static build into dist/
npm run preview   # serve the build
```

The build is static with relative paths, so `dist/` can go on any host (Netlify, Vercel, GitHub Pages, a plain web server).

Remotion is free for individuals and companies of up to three people; larger companies need a company license (remotion.dev/license).

## Before going live

Everything to confirm is in two files:

- `src/lib/contact.ts`
  - **WhatsApp numbers** for Baku and Dubai (digits only, e.g. `994501234567`). Until set, buttons open WhatsApp's share sheet with the message already written.
  - **Boutique addresses**. Hidden while empty.
  - **Instagram handle**: `saintaslan` is a guess.
- `src/data/pieces.ts`
  - **Which pieces are in which boutique.** The current split is a placeholder for layout only.
  - **Names.** The three velvet names come from the house's product cards; the others are working names written for the site. The blue set's quote is the house's own caption.

No prices, sizes, addresses, dates or fabric compositions appear anywhere, on purpose.

## What's where

| Path | What it is |
| --- | --- |
| `src/remotion/` | The intro composition and its timing. `index.ts` is the Remotion CLI entry. |
| `src/components/Intro.tsx` | Plays the composition in the page, then parts the curtain. |
| `src/components/Flat.tsx` | The drawn-then-made garment, with tilt and sheen. |
| `src/components/Globe.tsx` | The dotted globe (canvas, no map library at runtime). |
| `src/sections/` | Hero, Winter, Summer, Stock, House, Contact, Footer. |
| `src/brand/Logo.tsx` | The logotype (`LogoMark`) and the full red-disc logo (`LogoDisc`). |
| `src/brand/logo-paths.ts` | The logo traced into one vector path per letter, and its red (generated). |
| `src/data/pieces.ts` | Pieces, seasons and stock per boutique. |
| `src/data/generated.ts` | Image sizes and the traced flats (generated). Photos ship as AVIF in three widths (480 / 800 / 1200). |
| `assets-src/` | The house's original photographs. |
| `scripts/export-images.py` | Crops the photos, cuts the velvet pieces out of their white sweep and traces their flats. `npm run images` (needs Pillow, numpy, opencv-python-headless). |
| `scripts/trace-logo.py` | Traces `assets-src/logo.jpg` into `src/brand/logo-paths.ts`. Also the source of `public/logo.svg` and the favicon. |
| `scripts/globe-dots.mjs` | Samples the land into the globe's dots. |

## Adding a piece

1. Put the photo in `assets-src/`. For a product shot on white, add it to `CUTOUTS` in `scripts/export-images.py` (it will be cut out and drawn); otherwise add it to `PHOTOS`. Run `npm run images`.
2. Add it to `PIECES` in `src/data/pieces.ts` with its season and the boutiques that hold it.
