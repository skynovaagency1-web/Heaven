import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'
import { Img, SectionTitle } from '../components/ui'
import { CATEGORIES, DESTINATIONS, img } from '../data/listings'
import { useStore } from '../lib/store'
import { HERO_VIDEO } from '../brand'

const SETTING_COPY: Record<string, string> = {
  Beachfront: 'Private shorelines',
  Mountain: 'Chalets & lodges',
  City: 'Penthouses & lofts',
  Countryside: 'Vineyards & estates',
  Desert: 'Riads & oases',
  Island: 'Villas by the sea',
}

const REVIEWS = [
  { text: 'Fresh flowers, a handwritten note, and a table we’d been chasing for years.', who: 'Charlotte', where: 'Villa Aurélia, Antibes' },
  { text: 'The onsen at dusk, the quiet, the tea ceremony. We didn’t want to leave Kyoto.', who: 'Kenji & Mia', where: 'Hoshizora House, Kyoto' },
  { text: 'Ski to the door, fire already lit, dinner waiting. Pure magic for our family.', who: 'Oliver', where: 'Chalet Edelweiss, Zermatt' },
  { text: 'A riad that felt like our own private palace. The rooftop breakfasts!', who: 'Priya', where: 'Riad Noor, Marrakech' },
  { text: 'Every detail considered, from the linen to the lighting. Flawless concierge.', who: 'James', where: 'Clifton Glasshouse, Cape Town' },
  { text: 'Vineyard lunches under the pergola. The best week of our year.', who: 'Elena', where: 'Tenuta del Sole, Siena' },
]

const STATS = [
  { icon: 'home', value: '1,200+', label: 'Homes inspected in person' },
  { icon: 'star', value: '4.92', label: 'Average guest rating' },
  { icon: 'globe', value: '40+', label: 'Destinations' },
  { icon: 'key', value: '24/7', label: 'Concierge on call' },
]

export default function Home() {
  const { listings } = useStore()
  const ranked = [...listings].sort((a, b) => b.rating - a.rating)
  const signature = ranked.slice(0, 3)
  const more = ranked.slice(3, 11)

  return (
    <>
      <section className="hero-wrap container">
        <div className="hero">
          <Img className="hero__bg" src={img('1600607687939-ce8a6c25118c', 2400)} alt="" />
          {HERO_VIDEO && <video className="hero__video" src={HERO_VIDEO} autoPlay muted loop playsInline aria-hidden="true" />}
          <div className="hero__scrim" />
          <div className="hero__inner">
            <span className="eyebrow">Private homes · 40+ destinations</span>
            <h1>
              Stay somewhere
              <br />
              <em>quietly extraordinary</em>
            </h1>
            <p className="hero__lead">Hand-picked villas, verified in person and hosted with care.</p>
            <div className="hero__ctas">
              <Link to="/stays" className="btn btn--primary btn--lg">
                Explore stays <Icon name="arrow" size={18} />
              </Link>
              <Link to="/host" className="btn btn--glass btn--lg">
                List your home
              </Link>
            </div>
          </div>
        </div>
        <SearchBar />
      </section>

      <section className="section container">
        <SectionTitle title="Find your setting" />
        <div className="cat-pills">
          {CATEGORIES.map((c, i) => (
            <Link key={c.name} to={`/stays?category=${c.name}`} className={`cat-pill cat-pill--${['sand', 'sage', 'clay', 'clear'][i % 4]}`}>
              <Icon name={c.icon} size={20} strokeWidth={1.2} />
              <span>
                <strong>{c.name}</strong>
                <small>{SETTING_COPY[c.name]}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section--glow container">
        <SectionTitle title="Signature stays">This season’s highest-rated homes, chosen by our guests.</SectionTitle>
        <div className="signature">
          {signature.map((l) => (
            <ListingCard key={l.id} listing={l} variant="feature" />
          ))}
        </div>
      </section>

      <section className="section section--flush container">
        <div className="row-head">
          <h2>More to discover</h2>
          <Link to="/stays" className="text-link">
            View all stays <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="grid-cards">
          {more.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <section className="section container">
        <SectionTitle title="Trending destinations" />
        <div className="destinations">
          {DESTINATIONS.map((d, i) => (
            <Link key={d.city} to={`/stays?where=${d.city}`} className={`dest ${i === 0 ? 'dest--big' : ''}`}>
              <Img src={d.image} alt={d.city} />
              <div className="dest__label">
                <h3>{d.city}</h3>
                <span>
                  {d.country} · {d.stays} stays
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="stats container">
        {STATS.map((s) => (
          <div key={s.label} className="stat">
            <span className="stat__icon"><Icon name={s.icon} size={30} strokeWidth={1.2} /></span>
            <div>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="section container">
        <div className="host-cta">
          <Img className="host-cta__img" src={img('1600566753190-17f0baa2a6c3', 1400)} alt="" />
          <div className="host-cta__body">
            <span className="eyebrow">For homeowners</span>
            <h2>
              Your home, <em>beautifully</em> hosted
            </h2>
            <p>
              Join a collection of remarkable homes. We handle photography, pricing, guest vetting and concierge, so you earn more and worry less.
            </p>
            <div className="row gap wrap">
              <Link to="/host" className="btn btn--primary">
                Become a host <Icon name="arrow" size={18} />
              </Link>
              <Link to="/host/dashboard" className="btn btn--ghost">
                Host dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--flush">
        <div className="container"><SectionTitle title="Words from our guests" /></div>
        <div className="marquee" aria-label="Guest reviews">
          {[0, 1].map((row) => (
            <div key={row} className={`marquee__row ${row ? 'marquee__row--rev' : ''}`}>
              {[...REVIEWS, ...REVIEWS].map((r, i) => (
                <figure key={i} className="review-card spot" aria-hidden={i >= REVIEWS.length}>
                  <span className="review-card__stars" aria-label="5 stars">★★★★★</span>
                  <blockquote>“{r.text}”</blockquote>
                  <figcaption><strong>{r.who}</strong> · {r.where}</figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="finale container">
        <Link to="/stays" className="btn btn--primary btn--lg">
          Start your journey
        </Link>
        <p className="script">Let’s find your little piece of heaven</p>
      </section>
    </>
  )
}
