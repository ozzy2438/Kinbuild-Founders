import { build, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const env = loadEnv('production', process.cwd(), 'VITE_')

await build({
  configFile: false,
  plugins: [react()],
  publicDir: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    // Downloaded files must never imply they can collect real registrations.
    'import.meta.env.VITE_REGISTRATION_MODE': JSON.stringify('preview'),
    'import.meta.env.VITE_CONTACT_EMAIL': JSON.stringify((env.VITE_CONTACT_EMAIL || '').trim()),
  },
  build: {
    outDir: 'artifacts/standalone', emptyOutDir: true, cssCodeSplit: false,
    lib: { entry: 'src/main.tsx', name: 'StartBesideStandalone', formats: ['iife'], fileName: 'startbeside' },
  },
})

const files = [
  ['/images/startbeside-arch.webp', 'image/webp'],
  ['/media/startbeside-film.mp4', 'video/mp4'],
  ['/media/startbeside-loop.mp4', 'video/mp4'],
  ['/media/startbeside-poster.webp', 'image/webp'],
  ['/media/startbeside-team.webp', 'image/webp'],
  ['/images/startbeside-toy-gateway.webp', 'image/webp'],
  ['/images/arch-left.webp', 'image/webp'],
  ['/images/arch-right.webp', 'image/webp'],
  ['/images/arch-top.webp', 'image/webp'],
]
let js = await readFile('artifacts/standalone/startbeside.iife.js', 'utf8')
let html = (await readFile('index.html', 'utf8')).replaceAll('__SITE_URL__', '')
for (const [path, mime] of files) {
  const data = `data:${mime};base64,${(await readFile(`public${path}`)).toString('base64')}`
  js = js.replaceAll(path, () => data)
  html = html.replaceAll(path, () => data)
}
const css = await readFile('artifacts/standalone/startbeside.css', 'utf8')
html = html.replace('</head>', () => `<style>${css.replaceAll('</style', '<\\/style')}</style></head>`)
html = html.replace('<script type="module" src="/src/main.tsx"></script>', () => `<script>${js.replaceAll('</script', '<\\/script')}</script>`)
await mkdir('artifacts', { recursive: true })
await writeFile('artifacts/StartBeside.html', html)
console.log(`Self-contained website: artifacts/StartBeside.html (${(Buffer.byteLength(html) / 1048576).toFixed(1)} MiB)`)
