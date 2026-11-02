import { useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import ListingCard from '../components/ListingCard'
import { Img } from '../components/ui'
import { getHost } from '../data/listings'
import { useStore } from '../lib/store'
import NotFound from './NotFound'
import { useState } from 'react'

export default function HostProfile() {
  const { id = '' } = useParams()
  const host = getHost(id)
  const { listings } = useStore()
  const [sent, setSent] = useState(false)
  const [msg, setMsg] = useState('')
  if (!host) return <NotFound />
  const theirs = listings.filter((l) => l.hostId === host.id)
  const reviews = theirs.reduce((s, l) => s + l.reviewCount, 0)
  const rating = theirs.length ? theirs.reduce((s, l) => s + l.rating, 0) / theirs.length : 0

  return (
    <div className="container page host-profile">
      <aside className="host-profile__card">
        <span className="avatar avatar--xxl"><Img src={host.avatar} alt={host.name} /></span>
        <h1>{host.name}</h1>
        {host.superhost && <span className="tag"><Icon name="medal" size={14} /> Superhost</span>}
        <div className="host-profile__stats">
          <div><strong>{reviews}</strong><span>Reviews</span></div>
          <div><strong>{rating.toFixed(2)}</strong><span>Rating</span></div>
          <div><strong>{new Date().getFullYear() - host.joined}</strong><span>Years hosting</span></div>
        </div>
        <ul className="host-facts">
          <li><Icon name="pin" size={18} /> Lives in {host.city}</li>
          <li><Icon name="globe" size={18} /> Speaks {host.languages.join(', ')}</li>
          <li><Icon name="message" size={18} /> {host.responseRate}% response rate, {host.responseTime}</li>
          <li><Icon name="shield" size={18} /> Identity verified</li>
        </ul>
      </aside>
      <div className="host-profile__main">
        <span className="eyebrow">About</span>
        <h2>Hello, I’m {host.name.split(' ')[0]}.</h2>
        <p className="prose lead">{host.bio}</p>

        <div className="panel mt-lg">
          <h3>Send {host.name.split(' ')[0]} a message</h3>
          {sent ? (
            <p className="accent-text"><Icon name="check" size={16} /> Message sent. {host.name.split(' ')[0]} usually replies {host.responseTime}.</p>
          ) : (
            <form className="row gap-sm wrap" onSubmit={(e) => { e.preventDefault(); if (msg.trim()) setSent(true) }}>
              <input className="input grow" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Ask about availability, events or special requests…" />
              <button className="btn btn--primary" type="submit">Send</button>
            </form>
          )}
        </div>

        <h2 className="subhead mt-lg">{host.name.split(' ')[0]}’s homes</h2>
        <div className="grid-cards grid-cards--2">
          {theirs.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      </div>
    </div>
  )
}
