import { build, loadEnv } from 'vite'

const env = loadEnv('production', process.cwd(), 'VITE_')
const contactEmail = (env.VITE_CONTACT_EMAIL || '').trim()
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
  throw new Error('Set the approved public VITE_CONTACT_EMAIL before building for Netlify.')
}

// Pre-built files for manual/API deployment; local and standalone previews stay separate.
await build({
  mode: 'production',
  define: {
    'import.meta.env.VITE_REGISTRATION_MODE': JSON.stringify('netlify'),
    'import.meta.env.VITE_CONTACT_EMAIL': JSON.stringify(contactEmail),
  },
  build: { outDir: 'artifacts/netlify-site', emptyOutDir: true },
})
console.log('Netlify files: artifacts/netlify-site (not deployed). Enable Netlify form detection before using registration.')
