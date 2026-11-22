/**
 * Heaven API on Cloudflare Workers.
 *
 * - Static site: everything that is not /api/* or /media/* is served from ./dist by the ASSETS binding.
 * - D1 (DB): accounts, sessions, host listings, bookings, wishlist, messages.
 * - R2 (MEDIA): photos hosts upload in the "List your home" wizard, served back from /media/<key>.
 */
import { LISTINGS, type Listing } from '../src/data/listings'
import { priceBreakdown } from '../src/lib/utils'

export interface Env {
  DB: D1Database
  MEDIA: R2Bucket
  ASSETS: Fetcher
  /** Secrets. Without STRIPE_SECRET_KEY, bookings are saved without payment (demo). */
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
}

const SESSION_COOKIE = 'heaven_session'
const SESSION_DAYS = 30
/** How long unpaid dates stay held while the guest is on Stripe Checkout (Stripe's minimum session life is 30 min). */
const HOLD_MINUTES = 30
const holdCutoff = () => new Date(Date.now() - HOLD_MINUTES * 60000).toISOString()
/** SQL: bookings that block dates. Bind holdCutoff() for the "?". */
const BLOCKING = "(status IN ('confirmed', 'requested') OR (status = 'pending' AND created_at > ?))"
const MAX_UPLOAD = 8 * 1024 * 1024
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  })

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    try {
      if (url.pathname.startsWith('/media/')) return await media(url, env)
      if (url.pathname.startsWith('/api/')) return await api(req, url, env)
      return env.ASSETS.fetch(req)
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message }, e.status)
      console.error(e)
      return json({ error: 'Something went wrong. Please try again.' }, 500)
    }
  },
} satisfies ExportedHandler<Env>

/* ------------------------------------------------------------------ routes */

async function api(req: Request, url: URL, env: Env): Promise<Response> {
  const path = url.pathname.replace(/\/+$/, '')
  const method = req.method
  if (method !== 'GET' && method !== 'HEAD') checkOrigin(req, url)

  if (path === '/api/health') return json({ ok: true })

  // Auth
  if (path === '/api/auth/signup' && method === 'POST') return signup(req, env)
  if (path === '/api/auth/signin' && method === 'POST') return signin(req, env)
  if (path === '/api/auth/signout' && method === 'POST') return signout(req, env)
  if (path === '/api/me' && method === 'GET') return me(req, env)

  // Listings
  if (path === '/api/listings' && method === 'GET') return publicListings(env)
  if (path === '/api/listings' && method === 'POST') return createListing(req, env)
  let m = path.match(/^\/api\/listings\/([\w-]+)$/)
  if (m && method === 'PATCH') return updateListing(req, env, m[1])
  if (m && method === 'DELETE') return deleteListing(req, env, m[1])
  m = path.match(/^\/api\/listings\/([\w-]+)\/booked$/)
  if (m && method === 'GET') return bookedNights(env, m[1])

  // Bookings
  if (path === '/api/bookings' && method === 'POST') return createBooking(req, env)
  if (path === '/api/bookings/lookup' && method === 'GET') return lookupBooking(url, env)
  m = path.match(/^\/api\/bookings\/([\w-]+)$/)
  if (m && method === 'DELETE') return cancelBooking(req, env, m[1])
  if (path === '/api/host/reservations' && method === 'GET') return hostReservations(req, env)
  if (path === '/api/stripe/webhook' && method === 'POST') return stripeWebhook(req, env)

  // Wishlist
  m = path.match(/^\/api\/wishlist\/([\w-]+)$/)
  if (m && method === 'PUT') return wish(req, env, m[1], true)
  if (m && method === 'DELETE') return wish(req, env, m[1], false)

  // Messages and uploads
  if (path === '/api/messages' && method === 'POST') return createMessage(req, env)
  if (path === '/api/uploads' && method === 'POST') return upload(req, env)

  throw new HttpError(404, 'Not found')
}

/* -------------------------------------------------------------------- auth */

interface UserRow {
  id: string
  email: string
  name: string
  password_hash: string
  created_at: string
}

const publicUser = (u: UserRow) => ({ id: u.id, name: u.name, email: u.email, since: u.created_at })

