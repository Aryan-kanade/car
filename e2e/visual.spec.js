import { expect, test } from '@playwright/test'

/**
 * Visual regression baselines — key pages in light AND dark themes.
 * Run `npx playwright test --update-snapshots` to (re)record baselines.
 */
const pages = [
  { name: 'home', path: '/' },
  { name: 'shop', path: '/shop' },
  { name: 'product', path: '/product/complete-detail-kit' },
  { name: 'builder', path: '/builder' },
  { name: 'design', path: '/design' },
  { name: 'orders', path: '/orders' },
]

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
      await page.waitForTimeout(1200)

      expect(await page.screenshot({ fullPage: false })).toMatchSnapshot(`${name}-${theme}.png`, {
        maxDiffPixels: 200,
      })
    })
  }
}
