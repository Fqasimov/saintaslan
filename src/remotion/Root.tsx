import '@fontsource-variable/montserrat'
import { useEffect, useState } from 'react'
import { Composition, continueRender, delayRender } from 'remotion'
import { BRAND, SaintAslanIntro } from './Intro'
import { FPS, INTRO_FRAMES, REEL_FRAMES } from './timing'

function useFonts() {
  const [handle] = useState(() => delayRender('Loading Montserrat'))
  useEffect(() => {
    document.fonts.load('560 40px "Montserrat Variable"').finally(() => continueRender(handle))
  }, [handle])
}

export function RemotionRoot() {
  useFonts()
  return (
    <>
      {/* The intro the site plays. */}
      <Composition
        id="Intro"
        component={SaintAslanIntro}
        durationInFrames={INTRO_FRAMES}
        fps={FPS}
        width={1600}
        height={900}
        defaultProps={{ background: BRAND.velvet, ink: BRAND.taupe, accent: BRAND.oxblood, scale: 0.72 }}
      />
      {/* The same moment as a vertical video for Instagram stories and reels. */}
      <Composition
        id="IntroReel"
        component={SaintAslanIntro}
        durationInFrames={REEL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ background: BRAND.velvet, ink: BRAND.taupe, accent: BRAND.oxblood, scale: 0.86 }}
      />
    </>
  )
}
