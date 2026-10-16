import { AnimatePresence, motion } from 'motion/react'
import { lazy, Suspense, useState } from 'react'
import { LOGO_RED } from '../brand/Logo'
import { Letters } from '../components/Letters'
import { src, srcSet } from '../data/photos'
import { PIECES, type Piece, type Season } from '../data/pieces'
import { useCity } from '../lib/city'
import { CITIES, CITY_IDS, whatsappUrl, type CityId } from '../lib/contact'
import { useClock, useReducedMotion } from '../lib/hooks'

// The globe and its 4,000 land dots load only when the stock is near.
const Globe = lazy(() => import('../components/Globe').then((m) => ({ default: m.Globe })))

type Filter = 'all' | Season
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'winter', label: 'Winter' },
  { id: 'summer', label: 'Summer 2026' },
]

const EASE = [0.23, 1, 0.32, 1] as const

function CityButton({ id, active, count, onPick }: { id: CityId; active: boolean; count: number; onPick: () => void }) {
  const c = CITIES[id]
  const time = useClock(c.zone)
  return (
    <button type="button" className="stock__city" aria-pressed={active} onClick={onPick}>
      <span className="stock__city-name">{c.name}</span>
      <span className="stock__city-meta">
        <span>{c.country}</span>
        <span>{time}</span>
        <span>
          {count} {count === 1 ? 'piece' : 'pieces'}
        </span>
      </span>
    </button>
  )
}

function reserveMessage(piece: Piece, city: CityId) {
  return `Hello Saint Aslan ${CITIES[city].name}, I would like to reserve the ${piece.name}. Which sizes do you have in the boutique?`
}

function Card({ piece, city }: { piece: Piece; city: CityId }) {
  const elsewhere = piece.stock.filter((c) => c !== city)
  return (
    <article className={`stock-card ${piece.cutout ? 'stock-card--cutout' : ''}`}>
      <div className="stock-card__media">
        <img
          src={src(piece.photo)}
          srcSet={srcSet(piece.photo)}
          sizes="(min-width: 1100px) 22vw, (min-width: 640px) 44vw, 90vw"
          width={piece.photo.width}
          height={piece.photo.height}
          alt={`${piece.name}: ${piece.detail.toLowerCase()}`}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <span className="stock-card__season">{piece.season === 'winter' ? 'Winter' : 'Summer 2026'}</span>
      </div>
      <div className="stock-card__body">
        <h3 className="piece-name">{piece.name}</h3>
        <p className="label">{piece.detail}</p>
        {elsewhere.length > 0 && <p className="stock-card__also">Also in {elsewhere.map((c) => CITIES[c].name).join(', ')}</p>}
        <a className="button button--line" href={whatsappUrl(city, reserveMessage(piece, city))} target="_blank" rel="noreferrer">
          Reserve in {CITIES[city].name}
        </a>
      </div>
    </article>
  )
}

export function Stock() {
  const { city, setCity } = useCity()
  const [filter, setFilter] = useState<Filter>('all')
  const reduce = useReducedMotion()

  const inCity = PIECES.filter((p) => p.stock.includes(city))
  const shown = inCity.filter((p) => filter === 'all' || p.season === filter)
  const c = CITIES[city]

  return (
    <section id="stock" className="stock" data-ground="ivory" aria-labelledby="stock-title">
      <header className="season-head season-head--stock">
        <p className="season-head__index" aria-hidden="true">
          03
        </p>
        <Letters text="In stock" className="season-head__title" />
        <div className="season-head__copy reveal">
          <p className="season-head__lede" id="stock-title">
            <em>Two boutiques, one hour.</em>
          </p>
          <p>
            Baku and Dubai both keep GMT+4, so the two clocks always agree. Pick a boutique to see what is on its rail,
            then reserve your piece over WhatsApp.
          </p>
        </div>
      </header>

      <div className="stock__picker">
        <div className="stock__cities" role="group" aria-label="Choose a boutique">
          {CITY_IDS.map((id) => (
            <CityButton key={id} id={id} active={city === id} count={PIECES.filter((p) => p.stock.includes(id)).length} onPick={() => setCity(id)} />
          ))}
        </div>
        <div className="stock__globe">
          <Suspense fallback={<div className="globe" />}>
            <Globe city={city} ink="#1b1916" accent={LOGO_RED} label={`A globe turned to ${c.name}, with the route between Baku and Dubai`} />
          </Suspense>
        </div>
      </div>

      <div className="stock__bar">
        <div className="chips" role="group" aria-label="Season">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
              <span className="chip__count">{f.id === 'all' ? inCity.length : inCity.filter((p) => p.season === f.id).length}</span>
            </button>
          ))}
        </div>
        <p className="stock__status" aria-live="polite">
          {shown.length} {shown.length === 1 ? 'piece' : 'pieces'} in {c.name}
        </p>
      </div>

      <ul className="stock__grid" role="list">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((piece) => (
            <motion.li
              key={`${piece.id}`}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: 'blur(6px)', transition: { duration: 0.22, ease: EASE } }}
              transition={{ duration: 0.55, ease: EASE, layout: { duration: 0.6, ease: EASE } }}
            >
              <Card piece={piece} city={city} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {shown.length === 0 && (
        <p className="stock__empty">
          Nothing from this season is on the rail in {c.name} right now.{' '}
          <a href={whatsappUrl(city, `Hello Saint Aslan ${c.name}, what do you have from the ${filter} collection?`)} target="_blank" rel="noreferrer">
            Ask the {c.name} boutique
          </a>
        </p>
      )}
    </section>
  )
}
