import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { Counter, Img } from '../components/ui'
import { AMENITIES, CATEGORIES, PROPERTY_TYPES, img, type Category, type Listing, type PropertyType } from '../data/listings'
import { useStore } from '../lib/store'
import { cx, money } from '../lib/utils'
import { errorText } from '../lib/api'

const PHOTO_LIBRARY = [
  '1600596542815-ffad4c1539a9',
  '1600607687939-ce8a6c25118c',
  '1600566753190-17f0baa2a6c3',
  '1616594039964-ae9021a400a0',
  '1505693416388-ac5ce068fe85',
  '1556909114-f6e7ad7d3136',
  '1512917774080-9991f1c4c750',
  '1618773928121-c32242e63f39',
].map((id) => img(id, 1600))

const STEPS = ['Basics', 'Location', 'Details', 'Photos', 'Pricing']

export default function NewListing() {
  const { addListing, uploadPhoto, online, user } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [uploading, setUploading] = useState(0)
  const [publishing, setPublishing] = useState(false)
  const [problem, setProblem] = useState('')
  const [d, setD] = useState({
    title: '',
    tagline: '',
    type: 'Villa' as PropertyType,
    category: 'Beachfront' as Category,
    city: '',
    country: '',
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    amenities: ['Wi‑Fi'] as string[],
    images: [] as string[],
    description: '',
    price: 450,
    cleaningFee: 90,
    instantBook: true,
  })
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD({ ...d, [k]: v })

  const ok = [
    d.title.trim().length >= 3,
    d.city.trim().length >= 2 && d.country.trim().length >= 2,
    true,
    d.images.length >= 1,
    d.price >= 50,
  ]

  async function addFiles(files: FileList | null) {
    if (!files) return
    const room = 5 - d.images.length
    const picked = Array.from(files).slice(0, room)
    setProblem('')
    setUploading((n) => n + picked.length)
    for (const f of picked) {
      try {
        if (f.size > 8 * 1024 * 1024) throw new Error(`${f.name} is larger than 8 MB`)
        const url = await uploadPhoto(f)
        setD((cur) => ({ ...cur, images: cur.images.length < 5 ? [...cur.images, url] : cur.images }))
      } catch (e) {
        setProblem(errorText(e))
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  // Listings are saved to the host's account, so ask them to sign in first.
  if (online && !user) return <Navigate to="/signin?next=/host/new" replace />

  async function publish() {
    const id = `${d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`
    const listing: Listing = {
      ...d,
      id,
      tagline: d.tagline || `${d.type} in ${d.city}`,
      description: d.description || `A beautiful ${d.type.toLowerCase()} in ${d.city}, ${d.country}.`,
      rating: 5,
      reviewCount: 0,
      hostId: 'h1',
      highlights: [
        { title: 'New on the collection', text: 'Be among the first guests to stay.' },
        { title: 'Self check-in', text: 'Arrive whenever suits you.' },
        { title: 'Concierge on call', text: 'Our team is a message away.' },
      ],
      custom: true,
    }
    setPublishing(true)
    setProblem('')
    try {
      const saved = await addListing(listing)
      navigate(`/stays/${saved.id}`)
    } catch (e) {
      setProblem(errorText(e))
      setPublishing(false)
    }
  }

  return (
    <div className="container page-narrow wizard">
      <Link to="/host/dashboard" className="back-link"><Icon name="arrowLeft" size={16} /> Host dashboard</Link>
      <h1 className="page__title">List your <em>home</em></h1>

      <ol className="progress">
        {STEPS.map((s, i) => (
          <li key={s} className={cx(i === step && 'is-on', i < step && 'is-done')}>
            <span>{i < step ? <Icon name="check" size={14} strokeWidth={2.4} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <div className="panel wizard__panel">
        {step === 0 && (
          <>
            <h2>What kind of place is it?</h2>
            <label className="field field--full">
              <span>Listing title</span>
              <input value={d.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Villa Serena" />
            </label>
            <label className="field field--full">
              <span>Short tagline</span>
              <input value={d.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="e.g. Olive-grove villa with sea views" />
            </label>
            <h4 className="mt">Property type</h4>
            <div className="chips-wrap">
              {PROPERTY_TYPES.map((t) => (
                <button key={t} type="button" className={cx('chip', d.type === t && 'is-on')} onClick={() => set('type', t)}>{t}</button>
              ))}
            </div>
            <h4 className="mt">Setting</h4>
            <div className="chips-wrap">
              {CATEGORIES.map((c) => (
                <button key={c.name} type="button" className={cx('chip', d.category === c.name && 'is-on')} onClick={() => set('category', c.name)}>
                  <Icon name={c.icon} size={16} /> {c.name}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2>Where is it?</h2>
            <div className="fields">
              <label className="field"><span>City</span><input value={d.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Lisbon" /></label>
              <label className="field"><span>Country</span><input value={d.country} onChange={(e) => set('country', e.target.value)} placeholder="e.g. Portugal" /></label>
            </div>
            <p className="muted small">Guests see the exact address only after booking.</p>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Rooms and amenities</h2>
            {(['guests', 'bedrooms', 'beds', 'baths'] as const).map((k) => (
              <div key={k} className="guest-row">
                <strong className="capitalize">{k}</strong>
                <Counter label={k} value={d[k]} min={1} max={30} onChange={(v) => set(k, v)} />
              </div>
            ))}
            <h4 className="mt">Amenities</h4>
            <div className="chips-wrap">
              {AMENITIES.map((a) => (
                <button key={a} type="button" className={cx('chip chip--sm', d.amenities.includes(a) && 'is-on')} onClick={() => set('amenities', d.amenities.includes(a) ? d.amenities.filter((x) => x !== a) : [...d.amenities, a])}>
                  {a}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Add photos and a description</h2>
            <p className="muted">Upload up to five photos of your home (JPEG, PNG or WebP, 8 MB max), or pick from our library. Selected: {d.images.length}/5</p>
            <label className={cx('btn btn--outline mt', d.images.length >= 5 && 'is-disabled')}>
              <Icon name="plus" size={18} /> {uploading ? `Uploading ${uploading}…` : 'Upload photos'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden disabled={d.images.length >= 5} onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
            </label>
            {d.images.some((src) => !PHOTO_LIBRARY.includes(src)) && (
              <div className="photo-pick mt">
                {d.images.filter((src) => !PHOTO_LIBRARY.includes(src)).map((src) => (
                  <button key={src} type="button" className="photo-pick__item is-on" onClick={() => set('images', d.images.filter((x) => x !== src))} aria-label="Remove photo">
                    <Img src={src} alt="" />
                    <span className="photo-pick__tick"><Icon name="check" size={14} strokeWidth={2.4} /></span>
                  </button>
                ))}
              </div>
            )}
            <h4 className="mt">Photo library</h4>
            <div className="photo-pick">
              {PHOTO_LIBRARY.map((src) => {
                const on = d.images.includes(src)
                return (
                  <button key={src} type="button" className={cx('photo-pick__item', on && 'is-on')} onClick={() => set('images', on ? d.images.filter((x) => x !== src) : d.images.length < 5 ? [...d.images, src] : d.images)} aria-pressed={on}>
                    <Img src={src} alt="" />
                    <span className="photo-pick__tick"><Icon name="check" size={14} strokeWidth={2.4} /></span>
                  </button>
                )
              })}
            </div>
            <label className="field field--full mt">
              <span>Description</span>
              <textarea rows={4} value={d.description} onChange={(e) => set('description', e.target.value)} placeholder="What makes your home special?" />
            </label>
          </>
        )}

        {step === 4 && (
          <>
            <h2>Set your price</h2>
            <div className="price-big">
              <button type="button" className="icon-btn" aria-label="Lower price" onClick={() => set('price', Math.max(50, d.price - 25))}><Icon name="minus" /></button>
              <span>{money(d.price)}</span>
              <button type="button" className="icon-btn" aria-label="Raise price" onClick={() => set('price', d.price + 25)}><Icon name="plus" /></button>
            </div>
            <p className="center muted">per night · you earn about {money(Math.round(d.price * 0.97))}</p>
            <div className="fields mt">
              <label className="field"><span>Cleaning fee</span><input type="number" value={d.cleaningFee} onChange={(e) => set('cleaningFee', Number(e.target.value))} /></label>
              <label className="switch field">
                <input type="checkbox" checked={d.instantBook} onChange={(e) => set('instantBook', e.target.checked)} />
                <span className="switch__track" />
                <span><strong>Instant book</strong><small>Guests can book without approval</small></span>
              </label>
            </div>
            <div className="preview mt">
              {d.images[0] && <Img src={d.images[0]} alt="" />}
              <div>
                <strong>{d.title || 'Untitled'}</strong>
                <span className="muted small">{d.type} · {d.city}, {d.country} · {d.guests} guests</span>
              </div>
            </div>
          </>
        )}
      </div>

      {problem && <p className="field__err" role="alert">{problem}</p>}
      <div className="wizard__nav">
        <button className="btn btn--ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
        {step < STEPS.length - 1 ? (
          <button className="btn btn--primary" disabled={!ok[step]} onClick={() => setStep(step + 1)}>Continue <Icon name="arrow" size={18} /></button>
        ) : (
          <button className="btn btn--primary" disabled={!ok.every(Boolean) || publishing || uploading > 0} onClick={publish}><Icon name="check" size={18} /> {publishing ? 'Publishing…' : 'Publish listing'}</button>
        )}
      </div>
    </div>
  )
}
