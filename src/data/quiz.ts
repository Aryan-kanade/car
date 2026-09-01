// ─────────────────────────────────────────────────────────────
// Product-finder quiz: three questions, one recommended routine.
// ─────────────────────────────────────────────────────────────

import type { Product } from './catalog'

interface QuizChoice {
  value: string
  label: string
  hint: string
}

interface QuizQuestion {
  id: string
  question: string
  choices: QuizChoice[]
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'goal',
    question: 'What does your car need most right now?',
    choices: [
      { value: 'maintain', label: 'Keep it clean', hint: 'Weekly washes, no defects to fix' },
      {
        value: 'deep',
        label: 'Deep clean & decontaminate',
        hint: 'Dirt, brake dust, built-up grime',
      },
      {
        value: 'protect',
        label: 'Protect & add gloss',
        hint: 'Clean already — want shine and defence',
      },
    ],
  },
  {
    id: 'focus',
    question: 'Which surface bothers you most?',
    choices: [
      { value: 'paint', label: 'Paint', hint: 'The whole car body' },
      { value: 'wheels', label: 'Wheels & tyres', hint: 'Brake dust and dull rubber' },
      { value: 'interior', label: 'Interior', hint: 'Dash, trim, glass from inside' },
    ],
  },
  {
    id: 'method',
    question: 'How do you like to work?',
    choices: [
      { value: 'hand', label: 'By hand', hint: 'Bucket, mitt, patience' },
      { value: 'any', label: 'Whatever is fastest', hint: 'Give me the efficient path' },
    ],
  },
]

interface RoutineItem {
  productId: string
  reason: string
}

interface Routine {
  title: string
  summary: string
  items: RoutineItem[]
}

type Answers = Record<string, string>

const ROUTINES: Record<string, Routine> = {
  // goal: maintain
  'maintain|paint|hand': {
    title: 'The Maintenance Hand-Wash Routine',
    summary: 'Everything for a safe weekly hand wash — zero swirls, zero fuss.',
    items: [
      { productId: 'pre-wash-shampoo', reason: 'Loosens the dirt before your mitt touches paint' },
      { productId: 'washberry-shampoo', reason: 'Our gentlest wash — coating and PPF safe' },
      {
        productId: 'twist-loop-drying-towel',
        reason: 'Dries the whole car in one pass, no scratches',
      },
      { productId: 'grit-guard', reason: 'Keeps released grit at the bottom of your rinse bucket' },
    ],
  },
  'maintain|paint|any': {
    title: 'The Fast Maintenance Routine',
    summary: 'The two-bottle wash that keeps a clean car clean.',
    items: [
      { productId: 'pre-wash-shampoo', reason: 'Touchless first pass removes most of the dirt' },
      { productId: 'wax-shampoo', reason: 'Washes and adds carnauba gloss in one step' },
      { productId: 'plush-wash-mitt', reason: 'Deep pile lifts grit away from paint' },
    ],
  },
  'maintain|wheels|*': {
    title: 'The Wheel & Tyre Routine',
    summary: 'Brake dust does not survive this.',
    items: [
      { productId: 'wheel-cleaner', reason: 'Colour-changing formula dissolves bonded iron' },
      { productId: 'detailing-brush-set', reason: 'Reaches barrels, crevices and emblem gaps' },
      { productId: 'tyre-polish', reason: 'Dries to a satin finish that survives washes' },
    ],
  },
  'maintain|interior|*': {
    title: 'The Interior Refresh Routine',
    summary: 'A factory-fresh cabin in under an hour.',
    items: [
      { productId: 'dashboard-polish', reason: 'Satin finish with UV protection, zero grease' },
      { productId: 'glass-cleaner', reason: 'Streak-free interior glass, tint safe' },
      { productId: 'dual-layer-microfibre-pack', reason: 'Tight-weave side for trim and screens' },
    ],
  },
  // goal: deep
  'deep|paint|*': {
    title: 'The Deep Decon Routine',
    summary: 'For the car that has not been detailed in a while.',
    items: [
      { productId: 'pre-wash-shampoo', reason: 'Touchless soak to start safe' },
      { productId: 'degreaser', reason: 'Cuts engine bay, arches and door-shut grime' },
      { productId: 'washberry-shampoo', reason: 'Gentle contact wash after decon' },
      { productId: 'detailing-brush-set', reason: 'Agitates badges, vents and trim' },
    ],
  },
  'deep|wheels|*': {
    title: 'The Wheel Rescue Routine',
    summary: 'For wheels you have given up on.',
    items: [
      { productId: 'wheel-cleaner', reason: 'Dissolves months of brake dust on contact' },
      { productId: 'degreaser', reason: 'Backs up the iron remover on oil and road film' },
      { productId: 'detailing-brush-set', reason: 'Gets the barrel and every spoke gap' },
      { productId: 'tyre-polish', reason: 'Finishes the job with dressed, satin rubber' },
    ],
  },
  'deep|interior|*': {
    title: 'The Interior Deep Clean',
    summary: 'Scrub, protect, polish — the full cabin reset.',
    items: [
      { productId: 'degreaser', reason: 'Diluted safely for door shuts and plastics' },
      { productId: 'dashboard-polish', reason: 'Restores satin finish after cleaning' },
      { productId: 'glass-cleaner', reason: 'Final streak-free pass on all glass' },
      { productId: 'foam-applicator-set', reason: 'Even product spread into vents and trim' },
    ],
  },
  // goal: protect
  'protect|paint|*': {
    title: 'The Gloss & Protection Routine',
    summary: 'Clean paint, locked in for the season.',
    items: [
      { productId: 'wax-shampoo', reason: 'Every wash adds a layer of carnauba gloss' },
      { productId: 'pre-wash-shampoo', reason: 'Keeps the wash stage swirl-free' },
      {
        productId: 'dual-layer-microfibre-pack',
        reason: 'Buffing towels that will not mar the gloss',
      },
    ],
  },
  'protect|wheels|*': {
    title: 'The Dress & Protect Routine',
    summary: 'Wheels that stay cleaner for longer.',
    items: [
      { productId: 'wheel-cleaner', reason: 'Starts from a clean, decontaminated base' },
      { productId: 'tyre-polish', reason: 'Two coats for a deep, durable showroom sheen' },
      { productId: 'foam-applicator-set', reason: 'Thin, even coats without waste' },
    ],
  },
  'protect|interior|*': {
    title: 'The Cabin Defence Routine',
    summary: 'UV protection that keeps trim looking new.',
    items: [
      { productId: 'dashboard-polish', reason: 'UV inhibitors slow fading and cracking' },
      { productId: 'glass-cleaner', reason: 'Crystal glass makes the whole cabin feel new' },
      { productId: 'dual-layer-microfibre-pack', reason: 'Lint-free application every time' },
    ],
  },
}

export function getRoutine(answers: Answers): Routine {
  const key = `${answers.goal}|${answers.focus}|${answers.method}`
  return (
    ROUTINES[key] ??
    ROUTINES[`${answers.goal}|${answers.focus}|*`] ??
    ROUTINES['maintain|paint|any']
  )
}

export interface QuizProduct extends Product {}
