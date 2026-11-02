import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Icon from './Icon'
import Calendar from './Calendar'
import Popover from './Popover'
import { Counter } from './ui'
import { DESTINATIONS } from '../data/listings'
import { cx, fmtDate } from '../lib/utils'

type Panel = 'where' | 'dates' | 'guests' | null

export default function SearchBar({ variant = 'hero' }: { variant?: 'hero' | 'compact' }) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [where, setWhere] = useState(params.get('where') ?? '')
  const [checkIn, setCheckIn] = useState<string | null>(params.get('checkIn'))
  const [checkOut, setCheckOut] = useState<string | null>(params.get('checkOut'))
  const [adults, setAdults] = useState(Number(params.get('guests') ?? 2) || 2)
  const [children, setChildren] = useState(0)
  const [panel, setPanel] = useState<Panel>(null)

  const guests = adults + children

  function submit(e?: React.FormEvent) {
    e?.preventDefault()
    const q = new URLSearchParams(params)
    where ? q.set('where', where) : q.delete('where')
    checkIn ? q.set('checkIn', checkIn) : q.delete('checkIn')
    checkOut ? q.set('checkOut', checkOut) : q.delete('checkOut')
    q.set('guests', String(guests))
    setPanel(null)
    navigate(`/stays?${q.toString()}`)
  }

  const matches = DESTINATIONS.filter((d) => `${d.city} ${d.country}`.toLowerCase().includes(where.toLowerCase()))

  return (
    <form className={cx('searchbar', `searchbar--${variant}`)} onSubmit={submit} role="search">
      <div className={cx('searchbar__field', panel === 'where' && 'is-active')}>
        <label className="searchbar__label" htmlFor={`where-${variant}`}>Where</label>
        <input
          id={`where-${variant}`}
          placeholder="Search destinations"
          value={where}
          autoComplete="off"
          onFocus={() => setPanel('where')}
          onChange={(e) => setWhere(e.target.value)}
        />
        <Popover open={panel === 'where'} onClose={() => setPanel(null)} className="dest-pop">
          <span className="eyebrow">Popular destinations</span>
          <ul>
            {(matches.length ? matches : DESTINATIONS).map((d) => (
              <li key={d.city}>
                <button
                  type="button"
                  onClick={() => {
                    setWhere(d.city)
                    setPanel('dates')
                  }}
                >
                  <span className="dest-pop__icon"><Icon name="pin" size={18} /></span>
                  <span>
                    <strong>{d.city}</strong>
                    <small>{d.country}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Popover>
      </div>
      <span className="searchbar__div" />
      <div className={cx('searchbar__field searchbar__field--btn', panel === 'dates' && 'is-active')}>
        <button type="button" onClick={() => setPanel(panel === 'dates' ? null : 'dates')}>
          <span className="searchbar__label">Dates</span>
          <span className={cx(!checkIn && 'placeholder')}>
            {checkIn ? `${fmtDate(checkIn)} – ${checkOut ? fmtDate(checkOut) : 'Check-out'}` : 'Add dates'}
          </span>
        </button>
        <Popover open={panel === 'dates'} onClose={() => setPanel(null)} align="center" className="dates-pop">
          <Calendar
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={(a, b) => {
              setCheckIn(a)
              setCheckOut(b)
              if (a && b) setPanel('guests')
            }}
          />
        </Popover>
      </div>
      <span className="searchbar__div" />
      <div className={cx('searchbar__field searchbar__field--btn', panel === 'guests' && 'is-active')}>
        <button type="button" onClick={() => setPanel(panel === 'guests' ? null : 'guests')}>
          <span className="searchbar__label">Guests</span>
          <span>{guests} guest{guests > 1 ? 's' : ''}</span>
        </button>
        <Popover open={panel === 'guests'} onClose={() => setPanel(null)} align="right" className="guests-pop">
          <div className="guest-row">
            <div>
              <strong>Adults</strong>
              <small>Ages 13 or above</small>
            </div>
            <Counter label="adults" value={adults} min={1} max={16} onChange={setAdults} />
          </div>
          <div className="guest-row">
            <div>
              <strong>Children</strong>
              <small>Ages 2 – 12</small>
            </div>
            <Counter label="children" value={children} max={10} onChange={setChildren} />
          </div>
        </Popover>
      </div>
      <button className="btn btn--primary searchbar__go" type="submit" aria-label="Search">
        <Icon name="search" size={18} />
        <span>Search</span>
      </button>
    </form>
  )
}
