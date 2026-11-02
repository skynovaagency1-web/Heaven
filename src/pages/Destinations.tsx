import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHero from '../components/PageHero'
import { Img } from '../components/ui'
import { GUIDES } from '../data/destinations'
import { img } from '../data/listings'
import { useStore } from '../lib/store'
import { cx } from '../lib/utils'

const REGIONS = ['All', ...Array.from(new Set(GUIDES.map((g) => g.region)))]

export default function Destinations() {
  const { listings } = useStore()
  const [region, setRegion] = useState('All')
  const shown = region === 'All' ? GUIDES : GUIDES.filter((g) => g.region === region)

  return (
    <>
      <PageHero image={img('1469854523086-cc02fe5d8800', 2200)} eyebrow="Destination guides" title={<>Where will you <em>wake up</em> next?</>}>
        Twelve places we know by heart, with the homes, seasons and small rituals that make each one special.
      </PageHero>

      <section className="section container">
        <div className="chips-wrap chips-center" role="tablist" aria-label="Filter by region">
          {REGIONS.map((r) => (
            <button key={r} role="tab" aria-selected={region === r} className={cx('chip', region === r && 'is-on')} onClick={() => setRegion(r)}>
              {r}
            </button>
          ))}
        </div>

        <div className="guides">
          {shown.map((g) => {
            const count = listings.filter((l) => l.city === g.city).length
            return (
              <Link key={g.slug} to={`/destinations/${g.slug}`} className="guide-card spot">
                <Img src={g.image.replace('w=1800', 'w=900')} alt="" />
                <div className="guide-card__body">
                  <span className="guide-card__region">{g.region}</span>
                  <h2>{g.city}</h2>
                  <span className="guide-card__meta">
                    {g.country} · {count} {count === 1 ? 'stay' : 'stays'}
                  </span>
                  <p>{g.intro}</p>
                  <span className="text-link">
                    Read the guide <Icon name="arrow" size={16} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
