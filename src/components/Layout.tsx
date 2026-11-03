import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { Logo, Mark } from './ui'
import { useStore } from '../lib/store'
import { cx } from '../lib/utils'
import { BRAND, BRAND_LOWER } from '../brand'

function Navbar() {
  const { pathname } = useLocation()
  const { wishlist, trips, user } = useStore()
  const overHero = false
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
          <NavLink to="/destinations">Destinations</NavLink>
          <NavLink to="/wishlist">
            Wishlist{wishlist.length > 0 && <span className="pill-count">{wishlist.length}</span>}
          </NavLink>
          <NavLink to="/trips">
            Trips{trips.length > 0 && <span className="pill-count">{trips.length}</span>}
          </NavLink>
          {user ? (
            <NavLink to="/account" className="nav__user" aria-label="Your account">
              <span className="avatar avatar--initial avatar--sm" aria-hidden="true">{user.name.charAt(0)}</span>
              <span className="nav__user-name">{user.name.split(' ')[0]}</span>
            </NavLink>
          ) : (
            <NavLink to="/signin">Sign in</NavLink>
          )}
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
            <p>Private homes in twelve places, each one visited by us before it is offered to you.</p>
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
            <h4>Company</h4>
            <Link to="/about">About us</Link>
            <Link to="/destinations">Destinations</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/signin">Sign in</Link>
          </div>
          <div>
            <h4>Support</h4>
            <Link to="/trips">Your trips</Link>
            <Link to="/help">Help centre</Link>
            <Link to="/trust-safety">Trust &amp; safety</Link>
            <Link to="/cancellation">Cancellation options</Link>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} {BRAND}. All rights reserved.</span>
          <span className="footer__mark"><Mark size={16} /> {BRAND_LOWER}</span>
          <span className="footer__legal">
            <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link> · <Link to="/sitemap">Sitemap</Link>
          </span>
        </div>
      </div>
      <div className="footer__word" aria-hidden="true">{BRAND_LOWER}</div>
    </footer>
  )
}

/** Mobile only: floating glass bar with a raised search button in the middle. */
function BottomNav() {
  const { user, wishlist } = useStore()
  return (
    <nav className="bottom-nav" aria-label="Quick links">
      <NavLink to="/" end>
        <Icon name="home" size={20} strokeWidth={1.4} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/wishlist">
        <Icon name="heart" size={20} strokeWidth={1.4} />
        <span>Saved{wishlist.length > 0 && ` · ${wishlist.length}`}</span>
      </NavLink>
      <NavLink to="/stays" className="bottom-nav__center" aria-label="Search stays">
        <Icon name="search" size={22} />
      </NavLink>
      <NavLink to="/trips">
        <Icon name="calendar" size={20} strokeWidth={1.4} />
        <span>Trips</span>
      </NavLink>
      <NavLink to={user ? '/account' : '/signin'}>
        <Icon name="users" size={20} strokeWidth={1.4} />
        <span>{user ? 'Account' : 'Sign in'}</span>
      </NavLink>
    </nav>
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
      <BottomNav />
    </>
  )
}
