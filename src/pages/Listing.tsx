import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import Calendar from '../components/Calendar'
import Popover from '../components/Popover'
import { Counter, Img, Stars } from '../components/ui'
import { getHost, reviewsFor } from '../data/listings'
import { useStore } from '../lib/store'
import { blockedDates, cx, fmtDate, money, nightsBetween, priceBreakdown } from '../lib/utils'
import NotFound from './NotFound'
import { api } from '../lib/api'

const AMENITY_ICONS: Record<string, string> = {
  'Private pool': 'wave',
  'Ocean view': 'wave',
  'Mountain view': 'mountain',
  'Hot tub': 'sparkle',
  Fireplace: 'sun',
  'Wi‑Fi': 'globe',
  Garden: 'leaf',
  'Free parking': 'key',
  'EV charger': 'bolt',
  Concierge: 'medal',
  'Private chef': 'sparkle',
  Workspace: 'home',
  'Home cinema': 'play',
}

export default function ListingPage() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { getListing, wishlist, toggleWish, online } = useStore()
  const listing = getListing(id)

  const [checkIn, setCheckIn] = useState<string | null>(params.get('checkIn'))
  const [checkOut, setCheckOut] = useState<string | null>(params.get('checkOut'))
  const [guests, setGuests] = useState(Math.max(1, Number(params.get('guests') ?? 2) || 2))
  const [datesOpen, setDatesOpen] = useState(false)
  const [allAmenities, setAllAmenities] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  // Demo blackout dates plus nights already booked in the database.
  const [bookedNights, setBookedNights] = useState<string[]>([])
  useEffect(() => {
    if (!online) return
    api<{ nights: string[] }>(`/api/listings/${id}/booked`).then((r) => setBookedNights(r.nights)).catch(() => null)
  }, [id, online])
  const blocked = useMemo(() => new Set([...blockedDates(id), ...bookedNights]), [id, bookedNights])

  useEffect(() => {
    const q = new URLSearchParams(params)
    checkIn ? q.set('checkIn', checkIn) : q.delete('checkIn')
    checkOut ? q.set('checkOut', checkOut) : q.delete('checkOut')
    q.set('guests', String(guests))
    if (q.toString() !== params.toString()) setParams(q, { replace: true })
  }, [checkIn, checkOut, guests]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (!listing) return
      const n = listing.images.length
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') setLightbox((i) => ((i ?? 0) + 1) % n)
      if (e.key === 'ArrowLeft') setLightbox((i) => ((i ?? 0) - 1 + n) % n)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, listing])

  if (!listing && online === null) return <div className="container page-narrow center muted">Loading…</div>
  if (!listing) return <NotFound />

  const host = getHost(listing.hostId)
  const reviews = reviewsFor(listing)
  const saved = wishlist.includes(listing.id)
  const nights = nightsBetween(checkIn, checkOut)
  const price = priceBreakdown(listing.price, nights, listing.cleaningFee)
  const shownAmenities = allAmenities ? listing.amenities : listing.amenities.slice(0, 8)

  function reserve() {
    if (!checkIn || !checkOut) {
      setDatesOpen(true)
      return
    }
    navigate(`/book/${listing!.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)
  }

  function share() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="container listing">
      <Link to={`/stays${params.toString() ? `?${params}` : ''}`} className="back-link">
        <Icon name="arrowLeft" size={16} /> Back to stays
      </Link>

      <div className="listing__head">
        <div>
          <span className="eyebrow">{listing.type} · {listing.category}</span>
          <h1>{listing.title}</h1>
          <p className="listing__sub">
            <Stars value={listing.rating} count={listing.reviewCount} />
            <span className="sep">·</span>
            {host?.superhost && (
              <>
                <span className="tag"><Icon name="medal" size={14} /> Superhost</span>
                <span className="sep">·</span>
              </>
            )}
            <span className="underline">{listing.city}, {listing.country}</span>
          </p>
        </div>
        <div className="row gap-sm">
          <button className="btn btn--ghost btn--sm" onClick={share}>
            <Icon name={copied ? 'check' : 'share'} size={16} /> {copied ? 'Link copied' : 'Share'}
          </button>
          <button className={cx('btn btn--ghost btn--sm', saved && 'is-saved')} onClick={() => toggleWish(listing.id)}>
            <Icon name="heart" size={16} filled={saved} /> {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="gallery">
        {listing.images.slice(0, 5).map((src, i) => (
          <button key={i} className={cx('gallery__item', i === 0 && 'gallery__item--main')} onClick={() => setLightbox(i)} aria-label={`Open photo ${i + 1}`}>
            <Img src={src} alt={`${listing.title} photo ${i + 1}`} />
          </button>
        ))}
        <button className="btn btn--light btn--sm gallery__all" onClick={() => setLightbox(0)}>
          <Icon name="grid" size={16} /> Show all photos
        </button>
      </div>

      <div className="listing__body">
        <div className="listing__main">
          <div className="listing__overview">
            <div>
              <h2>{listing.tagline}</h2>
              <p className="muted">
                {listing.guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.baths} baths
              </p>
            </div>
            {host && (
              <Link to={`/hosts/${host.id}`} className="avatar avatar--lg">
                <Img src={host.avatar} alt={host.name} />
              </Link>
            )}
          </div>

          <ul className="highlights">
            {listing.highlights.map((h, i) => (
              <li key={h.title}>
                <Icon name={['door', 'key', 'sparkle'][i % 3]} size={24} strokeWidth={1.4} />
                <div>
                  <strong>{h.title}</strong>
                  <span className="muted">{h.text}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="block">
            <h3>About this home</h3>
            <p className="prose">{listing.description}</p>
          </div>

          <div className="block">
            <h3>What this place offers</h3>
            <ul className="amenities">
              {shownAmenities.map((a) => (
                <li key={a}>
                  <Icon name={AMENITY_ICONS[a] ?? 'check'} size={20} strokeWidth={1.4} /> {a}
                </li>
              ))}
            </ul>
            {listing.amenities.length > 8 && (
              <button className="btn btn--outline btn--sm mt" onClick={() => setAllAmenities(!allAmenities)}>
                {allAmenities ? 'Show fewer' : `Show all ${listing.amenities.length} amenities`}
              </button>
            )}
          </div>

          <div className="block">
            <h3>{nights ? `${nights} nights in ${listing.city}` : 'Select your dates'}</h3>
            <p className="muted">
              {checkIn && checkOut ? `${fmtDate(checkIn, { month: 'long', day: 'numeric', year: 'numeric' })} – ${fmtDate(checkOut, { month: 'long', day: 'numeric', year: 'numeric' })}` : 'Add your travel dates for exact pricing'}
            </p>
            <div className="cal-inline">
              <Calendar
                checkIn={checkIn}
                checkOut={checkOut}
                blocked={blocked}
                onChange={(a, b) => {
                  setCheckIn(a)
                  setCheckOut(b)
                }}
              />
            </div>
          </div>

          <div className="block" id="reviews">
            <h3 className="reviews__title">
              <Icon name="star" size={22} filled className="gold" /> {listing.rating.toFixed(2)} · {listing.reviewCount} reviews
            </h3>
            <div className="rating-bars">
              {[
                ['Cleanliness', 4.98],
                ['Accuracy', 4.95],
                ['Check-in', 4.99],
                ['Communication', 4.97],
                ['Location', 4.94],
                ['Value', 4.86],
              ].map(([k, v]) => (
                <div key={k as string} className="rating-bar">
                  <span>{k}</span>
                  <span className="rating-bar__track"><span style={{ width: `${((v as number) / 5) * 100}%` }} /></span>
                  <span>{(v as number).toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="reviews">
              {reviews.map((r) => (
                <article key={r.id} className="review">
                  <header>
                    <span className="avatar"><Img src={r.avatar} alt="" /></span>
                    <div>
                      <strong>{r.author}</strong>
                      <span className="muted">{r.date}</span>
                    </div>
                  </header>
                  <div className="review__stars" aria-label={`${r.rating} stars`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Icon key={i} name="star" size={12} filled={i < r.rating} />
                    ))}
                  </div>
                  <p>{r.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="block">
            <h3>Where you’ll be</h3>
            <div className="map">
              <div className="map__pin"><Icon name="home" size={22} /></div>
              <span className="map__label">{listing.city}, {listing.country}</span>
            </div>
            <p className="muted mt">Exact address shared after booking is confirmed.</p>
          </div>

          {host && (
            <div className="block host-box">
              <Link to={`/hosts/${host.id}`} className="host-box__card">
                <span className="avatar avatar--xl"><Img src={host.avatar} alt={host.name} /></span>
                <strong>{host.name}</strong>
                <span className="muted">{host.superhost ? 'Superhost' : 'Host'} · since {host.joined}</span>
              </Link>
              <div>
                <h3>Meet your host</h3>
                <p className="prose">{host.bio}</p>
                <p className="muted">
                  Response rate {host.responseRate}% · Responds {host.responseTime}
                </p>
                <Link to={`/hosts/${host.id}`} className="btn btn--outline btn--sm mt">
                  <Icon name="message" size={16} /> Contact host
                </Link>
              </div>
            </div>
          )}
        </div>

        <aside className="booking">
          <div className="booking__card">
            <p className="booking__price">
              <strong>{money(listing.price)}</strong> <span className="muted">night</span>
            </p>
            <div className="booking__fields">
              <div className="booking__dates">
                <button type="button" onClick={() => setDatesOpen(!datesOpen)}>
                  <span className="searchbar__label">Check-in</span>
                  <span className={cx(!checkIn && 'placeholder')}>{checkIn ? fmtDate(checkIn, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Add date'}</span>
                </button>
                <button type="button" onClick={() => setDatesOpen(!datesOpen)}>
                  <span className="searchbar__label">Check-out</span>
                  <span className={cx(!checkOut && 'placeholder')}>{checkOut ? fmtDate(checkOut, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Add date'}</span>
                </button>
                <Popover open={datesOpen} onClose={() => setDatesOpen(false)} align="right" className="dates-pop">
                  <Calendar
                    checkIn={checkIn}
                    checkOut={checkOut}
                    blocked={blocked}
                    onChange={(a, b) => {
                      setCheckIn(a)
                      setCheckOut(b)
                      if (a && b) setDatesOpen(false)
                    }}
                  />
                </Popover>
              </div>
              <div className="booking__guests">
                <div>
                  <span className="searchbar__label">Guests</span>
                  <span>{guests} guest{guests > 1 ? 's' : ''}</span>
                </div>
                <Counter label="guests" value={guests} min={1} max={listing.guests} onChange={setGuests} />
              </div>
            </div>

            <button className="btn btn--primary btn--block" onClick={reserve}>
              {checkIn && checkOut ? (listing.instantBook ? 'Reserve' : 'Request to book') : 'Check availability'}
            </button>
            {nights > 0 && <p className="center muted small">You won’t be charged yet</p>}

            {nights > 0 && (
              <dl className="breakdown">
                <div><dt>{money(listing.price)} × {nights} nights</dt><dd>{money(price.base)}</dd></div>
                {price.discount > 0 && <div className="accent"><dt>Weekly stay discount</dt><dd>−{money(price.discount)}</dd></div>}
                <div><dt>Cleaning fee</dt><dd>{money(price.cleaning)}</dd></div>
                <div><dt>Service fee</dt><dd>{money(price.service)}</dd></div>
                <div><dt>Taxes</dt><dd>{money(price.taxes)}</dd></div>
                <div className="breakdown__total"><dt>Total</dt><dd>{money(price.total)}</dd></div>
              </dl>
            )}
          </div>
          <p className="booking__note">
            <Icon name="shield" size={18} /> Every booking is protected by our Stay Guarantee.
          </p>
        </aside>
      </div>

      {lightbox !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo gallery" onClick={() => setLightbox(null)}>
          <button className="icon-btn lightbox__close" aria-label="Close" onClick={() => setLightbox(null)}>
            <Icon name="close" />
          </button>
          <button className="icon-btn lightbox__nav lightbox__nav--l" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + listing.images.length) % listing.images.length) }}>
            <Icon name="chevronLeft" />
          </button>
          <div className="lightbox__img" onClick={(e) => e.stopPropagation()}>
            <Img src={listing.images[lightbox]} alt="" />
            <span className="lightbox__count">{lightbox + 1} / {listing.images.length}</span>
          </div>
          <button className="icon-btn lightbox__nav lightbox__nav--r" aria-label="Next" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % listing.images.length) }}>
            <Icon name="chevronRight" />
          </button>
        </div>
      )}
    </div>
  )
}
