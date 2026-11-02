import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { Logo, Mark } from './ui'
import { useStore } from '../lib/store'
import { cx } from '../lib/utils'
import { BRAND, BRAND_LOWER } from '../brand'

function Navbar() {
  const { pathname } = useLocation()
  const { wishlist, trips } = useStore()
  const overHero = pathname === '/' || pathname === '/host'
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const transparent = overHero && !scrolled && !open

  return (
    <header className={cx('nav', transparent && 'nav--clear')}>
      <div className="container nav__inner">
        <Logo tone={transparent ? 'light' : 'ink'} />
        <nav className={cx('nav__links', open && 'is-open')} aria-label="Main">
          <NavLink to="/stays">Explore stays</NavLink>
          <NavLink to="/wishlist">
            Wishlist{wishlist.length > 0 && <span className="pill-count">{wishlist.length}</span>}
          </NavLink>
          <NavLink to="/trips">
            Trips{trips.length > 0 && <span className="pill-count">{trips.length}</span>}
          </NavLink>
          <NavLink to="/host/dashboard">Host dashboard</NavLink>
          <Link to="/host" className="btn btn--primary btn--sm nav__cta">
            Become a host
          </Link>
        </nav>
        <button className="icon-btn nav__burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo tone="light" />
            <p>Hand-picked villas, chalets and city hideaways, each one inspected in person and hosted by people who care.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <Link to="/stays?category=Beachfront">Beachfront</Link>
            <Link to="/stays?category=Mountain">Mountain retreats</Link>
            <Link to="/stays?category=City">City residences</Link>
            <Link to="/stays?category=Island">Island escapes</Link>
          </div>
          <div>
            <h4>Hosting</h4>
            <Link to="/host">Become a host</Link>
            <Link to="/host/dashboard">Host dashboard</Link>
            <Link to="/host/new">List your home</Link>
            <Link to="/hosts/h1">Meet our hosts</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link to="/trips">Your trips</Link>
            <a href="#help">Help centre</a>
            <a href="#safety">Trust &amp; safety</a>
            <a href="#cancel">Cancellation options</a>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} {BRAND}. All rights reserved.</span>
          <span className="footer__mark"><Mark size={16} /> {BRAND_LOWER}</span>
          <span>Privacy · Terms · Sitemap</span>
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
