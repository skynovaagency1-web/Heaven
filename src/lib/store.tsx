import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LISTINGS, type Listing } from '../data/listings'

export interface Trip {
  code: string
  listingId: string
  checkIn: string
  checkOut: string
  guests: number
  total: number
  guestName: string
  email: string
  status: 'confirmed' | 'requested'
  createdAt: string
}

interface Store {
  listings: Listing[]
  getListing: (id: string) => Listing | undefined
  wishlist: string[]
  toggleWish: (id: string) => void
  trips: Trip[]
  addTrip: (t: Trip) => void
  cancelTrip: (code: string) => void
  customListings: Listing[]
  addListing: (l: Listing) => void
  removeListing: (id: string) => void
  paused: string[]
  togglePaused: (id: string) => void
}

const Ctx = createContext<Store | null>(null)

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      /* storage unavailable */
    }
  }, [key, v])
  return [v, setV] as const
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = usePersisted<string[]>('heaven.wishlist', [])
  const [trips, setTrips] = usePersisted<Trip[]>('heaven.trips', [])
  const [customListings, setCustom] = usePersisted<Listing[]>('heaven.listings', [])
  const [paused, setPaused] = usePersisted<string[]>('heaven.paused', [])

  const value = useMemo<Store>(() => {
    const all = [...customListings, ...LISTINGS]
    return {
      listings: all.filter((l) => !paused.includes(l.id)),
      getListing: (id) => all.find((l) => l.id === id),
      wishlist,
      toggleWish: (id) =>
        setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
      trips,
      addTrip: (t) => setTrips((ts) => [t, ...ts]),
      cancelTrip: (code) => setTrips((ts) => ts.filter((t) => t.code !== code)),
      customListings,
      addListing: (l) => setCustom((ls) => [l, ...ls]),
      removeListing: (id) => setCustom((ls) => ls.filter((l) => l.id !== id)),
      paused,
      togglePaused: (id) =>
        setPaused((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])),
    }
  }, [wishlist, trips, customListings, paused, setWishlist, setTrips, setCustom, setPaused])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside StoreProvider')
  return s
}
