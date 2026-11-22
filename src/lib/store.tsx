import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LISTINGS, type Listing } from '../data/listings'
import { api, ApiError } from './api'

export interface Trip {
  code: string
  listingId: string
  checkIn: string
  checkOut: string
  guests: number
  total: number
  guestName: string
  email: string
  status: 'pending' | 'confirmed' | 'requested' | 'cancelled' | 'expired'
  createdAt: string
  /** Whole USD charged so far (0 in demo mode). */
  paid?: number
}

export interface User {
  name: string
  email: string
  since: string
}

export interface BookingInput {
  listingId: string
  checkIn: string
  checkOut: string
  guests: number
  total: number
  guestName: string
  email: string
  phone: string
  message: string
  instantBook: boolean
  pay: 'full' | 'split'
}

export interface MessageInput {
  kind: 'contact' | 'host'
  name: string
  email: string
  topic?: string
  hostId?: string
  body: string
}

interface Store {
  /** null while checking, true when the Cloudflare API answers, false in browser-only demo mode. */
  online: boolean | null
  /** True when the API takes real card payments through Stripe Checkout. */
  payments: boolean
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  listings: Listing[]
  getListing: (id: string) => Listing | undefined
  wishlist: string[]
  toggleWish: (id: string) => void
  trips: Trip[]
  /** Saves the booking. With payments on, also returns the Stripe page to send the guest to. */
  addTrip: (b: BookingInput) => Promise<{ trip: Trip; checkoutUrl?: string }>
  rememberTrip: (t: Trip) => void
  /** Re-reads a booking from the server, e.g. after Stripe sends the guest back. */
  reloadTrip: (code: string, email: string) => Promise<Trip | null>
  /** Resolves to the amount refunded in whole USD. */
  cancelTrip: (code: string) => Promise<number>
  customListings: Listing[]
  addListing: (l: Listing) => Promise<Listing>
  removeListing: (id: string) => Promise<void>
  paused: string[]
  togglePaused: (id: string) => void
  sendMessage: (m: MessageInput) => Promise<void>
  uploadPhoto: (file: File) => Promise<string>
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

interface MeResponse {
  user: User | null
  payments?: boolean
  wishlist?: string[]
  trips?: Trip[]
  listings?: Listing[]
  paused?: string[]
}

const isOffline = (e: unknown) => e instanceof ApiError && e.status === 0

export function StoreProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState<boolean | null>(null)
  // Browser storage: the whole demo when offline; signed-out wishlist and guest bookings when online.
  const [localWish, setLocalWish] = usePersisted<string[]>('heaven.wishlist', [])
  const [localTrips, setLocalTrips] = usePersisted<Trip[]>('heaven.trips', [])
  const [localListings, setLocalListings] = usePersisted<Listing[]>('heaven.listings', [])
  const [localPaused, setLocalPaused] = usePersisted<string[]>('heaven.paused', [])
  const [localUser, setLocalUser] = usePersisted<User | null>('heaven.user', null)
  // Server state (Cloudflare D1)
  const [me, setMe] = useState<MeResponse>({ user: null })
  const [publicListings, setPublicListings] = useState<Listing[]>([])

  const refresh = useCallback(async () => {
    const [m, pub] = await Promise.all([api<MeResponse>('/api/me'), api<{ listings: Listing[] }>('/api/listings')])
    setMe(m)
    setPublicListings(pub.listings)
    return m
  }, [])

  useEffect(() => {
    refresh()
      .then(() => setOnline(true))
      .catch(() => setOnline(false))
  }, [refresh])

  const afterAuth = useCallback(async () => {
    // Carry over homes saved before signing in.
    await Promise.all(localWish.map((id) => api(`/api/wishlist/${id}`, { method: 'PUT', json: {} }).catch(() => null)))
    setLocalWish([])
    await refresh()
  }, [localWish, refresh, setLocalWish])

