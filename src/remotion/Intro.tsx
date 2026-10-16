import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { LOGO_GLYPHS, LOGO_RED, LOGO_VIEWBOX } from '../brand/logo-paths'
import { DISC_FROM, DISC_TO, NAME_FROM, NAME_LETTER, NAME_STAGGER, ROUTE_FROM, ROUTE_TO } from './timing'

export type IntroProps = {
  /** Ground behind the logo; null keeps it transparent (the site paints the curtain). */
  background: string | null
  /** Colour of the route and the city names. */
  ink: string
  /** Diameter of the disc as a share of the shorter side. */
  scale: number
}

export const BRAND = { velvet: '#0E0D0C', taupe: '#B9AD9E', ivory: '#F2EEE7', red: LOGO_RED }

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const outExpo = Easing.bezier(0.16, 1, 0.3, 1)
const inOut = Easing.bezier(0.77, 0, 0.175, 1)

// The name spans this share of the disc's diameter, as in the logo file.
const NAME_SPAN = 0.786

export function SaintAslanIntro({ background, ink, scale }: IntroProps) {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const D = Math.min(width, height) * scale

  // The disc opens from its centre, fast then settling, like ink spreading on paper.
  const disc = interpolate(frame, [DISC_FROM, DISC_TO], [0, 1], { ...clamp, easing: outExpo })
  const route = interpolate(frame, [ROUTE_FROM, ROUTE_TO], [0, 1], { ...clamp, easing: inOut })
  const cities = interpolate(frame, [ROUTE_FROM + 24, ROUTE_TO + 14], [0, 1], { ...clamp, easing: outExpo })
  const [, , , vh] = LOGO_VIEWBOX.split(' ').map(Number)

  const routeW = D * 1.05
  const type = Math.max(12, D * 0.032)

  return (
    <AbsoluteFill style={{ background: background ?? 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      {/* Lifted a little, so disc and route together sit in the optical centre. */}
      <div style={{ position: 'relative', width: D, height: D, marginTop: -D * 0.16 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: LOGO_RED,
            transform: `scale(${disc})`,
          }}
        />
        <svg
          viewBox={LOGO_VIEWBOX}
          style={{ position: 'absolute', left: '50%', top: '50%', width: D * NAME_SPAN, transform: 'translate(-50%, -50%)', overflow: 'hidden' }}
        >
          {LOGO_GLYPHS.map((d, i) => {
            const start = NAME_FROM + i * NAME_STAGGER
            const y = interpolate(frame, [start, start + NAME_LETTER], [vh * 1.25, 0], { ...clamp, easing: outExpo })
            return <path key={i} d={d} fill={BRAND.velvet} transform={`translate(0 ${y})`} />
          })}
        </svg>

        {/* The route between the two boutiques, drawn under the disc. */}
        <div style={{ position: 'absolute', left: '50%', top: D + D * 0.12, width: routeW, marginLeft: -routeW / 2 }}>
          <div style={{ height: Math.max(1, D * 0.0025), background: ink, opacity: 0.55, transform: `scaleX(${route})` }} />
          {(['BAKU', 'DUBAI'] as const).map((name, k) => (
            <div
              key={name}
              style={{
                position: 'absolute',
                top: 0,
                [k === 0 ? 'left' : 'right']: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: k === 0 ? 'flex-start' : 'flex-end',
                gap: type * 0.9,
              }}
            >
              <div
                style={{
                  width: type * 0.55,
                  height: type * 0.55,
                  marginTop: -type * 0.275,
                  borderRadius: '50%',
                  background: LOGO_RED,
                  transform: `translateX(${k === 0 ? '-50%' : '50%'}) scale(${cities})`,
                }}
              />
              <div
                style={{
                  fontFamily: '"Montserrat Variable", Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: type,
                  letterSpacing: '0.34em',
                  marginRight: k === 1 ? '-0.34em' : 0,
                  color: ink,
                  opacity: cities,
                  transform: `translateY(${(1 - cities) * 50}%)`,
                }}
              >
                {name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}
