import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { BRAND } from '../brand'

type Section = { h: string; p: string[] }

const PRIVACY: Section[] = [
  { h: 'What we collect', p: ['Details you give us when you create an account, book or contact us: your name, email, phone number, payment details and messages.', 'Information about how you use the site, such as searches, saved homes and the device you use.'] },
  { h: 'How we use it', p: ['To confirm and manage bookings, connect you with hosts, process payments, prevent fraud and answer your questions.', 'With your permission, to send travel inspiration. You can unsubscribe at any time.'] },
  { h: 'Who we share it with', p: ['Your host receives the details needed for your stay. Payment providers process card details on our behalf. We never sell your personal information.'] },
  { h: 'How long we keep it', p: ['We keep booking records for as long as the law requires, usually up to seven years. Other data is deleted when it is no longer needed.'] },
  { h: 'Your rights', p: ['You can ask to see, correct, export or delete your data. Contact us and we will reply within 30 days.'] },
  { h: 'Cookies', p: ['We use essential cookies to keep you signed in and remember your wishlist, and optional analytics cookies only if you allow them.'] },
]

const TERMS: Section[] = [
  { h: 'Using the platform', p: [`${BRAND} connects guests with hosts of private homes. By using the site you agree to these terms and to treat homes, hosts and neighbours with respect.`] },
  { h: 'Bookings and payment', p: ['A booking is a contract between you and the host. The total price, including fees and taxes, is shown before you confirm.', 'Payment schedules are described in the help centre.'] },
  { h: 'Cancellations', p: ['Each home has a cancellation option shown on the listing. Refunds follow that option and our extenuating circumstances policy.'] },
  { h: 'House rules and damage', p: ['Guests must follow each home’s house rules. Hosts may request payment for damage caused during a stay, which we review fairly with both sides.'] },
  { h: 'Hosts', p: ['Hosts confirm they have the right to rent their home, comply with local laws and keep their listing accurate.'] },
  { h: 'Liability', p: ['We work hard to make every stay safe and accurate, but we are not liable for losses caused by events outside our reasonable control.'] },
]

export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const isPrivacy = kind === 'privacy'
  const sections = isPrivacy ? PRIVACY : TERMS
  return (
    <>
      <PageHero small eyebrow="Legal" title={isPrivacy ? 'Privacy policy' : 'Terms of service'}>
        Last updated 1 November 2026
      </PageHero>
      <section className="section container legal">
        <nav className="legal__toc" aria-label="On this page">
          <span className="eyebrow">On this page</span>
          {sections.map((s, i) => (
            <a key={s.h} href={`#s${i + 1}`}>{s.h}</a>
          ))}
          <Link to={isPrivacy ? '/terms' : '/privacy'} className="text-link mt">
            {isPrivacy ? 'Terms of service' : 'Privacy policy'}
          </Link>
        </nav>
        <div className="prose legal__body">
          <p className="lead">
            {isPrivacy
              ? 'Your privacy matters to us. This policy explains what we collect, why, and the choices you have.'
              : 'These terms explain how booking and hosting on our platform work. Please read them before you book.'}
          </p>
          {sections.map((s, i) => (
            <section key={s.h} id={`s${i + 1}`}>
              <h2>{i + 1}. {s.h}</h2>
              {s.p.map((p) => <p key={p}>{p}</p>)}
            </section>
          ))}
          <p className="muted">Questions? <Link to="/contact" className="text-link">Contact us</Link>.</p>
        </div>
      </section>
    </>
  )
}
