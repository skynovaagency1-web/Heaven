import { Link, Navigate, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { useStore } from '../lib/store'
import { fmtDate } from '../lib/utils'

export default function Account() {
  const { user, signOut, trips, wishlist } = useStore()
  const nav = useNavigate()
  if (!user) return <Navigate to="/signin?next=/account" replace />

  const tiles = [
    { icon: 'calendar', title: 'Trips', text: `${trips.length} ${trips.length === 1 ? 'booking' : 'bookings'}`, to: '/trips' },
    { icon: 'heart', title: 'Wishlist', text: `${wishlist.length} saved ${wishlist.length === 1 ? 'home' : 'homes'}`, to: '/wishlist' },
    { icon: 'home', title: 'Hosting', text: 'Manage your listings', to: '/host/dashboard' },
    { icon: 'message', title: 'Concierge', text: 'Get help with anything', to: '/contact' },
    { icon: 'shield', title: 'Trust & safety', text: 'How we protect you', to: '/trust-safety' },
    { icon: 'lock', title: 'Privacy', text: 'Your data and choices', to: '/privacy' },
  ]

  return (
    <div className="container page">
      <div className="account-head">
        <span className="avatar avatar--xl avatar--initial" aria-hidden="true">{user.name.charAt(0)}</span>
        <div>
          <h1>{user.name}</h1>
          <p className="muted">{user.email} · Member since {fmtDate(user.since.slice(0, 10), { month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="btn btn--ghost" onClick={() => { signOut(); nav('/') }}>Sign out</button>
      </div>
      <div className="shortcuts shortcuts--3">
        {tiles.map((t) => (
          <Link key={t.title} to={t.to} className="glass-card shortcut spot">
            <Icon name={t.icon} size={24} strokeWidth={1.3} />
            <div>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
