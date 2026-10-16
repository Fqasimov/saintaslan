import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion'
import { LOGO_GLYPH_BOXES, LOGO_GLYPHS, LOGO_RED, LOGO_VIEWBOX } from '../brand/logo-paths'
import grain from './grain.png'
import { T } from './timing'

export type IntroProps = {
  /** Ground behind the logo; null keeps it transparent (the site paints the curtain). */
  background: string | null
  /** Colour of the letters before the dye reaches them, the route and the city names. */
  ink: string
  /** Diameter of the disc as a share of the shorter side. */
  scale: number
  /** 1 = the master film; the site plays it faster. */
  speed: number
  /** Film grain over the whole frame. */
  grain: boolean
}

export const BRAND = { velvet: '#0E0D0C', taupe: '#B9AD9E', ivory: '#F2EEE7', red: LOGO_RED }

const DYE_DEEP = '#7E211B'
const VELVET = BRAND.velvet

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const outExpo = Easing.bezier(0.16, 1, 0.3, 1)
const outQuint = Easing.bezier(0.22, 1, 0.36, 1)
const inOut = Easing.bezier(0.65, 0, 0.35, 1)
const settle = Easing.bezier(0.33, 0, 0.12, 1)

const [VB_X, VB_Y, VB_W, VB_H] = LOGO_VIEWBOX.split(' ').map(Number)
// The name spans this share of the disc's diameter, as in the logo file.
const NAME_SPAN = 0.786
// How far apart the letters start, as a multiple of their final spacing.
const SPREAD = 2.15

// Letters land from the centre outwards.
const ORDER = (() => {
  const centre = VB_X + VB_W / 2
  const dist = LOGO_GLYPH_BOXES.map(([x, , w], i) => ({ i, d: Math.abs(x + w / 2 - centre) }))
  const rank: number[] = []
  dist.sort((a, b) => a.d - b.d).forEach(({ i }, r) => (rank[i] = r))
  return rank
})()

/**
 * A wavy liquid surface at height `level`: the filled body down to `bottom`, and the
 * crest alone (for the meniscus line).
 */
