import type { Piece } from '../data/pieces'
import { CITIES, CITY_IDS } from '../lib/contact'

/** "Baku · Dubai" with a filled dot where the piece is in stock. */
export function StockNote({ piece }: { piece: Piece }) {
  return (
    <p className="stock-note">
      <span className="sr-only">In stock in: {piece.stock.map((c) => CITIES[c].name).join(' and ')}</span>
      {CITY_IDS.map((id) => (
        <span key={id} className="stock-note__city" data-in={piece.stock.includes(id)} aria-hidden="true">
          {CITIES[id].name}
        </span>
      ))}
    </p>
  )
}
