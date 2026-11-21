import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LISTINGS, type Listing } from '../data/listings'
import type { Session } from '@supabase/supabase-js'
import { live, supabase } from './supabase'

export interface Trip {
  code: string
  listingId: string
  checkIn: string
  checkOut: string
  guests: number
  total: number
  guestName: string
  email: string
  status: 'confirmed' | 'requested' | 'pending'
  createdAt: string
}

export interface User {
  id?: string
  name: string
  email: string
  since: string
}

/** Resolves to an error message, or null on success. */
type AuthResult = Promise<string | null>

interface Store {
  /** True when connected to the real database; false in browser-only demo mode. */
  live: boolean
  ready: boolean
  user: User | null
  login: (email: string, password: string) => AuthResult
  register: (name: string, email: string, password: string) => AuthResult
  signOut: () => Promise<void>
  listings: Listing[]
  getListing: (id: string) => Listing | undefined
  wishlist: string[]
  toggleWish: (id: string) => void
  trips: Trip[]
  refreshTrips: () => Promise<void>
  addTrip: (t: Trip) => void
  cancelTrip: (code: string) => Promise<string | null>
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

interface BookingRow {
  code: string
  listing_id: string
  check_in: string
  check_out: string
  guests: number
  total: number
  guest_name: string
  email: string
  status: Trip['status']
  created_at: string
}

const toTrip = (r: BookingRow): Trip => ({
  code: r.code,
  listingId: r.listing_id,
  checkIn: r.check_in,
  checkOut: r.check_out,
  guests: r.guests,
  total: r.total,
  guestName: r.guest_name,
  email: r.email,
  status: r.status,
  createdAt: r.created_at,
})

const nameFromEmail = (email: string) =>
  email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export function StoreProvider({ children }: { children: ReactNode }) {
  const [localWish, setLocalWish] = usePersisted<string[]>('heaven.wishlist', [])
  const [localTrips, setLocalTrips] = usePersisted<Trip[]>('heaven.trips', [])
  const [customListings, setCustom] = usePersisted<Listing[]>('heaven.listings', [])
  const [paused, setPaused] = usePersisted<string[]>('heaven.paused', [])
  const [localUser, setLocalUser] = usePersisted<User | null>('heaven.user', null)

  const [liveUser, setLiveUser] = useState<User | null>(null)
  const [liveWish, setLiveWish] = useState<string[]>([])
  const [liveTrips, setLiveTrips] = useState<Trip[]>([])
  const [ready, setReady] = useState(!live)

  const user = live ? liveUser : localUser

  // Keep the signed-in user in sync with Supabase auth.
  useEffect(() => {
    if (!supabase) return
    const apply = (s: Session | null) => {
      const u = s?.user
      setLiveUser(
        u
          ? {
              id: u.id,
              email: u.email ?? '',
              name: (u.user_metadata?.name as string) || nameFromEmail(u.email ?? ''),
              since: u.created_at,
            }
          : null,
      )
      setReady(true)
    }
    supabase.auth.getSession().then(({ data }) => apply(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => apply(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const refreshTrips = useCallback(async () => {
    if (!supabase || !liveUser) return setLiveTrips([])
    const { data } = await supabase
      .from('bookings')
      .select('code, listing_id, check_in, check_out, guests, total, guest_name, email, status, created_at')
      .in('status', ['pending', 'confirmed', 'requested'])
      .order('created_at', { ascending: false })
    setLiveTrips(((data ?? []) as BookingRow[]).map(toTrip))
  }, [liveUser])

  // Load the signed-in guest's trips and saved homes.
  useEffect(() => {
    if (!supabase) return
    refreshTrips()
    if (!liveUser) return setLiveWish([])
    supabase
      .from('wishlists')
      .select('listing_id')
      .then(({ data }) => setLiveWish((data ?? []).map((r) => r.listing_id as string)))
  }, [liveUser, refreshTrips])

  const value = useMemo<Store>(() => {
    const all = [...customListings, ...LISTINGS]
    const wishlist = live && liveUser ? liveWish : localWish

    const toggleWish = (id: string) => {
      if (!supabase || !liveUser) {
        setLocalWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))
        return
      }
      const has = liveWish.includes(id)
      setLiveWish((w) => (has ? w.filter((x) => x !== id) : [...w, id]))
      const q = has
        ? supabase.from('wishlists').delete().eq('user_id', liveUser.id!).eq('listing_id', id)
        : supabase.from('wishlists').insert({ user_id: liveUser.id, listing_id: id })
      q.then(({ error }) => {
        if (error) setLiveWish((w) => (has ? [...w, id] : w.filter((x) => x !== id)))
      })
    }

    return {
      live,
      ready,
      user,
      login: async (email, password) => {
        if (!supabase) {
          setLocalUser({ name: nameFromEmail(email), email, since: new Date().toISOString() })
          return null
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return error ? 'That email and password don’t match an account.' : null
      },
      register: async (name, email, password) => {
        if (!supabase) {
          setLocalUser({ name, email, since: new Date().toISOString() })
          return null
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name }, emailRedirectTo: `${location.origin}/account` },
        })
        if (error) return error.message
        if (!data.session) return 'CHECK_EMAIL'
        return null
      },
      signOut: async () => {
        if (supabase) await supabase.auth.signOut()
        else setLocalUser(null)
      },
      listings: all.filter((l) => !paused.includes(l.id)),
      getListing: (id) => all.find((l) => l.id === id),
      wishlist,
      toggleWish,
      trips: live ? liveTrips : localTrips,
      refreshTrips,
      addTrip: (t) => setLocalTrips((ts) => [t, ...ts]),
      cancelTrip: async (code) => {
        if (!supabase) {
          setLocalTrips((ts) => ts.filter((t) => t.code !== code))
          return null
        }
        const { error } = await supabase.rpc('cancel_booking', { p_code: code })
        if (error) return 'This trip can no longer be cancelled online. Please contact us.'
        await refreshTrips()
        return null
      },
      customListings,
      addListing: (l) => setCustom((ls) => [l, ...ls]),
      removeListing: (id) => setCustom((ls) => ls.filter((l) => l.id !== id)),
      paused,
      togglePaused: (id) =>
        setPaused((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])),
    }
  }, [
    ready, user, liveUser, liveWish, localWish, liveTrips, localTrips, customListings, paused, refreshTrips,
    setLocalUser, setLocalWish, setLocalTrips, setCustom, setPaused,
  ])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside StoreProvider')
  return s
}

/** Starts a real Stripe checkout for a booking. Resolves to the Stripe URL, or throws with a readable message. */
export async function startCheckout(body: {
  listingId: string
  checkIn: string
  checkOut: string
  guests: number
  pay: 'full' | 'split'
  name: string
  email: string
  phone: string
  message: string
}): Promise<string> {
  if (!supabase) throw new Error('Payments are not connected yet.')
  const { data, error } = await supabase.functions.invoke('create-checkout', { body })
  if (error) {
    let msg = 'Payment could not be started. Please try again.'
    try {
      const j = await (error as { context?: Response }).context?.json()
      if (j?.error) msg = j.error
    } catch {
      /* keep default */
    }
    throw new Error(msg)
  }
  return (data as { url: string }).url
}
