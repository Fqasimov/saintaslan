"""
Builds the small font used for the outlined city names in the stock section.

Montserrat (like most variable fonts) draws letters such as B, K and A from overlapping
pieces. An outline (-webkit-text-stroke) traces every piece, so the overlaps show as
seams inside the letters. This takes Montserrat at the weight the site uses, merges the
overlapping pieces of each letter into one shape, and keeps only the letters needed.

Run: python3 scripts/make-outline-font.py   (needs fonttools, brotli, skia-pathops)
"""

from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.ttLib.removeOverlaps import removeOverlaps
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2"
OUT = ROOT / "src/fonts/montserrat-cities-560.woff2"

# Letters of BAKU and DUBAI, in both cases in case the copy changes.
TEXT = "BAKUDIbakudi"

font = TTFont(SRC)
font = instantiateVariableFont(font, {"wght": 560})
removeOverlaps(font)
opts = Options()
opts.flavor = "woff2"
opts.layout_features = ["kern"]
sub = Subsetter(opts)
sub.populate(text=TEXT)
sub.subset(font)
font.flavor = "woff2"
OUT.parent.mkdir(parents=True, exist_ok=True)
font.save(OUT)
print(OUT, OUT.stat().st_size, "bytes")
