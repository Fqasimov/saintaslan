import Lenis from 'lenis'

/**
 * One smooth-scroll instance for the whole page. Off with reduced motion and on
 * touch screens, where the native scroll already has the right physics.
 */
let lenis: Lenis | null = null

export function startSmoothScroll() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarse = window.matchMedia('(pointer: coarse)').matches
  if (reduce || coarse || lenis) return () => {}
  lenis = new Lenis({ lerp: 0.17, wheelMultiplier: 1 })
  let raf = 0
  const tick = (t: number) => {
    lenis?.raf(t)
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => {
    cancelAnimationFrame(raf)
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

export function lockScroll(locked: boolean) {
  if (lenis) (locked ? lenis.stop() : lenis.start())
  document.documentElement.classList.toggle('is-locked', locked)
}
