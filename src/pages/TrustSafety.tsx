import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHero from '../components/PageHero'
import { SectionTitle } from '../components/ui'
import { img } from '../data/listings'

const PILLARS = [
  { icon: 'eye', title: 'Every home visited', text: 'A 120-point inspection covering safety, cleanliness, comfort and accuracy of photos. Re-checked every year.' },
  { icon: 'users', title: 'Verified guests and hosts', text: 'ID and payment checks for everyone who books or hosts, plus reviews you can trust because only real guests can write them.' },
  { icon: 'lock', title: 'Secure payments', text: 'Payments are encrypted and held safely until 24 hours after check-in, so hosts and guests are both protected.' },
  { icon: 'message', title: '24/7 concierge', text: 'A real person, any time, in English, French, Arabic, Japanese and Spanish.' },
]

const STEPS = [
  { title: 'Scouting', text: 'Our local team shortlists homes by reputation, design and location.' },
  { title: 'In-person visit', text: 'A scout spends a day in the home: smoke alarms, pool fences, locks, water and Wi-Fi.' },
  { title: 'Photography', text: 'We shoot every listing ourselves, so photos match what you’ll see on arrival.' },
  { title: 'Ongoing review', text: 'Guest feedback is read daily. Homes that slip are paused until they’re fixed.' },
]

const GUARANTEE = [
  'A home that doesn’t match its listing',
  'Last-minute host cancellation',
  'Problems with access on arrival',
  'Broken essentials such as heating, hot water or Wi-Fi',
]

export default function TrustSafety() {
  return (
    <>
      <PageHero image={img('1600210492486-724fe5c67fb0', 2200)} eyebrow="Trust & safety" title={<>Peace of mind, <em>built in</em></>}>
        From the first search to the last morning, every stay is backed by people who check, verify and look after you.
      </PageHero>

      <section className="section container">
        <div className="pillars pillars--4">
          {PILLARS.map((p) => (
            <div key={p.title} className="glass-card pillar spot">
              <span className="setting__icon"><Icon name={p.icon} size={28} strokeWidth={1.3} /></span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <SectionTitle title="How a home earns its place" />
        <ol className="process">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="process__n">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section container">
        <div className="guarantee glass-card">
          <div>
            <span className="eyebrow">Stay guarantee</span>
            <h2>If it isn’t right, we make it right</h2>
            <p className="muted">Tell us within 24 hours of arrival and we’ll fix it, rebook you in an equal or better home, or refund you.</p>
          </div>
          <ul className="check-list">
            {GUARANTEE.map((g) => (
              <li key={g}><Icon name="check" size={18} /> {g}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="finale container">
        <div className="row gap wrap center-row">
          <Link to="/help" className="btn btn--primary btn--lg">Visit the help centre</Link>
          <Link to="/cancellation" className="btn btn--ghost btn--lg">Cancellation options</Link>
        </div>
      </section>
    </>
  )
}
