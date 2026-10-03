import { useEffect, useRef, useState } from 'react'
import { ArrowUpRightIcon, ArrowCounterClockwiseIcon, PauseIcon, PlayIcon, XIcon, CornersOutIcon, CornersInIcon, SpeakerHighIcon, SpeakerSlashIcon, SubtitlesIcon } from '@phosphor-icons/react'
import captionsSource from '../assets/film-en.vtt?raw'

const time = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`

export default function StoryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const player = useRef<HTMLVideoElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const [elapsed, setElapsed] = useState(0)
  const [duration, setDuration] = useState(20)
  const [paused, setPaused] = useState(true)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(.8)
  const [captions, setCaptions] = useState(true)
  const [captionUrl, setCaptionUrl] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Bundled captions also work in the self-contained downloadable HTML.
    const url = URL.createObjectURL(new Blob([captionsSource], { type: 'text/vtt' }))
    setCaptionUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [])

  useEffect(() => {
    if (!open) return
    const video = player.current
    const modal = dialog.current
    if (!video || !modal) return
    let cancelled = false
    setElapsed(0)
    setFinished(false)
    setStarted(false)
    setExpanded(false)
    video.currentTime = 0
    modal.showModal()
    closeButton.current?.focus({ preventScroll: true })
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Opening is a visitor action. If autoplay policy requires another gesture,
    // keep the visible play button; state follows real media events.
    video.play().catch(() => { if (!cancelled) setPaused(true) })
    return () => {
      cancelled = true
      video.pause()
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
      modal.close()
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (player.current) { player.current.volume = volume; player.current.muted = muted }
  }, [volume, muted])

  useEffect(() => {
    const video = player.current
    const sync = () => { if (video?.textTracks[0]) video.textTracks[0].mode = captions ? 'showing' : 'hidden' }
    sync()
    video?.textTracks.addEventListener('addtrack', sync)
    return () => video?.textTracks.removeEventListener('addtrack', sync)
  }, [captions, captionUrl])

  useEffect(() => {
    const visibility = () => { if (document.visibilityState === 'hidden') player.current?.pause() }
    const full = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('visibilitychange', visibility)
    document.addEventListener('fullscreenchange', full)
    return () => {
      document.removeEventListener('visibilitychange', visibility)
      document.removeEventListener('fullscreenchange', full)
    }
  }, [])

  const play = () => {
    const video = player.current
    if (!video) return
    if (video.ended) { video.currentTime = 0; setFinished(false) }
    if (video.paused) void video.play().catch(() => setPaused(true))
    else video.pause()
  }
  const close = () => { player.current?.pause(); onClose() }
  const expand = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (windowRef.current?.requestFullscreen) await windowRef.current.requestFullscreen()
      else setExpanded(value => !value)
    } catch { setExpanded(value => !value) }
  }
  const goToForm = () => {
    close()
    requestAnimationFrame(() => {
      document.getElementById('register')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
      document.getElementById('register-title')?.focus({ preventScroll: true })
    })
  }

  const goToFinder = () => {
    close()
    requestAnimationFrame(() => {
      document.getElementById('your-piece')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
      document.getElementById('finder-title')?.focus({ preventScroll: true })
    })
  }

  return <dialog ref={dialog} className={`film-dialog ${expanded ? 'is-expanded' : ''}`} aria-labelledby="film-title" onCancel={close} onClick={event => { if (event.target === event.currentTarget) close() }}>
    <div className={`film-window ${paused ? 'is-paused' : 'is-playing'}`} ref={windowRef}>
      <header className="film-window__bar">
        <span className="film-window__mark" aria-hidden="true"><i /><i /><i /></span>
        <h2 id="film-title">StartBeside <span>— A short film</span></h2>
        <div className="film-window__actions">
          <button className="icon-button" onClick={() => void expand()} aria-label={fullscreen || expanded ? 'Restore film window' : 'Expand film window'}>{fullscreen || expanded ? <CornersInIcon size={18} /> : <CornersOutIcon size={18} />}</button>
          <button ref={closeButton} className="icon-button" onClick={close} aria-label="Close the film"><XIcon size={20} /></button>
        </div>
      </header>
      <div className="film-window__screen">
        <video ref={player} className="film-video" poster="/media/startbeside-poster.webp" preload="metadata" playsInline aria-label="StartBeside: Don't build alone" aria-describedby="film-description"
          onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
          onTimeUpdate={event => setElapsed(event.currentTarget.currentTime)}
          onPlay={() => { setPaused(false); setStarted(true); setFinished(false) }}
          onPause={() => setPaused(true)} onEnded={() => { setFinished(true); setPaused(true) }}
          onError={() => setError(true)}>
          <source src="/media/startbeside-film.mp4" type="video/mp4" onError={() => setError(true)} />
          {captionUrl && <track key={captionUrl} kind="captions" srcLang="en" label="English" src={captionUrl} default />}
        </video>
        {!started && !error && <button className="film-start" onClick={play}><span><PlayIcon size={28} weight="fill" /></span>Play with sound</button>}
        {finished && !error && <div className="film-end">
          <img src="/images/startbeside-arch.webp" alt="" width="1254" height="1254" />
          <div>
            <p className="eyebrow eyebrow--accent">YOUR TURN</p>
            <h3>Every gateway starts with one piece.</h3>
            <p>Find yours, then find the people who complete it.</p>
            <div className="film-end__actions"><button className="button" onClick={goToFinder}>Find my missing piece <ArrowUpRightIcon size={18} /></button><button className="text-button" onClick={play}><ArrowCounterClockwiseIcon size={17} /> Watch again</button></div>
          </div>
        </div>}
        {error && <div className="film-message" role="alert"><p>The film couldn’t load.</p><button className="button button--light" onClick={() => { setError(false); player.current?.load(); void player.current?.play().catch(() => setPaused(true)) }}>Try again</button><span>The full transcript is below.</span></div>}
      </div>
      <div className="film-controls">
        <div className="film-controls__timeline"><input type="range" min="0" max={duration} step=".05" value={elapsed} aria-label="Film position" aria-valuetext={`${time(elapsed)} of ${time(duration)}`} onChange={event => { if (player.current) { player.current.currentTime = Number(event.target.value); setElapsed(Number(event.target.value)); setFinished(false) } }} /></div>
        <div className="film-controls__row">
          <button className="icon-button" onClick={play} aria-label={finished ? 'Replay the film' : paused ? 'Play the film' : 'Pause the film'}>{finished ? <ArrowCounterClockwiseIcon size={21} /> : paused ? <PlayIcon size={21} weight="fill" /> : <PauseIcon size={21} weight="fill" />}</button>
          <span className="film-time">{time(elapsed)} <span>/ {time(duration)}</span></span>
          <div className="film-controls__sound">
            <button className="icon-button" onClick={() => { if (volume === 0) setVolume(.8); setMuted(value => volume === 0 ? false : !value) }} aria-label={muted || volume === 0 ? 'Unmute film' : 'Mute film'}>{muted || volume === 0 ? <SpeakerSlashIcon size={21} /> : <SpeakerHighIcon size={21} />}</button>
            <input type="range" min="0" max="1" step=".05" value={muted ? 0 : volume} aria-label="Film volume" aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)} percent`} onChange={event => { setVolume(Number(event.target.value)); setMuted(false) }} />
          </div>
          <button className="icon-button film-cc" onClick={() => setCaptions(value => !value)} aria-label="English captions" aria-pressed={captions}><SubtitlesIcon size={23} /></button>
        </div>
      </div>
      <footer className="film-footer">
        <p id="film-description"><span className="eyebrow">A SHARED BEGINNING</span><span>From a first idea to a shared venture.</span></p>
        <button className="text-button" onClick={goToForm}>Find your people <ArrowUpRightIcon size={19} /></button>
      </footer>
      <details className="film-transcript"><summary>Read the transcript <span>English narration</span></summary><p>Great ideas don't grow alone. They grow with people who see things differently. At StartBeside, find your people, and turn that first idea into a real startup. Start small, build together, and see how far you can go. StartBeside. Don't build alone.</p><p>Pilot note: StartBeside takes no equity and does not promise funding or investor introductions.</p></details>
    </div>
  </dialog>
}
