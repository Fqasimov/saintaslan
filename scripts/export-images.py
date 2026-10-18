"""
Crops the owner's photographs (assets-src/) and writes the AVIF sizes the site uses
into public/looks/.

- Campaign photos are cropped clear of the screenshot borders and the Instagram counter.
- The three velvet product shots are cut out of their white sweep (true alpha, edges
  un-mixed from white so no pale halo shows on a dark ground) and their outlines are
  traced into src/data/outlines.ts. The site draws those outlines as line drawings
  before the cloth appears.

Run: npm run images   (needs Pillow, numpy and opencv-python-headless)
"""

from pathlib import Path
import json

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
OUT = ROOT / "public" / "looks"
OUT.mkdir(parents=True, exist_ok=True)

# name: (left, top, right, bottom) crop box in source pixels
PHOTOS = {
    "velvet-choker-gown": (6, 0, 1162, 2072),
    "ivory-chiffon": (6, 14, 1080, 2066),
    "polka-gown": (0, 8, 1156, 2066),
    "polka-gown-close": (0, 0, 1162, 1910),
    "summer-cover": (0, 0, 1169, 1912),
    "noir-ruffle": (0, 0, 1169, 1488),
    "royal-satin": (16, 150, 1160, 1556),
    "floral-dress": (0, 0, 1164, 1466),
    "ocean-set": (0, 10, 1170, 1405),
    "ocean-set-editorial": (0, 0, 1169, 1455),
}
WIDTHS = [480, 800, 1200]

# Product shots on a white sweep: (left, top, right, bottom)
CUTOUTS = {
    "velvet-corset": (100, 270, 1070, 1700),
    "velvet-jacket": (80, 330, 1090, 1690),
    "velvet-skirt": (180, 200, 990, 1880),
}
CUT_WIDTHS = [480, 1000]


def save(img: Image.Image, name: str, widths):
    sizes = {}
    # Never upscale, and skip a size that would be within 15% of the next one.
    ws = []
    for w in widths:
        w = min(w, img.width)
        if ws and w < ws[-1] * 1.15:
            ws[-1] = w
        else:
            ws.append(w)
    for w in ws:
        h = round(img.height * w / img.width)
        out = img.resize((w, h), Image.LANCZOS)
        # AVIF: about half the bytes of WebP at the same look; alpha is kept for cut-outs.
        out.save(OUT / f"{name}-{w}.avif", "AVIF", quality=62, speed=4)
        sizes[w] = (w, h)
    return sizes


