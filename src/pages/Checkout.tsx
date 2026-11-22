import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { Img, Stars } from '../components/ui'
import { getHost } from '../data/listings'
import { useStore } from '../lib/store'
import { cx, fmtDate, money, nightsBetween, priceBreakdown } from '../lib/utils'
import NotFound from './NotFound'
import { errorText } from '../lib/api'

const fmtCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const fmtExp = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export default function Checkout() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { getListing, addTrip, online } = useStore()
  const listing = getListing(id)

  const checkIn = params.get('checkIn')
  const checkOut = params.get('checkOut')
  const guests = Number(params.get('guests') ?? 1)
  const nights = nightsBetween(checkIn, checkOut)

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', card: '', exp: '', cvc: '', zip: '' })
  const [pay, setPay] = useState<'full' | 'split'>('full')
  const [agree, setAgree] = useState(false)
  const [touched, setTouched] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [failure, setFailure] = useState('')

  if (!listing && online === null) return <div className="container page-narrow center muted">Loading…</div>
  if (!listing) return <NotFound />
  if (!checkIn || !checkOut || nights <= 0) {
    return (
      <div className="container page-narrow center">
        <h1>Choose your dates first</h1>
        <p className="muted">Pick check-in and check-out dates to continue to booking.</p>
        <Link to={`/stays/${listing.id}`} className="btn btn--primary mt">Back to {listing.title}</Link>
      </div>
    )
  }

  const host = getHost(listing.hostId)
  const price = priceBreakdown(listing.price, nights, listing.cleaningFee)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let v = e.target.value
    if (k === 'card') v = fmtCard(v)
    if (k === 'exp') v = fmtExp(v)
    if (k === 'cvc') v = v.replace(/\D/g, '').slice(0, 4)
    setForm({ ...form, [k]: v })
  }

  const errors: Partial<Record<keyof typeof form | 'agree', string>> = {}
  if (form.name.trim().length < 2) errors.name = 'Enter your full name'
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Enter a valid email'
  if (form.phone.replace(/\D/g, '').length < 7) errors.phone = 'Enter a phone number'
  if (form.card.replace(/\s/g, '').length < 15) errors.card = 'Enter a valid card number'
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.exp)) errors.exp = 'MM/YY'
  if (form.cvc.length < 3) errors.cvc = 'CVC'
  if (!listing.instantBook && form.message.trim().length < 10) errors.message = 'Introduce yourself to the host'
  if (!agree) errors.agree = 'Please accept the house rules and policy'
  const valid = Object.keys(errors).length === 0
  const err = (k: keyof typeof errors) => touched && errors[k] ? <span className="field__err">{errors[k]}</span> : null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    setProcessing(true)
    setFailure('')
    try {
      // Card details stay in the browser: payments are not wired up yet.
      const t = await addTrip({
        listingId: listing!.id,
        checkIn: checkIn!,
        checkOut: checkOut!,
        guests,
        total: price.total,
        guestName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
        instantBook: listing!.instantBook,
      })
      navigate(`/trips?confirmed=${t.code}`)
    } catch (err) {
      setFailure(errorText(err))
      setProcessing(false)
    }
  }

  return (
    <div className="container checkout">
      <Link to={`/stays/${listing.id}?${params}`} className="back-link">
        <Icon name="arrowLeft" size={16} /> Back to listing
      </Link>
      <h1 className="checkout__title">{listing.instantBook ? 'Confirm and pay' : 'Request to book'}</h1>

      <div className="checkout__grid">
        <form className="checkout__form" onSubmit={submit} noValidate>
          <section className="panel">
            <h2>Your trip</h2>
            <div className="trip-line">
              <div><strong>Dates</strong><span className="muted">{fmtDate(checkIn)} – {fmtDate(checkOut, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
              <Link to={`/stays/${listing.id}?${params}`} className="link-btn">Edit</Link>
            </div>
            <div className="trip-line">
              <div><strong>Guests</strong><span className="muted">{guests} guest{guests > 1 ? 's' : ''}</span></div>
              <Link to={`/stays/${listing.id}?${params}`} className="link-btn">Edit</Link>
            </div>
          </section>

          <section className="panel">
            <h2>Choose how to pay</h2>
            <label className={cx('radio-card', pay === 'full' && 'is-on')}>
              <input type="radio" name="pay" checked={pay === 'full'} onChange={() => setPay('full')} />
              <span><strong>Pay {money(price.total)} now</strong><small>Settle the full amount today.</small></span>
            </label>
            <label className={cx('radio-card', pay === 'split' && 'is-on')}>
              <input type="radio" name="pay" checked={pay === 'split'} onChange={() => setPay('split')} />
              <span>
                <strong>Pay {money(Math.round(price.total / 2))} now, the rest later</strong>
                <small>The balance is charged 14 days before check-in. No extra fees.</small>
              </span>
            </label>
          </section>

          <section className="panel">
            <h2>Guest details</h2>
            <div className="fields">
              <label className="field field--full">
                <span>Full name</span>
                <input value={form.name} onChange={set('name')} autoComplete="name" placeholder="As shown on your ID" />
                {err('name')}
              </label>
              <label className="field">
                <span>Email</span>
                <input type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
                {err('email')}
              </label>
              <label className="field">
                <span>Phone</span>
                <input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+1 555 000 0000" />
                {err('phone')}
              </label>
              <label className="field field--full">
                <span>Message to {host?.name.split(' ')[0] ?? 'your host'} {listing.instantBook && <em className="muted">(optional)</em>}</span>
                <textarea rows={3} value={form.message} onChange={set('message')} placeholder="Share who’s coming, the occasion, and your arrival time." />
                {err('message')}
              </label>
            </div>
          </section>

          <section className="panel">
            <h2>Payment <span className="secure"><Icon name="lock" size={14} /> Secure checkout</span></h2>
            <div className="fields">
              <label className="field field--full">
                <span>Card number</span>
                <div className="input-icon">
                  <Icon name="card" size={18} />
                  <input inputMode="numeric" value={form.card} onChange={set('card')} autoComplete="cc-number" placeholder="1234 5678 9012 3456" />
                </div>
                {err('card')}
              </label>
              <label className="field">
                <span>Expiry</span>
                <input inputMode="numeric" value={form.exp} onChange={set('exp')} autoComplete="cc-exp" placeholder="MM/YY" />
                {err('exp')}
              </label>
              <label className="field">
                <span>CVC</span>
                <input inputMode="numeric" value={form.cvc} onChange={set('cvc')} autoComplete="cc-csc" placeholder="123" />
                {err('cvc')}
              </label>
            </div>
            <p className="muted small">Demo checkout. No real payment is processed.</p>
          </section>

          <section className="panel">
            <h2>Cancellation policy</h2>
            <p className="muted">
              Free cancellation until {fmtDate(checkIn)} minus 30 days. After that, cancel up to 7 days before check-in for a 50% refund.
            </p>
            <label className="check mt">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span className="check__box"><Icon name="check" size={13} strokeWidth={2.4} /></span>
              I agree to the house rules, cancellation policy and guest terms.
            </label>
            {err('agree')}
          </section>

          {failure && <p className="field__err" role="alert">{failure}</p>}
          <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={processing}>
            {processing ? <span className="spinner" /> : <Icon name="lock" size={18} />}
            {processing ? 'Processing…' : listing.instantBook ? `Confirm and pay ${money(pay === 'full' ? price.total : Math.round(price.total / 2))}` : 'Send booking request'}
          </button>
          {touched && !valid && <p className="field__err center">Please fix the highlighted fields.</p>}
        </form>

        <aside className="summary">
          <div className="summary__card">
            <div className="summary__listing">
              <Img src={listing.images[0]} alt="" />
              <div>
                <span className="muted small">{listing.type} in {listing.city}</span>
                <strong>{listing.title}</strong>
                <Stars value={listing.rating} count={listing.reviewCount} small />
              </div>
            </div>
            <dl className="breakdown">
              <div><dt>{money(listing.price)} × {nights} nights</dt><dd>{money(price.base)}</dd></div>
              {price.discount > 0 && <div className="accent"><dt>Weekly stay discount</dt><dd>−{money(price.discount)}</dd></div>}
              <div><dt>Cleaning fee</dt><dd>{money(price.cleaning)}</dd></div>
              <div><dt>Service fee</dt><dd>{money(price.service)}</dd></div>
              <div><dt>Taxes</dt><dd>{money(price.taxes)}</dd></div>
              <div className="breakdown__total"><dt>Total (USD)</dt><dd>{money(price.total)}</dd></div>
              {pay === 'split' && <div className="small"><dt>Due today</dt><dd>{money(Math.round(price.total / 2))}</dd></div>}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
