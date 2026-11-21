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

Deploys to Cloudflare Workers (project "heaven") on every push to `main`.

## Backend and payments

The site runs in two modes:

- **Demo mode** (no env vars): accounts, trips and saved homes live in the visitor's browser and checkout is simulated.
- **Live mode**: Supabase handles accounts and the database, and Stripe Checkout takes payments.

### Setup

1. **Database.** Create a Supabase project and run the SQL files in `supabase/migrations/` in order. They create profiles, homes, bookings and wishlists, with row-level security. `scripts/seed-listings.ts` regenerates the homes seed from `src/data/listings.ts`.
2. **Functions.** Deploy `supabase/functions/create-checkout` with JWT verification on. Deploy `supabase/functions/stripe-webhook` with JWT verification off, because it is authenticated by the Stripe signature instead.
3. **Function secrets.** In Supabase, under Edge Functions → Secrets, set:
   - `STRIPE_SECRET_KEY`: `sk_test_…` while testing.
   - `STRIPE_WEBHOOK_SECRET`: `whsec_…`, from the webhook endpoint below.
   - `SITE_URL`: `https://heaven.skynovaagency.workers.dev`.
4. **Stripe webhook.** In Stripe, under Developers → Webhooks, add `https://<project>.supabase.co/functions/v1/stripe-webhook` with these events: `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed`.
5. **Site.** In Cloudflare, under Settings → Build → Variables, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, then redeploy.
6. **Auth emails.** In Supabase, under Authentication → URL Configuration, set the Site URL to the live site.

### How a booking works

1. The guest signs in, and `create-checkout` prices the stay from the `listings` table, so the browser can't change the price.
2. The function checks the dates are free, creates a `pending` booking that holds the dates for 30 minutes, and redirects to Stripe.
3. The webhook then marks the booking `confirmed` (instant book) or `requested`, or `expired` if the guest doesn't pay.

### Not built yet

- Host payouts (Stripe Connect).
- Charging the 50% balance 14 days before check-in.
- Automatic refunds on cancellation.
- Storing host-created homes in the database (the host tools are still browser-only).
