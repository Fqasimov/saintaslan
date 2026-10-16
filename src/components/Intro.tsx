import { Player, type PlayerRef } from '@remotion/player'
import { useEffect, useMemo, useRef } from 'react'
import { BRAND, SaintAslanIntro, type IntroProps } from '../remotion/Intro'
import { FPS, INTRO_FRAMES, SITE_SPEED } from '../remotion/timing'

type Props = {
  /** Fired as the curtains begin to part, so the page can rise in behind them. */
  onOpening: () => void
  /** Fired once the curtains are gone. */
  onDone: () => void
}

// Moves from the first frame, then settles long: a heavy curtain drawn by hand.
const PART = 'cubic-bezier(0.55, 0.02, 0.18, 1)'
const PART_MS = 1150

/**
 * The opening: the logo film (a Remotion composition, played in the page). A red
 * thread is sewn in and wraps into a circle, dye fills it, and the letters glide
 * together and are inked black by the dye; then the route Baku to Dubai draws out. Then the velvet curtain
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
    return { width, height: Math.round((width * h) / w), scale: portrait ? 0.74 : 0.5 }
  }, [])

  // No grain here: the player scales the frame, and a scaled tile shows its seams as lines.
  const input: IntroProps = { background: null, ink: BRAND.taupe, scale: dims.scale, speed: SITE_SPEED, grain: false }

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
      // The logo steps back cleanly (no blur, which smeared the red into a dark ghost),
      // and the curtain begins to part as it goes.
      stage.animate(
        [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(0.97)' },
        ],
        // Fades as the gap opens, so there is never a moment of empty black.
        { duration: 520, easing: 'cubic-bezier(0.4, 0, 0.6, 1)', fill: 'forwards' },
      )
      stage.parentElement?.classList.add('is-parting')
      const opts = { duration, easing: PART, fill: 'forwards' as const }
      left.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-101%)' }], opts)
      right.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(101%)' }], opts).finished.then(finish)
    }

    const skip = () => leave(true)
    const onEnded = () => timers.push(window.setTimeout(() => leave(false), 280))

    if (reduce.current) {
      timers.push(window.setTimeout(() => leave(false), 1000))
    } else if (player) {
      player.addEventListener('ended', onEnded)
      const ready = document.fonts.load('500 40px "Montserrat Variable"')
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
