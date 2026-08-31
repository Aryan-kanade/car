// ─────────────────────────────────────────────────────────────
// KMKIRAMYKI Advanced Chemistry: editorial + policy content
// Drives the FAQ, About and generic Content pages.
// ─────────────────────────────────────────────────────────────

export const faqs = [
  {
    q: 'Are KMKIRAMYKI formulas safe on ceramic coatings and PPF?',
    a: 'Yes. Every wash-stage formula is pH-balanced and free of caustic solvents, so ceramic coatings, paint protection film and conventional wax layers are all safe. Our pre-wash and shampoos are tested on coated panels before release.',
  },
  {
    q: 'What does "pH-balanced" actually mean?',
    a: 'It means the formula sits near neutral (pH ~7) when diluted as directed. Acidic or alkaline cleaners can etch coatings, dull trim and dry out rubber over time. Neutral chemistry cleans effectively while leaving every surface exactly as the manufacturer intended.',
  },
  {
    q: 'How much is shipping, and when is it free?',
    a: 'Standard shipping is a flat ₹199 anywhere in India. Orders over ₹7,155 ship free — the cart page shows a live progress bar so you always know how close you are.',
  },
  {
    q: 'How fast do orders ship?',
    a: 'Orders placed before 4 PM IST on working days ship the same day. Metro cities typically receive orders in 2–3 days; the rest of India in 3–6 days. You will get a tracking link by email as soon as the parcel leaves our studio.',
  },
  {
    q: 'What is your returns policy?',
    a: 'Every purchase is covered by our 60-day guarantee. If a product does not perform the way we promised, write to us within 60 days of delivery and we will refund or replace it — even if the bottle is partly used.',
  },
  {
    q: 'Do I need to dilute the shampoos and cleaners?',
    a: 'Yes — most formulas are concentrates. Every bottle carries a dilution card, and each product page lists the exact ratio. A 500 ml bottle of shampoo typically yields 25+ full washes.',
  },
  {
    q: 'What is the difference between Washberry Shampoo and Wax Shampoo?',
    a: 'Washberry is our gentlest pure-clean shampoo, built on soapberry extract — the choice for coated cars. Wax Shampoo adds carnauba gloss and boosts beading with every wash, ideal for uncoated or waxed paint.',
  },
  {
    q: 'What is inside each kit?',
    a: 'The Kits page lists every item included in the WASH and PRO bundles. In short: WASH covers the weekly maintenance routine, PRO adds decontamination, glass, interior and tyre stages for full details.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Not yet. We currently ship only within India. International shipping is on the roadmap — join the waitlist via the contact page and we will tell you first.',
  },
  {
    q: 'Are your tools warrantied?',
    a: 'Microfibres, brushes and applicators carry a 30-day replacement warranty against manufacturing defects. Chemistry is covered by the 60-day performance guarantee.',
  },
]

// ── Testimonials (home page) ─────────────────────────────────

export const testimonials = [
  {
    name: 'Arjun Mehta',
    car: 'BMW M340i, full-front PPF',
    quote:
      'The pre-wash alone changed my wash routine. Zero marring after six months of weekly washes on coated paint — the dilution cards make it foolproof.',
    stars: 5,
  },
  {
    name: 'Sana Kapoor',
    car: 'Mahindra Thar, daily driver',
    quote:
      'Wheel Cleaner on brake-dusted black rims is witchcraft. One spray, watch it turn purple, rinse. My alloys have never looked like this since the showroom.',
    stars: 5,
  },
  {
    name: 'Rohit Verma',
    car: 'Honda City, 7 years old',
    quote:
      'Dashboard Polish brought my faded dash back to factory satin — no shine, no grease. Six weeks later it still repels dust. Worth every rupee.',
    stars: 5,
  },
]

// ── About ────────────────────────────────────────────────────

export const about = {
  headline: 'Chemistry first. Always.',
  intro:
    'KMKIRAMYKI started in a one-bay studio with a simple frustration: detailing products that promised everything and respected nothing — paint, coatings, or the person doing the work. So we built our own.',
  sections: [
    {
      title: 'Formulated, not relabelled',
      body: 'Every formula is developed in-house and iterated on real customer cars before it earns a label. If a batch does not outperform what it replaces, it never ships.',
      imageLabel: 'Chemist pouring a test formulation into a beaker in a lab',
    },
    {
      title: 'Studio-tested on real paint',
      body: 'We test on daily drivers, not just show cars — coated, wrapped, PPF-covered and bare panels. Safe on every surface is a requirement, not a marketing line.',
      imageLabel: 'Detailing studio with a car mid-detail under bright lights',
    },
    {
      title: 'Obsessive by design',
      body: 'Dilution cards on every bottle, scents you can tolerate in a closed garage, and packaging that tells you exactly what a formula does. The details are the product.',
      imageLabel: 'Close-up of neatly organised detailing product lineup on a shelf',
    },
  ],
  stats: [
    { value: '9', label: 'In-house formulas' },
    { value: '60', label: 'Day performance guarantee' },
    { value: '0', label: 'Caustic wash-stage chemicals' },
  ],
}

