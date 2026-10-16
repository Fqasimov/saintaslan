import '@fontsource-variable/montserrat'
import { useEffect, useState } from 'react'
import { Composition, continueRender, delayRender } from 'remotion'
import { BRAND, SaintAslanIntro, type IntroProps } from './Intro'
import { FPS, INTRO_FRAMES, MASTER_FRAMES, SITE_SPEED } from './timing'

function useFonts() {
  const [handle] = useState(() => delayRender('Loading Montserrat'))
  useEffect(() => {
    document.fonts.load('500 40px "Montserrat Variable"').finally(() => continueRender(handle))
  }, [handle])
}

const film = (scale: number): IntroProps => ({ background: BRAND.velvet, ink: BRAND.taupe, scale, speed: 1, grain: true })

export function RemotionRoot() {
  useFonts()
  return (
    <>
      {/* The logo film, for the client: landscape, square (feed) and vertical (stories, reels). */}
      <Composition id="LogoFilm" component={SaintAslanIntro} durationInFrames={MASTER_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={film(0.5)} />
      <Composition id="LogoFilmSquare" component={SaintAslanIntro} durationInFrames={MASTER_FRAMES} fps={FPS} width={1080} height={1080} defaultProps={film(0.52)} />
      <Composition id="LogoFilmVertical" component={SaintAslanIntro} durationInFrames={MASTER_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={film(0.7)} />
      {/* The cut the site plays, faster and without the end hold. */}
      <Composition
        id="SiteIntro"
        component={SaintAslanIntro}
        durationInFrames={INTRO_FRAMES}
        fps={FPS}
        width={1600}
        height={900}
        defaultProps={{ ...film(0.5), speed: SITE_SPEED }}
      />
    </>
  )
}
