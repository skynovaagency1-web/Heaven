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
| `/destinations`, `/destinations/:slug` | Destination guides by region, and city pages with best time, travel time, local tips and stays |
| `/about`, `/contact` | Story, values and timeline; contact form with validation |
| `/help` | Searchable FAQ by topic |
| `/trust-safety`, `/cancellation` | Inspection process and stay guarantee; Flexible / Moderate / Strict refund tiers |
- Look: editorial layout with liquid glass and a deep red palette (#9C0412, #740107, #520102, #3D0606, #340506) on warm sand. Home: full-photo cover with a huge centred serif wordmark and a small pill CTA, a curved photo carousel, numbered sections (Stays, Places index, The feature with the city name set behind the photo, a guest quote, Hosting with curved image panels). Glossy tinted glass pills and round buttons, glass cards, red-black footer with an oversized wordmark. Set `HERO_VIDEO` in `src/brand.ts` to use a background video on the cover.
| `/signin`, `/signup`, `/account` | Demo sign-in (stored in the browser only) and account hub |

## Notes

- Built with Vite, React 18, TypeScript and React Router. No UI framework; styles live in `src/styles.css` with brand tokens at the top.
- Look: warm "liquid glass" (sand gradient with taupe and sage glows, translucent glass cards and pills, olive-brown CTAs; Cormorant Garamond headings, Jost body, Martian Mono labels), using the brand sheet's mark. Mobile has a floating glass bottom bar. Set `HERO_VIDEO` in `src/brand.ts` to use a MotionSites background video in the hero.
- Data is mocked in `src/data/listings.ts`. Wishlist, trips and host listings persist in `localStorage`. Payments are a demo; nothing is charged.
- Photos load from Unsplash. If one fails, a warm gradient placeholder is shown.
- SPA routing: `wrangler.jsonc` (Cloudflare) and `vercel.json` (Vercel).