async function signup(req: Request, env: Env) {
  const body = await readJson<{ name?: string; email?: string; password?: string }>(req)
  const name = str(body.name, 'name', 1, 80)
  const email = emailOf(body.email)
  const password = str(body.password, 'password', 8, 200)
  const exists = await env.DB.prepare('SELECT 1 FROM users WHERE email = ?').bind(email).first()
  if (exists) throw new HttpError(409, 'An account with this email already exists. Try signing in.')
  const id = crypto.randomUUID()
  await env.DB.prepare('INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)')
    .bind(id, email, name, await hashPassword(password))
    .run()
  // Link bookings made before the account existed.
  await env.DB.prepare('UPDATE bookings SET user_id = ? WHERE user_id IS NULL AND email = ?').bind(id, email).run()
  const user = (await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>())!
  return json({ user: publicUser(user) }, 201, { 'set-cookie': await startSession(env, id) })
}

async function signin(req: Request, env: Env) {
  const body = await readJson<{ email?: string; password?: string }>(req)
  const email = emailOf(body.email)
  const password = str(body.password, 'password', 1, 200)
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<UserRow>()
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new HttpError(401, 'That email and password don’t match.')
  }
  return json({ user: publicUser(user) }, 200, { 'set-cookie': await startSession(env, user.id) })
}

async function signout(req: Request, env: Env) {
  const token = cookie(req, SESSION_COOKIE)
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run()
  return json({ ok: true }, 200, { 'set-cookie': `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` })
}

async function me(req: Request, env: Env) {
  const user = await currentUser(req, env)
  const payments = !!env.STRIPE_SECRET_KEY
  if (!user) return json({ user: null, payments })
  const [wishlist, trips, listings] = await Promise.all([
    env.DB.prepare('SELECT listing_id FROM wishlist WHERE user_id = ? ORDER BY created_at DESC').bind(user.id).all<{ listing_id: string }>(),
    env.DB.prepare(`SELECT * FROM bookings WHERE user_id = ? AND ${BLOCKING} ORDER BY created_at DESC`).bind(user.id, holdCutoff()).all<BookingRow>(),
    env.DB.prepare('SELECT data, paused FROM listings WHERE owner_id = ? ORDER BY created_at DESC').bind(user.id).all<{ data: string; paused: number }>(),
  ])
  return json({
    user: publicUser(user),
    payments,
    wishlist: wishlist.results.map((r) => r.listing_id),
    trips: trips.results.map(trip),
    listings: listings.results.map((r) => JSON.parse(r.data)),
    paused: listings.results.filter((r) => r.paused).map((r) => (JSON.parse(r.data) as Listing).id),
  })
}

