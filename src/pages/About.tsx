import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHero from '../components/PageHero'
import { Img, SectionTitle } from '../components/ui'
import { img } from '../data/listings'
import { BRAND } from '../brand'

const VALUES = [
  { icon: 'eye', title: 'Seen in person', text: 'Every home is visited by our team before it is listed. Fewer than one in ten make it into the collection.' },
  { icon: 'sparkle', title: 'Details, always', text: 'Linen, light, water pressure, the view from the bath. We check the small things so your stay feels effortless.' },
  { icon: 'key', title: 'People first', text: 'Our hosts are partners, not inventory. We meet them, work with them and pay them fairly and on time.' },
]

const TIMELINE = [
  { year: '2019', text: 'Started with six villas on the Côte d’Azur and a shared spreadsheet.' },
  { year: '2021', text: 'Opened in Kyoto, Zermatt and Marrakech. Launched 24/7 concierge.' },
  { year: '2024', text: 'Passed 1,000 homes inspected in person across four continents.' },
  { year: 'Today', text: 'Over 40 destinations, with new homes added only after a full visit.' },
]

export default function About() {
  return (
    <>
      <PageHero image={img('1600596542815-ffad4c1539a9', 2200)} eyebrow={`About ${BRAND}`} title={<>Homes worth <em>travelling for</em></>}>
        We believe where you stay is part of the journey, not just a place to sleep.
      </PageHero>

      <section className="section container">
        <div className="guide-split">
          <div className="prose">
            <span className="eyebrow">Our story</span>
            <h2>Fewer homes, chosen better</h2>
            <p>
              {BRAND} began with a simple frustration: beautiful photos, disappointing arrivals. So we decided to visit every home ourselves, and only list the ones we would book for our own families.
            </p>
            <p>
              Today our scouts still walk every room. They test the Wi-Fi, sleep in the beds and meet the hosts. What you see is what you get, and if it isn’t, our concierge makes it right.
            </p>
          </div>
          <Img className="guide-split__img" src={img('1613490493576-7fde63acd811', 1200)} alt="" />
        </div>
      </section>

      <section className="section container">
        <SectionTitle title="What we stand for" />
        <div className="pillars">
          {VALUES.map((v) => (
            <div key={v.title} className="glass-card pillar spot">
              <span className="setting__icon"><Icon name={v.icon} size={28} strokeWidth={1.3} /></span>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <SectionTitle title="Our journey" />
        <ol className="timeline">
          {TIMELINE.map((t) => (
            <li key={t.year}>
              <strong>{t.year}</strong>
              <p>{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="finale container">
        <div className="row gap wrap center-row">
          <Link to="/stays" className="btn btn--primary btn--lg">Explore stays</Link>
          <Link to="/contact" className="btn btn--ghost btn--lg">Talk to us</Link>
        </div>
        <p className="script">Let’s find your little piece of heaven</p>
      </section>
    </>
  )
}
