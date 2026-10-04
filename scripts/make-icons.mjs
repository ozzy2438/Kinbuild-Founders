// Renders public/apple-touch-icon.png (180 × 180) from the logo mark in public/favicon.svg.
// Run: node scripts/make-icons.mjs  (uses Playwright's Chromium)
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

// The favicon adapts to dark mode; the home-screen icon keeps the light version.
const svg = (await readFile('public/favicon.svg', 'utf8')).replace(/@media[^}]*}[^}]*}/, '')
const html = `<!doctype html><html><body style="margin:0;width:180px;height:180px;display:grid;place-items:center;background:#f5f4f0">
<div style="width:112px;height:112px">${svg.replace('<svg ', '<svg width="112" height="112" ')}</div></body></html>`

const browser = await chromium.launch({ args: ['--no-sandbox'], executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined) })
const page = await browser.newPage({ viewport: { width: 180, height: 180 } })
await page.setContent(html)
await page.screenshot({ path: 'public/apple-touch-icon.png' })
await browser.close()
console.log('Icon: public/apple-touch-icon.png')
