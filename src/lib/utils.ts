export const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const toISO = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const fromISO = (s?: string | null) => {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const nightsBetween = (a?: string | null, b?: string | null) => {
  const s = fromISO(a)
  const e = fromISO(b)
  if (!s || !e) return 0
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000))
}

export const fmtDate = (s?: string | null, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) => {
  const d = fromISO(s)
  return d ? d.toLocaleDateString('en-US', opts) : ''
}

/** Deterministic set of unavailable dates for a listing, used to make calendars feel real. */
export function blockedDates(listingId: string): Set<string> {
  let h = 0
  for (const c of listingId) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const out = new Set<string>()
  const today = startOfDay(new Date())
  for (let i = 0; i < 6; i++) {
    h = (h * 1103515245 + 12345) >>> 0
    const start = 5 + (h % 110)
    const len = 2 + (h % 4)
    for (let j = 0; j < len; j++) out.add(toISO(addDays(today, start + j)))
  }
  return out
}

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

export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ')
