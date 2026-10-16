import { Player, type PlayerRef } from '@remotion/player'
import { useEffect, useMemo, useRef } from 'react'
import { BRAND, SaintAslanIntro, type IntroProps } from '../remotion/Intro'
import { FPS, INTRO_FRAMES } from '../remotion/timing'

type Props = {
  /** Fired as the curtains begin to part, so the page can rise in behind them. */
  onOpening: () => void
  /** Fired once the curtains are gone. */
  onDone: () => void
}

// Fast off the mark, long settle: a heavy curtain drawn by hand.
const PART = 'cubic-bezier(0.76, 0, 0.24, 1)'
const PART_MS = 1250

/**
 * The opening: the name rises and a thread becomes the route between the two
 * boutiques (a Remotion composition, played in the page). Then the velvet curtain
 * parts in two halves, one for each city, to uncover the site.
 * Any click, key, wheel or touch skips straight to the parting.
 */
export function Intro({ onOpening, onDone }: Props) {
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<PlayerRef>(null)
  const reduce = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  // The composition takes the shape of the screen, so the lockup is never letterboxed.
  const dims = useMemo(() => {
    const w = window.innerWidth
    const h = window.innerHeight
    const portrait = h > w
    const width = 1600
    return { width, height: Math.round((width * h) / w), scale: portrait ? 0.9 : 0.62 }
  }, [])

  const input: IntroProps = { background: null, ink: BRAND.taupe, accent: BRAND.oxblood, scale: dims.scale }

  useEffect(() => {
    const left = leftRef.current!
    const right = rightRef.current!
    const stage = stageRef.current!
    const player = playerRef.current
    let leaving = false
    let disposed = false
    const timers: number[] = []
    const finish = () => !disposed && onDone()

    const leave = (fast: boolean) => {
      if (leaving) return
      leaving = true
      timers.forEach(clearTimeout)
      player?.pause()
      player?.seekTo(INTRO_FRAMES - 1)
      onOpening()

      if (reduce.current) {
        const fade = { duration: 400, easing: 'ease', fill: 'forwards' as const }
        stage.animate([{ opacity: 1 }, { opacity: 0 }], fade)
        left.animate([{ opacity: 1 }, { opacity: 0 }], fade)
        right.animate([{ opacity: 1 }, { opacity: 0 }], fade).finished.then(finish)
        return
      }
      const duration = fast ? 900 : PART_MS
      stage.animate(
        [
          { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
          { opacity: 0, transform: 'scale(1.04)', filter: 'blur(6px)' },
        ],
        { duration: duration * 0.45, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' },
      )
      const opts = { duration, delay: duration * 0.12, easing: PART, fill: 'forwards' as const }
      left.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-101%)' }], opts)
      right.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(101%)' }], opts).finished.then(finish)
    }

    const skip = () => leave(true)
    const onEnded = () => timers.push(window.setTimeout(() => leave(false), 280))

    if (reduce.current) {
      timers.push(window.setTimeout(() => leave(false), 1000))
    } else if (player) {
      player.addEventListener('ended', onEnded)
      const ready = document.fonts.load('560 40px "Montserrat Variable"')
      const timeout = new Promise((r) => setTimeout(r, 1200))
      Promise.race([ready, timeout])
        .catch(() => undefined)
        .then(() => {
          if (!disposed && !leaving) player.play()
        })
      // If playback cannot start at all, the page still opens.
      timers.push(window.setTimeout(() => leave(false), 8000))
    }

    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    window.addEventListener('wheel', skip, { passive: true })
    window.addEventListener('touchmove', skip, { passive: true })
    return () => {
      disposed = true
      timers.forEach(clearTimeout)
      player?.removeEventListener('ended', onEnded)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchmove', skip)
    }
    // Runs once per mount; the callbacks are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="intro" aria-hidden="true">
      <div ref={leftRef} className="intro__half intro__half--left" />
      <div ref={rightRef} className="intro__half intro__half--right" />
      <div ref={stageRef} className="intro__stage">
        <Player
          ref={playerRef}
          component={SaintAslanIntro}
          inputProps={input}
          durationInFrames={INTRO_FRAMES}
          fps={FPS}
          compositionWidth={dims.width}
          compositionHeight={dims.height}
          initialFrame={reduce.current ? INTRO_FRAMES - 1 : 0}
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          moveToBeginningWhenEnded={false}
          initiallyMuted
          numberOfSharedAudioTags={0}
          acknowledgeRemotionLicense
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )
}
