import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { NAME_FROM, NAME_LETTER, NAME_STAGGER, ROUTE_FROM, ROUTE_TO, THREAD_FROM, THREAD_TO, TRACK_TO } from './timing'

export type IntroProps = {
  /** Ground behind the lockup; null keeps it transparent (the site paints the curtain). */
  background: string | null
  ink: string
  accent: string
  /** Width of the name as a share of the composition width. */
  scale: number
}

export const BRAND = { velvet: '#0E0D0C', taupe: '#B9AD9E', ivory: '#F2EEE7', oxblood: '#8C1D1F' }

const WORDS = ['SAINT', 'ASLAN']
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const
const outExpo = Easing.bezier(0.16, 1, 0.3, 1)
const inOut = Easing.bezier(0.77, 0, 0.175, 1)

export function SaintAslanIntro({ background, ink, accent, scale }: IntroProps) {
  const frame = useCurrentFrame()
  const { width } = useVideoConfig()
  const size = (width * scale) / 9.2

  const thread = interpolate(frame, [THREAD_FROM, THREAD_TO], [0, 1], { ...clamp, easing: inOut })
  // Wide tracking settles in, the way the house sets its name on the campaign cover.
  const tracking = interpolate(frame, [NAME_FROM, TRACK_TO], [0.62, 0.2], { ...clamp, easing: outExpo })
  const route = interpolate(frame, [ROUTE_FROM, ROUTE_TO], [0, 1], { ...clamp, easing: outExpo })
  const cities = interpolate(frame, [ROUTE_FROM + 14, ROUTE_TO + 10], [0, 1], { ...clamp, easing: outExpo })

  let i = 0
  const lineW = width * scale * 0.82

  return (
    <AbsoluteFill style={{ background: background ?? 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.62 }}>
        <div
          style={{
            display: 'flex',
            gap: `${0.55 + tracking}em`,
            fontFamily: '"Montserrat Variable", Montserrat, sans-serif',
            fontWeight: 560,
            fontSize: size,
            letterSpacing: `${tracking}em`,
            marginRight: `-${tracking}em`,
            color: ink,
            lineHeight: 1,
          }}
        >
          {WORDS.map((word) => (
            <span key={word} style={{ display: 'flex', overflow: 'hidden', padding: '0.12em 0' }}>
              {word.split('').map((letter, k) => {
                const start = NAME_FROM + i++ * NAME_STAGGER
                const y = interpolate(frame, [start, start + NAME_LETTER], [110, 0], { ...clamp, easing: outExpo })
                return (
                  <span key={k} style={{ display: 'inline-block', transform: `translateY(${y}%)` }}>
                    {letter}
                  </span>
                )
              })}
            </span>
          ))}
        </div>

        {/* The thread, which turns into the route between the two boutiques. */}
        <div style={{ position: 'relative', width: lineW, height: size * 0.9 }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: size * 0.2,
              height: Math.max(1, size * 0.018),
              background: ink,
              opacity: 0.55,
              transform: `scaleX(${thread})`,
            }}
          />
          {(['BAKU', 'DUBAI'] as const).map((name, k) => (
            <div
              key={name}
              style={{
                position: 'absolute',
                top: size * 0.2,
                [k === 0 ? 'left' : 'right']: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: k === 0 ? 'flex-start' : 'flex-end',
                gap: size * 0.2,
                transform: `translateY(-50%)`,
              }}
            >
              <div
                style={{
                  width: size * 0.16,
                  height: size * 0.16,
                  borderRadius: '50%',
                  background: accent,
                  transform: `translate(${k === 0 ? '-50%' : '50%'}, ${size * 0.08}px) scale(${route})`,
                }}
              />
              <div
                style={{
                  fontFamily: '"Montserrat Variable", Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: size * 0.22,
                  letterSpacing: '0.34em',
                  color: ink,
                  opacity: cities,
                  transform: `translateY(${(1 - cities) * 40}%)`,
                  marginRight: k === 1 ? '-0.34em' : 0,
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
