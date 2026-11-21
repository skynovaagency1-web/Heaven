// Stripe webhook: marks bookings paid or expired. Deploy with JWT verification off;
// requests are authenticated by the Stripe signature instead.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
const TOLERANCE_S = 300

async function verify(payload: string, header: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]))
  const t = Number(parts.t)
  const sigs = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3))
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > TOLERANCE_S) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`))
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return sigs.some((s) => s.length === hex.length && [...s].reduce((d, c, i) => d | (c.charCodeAt(0) ^ hex.charCodeAt(i)), 0) === 0)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  if (!SECRET) return new Response('Webhook not configured', { status: 503 })
  const payload = await req.text()
  if (!(await verify(payload, req.headers.get('Stripe-Signature') ?? ''))) return new Response('Bad signature', { status: 400 })

  const event = JSON.parse(payload)
  const session = event.data?.object ?? {}
  const ref = session.metadata?.booking ?? session.client_reference_id
  if (!ref) return new Response('ok')

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    if (session.payment_status !== 'paid') return new Response('ok')
    const { data: b } = await admin.from('bookings').select('listing_id, status').eq('code', ref).maybeSingle()
    if (!b || b.status !== 'pending') return new Response('ok')
    const { data: l } = await admin.from('listings').select('instant_book').eq('id', b.listing_id).maybeSingle()
    await admin
      .from('bookings')
      .update({ status: l?.instant_book === false ? 'requested' : 'confirmed', stripe_payment_intent: session.payment_intent })
      .eq('code', ref)
      .eq('status', 'pending')
  } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    await admin.from('bookings').update({ status: 'expired' }).eq('code', ref).eq('status', 'pending')
  }
  return new Response('ok')
})
