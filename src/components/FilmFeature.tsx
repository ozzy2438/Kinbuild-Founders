import { ArrowDownIcon, ArrowsLeftRightIcon, PlayIcon, SpeakerHighIcon, FilmStripIcon } from '@phosphor-icons/react'
import { useEntrance } from '../hooks/useEntrance'

export default function FilmFeature({ onPlay }: { onPlay: () => void }) {
  const { ref, entered } = useEntrance<HTMLDivElement>()

  return <section id="film" className="film-feature shell" aria-labelledby="film-feature-title">
    <div className="film-feature__intro">
      <div>
        <p className="eyebrow">SMALL PIECES. SHARED POSSIBILITIES.</p>
        <h2 id="film-feature-title">Different people.<br />One shared beginning.</h2>
      </div>
      <p className="film-feature__description">A skill. An idea. Someone who sees it differently.<br className="wide-break" /> See how the pieces could come together<br className="wide-break" /> to build a startup.</p>
    </div>

    <div ref={ref} className={`film-feature__reveal ${entered ? 'has-entered' : ''}`}>
      <div className="film-feature__window">
        <div className="film-feature__bar" aria-hidden="true">
          <span><FilmStripIcon size={17} weight="light" /> THE STARTBESIDE FILM</span>
          <span>20 SECONDS · A SHARED BEGINNING</span>
        </div>
        <button className="film-feature__play" onClick={onPlay} aria-label="Watch the film" aria-haspopup="dialog" aria-describedby="film-feature-note">
          <img src="/media/startbeside-team.webp" width="1920" height="1080" loading="lazy" decoding="async" alt="Toy founders bringing their different skills together around a shared worktable." />
          <span className="film-feature__play-label"><span className="film-feature__play-icon"><PlayIcon size={23} weight="fill" aria-hidden="true" /></span><span>Watch the film <span className="film-feature__duration">20 seconds, together.</span></span></span>
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
