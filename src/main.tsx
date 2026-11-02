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
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
)
