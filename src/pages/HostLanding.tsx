import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { Img, SectionTitle } from '../components/ui'
import { DESTINATIONS, img } from '../data/listings'
import { money } from '../lib/utils'
import { BRAND } from '../brand'

const STEPS = [
  { n: '01', title: 'Tell us about your home', text: 'Share a few details and photos. It takes about ten minutes.' },
  { n: '02', title: 'We visit and photograph', text: 'Our team inspects the property and shoots editorial-quality photos.' },
  { n: '03', title: 'Welcome your first guests', text: 'Vetted guests, dynamic pricing and concierge support from day one.' },
]

export default function HostLanding() {
  const [city, setCity] = useState(DESTINATIONS[0].city)
  const [bedrooms, setBedrooms] = useState(4)
  const [nights, setNights] = useState(14)
  const nightly = Math.round((220 + bedrooms * 190) * (city === 'Zermatt' || city === 'Mykonos' ? 1.35 : 1))
  const monthly = nightly * nights

  return (
    <>
      <section className="hero-wrap container">
        <div className="hero hero--host">
        <Img className="hero__bg" src={img('1600585154340-be6161a56a0c', 2400)} alt="" />
        <div className="hero__scrim" />
        <div className="hero__inner hero__inner--split">
          <div>
            <span className="eyebrow eyebrow--light">Host with {BRAND}</span>
            <h1>
              Share your home.
              <br />
              <em>Keep your standards.</em>
            </h1>
            <p className="hero__lead">Full-service hosting for exceptional homes, with photography, pricing, guest vetting and 24/7 concierge.</p>
            <Link to="/host/new" className="btn btn--primary btn--lg">
              List your home <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="estimator glass">
            <span className="eyebrow eyebrow--light">Earnings estimate</span>
            <p className="estimator__value">{money(monthly)}<span>/ month</span></p>
            <p className="estimator__sub">{nights} nights at about {money(nightly)} a night</p>
            <label className="estimator__field">
              <span>Location</span>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                {DESTINATIONS.map((d) => <option key={d.city}>{d.city}</option>)}
              </select>
            </label>
            <label className="estimator__field">
              <span>Bedrooms <strong>{bedrooms}</strong></span>
              <input type="range" className="range range--light" min={1} max={10} value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} />
            </label>
            <label className="estimator__field">
              <span>Nights booked per month <strong>{nights}</strong></span>
              <input type="range" className="range range--light" min={1} max={30} value={nights} onChange={(e) => setNights(Number(e.target.value))} />
            </label>
          </div>
        </div>
        </div>
      </section>

      <section className="section container">
        <SectionTitle eyebrow="How it works" title="Three steps to your first guest" />
        <div className="steps">
          {STEPS.map((s) => (
            <div key={s.n} className="step">
              <span className="step__n">{s.n}</span>
              <h3>{s.title}</h3>
              <p className="muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--pine">
        <div className="container split">
          <div>
            <SectionTitle align="left" eyebrow="Peace of mind" title="Protection on every stay" />
            <ul className="ticks">
              <li><Icon name="check" size={18} /> Up to $3M in damage protection</li>
              <li><Icon name="check" size={18} /> Identity-verified, reviewed guests</li>
              <li><Icon name="check" size={18} /> Professional cleaning and linen service</li>
              <li><Icon name="check" size={18} /> Payouts within 24 hours of check-in</li>
            </ul>
            <Link to="/host/dashboard" className="btn btn--light mt-lg">Preview the host dashboard</Link>
          </div>
          <div className="split__img"><Img src={img('1616594039964-ae9021a400a0', 1200)} alt="" /></div>
        </div>
      </section>
    </>
  )
}
