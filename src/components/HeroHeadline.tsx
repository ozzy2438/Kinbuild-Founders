import { useLayoutEffect, useRef } from 'react'
import { prefersReducedMotion, Typewriter, typewriterSupported } from '../motion/typewriter'

const wait = (ms: number, signal: AbortSignal) => new Promise<void>((resolve, reject) => {
  const id = window.setTimeout(resolve, ms)
  signal.addEventListener('abort', () => { window.clearTimeout(id); reject(signal.reason) }, { once: true })
})

/**
 * “Don’t build” is set; “alone” is typed. The terracotta cursor then shrinks
 * into the headline’s full stop, and the three short steps below type in turn.
 */
export default function HeroHeadline() {
  const title = useRef<HTMLHeadingElement>(null)
  const titleCursor = useRef<HTMLElement>(null)
  const baseline = useRef<HTMLElement>(null)
  const lead = useRef<HTMLParagraphElement>(null)
  const leadCursor = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const h1 = title.current, p = lead.current, cursor = titleCursor.current, caret = leadCursor.current
    if (!h1 || !p || !cursor || !caret || prefersReducedMotion() || !typewriterSupported()) return
    const controller = new AbortController()
    const { signal } = controller
    const headline = new Typewriter(h1, cursor, 'alone')
    const steps = new Typewriter(p, caret)
    const stop = headline.indexOf('.')

    const morphIntoFullStop = async () => {
      const dot = headline.map.charRect(stop)
      const base = baseline.current?.getBoundingClientRect()
      if (!dot || !base) return
      const box = h1.getBoundingClientRect()
      // Measured against Manrope’s full stop: a rounded square, .13em, sitting on the baseline.
      const em = parseFloat(getComputedStyle(h1).fontSize)
      const size = em * .13
      cursor.classList.remove('is-waiting')
      cursor.classList.add('is-morphing')
      cursor.style.setProperty('--tw-x', `${dot.left + dot.width * .5 + em * .022 - size / 2 - box.left}px`)
      cursor.style.setProperty('--tw-y', `${base.top - size - box.top}px`)
      cursor.style.setProperty('--tw-h', `${size}px`)
      cursor.style.setProperty('--tw-w', `${size}px`)
      await wait(460, signal)
      headline.finish()
      cursor.classList.add('is-gone')
    }

    const play = async () => {
      cursor.classList.add('is-on')
      await headline.run([{ type: 'pause', ms: 420 }, { type: 'type', to: stop, speed: 105 }, { type: 'pause', ms: 520 }], signal)
      await morphIntoFullStop()
      await wait(160, signal)
      caret.classList.add('is-on')
      await steps.run([
        { type: 'type', to: steps.indexAfter('Melbourne.'), speed: 30 }, { type: 'pause', ms: 380 },
        { type: 'type', to: steps.indexAfter('together.'), speed: 30 }, { type: 'pause', ms: 380 },
        { type: 'type', to: steps.map.length, speed: 30 }, { type: 'pause', ms: 900 },
      ], signal)
      steps.finish()
      caret.classList.add('is-gone')
    }

    play().catch(() => {})
    return () => {
      controller.abort()
      headline.finish()
      steps.finish()
      for (const element of [cursor, caret]) element.className = 'tw-cursor'
      cursor.removeAttribute('style')
      caret.removeAttribute('style')
    }
  }, [])

  return <>
    <h1 id="hero-title" ref={title} className="hero__title"><span>Don’t build</span><span>alone<span className="accent-dot">.</span><i ref={baseline} className="tw-baseline" aria-hidden="true" /></span><i ref={titleCursor} className="tw-cursor" aria-hidden="true" /></h1>
    <p className="hero__lead" ref={lead}>Meet people in Melbourne. Test a startup idea together. See if you’re a team.<i ref={leadCursor} className="tw-cursor" aria-hidden="true" /></p>
  </>
}
