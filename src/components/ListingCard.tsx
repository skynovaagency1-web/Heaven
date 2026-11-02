import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { Img, Stars } from './ui'
import type { Listing } from '../data/listings'
import { useStore } from '../lib/store'
import { cx, money, nightsBetween } from '../lib/utils'

export default function ListingCard({ listing, query = '', variant = 'default' }: { listing: Listing; query?: string; variant?: 'default' | 'feature' }) {
  const { wishlist, toggleWish } = useStore()
  const [idx, setIdx] = useState(0)
  const saved = wishlist.includes(listing.id)
  const params = new URLSearchParams(query)
  const nights = nightsBetween(params.get('checkIn'), params.get('checkOut'))
  const n = listing.images.length
  const href = `/stays/${listing.id}${query ? `?${query}` : ''}`

  if (variant === 'feature') {
    return (
      <article className="feature spot">
        <Link to={href} className="feature__link" aria-label={listing.title}>
          <Img src={listing.images[0]} alt="" />
          <div className="feature__body">
            <span className="feature__loc">{listing.city}, {listing.country}</span>
            <h3>{listing.title}</h3>
            <p>{listing.tagline}</p>
            <span className="glow-line" aria-hidden="true" />
            <span className="feature__meta">
              <Stars value={listing.rating} small /> <span>From {money(listing.price)} / night</span>
            </span>
          </div>
        </Link>
        <button
          className={cx('card__heart', saved && 'is-saved')}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={saved}
          onClick={() => toggleWish(listing.id)}
        >
          <Icon name="heart" size={20} filled={saved} />
        </button>
      </article>
    )
  }

  return (
    <article className="card">
      <div className="card__media">
        <Link to={`/stays/${listing.id}${query ? `?${query}` : ''}`} aria-label={listing.title}>
          <Img src={listing.images[idx]} alt={`${listing.title} photo ${idx + 1}`} />
        </Link>
        <button
          className={cx('card__heart', saved && 'is-saved')}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={saved}
          onClick={() => toggleWish(listing.id)}
        >
          <Icon name="heart" size={20} filled={saved} />
        </button>
        {listing.rating >= 4.95 && <span className="badge">Guest favourite</span>}
        {n > 1 && (
          <>
            <button className="card__arrow card__arrow--l" aria-label="Previous photo" onClick={() => setIdx((idx - 1 + n) % n)}>
              <Icon name="chevronLeft" size={16} />
            </button>
            <button className="card__arrow card__arrow--r" aria-label="Next photo" onClick={() => setIdx((idx + 1) % n)}>
              <Icon name="chevronRight" size={16} />
            </button>
            <div className="card__dots">
              {listing.images.map((_, i) => (
                <span key={i} className={cx(i === idx && 'on')} />
              ))}
            </div>
          </>
        )}
      </div>
      <Link to={`/stays/${listing.id}${query ? `?${query}` : ''}`} className="card__body">
        <div className="card__row">
          <span className="card__loc">
            {listing.city}, {listing.country}
          </span>
          <Stars value={listing.rating} small />
        </div>
        <h3 className="card__title">{listing.title}</h3>
        <p className="card__meta">
          {listing.type} · {listing.guests} guests · {listing.bedrooms} bedrooms
        </p>
        <p className="card__price">
          <strong>{money(listing.price)}</strong> <span className="muted">night</span>
          {nights > 0 && <span className="muted"> · {money(listing.price * nights)} total</span>}
        </p>
      </Link>
    </article>
  )
}
