# KMKIRAMYKI Advanced Chemistry

A premium e-commerce storefront for an automotive detailing brand. Built as a complete
multi-page React SPA with a working demo commerce loop — cart, size variants, promo codes,
checkout and order lookup — plus a light/dark theme system and an on-brand content layer
(Lab Notes guides, dilution calculator).

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
src/
├── App.jsx               # Router + providers (cart, wishlist) + lazy routes
├── context/              # CartContext (items, promo, drawer), WishlistContext
├── hooks/                # usePageMeta (SEO), useTheme, useFocusTrap, useProductReviews
├── data/                 # catalog.js (products/categories), content.js, notes.js
├── utils/                # orders.js, promos.js, prefetch.js
├── components/           # Layout, Navbar + MegaMenu, SearchOverlay, CartDrawer,
│                         # ProductCard, ReviewSection, Calculator pieces, …
└── pages/                # Home, Shop, Product, Kits, Cart, Checkout, Notes,
                          # Calculator, OrderLookup, Contact, About, legal, 404
```

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
