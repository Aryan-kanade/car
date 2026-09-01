// Bundle budget gate: gzip-size ceilings for the built output.
import { readFileSync, readdirSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const DIST = fileURLToPath(new URL('../dist/assets/', import.meta.url))
const BUDGETS = { main: 150 * 1024, chunk: 25 * 1024 } // gzipped bytes (fuzzy search + smooth scroll + assistant live in main)

const files = readdirSync(DIST).filter((f) => f.endsWith('.js'))
let failed = false

for (const file of files) {
  const raw = readFileSync(join(DIST, file))
  const gzipped = gzipSync(raw).length
  const isMain = file.startsWith('index-')
  const budget = isMain ? BUDGETS.main : BUDGETS.chunk
  const ok = gzipped <= budget
  if (!ok) failed = true
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${file}  ${(gzipped / 1024).toFixed(1)} kB gz (budget ${(budget / 1024).toFixed(0)} kB)`
  )
}

console.log(failed ? '\nBundle budgets FAILED' : '\nBundle budgets passed')
process.exit(failed ? 1 : 0)
