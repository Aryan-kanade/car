// ─────────────────────────────────────────────────────────────
// KMKIRAMYKI Advanced Chemistry: catalog data
// Single source of truth for products, categories and site links.
// ─────────────────────────────────────────────────────────────

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
})

export const formatPrice = (value) => inr.format(value)

export const FREE_SHIPPING_THRESHOLD = 7155

// ── Navigation ───────────────────────────────────────────────

export const navLinks = [
  { label: 'Clean & Protect', to: '/shop/clean-protect' },
  { label: 'Wheel & Tire Care', to: '/shop/wheel-tire' },
  { label: 'Interior Care', to: '/shop/interior' },
  { label: 'Glass Care', to: '/shop/glass' },
  { label: 'Accessories', to: '/shop/accessories' },
  { label: 'Shop All', to: '/shop' },
]

// ── Categories ───────────────────────────────────────────────

export const categoryRoutes = [
  {
    slug: 'clean-protect',
    name: 'Clean & Protect',
    productCategory: 'Clean & Protect',
    tagline: 'Wash chemistry that respects your paint.',
    description:
      'pH-balanced shampoos, pre-wash soaks and protection that lift dirt without stripping coatings, wax or sealant.',
  },
  {
    slug: 'wheel-tire',
    name: 'Wheel & Tire Care',
    productCategory: 'Wheel Care',
    tagline: 'Brake dust does not stand a chance.',
    description:
      'Iron-removing wheel cleaners and durable tyre dressings engineered for hot rims, heavy dust and weekly washes.',
  },
  {
    slug: 'interior',
    name: 'Interior Care',
    productCategory: 'Interior Care',
    tagline: 'A cabin that feels factory-fresh.',
    description:
      'Interior chemistry for dashboards, trim and upholstery — satin finishes, zero greasy residue, UV defence.',
  },
  {
    slug: 'glass',
    name: 'Glass Care',
    productCategory: 'Glass Care',
    tagline: 'Optical clarity, streak-free.',
    description:
      'Fast-evaporating glass chemistry and hydrophobic coatings for a windshield that stays clean through the season.',
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    productCategory: 'Accessories',
    tagline: 'The tools pros reach for.',
    description:
      'Microfibres, applicators, brushes and wash media — studio-tested hardware that pairs with our chemistry.',
  },
  {
    slug: 'kits-bundles',
    name: 'Kits & Bundles',
    productCategory: 'Kits & Bundles',
    tagline: 'Start with a kit. Finish faster.',
    description:
      'Curated combinations of our formulas and tools at a better price than buying piece by piece.',
  },
]

export const getCategoryBySlug = (slug) => categoryRoutes.find((c) => c.slug === slug)

export const getCategoryForProduct = (product) =>
  categoryRoutes.find((c) => c.productCategory === product.category)

export const countProductsInCategory = (productCategory) =>
  products.filter((p) => p.category === productCategory).length

// Home-page category showcase (numbered list)
export const categories = [
  {
    number: '01',
    name: 'Clean & Protect',
    to: '/shop/clean-protect',
    imageLabel: 'Close up of soapy car wash suds being rinsed off a glossy paint panel',
  },
  {
    number: '02',
    name: 'Wheel Care',
    to: '/shop/wheel-tire',
    imageLabel: 'Clean shiny car wheel with freshly dressed tyre reflecting light',
  },
  {
    number: '03',
    name: 'Interior Care',
    to: '/shop/interior',
    imageLabel: 'Spotless leather interior with a satin dashboard finish',
  },
  {
    number: '04',
    name: 'Glass Care',
    to: '/shop/glass',
    imageLabel: 'Crystal-clear windshield with water beading on hydrophobic glass',
  },
  {
    number: '05',
    name: 'Accessories',
    to: '/shop/accessories',
    imageLabel: 'Detailing accessories laid out: microfibres, applicators and brushes',
  },
]

