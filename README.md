# KMKIRAMYKI Advanced Chemistry

A premium e-commerce storefront for an automotive detailing brand. Built as a complete
multi-page React SPA with a real commerce loop — cart, size variants, promo codes,
Razorpay checkout (online + COD), Shiprocket fulfillment, live order tracking — plus a
light/dark theme system and an on-brand content layer (Lab Notes guides, dilution calculator).

## Stack

- **React 19 + Vite 8** — SPA with route-level code splitting (`React.lazy`)
- **React Router 7** — 26 routes (shop, PDPs, kits, builder, quiz, calculator, design system, orders, blog, legal, …) (shop, product pages, kits, cart, checkout, blog, legal…)
- **Tailwind CSS 4** — light/dark theming via a `dark` custom variant + `.dark` class
- **Phosphor Icons** (`@phosphor-icons/react`, light weight, deep CSR imports)
- **Framer Motion** — reveals, hero parallax, route transitions, drawer/toast motion
- **Vitest** — unit tests for pricing, orders and promo logic
- **Playwright** — E2E smoke of the purchase loop **+ axe-core a11y gate (0 violations across 18 routes)**
- **Lighthouse budgets** — perf ≥ 90, a11y ≥ 95, best-practices ≥ 95, SEO ≥ 95 against the production preview

## Scripts

| Command           | What it does                     |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start the dev server (port 5173) |
| `npm run build`   | Production build to `dist/`      |
| `npm run preview` | Preview the production build     |
| `npm test`        | Run unit tests once              |
| `npm run lint`    | ESLint (flat config)             |
| `npm run format`  | Prettier write                   |

## Structure

```
api/                        # Vercel serverless functions (Razorpay, Shiprocket, tracking)
├── create-order.js         # POST — validate + re-price cart, open Razorpay order / COD
├── verify-payment.js       # POST — verify checkout signature, mark paid, ship
├── track.js                # GET  — order lookup + live Shiprocket timeline
├── webhooks/razorpay.js    # POST — payment.captured / payment.failed safety net
└── _lib/                   # shared: db (Upstash REST), razorpay, shiprocket, helpers
src/
├── App.jsx               # Router + providers (cart, wishlist) + lazy routes
├── context/              # CartContext (items, promo, drawer), WishlistContext
├── hooks/                # usePageMeta (SEO), useTheme, useFocusTrap, useProductReviews
├── data/                 # catalog.ts (products/categories), content.js, notes.js
├── utils/                # pricing.ts (shared totals), orders.ts, promos.ts, razorpay.js
├── components/           # Layout, Navbar + MegaMenu, SearchOverlay, CartDrawer,
│                         # ProductCard, ReviewSection, Calculator pieces, …
└── pages/                # Home, Shop, Product, Kits, Cart, Checkout, Notes,
                          # Calculator, OrderLookup, Contact, About, legal, 404
```

## Signature experiences

- **360° bottle viewer** — canvas-drawn, drag-to-rotate product view on every PDP
- **Guided detailing session** (`/session`) — workout-app style timed stages with technique cues and wash streaks
- **Shine Score** (`/shine-score`) — 6-question paint assessment, animated gauge, product prescription
- **Virtual shelf** (`/shelf`) — mark what you own, get routine-gap analysis with one-tap fill
- **My Garage** (`/garage`) — vehicle profiles with matched routines (a first among detailing brands)
- **Weather coach** — geolocation + Open-Meteo wash-day forecast
- **Beading simulator** — untreated vs ceramic-coated rain physics
- **Foam-wipe hero** — wipe the suds off the hero with pointer
- **Wash-day checklists** (`/checklist`) — printable per routine

## Demo features

- **Commerce loop**: cart (localStorage) → checkout → `KMK-XXXXXX` order → lookup by
  number + email, with age-based status
- **Promo codes**: `WELCOME10` (10% off) and `FREESHIP`
- **Variants**: 500 ml / 1 L sizing with ₹10-rounded pricing (`getVariant`)
- **Wishlist + recently viewed**, product reviews, search overlay with type-ahead
- **Theme**: light default, dark toggle; preference persisted, honours system setting
- **A11y**: focus traps, skip link, aria-live cart announcements, 44px targets
- **SEO**: per-page titles/meta, JSON-LD (`Product`, `Article`), `sitemap.xml`, `robots.txt`

## Research tooling (vendored skills)

Two research skills live in `.skills/` for on-demand intelligence:

```bash
# Fresh last-30-days community research (Reddit, X, HN, GitHub — cited briefs)
python .skills/last30days/scripts/last30days.py "car detailing ecommerce trends"

# ui-ux-pro-max: searchable UX/style guideline corpus + design system generation
python .skills/ui-ux-pro-max/scripts/search.py "premium ecommerce" --design-system
```

The generated design system lives in `design-system/`. `impeccable` audits run via
`npx impeccable detect http://localhost:5173/<route>`.

## Design governance

