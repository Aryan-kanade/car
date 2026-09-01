import { Link } from 'react-router'
import PageHeader from '../components/PageHeader'
import TrustRow from '../components/TrustRow'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import { usePageMeta } from '../hooks/usePageMeta'

const palette = [
  { name: 'zinc-950', hex: '#09090b', className: 'bg-zinc-950', dark: true },
  { name: 'zinc-900', hex: '#18181b', className: 'bg-zinc-900', dark: true },
  { name: 'zinc-800', hex: '#27272a', className: 'bg-zinc-800', dark: true },
  { name: 'zinc-600', hex: '#52525b', className: 'bg-zinc-600', dark: true },
  { name: 'zinc-500', hex: '#71717a', className: 'bg-zinc-500', dark: true },
  { name: 'zinc-400', hex: '#a1a1aa', className: 'bg-zinc-400', dark: true },
  { name: 'zinc-200', hex: '#e4e4e7', className: 'bg-zinc-200' },
  {
    name: 'zinc-50',
    hex: '#fafafa',
    className: 'bg-zinc-50 border border-zinc-200 dark:border-zinc-800',
  },
  {
    name: 'white',
    hex: '#ffffff',
    className: 'bg-white border border-zinc-200 dark:border-zinc-800',
  },
  {
    name: 'amber-700',
    hex: '#b45309',
    className: 'bg-amber-700',
    dark: true,
    note: 'urgency only',
  },
]

const typeScale = [
  { label: 'Display / XL', className: 'font-display text-5xl font-bold uppercase', sample: 'Aa' },
  { label: 'Display / L', className: 'font-display text-3xl font-bold uppercase', sample: 'Aa' },
  { label: 'Heading / H2', className: 'font-display text-xl font-bold uppercase', sample: 'Aa' },
  { label: 'Body / Large', className: 'text-base', sample: 'Aa' },
  { label: 'Body / Base', className: 'text-sm', sample: 'Aa' },
  { label: 'Label', className: 'text-xs uppercase tracking-[0.2em]', sample: 'Aa' },
  { label: 'Micro', className: 'text-[11px] uppercase tracking-[0.2em]', sample: 'Aa' },
]

const spacing = [1, 2, 3, 4, 6, 8, 12, 16, 20, 24]

function Section({ title, children }) {
  return (
    <section className="py-10 first:pt-0">
      <h2 className="font-display border-b border-zinc-200 dark:border-zinc-800 pb-3 text-lg font-bold tracking-[0.1em] uppercase text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

/** Living style guide — tokens and specimens rendered in the active theme. */
export default function DesignSystemPage() {
  usePageMeta(
    'Design System',
    'KMKIRAMYKI design tokens — palette, type scale, components and spacing, rendered live in the active theme.'
  )

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Design System' }]}
        title="Design System"
        subtext="Every token and component on this page is rendered live — toggle the theme in the navbar to see both sides of the system."
      />

      <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
        <Section title="Colour palette">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {palette.map((swatch) => (
              <li key={swatch.name}>
                <div className={`h-16 rounded-lg ${swatch.className}`} aria-hidden="true" />
                <p className="mt-2 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {swatch.name}
                  {swatch.note && (
                    <span className="ml-1.5 font-normal text-zinc-800 dark:text-zinc-400">
                      · {swatch.note}
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-800 dark:text-zinc-400 tabular-nums">
                  {swatch.hex}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Type scale">
          <ul className="space-y-4">
            {typeScale.map((row) => (
              <li
                key={row.label}
                className="flex items-baseline justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-4 last:border-b-0"
              >
                <span className={`${row.className} max-w-[46ch] text-zinc-900 dark:text-zinc-100`}>
                  {row.sample} Obsessive
                </span>
                <span className="shrink-0 text-xs text-zinc-800 dark:text-zinc-400">
                  {row.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[62ch] text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
            Space Grotesk Variable carries display and headings; Inter Variable carries body, labels
            and UI. Both are self-hosted variable fonts.
          </p>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="cursor-pointer bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Primary
            </button>
            <button
              type="button"
              className="cursor-pointer border border-zinc-300 dark:border-zinc-700 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
            >
              Secondary
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed bg-zinc-200 dark:bg-zinc-800 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-zinc-800 dark:text-zinc-400 uppercase"
            >
              Disabled
            </button>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap items-center gap-4">
            <span className="rounded-full bg-zinc-900 dark:bg-white px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white dark:text-zinc-900 uppercase">
              Save 45%
            </span>
            <span className="rounded-full border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-zinc-800 dark:text-zinc-300 uppercase">
              Subscription · 15% off
            </span>
            <span className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-400">
              Only 4 left
            </span>
            <span className="flex items-center gap-1 rounded-full border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-zinc-800 dark:text-zinc-300 uppercase">
              Verified
            </span>
          </div>
        </Section>

        <Section title="Form fields">
          <div className="max-w-md space-y-5">
            <div>
              <label
                htmlFor="ds-input"
                className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase"
              >
                Text input
              </label>
              <input
                id="ds-input"
                type="text"
                placeholder="you@example.com"
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none"
              />
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">Field error message</p>
          </div>
        </Section>

        <Section title="Accordion">
          <details
            open
            className="faq-item group border-t border-zinc-200 dark:border-zinc-800 border-b"
          >
            <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100 [&::-webkit-details-marker]:hidden">
              Native details accordion
              <span className="text-xs text-zinc-800 dark:text-zinc-400 group-open:hidden">＋</span>
              <span className="hidden text-xs text-zinc-800 dark:text-zinc-400 group-open:block">
                －
              </span>
            </summary>
            <p className="pb-5 text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
              Zero JavaScript — animated with ::details-content where supported.
            </p>
          </details>
        </Section>

        <Section title="Trust row">
          <TrustRow />
        </Section>

        <Section title="Comparison slider">
          <p className="mb-5 max-w-[62ch] text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
            Range-input driven — keyboard operable, drag optional.
          </p>
          <BeforeAfterSlider
            beforeLabel="Swirl-marked paint before detailing"
            afterLabel="Glossy corrected paint after detailing"
            className="max-w-xl"
          />
        </Section>

        <Section title="Spacing scale">
          <ul className="space-y-3">
            {spacing.map((step) => (
              <li key={step} className="flex items-center gap-4">
                <span className="w-12 shrink-0 text-xs text-zinc-800 dark:text-zinc-400">
                  {step * 4}px
                </span>
                <span
                  className="h-3 rounded-sm bg-zinc-900 dark:bg-white"
                  style={{ width: `${step * 4}px` }}
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Motion">
          <ul className="max-w-[70ch] space-y-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
            <li>· Route changes: native View Transitions, 120/180 ms fades</li>
            <li>· Reveals: motion/react whileInView, 400–600 ms, once per view</li>
            <li>· Drawers: spring (damping 30, stiffness 300)</li>
            <li>· Everything honours prefers-reduced-motion</li>
          </ul>
        </Section>

        <p className="mt-12 max-w-[58ch] text-sm text-zinc-800 dark:text-zinc-400">
          Quality gates: impeccable 0 findings, axe 0 violations, tsc strict, 18 tests, E2E.{' '}
          <Link
            to="/sitemap"
            className="underline underline-offset-4 transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            Site map
          </Link>
        </p>
      </div>
    </>
  )
}