// ── Products ─────────────────────────────────────────────────

export const products = [
  {
    id: 'complete-detail-kit',
    category: 'Kits & Bundles',
    name: 'Complete Detail Kit',
    price: 18125,
    compareAt: 20501,
    badge: 'Save 12%',
    rating: { stars: 5, reviews: 1 },
    imageLabel: 'Minimalist product bottles arranged as a kit on a dark background',
    description:
      'The full KMKIRAMYKI system in one box. Every stage of a complete detail — pre-wash, contact wash, decontamination, glass, interior and tyre dressing — paired with the applicators and microfibres to apply them. Built for the enthusiast who does the whole car, properly, in one session.',
    usage:
      'Work top to bottom: pre-wash, foam wash, decontaminate wheels, then glass, interior and tyres. Every formula includes its own dilution and application card.',
    highlights: [
      'Eight-formula complete system',
      'Includes applicators and microfibres',
      'Saves ₹2,376 versus buying individually',
    ],
  },
  {
    id: 'essentials-wash-kit',
    category: 'Kits & Bundles',
    name: 'Essentials Wash Kit',
    price: 7631,
    compareAt: 8581,
    badge: 'Save 11%',
    imageLabel: 'Array of wash products and microfiber towels arranged as a starter kit',
    description:
      'Everything a maintenance wash needs: pre-wash soak, two wash shampoos and plush microfibres. The kit we recommend to anyone starting serious detailing — enough chemistry for months of weekly washes.',
    usage:
      'Pre-wash to loosen dirt, then a two-bucket wash with your shampoo of choice. Dry with the included twist-loop microfibres.',
    highlights: [
      'Three-formula wash system',
      'Twist-loop drying towel included',
      'Coating and PPF safe',
    ],
  },
  {
    id: 'dashboard-polish',
    category: 'Interior Care',
    name: 'Dashboard Polish & Protectant',
    price: 549,
    compareAt: 999,
    badge: 'Save 45%',
    imageLabel: 'Minimalist product bottle on dark background: dashboard polish',
    description:
      'A satin-finish interior protectant that feeds plastics and vinyl back to factory look — no gloss, no grease, no sling. UV inhibitors slow fading and cracking on dashboards exposed to harsh sun.',
    usage:
      'Mist onto a microfibre applicator, spread thin and even over trim, then level with a dry side. One pass is enough.',
    highlights: ['Factory satin finish', 'UV inhibitors', 'Anti-static dust repellent'],
  },
  {
    id: 'pre-wash-shampoo',
    category: 'Clean & Protect',
    name: 'Pre Wash Shampoo',
    price: 549,
    compareAt: 999,
    badge: 'Save 45%',
    imageLabel: 'Minimalist product bottle on dark background: pre wash shampoo',
    description:
      'A touchless pre-wash soak that dissolves traffic film and lifts grit before your wash mitt ever touches paint. The single biggest scratch-prevention upgrade to any wash routine.',
    usage:
      'Dilute 1:10 in a foamer, blanket the car, dwell 3–5 minutes out of direct sun, then rinse thoroughly before contact washing.',
    highlights: ['Touchless dirt removal', 'Coating and PPF safe', 'pH-neutral formula'],
  },
  {
    id: 'degreaser',
    category: 'Clean & Protect',
    name: 'Degreaser',
    price: 425,
    compareAt: 800,
    badge: 'Save 47%',
    imageLabel: 'Minimalist product bottle on dark background: degreaser',
    description:
      'Heavy-duty water-based degreaser for engine bays, door shuts, arches and badges. Cuts grease and caked-on grime fast, then rinses clean without staining plastics or trim.',
    usage:
      'Spray on cool surfaces, agitate stubborn areas with a detail brush, rinse before the product dries. Test on hidden trim first.',
    highlights: ['Cuts engine grease fast', 'Rinses residue-free', 'Biodegradable formula'],
  },
  {
    id: 'washberry-shampoo',
    category: 'Clean & Protect',
    name: 'Washberry Shampoo',
    price: 389,
    compareAt: 749,
    badge: 'Save 48%',
    imageLabel: 'Minimalist product bottle on dark background: washberry shampooo',
    description:
      'Our gentlest daily shampoo, built on soapberry extract instead of harsh surfactants. Huge slick foam, wildberry scent, and zero stripping of wax, sealant or ceramic coatings.',
    usage: 'Two capfuls in a 10-litre bucket. Wash top to bottom with a plush mitt, then rinse and dry.',
    highlights: ['Soapberry-based surfactants', 'Wax and coating safe', 'Lubricous slick foam'],
  },
  {
    id: 'wax-shampoo',
    category: 'Clean & Protect',
    name: 'Wax Shampoo',
    price: 439,
    compareAt: 699,
    badge: 'Save 37%',
    imageLabel: 'Minimalist product bottle on dark background: wax shampoo',
    description:
      'A wash-and-enhance shampoo that lays down a layer of carnauba gloss every time you wash. Beading returns after the first use and builds with each maintenance wash.',
    usage:
      'Dilute as a normal shampoo, or boost gloss by letting the foam dwell 2 minutes on cool panels before rinsing.',
    highlights: ['Carnauba gloss enhancer', 'Boosts water beading', 'pH-balanced'],
  },
  {
    id: 'tyre-polish',
    category: 'Wheel Care',
    name: 'Tyre Polish',
    price: 649,
    compareAt: 1199,
    badge: 'Save 46%',
    imageLabel: 'Minimalist product bottle on dark background: tyre polish',
    description:
      'A solvent-based tyre dressing that dries to the touch and survives rain, washes and hundreds of kilometres. Adjustable sheen — one coat for satin, two for a deep showroom gloss.',
    usage:
      'Apply thin to clean, dry tyres with a foam applicator. Allow 10 minutes to cure before driving.',
    highlights: ['Dries to the touch', 'Lasts through washes', 'No sling formula'],
  },
  {
    id: 'wheel-cleaner',
    category: 'Wheel Care',
    name: 'Wheel Cleaner',
    price: 679,
    compareAt: 1149,
    badge: 'Save 41%',
    imageLabel: 'Minimalist product bottle on dark background: wheel cleaner',
    description:
      'Colour-changing wheel cleaner that dissolves embedded iron and brake dust on contact. Safe for painted, powder-coated and machined finishes when used as directed.',
    usage:
      'Spray on cool, dry wheels, watch the formula turn purple as it grabs iron, agitate if needed, then rinse fully.',
    highlights: ['Iron-activated colour change', 'Safe on coated wheels', 'Clings to verticals'],
  },
  {
    id: 'glass-cleaner',
    category: 'Glass Care',
    name: 'Glass Cleaner',
    price: 325,
    compareAt: 549,
    badge: 'Save 41%',
    imageLabel: 'Minimalist product bottle on dark background: glass cleaner',
    description:
      'A fast-evaporating glass formula that cuts films, fingerprints and traffic grime without streaking. Tint-safe, ammonia-free, and works in direct sun where most cleaners fail.',
    usage: 'Spray onto a short-pile glass towel — not the glass — and wipe in one direction. Buff with a dry side.',
    highlights: ['Streak-free finish', 'Tint safe, ammonia-free', 'Direct-sun friendly'],
  },
]

