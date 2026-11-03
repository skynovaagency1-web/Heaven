import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import { Img } from './ui'
import type { Listing } from '../data/listings'
import { money } from '../lib/utils'

/**
 * Framed card where a cut-out of the house breaks out of the frame.
 * `cutout` is a transparent PNG in /public/popout. If it is missing the card
 * falls back to a plain framed photo.
 */
export default function PopCard({ listing, cutout, tilt = 0 }: { listing: Listing; cutout: string; tilt?: number }) {
  const [hasCutout, setHasCutout] = useState(true)
  return (
    <Link to={`/stays/${listing.id}`} className={`pop ${hasCutout ? 'pop--out' : ''}`} style={{ '--tilt': `${tilt}deg` } as React.CSSProperties}>
      <div className="pop__frame">
        <Img className="pop__bg" src={listing.images[hasCutout ? 1 : 0]} alt="" />
        <div className="pop__shade" />
        <div className="pop__head">
          <span>Stay in</span>
          <strong>{listing.city}</strong>
        </div>
        <div className="pop__foot">
          <span>{listing.title}</span>
          <span>{money(listing.price)} / night</span>
        </div>
      </div>
      {hasCutout && <img className="pop__cutout" src={cutout} alt={listing.title} loading="lazy" onError={() => setHasCutout(false)} />}
      <span className="pop__go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
    </Link>
  )
}
