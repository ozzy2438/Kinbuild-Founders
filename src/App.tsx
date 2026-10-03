import { Fragment, lazy, Suspense, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { ArrowDownIcon, ArrowUpRightIcon, CaretDownIcon, ListIcon, UsersThreeIcon, XIcon } from '@phosphor-icons/react'
import { Artwork } from './components/Artwork'
import FilmFeature from './components/FilmFeature'
import HeroHeadline from './components/HeroHeadline'
import InterestForm from './components/InterestForm'
import PieceFinder from './components/PieceFinder'
import ProcessSteps from './components/ProcessSteps'
import Organiser from './components/Organiser'
import ReadingGate from './components/ReadingGate'
import { useEntrance } from './hooks/useEntrance'
import { registration } from './registration'
import { roles, roleFor } from './content/roles'
import type { Preset, RoleId } from './content/roles'

const StoryDialog = lazy(() => import('./components/StoryDialog'))
// The closing words gather like the stones: from the left, from above and from the right.
const closingLines: [string, 'left' | 'top' | 'right'][][] = [
  [['You', 'left'], ['don’t', 'left'], ['have', 'top'], ['to', 'right'], ['figure', 'right']],
  [['it', 'left'], ['all', 'top'], ['out', 'top'], ['alone.', 'right']],
]
const questions = [
  ['Do I need a startup idea already?', 'No. Bring a skill, a perspective, or a problem you care about. You can explore an idea with other people. You do need a willingness to contribute and follow through.'],
  ['Is this just another networking event?', 'No. It goes beyond introductions. The pilot is designed around complementary skills and a short, practical working experience, so you learn what collaboration actually feels like.'],
  ['What do you mean by working style?', 'Some people enjoy taking the lead, some want to stay hands-on, and others do their best work supporting a team. We want to understand how you like to contribute alongside your skills and interests. These are preferences to discuss, not fixed personality labels.'],
  ['Do we have to start a company together?', 'No. The point is to find out whether there is a good fit before making a commitment. You can decide to continue, explore another direction, or simply take what you learned.'],
  ['How much time does it take?', 'For the first pilot, plan for 4–6 hours a week during the 14-day trial, alongside work or study. You don’t need to quit anything. Teams that choose to go further can take on more later. We’ll talk about your availability before any invitation.'],
  ['Will StartBeside connect us with investors?', 'StartBeside isn’t an investment fund or an investor-matching service, and the pilot doesn’t promise funding or introductions. The first goal is to find out whether you have a strong team and a real problem. For the right teams, investment is one later option among several: some go to an accelerator or angel investors, some bootstrap, some grow from customers.'],
  ['Does StartBeside take a share of what we build?', 'No. StartBeside takes no equity. If a team decides to go further, ownership and legal questions are theirs to work out properly, in their own time, not on the first evening.'],
  ['When and where is the pilot?', 'We’re shaping the first pilot in Melbourne. The date, venue, group size and any participation cost will be shared before anyone is asked to commit.'],
  ['What happens after I register interest?', `${registration.enabled ? 'We’ll review your details.' : 'When registration opens, we’ll review your details.'} If there’s a potential fit, we’ll contact you for a short conversation about your interests, availability and contribution. An invitation to a suitable pilot comes separately. Registering interest does not guarantee a place.${registration.enabled ? '' : ' This website currently lets you preview the form; it does not send or save your details.'}`],
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [storyOpen, setStoryOpen] = useState(false)
  const [storyLoaded, setStoryLoaded] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [preset, setPreset] = useState<Preset | null>(null)
  const pilotTitle = useEntrance<HTMLHeadingElement>(.5)
  const boundaries = useEntrance<HTMLUListElement>(.6)
  const closing = useEntrance<HTMLParagraphElement>(.45)

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  const watch = () => { setStoryLoaded(true); setStoryOpen(true) }
  const completeArch = (id: RoleId) => {
    setPreset({ skill: roleFor(id).skill, seeking: roles.filter(role => role.id !== id).map(role => role.label), nonce: Date.now() })
    requestAnimationFrame(() => {
      document.getElementById('register')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
      document.getElementById('register-title')?.focus({ preventScroll: true })
    })
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header shell">
      <a className="wordmark" href="#" aria-label="StartBeside home">StartBeside</a>
      <nav aria-label="Main navigation" className="desktop-nav"><a href="#your-piece">Your piece</a><a href="#how-it-works">How it works</a><a href="#the-pilot">The pilot</a><a href="#about">About</a><a className="button button--small" href="#register">Register interest <ArrowUpRightIcon size={17} /></a></nav>
      <button className="icon-button menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <XIcon size={25} /> : <ListIcon size={26} />}</button>
      <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation" hidden={!menuOpen}>{[['Your piece', '#your-piece'], ['How it works', '#how-it-works'], ['The pilot', '#the-pilot'], ['About', '#about'], ['Register interest', '#register']].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowUpRightIcon size={18} /></a>)}</nav>
    </header>

    <main id="main">
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">MELBOURNE · FOUNDING PILOT</p>
          <HeroHeadline />
          <p className="hero__description">A Melbourne pilot for future co-founders. Start alongside work or study; go further when the evidence says so.</p>
          <p className="hero__match"><UsersThreeIcon size={25} weight="light" aria-hidden="true" /><span>Matched by skills, sector and how you like to work.</span></p>
          <div className="hero__actions"><a href="#register" className="button">Register your interest <ArrowUpRightIcon size={19} /></a><a href="#how-it-works" className="quiet-link">See how it works <ArrowDownIcon size={16} /></a></div>
          <p className="pilot-note">We’re shaping the first Melbourne pilot.<br />Dates and venue will be announced.</p>
        </div>
        <div className="hero__visual">
          <Artwork entrance labels />
          <p className="art-caption">Different strengths. Shared direction.</p>
        </div>
        <div className="hero__discovery"><p>Good things start with people.</p><a href="#film">See what comes together <ArrowDownIcon size={18} aria-hidden="true" /></a></div>
      </section>

      <FilmFeature onPlay={watch} />

      <PieceFinder onComplete={completeArch} />

      <section id="how-it-works" className="process shell" aria-labelledby="process-title">
        <div className="section-intro"><p className="eyebrow">HOW IT WORKS</p><h2 id="process-title">Meeting someone is easy.<br />Knowing you can build together takes more.</h2></div>
        <ProcessSteps />
        <div className="next-chapter"><p className="eyebrow">AFTER 14 DAYS</p><div><h3>A real team. A tested idea.<br className="mobile-only" /> A clear next step.</h3><p>You review the evidence with experienced people, then decide: continue, pivot or pause. Strong teams can go on to a longer venture sprint. The next step might be customers, a product, revenue, an accelerator or investment, whatever the evidence points to.</p></div></div>
      </section>

      <section id="the-pilot" className="pilot" aria-labelledby="pilot-title">
        <div className="shell">
          <div className="pilot__inner"><div><p className="eyebrow">THE MELBOURNE PILOT</p><h2 id="pilot-title" ref={pilotTitle.ref} className={pilotTitle.entered ? 'is-revealed' : undefined}><span className="reveal-line"><span>A first meeting.</span></span><span className="reveal-line"><span>A possible beginning.</span></span></h2><p className="pilot__body">A small, guided beginning that fits around work or study: meet people, choose who you’d like to work with and spend 14 days on one small project together before deciding what comes next.</p><div className="pilot__actions"><a href="#register" className="button button--light">Register your interest <ArrowUpRightIcon size={19} /></a><p>In person · Melbourne · 4–6 hours a week</p></div></div><span className="pilot__aside">Start small.<br />Think further.</span></div>
          <div className="pilot-overview" aria-labelledby="pilot-overview-title">
            <div className="pilot-overview__heading"><h3 id="pilot-overview-title">Pilot at a glance</h3><p>Planned format</p></div>
            <dl className="pilot-overview__details">
              <div><dt>Who it’s for</dt><dd>12–18 people who want to try building something and can bring a skill, an idea or industry experience. No finished idea required.</dd></div>
              <div><dt>Where we’ll meet</dt><dd>Melbourne, starting with an in-person introduction.</dd></div>
              <div><dt>What we’re planning</dt><dd>An in-person evening and mutual choice of who to work with. Then a 14-day trial on one small goal, such as a few customer conversations and a simple prototype, with a check-in on day 7 and an evidence review on day 14.</dd></div>
              <div><dt>What you’ll bring</dt><dd>4–6 hours a week, a contribution to the shared goal and a willingness to follow through. We’ll discuss availability before any invitation.</dd></div>
              <div><dt>What you’ll leave with</dt><dd>Evidence on four questions: can we work together, is the problem real, is it worth continuing, and if so, what’s the most sensible next step? Finding out early that something isn’t right is a good outcome too.</dd></div>
            </dl>
            <ul ref={boundaries.ref} className={`pilot-boundaries ${boundaries.entered ? 'is-revealed' : ''}`} aria-label="Pilot boundaries">{['Keep your job or studies', 'No company required', 'No equity taken', 'No funding promised'].map((item, i) => <li key={item} style={{ '--i': i } as CSSProperties}>{item}</li>)}</ul>
            <p className="pilot-overview__note">The date, venue and any cost will be confirmed before you’re asked to commit.</p>
          </div>
        </div>
      </section>

      <section className="belong shell" aria-labelledby="belong-title"><div className="belong__intro"><p className="eyebrow">THERE’S ROOM FOR YOU</p><h2 id="belong-title">You don’t have to<br />have it all figured out.</h2><p>Early in your career or ready for a new chapter. What matters is what you’re willing to bring.</p></div><div className="belong__rows">
        <div><span>01</span><div><h3>You have a skill.</h3><p>Code, design, growth, operations. Put what you know into something you can help shape.</p></div><ArrowUpRightIcon size={23} weight="light" aria-hidden="true" /></div>
        <div><span>02</span><div><h3>You have an idea.</h3><p>A SaaS product, an AI tool, a better way of doing things. Find people to test it with.</p></div><ArrowUpRightIcon size={23} weight="light" aria-hidden="true" /></div>
        <div><span>03</span><div><h3>You’re ready for a new chapter.</h3><p>Bring your experience, your curiosity and the intention to follow through.</p></div><ArrowUpRightIcon size={23} weight="light" aria-hidden="true" /></div>
      </div><p className="belong__note">You don’t need a finished idea. You do need a willingness to contribute.</p></section>

      <section id="about" className="about" aria-labelledby="about-title"><div className="shell about__inner"><p className="eyebrow">WHY STARTBESIDE EXISTS</p><div><h2 id="about-title">Good ideas need more<br />than a good first conversation.</h2><div className="about__columns"><p>A conversation can spark an idea. Finding out who you can build it with takes something more: time, shared effort and a chance to try working together.</p><p>StartBeside is creating that space in Melbourne. Our first pilot is designed around meeting people with different strengths, choosing who to work with and trying one small task together — so the next step comes from shared experience.</p></div><p className="about__closing">Small beginnings. Real contribution. Something shared.</p><Organiser /></div></div></section>

      <section className="faq shell" aria-labelledby="faq-title"><div className="faq__intro"><p className="eyebrow">A FEW THINGS TO KNOW</p><h2 id="faq-title">Good questions.<br />Honest answers.</h2></div><div className="faq__list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<CaretDownIcon size={20} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>

      <section id="register" className="register" aria-labelledby="register-title">
        <div className="shell register__inner">
          <div className="register__copy">
            <p className="eyebrow">LET’S START WITH YOU</p><h2 id="register-title" tabIndex={-1}>The next chapter<br />could start here.</h2><p>Tell us a little about yourself.<br />A skill. An interest. A place to begin.</p>
            <div className="registration-next" aria-labelledby="registration-next-title">
              <h3 id="registration-next-title">What happens next</h3>
              {!registration.enabled && <p className="registration-next__intro">When registration opens, here’s the planned path.</p>}
              <ol>
                <li><h4>Register your interest</h4><p>Tell us what you could bring and what you’d like to explore.</p></li>
                <li><h4>Have a short conversation</h4><p>If there’s a potential fit, we’ll discuss your availability, interests and how you like to work.</p></li>
                <li><h4>Receive a separate invitation</h4><p>If there’s a suitable pilot, we’ll send the details before you decide whether to join.</p></li>
              </ol>
              <p className="registration-next__note">Registering interest does not guarantee a place. You choose whether to accept an invitation.</p>
            </div>
          </div>
          <InterestForm onPrivacy={() => setPrivacyOpen(true)} preset={preset} />
        </div>
      </section>

      <section className="closing shell" aria-label="Closing note"><p ref={closing.ref} className={closing.entered ? 'is-gathered' : undefined}>{closingLines.map((line, l) => <Fragment key={l}>{l > 0 && <br />}{line.map(([word, from], i) => <Fragment key={word}>{i > 0 && ' '}<span className={`closing__word closing__word--${from}`} style={{ '--i': closingLines.slice(0, l).flat().length + i } as CSSProperties}>{word}</span></Fragment>)}</Fragment>)}</p><a href="#register" className="closing__link" aria-label="Go to registration"><ArrowUpRightIcon size={54} weight="light" /></a></section>
    </main>
    <footer className="site-footer shell"><a className="wordmark" href="#" aria-label="StartBeside home">StartBeside</a><span>Built around people. Melbourne.</span>{registration.contactEmail && <a className="footer-contact" href={`mailto:${registration.contactEmail}`}>{registration.contactEmail}</a>}<button className="text-button" aria-expanded={privacyOpen} aria-controls="privacy-content" onClick={() => setPrivacyOpen(value => !value)}>Privacy <ArrowUpRightIcon size={15} /></button></footer>
    <section id="privacy" className="privacy shell" aria-labelledby="privacy-title">
      <details id="privacy-content" open={privacyOpen} onToggle={event => setPrivacyOpen(event.currentTarget.open)}>
        <summary id="privacy-title">Your details, treated with care.<CaretDownIcon size={18} /></summary>
        <div>
          {registration.enabled ? <>
            <p>StartBeside uses your name, email, sector, main skill, who you’d like to meet, how you like to work, the time you could give and when suits you to plan the Melbourne pilot, review potential fit and contact you about your interest. Submissions are stored with Netlify and reviewed by the organiser. They are not published or shared with other participants, mentors or investors without your permission.</p>
            <p>To ask about your information, request a correction or have it deleted, contact <a href={`mailto:${registration.contactEmail}`}>{registration.contactEmail}</a>. You can also ask us to stop contacting you.</p>
            <p>There are no analytics or advertising trackers. Fonts and images are served with the site.</p>
          </> : <>
            <p>This prototype does not submit, store or share the information entered in the interest form. There are no analytics or advertising trackers. Fonts and images are served with the site.</p>
            <p>When live registration opens, information will be used to organise the Melbourne pilot and contact participants about StartBeside. Details will not be shared with other participants, mentors or investors without permission. {registration.contactEmail ? <>For questions about your information, contact <a href={`mailto:${registration.contactEmail}`}>{registration.contactEmail}</a>.</> : 'A contact for access or deletion requests will be provided before collecting real registrations.'}</p>
          </>}
        </div>
      </details><p className="footer-small">StartBeside · A shared beginning.</p>
    </section>
    <ReadingGate />
    {storyLoaded && <Suspense fallback={<div className="story-loading" role="status">Opening the film…</div>}><StoryDialog open={storyOpen} onClose={() => setStoryOpen(false)} /></Suspense>}
  </>
}

export default App