export const getProductById = (id) => products.find((p) => p.id === id)

// ── Size variants ────────────────────────────────────────────
// Kits ship as single boxes; bottles come in two sizes each.

const SIZES_STANDARD = [
  { label: '500 ml', multiplier: 1 },
  { label: '1 L', multiplier: 1.8 },
]

const SIZES_SMALL = [
  { label: '300 ml', multiplier: 1 },
  { label: '500 ml', multiplier: 1.55 },
]

const sizeOptions = {
  'pre-wash-shampoo': SIZES_STANDARD,
  'washberry-shampoo': SIZES_STANDARD,
  'wax-shampoo': SIZES_STANDARD,
  degreaser: SIZES_STANDARD,
  'wheel-cleaner': SIZES_STANDARD,
  'glass-cleaner': SIZES_STANDARD,
  'dashboard-polish': SIZES_SMALL,
  'tyre-polish': SIZES_SMALL,
}

export const getSizes = (product) => sizeOptions[product.id] ?? null

export const defaultSizeLabel = (product) => getSizes(product)?.[0]?.label ?? null

/** Resolve a product + size label to concrete pricing (rounded to ₹10). */
export function getVariant(product, sizeLabel) {
  const sizes = getSizes(product)
  const size = sizes?.find((s) => s.label === sizeLabel) ?? sizes?.[0]
  const multiplier = size?.multiplier ?? 1
  const round = (value) => Math.round((value * multiplier) / 10) * 10
  return {
    label: size?.label ?? null,
    multiplier,
    price: multiplier === 1 ? product.price : round(product.price),
    compareAt: multiplier === 1 ? product.compareAt : round(product.compareAt),
  }
}

