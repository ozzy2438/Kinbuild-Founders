import { defineConfig } from '@playwright/test'
import { existsSync } from 'node:fs'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  projects: [
    { name: 'preview', testMatch: 'site.spec.ts' },
    { name: 'registration', testMatch: 'registration.spec.ts', use: { baseURL: 'http://127.0.0.1:4175' } },
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
      args: ['--no-sandbox'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [{
    command: 'npm run dev -- --host 0.0.0.0 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    env: { VITE_REGISTRATION_MODE: 'preview' },
    reuseExistingServer: !process.env.CI,
  }, {
    command: 'npm run dev -- --host 127.0.0.1 --port 4175 --strictPort',
    url: 'http://127.0.0.1:4175',
    env: { VITE_REGISTRATION_MODE: 'netlify', VITE_CONTACT_EMAIL: 'pilot@example.test', VITE_COMMUNITY_PULSE: 'on' },
    reuseExistingServer: false,
  }],
})
