import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { GUIDES } from '../data/destinations'
import { useStore } from '../lib/store'

export default function Sitemap() {
  const { listings } = useStore()
  const groups: { h: string; links: [string, string][] }[] = [
    { h: 'Explore', links: [['/', 'Home'], ['/stays', 'All stays'], ['/destinations', 'Destinations'], ['/wishlist', 'Wishlist'], ['/trips', 'Trips']] },
    { h: 'Company', links: [['/about', 'About us'], ['/contact', 'Contact'], ['/signin', 'Sign in'], ['/signup', 'Create account']] },
    { h: 'Support', links: [['/help', 'Help centre'], ['/trust-safety', 'Trust & safety'], ['/cancellation', 'Cancellation options'], ['/privacy', 'Privacy'], ['/terms', 'Terms']] },
    { h: 'Hosting', links: [['/host', 'Become a host'], ['/host/dashboard', 'Host dashboard'], ['/host/new', 'List your home']] },
    { h: 'Destinations', links: GUIDES.map((g) => [`/destinations/${g.slug}`, g.city]) },
    { h: 'Homes', links: listings.map((l) => [`/stays/${l.id}`, l.title]) },
  ]
  return (
    <>
      <PageHero small eyebrow="Sitemap" title="Every page, in one place" />
      <section className="section container sitemap">
        {groups.map((g) => (
          <div key={g.h}>
            <h2>{g.h}</h2>
            {g.links.map(([to, label]) => (
              <Link key={to} to={to}>{label}</Link>
            ))}
          </div>
        ))}
      </section>
    </>
  )
}