  const value = useMemo<Store>(() => {
    const live = online === true
    const user = live ? me.user : localUser
    const signedIn = live && !!me.user
    const mine = live ? me.listings ?? [] : localListings
    const paused = live ? [...(me.paused ?? []), ...localPaused.filter((id) => !mine.some((l) => l.id === id))] : localPaused
    const others = live ? publicListings.filter((l) => !mine.some((x) => x.id === l.id)) : []
    const all = [...mine, ...others, ...LISTINGS]
    const wishlist = signedIn ? me.wishlist ?? [] : localWish
    const serverTrips = signedIn ? me.trips ?? [] : []
    const trips = [...serverTrips, ...localTrips.filter((t) => !serverTrips.some((s) => s.code === t.code))].filter(
      (t) => t.status !== 'cancelled' && t.status !== 'expired',
    )

    const localTrip = (b: BookingInput): Trip => ({
      code: 'HV' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      listingId: b.listingId,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guests: b.guests,
      total: b.total,
      guestName: b.guestName,
      email: b.email,
      status: b.instantBook ? 'confirmed' : 'requested',
      createdAt: new Date().toISOString(),
    })

    return {
      online,
      payments: live && !!me.payments,
      user,
      async signIn(email, password) {
        if (!live) {
          const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          setLocalUser({ name, email, since: new Date().toISOString() })
          return
        }
        await api('/api/auth/signin', { method: 'POST', json: { email, password } })
        await afterAuth()
      },
      async signUp(name, email, password) {
        if (!live) {
          setLocalUser({ name, email, since: new Date().toISOString() })
          return
        }
        await api('/api/auth/signup', { method: 'POST', json: { name, email, password } })
        await afterAuth()
      },
      async signOut() {
        if (!live) return setLocalUser(null)
        await api('/api/auth/signout', { method: 'POST', json: {} }).catch(() => null)
        setLocalTrips([])
        setMe({ user: null })
      },
      listings: all.filter((l) => !paused.includes(l.id)),
      getListing: (id) => all.find((l) => l.id === id),
      wishlist,
      toggleWish(id) {
        const on = !wishlist.includes(id)
        if (!signedIn) {
          setLocalWish((w) => (on ? [...w, id] : w.filter((x) => x !== id)))
          return
        }
        setMe((m) => ({ ...m, wishlist: on ? [id, ...(m.wishlist ?? [])] : (m.wishlist ?? []).filter((x) => x !== id) }))
        api(`/api/wishlist/${id}`, { method: on ? 'PUT' : 'DELETE', json: {} }).catch(() => refresh())
      },
      trips,
      async addTrip(b) {
        let t: Trip
        let checkoutUrl: string | undefined
        try {
          if (!live) throw new ApiError(0, 'offline')
          const r = await api<{ trip: Trip; checkoutUrl?: string }>('/api/bookings', { method: 'POST', json: b })
          t = r.trip
          checkoutUrl = r.checkoutUrl
        } catch (e) {
          if (!isOffline(e)) throw e
          t = localTrip(b)
        }
        if (signedIn) setMe((m) => ({ ...m, trips: [t, ...(m.trips ?? [])] }))
        else setLocalTrips((ts) => [t, ...ts])
        return { trip: t, checkoutUrl }
      },
      rememberTrip(t) {
        setLocalTrips((ts) => [t, ...ts.filter((x) => x.code !== t.code)])
      },
      async reloadTrip(code, email) {
        if (!live) return null
        const { trip: t } = await api<{ trip: Trip }>(`/api/bookings/lookup?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`)
        if (signedIn) setMe((m) => ({ ...m, trips: (m.trips ?? []).map((x) => (x.code === code ? t : x)) }))
        setLocalTrips((ts) => ts.map((x) => (x.code === code ? t : x)))
        return t
      },
      async cancelTrip(code) {
        const t = trips.find((x) => x.code === code)
        let refunded = 0
        if (live) refunded = (await api<{ refunded?: number }>(`/api/bookings/${code}`, { method: 'DELETE', json: { email: t?.email } })).refunded ?? 0
        setLocalTrips((ts) => ts.filter((x) => x.code !== code))
        if (signedIn) setMe((m) => ({ ...m, trips: (m.trips ?? []).filter((x) => x.code !== code) }))
        return refunded
      },
      customListings: mine,
      async addListing(l) {
        if (!live) {
          setLocalListings((ls) => [l, ...ls])
          return l
        }
        const { listing } = await api<{ listing: Listing }>('/api/listings', { method: 'POST', json: { listing: l } })
        setMe((m) => ({ ...m, listings: [listing, ...(m.listings ?? [])] }))
        return listing
      },
      async removeListing(id) {
        if (!live) return setLocalListings((ls) => ls.filter((l) => l.id !== id))
        await api(`/api/listings/${id}`, { method: 'DELETE', json: {} })
        setMe((m) => ({ ...m, listings: (m.listings ?? []).filter((l) => l.id !== id) }))
      },
      paused,
      togglePaused(id) {
        const on = !paused.includes(id)
        if (live && mine.some((l) => l.id === id)) {
          setMe((m) => ({ ...m, paused: on ? [...(m.paused ?? []), id] : (m.paused ?? []).filter((x) => x !== id) }))
          api(`/api/listings/${id}`, { method: 'PATCH', json: { paused: on } }).catch(() => refresh())
          return
        }
        // Demo catalogue homes: pausing is a per-browser preview only.
        setLocalPaused((p) => (on ? [...p, id] : p.filter((x) => x !== id)))
      },
      async sendMessage(m) {
        if (!live) return
        await api('/api/messages', { method: 'POST', json: m })
      },
      async uploadPhoto(file) {
        if (!live) return URL.createObjectURL(file)
        const { url } = await api<{ url: string }>('/api/uploads', { method: 'POST', body: file, headers: { 'content-type': file.type } })
        return url
      },
    }
  }, [online, me, publicListings, localUser, localListings, localPaused, localWish, localTrips, afterAuth, refresh, setLocalUser, setLocalWish, setLocalTrips, setLocalListings, setLocalPaused])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside StoreProvider')
  return s
}
