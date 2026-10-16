import { useEffect, useState } from 'react'

/**
 * Dyes the page in the ground of whichever section crosses the middle of the screen.
 * The colours live in CSS under html[data-ground].
 */
export function useGround() {
  useEffect(() => {
    const root = document.documentElement
    const meta = document.querySelector('meta[name="theme-color"]')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          root.dataset.ground = (e.target as HTMLElement).dataset.ground
          meta?.setAttribute('content', getComputedStyle(root).getPropertyValue('--ground').trim())
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    document.querySelectorAll('main [data-ground], footer[data-ground]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/** Adds .is-in to .reveal elements the first time they come into view. */
export function useReveal(active: boolean) {
  useEffect(() => {
    if (!active) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    const observe = () => document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => io.observe(el))
    observe()
    // Cards added later (stock filter) reveal too.
    const mo = new MutationObserver(observe)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [active])
}

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')
export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)')

/** "18:42" in the given zone, ticking each minute. */
export function useClock(zone: string) {
  const fmt = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: zone }).format(new Date())
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    let id = 0
    const schedule = () => {
      const ms = 60000 - (Date.now() % 60000) + 50
      id = window.setTimeout(() => {
        setTime(fmt())
        schedule()
      }, ms)
    }
    schedule()
    return () => clearTimeout(id)
    // fmt only depends on zone
  }, [zone])
  return time
}
