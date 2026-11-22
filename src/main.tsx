import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles.css'
import { StoreProvider } from './lib/store'
import Layout from './components/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import ListingPage from './pages/Listing'
import Checkout from './pages/Checkout'
import Trips from './pages/Trips'
import Wishlist from './pages/Wishlist'
import HostLanding from './pages/HostLanding'
import HostDashboard from './pages/HostDashboard'
import NewListing from './pages/NewListing'
import HostProfile from './pages/HostProfile'
import NotFound from './pages/NotFound'
import Destinations from './pages/Destinations'
import Destination from './pages/Destination'
import About from './pages/About'
import Contact from './pages/Contact'
import Help from './pages/Help'
import TrustSafety from './pages/TrustSafety'
import Cancellation from './pages/Cancellation'
import Legal from './pages/Legal'
import Auth from './pages/Auth'
import Account from './pages/Account'
import Sitemap from './pages/Sitemap'
import { installSpotlight } from './lib/spotlight'

installSpotlight()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="stays" element={<Search />} />
            <Route path="stays/:id" element={<ListingPage />} />
            <Route path="book/:id" element={<Checkout />} />
            <Route path="trips" element={<Trips />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="host" element={<HostLanding />} />
            <Route path="host/dashboard" element={<HostDashboard />} />
            <Route path="host/new" element={<NewListing />} />
            <Route path="hosts/:id" element={<HostProfile />} />
            <Route path="destinations" element={<Destinations />} />
            <Route path="destinations/:slug" element={<Destination />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="help" element={<Help />} />
            <Route path="trust-safety" element={<TrustSafety />} />
            <Route path="cancellation" element={<Cancellation />} />
            <Route path="privacy" element={<Legal kind="privacy" />} />
            <Route path="terms" element={<Legal kind="terms" />} />
            <Route path="cookies" element={<Legal kind="cookies" />} />
            <Route path="legal-notice" element={<Legal kind="notice" />} />
            <Route path="signin" element={<Auth mode="signin" />} />
            <Route path="signup" element={<Auth mode="signup" />} />
            <Route path="account" element={<Account />} />
            <Route path="sitemap" element={<Sitemap />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
)
