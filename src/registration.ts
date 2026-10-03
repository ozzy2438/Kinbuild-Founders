const contactEmail = (import.meta.env.VITE_CONTACT_EMAIL ?? '').trim()

export const registration = {
  enabled: import.meta.env.VITE_REGISTRATION_MODE === 'netlify' && Boolean(contactEmail),
  contactEmail,
  formName: 'startbeside-interest',
  // Anonymous totals need the optional Netlify function; off unless explicitly enabled.
  communityPulse: import.meta.env.VITE_COMMUNITY_PULSE === 'on',
}