async function startSession(env: Env, userId: string) {
  const token = b64url(crypto.getRandomValues(new Uint8Array(32)))
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5)
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(await sha256(token), userId, expires.toISOString())
    .run()
  // Opportunistic clean-up of expired sessions.
  await env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(new Date().toISOString()).run()
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`
}

async function currentUser(req: Request, env: Env): Promise<UserRow | null> {
  const token = cookie(req, SESSION_COOKIE)
  if (!token) return null
  return env.DB.prepare(
    'SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?',
  )
    .bind(await sha256(token), new Date().toISOString())
    .first<UserRow>()
}

async function requireUser(req: Request, env: Env) {
  const user = await currentUser(req, env)
  if (!user) throw new HttpError(401, 'Please sign in first.')
  return user
}

/* ---------------------------------------------------------------- listings */

const DEMO_IDS = new Set(LISTINGS.map((l) => l.id))

async function findListing(env: Env, id: string): Promise<{ listing: Listing; ownerId: string | null; paused: boolean } | null> {
  const demo = LISTINGS.find((l) => l.id === id)
  if (demo) return { listing: demo, ownerId: null, paused: false }
  const row = await env.DB.prepare('SELECT data, owner_id, paused FROM listings WHERE id = ?').bind(id).first<{ data: string; owner_id: string; paused: number }>()
  return row ? { listing: JSON.parse(row.data), ownerId: row.owner_id, paused: !!row.paused } : null
}

async function publicListings(env: Env) {
  const rows = await env.DB.prepare('SELECT data FROM listings WHERE paused = 0 ORDER BY created_at DESC LIMIT 500').all<{ data: string }>()
  return json({ listings: rows.results.map((r) => JSON.parse(r.data)) }, 200, { 'cache-control': 'public, max-age=30' })
}

async function createListing(req: Request, env: Env) {
  const user = await requireUser(req, env)
  const { listing: l } = await readJson<{ listing?: Partial<Listing> }>(req)
  if (!l) throw new HttpError(400, 'Missing listing')
  const title = str(l.title, 'title', 3, 80)
  const city = str(l.city, 'city', 2, 60)
  const country = str(l.country, 'country', 2, 60)
  const images = Array.isArray(l.images) ? l.images.filter((s): s is string => typeof s === 'string' && isAllowedImage(s)).slice(0, 10) : []
  if (!images.length) throw new HttpError(400, 'Add at least one photo')
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'home'
  const id = `${slug}-${Date.now().toString(36)}`
  const listing: Listing = {
    id,
    title,
    tagline: optStr(l.tagline, 120) || `${l.type ?? 'Home'} in ${city}`,
    city,
    country,
    category: (l.category ?? 'City') as Listing['category'],
    type: (l.type ?? 'Villa') as Listing['type'],
    price: int(l.price, 50, 100000),
    cleaningFee: int(l.cleaningFee ?? 0, 0, 10000),
    rating: 5,
    reviewCount: 0,
    guests: int(l.guests, 1, 30),
    bedrooms: int(l.bedrooms, 1, 30),
    beds: int(l.beds, 1, 30),
    baths: int(l.baths, 1, 30),
    images,
    amenities: Array.isArray(l.amenities) ? l.amenities.filter((a): a is string => typeof a === 'string').slice(0, 40) : [],
    hostId: 'h1', // Public host profile shown on the listing; the real owner is stored in owner_id.
    instantBook: !!l.instantBook,
    description: optStr(l.description, 4000) || `A beautiful home in ${city}, ${country}.`,
    highlights: [
      { title: 'New on the collection', text: 'Be among the first guests to stay.' },
      { title: 'Self check-in', text: 'Arrive whenever suits you.' },
      { title: 'Concierge on call', text: 'Our team is a message away.' },
    ],
    custom: true,
  }
  await env.DB.prepare('INSERT INTO listings (id, owner_id, data) VALUES (?, ?, ?)').bind(id, user.id, JSON.stringify(listing)).run()
  return json({ listing }, 201)
}

async function updateListing(req: Request, env: Env, id: string) {
  const user = await requireUser(req, env)
  const { paused } = await readJson<{ paused?: boolean }>(req)
  const r = await env.DB.prepare('UPDATE listings SET paused = ? WHERE id = ? AND owner_id = ?').bind(paused ? 1 : 0, id, user.id).run()
  if (!r.meta.changes) throw new HttpError(404, 'Listing not found')
  return json({ ok: true })
}

async function deleteListing(req: Request, env: Env, id: string) {
  const user = await requireUser(req, env)
  const row = await env.DB.prepare('SELECT data FROM listings WHERE id = ? AND owner_id = ?').bind(id, user.id).first<{ data: string }>()
  if (!row) throw new HttpError(404, 'Listing not found')
  const keys = (JSON.parse(row.data) as Listing).images.filter((s) => s.startsWith('/media/')).map((s) => s.slice(7))
  if (keys.length) {
    await env.MEDIA.delete(keys)
    await env.DB.prepare(`DELETE FROM uploads WHERE user_id = ? AND key IN (${keys.map(() => '?').join(',')})`).bind(user.id, ...keys).run()
  }
  await env.DB.prepare('DELETE FROM listings WHERE id = ?').bind(id).run()
  return json({ ok: true })
}

async function bookedNights(env: Env, id: string) {
  const rows = await env.DB.prepare(
    `SELECT check_in, check_out FROM bookings WHERE listing_id = ? AND ${BLOCKING} AND check_out >= ?`,
  )
    .bind(id, holdCutoff(), new Date().toISOString().slice(0, 10))
    .all<{ check_in: string; check_out: string }>()
  const nights: string[] = []
  for (const r of rows.results) for (let d = r.check_in; d < r.check_out; d = nextDay(d)) nights.push(d)
  return json({ nights })
}

const isAllowedImage = (s: string) => s.startsWith('/media/') || s.startsWith('https://images.unsplash.com/')

/* ---------------------------------------------------------------- bookings */

interface BookingRow {
  code: string
  listing_id: string
  user_id: string | null
  check_in: string
  check_out: string
  guests: number
  total: number
  guest_name: string
  email: string
  status: 'pending' | 'confirmed' | 'requested' | 'cancelled' | 'expired'
  created_at: string
  amount_paid?: number
  amount_due?: number
  stripe_payment_intent?: string | null
  refunded?: number
}

const trip = (b: BookingRow) => ({
  code: b.code,
  listingId: b.listing_id,
  checkIn: b.check_in,
  checkOut: b.check_out,
  guests: b.guests,
  total: b.total,
  guestName: b.guest_name,
  email: b.email,
  status: b.status,
  createdAt: b.created_at,
  paid: b.amount_paid ?? 0,
})

async function createBooking(req: Request, env: Env) {
  const user = await currentUser(req, env)
  const b = await readJson<{ listingId?: string; checkIn?: string; checkOut?: string; guests?: number; guestName?: string; email?: string; phone?: string; message?: string; pay?: string }>(req)
  const found = await findListing(env, str(b.listingId, 'listing', 1, 120))
  if (!found || found.paused) throw new HttpError(404, 'This home is not available.')
  const { listing } = found
  const checkIn = isoDate(b.checkIn, 'check-in')
  const checkOut = isoDate(b.checkOut, 'check-out')
  const today = new Date(Date.now() - 864e5).toISOString().slice(0, 10) // one day of slack for time zones
  if (checkIn < today) throw new HttpError(400, 'Check-in is in the past.')
  const nights = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 864e5)
  if (nights < 1 || nights > 90) throw new HttpError(400, 'Stays can be 1 to 90 nights.')
  const guests = int(b.guests, 1, listing.guests)
  const clash = await env.DB.prepare(
    `SELECT 1 FROM bookings WHERE listing_id = ? AND ${BLOCKING} AND check_in < ? AND check_out > ? LIMIT 1`,
  )
    .bind(listing.id, holdCutoff(), checkOut, checkIn)
    .first()
  if (clash) throw new HttpError(409, 'Those dates were just booked. Please pick other dates.')

  const total = priceBreakdown(listing.price, nights, listing.cleaningFee).total
  const code = 'HV' + b64url(crypto.getRandomValues(new Uint8Array(6))).replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()
  const guestName = str(b.guestName, 'name', 2, 120)
  const email = emailOf(b.email)
  const paying = !!env.STRIPE_SECRET_KEY
  const due = b.pay === 'split' ? Math.round(total / 2) : total
  const status = paying ? 'pending' : listing.instantBook ? 'confirmed' : 'requested'
  await env.DB.prepare(
    `INSERT INTO bookings (code, listing_id, user_id, check_in, check_out, guests, total, guest_name, email, phone, message, status${paying ? ', amount_due' : ''})
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?${paying ? ', ?' : ''})`,
  )
    .bind(code, listing.id, user?.id ?? null, checkIn, checkOut, guests, total, guestName, email, optStr(b.phone, 40), optStr(b.message, 2000), status, ...(paying ? [due] : []))
    .run()
  const row = (await env.DB.prepare('SELECT * FROM bookings WHERE code = ?').bind(code).first<BookingRow>())!
  if (!paying) return json({ trip: trip(row) }, 201)

  // Hand the guest to Stripe Checkout. The amount comes from the server-side price above.
  const site = new URL(req.url).origin
  const back = `${site}/book/${encodeURIComponent(listing.id)}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
  const form = new URLSearchParams({
    mode: 'payment',
    customer_email: email,
    client_reference_id: code,
    'metadata[booking]': code,
    'payment_intent_data[metadata][booking]': code,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(due * 100),
    'line_items[0][price_data][product_data][name]': `${listing.title}, ${listing.city}`,
    'line_items[0][price_data][product_data][description]':
      `${checkIn} to ${checkOut}, ${nights} night${nights > 1 ? 's' : ''}, ${guests} guest${guests > 1 ? 's' : ''}` +
      (due < total ? `. 50% deposit of ${total} USD total` : ''),
    success_url: `${site}/trips?confirmed=${code}`,
    cancel_url: back,
    expires_at: String(Math.floor(Date.now() / 1000) + HOLD_MINUTES * 60 + 60),
  })
  if (due < total) form.set('payment_intent_data[setup_future_usage]', 'off_session')
  let session: { id: string; url: string }
  try {
    session = await stripe<{ id: string; url: string }>(env, 'checkout/sessions', form)
  } catch (e) {
    await env.DB.prepare("UPDATE bookings SET status = 'expired' WHERE code = ?").bind(code).run()
    throw e
  }
  await env.DB.prepare('UPDATE bookings SET stripe_session_id = ? WHERE code = ?').bind(session.id, code).run()
  return json({ trip: trip(row), checkoutUrl: session.url }, 201)
}

