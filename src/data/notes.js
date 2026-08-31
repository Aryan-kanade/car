// ─────────────────────────────────────────────────────────────
// Lab Notes — detailing guides from the KMKIRAMYKI studio.
// ─────────────────────────────────────────────────────────────

export const notes = [
  {
    slug: 'two-bucket-wash-method',
    title: 'The Two-Bucket Wash Method',
    dek: 'The single biggest scratch-prevention upgrade you can make this weekend. No new skills required.',
    readingTime: '4 min read',
    date: '2026-08-12',
    category: 'Washing',
    sections: [
      {
        heading: 'Why it works',
        body: [
          'Every swirl mark on your paint was put there by a wash mitt. As you wipe, the mitt picks up grit, and without a way to release that grit, you drag it across the finish for the rest of the wash.',
          'The two-bucket method gives the grit somewhere to go. One bucket holds your shampoo solution, the other holds plain rinse water with a grit guard at the bottom. You load the mitt in the soap, wash a panel, then rinse the mitt in the second bucket before reloading. The dirt stays in the rinse bucket, not on your paint.',
        ],
      },
      {
        heading: 'The setup',
        body: [
          'Bucket one: two capfuls of Washberry Shampoo in 10 litres of water. Bucket two: plain water, ideally with a grit guard. Wash top to bottom — the lower panels carry the most contamination, so they come last.',
          'Pre-wash first. A pre-wash soak like ours dissolves the bulk of traffic film before contact, which means the mitt lifts far less dirt in the first place. Less dirt in the mitt is less dirt on the paint.',
        ],
      },
      {
        heading: 'Common mistakes',
        body: [
          'Using the same mitt for wheels and paint — never. Wheel mitts live in the garage bin, separate colour, always. And wringing the mitt against the grit guard is fine; scrubbing it is not. You want dirt to fall off, not ground through the fibres.',
          'Finally, dry with a twist-loop towel, not chamois or — please — an old t-shirt. The towel lifts residual water off the surface instead of pushing it around.',
        ],
      },
    ],
  },
  {
    slug: 'wheel-decontamination-guide',
    title: 'Wheel Decontamination, Done Properly',
    dek: 'Brake dust bonds to rims within days. Here is the safe sequence to remove it without dulling the finish.',
    readingTime: '5 min read',
    date: '2026-08-05',
    category: 'Wheels',
    sections: [
      {
        heading: 'Read your wheels first',
        body: [
          'Painted and powder-coated rims tolerate pH-balanced iron removers well. Machined faces with clear coat, PPF-covered lips and raw polished aluminium need more care — always test on one spoke and check the reaction after a minute.',
          'Cool wheels only. A hot rim bakes the cleaner dry before it can work, and dried chemical is where staining comes from.',
        ],
      },
      {
        heading: 'The sequence',
        body: [
          'Rinse thoroughly to remove loose dust. Spray Wheel Cleaner on one wheel at a time and watch the colour change — purple means the iron remover is grabbing embedded brake dust. Let it dwell 3–4 minutes, agitating the barrel and spokes with a soft brush.',
          'Rinse until the foam runs clear, then move to the next wheel. Working one at a time keeps the product from drying and gives each rim full attention.',
        ],
      },
      {
        heading: 'The finishing touch',
        body: [
          'Decontaminated rubber looks matte and tired. Dress it: a thin coat of Tyre Polish on a foam applicator, two coats for a deeper sheen, and ten minutes to cure before the car moves.',
          'A wheel that is properly decontaminated and dressed makes the whole car look freshly detailed — it is the highest-return 30 minutes in this hobby.',
        ],
      },
    ],
  },
  {
    slug: 'ceramic-coating-prep',
    title: 'Prepping Paint for a Ceramic Coating',
    dek: 'A coating locks in whatever is underneath it. Here is how to make sure that is perfect paint, not bonded grime.',
    readingTime: '6 min read',
    date: '2026-07-22',
    category: 'Protection',
    sections: [
      {
        heading: 'Decontaminate before you polish',
        body: [
          'Tar, iron and traffic film sit on top of the clear coat and clog polishing pads instantly. Wash normally, then go one step further: an iron remover over the lower panels and a degreaser wipe-down before any machine work.',
          'The bag test tells you what is left. Slide a thin plastic bag over your hand and feel the paint — bonded contamination you cannot see will grab the plastic. When it feels glassy, you are done decontaminating.',
        ],
      },
      {
        heading: 'Polish, then strip',
        body: [
          'Polishing removes the defects; a panel wipe removes the polishing oils. Coatings need to bond to bare clear, so finish with a dedicated panel-prep or an isopropyl mix and fresh, lint-free towels.',
          'Work in the shade, cool panels, one section at a time. If the wipe-down towel drags residue, stop and re-clean that section.',
        ],
      },
      {
        heading: 'Coating day rules',
        body: [
          'Low humidity, no direct sun, and no rushing. Apply in small squares, level with the second side of the applicator, and flash-time each section before moving on. High spots wiped within a minute level perfectly; missed high spots cure into shiny smudges.',
          'Cure time matters more than application time — no water for 24 hours, no washing for a week. After that, maintenance is a pH-balanced shampoo and a pre-wash. Which is exactly what we formulate for.',
        ],
      },
    ],
  },
]

export const getNoteBySlug = (slug) => notes.find((note) => note.slug === slug)
