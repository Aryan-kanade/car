// ─────────────────────────────────────────────────────────────
// KMKIRAMYKI Advanced Chemistry: catalog data
// Single source of truth for products, categories and site links.
// ─────────────────────────────────────────────────────────────

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
})

export const formatPrice = (value: number) => inr.format(value)

export interface Rating {
  stars: number
  reviews: number
}

export interface Product {
  id: string
  category: string
  name: string
  price: number
  compareAt: number
  badge: string
  stock?: number
  dilutionMlPerLitre?: number
  imageLabel: string
  description: string
  usage?: string
  highlights?: string[]
  rating?: Rating
}

export interface CategoryRoute {
  slug: string
  name: string
  productCategory: string
  tagline: string
  description: string
}

export interface NavLinkItem {
  label: string
  to: string
}

export interface Bundle {
  title: string
  category: string
  productId: string
  product: string
  price: number
  compareAt: number
  imageLabel: string
  includes: string[]
}

export const FREE_SHIPPING_THRESHOLD = 7155

// ── Navigation ───────────────────────────────────────────────

export const navLinks: NavLinkItem[] = [
  { label: 'Clean & Protect', to: '/shop/clean-protect' },
  { label: 'Wheel & Tire Care', to: '/shop/wheel-tire' },
  { label: 'Interior Care', to: '/shop/interior' },
  { label: 'Glass Care', to: '/shop/glass' },
  { label: 'Accessories', to: '/shop/accessories' },
  { label: 'Shop All', to: '/shop' },
]

// ── Categories ───────────────────────────────────────────────

