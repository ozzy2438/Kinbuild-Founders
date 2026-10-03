import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const registrationMode = env.VITE_REGISTRATION_MODE || 'preview'
  if (!['preview', 'netlify'].includes(registrationMode)) {
    throw new Error('VITE_REGISTRATION_MODE must be preview or netlify.')
  }
  if (registrationMode === 'netlify' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((env.VITE_CONTACT_EMAIL || '').trim())) {
    throw new Error('Set a public VITE_CONTACT_EMAIL before enabling Netlify registration.')
  }
  return {
    plugins: [react()],
    server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  }
})
