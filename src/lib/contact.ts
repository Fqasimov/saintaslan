/**
 * Everything the house still has to confirm lives here.
 *
 * WhatsApp numbers: international format, digits only (e.g. 994501234567 for Baku,
 * 971501234567 for Dubai). While a number is empty, the buttons open WhatsApp's
 * share sheet with the message already written.
 */
export type CityId = 'baku' | 'dubai'

export type City = {
  id: CityId
  name: string
  country: string
  /** IANA zone, for the live clock. Both cities keep GMT+4. */
  zone: string
  /** [longitude, latitude] for the globe. */
  coords: [number, number]
  whatsapp: string
  /** Street address of the boutique. Left empty until confirmed; hidden while empty. */
  address: string
}

export const CITIES: Record<CityId, City> = {
  baku: {
    id: 'baku',
    name: 'Baku',
    country: 'Azerbaijan',
    zone: 'Asia/Baku',
    coords: [49.8671, 40.4093],
    whatsapp: '',
    address: '',
  },
  dubai: {
    id: 'dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    zone: 'Asia/Dubai',
    coords: [55.2708, 25.2048],
    whatsapp: '',
    address: '',
  },
}

export const CITY_IDS: CityId[] = ['baku', 'dubai']

/** To confirm with the house. */
export const INSTAGRAM = 'saintaslan'
export const instagramUrl = `https://instagram.com/${INSTAGRAM}`

export function whatsappUrl(city: CityId, message: string) {
  const number = CITIES[city].whatsapp
  const text = encodeURIComponent(message)
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`
}
