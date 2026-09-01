import { expect, test } from '@playwright/test'

/**
 * Visual regression baselines — key pages in light AND dark themes.
 * Run `npx playwright test --update-snapshots` to (re)record baselines.
 * The live weather widget is mocked so home renders deterministically.
 */
const pages = [
  { name: 'home', path: '/' },
  { name: 'shop', path: '/shop' },
  { name: 'product', path: '/product/complete-detail-kit' },
  { name: 'builder', path: '/builder' },
  { name: 'design', path: '/design' },
  { name: 'orders', path: '/orders' },
]

test.beforeEach(async ({ page }) => {
  await page.route('**/api.open-meteo.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        daily: {
          precipitation_probability_max: [10, 20],
          relative_humidity_2m_max: [55, 60],
        },
      }),
    })
  )
})

for (const { name, path } of pages) {
  for (const theme of ['light', 'dark']) {
    test(`${name} (${theme}) matches baseline`, async ({ page }) => {
      if (theme === 'dark') {
        await page.addInitScript(() => {
          try {
            localStorage.setItem('kmkiramyki-theme', 'dark')
          } catch {
            /* no-op */
          }
        })
      }
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      // Deterministic capture: on Vite's dev server React mounts well after
      // DOMContentLoaded (cold module graph), and hero entrance animations run
      // ~1.3s past mount. Wait for fonts, then a settle window that covers
      // cold-mount + animation tails before screenshotting.
      await page
        .waitForFunction(() => document.fonts?.status === 'loaded', { timeout: 10_000 })
        .catch(() => {})
      await page.waitForTimeout(3200)

      expect(await page.screenshot({ fullPage: false })).toMatchSnapshot(`${name}-${theme}.png`, {
        maxDiffPixels: 200,
      })
    })
  }
}
