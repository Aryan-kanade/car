import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)
const section = page.locator('section').filter({ hasText: 'THE DIFFERENCE' })
const slider = section.locator('.group.relative').first()
const circle = slider.locator('.absolute.top-1\/2')
const line = slider.locator('div.pointer-events-none')
const before = { width: await line.evaluate((el) => getComputedStyle(el).width) }
await slider.hover()
await page.waitForTimeout(500)
const after = {
  lineWidth: await line.evaluate((el) => getComputedStyle(el).width),
  transform: await circle.evaluate((el) => getComputedStyle(el).transform),
}
console.log(JSON.stringify({ before, after }))
await browser.close()
