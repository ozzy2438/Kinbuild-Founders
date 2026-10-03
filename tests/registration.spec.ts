import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function fillInterest(page: Page) {
  await page.goto('/#register')
  await page.getByLabel('Your name', { exact: true }).fill(' Alex Example ')
  await page.getByLabel('Email address').fill('alex@example.test')
  await page.getByLabel('Your sector').selectOption('SaaS & software')
  await page.getByLabel('Your main skill').selectOption('Engineering & development')
  await page.getByLabel('Someone who designs').check()
  await page.getByLabel('Someone who grows it').check()
  await page.getByLabel('Taking the lead').check()
  await page.getByLabel('4–6 hours').check()
  await page.getByLabel('Weekday evenings').check()
  await page.getByLabel('Weekends').check()
}

test('registration waits for acceptance, prevents duplicate sends and explains the next step', async ({ page }) => {
  const submissions: URLSearchParams[] = []
  let accept!: () => void
  const accepted = new Promise<void>(resolve => { accept = resolve })
  await page.route('**/*', async route => {
    if (route.request().method() !== 'POST') return route.continue()
    submissions.push(new URLSearchParams(route.request().postData()!))
    expect(route.request().headers()['content-type']).toBe('application/x-www-form-urlencoded')
    await accepted
    await route.fulfill({ status: 200, body: 'Accepted' })
  })
  await fillInterest(page)
  await page.getByRole('button', { name: 'Register your interest', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Sending your interest…' })).toBeDisabled()
  await expect(page.getByLabel('Your name', { exact: true })).toBeDisabled()
  await expect(page.getByText('INTEREST RECEIVED', { exact: true })).toHaveCount(0)
  await page.locator('form.interest-form').evaluate(form => (form as HTMLFormElement).requestSubmit())
  await expect.poll(() => submissions.length).toBe(1)
  expect(Object.fromEntries(submissions[0])).toEqual({
    'form-name': 'startbeside-interest', 'bot-field': '', name: 'Alex Example',
    email: 'alex@example.test', sector: 'SaaS & software', skill: 'Engineering & development',
    looking_for: 'Design, Grow', working_style: 'Taking the lead',
    weekly_hours: '4–6 hours', availability: 'Weekday evenings, Weekends',
  })
  accept()
  await expect(page.getByRole('status')).toBeFocused()
  await expect(page.getByRole('status')).toContainText('We’ve received your interest.')
  await expect(page.getByRole('status')).toContainText('not a confirmed place')
  expect(submissions).toHaveLength(1)
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0)
})

for (const status of [429, 503]) {
  test(`a ${status} response retains the form and supports retry`, async ({ page }) => {
    let attempts = 0
    await page.route('**/*', route => {
      if (route.request().method() !== 'POST') return route.continue()
      return route.fulfill({ status: ++attempts === 1 ? status : 200, body: '' })
    })
    await fillInterest(page)
    await page.getByRole('button', { name: 'Register your interest', exact: true }).click()
    await expect(page.getByRole('alert')).toContainText('We couldn’t confirm your registration.')
    await expect(page.getByRole('status')).toHaveCount(0)
    await expect(page.getByLabel('Your name', { exact: true })).toHaveValue(' Alex Example ')
    await expect(page.getByLabel('Email address')).toHaveValue('alex@example.test')
    await expect(page.getByLabel('Your sector')).toHaveValue('SaaS & software')
    await expect(page.getByRole('alert').getByRole('link')).toHaveAttribute('href', 'mailto:pilot@example.test')
    if (status === 503) expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
    await page.getByRole('button', { name: 'Register your interest', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('We’ve received your interest.')
    expect(attempts).toBe(2)
    if (status === 503) expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
  })
}

test('network failure never claims a registration was received', async ({ page }) => {
  await page.route('**/*', route => route.request().method() === 'POST' ? route.abort('failed') : route.continue())
  await fillInterest(page)
  await page.getByRole('button', { name: 'Register your interest', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(page.getByLabel('Email address')).toHaveValue('alex@example.test')
  await expect(page.getByRole('button', { name: 'Register your interest', exact: true })).toBeEnabled()
})

test('live registration validates before sending and provides a privacy contact', async ({ page }) => {
  const requests: string[] = []
  await page.route('**/*', route => {
    if (route.request().method() !== 'POST') return route.continue()
    requests.push(route.request().url())
    return route.abort()
  })
  await page.goto('/#register')
  await page.getByRole('button', { name: 'Register your interest', exact: true }).click()
  await expect(page.getByLabel('Your name', { exact: true })).toBeFocused()
  await expect(page.getByText('Please tell us your name.')).toBeVisible()
  await page.getByRole('link', { name: 'Privacy details' }).click()
  await expect(page.locator('#privacy-content')).toContainText('Submissions are stored with Netlify')
  await expect(page.locator('#privacy-content').getByRole('link')).toHaveAttribute('href', 'mailto:pilot@example.test')
  await expect(page.locator('#privacy-content')).not.toContainText('This prototype does not submit')
  expect(requests).toEqual([])
})