async function lookupBooking(url: URL, env: Env) {
  const code = (url.searchParams.get('code') ?? '').trim().toUpperCase()
  const email = emailOf(url.searchParams.get('email') ?? '')
  const row = await env.DB.prepare('SELECT * FROM bookings WHERE code = ? AND email = ?').bind(code, email).first<BookingRow>()
  if (!row) throw new HttpError(404, 'We couldn’t find a booking with that code and email.')
  return json({ trip: trip(row) })
}

async function cancelBooking(req: Request, env: Env, code: string) {
  const user = await currentUser(req, env)
  const body = await readJson<{ email?: string }>(req).catch(() => ({}) as { email?: string })
  const row = await env.DB.prepare('SELECT * FROM bookings WHERE code = ?').bind(code.toUpperCase()).first<BookingRow>()
  const allowed = row && ((user && row.user_id === user.id) || (body.email && body.email.trim().toLowerCase() === row.email))
  if (!row || !allowed) throw new HttpError(404, 'Booking not found')
  if (row.status === 'cancelled' || row.status === 'expired') return json({ ok: true, refunded: 0 })
  // Refund what the cancellation policy allows: everything 30+ days out, half the total 7+ days out.
  const daysOut = (Date.parse(row.check_in) - Date.now()) / 864e5
  const allowance = daysOut >= 30 ? row.total : daysOut >= 7 ? Math.round(row.total / 2) : 0
  const refund = Math.min(row.amount_paid ?? 0, allowance)
  if (refund > 0 && row.stripe_payment_intent) {
    await stripe(env, 'refunds', new URLSearchParams({
      payment_intent: row.stripe_payment_intent,
      amount: String(refund * 100),
      'metadata[booking]': row.code,
    }))
  }
  await env.DB.prepare("UPDATE bookings SET status = 'cancelled', refunded = ? WHERE code = ?").bind(refund, row.code).run()
  return json({ ok: true, refunded: refund })
}