function wave(left: number, right: number, level: number, bottom: number, amp: number, phase: number, k: number) {
  const step = (right - left) / 72
  const pts: string[] = []
  for (let x = left; x <= right + 0.5; x += step) {
    const y = level + amp * Math.sin(x * k + phase) + amp * 0.35 * Math.sin(x * k * 2.3 - phase * 1.7)
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return {
    body: `M${left} ${bottom}L${pts.join('L')}L${right} ${bottom}Z`,
    crest: `M${pts.join('L')}`,
  }
}

/**
 * The Saint Aslan logo film.
 *
 * 1. A red thread runs in from the left like a seam being sewn and wraps into a circle.
 * 2. Red dye rises inside the circle; its surface moves like liquid.
 * 3. The letters of the name (traced from the logo file) glide in from wide spacing,
 *    taupe on the velvet; wherever the dye reaches them they turn black.
 * 4. The camera, turned at the start, settles face-on; light runs over the disc.
 * 5. Beneath it a line draws out to Baku on one side and Dubai on the other.
 */
export function SaintAslanIntro({ background, ink, scale, speed, grain: withGrain }: IntroProps) {
  const frame = useCurrentFrame() * speed
  const { width: W, height: H } = useVideoConfig()

  const D = Math.min(W, H) * scale
  const R = D / 2
  const cx = W / 2
  const cy = H / 2 - D * 0.1

  // ---- 1. The thread -------------------------------------------------------------
  const sx = -W * 0.04
  const straight = cx - sx
  const loop = 2 * Math.PI * R
  const total = straight + loop
  const head = interpolate(frame, [T.threadFrom, T.threadTo], [0, total], { ...clamp, easing: Easing.bezier(0.4, 0.08, 0.22, 1) })
  const tail = interpolate(frame, [T.tailFrom, T.tailTo], [0, straight], { ...clamp, easing: inOut })
  const threadPath = `M${sx} ${cy + R}L${cx} ${cy + R}A${R} ${R} 0 0 0 ${cx} ${cy - R}A${R} ${R} 0 0 0 ${cx} ${cy + R}`
  const at = (s: number) => {
    if (s <= straight) return { x: sx + s, y: cy + R }
    const a = (s - straight) / R
    return { x: cx + R * Math.sin(a), y: cy + R * Math.cos(a) }
  }
  const needle = at(head)
  const needleAlpha = interpolate(frame, [T.threadFrom, T.threadFrom + 10, T.threadTo - 14, T.threadTo + 4], [0, 1, 1, 0], clamp)
  const ring = interpolate(frame, [T.ringFrom, T.ringTo], [1, 0], clamp)
  const threadW = Math.max(1.2, D * 0.0042)

  // ---- 2. The dye ----------------------------------------------------------------
  const dye = interpolate(frame, [T.dyeFrom, T.dyeTo], [0, 1], { ...clamp, easing: Easing.bezier(0.42, 0, 0.18, 1) })
  const amp = D * 0.03 * (1 - dye) + D * 0.004
  const phase = frame * 0.085
  const k = (2 * Math.PI) / (D * 0.62)
  const level = interpolate(dye, [0, 1], [cy + R + amp * 2, cy - R - amp * 3])
  const deep = wave(cx - R - 4, cx + R + 4, level - D * 0.035 * (1 - dye), cy + R + 4, amp * 1.15, phase * 0.8 + 2.1, k * 0.85)
  const { body: surface, crest } = wave(cx - R - 4, cx + R + 4, level, cy + R + 4, amp, phase, k)
  const crestAlpha = interpolate(dye, [0, 0.08, 0.85, 1], [0, 0.9, 0.9, 0], clamp)

  // ---- 3. The letters ------------------------------------------------------------
  const NW = D * NAME_SPAN
  const ks = NW / VB_W
  const left = cx - NW / 2
  const top = cy - (VB_H * ks) / 2
  const letters = LOGO_GLYPHS.map((d, i) => {
    const [gx, , gw] = LOGO_GLYPH_BOXES[i]
    const finalX = left + (gx + gw / 2 - VB_X) * ks
    const start = T.lettersFrom + ORDER[i] * T.letterStagger
    const p = interpolate(frame, [start, start + T.letterDur], [0, 1], { ...clamp, easing: outQuint })
    const dx = (finalX - cx) * (SPREAD - 1) * (1 - p)
    const dy = (1 - p) * D * 0.018
    const opacity = interpolate(p, [0, 0.4], [0, 1], clamp)
    const blur = (1 - p) * D * 0.01
    return { d, dx, dy, opacity, blur }
  })
  const glyphs = (fill: string) =>
    letters.map(({ d, dx, dy, opacity, blur }, i) => (
      <g key={i} opacity={opacity} style={{ filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
        <path d={d} fill={fill} transform={`translate(${left - VB_X * ks + dx} ${top - VB_Y * ks + dy}) scale(${ks})`} />
      </g>
    ))

  // ---- 4. Camera and light ---------------------------------------------------------
  const cam = interpolate(frame, [0, T.settleTo], [1, 0], { ...clamp, easing: settle })
  const sheen = interpolate(frame, [T.sheenFrom, T.sheenTo], [-1.5, 1.5], { ...clamp, easing: inOut })
  const sheenAlpha = interpolate(frame, [T.sheenFrom, T.sheenFrom + 14, T.sheenTo - 14, T.sheenTo], [0, 1, 1, 0], clamp)
  // A slow light drifts across the velvet, the way a spot finds its mark.
  const lightX = interpolate(frame, [0, T.settleTo + 60], [30, 50], { ...clamp, easing: settle })
  const lightY = interpolate(frame, [0, T.settleTo + 60], [62, (cy / H) * 100], { ...clamp, easing: settle })
  // The end frame still breathes: a camera move too slow to notice, except that it is alive.
  const drift = interpolate(frame, [T.citiesTo, T.citiesTo + 240], [1, 1.018], { ...clamp, easing: Easing.inOut(Easing.sin) })

  // ---- 5. The route ---------------------------------------------------------------
  const route = interpolate(frame, [T.routeFrom, T.routeTo], [0, 1], { ...clamp, easing: inOut })
  const cities = interpolate(frame, [T.citiesFrom, T.citiesTo], [0, 1], { ...clamp, easing: outExpo })
  const routeY = cy + R + D * 0.17
  const routeHalf = D * 0.56
  const type = Math.max(11, D * 0.03)

  const grainShift = random(`grain-${Math.floor(frame / 2)}`)

  return (
    <AbsoluteFill
      style={{
        background:
          background === null
            ? 'transparent'
            : `radial-gradient(ellipse 62% 58% at ${lightX}% ${lightY}%, #211e1a 0%, ${background} 60%, #040303 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          perspective: Math.max(W, H) * 1.6,
          perspectiveOrigin: `50% ${(cy / H) * 100}%`,
        }}
      >
        <AbsoluteFill
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: `rotateY(${-26 * cam}deg) rotateX(${11 * cam}deg) rotateZ(${-3 * cam}deg) scale(${(1 + 0.07 * cam) * drift})`,
          }}
        >
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
            <defs>
              <clipPath id="sa-disc">
                <circle cx={cx} cy={cy} r={R} />
              </clipPath>
              <clipPath id="sa-dye">
                <path d={surface} />
              </clipPath>
              <radialGradient id="sa-needle">
                <stop offset="0" stopColor="#FFF4EC" stopOpacity="1" />
                <stop offset="0.35" stopColor="#FFB7A8" stopOpacity="0.55" />
                <stop offset="1" stopColor={LOGO_RED} stopOpacity="0" />
              </radialGradient>
              {/* The faintest falloff of light across a flat, printed disc. */}
              <linearGradient id="sa-light" x1="0.15" y1="0" x2="0.85" y2="1">
                <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.05" />
                <stop offset="1" stopColor="#000000" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="sa-sheen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="0.5" stopColor="#FFE9DE" stopOpacity="0.2" />
                <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
              <mask id="sa-outside" maskUnits="userSpaceOnUse" x={-W} y={-H} width={W * 3} height={H * 3}>
                <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="#fff" />
                <g clipPath="url(#sa-disc)">
                  <path d={surface} fill="#000" />
                </g>
              </mask>
            </defs>

            {/* The dye: a deeper layer behind a brighter surface. */}
            <g clipPath="url(#sa-disc)">
              <path d={deep.body} fill={DYE_DEEP} />
              <path d={surface} fill={LOGO_RED} />
              <path d={crest} fill="none" stroke="#E46A5C" strokeWidth={Math.max(1, D * 0.0028)} opacity={crestAlpha} />
              <circle cx={cx} cy={cy} r={R} fill="url(#sa-light)" opacity={dye} />
              <g style={{ mixBlendMode: 'screen' }} opacity={sheenAlpha}>
                <rect
                  x={cx - R * 0.8 + sheen * R}
                  y={cy - R * 1.6}
                  width={R * 1.6}
                  height={R * 3.2}
                  fill="url(#sa-sheen)"
                  transform={`rotate(24 ${cx + sheen * R} ${cy})`}
                />
              </g>
            </g>

            {/* The thread. */}
            <path
              d={threadPath}
              fill="none"
              stroke={LOGO_RED}
              strokeWidth={threadW}
              strokeLinecap="round"
              strokeDasharray={`${Math.max(0, head - tail)} ${total * 2}`}
              strokeDashoffset={-tail}
              opacity={ring}
            />
            <circle cx={needle.x} cy={needle.y} r={D * 0.028} fill="url(#sa-needle)" opacity={needleAlpha} />

            {/* The name: taupe on the velvet, black wherever the dye has reached. */}
            <g mask="url(#sa-outside)">{glyphs(ink)}</g>
            <g clipPath="url(#sa-disc)">
              <g clipPath="url(#sa-dye)">{glyphs(VELVET)}</g>
            </g>

            {/* The route between the two boutiques. */}
            <g opacity={route > 0 ? 1 : 0}>
              <line x1={cx - routeHalf * route} x2={cx + routeHalf * route} y1={routeY} y2={routeY} stroke={ink} strokeOpacity={0.55} strokeWidth={Math.max(1, D * 0.0022)} />
              {[-1, 1].map((side) => (
                <circle key={side} cx={cx + side * routeHalf} cy={routeY} r={type * 0.26 * cities} fill={LOGO_RED} />
              ))}
            </g>
          </svg>

          {(['BAKU', 'DUBAI'] as const).map((name, i) => (
            <div
              key={name}
              style={{
                position: 'absolute',
                top: routeY + type * 0.9,
                left: i === 0 ? cx - routeHalf : undefined,
                right: i === 1 ? W - (cx + routeHalf) : undefined,
                fontFamily: '"Montserrat Variable", Montserrat, sans-serif',
                fontWeight: 500,
                fontSize: type,
                letterSpacing: `${0.34 + (1 - cities) * 0.3}em`,
                marginRight: i === 1 ? `-${0.34 + (1 - cities) * 0.3}em` : 0,
                color: ink,
                opacity: cities,
                transform: `translateY(${(1 - cities) * 60}%)`,
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </div>
          ))}
        </AbsoluteFill>
      </AbsoluteFill>

      {withGrain && (
        <AbsoluteFill
          style={{
            backgroundImage: `url(${grain})`,
            backgroundSize: '256px 256px',
            backgroundPosition: `${Math.round(grainShift * 256)}px ${Math.round(random(`g2-${Math.floor(frame / 2)}`) * 256)}px`,
            mixBlendMode: 'overlay',
            opacity: 0.07,
            pointerEvents: 'none',
          }}
        />
      )}
    </AbsoluteFill>
  )
}