// ── Generic content pages ────────────────────────────────────

export const contentPages = {
  shipping: {
    slug: 'shipping',
    title: 'Shipping & Delivery',
    intro:
      'Fast, tracked delivery across India. Orders over ₹7,155 always ship free — the cart shows your progress toward the threshold in real time.',
    sections: [
      {
        heading: 'Dispatch times',
        body: [
          'Orders placed before 4 PM IST on working days are dispatched the same day. Orders after cutoff, on weekends or public holidays ship the next working day.',
          'You will receive a tracking link by email the moment your parcel leaves our studio.',
        ],
      },
      {
        heading: 'Delivery estimates',
        body: [
          'Metro cities: 2–3 working days. Rest of India: 3–6 working days. Remote PIN codes may add 1–2 days.',
          'Chemistry is shipped in double-walled cartons with leak-tested seals — damage in transit is replaced at our cost.',
        ],
      },
      {
        heading: 'Shipping charges',
        body: [
          'A flat ₹199 applies to orders under ₹7,155. Orders of ₹7,155 or more ship free, with no coupon needed.',
        ],
      },
    ],
    updated: 'January 2026',
  },
  returns: {
    slug: 'returns',
    title: 'Returns & Exchanges',
    intro:
      'Every purchase is backed by our 60-day performance guarantee. If a product does not do what we promised, we make it right.',
    sections: [
      {
        heading: 'The 60-day guarantee',
        body: [
          'Write to us within 60 days of delivery and we will refund or replace the product — even if the bottle is partly used. We ask only that you tell us what went wrong so the formulation team can learn from it.',
        ],
      },
      {
        heading: 'Damaged or incorrect items',
        body: [
          'Send a photo within 48 hours of delivery and a replacement ships immediately — no return shipment needed for leaking or damaged goods.',
        ],
      },
      {
        heading: 'How refunds work',
        body: [
          'Refunds are issued to the original payment method within 5–7 working days of approval. Prepaid labels are provided for approved returns; pickup is available in most metro PIN codes.',
        ],
      },
    ],
    updated: 'January 2026',
  },
  accessibility: {
    slug: 'accessibility',
    title: 'Accessibility',
    intro:
      'This storefront should work for everyone. We treat accessibility as part of the product, not a compliance exercise.',
    sections: [
      {
        heading: 'What we build to',
        body: [
          'We target WCAG 2.1 AA: text contrast of at least 4.5:1, visible keyboard focus on every interactive element, touch targets of at least 44 pixels, and full keyboard navigation of menus, filters and the cart.',
          'The site respects your operating system\'s reduced-motion setting — animations and the scrolling banner are disabled automatically when you ask for less motion.',
        ],
      },
      {
        heading: 'Reporting a barrier',
        body: [
          'If anything on this site is hard to see, hear or operate, tell us via the contact page and we will fix it. Accessibility reports jump our internal queue.',
        ],
      },
    ],
    updated: 'January 2026',
  },
  terms: {
    slug: 'terms',
    title: 'Terms & Conditions',
    intro:
      'The rules for using this website and buying from KMKIRAMYKI, in plain language.',
    sections: [
      {
        heading: 'Orders and pricing',
        body: [
          'All prices are listed in Indian Rupees and include applicable taxes. An order is an offer to buy; the contract forms when we dispatch the goods. We may correct pricing errors before dispatch.',
          'This storefront is a live demo — checkout does not process real payments.',
        ],
      },
      {
        heading: 'Product use',
        body: [
          'Detailing chemicals must be used as directed on the label and product pages. KMKIRAMYKI accepts no liability for damage caused by off-label use, incorrect dilution or use on unsuitable surfaces. Test on a hidden area first — always.',
        ],
      },
      {
        heading: 'Intellectual property',
        body: [
          'All content, formulations and imagery on this site are the property of KMKIRAMYKI and may not be reproduced without written permission.',
        ],
      },
    ],
    updated: 'January 2026',
  },
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    intro:
      'What we collect, why we collect it, and the control you keep. The short version: as little as possible.',
    sections: [
      {
        heading: 'What we store',
        body: [
          'When you add items to the cart, we keep that cart in your own browser\'s local storage — it never leaves your device until you choose to check out. We do not use third-party ad trackers.',
          'If you contact us, we keep your message and reply email address solely to answer you.',
        ],
      },
      {
        heading: 'Your control',
        body: [
          'Clearing your browser storage removes every trace of your cart instantly. To have any stored communication deleted, email us and we will erase it within 30 days.',
        ],
      },
      {
        heading: 'Payments',
        body: [
          'Payment details are handled by our payment processor and never touch our servers. This demo storefront does not transmit payment information at all.',
        ],
      },
    ],
    updated: 'January 2026',
  },
}
