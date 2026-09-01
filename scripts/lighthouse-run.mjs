// Lighthouse budget gate: runs against the dev server (or preview if running)
import { spawnSync } from 'node:child_process'

// Budgets apply to the production preview (build + vite preview --port 4173)
const BASE = process.env.LIGHTHOUSE_BASE_URL ?? 'http://localhost:4173'
const BUDGETS = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 95 }

const result = spawnSync(
  'npx',
  ['lighthouse', BASE, '--output=json', '--chrome-flags=--headless', '--quiet'],
  { encoding: 'utf-8', shell: true, maxBuffer: 64 * 1024 * 1024 }
)
if (result.status !== 0) {
  console.error(result.stderr || 'lighthouse failed')
  process.exit(1)
}

const report = JSON.parse(result.stdout)
const scores = {}
let failed = false
for (const [category, budget] of Object.entries(BUDGETS)) {
  const score = Math.round((report.categories[category]?.score ?? 0) * 100)
  scores[category] = score
  const ok = score >= budget
  if (!ok) failed = true
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${category}: ${score} (budget ${budget})`)
}
console.log(`\nLighthouse ${failed ? 'FAILED' : 'PASSED'} against ${BASE}`)
process.exit(failed ? 1 : 0)
