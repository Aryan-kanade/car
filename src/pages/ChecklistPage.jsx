import PrintTheme from '../components/PrintTheme'

const ROUTINES = {
  maintenance: {
    title: 'Maintenance Wash Checklist',
    steps: [
      ['Pre-wash soak', 'Foam the whole car, dwell 3–5 min, do not touch paint'],
      ['Rinse thoroughly', 'Top to bottom, clear all loosened grit'],
      ['Two-bucket contact wash', 'Straight lines, one panel at a time, reload mitt often'],
      ['Wheels (separate mitt)', 'Wheel cleaner → brush → rinse'],
      ['Final sheet rinse', 'Let water sheet off to halve drying time'],
      ['Dry with twist-loop towel', 'Lay flat and pull — never scrub'],
      ['Glass last', 'Product on towel, one direction per side'],
    ],
    products: [
      'Pre Wash Shampoo',
      'Washberry Shampoo',
      'Twist-Loop Drying Towel',
      'Grit Guard',
      'Glass Cleaner',
    ],
  },
  deep: {
    title: 'Deep Decontamination Checklist',
    steps: [
      ['Pre-wash soak', 'Full foam blanket, dwell 5 min'],
      ['Degrease door shuts & arches', 'Agitate with brush, rinse fully'],
      ['Contact wash', 'Two buckets, gentle straight lines'],
      ['Iron remover on wheels', 'Watch colour change, rinse before drying'],
      ['De-tar lower panels', 'Small sections, rinse after'],
      ['Clay / decon towel', 'Lubricated straight passes only'],
      ['Re-wash clayed areas', 'Remove residue before drying'],
      ['Dry + inspect under light', 'Check for remaining bonded contamination'],
    ],
    products: [
      'Degreaser',
      'Wheel Cleaner',
      'Pre Wash Shampoo',
      'Detailing Brush Set',
      'Dual-Layer Microfibre Pack',
    ],
  },
}

/** Printable wash-day checklist — Ctrl+P gives a clean branded sheet. */
export default function ChecklistPage() {
  const params = new URLSearchParams(window.location.search)
  const kind = params.get('routine') === 'deep' ? 'deep' : 'maintenance'
  const routine = ROUTINES[kind]

  return (
    <div className="mx-auto max-w-2xl px-6 py-14 print:py-0">
      <PrintTheme />
      <div className="no-print mb-8">
        <a
          href={`?routine=${kind === 'deep' ? 'maintenance' : 'deep'}`}
          className="text-xs font-semibold tracking-[0.15em] text-zinc-500 dark:text-zinc-300 uppercase underline underline-offset-4"
        >
          Switch to {kind === 'deep' ? 'maintenance' : 'deep'} checklist
        </a>
      </div>

      <h1 className="font-display text-2xl font-bold tracking-[0.06em] uppercase text-zinc-900 dark:text-zinc-100">
        {routine.title}
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-300">
        KMKIRAMYKI Advanced Chemistry · Wash-day checklist
      </p>

      <ol className="mt-8 space-y-4">
        {routine.steps.map(([name, note], index) => (
          <li key={name} className="flex items-start gap-4 border-b border-zinc-200 pb-4">
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-zinc-400"
              aria-hidden="true"
            />
            <span>
              <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {index + 1}. {name}
              </span>
              <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-300">{note}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-lg border border-zinc-300 p-5">
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase">
          Products for this routine
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
          {routine.products.map((product) => (
            <li key={product} className="text-sm">
              ☐ {product}
            </li>
          ))}
        </ul>
      </div>

      <p className="no-print mt-10 text-sm text-zinc-500 dark:text-zinc-300">
        Tip: press Ctrl+P for a print-ready copy.
      </p>
    </div>
  )
}
