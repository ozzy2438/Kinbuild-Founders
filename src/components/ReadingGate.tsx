import { useEffect, useState } from 'react'

/**
 * A small gateway in the corner that assembles as the page is read:
 * a third of the way the left block, two thirds the right column, the beam at the end.
 * Purely decorative, so it is hidden from assistive technology and never takes a tap.
 */
export default function ReadingGate() {
  const [stage, setStage] = useState(0)
  const [shown, setShown] = useState(false)
  const [atForm, setAtForm] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 1
      setStage(progress >= .985 ? 3 : progress >= 2 / 3 ? 2 : progress >= 1 / 3 ? 1 : 0)
      setShown(window.scrollY > window.innerHeight * .55)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    // The form stays calm: the gate steps aside while the form fills the lower screen.
    const form = document.getElementById('register')
    const observer = form && 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => setAtForm(entry.isIntersecting), { rootMargin: '-75% 0px 0px 0px' }) : null
    if (form) observer?.observe(form)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  const piece = (index: number) => `reading-gate__piece ${stage > index ? 'is-placed' : ''}`
  return <div className={`reading-gate ${shown && !atForm ? 'is-shown' : ''} ${stage === 3 ? 'is-complete' : ''}`} aria-hidden="true">
    <svg width="34" height="26" viewBox="0 0 64 48">
      <rect className={piece(0)} x="9" y="17" width="15" height="27" rx="1" />
      <rect className={piece(1)} x="41" y="17" width="14" height="27" rx="7" />
      <rect className={`${piece(2)} reading-gate__beam`} x="5" y="6" width="54" height="10" rx="1" />
    </svg>
  </div>
}
