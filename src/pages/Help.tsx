import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHero from '../components/PageHero'
import { FAQS, HELP_TOPICS } from '../data/help'
import { cx } from '../lib/utils'

const SHORTCUTS = [
  { icon: 'calendar', title: 'Your trips', text: 'Change or cancel a booking', to: '/trips' },
  { icon: 'shield', title: 'Trust & safety', text: 'How we protect every stay', to: '/trust-safety' },
  { icon: 'wallet', title: 'Cancellation options', text: 'Refunds, explained simply', to: '/cancellation' },
  { icon: 'home', title: 'Hosting', text: 'List and manage your home', to: '/host' },
]

export default function Help() {
  const [q, setQ] = useState('')
  const [topic, setTopic] = useState('All')
  const term = q.trim().toLowerCase()
  const shown = FAQS.filter(
    (f) => (topic === 'All' || f.topic === topic) && (!term || `${f.q} ${f.a}`.toLowerCase().includes(term)),
  )

  return (
    <>
      <PageHero small eyebrow="Help centre" title={<>How can we <em>help?</em></>}>
        <label className="help-search input-icon">
          <Icon name="search" size={18} />
          <input className="input" type="search" placeholder="Search questions, e.g. refund" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search help" />
        </label>
      </PageHero>

      <section className="section container">
        <div className="shortcuts">
          {SHORTCUTS.map((s) => (
            <Link key={s.title} to={s.to} className="glass-card shortcut spot">
              <Icon name={s.icon} size={24} strokeWidth={1.3} />
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section section--flush container page-narrow-inner">
        <div className="chips-wrap chips-center">
          {['All', ...HELP_TOPICS].map((t) => (
            <button key={t} className={cx('chip', topic === t && 'is-on')} aria-pressed={topic === t} onClick={() => setTopic(t)}>
              {t}
            </button>
          ))}
        </div>
        {shown.length ? (
          <div className="faq">
            {shown.map((f) => (
              <details key={f.q} className="faq__item">
                <summary>
                  <span>{f.q}</span>
                  <Icon name="plus" size={18} />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No answers match “{q}”</h3>
            <p className="muted">Try another word, or ask the concierge directly.</p>
          </div>
        )}
        <div className="help-more glass-card">
          <div>
            <h3>Still need help?</h3>
            <p className="muted">Our concierge replies within a few hours, 24/7 for guests mid-stay.</p>
          </div>
          <Link to="/contact" className="btn btn--primary">Contact us</Link>
        </div>
      </section>
    </>
  )
}
