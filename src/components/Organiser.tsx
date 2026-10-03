import { LinkedinLogoIcon } from '@phosphor-icons/react'
import { organiser } from '../content/organiser'

export default function Organiser() {
  const { name, role, note, photo, linkedin } = organiser
  if (!name.trim() || !note.trim()) return null
  const initials = name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()

  return <figure className="organiser" aria-label={`A note from ${name}`}>
    {photo ? <img className="organiser__photo" src={photo} alt={name} width="192" height="192" loading="lazy" decoding="async" /> : <span className="organiser__monogram" aria-hidden="true">{initials}</span>}
    <div>
      <blockquote>{note}</blockquote>
      <figcaption className="organiser__meta"><strong>{name}</strong><span>{role}</span>{linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer"><LinkedinLogoIcon size={18} aria-hidden="true" />LinkedIn<span className="visually-hidden"> (opens in a new tab)</span></a>}</figcaption>
    </div>
  </figure>
}
