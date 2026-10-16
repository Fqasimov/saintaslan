import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { Letters } from '../components/Letters'
import { Picture } from '../components/Picture'
import { StockNote } from '../components/StockNote'
import { byId } from '../data/pieces'
import { useMedia, useReducedMotion } from '../lib/hooks'

const COVER = byId('halter-peplum')
const LOOKS = ['ocean-set', 'ivory-set', 'polka', 'floral', 'noir-wrap', 'royal-satin'].map(byId)

// The dots of the polka gown, scattered over the opening of the season. Positions are
// fixed (not random per visit) so the composition is designed, not accidental.
const DOTS = [
  [6, 18, 2.4], [14, 62, 1.6], [22, 34, 3.2], [31, 80, 2], [38, 12, 1.4], [47, 56, 2.8],
  [55, 24, 1.8], [62, 74, 3.4], [70, 40, 1.5], [77, 9, 2.6], [84, 66, 2], [91, 28, 3],
  [96, 84, 1.6], [10, 90, 2.2], [43, 92, 1.8], [67, 94, 2.4], [88, 48, 1.4], [27, 6, 2],
] as const

function Dot({ x, y, size, i, progress }: { x: number; y: number; size: number; i: number; progress: MotionValue<number> }) {
  // Each dot appears on its own beat as the season scrolls in, then leaves on another.
  const a = 0.04 + ((i * 7) % 18) * 0.012
  const b = 0.52 + ((i * 5) % 18) * 0.014
  const scale = useTransform(progress, [a, a + 0.1, b, b + 0.1], [0, 1, 1, 0])
  const drift = useTransform(progress, [0, 1], [0, -(size * 22)])
  return (
    <motion.span
      className="dot"
      aria-hidden="true"
      style={{ left: `${x}%`, top: `${y}%`, width: `${size}vmin`, height: `${size}vmin`, scale, y: drift }}
    />
  )
}

export function Summer() {
  const headRef = useRef<HTMLElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const wide = useMedia('(min-width: 900px)')
  const reduce = useReducedMotion()
  const [distance, setDistance] = useState(0)

  const { scrollYProgress: headProgress } = useScroll({ target: headRef, offset: ['start end', 'end start'] })
  const { scrollYProgress: railProgress } = useScroll({ target: railRef, offset: ['start start', 'end end'] })
  const x = useTransform(railProgress, [0, 1], [0, -distance])
  const bar = useTransform(railProgress, [0, 1], [0, 1])

  // Cards slide in sideways, which the page's viewport observer does not always see,
  // so the rail unveils its own photographs as each one crosses into the screen.
  const unveil = () => {
    // Measure after motion has written this frame's transform.
    requestAnimationFrame(() => {
      trackRef.current?.querySelectorAll('.picture.reveal:not(.is-in)').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.left < window.innerWidth * 0.94 && r.right > 0 && r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in')
      })
    })
  }
  useMotionValueEvent(x, 'change', unveil)
  useMotionValueEvent(railProgress, 'change', unveil)

  // How far the track must travel so its last card ends at the right edge.
  useLayoutEffect(() => {
    const measure = () => {
      const t = trackRef.current
      if (!t) return
      setDistance(Math.max(0, t.scrollWidth - window.innerWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [wide])

  const pinned = wide && !reduce

  return (
    <section id="summer" className="summer" aria-labelledby="summer-title">
      <header ref={headRef} className="season-head season-head--summer" data-ground="stone">
        <div className="dots" aria-hidden="true">
          {!reduce && DOTS.map(([dx, dy, s], i) => <Dot key={i} x={dx} y={dy} size={s} i={i} progress={headProgress} />)}
        </div>
        <p className="season-head__index" aria-hidden="true">
          02
        </p>
        <Letters text="Summer" className="season-head__title" />
        <p className="season-head__year reveal" aria-hidden="true">
          2026
        </p>
        <div className="season-head__copy reveal">
          <p className="season-head__lede" id="summer-title">
            <em>Chiffon, satin and a polka dot.</em>
          </p>
          <p>
            Ruffles that lift with the wind, satin that pours to the floor, a dotted gown with sleeves set high on the
            shoulder. Cut for warm evenings in Baku and long ones in Dubai.
          </p>
        </div>
      </header>

      <div className="cover" data-ground="stone">
        <Picture photo={COVER.photo} alt={`The Summer 2026 campaign cover: ${COVER.name.toLowerCase()}, ${COVER.detail.toLowerCase()}`} sizes="(min-width: 900px) 46vw, 100vw" className="cover__img" />
        <div className="cover__text reveal">
          <p className="worn__kicker">The campaign</p>
          <h3 className="piece-name piece-name--large">{COVER.name}</h3>
          <p className="label">{COVER.detail}</p>
          <StockNote piece={COVER} />
        </div>
      </div>

      <div ref={railRef} className="rail" data-ground="stone" data-pinned={pinned} style={pinned ? { height: `calc(100vh + ${distance}px)` } : undefined}>
        <div className="rail__sticky">
          <motion.ul ref={trackRef} className="rail__track" role="list" style={pinned ? { x } : undefined} onScroll={unveil}>
            <li className="rail__intro">
              <p className="worn__kicker">The looks</p>
              <p className="rail__lede">
                <em>Six ways to wear the heat.</em>
              </p>
              <p className="rail__hint" aria-hidden="true">
                {pinned ? 'Keep scrolling' : 'Swipe'} <span>→</span>
              </p>
            </li>
            {LOOKS.map((look, i) => (
              <li key={look.id} className={`rail__card rail__card--${i % 2 ? 'low' : 'high'}`}>
                <div className={`rail__media ${look.alt ? 'rail__media--swap' : ''}`}>
                  <Picture photo={look.photo} alt={`${look.name}: ${look.detail.toLowerCase()}`} sizes="(min-width: 900px) 30vw, 78vw" />
                  {look.alt && <Picture photo={look.alt} alt="" sizes="(min-width: 900px) 30vw, 78vw" className="rail__alt" reveal={false} />}
                </div>
                <div className="piece-caption">
                  <p className="rail__num" aria-hidden="true">
                    0{i + 1}
                  </p>
                  <h3 className="piece-name">{look.name}</h3>
                  <p className="label">{look.detail}</p>
                  {look.note && (
                    <blockquote className="rail__note">
                      <p>“{look.note}”</p>
                    </blockquote>
                  )}
                  <StockNote piece={look} />
                </div>
              </li>
            ))}
          </motion.ul>
          {pinned && (
            <div className="rail__progress" aria-hidden="true">
              <motion.span style={{ scaleX: bar }} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
