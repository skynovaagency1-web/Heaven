import { Link, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import ListingCard from '../components/ListingCard'
import PageHero from '../components/PageHero'
import { Img, SectionTitle } from '../components/ui'
import { GUIDES } from '../data/destinations'
import { useStore } from '../lib/store'
import NotFound from './NotFound'

export default function Destination() {
  const { slug } = useParams()
  const { listings } = useStore()
  const guide = GUIDES.find((g) => g.slug === slug)
  if (!guide) return <NotFound />

  const stays = listings.filter((l) => l.city === guide.city)
  const others = GUIDES.filter((g) => g.slug !== guide.slug && g.region === guide.region).slice(0, 3)
  const more = others.length ? others : GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3)

  return (
    <>
      <PageHero image={guide.image} eyebrow={`${guide.country} · ${guide.region}`} title={guide.city}>
        {guide.intro}
      </PageHero>

      <section className="section container">
        <div className="facts">
          <div className="fact glass-card">
            <Icon name="sun" size={26} strokeWidth={1.3} />
            <span>Best time to go</span>
            <strong>{guide.bestTime}</strong>
          </div>
          <div className="fact glass-card">
            <Icon name="globe" size={26} strokeWidth={1.3} />
            <span>Getting there</span>
            <strong>{guide.flight}</strong>
          </div>
          <div className="fact glass-card">
            <Icon name="home" size={26} strokeWidth={1.3} />
            <span>Homes here</span>
            <strong>{stays.length} hand-picked {stays.length === 1 ? 'stay' : 'stays'}</strong>
          </div>
        </div>
      </section>

      <section className="section section--flush container">
        <div className="guide-split">
          <div>
            <span className="eyebrow">Our local edit</span>
            <h2>Don’t miss</h2>
            <ol className="dont-miss">
              {guide.dontMiss.map((d, i) => (
                <li key={d}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {d}
                </li>
              ))}
            </ol>
            <p className="muted">Your concierge can book any of these before you arrive.</p>
          </div>
          <Img className="guide-split__img" src={stays[0]?.images[1] ?? guide.image} alt="" />
        </div>
      </section>

      <section className="section container">
        <div className="row-head">
          <h2>Stay in {guide.city}</h2>
          <Link to={`/stays?where=${encodeURIComponent(guide.city)}`} className="text-link">
            Search dates <Icon name="arrow" size={16} />
          </Link>
        </div>
        {stays.length ? (
          <div className="grid-cards">
            {stays.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>New homes are on the way</h3>
            <p className="muted">We’re inspecting homes in {guide.city} right now. Ask the concierge for an early look.</p>
            <Link to="/contact" className="btn btn--outline mt">Contact the concierge</Link>
          </div>
        )}
      </section>

      <section className="section container">
        <SectionTitle title="You might also love" />
        <div className="guides guides--3">
          {more.map((g) => (
            <Link key={g.slug} to={`/destinations/${g.slug}`} className="dest">
              <Img src={g.image.replace('w=1800', 'w=900')} alt={g.city} />
              <div className="dest__label">
                <h3>{g.city}</h3>
                <span>{g.country}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