async function hostReservations(req: Request, env: Env) {
  const user = await requireUser(req, env)
  const rows = await env.DB.prepare(
    `SELECT b.* FROM bookings b JOIN listings l ON l.id = b.listing_id
     WHERE l.owner_id = ? AND b.status IN ('confirmed', 'requested') ORDER BY b.check_in`,
  )
    .bind(user.id)
    .all<BookingRow>()
  return json({ reservations: rows.results.map(trip) })
}

/* ---------------------------------------------------------------- wishlist */

async function wish(req: Request, env: Env, listingId: string, on: boolean) {
  const user = await requireUser(req, env)
  if (on) {
    if (!DEMO_IDS.has(listingId) && !(await findListing(env, listingId))) throw new HttpError(404, 'Listing not found')
    await env.DB.prepare('INSERT OR IGNORE INTO wishlist (user_id, listing_id) VALUES (?, ?)').bind(user.id, listingId).run()
  } else {
    await env.DB.prepare('DELETE FROM wishlist WHERE user_id = ? AND listing_id = ?').bind(user.id, listingId).run()
  }
  return json({ ok: true })
}

/* ---------------------------------------------------------------- messages */

async function createMessage(req: Request, env: Env) {
  const user = await currentUser(req, env)
  const m = await readJson<{ kind?: string; name?: string; email?: string; topic?: string; hostId?: string; body?: string }>(req)
  const kind = m.kind === 'host' ? 'host' : 'contact'
  await env.DB.prepare('INSERT INTO messages (kind, name, email, topic, host_id, body, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(kind, str(m.name, 'name', 1, 120), emailOf(m.email), optStr(m.topic, 80), optStr(m.hostId, 40), str(m.body, 'message', 1, 5000), user?.id ?? null)
    .run()
  return json({ ok: true }, 201)
}

/* ------------------------------------------------------------ photos (R2) */

async function upload(req: Request, env: Env) {
  const user = await requireUser(req, env)
  const type = (req.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  const ext = IMAGE_TYPES[type]
  if (!ext) throw new HttpError(415, 'Use a JPEG, PNG, WebP or AVIF photo.')
  const size = Number(req.headers.get('content-length') ?? 0)
  if (size > MAX_UPLOAD) throw new HttpError(413, 'Photos must be 8 MB or smaller.')
  const body = await req.arrayBuffer()
  if (!body.byteLength) throw new HttpError(400, 'Empty file')
  if (body.byteLength > MAX_UPLOAD) throw new HttpError(413, 'Photos must be 8 MB or smaller.')
  const key = `listings/${user.id}/${crypto.randomUUID()}.${ext}`
  await env.MEDIA.put(key, body, { httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' } })
  await env.DB.prepare('INSERT INTO uploads (key, user_id, content_type, size) VALUES (?, ?, ?, ?)').bind(key, user.id, type, body.byteLength).run()
  return json({ url: `/media/${key}` }, 201)
}

async function media(url: URL, env: Env) {
  const key = decodeURIComponent(url.pathname.slice('/media/'.length))
  if (!key || key.includes('..')) throw new HttpError(404, 'Not found')
  const obj = await env.MEDIA.get(key)
  if (!obj) return new Response('Not found', { status: 404 })
  const headers = new Headers()
  obj.writeHttpMetadata(headers)
  headers.set('etag', obj.httpEtag)
  headers.set('x-content-type-options', 'nosniff')
  if (!headers.has('cache-control')) headers.set('cache-control', 'public, max-age=31536000, immutable')
  return new Response(obj.body, { headers })
}

/* ----------------------------------------------------------------- stripe */

async function stripe<T = unknown>(env: Env, path: string, body: URLSearchParams): Promise<T> {
  const down = new HttpError(502, 'The payment service is not responding. Please try again.')
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'content-type': 'application/x-www-form-urlencoded' },
    body,
  }).catch((e) => {
    console.error('stripe', path, e)
    throw down
  })
  const data = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } }
  if (!res.ok) {
    console.error('stripe', path, data.error?.message)
    throw down
  }
  return data
}

