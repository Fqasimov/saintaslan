export const FPS = 60

/**
 * The logo film, in frames of the master edit (60 fps). The site plays the same film
 * a little faster (SITE_SPEED) and leaves before the final hold.
 */
export const T = {
  /** A red thread runs in from the left, stitches along, and wraps into a circle. */
  threadFrom: 6,
  threadTo: 92,
  /** Its tail follows, so only the circle is left. */
  tailFrom: 44,
  tailTo: 108,
  /** Red dye rises inside the circle, with a moving surface. */
  dyeFrom: 70,
  dyeTo: 162,
  /** The thread outline melts into the filled disc. */
  ringFrom: 150,
  ringTo: 186,
  /** The letters glide in from wide spacing, centre first; the dye inks them black. */
  lettersFrom: 104,
  letterDur: 84,
  letterStagger: 3.5,
  /** The camera starts turned and settles face-on. */
  settleTo: 236,
  /** Light runs across the disc like across satin. */
  sheenFrom: 200,
  sheenTo: 268,
  /** The route between the two boutiques draws out beneath. */
  routeFrom: 214,
  routeTo: 270,
  citiesFrom: 234,
  citiesTo: 284,
}

/** Full master film, with a held end frame. */
export const MASTER_FRAMES = 372

/** The site plays the film this much faster than the master. */
export const SITE_SPEED = 1.3
/** Frames the site plays: up to the cities landing, then it opens. */
export const INTRO_FRAMES = Math.ceil((T.citiesTo + 10) / SITE_SPEED)
