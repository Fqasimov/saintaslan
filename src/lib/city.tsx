import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CityId } from './contact'

const KEY = 'saint-aslan:city'

function initialCity(): CityId {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'baku' || saved === 'dubai') return saved
  } catch {
    // Storage blocked: fall through to the time zone.
  }
  // Both cities share GMT+4, but the zone name still tells them apart.
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return zone === 'Asia/Dubai' || zone === 'Asia/Muscat' ? 'dubai' : 'baku'
}

type Ctx = { city: CityId; setCity: (c: CityId) => void }
const CityContext = createContext<Ctx | null>(null)

export function CityProvider({ children }: { children: ReactNode }) {
  const [city, set] = useState<CityId>(initialCity)
  const setCity = useCallback((c: CityId) => {
    set(c)
    try {
      localStorage.setItem(KEY, c)
    } catch {
      // Remembered for this visit only.
    }
  }, [])
  const value = useMemo(() => ({ city, setCity }), [city, setCity])
  return <CityContext.Provider value={value}>{children}</CityContext.Provider>
}

export function useCity() {
  const ctx = useContext(CityContext)
  if (!ctx) throw new Error('useCity outside CityProvider')
  return ctx
}
