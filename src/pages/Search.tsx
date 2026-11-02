import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'
import { AMENITIES, CATEGORIES, PROPERTY_TYPES } from '../data/listings'
import { useStore } from '../lib/store'
import { blockedDates, cx, fromISO, addDays, toISO } from '../lib/utils'

const SORTS = {
  recommended: 'Recommended',
  priceAsc: 'Price: low to high',
  priceDesc: 'Price: high to low',
  rating: 'Top rated',
} as const

const PRICE_MAX = 2500

export default function Search() {
  const { listings } = useStore()
  const [params, setParams] = useSearchParams()
  const [drawer, setDrawer] = useState(false)

  const where = params.get('where') ?? ''
  const guests = Number(params.get('guests') ?? 1)
  const category = params.get('category')
  const types = params.getAll('type')
  const amen = params.getAll('amenity')
  const minPrice = Number(params.get('min') ?? 0)
  const maxPrice = Number(params.get('max') ?? PRICE_MAX)
  const bedrooms = Number(params.get('bedrooms') ?? 0)
  const instant = params.get('instant') === '1'
  const topRated = params.get('top') === '1'
  const sort = (params.get('sort') ?? 'recommended') as keyof typeof SORTS
  const checkIn = params.get('checkIn')
  const checkOut = params.get('checkOut')

  function update(fn: (q: URLSearchParams) => void) {
    const q = new URLSearchParams(params)
    fn(q)
    setParams(q, { replace: true })
  }
  const setOne = (k: string, v: string | null) => update((q) => (v === null || v === '' ? q.delete(k) : q.set(k, v)))
  const toggleMulti = (k: string, v: string) =>
    update((q) => {
      const cur = q.getAll(k)
      q.delete(k)
      ;(cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).forEach((x) => q.append(k, x))
    })

  const results = useMemo(() => {
    const w = where.trim().toLowerCase()
    let out = listings.filter((l) => {
      if (w && !`${l.city} ${l.country} ${l.title}`.toLowerCase().includes(w)) return false
      if (l.guests < guests) return false
      if (category && l.category !== category) return false
      if (types.length && !types.includes(l.type)) return false
      if (amen.length && !amen.every((a) => l.amenities.includes(a))) return false
      if (l.price < minPrice || (maxPrice < PRICE_MAX && l.price > maxPrice)) return false
      if (l.bedrooms < bedrooms) return false
      if (instant && !l.instantBook) return false
      if (topRated && l.rating < 4.95) return false
      if (checkIn && checkOut) {
        const blocked = blockedDates(l.id)
        const s = fromISO(checkIn)!
        const e = fromISO(checkOut)!
        for (let d = s; d < e; d = addDays(d, 1)) if (blocked.has(toISO(d))) return false
      }
      return true
    })
    if (sort === 'priceAsc') out = [...out].sort((a, b) => a.price - b.price)
    if (sort === 'priceDesc') out = [...out].sort((a, b) => b.price - a.price)
    if (sort === 'rating') out = [...out].sort((a, b) => b.rating - a.rating)
    return out
  }, [listings, where, guests, category, types, amen, minPrice, maxPrice, bedrooms, instant, topRated, sort, checkIn, checkOut])

  const activeCount = types.length + amen.length + (minPrice > 0 || maxPrice < PRICE_MAX ? 1 : 0) + (bedrooms ? 1 : 0) + (instant ? 1 : 0) + (topRated ? 1 : 0)

  const clearFilters = () =>
    update((q) => ['type', 'amenity', 'min', 'max', 'bedrooms', 'instant', 'top'].forEach((k) => q.delete(k)))

  const query = params.toString()

  return (
    <div className="search-page">
      <div className="search-head">
        <div className="container">
          <SearchBar variant="compact" />
          <div className="cat-row">
            <button className={cx('chip', !category && 'is-on')} onClick={() => setOne('category', null)}>
              <Icon name="grid" size={16} /> All
            </button>
            {CATEGORIES.map((c) => (
              <button key={c.name} className={cx('chip', category === c.name && 'is-on')} onClick={() => setOne('category', category === c.name ? null : c.name)}>
                <Icon name={c.icon} size={16} /> {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container search-body">
        <aside className={cx('filters', drawer && 'is-open')} aria-label="Filters">
          <div className="filters__head">
            <h3>Filters</h3>
            <button className="icon-btn filters__close" aria-label="Close filters" onClick={() => setDrawer(false)}>
              <Icon name="close" />
            </button>
          </div>

          <div className="filter-group">
            <h4>Price per night</h4>
            <div className="price-inputs">
              <label>
                <span>Min</span>
                <input type="number" min={0} step={50} value={minPrice || ''} placeholder="$0" onChange={(e) => setOne('min', e.target.value)} />
              </label>
              <span className="muted">–</span>
              <label>
                <span>Max</span>
                <input type="number" min={0} step={50} value={maxPrice < PRICE_MAX ? maxPrice : ''} placeholder={`$${PRICE_MAX}+`} onChange={(e) => setOne('max', e.target.value)} />
              </label>
            </div>
            <input
              type="range"
              className="range"
              min={200}
              max={PRICE_MAX}
              step={50}
              value={maxPrice}
              aria-label="Maximum price"
              onChange={(e) => setOne('max', Number(e.target.value) >= PRICE_MAX ? null : e.target.value)}
            />
          </div>

          <div className="filter-group">
            <h4>Property type</h4>
            <div className="chips-wrap">
              {PROPERTY_TYPES.map((t) => (
                <button key={t} className={cx('chip chip--sm', types.includes(t) && 'is-on')} onClick={() => toggleMulti('type', t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Bedrooms</h4>
            <div className="seg">
              {[0, 2, 3, 4, 5].map((n) => (
                <button key={n} className={cx(bedrooms === n && 'is-on')} onClick={() => setOne('bedrooms', n ? String(n) : null)}>
                  {n === 0 ? 'Any' : `${n}+`}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Booking options</h4>
            <label className="switch">
              <input type="checkbox" checked={instant} onChange={(e) => setOne('instant', e.target.checked ? '1' : null)} />
              <span className="switch__track" />
              <span>
                <strong>Instant book</strong>
                <small>Confirm without waiting for the host</small>
              </span>
            </label>
            <label className="switch">
              <input type="checkbox" checked={topRated} onChange={(e) => setOne('top', e.target.checked ? '1' : null)} />
              <span className="switch__track" />
              <span>
                <strong>Guest favourites</strong>
                <small>Rated 4.95 or higher</small>
              </span>
            </label>
          </div>

          <div className="filter-group">
            <h4>Amenities</h4>
            <div className="checks">
              {AMENITIES.map((a) => (
                <label key={a} className="check">
                  <input type="checkbox" checked={amen.includes(a)} onChange={() => toggleMulti('amenity', a)} />
                  <span className="check__box"><Icon name="check" size={13} strokeWidth={2.4} /></span>
                  {a}
                </label>
              ))}
            </div>
          </div>

          <div className="filters__foot">
            <button className="link-btn" onClick={clearFilters}>Clear all</button>
            <button className="btn btn--primary btn--sm" onClick={() => setDrawer(false)}>
              Show {results.length} stays
            </button>
          </div>
        </aside>
        {drawer && <div className="backdrop" onClick={() => setDrawer(false)} />}

        <section className="results">
          <div className="results__bar">
            <div>
              <h1 className="results__title">
                {where ? <>Stays in <em>{where}</em></> : category ? <>{category} <em>stays</em></> : <>All <em>stays</em></>}
              </h1>
              <p className="muted">
                {results.length} {results.length === 1 ? 'home' : 'homes'} · {guests} guest{guests > 1 ? 's' : ''}
                {checkIn && checkOut ? ' · available for your dates' : ''}
              </p>
            </div>
            <div className="row gap-sm">
              <button className="btn btn--outline btn--sm filters-toggle" onClick={() => setDrawer(true)}>
                <Icon name="filter" size={16} /> Filters{activeCount > 0 && <span className="pill-count">{activeCount}</span>}
              </button>
              <label className="select">
                <span className="sr-only">Sort by</span>
                <select value={sort} onChange={(e) => setOne('sort', e.target.value === 'recommended' ? null : e.target.value)}>
                  {Object.entries(SORTS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <Icon name="chevronDown" size={16} />
              </label>
            </div>
          </div>

          {results.length ? (
            <div className="grid-cards grid-cards--3">
              {results.map((l) => (
                <ListingCard key={l.id} listing={l} query={query} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <Icon name="search" size={36} strokeWidth={1.2} />
              <h3>No stays match these filters</h3>
              <p className="muted">Try widening your price range, changing dates or removing a few amenities.</p>
              <button className="btn btn--outline" onClick={() => setParams(new URLSearchParams())}>Reset search</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
