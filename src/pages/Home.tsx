import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'
import { Img } from '../components/ui'
import { CATEGORIES, img } from '../data/listings'
import { GUIDES } from '../data/destinations'
import { useStore } from '../lib/store'
import { cx, money } from '../lib/utils'
import { HERO_VIDEO } from '../brand'

const QUOTES = [
  { text: 'We arrived to the lamps already lit and a note telling us which cove to swim in before breakfast.', who: 'Charlotte', where: 'Villa Aurélia, Antibes' },
  { text: 'The onsen at dusk, the quiet, the tea. Nothing was explained to us. Everything was simply ready.', who: 'Kenji & Mia', where: 'Hoshizora House, Kyoto' },
  { text: 'Ski to the door, fire going, dinner in the oven. The children still talk about it.', who: 'Oliver', where: 'Chalet Edelweiss, Zermatt' },
]

function SectionHead({ n, title, children }: { n: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="ed-head">
      <span className="ed-head__n">{n}</span>
      <h2>{title}</h2>
      {children && <div className="ed-head__aside">{children}</div>}
    </header>
  )
}

export default function Home() {
  const { listings } = useStore()
  const [cat, setCat] = useState<string | null>(null)
  const [quote, setQuote] = useState(0)
  const [hover, setHover] = useState<string | null>(null)

  const ranked = [...listings].sort((a, b) => b.rating - a.rating)
  const cover = ranked.find((l) => l.city === 'Antibes') ?? ranked[0]
  const stays = (cat ? ranked.filter((l) => l.category === cat) : ranked).slice(0, 7)
  const feature = GUIDES.find((g) => g.slug === 'kyoto')!
  const featureStay = listings.find((l) => l.city === feature.city)
  const q = QUOTES[quote]

  return (
    <>
      {/* Masthead */}
      <section className="container masthead">
        <div className="masthead__meta">
          <span>Winter 2026</span>
          <span>{GUIDES.length} places · every home visited in person</span>
        </div>
        <h1 className="masthead__title">
          Homes worth
          <br />
          <em>the journey.</em>
        </h1>
        <div className="masthead__photo">
          <Img src={img('1600607687939-ce8a6c25118c', 2400)} alt={`${cover.title}, ${cover.city}`} />
          {HERO_VIDEO && <video className="hero__video" src={HERO_VIDEO} autoPlay muted loop playsInline aria-hidden="true" />}
          <SearchBar />
        </div>
        <Link to={`/stays/${cover.id}`} className="masthead__caption">
          <span>On the cover</span>
          <span>
            {cover.title}, {cover.city} — from {money(cover.price)} a night
          </span>
          <Icon name="arrow" size={16} />
        </Link>
      </section>

      {/* 01 Stays */}
      <section className="container ed-section">
        <SectionHead n="01" title="Stays">
          <p>Every home here was slept in by one of us before it was offered to you. If we wouldn’t book it for our own family, it isn’t listed.</p>
        </SectionHead>
        <nav className="ed-tabs" aria-label="Filter stays">
          <button className={cx(!cat && 'is-on')} onClick={() => setCat(null)}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c.name} className={cx(cat === c.name && 'is-on')} onClick={() => setCat(c.name)}>
              {c.name}
            </button>
          ))}
          <Link to={cat ? `/stays?category=${cat}` : '/stays'} className="ed-tabs__all">
            View all <Icon name="arrow" size={14} />
          </Link>
        </nav>
        <div className="stagger">
          {stays.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* 02 Index of places */}
      <section className="container ed-section">
        <SectionHead n="02" title="Places">
          <p>Twelve places we know well enough to tell you which morning to go to the market.</p>
        </SectionHead>
        <div className="index" onMouseLeave={() => setHover(null)}>
          <ol>
            {GUIDES.map((g, i) => {
              const count = listings.filter((l) => l.city === g.city).length
              return (
                <li key={g.slug} onMouseEnter={() => setHover(g.slug)}>
                  <Link to={`/destinations/${g.slug}`}>
                    <span className="index__n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="index__city">{g.city}</span>
                    <span className="index__country">{g.country}</span>
                    <span className="index__count">{count} {count === 1 ? 'home' : 'homes'}</span>
                    <Icon name="arrow" size={18} />
                  </Link>
                </li>
              )
            })}
          </ol>
          <div className="index__peek" aria-hidden="true">
            {GUIDES.map((g) => (
              <Img key={g.slug} className={cx(hover === g.slug && 'is-on')} src={g.image.replace('w=1800', 'w=900')} alt="" />
            ))}
          </div>
        </div>
      </section>

      {/* 03 Feature */}
      <section className="container ed-section">
        <SectionHead n="03" title="The feature" />
        <article className="story">
          <Img className="story__img" src={feature.image} alt={feature.city} />
          <div className="story__text">
            <span className="kicker">{feature.country} · Best {feature.bestTime}</span>
            <h3>Slow mornings in {feature.city}</h3>
            <p className="dropcap">{feature.intro} Our scouts spent a week in the machiya quarter, learning which gardens open early, where the tofu is still made by hand, and how to reach Fushimi Inari before anyone else.</p>
            <ul className="story__list">
              {feature.dontMiss.slice(0, 3).map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <div className="story__links">
              <Link to={`/destinations/${feature.slug}`} className="text-link">
                Read the guide <Icon name="arrow" size={16} />
              </Link>
              {featureStay && (
                <Link to={`/stays/${featureStay.id}`} className="text-link text-link--quiet">
                  Stay at {featureStay.title}
                </Link>
              )}
            </div>
          </div>
        </article>
      </section>

      {/* Pull quote */}
      <section className="container quote">
        <blockquote key={quote}>
          <p>“{q.text}”</p>
          <footer>
            {q.who} <span>— {q.where}</span>
          </footer>
        </blockquote>
        <div className="quote__nav" role="tablist" aria-label="Guest quotes">
          {QUOTES.map((_, i) => (
            <button key={i} role="tab" aria-selected={i === quote} className={cx(i === quote && 'is-on')} onClick={() => setQuote(i)}>
              {String(i + 1).padStart(2, '0')}
            </button>
          ))}
        </div>
      </section>

      {/* 04 Hosting */}
      <section className="container ed-section">
        <SectionHead n="04" title="Hosting" />
        <div className="host-split">
          <Img className="host-split__img" src={img('1600566753190-17f0baa2a6c3', 1400)} alt="" />
          <div className="host-split__text">
            <p className="lede">We take on a handful of new homes each season. We photograph them, price them, meet every guest and answer the phone at 3 am, so you don’t have to.</p>
            <dl className="facts-row">
              <div><dt>Hosts keep</dt><dd>88%</dd></div>
              <div><dt>Avg. occupancy</dt><dd>78%</dd></div>
              <div><dt>Paid out</dt><dd>24 h</dd></div>
            </dl>
            <div className="row gap wrap">
              <Link to="/host" className="btn btn--primary">Become a host</Link>
              <Link to="/host/dashboard" className="text-link">Host dashboard <Icon name="arrow" size={16} /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
