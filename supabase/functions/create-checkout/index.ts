// Creates a pending booking and a Stripe Checkout session for it.
// The price is computed here from the listings table; the browser only sends dates and guest details.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { cors, json, priceBreakdown } from '../_shared/pricing.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const SITE_URL = (Deno.env.get('SITE_URL') ?? 'https://heaven.skynovaagency.workers.dev').replace(/\/$/, '')
const HOLD_MINUTES = 30

const isDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const days = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000)
const code = () => 'HV' + crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!STRIPE_SECRET_KEY) return json({ error: 'Payments are not configured yet' }, 503)

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer /, '')
  const { data: auth } = await admin.auth.getUser(token)
  const user = auth?.user
  if (!user) return json({ error: 'Please sign in to book' }, 401)

  let b: Record<string, unknown>
  try {
    b = await req.json()
  } catch {
    return json({ error: 'Invalid request' }, 400)
  }
  const { listingId, checkIn, checkOut } = b
  const guests = Number(b.guests)
  const pay = b.pay === 'split' ? 'split' : 'full'
  const name = String(b.name ?? '').trim().slice(0, 120)
  const email = String(b.email ?? '').trim().slice(0, 200)
  const phone = String(b.phone ?? '').trim().slice(0, 40)
  const message = String(b.message ?? '').trim().slice(0, 2000)

  if (typeof listingId !== 'string' || !isDate(checkIn) || !isDate(checkOut)) return json({ error: 'Invalid dates' }, 400)
  const nights = days(checkIn, checkOut)
  const today = new Date().toISOString().slice(0, 10)
  if (checkIn < today || nights < 1 || nights > 60) return json({ error: 'Choose between 1 and 60 nights, starting today or later' }, 400)
  if (!Number.isInteger(guests) || guests < 1) return json({ error: 'Invalid number of guests' }, 400)
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Enter your name and email' }, 400)

  const { data: listing } = await admin.from('listings').select('*').eq('id', listingId).eq('active', true).maybeSingle()
  if (!listing) return json({ error: 'This home is not available' }, 404)
  if (guests > listing.max_guests) return json({ error: `This home sleeps up to ${listing.max_guests}` }, 400)

  // Dates are taken if they overlap a paid booking or another guest's checkout still in progress.
  const holdSince = new Date(Date.now() - HOLD_MINUTES * 60000).toISOString()
  const { data: clashes } = await admin
    .from('bookings')
    .select('code')
    .eq('listing_id', listingId)
    .lt('check_in', checkOut)
    .gt('check_out', checkIn)
    .or(`status.in.(confirmed,requested),and(status.eq.pending,created_at.gt.${holdSince})`)
    .limit(1)
  if (clashes?.length) return json({ error: 'Those dates were just booked. Please pick others.' }, 409)

  const price = priceBreakdown(listing.price, nights, listing.cleaning_fee)
  const due = pay === 'split' ? Math.round(price.total / 2) : price.total
  const ref = code()

  const { error: insErr } = await admin.from('bookings').insert({
    code: ref, user_id: user.id, listing_id: listingId, check_in: checkIn, check_out: checkOut,
    guests, guest_name: name, email, phone, message, total: price.total, amount_due: due, status: 'pending',
  })
  if (insErr) return json({ error: 'Could not start the booking' }, 500)

  const back = `${SITE_URL}/book/${encodeURIComponent(listingId)}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
  const form = new URLSearchParams({
    mode: 'payment',
    customer_email: email,
    client_reference_id: ref,
    'metadata[booking]': ref,
    'payment_intent_data[metadata][booking]': ref,
    'line_items[0][quantity]': '1',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][unit_amount]': String(due * 100),
    'line_items[0][price_data][product_data][name]': `${listing.title}, ${listing.city}`,
    'line_items[0][price_data][product_data][description]':
      `${checkIn} to ${checkOut} · ${nights} night${nights > 1 ? 's' : ''} · ${guests} guest${guests > 1 ? 's' : ''}` +
      (pay === 'split' ? ` · 50% deposit of ${price.total} USD` : ''),
    success_url: `${SITE_URL}/trips?confirmed=${ref}`,
    cancel_url: back,
    expires_at: String(Math.floor(Date.now() / 1000) + HOLD_MINUTES * 60),
  })
  if (pay === 'split') form.set('payment_intent_data[setup_future_usage]', 'off_session')

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  })
  const session = await res.json()
  if (!res.ok) {
    await admin.from('bookings').update({ status: 'expired' }).eq('code', ref)
    console.error('stripe', session?.error?.message)
    return json({ error: 'Payment could not be started' }, 502)
  }
  await admin.from('bookings').update({ stripe_session_id: session.id }).eq('code', ref)
  return json({ url: session.url, code: ref })
})
