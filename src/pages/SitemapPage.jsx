import { Link } from 'react-router'
import PageHeader from '../components/PageHeader'
import { categoryRoutes, purchasableProducts } from '../data/catalog'
import { notes } from '../data/notes'
import { usePageMeta } from '../hooks/usePageMeta'

const groups = [
  {
    heading: 'Shop',
    links: [
      { label: 'All Products', to: '/shop' },
      ...categoryRoutes.map((c) => ({ label: c.name, to: `/shop/${c.slug}` })),
      { label: 'Curated Bundles', to: '/kits' },
      { label: 'Build Your Kit', to: '/builder' },
    ],
  },
  {
    heading: 'Products',
    links: purchasableProducts.map((p) => ({ label: p.name, to: `/product/${p.id}` })),
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help & FAQ', to: '/help' },
      { label: 'Dilution Calculator', to: '/calculator' },
      { label: 'Shipping & Delivery', to: '/shipping' },
      { label: 'Returns & Exchanges', to: '/returns' },
      { label: 'Order Lookup', to: '/order-lookup' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Cart', to: '/cart' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Lab Notes', to: '/notes' },
      ...notes.map((note) => ({ label: `Guide: ${note.title}`, to: `/notes/${note.slug}` })),
      { label: 'Accessibility', to: '/accessibility' },
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
    ],
  },
]

/** Sitemap — index of every page on the site. */
export default function SitemapPage() {
  usePageMeta('Sitemap', 'Every page on KMKIRAMYKI in one place.')
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Sitemap' }]}
        title="Sitemap"
        subtext="Every page on KMKIRAMYKI, in one place."
      />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:grid-cols-2 md:py-20 lg:grid-cols-4">
        {groups.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
              {group.heading}
            </h2>
            <ul className="mt-5 space-y-3">
              {group.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-zinc-500 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </>
  )
}
