import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useRef } from 'react'
import { LogoMark } from '../brand/Logo'
import { useReducedMotion } from '../lib/hooks'

// Layers behind the face give the disc a real edge when it turns.
const EDGE = 14

/**
 * The logo as an object: a red disc with thickness, turning in 3D as it is scrolled
 * past and settling face-on, like a wax seal pressed onto the page.
 */
export function LogoCoin() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.6 })
  const rotateY = useTransform(smooth, [0, 0.5, 1], [-62, 0, 28])
  const rotateX = useTransform(smooth, [0, 0.5, 1], [18, 0, -10])
  const rotateZ = useTransform(smooth, [0, 0.5, 1], [-8, 0, 4])

  return (
    <div ref={ref} className="coin" aria-hidden="true">
      <motion.div className="coin__body" style={reduce ? undefined : { rotateY, rotateX, rotateZ }}>
        {Array.from({ length: EDGE }, (_, i) => (
          <span key={i} className="coin__edge" style={{ transform: `translateZ(${-(i + 1) * 1.2}px)` }} />
        ))}
        <div className="coin__face">
          <LogoMark />
        </div>
      </motion.div>
    </div>
  )
}
