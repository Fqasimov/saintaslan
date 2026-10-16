import { useEffect, useRef } from 'react'
import { LAND_DOTS } from '../data/globe-dots'
import { CITIES, type CityId } from '../lib/contact'

type Props = {
  city: CityId
  /** Colour of land dots and the route. */
  ink: string
  accent: string
  label: string
}

const RAD = Math.PI / 180
const other = (c: CityId): CityId => (c === 'baku' ? 'dubai' : 'baku')

/** Great-circle interpolation between two [lon, lat] points (degrees). */
function interpolator(a: [number, number], b: [number, number]) {
  const [l0, p0] = [a[0] * RAD, a[1] * RAD]
  const [l1, p1] = [b[0] * RAD, b[1] * RAD]
  const v0 = [Math.cos(p0) * Math.cos(l0), Math.cos(p0) * Math.sin(l0), Math.sin(p0)]
  const v1 = [Math.cos(p1) * Math.cos(l1), Math.cos(p1) * Math.sin(l1), Math.sin(p1)]
  const d = Math.acos(Math.min(1, v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2]))
  return (t: number): [number, number] => {
    const s0 = Math.sin((1 - t) * d) / Math.sin(d)
    const s1 = Math.sin(t * d) / Math.sin(d)
    const x = s0 * v0[0] + s1 * v1[0]
    const y = s0 * v0[1] + s1 * v1[1]
    const z = s0 * v0[2] + s1 * v1[2]
    return [Math.atan2(y, x) / RAD, Math.atan2(z, Math.hypot(x, y)) / RAD]
  }
}

/**
 * A dotted globe, turned to whichever boutique is chosen, with the route between
 * Baku and Dubai drawn as an arc above the surface. Drag to turn it; it settles back.
 * Plain canvas and an orthographic projection: no map library at runtime.
 */
