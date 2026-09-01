/**
 * Shared line illustrations for empty states — hand-drawn feel,
 * currentColor strokes so they adapt to both themes.
 */

export function EmptyBucket({ className = '' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Bucket */}
      <path d="M30 46 L36 96 Q36.5 102 43 102 L77 102 Q83.5 102 84 96 L90 46" />
      <ellipse cx="60" cy="46" rx="30" ry="8" />
      {/* Handle */}
      <path d="M36 50 Q36 26 60 26 Q84 26 84 50" />
      {/* Suds */}
      <circle cx="48" cy="42" r="4" />
      <circle cx="60" cy="40" r="5" />
      <circle cx="72" cy="43" r="3.5" />
      <circle cx="55" cy="34" r="3" />
      <circle cx="66" cy="33" r="2.5" />
      {/* Drops */}
      <path d="M44 62 q2 4 0 6 M60 68 q2 4 0 6 M76 62 q2 4 0 6" />
    </svg>
  )
}

export function LostKey({ className = '' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Spray bottle */}
      <path d="M48 44 L48 100 Q48 106 54 106 L72 106 Q78 106 78 100 L78 44" />
      <path d="M52 44 L52 34 Q52 28 58 28 L68 28 Q74 28 74 34 L74 44" />
      <path d="M58 28 L58 18 L68 14" />
      <path d="M68 14 L74 12" />
      {/* Trigger */}
      <path d="M74 20 L82 24 L78 30" />
      {/* Shine */}
      <path d="M30 44 L38 44 M26 54 L36 54 M30 64 L38 64" />
      {/* Mist */}
      <circle cx="92" cy="18" r="1.5" />
      <circle cx="98" cy="26" r="1.5" />
      <circle cx="94" cy="34" r="1.5" />
      {/* Label band */}
      <path d="M52 58 L74 58 M52 74 L74 74" />
    </svg>
  )
}

export function EmptyHeart({ className = '' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Mitt */}
      <path d="M40 100 Q30 100 30 88 L30 56 Q30 44 42 44 L78 44 Q90 44 90 56 L90 88 Q90 100 80 100 Z" />
      {/* Cuff */}
      <path d="M40 44 L40 30 Q40 24 46 24 L74 24 Q80 24 80 30 L80 44" />
      {/* Heart on mitt */}
      <path d="M60 76 C56 70 48 70 48 77 C48 82 54 86 60 90 C66 86 72 82 72 77 C72 70 64 70 60 76 Z" />
      {/* Sparkles */}
      <path d="M100 36 L100 44 M96 40 L104 40" />
      <path d="M22 60 L22 66 M19 63 L25 63" />
    </svg>
  )
}
