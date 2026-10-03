import { useRef } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { useEntrance } from '../hooks/useEntrance'
import { roles } from '../content/roles'

const source = '/images/startbeside-arch.webp'
const short = { left: 'Engineering & data', right: 'Product & design', top: 'Growth & sales' }

export function Artwork({ cinematic = false, entrance = false, labels = false }: { cinematic?: boolean; entrance?: boolean; labels?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const arrival = useEntrance<HTMLDivElement>()
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (cinematic || event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const box = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width - 0.5
    const y = (event.clientY - box.top) / box.height - 0.5
    ref.current?.style.setProperty('--rotate-x', `${-y * 7}deg`)
    ref.current?.style.setProperty('--rotate-y', `${x * 10}deg`)
    ref.current?.style.setProperty('--shift-x', `${x * 8}px`)
  }
  const reset = () => {
    ref.current?.style.setProperty('--rotate-x', '0deg')
    ref.current?.style.setProperty('--rotate-y', '0deg')
    ref.current?.style.setProperty('--shift-x', '0px')
  }

  return <div ref={arrival.ref} className={`artwork ${cinematic ? 'artwork--cinematic' : ''} ${entrance ? (arrival.entered ? 'artwork--entrance' : 'artwork--waiting') : ''}`} onPointerMove={move} onPointerLeave={reset}>
    <div className="artwork__perspective" ref={ref}>
      <img className="artwork__whole" src={source} alt={cinematic ? '' : 'Three different stone pieces come together to form one architectural gateway.'} width="1254" height="1254" fetchPriority={cinematic ? 'auto' : 'high'} draggable="false" />
      {(entrance || cinematic) && ['left', 'right', 'top'].map((piece, i) => <img key={piece} className={`artwork__piece artwork__piece--${piece}`} src={source} alt="" aria-hidden="true" width="1254" height="1254" draggable="false" style={{ '--piece-index': i } as CSSProperties} />)}
      {labels && <div className="artwork__labels" aria-hidden="true">
        {roles.map(role => <span key={role.piece} className={`artwork__hit artwork__hit--${role.piece}`} onPointerEnter={() => { if (arrival.ref.current) arrival.ref.current.dataset.hover = role.piece }} onPointerLeave={() => { if (arrival.ref.current) delete arrival.ref.current.dataset.hover }} />)}
        {roles.map(role => <span key={role.piece} className={`artwork__label artwork__label--${role.piece}`}><i /><b>{role.label}</b><small>{short[role.piece]}</small></span>)}
      </div>}
    </div>
  </div>
}
