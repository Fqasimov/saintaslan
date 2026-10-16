import { photo, type Photo } from './photos'
import type { CityId } from '../lib/contact'

export type Season = 'winter' | 'summer'

export type Piece = {
  id: string
  name: string
  season: Season
  /** What the photographs show of the cloth and the make. */
  detail: string
  photo: Photo
  /** A second view, shown on hover / in the stock card. */
  alt?: Photo
  /** Product shot cut out of its white sweep (drawn as a flat first). */
  cutout?: boolean
  /**
   * Where the piece is in stock right now.
   * PLACEHOLDER: the split below is a draft for layout only. Replace it with the
   * real stock of each boutique before going live.
   */
  stock: CityId[]
}

// Names marked "working name" were written for the site; the three velvet names are
// the house's own (from its product cards).
export const PIECES: Piece[] = [
  {
    id: 'corset',
    name: 'Velvet Waist-fitted Zip Corset',
    season: 'winter',
    detail: 'Velvet, front zip',
    photo: photo('velvet-corset'),
    cutout: true,
    stock: ['baku', 'dubai'],
  },
  {
    id: 'skirt',
    name: 'Velvet Sculpted Maxi Skirt',
    season: 'winter',
    detail: 'Velvet, ruched waist',
    photo: photo('velvet-skirt'),
    cutout: true,
    stock: ['baku'],
  },
  {
    id: 'jacket',
    name: 'Velvet Longsleeve Jacket',
    season: 'winter',
    detail: 'Velvet, pearl buttons',
    photo: photo('velvet-jacket'),
    cutout: true,
    stock: ['baku', 'dubai'],
  },
  {
    id: 'choker-gown',
    name: 'Off-shoulder Choker Gown', // working name
    season: 'winter',
    detail: 'Off the shoulder, separate choker',
    photo: photo('velvet-choker-gown'),
    stock: ['baku'],
  },
  {
    id: 'halter-peplum',
    name: 'Halter Gown with Lace Peplum', // working name
    season: 'summer',
    detail: 'Lace peplum, satin sash, high slit',
    photo: photo('summer-cover'),
    stock: ['baku', 'dubai'],
  },
  {
    id: 'polka',
    name: 'Polka Dot Puff-sleeve Gown', // working name
    season: 'summer',
    detail: 'Puff sleeves, fluted hem',
    photo: photo('polka-gown'),
    alt: photo('polka-gown-close'),
    stock: ['baku', 'dubai'],
  },
  {
    id: 'ivory-set',
    name: 'Ivory Chiffon Ruffle Set', // working name
    season: 'summer',
    detail: 'Chiffon, bell sleeves',
    photo: photo('ivory-chiffon'),
    stock: ['baku'],
  },
  {
    id: 'noir-wrap',
    name: 'Noir Satin Ruffle Wrap', // working name
    season: 'summer',
    detail: 'Satin, cascading ruffle',
    photo: photo('noir-ruffle'),
    stock: ['dubai'],
  },
  {
    id: 'royal-satin',
    name: 'Royal Satin Draped Gown', // working name
    season: 'summer',
    detail: 'Satin, draped, cape sleeves',
    photo: photo('royal-satin'),
    stock: ['dubai'],
  },
]

export const byId = (id: string) => PIECES.find((p) => p.id === id)!
