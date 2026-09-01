// ─────────────────────────────────────────────────────────────
// Guided detailing session: routines expanded into timed steps,
// plus session-history persistence for streaks.
// ─────────────────────────────────────────────────────────────

const HISTORY_KEY = 'kmkiramyki-sessions'

export const sessionRoutines = [
  {
    id: 'maintenance-wash',
    title: 'Maintenance Wash',
    steps: [
      {
        name: 'Pre-wash soak',
        cue: 'Blanket the car. Let the foam dissolve the dirt — do not touch the paint yet.',
        seconds: 240,
      },
      { name: 'Rinse', cue: 'Top to bottom, push the loosened grit off the panel.', seconds: 120 },
      {
        name: 'Contact wash',
        cue: 'Two buckets, straight lines, one panel at a time. Reload the mitt often.',
        seconds: 420,
      },
      { name: 'Final rinse', cue: 'Sheet the water off to halve your drying time.', seconds: 120 },
      { name: 'Dry', cue: 'Lay the towel flat and pull. No scrubbing.', seconds: 300 },
    ],
  },
  {
    id: 'wheel-rescue',
    title: 'Wheel Rescue',
    steps: [
      {
        name: 'Cool down',
        cue: 'Wheels must be cool to the touch before chemistry.',
        seconds: 300,
      },
      {
        name: 'Wheel cleaner',
        cue: 'One wheel at a time. Watch the colour change as iron dissolves.',
        seconds: 240,
      },
      {
        name: 'Agitate',
        cue: 'Barrel, spokes, gaps — brush everything the cleaner touched.',
        seconds: 240,
      },
      { name: 'Rinse', cue: 'Fully clear the cleaner before it dries.', seconds: 120 },
      {
        name: 'Dress tyres',
        cue: 'Thin coat on the applicator, even coverage, cure before driving.',
        seconds: 180,
      },
    ],
  },
  {
    id: 'interior-refresh',
    title: 'Interior Refresh',
    steps: [
      { name: 'Declutter', cue: 'Everything out — you cannot clean around things.', seconds: 300 },
      { name: 'Vacuum', cue: 'Seats creviced, mats out and beaten, boot last.', seconds: 480 },
      {
        name: 'Wipe-down',
        cue: 'Damp towel on trim, dry towel to follow. One section at a time.',
        seconds: 480,
      },
      {
        name: 'Glass',
        cue: 'Product on the towel, not the glass. One direction per side.',
        seconds: 240,
      },
      {
        name: 'Protect',
        cue: 'Thin coat of protectant on the dash, buff after five minutes.',
        seconds: 300,
      },
    ],
  },
]

export function getSessionRoutine(id) {
  return sessionRoutines.find((routine) => routine.id === id) ?? sessionRoutines[0]
}

export function readSessions() {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function logSession(routineId) {
  try {
    const sessions = [{ routineId, at: Date.now() }, ...readSessions()].slice(0, 50)
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions))
  } catch {
    /* storage unavailable */
  }
}

/** Current streak of consecutive days (or weeks with ≥1 gap-free week) with a session. */
export function sessionStreak() {
  const sessions = readSessions()
  if (sessions.length === 0) return 0
  const days = new Set(sessions.map((s) => new Date(s.at).toDateString()))
  let streak = 0
  const cursor = new Date()
  // allow today OR yesterday as the streak anchor
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1)
  while (days.has(cursor.toDateString())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
