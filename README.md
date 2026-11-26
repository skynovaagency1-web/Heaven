# Heaven — luxury stays marketplace

A premium vacation-rental website: browse and filter hand-picked homes, view a listing, pick dates on a live availability calendar, check out, and manage trips. Hosts get a landing page with an earnings estimator, a dashboard, and a listing wizard.

> "Heaven" is a placeholder name. Change it in one place: `src/brand.ts`.

## Run it

```bash
npm install
npm run dev               # front end only, http://localhost:5173 (browser-only demo mode)

npm run db:migrate:local  # once: create the local D1 tables
npm run dev:cf            # full stack (site + API + local D1/R2), http://localhost:8787
```

## Hosting: all on Cloudflare

| Piece | Cloudflare product | Name |
| --- | --- | --- |
| Website + API | Workers (static assets + `worker/index.ts`) | `heaven` |
| Database | D1 | `heaven-db` (bindings in `wrangler.jsonc`) |
| Host photos | R2 | `heaven-media`, served at `/media/<key>` |

What the API stores in D1: accounts (PBKDF2 passwords, HttpOnly session cookie), listings hosts publish, bookings (server-side price and double-booking check), wishlists, contact and host messages. Schema: `migrations/`.

- Pushing to `main` builds and deploys through Workers Builds. `wrangler.jsonc` has `build.command`, so Wrangler builds `dist/` itself before every deploy or PR preview.
- New migration: add `migrations/000N_name.sql`, then `npm run db:migrate` (needs `wrangler login`).
- Read data: Cloudflare dashboard → Storage & Databases → D1 → heaven-db → Console, e.g. `SELECT * FROM bookings ORDER BY created_at DESC`.
- If the API is not reachable (plain `vite dev`), the site falls back to browser storage so the demo still works.
- Payments: Stripe Checkout, switched on by the `STRIPE_SECRET_KEY` secret (see below). Without it, bookings are saved but nothing is charged.

## Payments (Stripe)

How a paid booking works:
1. `POST /api/bookings` prices the stay on the server and saves it as `pending`, which holds the dates for 30 minutes. It then returns a Stripe Checkout link.
2. The guest pays on Stripe's page, so card numbers never reach this site.
3. Stripe calls `/api/stripe/webhook`. The booking becomes `confirmed` for instant-book homes, or `requested` otherwise. If the guest never pays, it becomes `expired` and the dates free up.
4. When a guest cancels, the refund follows the policy shown at checkout and is sent automatically: the full amount 30+ days before check-in, 50% of the total 7+ days before, nothing after that.

Setup (do it in test mode first):
1. Apply the schema change once: `npm run db:migrate`. This runs `migrations/0002_payments.sql`.
2. In Stripe → Developers → API keys, copy the secret key (`sk_test_…`). In Cloudflare → Workers & Pages → heaven → Settings → Variables and Secrets, add it as a **Secret** named `STRIPE_SECRET_KEY`.
3. In Stripe → Developers → Webhooks, add the endpoint `https://heaven.skynovaagency.workers.dev/api/stripe/webhook` with these events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`

   Copy its signing secret (`whsec_…`) into a Cloudflare secret named `STRIPE_WEBHOOK_SECRET`.
4. Test with the card `4242 4242 4242 4242`, any future date and any CVC. Then swap in the live keys.

Not built yet:
- Charging the remaining 50% before check-in for "pay half now" bookings. The card is saved for it.
- Host payouts (Stripe Connect).
- Hosts accepting or declining requests.

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
| `/signin`, `/signup`, `/account` | Real accounts (D1) and account hub |
| `/privacy`, `/terms`, `/cookies`, `/legal-notice` | Legal pages (fill the `[placeholders]` in `src/pages/Legal.tsx`) |

## Notes

- Built with Vite, React 18, TypeScript and React Router. No UI framework; styles live in `src/styles.css` with brand tokens at the top.
- Look: warm "liquid glass" (sand gradient with taupe and sage glows, translucent glass cards and pills, olive-brown CTAs; Cormorant Garamond headings, Jost body, Martian Mono labels), using the brand sheet's mark. Mobile has a floating glass bottom bar. Set `HERO_VIDEO` in `src/brand.ts` to use a MotionSites background video in the hero.
- The curated catalogue lives in `src/data/listings.ts`. Accounts, bookings, wishlists, host listings and messages live in Cloudflare D1; uploaded photos in R2. Payments go through Stripe Checkout when `STRIPE_SECRET_KEY` is set.
- Photos load from Unsplash. If one fails, a warm gradient placeholder is shown.
- SPA routing: `wrangler.jsonc` (Cloudflare).

Deploys to Cloudflare Workers (project "heaven") on every push to `main`.