/** Stripe calls this after Checkout. It is authenticated by the Stripe-Signature header, not cookies. */
async function stripeWebhook(req: Request, env: Env) {
  if (!env.STRIPE_WEBHOOK_SECRET) throw new HttpError(503, 'Webhook not configured')
  const payload = await req.text()
  if (!(await validStripeSignature(payload, req.headers.get('stripe-signature') ?? '', env.STRIPE_WEBHOOK_SECRET))) {
    throw new HttpError(400, 'Bad signature')
  }
  const event = JSON.parse(payload) as {
    type: string
    data: { object: { id: string; payment_status?: string; payment_intent?: string; amount_total?: number; metadata?: { booking?: string } } }
  }
  const s = event.data.object
  const code = s.metadata?.booking
  if (!code) return json({ ok: true })

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    if (s.payment_status !== 'paid') return json({ ok: true })
    const row = await env.DB.prepare('SELECT listing_id, status FROM bookings WHERE code = ?').bind(code).first<{ listing_id: string; status: string }>()
    if (!row) return json({ ok: true })
    if (row.status === 'cancelled' && s.payment_intent) {
      // The guest cancelled while the payment page was still open: give the money back.
      await stripe(env, 'refunds', new URLSearchParams({ payment_intent: s.payment_intent, 'metadata[booking]': code }))
      await env.DB.prepare('UPDATE bookings SET amount_paid = ?, refunded = ?, stripe_payment_intent = ? WHERE code = ?')
        .bind(Math.round((s.amount_total ?? 0) / 100), Math.round((s.amount_total ?? 0) / 100), s.payment_intent, code)
        .run()
      return json({ ok: true })
    }
    const found = await findListing(env, row.listing_id)
    const status = found && !found.listing.instantBook ? 'requested' : 'confirmed'
    // 'expired' too: a guest can pay at the last second, after the hold lapsed. Keep the money and the booking.
    await env.DB.prepare(
      `UPDATE bookings SET status = ?, amount_paid = ?, stripe_payment_intent = ?
       WHERE code = ? AND status IN ('pending', 'expired')`,
    )
      .bind(status, Math.round((s.amount_total ?? 0) / 100), s.payment_intent ?? null, code)
      .run()
  } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    await env.DB.prepare("UPDATE bookings SET status = 'expired' WHERE code = ? AND status = 'pending'").bind(code).run()
  }
  return json({ ok: true })
}