def cutout(path: Path, box):
    rgb = np.asarray(Image.open(path).convert("RGB").crop(box)).astype(np.float32)
    lum = rgb.mean(axis=2)
    bg = float(np.median(np.concatenate([lum[:8].ravel(), lum[-8:].ravel()])))

    # Background = everything near-white that is connected to the frame edge, so the
    # pearl buttons (white, but enclosed by cloth) stay opaque.
    near_white = (lum > bg - 40).astype(np.uint8)
    h, w = near_white.shape
    mask = np.zeros((h + 2, w + 2), np.uint8)
    flood = near_white.copy()
    for x in range(0, w, 7):
        for y in (0, h - 1):
            if flood[y, x] == 1:
                cv2.floodFill(flood, mask, (x, y), 2)
    for y in range(0, h, 7):
        for x in (0, w - 1):
            if flood[y, x] == 1:
                cv2.floodFill(flood, mask, (x, y), 2)
    background = flood == 2

    # Un-mix the anti-aliased edge from the white sweep.
    ink = 22.0
    alpha = np.clip((bg - lum) / (bg - ink), 0, 1)
    edge_band = cv2.dilate(background.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    alpha = np.where(edge_band, alpha, 1.0)
    alpha = np.where(background & (lum > bg - 6), 0.0, alpha)

    a = np.maximum(alpha, 1e-3)[..., None]
    color = np.clip((rgb - (1 - a) * bg) / a, 0, 255)
    color = np.where(alpha[..., None] < 0.02, 0, color)
    rgba = np.dstack([color, alpha * 255]).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA"), (alpha > 0.5).astype(np.uint8)


def trace(solid: np.ndarray, scale: float):
    """Outer silhouette as one smooth closed SVG path, in a viewBox of the cutout size * scale."""
    contours, _ = cv2.findContours(solid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(contours, key=cv2.contourArea)
    c = cv2.approxPolyDP(c, 1.6, True)[:, 0, :].astype(float) * scale
    # Catmull-Rom through the simplified points gives the soft line of a pencil.
    pts = c
    n = len(pts)
    d = [f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"]
    for i in range(n):
        p0, p1, p2, p3 = pts[(i - 1) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = p1 + (p2 - p0) / 6
        c2 = p2 - (p3 - p1) / 6
        d.append(f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}")
    return "".join(d) + "Z"


def runs(row: np.ndarray):
    """Start/end columns of the solid runs in one mask row."""
    d = np.diff(np.concatenate([[0], row, [0]]))
    return list(zip(np.nonzero(d == 1)[0], np.nonzero(d == -1)[0] - 1))


def poly(points):
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in points)


def smooth(values, k=31):
    v = np.asarray(values, float)
    if len(v) < k:
        return v
    pad = k // 2
    v2 = np.pad(v, pad, mode="edge")
    return np.convolve(v2, np.ones(k) / k, mode="valid")


def flat_lines(name: str, rgb_box: np.ndarray, solid: np.ndarray):
    """
    The construction lines of a technical flat, measured from the garment itself:
    centre front, princess seams that follow the real waist shaping, buttons, ruching.
    """
    h, w = solid.shape
    cx = (np.nonzero(solid.any(0))[0][[0, -1]].mean())
    lines, dots = [], []

    # Rows where the torso is a run of its own containing the centre.
    torso = []
    for y in range(h):
        rs = runs(solid[y])
        hit = [r for r in rs if r[0] <= cx <= r[1]]
        if hit:
            torso.append((y, hit[0][0], hit[0][1], len(rs)))

    if name == "velvet-corset":
        # Body starts below the neckline (straps are separate runs above it).
        body = [t for t in torso if t[2] - t[1] > w * 0.55]
        y0, y1 = body[0][0] + 14, body[-1][0]
        rows = [t for t in body if y0 <= t[0] <= y1 - 6]
        ys = [t[0] for t in rows]
        for side in (1, 2):
            xs = smooth([cx + 0.5 * (t[side] - cx) for t in rows])
            pts = [(x, y) for x, y in zip(xs, ys)][::6]
            # Stop where the seam meets the pointed hem.
            pts = [(x, y) for x, y in pts if solid[min(int(y) + 4, h - 1), int(x)]]
            lines.append(poly(pts))
        hem_c = max(y for y in range(h) if solid[y, int(cx)])
        lines.insert(0, poly([(cx, y0 - 10), (cx, hem_c - 2)]))

    elif name == "velvet-jacket":
        # Buttons: the bright pearls.
        lum = cv2.cvtColor(rgb_box, cv2.COLOR_RGB2GRAY)
        pearls = ((lum > 170) & (solid > 0)).astype(np.uint8)
        n, _, stats, cents = cv2.connectedComponentsWithStats(pearls)
        for i in range(1, n):
            if stats[i, cv2.CC_STAT_AREA] > 40:
                dots.append((float(cents[i][0]), float(cents[i][1]), float(max(stats[i, 2], stats[i, 3]) / 2)))
        dots.sort(key=lambda d: d[1])
        # Body rows: where the torso has separated from the sleeves, the seams follow its
        # real shaping; above that they sweep out towards the armholes.
        body = [t for t in torso if t[3] >= 3 and t[0] > h * 0.3]
        if body:
            ys = [t[0] for t in body[:-26]]
            for side, sign in ((1, -1), (2, 1)):
                xs = smooth([cx + 0.52 * (t[side] - cx) for t in body[:-26]], 61)
                x0, y0 = xs[0], ys[0]
                reach = h * 0.14
                up = f"M{x0 + sign * w * 0.07:.1f} {y0 - reach:.1f}Q{x0 + sign * w * 0.005:.1f} {y0 - reach * 0.45:.1f} {x0:.1f} {y0:.1f}"
                lines.append(up + "L" + "L".join(f"{x:.1f} {y:.1f}" for x, y in list(zip(xs, ys))[6::6]))
        top = min(y for y in range(h) if solid[y, int(cx)])
        hem_c = max(y for y in range(h) if solid[y, int(cx)])
        neck = top + int(h * 0.055)
        lines.insert(0, poly([(cx, neck), (cx, hem_c - 2)]))

    elif name == "velvet-skirt":
        top = min(y for y in range(h) if solid[y, int(cx)])
        band = top + int(h * 0.045)
        # Waistband seam and the gathered ruching below it.
        for i, yy in enumerate([band] + [band + int(h * f) for f in (0.022, 0.04, 0.058, 0.076)]):
            rs = [r for r in runs(solid[yy]) if r[0] <= cx <= r[1]][0]
            inset = 4 if i == 0 else 10 + i * 3
            sag = 0 if i == 0 else 6 + i * 2
            l, r = rs[0] + inset, rs[1] - inset
            if i == 0:
                lines.append(poly([(l, yy), (r, yy)]))
            else:
                for a, b in ((l, l + (r - l) * 0.34), (r - (r - l) * 0.34, r)):
                    m = (a + b) / 2
                    lines.append(f"M{a:.1f} {yy:.1f}Q{m:.1f} {yy + sag:.1f} {b:.1f} {yy + sag * 0.4:.1f}")

    return lines, dots


def main():
    manifest = {}
    for name, box in PHOTOS.items():
        img = Image.open(SRC / f"{name}.jpg").convert("RGB").crop(box)
        sizes = save(img, name, WIDTHS)
        manifest[name] = {"widths": list(sizes), "width": img.width, "height": img.height}

    outlines = {}
    for name, box in CUTOUTS.items():
        img, solid = cutout(SRC / f"{name}.jpg", box)
        # Trim to the garment with a small margin.
        ys, xs = np.nonzero(solid)
        m = 24
        l, t, r, b = max(xs.min() - m, 0), max(ys.min() - m, 0), min(xs.max() + m, img.width), min(ys.max() + m, img.height)
        img = img.crop((l, t, r, b))
        solid = solid[t:b, l:r]
        rgb_box = np.asarray(Image.open(SRC / f"{name}.jpg").convert("RGB").crop(box).crop((l, t, r, b)))
        sizes = save(img, name, CUT_WIDTHS)
        manifest[name] = {"widths": list(sizes), "width": img.width, "height": img.height}
        scale = 1.0
        flat = flat_lines(name, rgb_box, solid)
        outlines[name] = {
            "width": img.width,
            "height": img.height,
            "outline": trace(solid, scale),
            "lines": flat[0],
            "buttons": flat[1],
        }

    (ROOT / "src" / "data").mkdir(parents=True, exist_ok=True)
    ts = ["// Generated by scripts/export-images.py. Do not edit by hand.", ""]
    ts.append("export const OUTLINES = " + json.dumps(outlines, indent=2) + " as const")
    ts.append("")
    ts.append("export const SIZES = " + json.dumps(manifest, indent=2) + " as const")
    (ROOT / "src" / "data" / "generated.ts").write_text("\n".join(ts) + "\n")
    for k, v in manifest.items():
        print(k, v)
    for k, v in outlines.items():
        print(k, "outline chars", len(v["outline"]), "lines", len(v["lines"]), "buttons", len(v["buttons"]))


if __name__ == "__main__":
    main()
