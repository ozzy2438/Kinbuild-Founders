import { useEffect, useState } from 'react'
import { registration } from '../registration'
import { roles } from '../content/roles'
import type { RoleId } from '../content/roles'

type Pulse = { available: true; total: number; roles: Record<RoleId | 'other', number> }
const plural: Record<RoleId, string> = { build: 'builders', design: 'designers', grow: 'growers' }

/** Real, anonymous totals from Netlify Forms. Renders nothing until there is enough data. */
export default function CommunityPulse() {
  const [pulse, setPulse] = useState<Pulse | null>(null)

  useEffect(() => {
    if (!registration.enabled || !registration.communityPulse) return
    let active = true
    fetch('/api/community-pulse', { signal: AbortSignal.timeout(6000) })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (active && data?.available && data.total > 0) setPulse(data) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  if (!pulse) return null
  const max = Math.max(...roles.map(role => pulse.roles[role.id]), 1)
  const needed = [...roles].sort((a, b) => pulse.roles[a.id] - pulse.roles[b.id])[0]

  return <section className="pulse" aria-labelledby="pulse-title">
    <div className="pulse__head"><strong>{pulse.total}</strong><span id="pulse-title">people have registered<br />interest so far</span></div>
    <ul className="pulse__bars">
      {roles.map(role => <li key={role.id} className={role.id === needed.id ? 'is-needed' : ''}>
        <span>{role.label}</span>
        <span className="pulse__bar" aria-hidden="true"><i style={{ width: `${(pulse.roles[role.id] / max) * 100}%` }} /></span>
        <span>{pulse.roles[role.id]}</span>
      </li>)}
    </ul>
    <p className="pulse__note">Most needed right now: <b>{plural[needed.id]}</b>. If that’s you, your piece is especially wanted.</p>
  </section>
}
