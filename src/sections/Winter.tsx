import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Flat } from '../components/Flat'
import { Letters } from '../components/Letters'
import { Picture } from '../components/Picture'
import { StockNote } from '../components/StockNote'
import { byId } from '../data/pieces'

const FLATS = ['corset', 'jacket', 'skirt'].map(byId)
const GOWN = byId('choker-gown')

export function Winter() {
  const wornRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wornRef, offset: ['start end', 'end end'] })
  // The gown opens out from a narrow window to the whole screen as it is scrolled to.
  const clip = useTransform(scrollYProgress, [0.15, 0.85], ['inset(14% 34% 14% 34%)', 'inset(0% 0% 0% 0%)'])
  const scale = useTransform(scrollYProgress, [0.15, 0.85], [1.18, 1])
  const textY = useTransform(scrollYProgress, [0.4, 1], ['30%', '0%'])
  const textOpacity = useTransform(scrollYProgress, [0.55, 0.9], [0, 1])

  return (
    <section id="winter" className="winter" data-ground="velvet" aria-labelledby="winter-title">
      <header className="season-head">
        <p className="season-head__index" aria-hidden="true">
          01
        </p>
        <Letters text="Winter" className="season-head__title" />
        <div className="season-head__copy reveal">
          <p className="season-head__lede" id="winter-title">
            <em>Velvet, cut close to the waist.</em>
          </p>
          <p>
            Black velvet with a nap that drinks the light. A corset with a pointed hem, a jacket with a stand collar and
            pearl buttons, a skirt ruched at the waist. Each piece is drawn before it is made, so here it is drawn first.
          </p>
        </div>
      </header>

      <ul className="winter__flats" role="list">
        {FLATS.map((piece, i) => (
          <li key={piece.id} className={`winter__piece winter__piece--${piece.id}`}>
            <Flat piece={piece} sizes="(min-width: 900px) 30vw, 88vw" delay={i * 260} />
            <div className="piece-caption reveal">
              <h3 className="piece-name">{piece.name}</h3>
              <p className="label">{piece.detail}</p>
              <StockNote piece={piece} />
            </div>
          </li>
        ))}
      </ul>

      <div ref={wornRef} className="worn">
        <div className="worn__sticky">
          <motion.div className="worn__window" style={{ clipPath: clip }}>
            <motion.div className="worn__img" style={{ scale }}>
              <Picture photo={GOWN.photo} alt={`${GOWN.name}: long sleeves, off the shoulder, with a separate high choker`} sizes="100vw" reveal={false} focus="50% 30%" />
            </motion.div>
          </motion.div>
          <motion.div className="worn__text" style={{ y: textY, opacity: textOpacity }}>
            <p className="worn__kicker">Winter, worn</p>
            <h3 className="piece-name piece-name--large">{GOWN.name}</h3>
            <p className="label">{GOWN.detail}</p>
            <StockNote piece={GOWN} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
