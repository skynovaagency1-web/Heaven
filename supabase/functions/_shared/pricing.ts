// Keep in sync with priceBreakdown in src/lib/utils.ts.
export const SERVICE_FEE_RATE = 0.12
export const TAX_RATE = 0.08

export function priceBreakdown(nightly: number, nights: number, cleaning: number) {
  const base = nightly * nights
  const discount = nights >= 7 ? Math.round(base * 0.1) : 0
  const service = Math.round((base - discount) * SERVICE_FEE_RATE)
  const taxes = Math.round((base - discount + cleaning) * TAX_RATE)
  const total = base - discount + cleaning + service + taxes
  return { base, discount, cleaning, service, taxes, total }
}

export const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
