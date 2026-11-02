import { useState, type FormEvent } from 'react'
import Icon from '../components/Icon'
import PageHero from '../components/PageHero'
import { useStore } from '../lib/store'
import { BRAND_LOWER } from '../brand'

const TOPICS = ['Planning a stay', 'An existing booking', 'Listing my home', 'Press & partnerships', 'Something else']

export default function Contact() {
  const { user } = useStore()
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', topic: TOPICS[0], message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Please tell us your name'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (form.message.trim().length < 10) errs.message = 'A few more words, please'
    setErrors(errs)
    if (!Object.keys(errs).length) setSent(true)
  }

  return (
    <>
      <PageHero small eyebrow="Contact" title={<>We’re here, <em>day and night</em></>}>
        Our concierge team answers every message within a few hours, usually much sooner.
      </PageHero>

      <section className="section container">
        <div className="contact">
          <div className="glass-card contact__form">
            {sent ? (
              <div className="contact__sent" role="status">
                <span className="setting__icon"><Icon name="check" size={30} /></span>
                <h2>Thank you, {form.name.split(' ')[0]}</h2>
                <p className="muted">We’ve received your message and will reply to {form.email} shortly.</p>
                <button className="btn btn--ghost mt" onClick={() => { setSent(false); setForm({ ...form, message: '' }) }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2>Send us a message</h2>
                <div className="fields">
                  <label className="field">
                    Your name
                    <input value={form.name} onChange={set('name')} autoComplete="name" />
                    {errors.name && <span className="field__err">{errors.name}</span>}
                  </label>
                  <label className="field">
                    Email
                    <input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
                    {errors.email && <span className="field__err">{errors.email}</span>}
                  </label>
                  <label className="field field--full">
                    Topic
                    <select value={form.topic} onChange={set('topic')}>
                      {TOPICS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="field field--full">
                    Message
                    <textarea rows={6} value={form.message} onChange={set('message')} placeholder="Dates, guests, what you have in mind…" />
                    {errors.message && <span className="field__err">{errors.message}</span>}
                  </label>
                </div>
                <button className="btn btn--primary btn--lg mt">Send message <Icon name="arrow" size={18} /></button>
              </form>
            )}
          </div>

          <aside className="contact__side">
            <div className="contact__item">
              <Icon name="message" size={24} strokeWidth={1.3} />
              <div>
                <h3>Concierge</h3>
                <p>24/7 for guests with a booking. Reply from your trip page.</p>
              </div>
            </div>
            <div className="contact__item">
              <Icon name="globe" size={24} strokeWidth={1.3} />
              <div>
                <h3>Email</h3>
                <p>hello@{BRAND_LOWER}.example</p>
              </div>
            </div>
            <div className="contact__item">
              <Icon name="pin" size={24} strokeWidth={1.3} />
              <div>
                <h3>Studios</h3>
                <p>Paris · Dubai · Tokyo</p>
              </div>
            </div>
            <div className="contact__item">
              <Icon name="shield" size={24} strokeWidth={1.3} />
              <div>
                <h3>Urgent during a stay?</h3>
                <p>Use the emergency line in your booking confirmation. We answer in under a minute.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
