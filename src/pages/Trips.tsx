import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { Img } from '../components/ui'
import { useStore } from '../lib/store'
import { fmtDate, money, nightsBetween, toISO } from '../lib/utils'
import { api, errorText } from '../lib/api'
import type { Trip } from '../lib/store'

/** Guests who booked without an account can find a booking with its code and email. */
function FindBooking() {
  const { rememberTrip } = useStore()
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      const { trip } = await api<{ trip: Trip }>(`/api/bookings/lookup?code=${encodeURIComponent(code.trim())}&email=${encodeURIComponent(email.trim())}`)
      if (trip.status === 'cancelled') setMsg('This booking was cancelled.')
      else rememberTrip(trip)
    } catch (err) {
      setMsg(errorText(err))
    } finally {
      setBusy(false)
    }
  }
  return (
    <form className="panel find-booking" onSubmit={submit}>
      <h2 className="subhead">Find a booking</h2>
      <p className="muted small">Booked without an account? Enter your confirmation code and the email you used.</p>
      <div className="row gap-sm wrap">
        <input aria-label="Confirmation code" placeholder="HVXXXXXX" value={code} onChange={(e) => setCode(e.target.value)} required />
        <input aria-label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button className="btn btn--ghost" disabled={busy}>{busy ? 'Searching…' : 'Find booking'}</button>
      </div>
      {msg && <p className="field__err" role="alert">{msg}</p>}
    </form>
  )
}

export default function Trips() {
  const { trips, getListing, cancelTrip, reloadTrip, online, user } = useStore()
  const [params] = useSearchParams()
  const confirmed = params.get('confirmed')
  const justBooked = trips.find((t) => t.code === confirmed)
  const waiting = justBooked?.status === 'pending'

  // Stripe sends the guest back before its webhook has always landed: re-check for up to ~30 s.
  useEffect(() => {
    if (!waiting || !justBooked) return
    let n = 0
    const timer = setInterval(() => {
      n += 1
      reloadTrip(justBooked.code, justBooked.email).catch(() => null)
      if (n >= 15) clearInterval(timer)
    }, 2000)
    return () => clearInterval(timer)
  }, [waiting, justBooked, reloadTrip])

  const cancel = async (code: string) => {
    if (!confirm('Cancel this reservation?')) return
    try {
      const refunded = await cancelTrip(code)
      if (refunded > 0) alert(`Cancelled. ${money(refunded)} is on its way back to your card (allow 5–10 days).`)
    } catch (e) {
      alert(errorText(e))
    }
  }

  const today = toISO(new Date())
  const upcoming = trips.filter((t) => t.checkOut >= today)
  const past = trips.filter((t) => t.checkOut < today)

  return (
    <div className="container page">
      {waiting && (
        <div className="confirm-banner">
          <span className="spinner" />
          <div>
            <h2>Confirming your payment…</h2>
            <p>This takes a few seconds. Your confirmation code is <strong>{justBooked.code}</strong>.</p>
          </div>
        </div>
      )}
      {justBooked && !waiting && (
        <div className="confirm-banner">
          <span className="confirm-banner__icon"><Icon name="check" size={26} strokeWidth={2} /></span>
          <div>
            <h2>{justBooked.status === 'confirmed' ? 'You’re going!' : 'Request sent'}</h2>
            <p>
              {justBooked.status === 'confirmed'
                ? `Your reservation is confirmed. A receipt is on its way to ${justBooked.email}.`
                : justBooked.paid
                  ? 'The host usually responds within a few hours. If they decline, you get a full refund.'
                  : 'The host usually responds within a few hours. You won’t be charged until they accept.'}{' '}
              Confirmation code <strong>{justBooked.code}</strong>.
            </p>
          </div>
        </div>
      )}

      <h1 className="page__title">Your <em>trips</em></h1>

      {trips.length === 0 ? (
        <div className="empty">
          <Icon name="calendar" size={36} strokeWidth={1.2} />
          <h3>No trips booked… yet</h3>
          <p className="muted">Time to dust off your bags and start planning your next escape.</p>
          <Link to="/stays" className="btn btn--primary">Start exploring</Link>
        </div>
      ) : (
        <>
          {[['Upcoming', upcoming], ['Past', past]].map(([label, list]) =>
            (list as typeof trips).length ? (
              <section key={label as string} className="mb-lg">
                <h2 className="subhead">{label as string}</h2>
                <div className="trips">
                  {(list as typeof trips).map((t) => {
                    const l = getListing(t.listingId)
                    if (!l) return null
                    return (
                      <article key={t.code} className="trip">
                        <Link to={`/stays/${l.id}`} className="trip__img"><Img src={l.images[0]} alt="" /></Link>
                        <div className="trip__body">
                          <span className={`status status--${t.status}`}>{t.status === 'confirmed' ? 'Confirmed' : t.status === 'pending' ? 'Payment pending' : 'Awaiting host'}</span>
                          <h3><Link to={`/stays/${l.id}`}>{l.title}</Link></h3>
                          <p className="muted">{l.city}, {l.country}</p>
                          <p>
                            {fmtDate(t.checkIn)} – {fmtDate(t.checkOut, { month: 'short', day: 'numeric', year: 'numeric' })} · {nightsBetween(t.checkIn, t.checkOut)} nights · {t.guests} guests
                          </p>
                          <div className="trip__foot">
                            <span><strong>{money(t.total)}</strong> <span className="muted">· {t.code}</span></span>
                            <button className="link-btn danger" onClick={() => cancel(t.code)}>Cancel</button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ) : null,
          )}
        </>
      )}

      {online && !user && <FindBooking />}
    </div>
  )
}
