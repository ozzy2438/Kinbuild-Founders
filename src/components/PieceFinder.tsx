import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowUpRightIcon, CheckIcon } from '@phosphor-icons/react'
import { useEntrance } from '../hooks/useEntrance'
import { roles, roleFor } from '../content/roles'
import type { RoleId } from '../content/roles'

// Literal paths so the standalone build can inline them.
const sources = { left: '/images/arch-left.webp', right: '/images/arch-right.webp', top: '/images/arch-top.webp' }
const pieceSource = (piece: keyof typeof sources) => sources[piece]
const list = (items: string[]) => items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items[0]

export default function PieceFinder({ onComplete }: { onComplete: (role: RoleId) => void }) {
  const [chosen, setChosen] = useState<RoleId | null>(null)
  const [complete, setComplete] = useState(false)
  const { ref, entered } = useEntrance<HTMLDivElement>()
  const missing = roles.filter(role => role.id !== chosen)

  const choose = (id: RoleId) => { setChosen(id); setComplete(false) }
  const finish = () => {
    if (!chosen) return
    setComplete(true)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => onComplete(chosen), reduced ? 0 : 1100)
  }

  const state = complete ? 'is-complete' : chosen ? 'is-chosen' : 'is-idle'

  return <section id="your-piece" className="finder shell" aria-labelledby="finder-title">
    <div className="finder__copy">
      <p className="eyebrow eyebrow--accent">FIND YOUR MISSING PIECE</p>
      <h2 id="finder-title" tabIndex={-1}>You’re one piece.<br />An arch needs three.</h2>
      <p className="finder__lead">Pick what you bring. We’ll show you who you’d be looking for.</p>

      <fieldset className="finder__choices">
        <legend className="visually-hidden">What do you bring?</legend>
        {roles.map(role => <label key={role.id} className={`finder-choice ${chosen === role.id ? 'is-selected' : ''}`}>
          <input type="radio" name="finder-role" value={role.id} checked={chosen === role.id} onChange={() => choose(role.id)} />
          <span className="finder-choice__glyph" aria-hidden="true"><PieceGlyph piece={role.piece} /></span>
          <span className="finder-choice__text"><strong>{role.verb}</strong><span>{role.covers}</span></span>
          <span className="finder-choice__check" aria-hidden="true"><CheckIcon size={14} weight="bold" /></span>
        </label>)}
      </fieldset>

      <div className="finder__result" aria-live="polite">
        {chosen ? <p><span>You bring the {roleFor(chosen).label.toLowerCase()}.</span> To stand, you need {list(missing.map(role => role.seeking))}.</p>
          : <p className="finder__hint">Every startup needs something built, something shaped and someone to grow it.</p>}
      </div>
      <div className="finder__actions">
        <button className="button" type="button" onClick={finish} disabled={!chosen} aria-describedby="finder-action-note">Find my missing pieces <ArrowUpRightIcon size={19} /></button>
        <p id="finder-action-note">{chosen ? 'We’ll fill in the form with your choice.' : 'Choose a piece first.'}</p>
      </div>
    </div>

    <div ref={ref} className={`finder__stage ${state} ${entered ? 'has-entered' : ''}`} aria-hidden="true">
      <div className="finder__ground" />
      {roles.map((role, index) => {
        const mine = role.id === chosen
        return <div key={role.id} className={`finder-piece finder-piece--${role.piece} ${mine ? 'is-mine' : chosen ? 'is-missing' : ''}`} style={{ '--i': index } as CSSProperties}>
          <div className="finder-piece__move">
            <div className="finder-piece__body" onClick={() => choose(role.id)}>
              <img src={pieceSource(role.piece)} alt="" width="1000" height="1000" loading="lazy" decoding="async" draggable="false" />
              <span className="finder-piece__tint" style={{ '--piece': `url(${pieceSource(role.piece)})` } as CSSProperties} />
            </div>
            <span className="finder-piece__label">{mine ? <><b>You</b> · {role.label}</> : chosen && !complete ? <><b>Missing</b> · {role.label}</> : role.label}</span>
          </div>
        </div>
      })}
      <p className="finder__caption">{complete ? 'That’s a team.' : chosen ? 'Two pieces to find.' : 'Three strengths. One shared direction.'}</p>
    </div>
  </section>
}

/** Minimal line drawings of the three gateway pieces. */
export function PieceGlyph({ piece, size = 28 }: { piece: 'left' | 'right' | 'top'; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
    {piece === 'left' && <><path d="M8 9.5 14 7l6 2.5v12L14 24l-6-2.5z" /><path d="M8 9.5 14 12l6-2.5M14 12v12" /></>}
    {piece === 'right' && <><ellipse cx="14" cy="7.5" rx="5.5" ry="2.2" /><path d="M8.5 7.5v13c0 1.2 2.5 2.2 5.5 2.2s5.5-1 5.5-2.2v-13" /></>}
    {piece === 'top' && <><path d="m3 13 15-5 7 2.5-15 5z" /><path d="M3 13v4l7 2.5 15-5v-4M10 15.5v4" /></>}
  </svg>
}
