// Renders public/og/startbeside-share.jpg (1200 × 630) for link previews.
// Run: node scripts/make-share-image.mjs  (uses Playwright's Chromium)
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'

const data = async (path, type) => `data:${type};base64,${(await readFile(path)).toString('base64')}`
const manrope = await data('node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2', 'font/woff2')
const inter = await data('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'font/woff2')
const arch = await data('public/images/startbeside-arch.webp', 'image/webp')
const logo = (await readFile('public/favicon.svg', 'utf8')).replace(/@media[^}]*}[^}]*}/, '')

const html = `<!doctype html><html><head><style>
@font-face { font-family: Manrope; src: url(${manrope}); font-weight: 200 800; }
@font-face { font-family: Inter; src: url(${inter}); font-weight: 100 900; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #f5f4f0; color: #191919; font-family: Inter; position: relative; overflow: hidden; }
.frame { position: absolute; inset: 0; background: radial-gradient(circle at 78% 46%, #ebe7df 0, #f5f4f0 52%); }
.copy { position: absolute; left: 72px; top: 70px; width: 600px; }
.eyebrow { font-size: 15px; letter-spacing: .22em; color: #595954; font-weight: 500; }
h1 { font-family: Manrope; font-weight: 800; font-size: 116px; line-height: .93; letter-spacing: -.075em; margin: 26px 0 0 -5px; }
h1 span { color: #a64b2a; }
p { margin-top: 30px; font-size: 27px; line-height: 1.38; letter-spacing: -.03em; max-width: 520px; }
.foot { position: absolute; left: 72px; bottom: 58px; display: flex; align-items: center; gap: 22px; }
.mark { display: flex; align-items: center; gap: 9px; font-family: Manrope; font-weight: 750; font-size: 30px; letter-spacing: -.035em; line-height: 1; }
.mark svg { width: 34px; height: 34px; margin-top: -2px; }
.pill { font-size: 15px; padding: 9px 16px; border-radius: 99px; background: #a64b2a; color: white; font-weight: 550; }
img { position: absolute; right: 18px; top: 40px; width: 560px; height: 560px; }
.rule { position: absolute; left: 72px; right: 72px; bottom: 132px; height: 1px; background: #d8d5cd; width: 470px; }
</style></head><body><div class="frame"></div>
<div class="copy"><div class="eyebrow">MELBOURNE · FOUNDING PILOT</div><h1>Don’t build<br>alone<span>.</span></h1><p>Meet people. Test a startup idea together. See if you’re a team.</p></div>
<div class="rule"></div><div class="foot"><span class="mark">${logo}StartBeside</span><span class="pill">Register your interest</span></div>
<img src="${arch}"></body></html>`

const browser = await chromium.launch({ args: ['--no-sandbox'], executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined) })
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: 'public/og/startbeside-share.jpg', type: 'jpeg', quality: 88 })
await browser.close()
console.log('Share image: public/og/startbeside-share.jpg')
