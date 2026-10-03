import type { CSSProperties } from 'react'
import { useEntrance } from '../hooks/useEntrance'

const steps = [
  { number: '01', title: 'Meet', copy: 'Meet people in Melbourne who are ready to start something and contribute.' },
  { number: '02', title: 'Match', copy: 'Find complementary skills, shared interests and working styles that fit.' },
  { number: '03', title: 'Build', copy: 'Spend 14 days on one small goal. Talk to potential customers, make something simple, see how you work together.' },
  { number: '04', title: 'Decide', copy: 'Review the evidence with experienced people. Then continue, pivot or pause, and agree the next step together.' },
]

/** The gateway assembles one piece per step: block, column, beam, then a finished arch. */
function StepArch({ pieces, done }: { pieces: number; done: boolean }) {
  const state = (index: number) => index < pieces ? 'is-placed' : 'is-pending'
  return <svg className={`step-arch ${done ? 'is-done' : ''}`} width="64" height="48" viewBox="0 0 64 48" aria-hidden="true">
    <rect className={`step-arch__piece ${state(0)}`} x="9" y="17" width="15" height="27" rx="1" />
    <rect className={`step-arch__piece ${state(1)}`} x="41" y="17" width="14" height="27" rx="7" />
    <rect className={`step-arch__piece step-arch__beam ${state(2)}`} x="5" y="6" width="54" height="10" rx="1" />
  </svg>
}

export default function ProcessSteps() {
  const { ref, entered } = useEntrance<HTMLOListElement>()
  return <ol ref={ref} className={`process__steps ${entered ? 'is-live' : ''}`}>
    {steps.map((step, index) => <li key={step.number} style={{ '--step': index } as CSSProperties}>
      <span className="step-number">{step.number}</span>
      <StepArch pieces={Math.min(index + 1, 3)} done={index === 3} />
      <h3>{step.title}</h3>
      <p>{step.copy}</p>
    </li>)}
  </ol>
}
