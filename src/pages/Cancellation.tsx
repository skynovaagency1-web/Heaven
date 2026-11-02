import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHero from '../components/PageHero'
import { SectionTitle } from '../components/ui'

const TIERS = [
  {
    name: 'Flexible',
    tag: 'Most freedom',
    summary: 'Full refund up to 24 hours before check-in.',
    rows: [
      ['Up to 24 h before', 'Full refund'],
      ['Less than 24 h', 'First night not refunded'],
      ['After check-in', 'Unused nights refunded'],
    ],
  },
  {
    name: 'Moderate',
    tag: 'Most popular',
    summary: 'Full refund up to 5 days before check-in.',
    rows: [
      ['Up to 5 days before', 'Full refund'],
      ['Less than 5 days', '50% refund'],
      ['After check-in', '50% of unused nights'],
    ],
  },
  {
    name: 'Strict',
    tag: 'Peak season homes',
    summary: 'Full refund within 48 hours of booking, if check-in is 14+ days away.',
    rows: [
      ['48 h after booking', 'Full refund'],
      ['Up to 7 days before', '50% refund'],
      ['Less than 7 days', 'No refund'],
    ],
  },
]

export default function Cancellation() {
  return (
    <>
      <PageHero small eyebrow="Cancellation options" title={<>Plans change. <em>We understand.</em></>}>
        Each home shows its cancellation option on the listing and in your confirmation. Here’s what each one means.
      </PageHero>

      <section className="section container">
        <div className="tiers">
          {TIERS.map((t, i) => (
            <article key={t.name} className={`tier glass-card spot ${i === 1 ? 'tier--hi' : ''}`}>
              <span className="tier__tag">{t.tag}</span>
              <h2>{t.name}</h2>
              <p>{t.summary}</p>
              <span className="glow-line" aria-hidden="true" />
              <dl>
                {t.rows.map(([when, what]) => (
                  <div key={when}>
                    <dt>{when}</dt>
                    <dd>{what}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <p className="muted center small-note">Service fees are refunded whenever the nightly rate is refunded in full. Refunds reach your card within 5 to 10 business days.</p>
      </section>

      <section className="section container">
        <SectionTitle title="Extenuating circumstances" />
        <div className="guide-split guide-split--text">
          <div className="prose">
            <p>
              Sometimes events outside anyone’s control make travel impossible. In these cases we may refund you in full, whatever the home’s cancellation option.
            </p>
            <ul className="check-list">
              <li><Icon name="check" size={18} /> Serious illness or injury, with documentation</li>
              <li><Icon name="check" size={18} /> Natural disasters at the destination</li>
              <li><Icon name="check" size={18} /> Government travel restrictions or closures</li>
              <li><Icon name="check" size={18} /> Severe disruption to transport</li>
            </ul>
          </div>
          <div className="glass-card help-more help-more--stack">
            <h3>Need to cancel?</h3>
            <p className="muted">Go to your trips and choose the booking. The refund is shown before you confirm.</p>
            <div className="row gap wrap">
              <Link to="/trips" className="btn btn--primary">Go to trips</Link>
              <Link to="/contact" className="btn btn--ghost">Ask the concierge</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
