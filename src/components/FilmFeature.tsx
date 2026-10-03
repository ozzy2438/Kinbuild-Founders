import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDownIcon, ArrowsLeftRightIcon, PlayIcon, SpeakerHighIcon, FilmStripIcon } from '@phosphor-icons/react'
import { useEntrance } from '../hooks/useEntrance'
import { prefersReducedMotion, Typewriter, typewriterSupported } from '../motion/typewriter'

// Literal path so the standalone build can inline it.
const loopSource = '/media/startbeside-loop.mp4'

/** Visitors who asked for less motion or less data keep the still frame. */
const loopAllowed = () => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return !prefersReducedMotion() && !connection?.saveData && !window.matchMedia('(prefers-reduced-data: reduce)').matches
}

export default function FilmFeature({ onPlay }: { onPlay: () => void }) {
  const { ref, entered } = useEntrance<HTMLDivElement>()
  const [settled, setSettled] = useState(false)
  const [loopSrc, setLoopSrc] = useState<string>()
  const [looping, setLooping] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const inView = useRef(false)
  const description = useRef<HTMLParagraphElement>(null)
  const caret = useRef<HTMLElement>(null)

  // The window arrives tilted and flattens with the scroll; once flat, it stays flat.
  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => {
      const nearTop = entry.boundingClientRect.top <= (entry.rootBounds?.height ?? window.innerHeight) * .22
      if (entry.isIntersecting && (entry.intersectionRatio > .96 || nearTop)) { setSettled(true); observer.disconnect() }
    }, { threshold: [0, .2, .4, .6, .8, .9, .97, 1] })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  // The silent loop is only fetched near the section and only plays on screen.
  // It starts where the still frame is (the founders at the table), then loops the whole film.
  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window) || !loopAllowed()) return
    const near = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLoopSrc(loopSource); near.disconnect() }
    }, { rootMargin: '400px 0px' })
    const visible = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting
      const player = video.current
      if (!player) return
      if (entry.isIntersecting && loopAllowed()) player.play().catch(() => {})
      else player.pause()
    }, { threshold: .15 })
    near.observe(element)
    visible.observe(element)
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const respect = () => { if (preference.matches) { video.current?.pause(); setLooping(false) } }
    preference.addEventListener('change', respect)
    return () => { near.disconnect(); visible.disconnect(); preference.removeEventListener('change', respect) }
  }, [ref])

  useEffect(() => {
    const player = video.current
    if (loopSrc && player && inView.current) player.play().catch(() => {})
  }, [loopSrc])

  // “A skill. An idea. Someone who sees it differently.” types in three beats;
  // the invitation that follows completes the sentence at a quicker pace.
  useLayoutEffect(() => {
    const p = description.current, cursor = caret.current
    if (!p || !cursor || prefersReducedMotion() || !typewriterSupported() || !('IntersectionObserver' in window)) return
    const controller = new AbortController()
    const writer = new Typewriter(p, cursor)
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      cursor.classList.add('is-on')
      writer.run([
        { type: 'pause', ms: 260 },
        { type: 'type', to: writer.indexAfter('A skill.'), speed: 46 }, { type: 'pause', ms: 460 },
        { type: 'type', to: writer.indexAfter('An idea.'), speed: 46 }, { type: 'pause', ms: 460 },
        { type: 'type', to: writer.indexAfter('differently.'), speed: 40 }, { type: 'pause', ms: 520 },
        { type: 'type', to: writer.map.length, speed: 15 }, { type: 'pause', ms: 700 },
      ], controller.signal).then(() => {
        writer.finish()
        cursor.classList.add('is-gone')
      }).catch(() => {})
    }, { threshold: .9 })
    observer.observe(p)
    return () => {
      controller.abort()
      observer.disconnect()
      writer.finish()
      cursor.className = 'tw-cursor'
      cursor.removeAttribute('style')
    }
  }, [])

  const play = () => { video.current?.pause(); onPlay() }
  const resume = () => { if (inView.current && loopAllowed()) video.current?.play().catch(() => {}) }

  return <section id="film" className="film-feature shell" aria-labelledby="film-feature-title">
    <div className="film-feature__intro">
      <div>
        <p className="eyebrow">SMALL PIECES. SHARED POSSIBILITIES.</p>
        <h2 id="film-feature-title">Different people.<br />One shared beginning.</h2>
      </div>
      <p ref={description} className="film-feature__description">A skill. An idea. Someone who sees it differently.<br className="wide-break" /> See how the pieces could come together<br className="wide-break" /> to build a startup.<i ref={caret} className="tw-cursor" aria-hidden="true" /></p>
    </div>

    <div ref={ref} className={`film-feature__reveal ${entered ? 'has-entered' : ''} ${settled ? 'is-settled' : ''}`}>
      <div className="film-feature__window">
        <div className="film-feature__bar" aria-hidden="true">
          <span><FilmStripIcon size={17} weight="light" /> THE STARTBESIDE FILM</span>
          <span>20 SECONDS · A SHARED BEGINNING</span>
        </div>
        <button className={`film-feature__play ${looping ? 'is-looping' : ''}`} onClick={play} onFocus={resume} aria-label="Watch the film" aria-haspopup="dialog" aria-describedby="film-feature-note">
          <img src="/media/startbeside-team.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Toy founders bringing their different skills together around a shared worktable." />
          {loopSrc && <video ref={video} className="film-feature__loop" src={loopSrc} poster="/media/startbeside-team.webp" muted loop playsInline preload="auto" disablePictureInPicture disableRemotePlayback aria-hidden="true" tabIndex={-1} onLoadedMetadata={event => { if (event.currentTarget.currentTime < 1) event.currentTarget.currentTime = 6 }} onPlaying={() => setLooping(true)} />}
          <span className="film-feature__play-label" aria-hidden="true"><PlayIcon size={28} weight="fill" /></span>
        </button>
        <div className="film-feature__caption">
          <p>It starts with people. It could become a startup.</p>
          <span id="film-feature-note"><SpeakerHighIcon size={16} aria-hidden="true" /> Sound on when you press play.</span>
        </div>
      </div>
    </div>

    <div className="film-bridge">
      <figure><img src="/images/startbeside-toy-gateway.webp" width="1000" height="900" loading="lazy" decoding="async" alt="The film’s final scene: toy founders at a table beneath a gateway built from three toy pieces." /><figcaption><span>IN THE FILM</span><strong>Three toy founders build a gateway.</strong></figcaption></figure>
      <p className="film-bridge__join"><ArrowsLeftRightIcon size={22} aria-hidden="true" />Same shape</p>
      <figure><img src="/images/startbeside-arch.webp" width="1254" height="1254" loading="lazy" decoding="async" alt="The StartBeside stone gateway made of three different pieces." /><figcaption><span>IN MELBOURNE</span><strong>Real people. Different strengths.</strong></figcaption></figure>
    </div>

    <div className="film-feature__outro"><p>From a shared table to a shared venture.</p><a href="#how-it-works" className="quiet-link">Here’s how it starts <ArrowDownIcon size={17} /></a></div>
  </section>
}
