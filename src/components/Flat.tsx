import { useRef, type CSSProperties } from 'react'
import { OUTLINES } from '../data/generated'
import { src, srcSet } from '../data/photos'
import type { Piece } from '../data/pieces'
import { useFinePointer } from '../lib/hooks'

type Props = {
  piece: Piece
  sizes: string
  /** Delay before the drawing starts, in ms, so a row of flats draws one after another. */
  delay?: number
  className?: string
}

/**
 * A garment that is drawn before it is made: its technical flat (outline, seams,
 * buttons, all traced from the house's own product shot) draws itself in ink, then
 * the velvet is laid over it from the top. On a mouse, the piece tilts towards the
 * pointer and the light runs over the nap of the velvet.
 */
export function Flat({ piece, sizes, delay = 0, className = '' }: Props) {
  const key = piece.photo.name as keyof typeof OUTLINES
  const flat = OUTLINES[key]
  const tiltRef = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()

  const move = (e: React.PointerEvent) => {
    const el = tiltRef.current
    if (!el || !fine) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--ry', `${(x - 0.5) * 12}deg`)
    el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`)
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    el.dataset.active = 'true'
  }
  const leave = () => {
    const el = tiltRef.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.dataset.active = 'false'
  }

  const image = src(piece.photo, piece.photo.widths[piece.photo.widths.length - 1])
  const style = {
    '--ar': `${flat.width} / ${flat.height}`,
    '--delay': `${delay}ms`,
    // Absolute: a url() inside a custom property resolves against the stylesheet that uses it.
    '--mask': `url("${new URL(image, document.baseURI).href}")`,
  } as CSSProperties

  return (
    <div className={`flat reveal ${className}`} style={style}>
      <div className="flat__sheet">
        <div ref={tiltRef} className="flat__tilt" onPointerMove={move} onPointerLeave={leave}>
          <svg className="flat__drawing" viewBox={`0 0 ${flat.width} ${flat.height}`} aria-hidden="true">
            <path className="flat__outline" d={flat.outline} pathLength={1} />
            {flat.lines.map((d, i) => (
              <path key={i} className="flat__line" d={d} pathLength={1} style={{ ['--i' as string]: i }} />
            ))}
            {flat.buttons.map(([x, y, r], i) => (
              <circle key={i} className="flat__button" cx={x} cy={y} r={r * 1.1} pathLength={1} style={{ ['--i' as string]: i }} />
            ))}
          </svg>
          <div className="flat__cloth">
            <img
              src={src(piece.photo)}
              srcSet={srcSet(piece.photo)}
              sizes={sizes}
              width={flat.width}
              height={flat.height}
              alt={`${piece.name}, ${piece.detail.toLowerCase()}`}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
            <span className="flat__sheen" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