The project keeps an **impeccable-clean** audit (`npx impeccable detect <url>`) and vendors
the [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill in
`.skills/` with a generated design system in `design-system/`.

## Deploying

The app is a full PWA: `vite-plugin-pwa` precaches assets and serves an offline fallback (service worker generated at build).

Any static host works. `vercel.json` includes the SPA rewrite; for other hosts, rewrite
all paths to `index.html`. Swap the placeholder domain in `public/sitemap.xml` and
`public/robots.txt` for the production host.

On Vercel the `/api/*` serverless functions deploy with the project automatically — the
SPA rewrite does not shadow them (filesystem routes win), and the service worker already
excludes `/api/*` from its fallback. See **Payments & shipping** below for the required
environment variables.

## Payments & shipping (Razorpay + Shiprocket)

Checkout runs on **Razorpay** (UPI / cards / netbanking / wallets, plus Cash on Delivery)
and fulfillment on **Shiprocket**, with paid orders stored in **Upstash Redis (Vercel KV)**
so tracking works from any device.

### Flow

```
/api/create-order   → validate + recompute totals from the catalog, store the order,
                      create a Razorpay order (online) or a Shiprocket COD shipment
Razorpay modal      → browser pays (checkout.js; only the public key id is exposed)
/api/verify-payment → server verifies the HMAC signature, marks paid, pushes to Shiprocket
/api/webhooks/razorpay → safety net if the browser dies mid-checkout
/api/track          → order lookup + live Shiprocket tracking timeline
```

All secrets stay server-side; the browser only ever receives the public key id and
normalized tracking data. Zero extra npm dependencies (plain `fetch` + `node:crypto`).

### 1. Razorpay (test mode first)

1. Create an account → Dashboard → **Settings → API Keys → Generate Test Key**.
2. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `VITE_RAZORPAY_KEY_ID` (same key id).
3. In **Settings → Webhooks**, add `https://<your-domain>/api/webhooks/razorpay` with the
   `payment.captured` and `payment.failed` events; set `RAZORPAY_WEBHOOK_SECRET` to the
   webhook secret you choose there.
4. Test cards: `4111 1111 1111 1111` (any future expiry, any CVV); UPI: `success@razorpay`.

### 2. Shiprocket

1. Create an account, complete pickup-location + courier onboarding in the panel.
2. Set `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` (panel login; the API derives its token
   from these and caches it). Optionally `SHIPROCKET_PICKUP_LOCATION` if your location
   is not named "Primary".
3. Set `SHIPROCKET_PICKUP_PINCODE` (your pickup address PIN) to unlock the live
   **PIN-code serviceability check** at checkout — deliverable/not, COD availability and
   real delivery dates. Without it the check silently no-ops.
4. Parcels default to 20×15×10 cm / 0.5 kg per unit and HSN 3402 — replace in
   `api/_lib/shiprocket.js` once the catalog carries real weights/dimensions.

### 3. Order storage — Upstash Redis (Vercel KV)

1. In Vercel → **Storage** → create an Upstash Redis (free tier is plenty) and **attach
   it to the project** — `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are set
   automatically (add them to `.env` for local dev).
2. Orders are kept for 90 days; each also carries a `rpid:` reverse key so webhooks can
   find the order from the Razorpay order id.

### 4. Merchant admin — `/admin/orders`

Set `ADMIN_TOKEN` (any long random string) and open `/admin/orders` — enter the token
once per browser session. Tabs: **Orders** (KPI cards: revenue 7d/30d, AOV, payment
success rate, prepaid/COD split; searchable table with AWB + courier-error retry),
**Pending payments** (abandoned checkouts with a copyable payment-resume link to
WhatsApp the customer), **Webhook log** (last 100 Razorpay events with outcomes) and
**Low stock**. CSV export included.

### Local development

`npm run dev` mounts the `/api` handlers through a Vite dev middleware (no Vercel CLI
needed). Copy `.env.example` → `.env` and fill in test keys; without keys the endpoints
return clear "not configured" errors and the frontend shows them at checkout.

### Notes & limits

- Server-side totals: `/api/create-order` re-prices the cart from `src/utils/pricing.ts`
  (shared with the cart UI), so a tampered client cannot underpay. Studio Points and gift
  cards remain device-local demo features — their discounts are accepted but clamped.
- COD is capped at ₹50,000, blocked for unserviceable PINs, and phone-throttled
  (max 2 COD orders per phone per 24h).
- Shiprocket failures never block checkout — the error is stored on the order record and
  can be re-pushed from the admin panel or the Shiprocket panel.

## Commerce features beyond payments & shipping

- **Payment recovery** — pending payments get a *Pay now* button (orders + lookup) that
  reopens the same live Razorpay order; the admin panel generates resume links.
- **Delivery UX** — live "order within Xh" countdown to the 2 PM IST ship cutoff, real
  EDDs from Shiprocket, a **Detail-Day planner** (pick your wash day → order-by date),
  and COD gating by PIN serviceability.
- **Saved profile + address book** — returning customers jump straight to payment with a
  shipping summary + edit; multiple saved addresses.
- **GST & gifting** — optional GSTIN/business name turns the invoice into a tax invoice;
  gift orders get a note + prices hidden on the packing-slip invoice (`/invoice/:number`).
- **Loyalty nudges** — prepaid orders earn **2× Studio Points**.
- **Share & track** — signed share links + WhatsApp share for tracking; auto-refreshing
  timeline with courier + AWB + ETD; post-delivery 3-tap survey feeding the admin panel.
- **Cost-per-wash economics** — dilution data powers "≈40 washes · ₹9.7 per wash" on
  PDPs, cards, cart and invoices ("this kit ≈ 6 months of washes").
- **Smart cart** — kit-completion suggestion when 2+ of a kit's products are in the cart,
  search-overlay quick-add, quiz/Shine-Score routine one-tap buy, 30-day price-low badges.
- **Retention** — abandoned-cart nudge (1–7 days quiet), shelf "mark empty" restock list
  with arrival timing, Garage wax/recoat tracker (~8-week countdown).
- **Abuse guards** — per-IP rate limits on every endpoint, idempotent order creation,
  COD phone throttle.
