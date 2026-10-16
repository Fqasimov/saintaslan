import type { CSSProperties, ElementType } from 'react'

/**
 * A heading whose letters rise one after another when it scrolls into view
 * (the .reveal / .is-in pair). Screen readers get the plain text.
 */
export function Letters({ text, as: Tag = 'h2', className = '' }: { text: string; as?: ElementType; className?: string }) {
  let i = 0
  return (
    <Tag className={`letters reveal ${className}`} aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span key={w} className="letters__word" aria-hidden="true">
          {word.split('').map((ch, k) => (
            <span key={k} className="letters__ch" style={{ '--i': i++ } as CSSProperties}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  )
}
