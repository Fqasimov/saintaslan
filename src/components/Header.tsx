import { useEffect, useRef, useState } from 'react'
import { useCity } from '../lib/city'
import { CITIES, CITY_IDS, instagramUrl } from '../lib/contact'
import { useClock } from '../lib/hooks'
import { lockScroll, scrollToId } from '../lib/scroll'
import { Wordmark } from '../brand/Wordmark'

export const NAV = [
  { id: 'winter', label: 'Winter' },
  { id: 'summer', label: 'Summer 2026' },
  { id: 'stock', label: 'In stock' },
  { id: 'house', label: 'The house' },
  { id: 'contact', label: 'Contact' },
]

export function CitySwitch({ className = '' }: { className?: string }) {
  const { city, setCity } = useCity()
  return (
    <div className={`city-switch ${className}`} role="group" aria-label="Boutique">
      {CITY_IDS.map((id) => (
        <button key={id} type="button" aria-pressed={city === id} onClick={() => setCity(id)}>
          {CITIES[id].name}
        </button>
      ))}
      <span className="city-switch__bar" data-at={city} aria-hidden="true" />
    </div>
  )
}

function go(e: React.MouseEvent, id: string, after?: () => void) {
  e.preventDefault()
  after?.()
  // Let the menu begin to close before the page moves.
  window.setTimeout(() => scrollToId(id), after ? 220 : 0)
}

export function Header() {
  const [hidden, setHidden] = useState(false)
  const [top, setTop] = useState(true)
  const [open, setOpen] = useState(false)
  const { city } = useCity()
  const time = useClock(CITIES[city].zone)
  const last = useRef(0)

  // Out of the way while reading down, back as soon as the visitor scrolls up.
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        setTop(y < 24)
        const delta = y - last.current
        if (Math.abs(delta) > 6) setHidden(delta > 0 && y > window.innerHeight * 0.6)
        last.current = y
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className="header" data-hidden={hidden && !open} data-top={top} data-menu={open}>
        <a className="header__mark" href="#top" onClick={(e) => go(e, 'top')} aria-label="Saint Aslan, back to top">
          <Wordmark />
        </a>
        <nav className="header__nav" aria-label="Main">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => go(e, n.id)}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="header__end">
          <span className="header__time" aria-label={`${CITIES[city].name} time ${time}`}>
            {time} <span>GMT+4</span>
          </span>
          <CitySwitch />
          <button
            type="button"
            className="header__menu"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span className="header__burger" data-open={open} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div id="menu" className="menu" data-open={open} aria-hidden={!open} inert={!open}>
        <nav aria-label="Menu">
          {NAV.map((n, i) => (
            <a key={n.id} href={`#${n.id}`} style={{ ['--i' as string]: i }} onClick={(e) => go(e, n.id, () => setOpen(false))}>
              <span className="menu__num">0{i + 1}</span>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="menu__foot">
          <CitySwitch className="city-switch--menu" />
          <a href={instagramUrl} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </>
  )
}
