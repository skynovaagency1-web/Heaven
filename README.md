# Heaven — luxury stays marketplace

A premium vacation-rental website: browse and filter hand-picked homes, view a listing, pick dates on a live availability calendar, check out, and manage trips. Hosts get a landing page with an earnings estimator, a dashboard, and a listing wizard.

> "Heaven" is a placeholder name. Change it in one place: `src/brand.ts`.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Pages

| Route | What it does |
| --- | --- |
| `/` | Hero search, categories, featured stays, destinations, host CTA |
| `/stays` | Search results with filters (price, type, bedrooms, amenities, instant book, top rated), sort, and date availability |
| `/stays/:id` | Gallery + lightbox, amenities, availability calendar, reviews, host, sticky booking widget with price breakdown |
| `/book/:id` | Checkout: guest details, pay-in-full or split, card form with validation |
| `/trips` | Booking confirmation and upcoming/past trips |
| `/wishlist` | Saved homes |
| `/host` | Become-a-host landing with earnings estimator |
| `/host/dashboard` | KPIs, earnings chart, reservations, pause/activate listings |
| `/host/new` | 5-step listing wizard; new listings appear in search |
| `/hosts/:id` | Host profile with contact form |

## Notes

- Built with Vite, React 18, TypeScript and React Router. No UI framework; styles live in `src/styles.css` with brand tokens at the top.
- Look: dark luxury (warm near-black, gold light, Cormorant Garamond display + Manrope body), using the brand sheet's mark. Spotlight cards and the reviews marquee follow 21st.dev patterns; set `HERO_VIDEO` in `src/brand.ts` to use a MotionSites background video in the hero.
- Data is mocked in `src/data/listings.ts`. Wishlist, trips and host listings persist in `localStorage`. Payments are a demo; nothing is charged.
- Photos load from Unsplash. If one fails, a warm gradient placeholder is shown.
- SPA routing: `wrangler.jsonc` (Cloudflare) and `vercel.json` (Vercel).
