import { SIZES } from './generated'

export type PhotoName = keyof typeof SIZES

export type Photo = {
  name: PhotoName
  width: number
  height: number
  widths: readonly number[]
}

export function photo(name: PhotoName): Photo {
  const s = SIZES[name]
  return { name, width: s.width, height: s.height, widths: s.widths }
}

export const src = (p: Photo, w?: number) => `looks/${p.name}-${w ?? p.widths[0]}.webp`
export const srcSet = (p: Photo) => p.widths.map((w) => `${src(p, w)} ${w}w`).join(', ')
