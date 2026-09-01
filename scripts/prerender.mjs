// Static prerender: render every public route to real HTML files in dist/
// so crawlers get content without migrating the Vite build pipeline.
// Usage: npm run build:full  (build + this script)
import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const ROUTES = [
  '/',
  '/shop',
  '/shop/clean-protect',
  '/shop/wheel-tire',
  '/shop/interior',
  '/shop/glass',
  '/shop/accessories',
  '/shop/kits-bundles',
  '/kits',
  '/builder',
  '/calculator',
  '/product/complete-detail-kit',
  '/product/essentials-wash-kit',
  '/product/dashboard-polish',
  '/product/pre-wash-shampoo',
  '/product/degreaser',
  '/product/washberry-shampoo',
  '/product/wax-shampoo',
  '/product/tyre-polish',
  '/product/wheel-cleaner',
  '/product/glass-cleaner',
  '/product/twist-loop-drying-towel',
  '/product/plush-wash-mitt',
  '/product/foam-applicator-set',
  '/product/detailing-brush-set',
  '/product/dual-layer-microfibre-pack',
  '/product/grit-guard',
  '/notes',
  '/notes/two-bucket-wash-method',
  '/notes/wheel-decontamination-guide',
  '/notes/ceramic-coating-prep',
  '/about',
  '/help',
  '/shipping',
  '/returns',
  '/order-lookup',
  '/contact',
  '/accessibility',
  '/terms',
  '/privacy',
  '/sitemap',
]

const DIST = fileURLToPath(new URL('../dist/', import.meta.url))
const PORT = 4173
const BASE = process.env.PRERENDER_BASE_URL ?? `http://localhost:${PORT}`

// Serve the production build, wait for it to accept connections
const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  shell: true,
  stdio: 'ignore',
})
const ready = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE)
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  throw new Error('preview server did not start')
}

const browser = await chromium.launch()
const page = await browser.newPage()

try {
  await ready()
  let rendered = 0
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)

    const html = await page.evaluate(() => {
      return '<!doctype html>\n' + document.documentElement.outerHTML
    })

    const filePath = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html')
    mkdirSync(join(filePath, '..'), { recursive: true })
    writeFileSync(filePath, html)
    rendered += 1
    console.log(`prerendered ${route}`)
  }
  console.log(`\n${rendered} routes prerendered into dist/`)
} finally {
  await browser.close()
  server.kill()
}
