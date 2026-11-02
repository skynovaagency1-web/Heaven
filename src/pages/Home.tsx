import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'
import { Img, SectionTitle } from '../components/ui'
import { CATEGORIES, DESTINATIONS, img } from '../data/listings'
import { useStore } from '../lib/store'
import { BRAND } from '../brand'

const PROMISES = [
  { icon: 'shield', title: 'Verified in person', text: 'Every home is visited and photographed by our team before it’s listed.' },
  { icon: 'key', title: 'Seamless arrival', text: 'Private check-in, a welcome hamper and a host who answers in minutes.' },
  { icon: 'sparkle', title: 'Concierge on call', text: 'Chefs, chauffeurs, boats and tables, arranged before you land.' },
  { icon: 'medal', title: 'Stay guarantee', text: 'If something isn’t as promised, we rebook or refund. No debate.' },
]

export default function Home() {
  const { listings } = useStore()
  const featured = [...listings].sort((a, b) => b.rating - a.rating).slice(0, 8)

  return (
    <>
      <section className="hero">
        <Img className="hero__bg" src={img('1600607687939-ce8a6c25118c', 2400)} alt="" />
        <div className="hero__scrim" />
        <div className="container hero__inner">
          <span className="eyebrow eyebrow--light">Private homes · 40+ destinations</span>
          <h1>
            Stay somewhere
            <br />
            <em>unforgettable.</em>
          </h1>
          <p className="hero__lead">
            Hand-picked villas, chalets and city residences
            <span className="dot" /> verified in person <span className="dot" /> hosted with care.
          </p>
          <SearchBar />
          <div className="hero__chips">
            {CATEGORIES.map((c) => (
              <Link key={c.name} to={`/stays?category=${c.name}`} className="chip chip--glass">
                <Icon name={c.icon} size={16} />
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <SectionTitle eyebrow="The collection" title="Featured stays">
          Our highest-rated homes this season, chosen by guests.
        </SectionTitle>
        <div className="grid-cards">
          {featured.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
        <div className="center mt-lg">
          <Link to="/stays" className="btn btn--outline">
            View all stays <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>

      <section className="section section--pine">
        <div className="container">
          <SectionTitle eyebrow={`The ${BRAND} standard`} title="Hospitality, not just a booking" />
          <div className="promises">
            {PROMISES.map((p) => (
              <div key={p.title} className="glass-card">
                <span className="glass-card__icon">
                  <Icon name={p.icon} size={28} strokeWidth={1.3} />
                </span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <SectionTitle eyebrow="Where to next" title="Trending destinations" />
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

      <section className="stats">
        <div className="container stats__inner">
          {[
            ['1,200+', 'Homes, each inspected'],
            ['4.92', 'Average guest rating'],
            ['40+', 'Destinations worldwide'],
            ['24/7', 'Concierge support'],
          ].map(([n, l]) => (
            <div key={l} className="stat">
              <strong>{n}</strong>
              <span>{l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="host-cta">
          <Img className="host-cta__img" src={img('1600566753190-17f0baa2a6c3', 1400)} alt="" />
          <div className="host-cta__body">
            <span className="eyebrow">For homeowners</span>
            <h2>
              Your home, <em>beautifully</em> hosted.
            </h2>
            <p>
              Join a collection of the world’s most remarkable homes. We handle photography, pricing, guest vetting and concierge, so you earn more and worry less.
            </p>
            <div className="row gap">
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

      <section className="section section--tight container">
        <figure className="quote">
          <blockquote>
            “The most thoughtful stay we’ve ever had. Fresh flowers, a handwritten note, and a host who booked us a table we’d been trying to get for years.”
          </blockquote>
          <figcaption>Charlotte &amp; Marcus · stayed at Villa Aurélia, Antibes</figcaption>
        </figure>
      </section>
    </>
  )
}
