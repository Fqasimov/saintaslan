import type { CSSProperties } from 'react'
import { LOGO_ASPECT, LOGO_GLYPHS, LOGO_RED, LOGO_VIEWBOX } from './logo-paths'

export { LOGO_RED }

/**
 * The name exactly as the logo draws it (traced from the house's file), one path per
 * letter so the letters can rise one after another. Fills with currentColor.
 */
export function LogoMark({ className = '', title }: { className?: string; title?: string }) {
  return (
    <svg
      className={`logo-mark ${className}`}
      viewBox={LOGO_VIEWBOX}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ aspectRatio: String(LOGO_ASPECT) } as CSSProperties}
    >
      {LOGO_GLYPHS.map((d, i) => (
        <path key={i} className="logo-mark__glyph" d={d} style={{ '--i': i } as CSSProperties} />
      ))}
    </svg>
  )
}

/** The full logo: the name in black across a red disc. */
export function LogoDisc({ className = '', title }: { className?: string; title?: string }) {
  return (
    <div className={`logo-disc ${className}`} role={title ? 'img' : undefined} aria-label={title}>
      <LogoMark />
    </div>
  )
}
