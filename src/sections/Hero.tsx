import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import { LogoMark } from '../brand/Logo'
import { Picture } from '../components/Picture'
import { photo } from '../data/photos'
import { useFinePointer, useReducedMotion } from '../lib/hooks'
import { scrollToId } from '../lib/scroll'

const WINTER = photo('velvet-choker-gown')
const SUMMER = photo('ivory-chiffon')

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/**
 * Two seasons in one frame. Winter (velvet, on the velvet ground) and Summer 2026
 * (chiffon, on the studio stone) share the screen; a divider follows the mouse or the
 * finger, and the name changes colour as the divider crosses it, because each half
 * carries its own copy of the name, clipped at the divider.
 */
export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const handleRef = useRef<HTMLButtonElement>(null)
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const split = useRef({ now: 100, goal: 100, touched: false })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '14%'])
  const wordY = useTransform(scrollYProgress, [0, 1], ['0%', '-60%'])
  const footOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0])

  // The divider eases towards its goal every frame; writing a CSS variable keeps React out of it.
  useEffect(() => {
    const el = ref.current!
    let raf = 0
    const tick = () => {
      const s = split.current
      s.now += (s.goal - s.now) * (reduce ? 1 : 0.085)
      if (Math.abs(s.goal - s.now) < 0.01) s.now = s.goal
      el.style.setProperty('--split', `${s.now}%`)
      handleRef.current?.setAttribute('aria-valuenow', String(Math.round(s.now)))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce])

  // Once the curtain is up, summer slides in beside winter.
  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(() => {
      if (!split.current.touched) split.current.goal = 50
    }, reduce ? 0 : 500)
    return () => clearTimeout(t)
  }, [ready, reduce])

  const setFromX = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect()
    split.current.touched = true
    split.current.goal = clamp(((clientX - r.left) / r.width) * 100, 8, 92)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' ? fine : e.buttons > 0 || e.pressure > 0) setFromX(e.clientX)
  }
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 20 : 5
    const s = split.current
    if (e.key === 'ArrowLeft') s.goal = clamp(s.goal - step, 0, 100)
    else if (e.key === 'ArrowRight') s.goal = clamp(s.goal + step, 0, 100)
    else if (e.key === 'Home') s.goal = 0
    else if (e.key === 'End') s.goal = 100
    else return
    s.touched = true
    e.preventDefault()
  }

  const side = (season: 'winter' | 'summer') => {
    const hidden = season === 'summer'
    return (
      <div className={`hero__side hero__side--${season}`} aria-hidden={hidden || undefined}>
        <motion.div className="hero__frame" style={{ y: photoY }}>
          <Picture
            photo={season === 'winter' ? WINTER : SUMMER}
            alt={season === 'winter' ? 'Winter: a long black off-shoulder gown with a separate choker' : 'Summer 2026: an ivory chiffon ruffle set with bell sleeves'}
            sizes="(min-width: 760px) 30vw, 100vw"
            eager
            reveal={false}
          />
        </motion.div>
        <motion.div className="hero__word" style={{ y: wordY }}>
          {hidden ? (
            <p className="hero__name" aria-hidden="true">
              <LogoMark />
            </p>
          ) : (
            <h1 className="hero__name">
              <LogoMark title="Saint Aslan" />
            </h1>
          )}
        </motion.div>
        <p className="hero__season">
          {season === 'winter' ? (
            <>
              Winter <em>in velvet</em>
            </>
          ) : (
            <>
              Summer <b>2026</b> <em>in chiffon &amp; satin</em>
            </>
          )}
        </p>
        <motion.div className="hero__foot" style={{ opacity: footOpacity }}>
          <p>Couture from Azerbaijan. In stock in Baku and Dubai.</p>
          <a
            className="link-cta"
            href="#stock"
            tabIndex={hidden ? -1 : undefined}
            onClick={(e) => {
              e.preventDefault()
              scrollToId('stock')
            }}
          >
            See what is in stock <span aria-hidden="true">→</span>
          </a>
        </motion.div>
      </div>
    )
  }

  return (
    <section
      id="top"
      ref={ref}
      className="hero"
      data-ground="velvet"
      data-ready={ready}
      onPointerMove={onPointerMove}
      onPointerDown={(e) => e.pointerType !== 'mouse' && setFromX(e.clientX)}
    >
      {side('winter')}
      {side('summer')}
      <div className="hero__divider" aria-hidden="false">
        <button
          ref={handleRef}
          type="button"
          className="hero__handle"
          role="slider"
          aria-label="Winter or summer: move to compare the two seasons"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext="Share of the screen given to winter"
          onKeyDown={onKey}
        >
          <span aria-hidden="true">‹</span>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  )
}
