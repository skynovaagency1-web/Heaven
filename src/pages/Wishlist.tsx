import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import ListingCard from '../components/ListingCard'
import { useStore } from '../lib/store'

export default function Wishlist() {
  const { wishlist, getListing } = useStore()
  const saved = wishlist.map(getListing).filter((l): l is NonNullable<typeof l> => !!l)
  return (
    <div className="container page">
      <h1 className="page__title">Your <em>wishlist</em></h1>
      {saved.length ? (
        <div className="grid-cards">
          {saved.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      ) : (
        <div className="empty">
          <Icon name="heart" size={36} strokeWidth={1.2} />
          <h3>Nothing saved yet</h3>
          <p className="muted">Tap the heart on any home to keep it here for later.</p>
          <Link to="/stays" className="btn btn--primary">Explore stays</Link>
        </div>
      )}
    </div>
  )
}