// ── Bundles ──────────────────────────────────────────────────

export const bundles = [
  {
    title: 'WASH',
    category: 'Kits & Bundles',
    productId: 'essentials-wash-kit',
    product: 'Essentials Wash Kit',
    price: 7631,
    compareAt: 8581,
    imageLabel: 'Array of wash products and microfiber towels',
    includes: [
      'Pre Wash Shampoo (500 ml)',
      'Washberry Shampoo (500 ml)',
      'Wax Shampoo (500 ml)',
      '2× twist-loop drying towels',
      'Foam applicator pad',
    ],
  },
  {
    title: 'PRO',
    category: 'Kits & Bundles',
    productId: 'complete-detail-kit',
    product: 'Complete Detail Kit',
    price: 18125,
    compareAt: 20501,
    imageLabel: 'Full comprehensive detailing set in a box',
    includes: [
      'Everything in the WASH kit',
      'Degreaser (500 ml)',
      'Wheel Cleaner (500 ml)',
      'Glass Cleaner (500 ml)',
      'Dashboard Polish & Protectant (300 ml)',
      'Tyre Polish (300 ml) + tyre applicator',
      'Detailing brush set',
    ],
  },
]

export const valueProps = [
  {
    icon: 'droplets',
    title: 'PH-BALANCED',
    subtext: 'Safe on coatings and PPF',
  },
  {
    icon: 'shield',
    title: 'GRAVEL-GRADE DURABILITY',
    subtext: 'Protection that lasts seasons',
  },
  {
    icon: 'guarantee',
    title: 'BACKED BY A 60-DAY GUARANTEE',
    subtext: 'Love it or your money back',
  },
]

// ── Footer ───────────────────────────────────────────────────

export const footerColumns = [
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', to: '/shop' },
      { label: 'Clean & Protect', to: '/shop/clean-protect' },
      { label: 'Wheel & Tire Care', to: '/shop/wheel-tire' },
      { label: 'Interior Care', to: '/shop/interior' },
      { label: 'Glass Care', to: '/shop/glass' },
      { label: 'Accessories', to: '/shop/accessories' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help & FAQ', to: '/help' },
      { label: 'Shipping & Delivery', to: '/shipping' },
      { label: 'Returns & Exchanges', to: '/returns' },
      { label: 'Order Lookup', to: '/order-lookup' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Lab Notes', to: '/notes' },
      { label: 'Accessibility', to: '/accessibility' },
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Sitemap', to: '/sitemap' },
    ],
  },
]

export const paymentMethods = ['Visa', 'Mastercard', 'Amex', 'Apple Pay', 'PayPal']

export const legalLinks = [
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Sitemap', to: '/sitemap' },
]
