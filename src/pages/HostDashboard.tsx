import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { Img } from '../components/ui'
import { getHost, LISTINGS } from '../data/listings'
import { useStore } from '../lib/store'
import { addDays, cx, fmtDate, money, toISO } from '../lib/utils'

const HOST_ID = 'h1'
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const EARNINGS = [18, 22, 26, 31, 38, 52, 64, 68, 49, 36, 24, 29].map((k) => k * 1000)

const GUESTS = ['Charlotte W.', 'Marcus D.', 'Elena R.', 'James T.', 'Priya S.']

export default function HostDashboard() {
  const { customListings, paused, togglePaused, removeListing, trips } = useStore()
  const host = getHost(HOST_ID)!
  const [tab, setTab] = useState<'upcoming' | 'listings'>('upcoming')
  const mine = [...customListings, ...LISTINGS.filter((l) => l.hostId === HOST_ID)]
  const today = new Date()
  const month = today.getMonth()

  // Demo reservations, plus any real trips booked on this host's homes.
  const demo = mine.slice(0, 4).map((l, i) => ({
    code: `HV${(48213 + i * 977).toString(36).toUpperCase()}`,
    guest: GUESTS[i % GUESTS.length],
    listing: l,
    checkIn: toISO(addDays(today, 3 + i * 6)),
    checkOut: toISO(addDays(today, 7 + i * 6)),
    total: l.price * 4 + l.cleaningFee,
    status: i === 1 ? 'requested' : 'confirmed',
  }))
  const real = trips
    .map((t) => ({ t, l: mine.find((l) => l.id === t.listingId) }))
    .filter((x) => x.l)
    .map(({ t, l }) => ({ code: t.code, guest: t.guestName, listing: l!, checkIn: t.checkIn, checkOut: t.checkOut, total: t.total, status: t.status }))
  const reservations = [...real, ...demo]

  const max = Math.max(...EARNINGS)

  return (
    <div className="container page dash">
      <div className="dash__head">
        <div className="row gap">
          <span className="avatar avatar--lg"><Img src={host.avatar} alt="" /></span>
          <div>
            <span className="eyebrow">Host dashboard</span>
            <h1>Welcome back, {host.name.split(' ')[0]}</h1>
          </div>
        </div>
        <Link to="/host/new" className="btn btn--primary"><Icon name="plus" size={18} /> New listing</Link>
      </div>

      <div className="kpis">
        {[
          ['wallet', 'Earnings this month', money(EARNINGS[month]), '+12% vs last year'],
          ['calendar', 'Upcoming stays', String(reservations.length), 'Next 30 days'],
          ['chart', 'Occupancy', '78%', '+6 pts this quarter'],
          ['star', 'Overall rating', '4.96', '412 reviews'],
        ].map(([icon, label, value, note]) => (
          <div key={label} className="kpi">
            <span className="kpi__icon"><Icon name={icon} size={20} /></span>
            <span className="muted small">{label}</span>
            <strong>{value}</strong>
            <span className="kpi__note">{note}</span>
          </div>
        ))}
      </div>

      <div className="dash__grid">
        <section className="panel">
          <div className="panel__head">
            <h2>Earnings</h2>
            <span className="muted small">{today.getFullYear()} · USD</span>
          </div>
          <div className="bars" role="img" aria-label="Monthly earnings bar chart">
            {EARNINGS.map((v, i) => (
              <div key={i} className={cx('bars__col', i === month && 'is-now')}>
                <span className="bars__val">{Math.round(v / 1000)}k</span>
                <span className="bars__bar" style={{ height: `${(v / max) * 100}%` }} />
                <span className="bars__label">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="panel__head"><h2>To-do</h2></div>
          <ul className="todo">
            <li><Icon name="message" size={18} /> Reply to Marcus about early check-in</li>
            <li><Icon name="calendar" size={18} /> Approve booking request for {demo[1]?.listing.title ?? 'your villa'}</li>
            <li><Icon name="sparkle" size={18} /> Schedule deep clean after {fmtDate(demo[0]?.checkOut)}</li>
            <li><Icon name="star" size={18} /> Respond to 2 new reviews</li>
          </ul>
        </section>
      </div>

      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'upcoming'} className={cx(tab === 'upcoming' && 'is-on')} onClick={() => setTab('upcoming')}>Reservations</button>
        <button role="tab" aria-selected={tab === 'listings'} className={cx(tab === 'listings' && 'is-on')} onClick={() => setTab('listings')}>Your listings ({mine.length})</button>
      </div>

      {tab === 'upcoming' ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Guest</th><th>Home</th><th>Dates</th><th>Payout</th><th>Status</th></tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.code}>
                  <td><strong>{r.guest}</strong><span className="muted small d-block">{r.code}</span></td>
                  <td>{r.listing.title}</td>
                  <td>{fmtDate(r.checkIn)} – {fmtDate(r.checkOut)}</td>
                  <td>{money(Math.round(r.total * 0.97))}</td>
                  <td><span className={`status status--${r.status}`}>{r.status === 'confirmed' ? 'Confirmed' : 'Request'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="host-listings">
          {mine.map((l) => {
            const isPaused = paused.includes(l.id)
            return (
              <article key={l.id} className={cx('host-listing', isPaused && 'is-paused')}>
                <Img src={l.images[0]} alt="" />
                <div className="host-listing__body">
                  <strong>{l.title}</strong>
                  <span className="muted small">{l.city} · {money(l.price)}/night{l.custom ? ' · New' : ''}</span>
                </div>
                <div className="row gap-sm">
                  <Link to={`/stays/${l.id}`} className="icon-btn" aria-label="View"><Icon name="eye" size={18} /></Link>
                  <button className="btn btn--outline btn--sm" onClick={() => togglePaused(l.id)}>{isPaused ? 'Activate' : 'Pause'}</button>
                  {l.custom && (
                    <button className="icon-btn danger" aria-label="Delete listing" onClick={() => confirm('Delete this listing?') && removeListing(l.id)}>
                      <Icon name="trash" size={18} />
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