async function validStripeSignature(payload: string, header: string, secret: string) {
  const parts = header.split(',')
  const t = Number(parts.find((p) => p.startsWith('t='))?.slice(2))
  const sigs = parts.filter((p) => p.startsWith('v1=')).map((p) => p.slice(3))
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > 300) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`)))
  const hex = [...mac].map((b) => b.toString(16).padStart(2, '0')).join('')
  return sigs.some((sig) => sig.length === hex.length && [...sig].reduce((d, c, i) => d | (c.charCodeAt(0) ^ hex.charCodeAt(i)), 0) === 0)
}

/* ----------------------------------------------------------------- helpers */

/** Reject cross-site writes: the browser always sends Origin on POST/PUT/PATCH/DELETE. */
function checkOrigin(req: Request, url: URL) {
  const origin = req.headers.get('origin')
  if (origin && origin !== url.origin) throw new HttpError(403, 'Cross-site request blocked')
}

async function readJson<T>(req: Request): Promise<T> {
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) throw new HttpError(415, 'Send JSON')
  try {
    return (await req.json()) as T
  } catch {
    throw new HttpError(400, 'Invalid JSON')
  }
}

function str(v: unknown, field: string, min: number, max: number): string {
  const s = typeof v === 'string' ? v.trim() : ''
  if (s.length < min) throw new HttpError(400, `Please fill in ${field}.`)
  return s.slice(0, max)
}
const optStr = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '') || null

function int(v: unknown, min: number, max: number): number {
  const n = Math.round(Number(v))
  if (!Number.isFinite(n) || n < min || n > max) throw new HttpError(400, `Value must be between ${min} and ${max}.`)
  return n
}

function emailOf(v: unknown): string {
  const s = typeof v === 'string' ? v.trim().toLowerCase() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || s.length > 200) throw new HttpError(400, 'Enter a valid email.')
  return s
}

function isoDate(v: unknown, field: string): string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) {
    throw new HttpError(400, `Invalid ${field} date.`)
  }
  return v
}

const nextDay = (iso: string) => new Date(Date.parse(iso) + 864e5).toISOString().slice(0, 10)

function cookie(req: Request, name: string) {
  const raw = req.headers.get('cookie') ?? ''
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return null
}

function b64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

async function sha256(s: string) {
  return b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))))
}

// PBKDF2-SHA256; 100k iterations is the Workers runtime maximum.
const PBKDF2_ITER = 100_000

async function pbkdf2(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256))
}

async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return `pbkdf2$${PBKDF2_ITER}$${b64url(salt)}$${b64url(await pbkdf2(password, salt, PBKDF2_ITER))}`
}

async function verifyPassword(password: string, stored: string) {
  const [scheme, iter, salt, hash] = stored.split('$')
  if (scheme !== 'pbkdf2') return false
  const got = await pbkdf2(password, fromB64url(salt), Number(iter))
  const want = fromB64url(hash)
  if (got.length !== want.length) return false
  let diff = 0
  for (let i = 0; i < got.length; i++) diff |= got[i] ^ want[i]
  return diff === 0
}