export function Globe({ city, ink, accent, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({
    lon: CITIES[city].coords[0],
    lat: CITIES[city].coords[1] - 8,
    vLon: 0,
    vLat: 0,
    drag: null as null | { x: number; y: number; lon: number; lat: number },
    city,
    // 0..1: how far the route has been drawn since the last change of city.
    route: 0,
    pulse: 0,
  })

  useEffect(() => {
    state.current.city = city
    state.current.route = 0
  }, [city])

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let visible = false
    let w = 0
    let h = 0
    let dpr = 1
    const start = performance.now()

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = (now: number) => {
      const s = state.current
      const t = (now - start) / 1000
      const target = CITIES[s.city].coords
      // A slow sway around the chosen city keeps the sphere alive without losing it.
      const sway = reduce ? 0 : Math.sin(t * 0.42) * 7
      const goalLon = target[0] + sway
      const goalLat = target[1] - 8

      if (!s.drag) {
        // Critically damped spring towards the goal: no overshoot, no wobble.
        const k = 0.045
        const damp = 0.78
        s.vLon = (s.vLon + (goalLon - s.lon) * k) * damp
        s.vLat = (s.vLat + (goalLat - s.lat) * k) * damp
        s.lon += reduce ? goalLon - s.lon : s.vLon
        s.lat += reduce ? goalLat - s.lat : s.vLat
      }
      s.route = reduce ? 1 : Math.min(1, s.route + 0.012)
      s.pulse = (t * 0.6) % 1

      const R = Math.min(w, h) * 0.44
      const cx = w / 2
      const cy = h / 2
      const l0 = s.lon * RAD
      const p0 = s.lat * RAD
      const sinP0 = Math.sin(p0)
      const cosP0 = Math.cos(p0)

      const project = (lon: number, lat: number, lift = 1) => {
        const l = lon * RAD - l0
        const p = lat * RAD
        const cosP = Math.cos(p)
        const cosc = sinP0 * Math.sin(p) + cosP0 * cosP * Math.cos(l)
        return {
          x: cx + R * lift * cosP * Math.sin(l),
          y: cy - R * lift * (cosP0 * Math.sin(p) - sinP0 * cosP * Math.cos(l)),
          z: cosc,
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // Rim of the sphere.
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = ink
      ctx.globalAlpha = 0.18
      ctx.lineWidth = 1
      ctx.stroke()

      // Land: dots fade and shrink towards the rim, which is what makes it read as round.
      ctx.fillStyle = ink
      const base = Math.max(0.9, R / 240)
      for (let i = 0; i < LAND_DOTS.length; i += 2) {
        const q = project(LAND_DOTS[i] / 10, LAND_DOTS[i + 1] / 10)
        if (q.z <= 0.02) continue
        ctx.globalAlpha = 0.12 + q.z * 0.55
        const r = base * (0.55 + q.z * 0.6)
        ctx.fillRect(q.x - r, q.y - r, r * 2, r * 2)
      }

      // The route, lifted off the surface, drawn from the other city to the chosen one.
      const from = CITIES[other(s.city)].coords
      const to = CITIES[s.city].coords
      const along = interpolator(from, to)
      const steps = 64
      const eased = 1 - Math.pow(1 - s.route, 3)
      ctx.beginPath()
      for (let i = 0; i <= steps * eased; i++) {
        const u = i / steps
        const [lon, lat] = along(u)
        const q = project(lon, lat, 1 + Math.sin(u * Math.PI) * 0.16)
        if (i === 0) ctx.moveTo(q.x, q.y)
        else ctx.lineTo(q.x, q.y)
      }
      ctx.globalAlpha = 0.9
      ctx.strokeStyle = accent
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Both boutiques: the chosen one in the accent with a slow ring.
      ctx.font = `500 ${Math.max(10, R * 0.055)}px "Montserrat Variable", Montserrat, sans-serif`
      ctx.textBaseline = 'middle'
      for (const id of ['baku', 'dubai'] as CityId[]) {
        const c = CITIES[id]
        const q = project(c.coords[0], c.coords[1])
        if (q.z <= 0) continue
        const chosen = id === s.city
        ctx.globalAlpha = 1
        ctx.fillStyle = chosen ? accent : ink
        ctx.beginPath()
        ctx.arc(q.x, q.y, chosen ? 4 : 3, 0, Math.PI * 2)
        ctx.fill()
        if (chosen && !reduce) {
          ctx.beginPath()
          ctx.arc(q.x, q.y, 4 + s.pulse * 18, 0, Math.PI * 2)
          ctx.globalAlpha = (1 - s.pulse) * 0.6
          ctx.strokeStyle = accent
          ctx.stroke()
        }
        ctx.globalAlpha = chosen ? 1 : 0.6
        ctx.fillStyle = ink
        const text = c.name.toUpperCase().split('').join(String.fromCharCode(8202))
        ctx.fillText(text, q.x + 12, q.y + (id === 'baku' ? -2 : 2))
      }
      ctx.globalAlpha = 1
    }

    const loop = (now: number) => {
      draw(now)
      if (visible) raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible) raf = requestAnimationFrame(loop)
    })
    io.observe(canvas)
    // Draw once even before it scrolls in, so it is never blank.
    document.fonts.ready.then(() => draw(performance.now()))

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [ink, accent])

  const onDown = (e: React.PointerEvent) => {
    const s = state.current
    s.drag = { x: e.clientX, y: e.clientY, lon: s.lon, lat: s.lat }
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    const s = state.current
    if (!s.drag) return
    const k = 0.35
    s.lon = s.drag.lon - (e.clientX - s.drag.x) * k
    s.lat = Math.max(-60, Math.min(70, s.drag.lat + (e.clientY - s.drag.y) * k))
  }
  const onUp = () => {
    state.current.drag = null
  }

  return (
    <canvas
      ref={canvasRef}
      className="globe"
      role="img"
      aria-label={label}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    />
  )
}