export const categoryRoutes: CategoryRoute[] = [
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

export const getCategoryBySlug = (slug: string) =>
  categoryRoutes.find((c: CategoryRoute) => c.slug === slug)

export const getCategoryForProduct = (product: Product) =>
  categoryRoutes.find((c: CategoryRoute) => c.productCategory === product.category)

export const countProductsInCategory = (productCategory: string): number =>
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

export const products: Product[] = [
  {
    id: 'complete-detail-kit',
    category: 'Kits & Bundles',
    name: 'Complete Detail Kit',
    price: 18125,
    compareAt: 20501,
    badge: 'Save 12%',
    stock: 9,
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
    stock: 7,
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
    stock: 3,
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
    stock: 11,
    dilutionMlPerLitre: 10,
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
    stock: 14,
    dilutionMlPerLitre: 20,
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
    stock: 5,
    dilutionMlPerLitre: 8,
    imageLabel: 'Minimalist product bottle on dark background: washberry shampooo',
    description:
      'Our gentlest daily shampoo, built on soapberry extract instead of harsh surfactants. Huge slick foam, wildberry scent, and zero stripping of wax, sealant or ceramic coatings.',
    usage:
      'Two capfuls in a 10-litre bucket. Wash top to bottom with a plush mitt, then rinse and dry.',
    highlights: ['Soapberry-based surfactants', 'Wax and coating safe', 'Lubricous slick foam'],
  },
  {
    id: 'wax-shampoo',
    category: 'Clean & Protect',
    name: 'Wax Shampoo',
    price: 439,
    compareAt: 699,
    badge: 'Save 37%',
    stock: 8,
    dilutionMlPerLitre: 8,
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
    stock: 10,
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
    stock: 9,
    dilutionMlPerLitre: 25,
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
    stock: 4,
    dilutionMlPerLitre: 15,
    imageLabel: 'Minimalist product bottle on dark background: glass cleaner',
    description:
      'A fast-evaporating glass formula that cuts films, fingerprints and traffic grime without streaking. Tint-safe, ammonia-free, and works in direct sun where most cleaners fail.',
    usage:
      'Spray onto a short-pile glass towel — not the glass — and wipe in one direction. Buff with a dry side.',
    highlights: ['Streak-free finish', 'Tint safe, ammonia-free', 'Direct-sun friendly'],
  },
  {
    id: 'twist-loop-drying-towel',
    category: 'Accessories',
    name: 'Twist-Loop Drying Towel',
    price: 649,
    compareAt: 999,
    badge: 'Save 35%',
    stock: 12,
    imageLabel: 'Folded twist-loop microfibre drying towel on dark background',
    description:
      'A 60×90 cm twist-loop microfibre that absorbs a full sedan in one pass. Edged in silk to keep paint safe, machine-washable hundreds of times without losing bite.',
    usage:
      'Lay flat on the panel and pull towards you — the towel drinks water without scrubbing. Wash separately from cotton, no fabric softener.',
    highlights: ['Absorbs a full sedan in one pass', 'Silk-edged, paint safe', 'Machine washable'],
  },
  {
    id: 'plush-wash-mitt',
    category: 'Accessories',
    name: 'Plush Wash Mitt',
    price: 449,
    compareAt: 749,
    badge: 'Save 40%',
    stock: 15,
    imageLabel: 'Plush microfibre wash mitt on dark background',
    description:
      'Deep-pile 1200 GSM microfibre mitt that lifts grit into the fibres and away from paint. Elastic cuff keeps it snug, and the two-tone pile shows when it is time to rinse.',
    usage:
      'Use one mitt for the upper body and a second for the lower panels. Rinse clean between sections in your rinse bucket.',
    highlights: ['1200 GSM deep pile', 'Grit-lifting fibres', 'Two-tone rinse indicator'],
  },
  {
    id: 'foam-applicator-set',
    category: 'Accessories',
    name: 'Foam Applicator Set',
    price: 299,
    compareAt: 499,
    badge: 'Save 40%',
    stock: 18,
    imageLabel: 'Set of foam applicator pads on dark background',
    description:
      'Four dense-foam applicator pads for dressings, polish and interior protectants. Rounded edges glide into vents and trim without soaking product into your hands.',
    usage:
      'Apply a few drops of product to the pad face and spread thin. Label one pad per chemistry to avoid cross-contamination.',
    highlights: ['Set of four pads', 'Dense foam, low soak', 'Rounded edge for trim'],
  },
  {
    id: 'detailing-brush-set',
    category: 'Accessories',
    name: 'Detailing Brush Set',
    price: 549,
    compareAt: 899,
    badge: 'Save 39%',
    stock: 9,
    imageLabel: 'Detailing brush set of three sizes on dark background',
    description:
      'Three boar-hair and synthetic blend brushes for emblems, vents, badges and wheel crevices. Chemical-resistant handles survive degreasers and iron removers.',
    usage:
      'Spray product on the brush — not the surface — then agitate. Shake out and rinse between panels.',
    highlights: [
      'Three sizes for every gap',
      'Boar-hair blend bristles',
      'Chemical-resistant handles',
    ],
  },
  {
    id: 'dual-layer-microfibre-pack',
    category: 'Accessories',
    name: 'Dual-Layer Microfibre Pack',
    price: 799,
    compareAt: 1249,
    badge: 'Save 36%',
    stock: 7,
    imageLabel: 'Stack of dual-layer microfibre towels on dark background',
    description:
      'Six 350 GSM dual-layer towels: plush side for buffing polish, tight-weave side for glass and interior trim. Colour-coded so glass towels never touch wheels.',
    usage:
      'Plush side for paint and polish, tight side for glass and screens. Wash warm, no softener.',
    highlights: ['Six colour-coded towels', 'Dual-sided weave', 'Lint-free on glass'],
  },
  {
    id: 'grit-guard',
    category: 'Accessories',
    name: 'Grit Guard',
    price: 399,
    compareAt: 649,
    badge: 'Save 39%',
    stock: 11,
    imageLabel: 'Bucket grit guard insert on dark background',
    description:
      'The unsung hero of the two-bucket method. This insert sits at the bottom of your rinse bucket, trapping released grit below the grille so your mitt never picks it back up.',
    usage:
      'Drop into a standard 12-inch bucket and fill above the grille. Rub the mitt across the radial fins to release dirt before reloading soap.',
    highlights: [
      'Traps grit below the grille',
      'Fits standard 12-inch buckets',
      'Radial dirt-release fins',
    ],
  },
  {
    id: 'sample-washberry',
    category: 'Free Sample',
    name: 'Washberry Sample · 50 ml',
    price: 0,
    compareAt: 0,
    badge: 'Free',
    stock: 99,
    imageLabel: 'Small 50 ml sample vial of washberry shampoo',
    description:
      'A complimentary 50 ml vial of our gentlest shampoo — enough for one full bucket wash. One per order, on the house.',
    usage: 'Half a cap in a 5-litre bucket for a single maintenance wash.',
    highlights: ['One per order', 'Enough for one wash'],
  },
  {
    id: 'sample-pre-wash',
    category: 'Free Sample',
    name: 'Pre Wash Sample · 50 ml',
    price: 0,
    compareAt: 0,
    badge: 'Free',
    stock: 99,
    imageLabel: 'Small 50 ml sample vial of pre wash shampoo',
    description:
      'A complimentary 50 ml vial of our touchless pre-wash soak. Try the scratch-prevention step before committing to a bottle.',
    usage: 'Dilute 1:10 in a spray bottle, dwell, rinse.',
    highlights: ['One per order', 'Touchless trial'],
  },
  {
    id: 'sample-glass',
    category: 'Free Sample',
    name: 'Glass Cleaner Sample · 50 ml',
    price: 0,
    compareAt: 0,
    badge: 'Free',
    stock: 99,
    imageLabel: 'Small 50 ml sample vial of glass cleaner',
    description:
      'A complimentary 50 ml vial of our streak-free glass chemistry. One interior-and-glass session on the house.',
    usage: 'Spray onto a short-pile towel and wipe in one direction.',
    highlights: ['One per order', 'Streak-free trial'],
  },
  {
    id: 'gift-card-1000',
    category: 'Gift Cards',
    name: 'Gift Card · ₹1,000',
    price: 1000,
    compareAt: 1000,
    badge: 'Digital delivery',
    stock: 99,
    imageLabel: 'KMKIRAMYKI digital gift card, one thousand rupees',
    description:
      'The perfect present for the detailer who has opinions about shampoo. Delivered by email, redeemable on everything in the store.',
    usage: 'Added to your order like any product; the code arrives by email after checkout.',
    highlights: ['No expiry', 'Redeemable storewide'],
  },
  {
    id: 'gift-card-2500',
    category: 'Gift Cards',
    name: 'Gift Card · ₹2,500',
    price: 2500,
    compareAt: 2500,
    badge: 'Digital delivery',
    stock: 99,
    imageLabel: 'KMKIRAMYKI digital gift card, two thousand five hundred rupees',
    description:
      'A full wash-stage system as a gift. Delivered by email, redeemable on everything in the store.',
    usage: 'Added to your order like any product; the code arrives by email after checkout.',
    highlights: ['No expiry', 'Redeemable storewide'],
  },
]

/** Shop-facing products — excludes free samples (cart-only offers). */
export const purchasableProducts: Product[] = products.filter((p) => p.category !== 'Free Sample')

/** Free samples offered once per order. */
export const freeSamples: Product[] = products.filter((p) => p.category === 'Free Sample')

export const getProductById = (id: string): Product | undefined => products.find((p) => p.id === id)

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

export interface SizeOption {
  label: string
  multiplier: number
}

export const getSizes = (product: Product): SizeOption[] | null =>
  (sizeOptions as Record<string, SizeOption[]>)[product.id] ?? null

export const defaultSizeLabel = (product: Product): string | null =>
  getSizes(product)?.[0]?.label ?? null

/** Parse a size label like '500 ml' or '1 L' into litres. */
export function sizeLitres(label: string | null): number | null {
  if (!label) return null
  const match = label.match(/([\d.]+)\s*(ml|l)/i)
  if (!match) return null
  const value = Number(match[1])
  return match[2].toLowerCase() === 'ml' ? value / 1000 : value
}

/** Resolve a product + size label to concrete pricing (rounded to ₹10). */
export interface Variant {
  label: string | null
  multiplier: number
  price: number
  compareAt: number
}

export function getVariant(product: Product, sizeLabel: string | null): Variant {
  const sizes = getSizes(product)
  const size: SizeOption | undefined =
    sizes?.find((s: SizeOption) => s.label === sizeLabel) ?? sizes?.[0]
  const multiplier = size?.multiplier ?? 1
  const round = (value: number) => Math.round((value * multiplier) / 10) * 10
  return {
    label: size?.label ?? null,
    multiplier,
    price: multiplier === 1 ? product.price : round(product.price),
    compareAt: multiplier === 1 ? product.compareAt : round(product.compareAt),
  }
}

// ── Bundles ──────────────────────────────────────────────────

export const bundles: Bundle[] = [
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

// ── Wash-stage comparison ─────────────────────────────────────

const WASH_STAGE_IDS = ['pre-wash-shampoo', 'washberry-shampoo', 'wax-shampoo'] as const

export const washStageComparison = {
  productIds: [...WASH_STAGE_IDS],
  columns: WASH_STAGE_IDS.map((id) => products.find((p) => p.id === id)?.name ?? id),
  rows: [
    { label: 'Use stage', values: ['Pre-wash soak', 'Contact wash', 'Wash + enhance'] },
    { label: 'Slickness', values: ['—', 'High', 'Medium'] },
    { label: 'Gloss boost', values: ['—', 'Light', 'High'] },
    { label: 'Adds protection', values: ['No', 'No', 'Yes — carnauba'] },
    {
      label: 'Best for',
      values: ['Dirt-heavy daily cars', 'Coated & PPF paint', 'Uncoated or waxed paint'],
    },
  ],
}

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
      { label: 'Build Your Kit', to: '/builder' },
      { label: 'Find Your Routine', to: '/quiz' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help & FAQ', to: '/help' },
      { label: 'Dilution Calculator', to: '/calculator' },
      { label: 'Guided Session', to: '/session' },
      { label: 'Wash Checklist', to: '/checklist' },
      { label: 'Shipping & Delivery', to: '/shipping' },
      { label: 'Returns & Exchanges', to: '/returns' },
      { label: 'Order Lookup', to: '/order-lookup' },
      { label: 'Order History', to: '/orders' },
      { label: 'My Garage', to: '/garage' },
      { label: 'My Account', to: '/account' },
      { label: 'My Shelf', to: '/shelf' },
      { label: 'Shine Score', to: '/shine-score' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Referral Program', to: '/referral' },
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

export const paymentMethods = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Netbanking', 'Wallets', 'COD']

export const legalLinks = [
  { label: 'Terms', to: '/terms' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Sitemap', to: '/sitemap' },
  { label: 'Design System', to: '/design' },
]
