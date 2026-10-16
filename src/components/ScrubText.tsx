import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'

function Word({ word, i, n, progress }: { word: string; i: number; n: number; progress: MotionValue<number> }) {
  const start = i / n
  const opacity = useTransform(progress, [start, start + 1.5 / n], [0.14, 1])
  return (
    <>
      <motion.span style={{ opacity }}>{word}</motion.span>{' '}
    </>
  )
}

/** A statement that lights up word by word as it is read down the page. */
export function ScrubText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 45%'] })
  const words = text.split(' ')
  return (
    <p ref={ref} className={`scrub ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Word key={i} word={w} i={i} n={words.length} progress={scrollYProgress} />
        ))}
      </span>
    </p>
  )
}
