import { useEffect, useRef } from 'react'
import { LAND_DOTS } from '../data/globe-dots'
import { CITIES, CITY_IDS, type CityId } from '../lib/contact'

type Props = {
  city: CityId
  /** Colour of land dots and the route. */
  ink: string
  accent: string
  label: string
}

const RAD = Math.PI / 180
const other = (c: CityId): CityId => (c === 'baku' ? 'dubai' : 'baku')

// The trigonometry of every land dot, worked out once instead of on every frame.
const N = LAND_DOTS.length / 2
const DOT_LON = new Float32Array(N)
const DOT_SIN_LAT = new Float32Array(N)
const DOT_COS_LAT = new Float32Array(N)
for (let i = 0; i < N; i++) {
  const lat = (LAND_DOTS[i * 2 + 1] / 10) * RAD
  DOT_LON[i] = (LAND_DOTS[i * 2] / 10) * RAD
  DOT_SIN_LAT[i] = Math.sin(lat)
  DOT_COS_LAT[i] = Math.cos(lat)
}
// Dots are drawn in a few bands of depth, one fill style change per band.
const BANDS = 6

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
 * The sphere is a plain canvas; the city names are real text laid over it, so they
 * stay sharp at any pixel density.
 */
export function Globe({ city, ink, accent, label }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRefs = useRef<Record<CityId, HTMLSpanElement | null>>({ baku: null, dubai: null })
  const state = useRef({
    lon: CITIES[city].coords[0],
    lat: CITIES[city].coords[1] - 8,
    vLon: 0,
    vLat: 0,
    drag: null as null | { x: number; y: number; lon: number; lat: number },
    city,
    // 0..1: how far the route has been drawn since the last change of city.
    route: 0,
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
    const bandX: number[][] = Array.from({ length: BANDS }, () => [])
    const bandY: number[][] = Array.from({ length: BANDS }, () => [])

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
        const k = 0.06
        const damp = 0.76
        s.vLon = (s.vLon + (goalLon - s.lon) * k) * damp
        s.vLat = (s.vLat + (goalLat - s.lat) * k) * damp
        s.lon += reduce ? goalLon - s.lon : s.vLon
        s.lat += reduce ? goalLat - s.lat : s.vLat
      }
      s.route = reduce ? 1 : Math.min(1, s.route + 0.018)
      const pulse = (t * 0.6) % 1

      const R = Math.min(w, h) * 0.44
      const cx = w / 2
      const cy = h / 2
      const l0 = s.lon * RAD
      const sinP0 = Math.sin(s.lat * RAD)
      const cosP0 = Math.cos(s.lat * RAD)

      const project = (lon: number, lat: number, lift = 1) => {
        const l = lon * RAD - l0
        const p = lat * RAD
        const cosP = Math.cos(p)
        const sinP = Math.sin(p)
        const cosL = Math.cos(l)
        return {
          x: cx + R * lift * cosP * Math.sin(l),
          y: cy - R * lift * (cosP0 * sinP - sinP0 * cosP * cosL),
          z: sinP0 * sinP + cosP0 * cosP * cosL,
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
      for (let b = 0; b < BANDS; b++) {
        bandX[b].length = 0
        bandY[b].length = 0
      }
      for (let i = 0; i < N; i++) {
        const l = DOT_LON[i] - l0
        const cosL = Math.cos(l)
        const z = sinP0 * DOT_SIN_LAT[i] + cosP0 * DOT_COS_LAT[i] * cosL
        if (z <= 0.02) continue
        const b = Math.min(BANDS - 1, (z * BANDS) | 0)
        bandX[b].push(cx + R * DOT_COS_LAT[i] * Math.sin(l))
        bandY[b].push(cy - R * (cosP0 * DOT_SIN_LAT[i] - sinP0 * DOT_COS_LAT[i] * cosL))
      }
      ctx.fillStyle = ink
      const base = Math.max(0.9, R / 240)
      for (let b = 0; b < BANDS; b++) {
        const z = (b + 0.5) / BANDS
        ctx.globalAlpha = 0.12 + z * 0.55
        const r = base * (0.55 + z * 0.6)
        const xs = bandX[b]
        const ys = bandY[b]
        for (let i = 0; i < xs.length; i++) ctx.fillRect(xs[i] - r, ys[i] - r, r * 2, r * 2)
      }

      // The route, lifted off the surface, drawn from the other city to the chosen one.
      const along = interpolator(CITIES[other(s.city)].coords, target)
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

      // Both boutiques: the chosen one in the accent with a slow ring. Their names are
      // HTML, moved to follow the dots.
      for (const id of CITY_IDS) {
        const c = CITIES[id]
        const q = project(c.coords[0], c.coords[1])
        const chosen = id === s.city
        const el = labelRefs.current[id]
        if (el) {
          el.style.transform = `translate3d(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px, 0)`
          el.style.opacity = q.z > 0.05 ? '1' : '0'
        }
        if (q.z <= 0) continue
        ctx.globalAlpha = 1
        ctx.fillStyle = chosen ? accent : ink
        ctx.beginPath()
        ctx.arc(q.x, q.y, chosen ? 4 : 3, 0, Math.PI * 2)
        ctx.fill()
        if (chosen && !reduce) {
          ctx.beginPath()
          ctx.arc(q.x, q.y, 4 + pulse * 18, 0, Math.PI * 2)
          ctx.globalAlpha = (1 - pulse) * 0.6
          ctx.strokeStyle = accent
          ctx.stroke()
        }
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
    draw(performance.now())

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [ink, accent])

  const onDown = (e: React.PointerEvent) => {
    const s = state.current
    s.drag = { x: e.clientX, y: e.clientY, lon: s.lon, lat: s.lat }
    wrapRef.current?.setPointerCapture(e.pointerId)
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
    <div
      ref={wrapRef}
      className="globe"
      role="img"
      aria-label={label}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <canvas ref={canvasRef} className="globe__canvas" />
      {CITY_IDS.map((id) => (
        <span
          key={id}
          ref={(el) => {
            labelRefs.current[id] = el
          }}
          className={`globe__label globe__label--${id}`}
          data-chosen={id === city}
          aria-hidden="true"
        >
          <span>{CITIES[id].name}</span>
        </span>
      ))}
    </div>
  )
}
