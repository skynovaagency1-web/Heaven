import { useMemo, useState } from 'react'
import Icon from './Icon'
import { addDays, cx, fromISO, startOfDay, toISO } from '../lib/utils'

interface Props {
  checkIn: string | null
  checkOut: string | null
  onChange: (checkIn: string | null, checkOut: string | null) => void
  blocked?: Set<string>
  months?: 1 | 2
}

const WEEK = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function monthDays(year: number, month: number) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const total = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d))
  return cells
}

export default function Calendar({ checkIn, checkOut, onChange, blocked, months = 2 }: Props) {
  const today = startOfDay(new Date())
  const initial = fromISO(checkIn) ?? today
  const [view, setView] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))
  const [hover, setHover] = useState<string | null>(null)

  const views = useMemo(
    () => Array.from({ length: months }, (_, i) => new Date(view.getFullYear(), view.getMonth() + i, 1)),
    [view, months],
  )

  // When a check-in is chosen, the stay can't run past the next blocked night.
  const limit = useMemo(() => {
    if (!checkIn || checkOut || !blocked) return null
    let d = fromISO(checkIn)!
    for (let i = 0; i < 365; i++) {
      d = addDays(d, 1)
      if (blocked.has(toISO(d))) return toISO(d)
    }
    return null
  }, [checkIn, checkOut, blocked])

  function pick(iso: string) {
    if (!checkIn || checkOut || iso <= checkIn) {
      onChange(iso, null)
    } else {
      onChange(checkIn, iso)
    }
  }

  const rangeEnd = checkOut ?? (checkIn && hover && hover > checkIn ? hover : null)
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1)

  return (
    <div className="cal">
      <div className="cal__nav">
        <button type="button" className="icon-btn" disabled={!canPrev} aria-label="Previous month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>
          <Icon name="chevronLeft" size={18} />
        </button>
        <button type="button" className="icon-btn" aria-label="Next month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
      <div className={cx('cal__months', months === 1 && 'cal__months--one')}>
        {views.map((m) => (
          <div key={m.toISOString()} className="cal__month">
            <div className="cal__title">{m.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            <div className="cal__grid">
              {WEEK.map((w) => (
                <span key={w} className="cal__dow">{w}</span>
              ))}
              {monthDays(m.getFullYear(), m.getMonth()).map((d, i) => {
                if (!d) return <span key={i} />
                const iso = toISO(d)
                const past = d < today
                const isBlocked = blocked?.has(iso) ?? false
                const beyond = limit !== null && iso > limit
                // A blocked date can still be a check-out day (guests leave in the morning).
                const disabled = past || beyond || (isBlocked && !(checkIn && !checkOut && iso === limit))
                const start = iso === checkIn
                const end = iso === rangeEnd
                const inRange = checkIn && rangeEnd && iso > checkIn && iso < rangeEnd
                return (
                  <button
                    type="button"
                    key={iso}
                    disabled={disabled}
                    onClick={() => pick(iso)}
                    onMouseEnter={() => setHover(iso)}
                    className={cx('cal__day', start && 'is-start', end && 'is-end', inRange && 'is-range', isBlocked && 'is-blocked')}
                    aria-label={d.toDateString()}
                    aria-pressed={start || end}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="cal__foot">
        <button type="button" className="link-btn" onClick={() => onChange(null, null)}>
          Clear dates
        </button>
      </div>
    </div>
  )
}
