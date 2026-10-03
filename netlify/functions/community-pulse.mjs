// Anonymous community totals for the registration section.
// Returns only counts per strength, never names or emails, and nothing at all
// until enough people have registered (PULSE_MIN_TOTAL, default 12).
// Needs NETLIFY_FORMS_TOKEN: a Netlify personal access token with access to this site.

const FORM_NAME = 'startbeside-interest'
const ROLE_BY_SKILL = {
  'Engineering & development': 'build',
  'Research & data': 'build',
  'Design & user experience': 'design',
  'Product & strategy': 'design',
  'Marketing & growth': 'grow',
  'Sales & partnerships': 'grow',
  'Operations & finance': 'grow',
  'Industry expertise': 'grow',
}

const respond = (body, cache = true) => Response.json(body, {
  headers: cache
    ? { 'Cache-Control': 'public, max-age=300', 'Netlify-CDN-Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' }
    : { 'Cache-Control': 'no-store' },
})

export default async (_request, context) => {
  const token = Netlify.env.get('NETLIFY_FORMS_TOKEN')
  const siteId = context.site?.id || Netlify.env.get('SITE_ID')
  const minimum = Number(Netlify.env.get('PULSE_MIN_TOTAL') || 12)
  if (!token || !siteId) return respond({ available: false })

  const api = async path => {
    const response = await fetch(`https://api.netlify.com/api/v1${path}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) })
    if (!response.ok) throw new Error(`Netlify API ${response.status}`)
    return response.json()
  }

  try {
    const form = (await api(`/sites/${siteId}/forms`)).find(item => item.name === FORM_NAME)
    if (!form) return respond({ available: false })
    const people = new Map()
    for (let page = 1; page <= 30; page++) {
      const batch = await api(`/forms/${form.id}/submissions?per_page=100&page=${page}`)
      for (const submission of batch) {
        const email = String(submission.data?.email || submission.email || '').trim().toLowerCase()
        // One person, one count: the latest submission wins (the API lists newest first).
        if (email && !people.has(email)) people.set(email, ROLE_BY_SKILL[submission.data?.skill] || 'other')
      }
      if (batch.length < 100) break
    }
    const roles = { build: 0, design: 0, grow: 0, other: 0 }
    for (const role of people.values()) roles[role]++
    if (people.size < minimum) return respond({ available: false })
    return respond({ available: true, total: people.size, roles })
  } catch {
    return respond({ available: false }, false)
  }
}

export const config = { path: '/api/community-pulse' }
