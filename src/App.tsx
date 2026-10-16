import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Header } from './components/Header'
import { useGround, useReveal } from './lib/hooks'
import { startSmoothScroll } from './lib/scroll'
import { Contact } from './sections/Contact'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { House } from './sections/House'
import { Stock } from './sections/Stock'
import { Summer } from './sections/Summer'
import { Winter } from './sections/Winter'

// The intro (Remotion player and composition) is its own chunk: returning visitors never load it.
const Intro = lazy(() => import('./components/Intro').then((m) => ({ default: m.Intro })))

const INTRO_KEY = 'saint-aslan:intro-seen'

function introSeen() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1' || new URLSearchParams(location.search).has('nointro')
  } catch {
    return false
  }
}

export type Phase = 'intro' | 'opening' | 'open'

/** The closed curtain alone, shown while the intro's code is still loading. */
function IntroCurtain() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro__half intro__half--left" />
      <div className="intro__half intro__half--right" />
    </div>
  )
}

export default function App() {
  const [phase, setPhase] = useState<Phase>(() => (introSeen() ? 'open' : 'intro'))

  useGround()
  useReveal(phase !== 'intro')
  useEffect(() => startSmoothScroll(), [])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('is-intro', phase !== 'open')
    document.documentElement.dataset.phase = phase
  }, [phase])

  const opening = useCallback(() => setPhase('opening'), [])
  const done = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch {
      // Private mode: the intro plays again next time.
    }
    setPhase('open')
  }, [])

  return (
    <>
      {phase !== 'open' && (
        <Suspense fallback={<IntroCurtain />}>
          <Intro onOpening={opening} onDone={done} />
        </Suspense>
      )}
      <a className="skip-link" href="#stock">
        Skip to the stock
      </a>
      <Header />
      <main>
        <Hero ready={phase !== 'intro'} />
        <Winter />
        <Summer />
        <Stock />
        <House />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
