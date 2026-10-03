import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon, CaretDownIcon, EnvelopeSimpleIcon, LinkSimpleIcon, PuzzlePieceIcon, ShareNetworkIcon } from '@phosphor-icons/react'
import { registration } from '../registration'
import { availability, seekingOptions, weeklyHours, workingStyles } from '../content/roles'
import type { Preset } from '../content/roles'

type TextField = 'name' | 'email' | 'sector' | 'skill' | 'style' | 'hours'
type Values = Record<TextField, string> & { seeking: string[]; days: string[] }
type FieldName = keyof Values
const empty: Values = { name: '', email: '', sector: '', skill: '', style: '', hours: '', seeking: [], days: [] }
const order: FieldName[] = ['name', 'email', 'sector', 'skill', 'seeking', 'style', 'hours']
const sectors = ['AI & machine learning', 'SaaS & software', 'Fintech', 'E-commerce & retail', 'Health & wellbeing', 'Climate & sustainability', 'Education', 'Creative industries', 'Still exploring', 'Something else']
const skills = ['Engineering & development', 'Product & strategy', 'Design & user experience', 'Marketing & growth', 'Sales & partnerships', 'Operations & finance', 'Industry expertise', 'Research & data', 'Still discovering my strengths', 'Something else']

export default function InterestForm({ onPrivacy, preset }: { onPrivacy: () => void; preset?: Preset | null }) {
  const [values, setValues] = useState<Values>(empty)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [presetApplied, setPresetApplied] = useState(false)
  const inFlight = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  const confirmation = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!preset) return
    setCompleted(false)
    setValues(previous => ({ ...previous, skill: preset.skill, seeking: preset.seeking }))
    setErrors(previous => ({ ...previous, skill: undefined, seeking: undefined }))
    setPresetApplied(true)
  }, [preset])

  const update = (field: TextField, value: string) => {
    setValues(previous => ({ ...previous, [field]: value }))
    setErrors(previous => ({ ...previous, [field]: undefined }))
  }
  const toggleSeeking = (value: string) => {
    setValues(previous => {
      const has = previous.seeking.includes(value)
      // “Open to anyone” stands alone; choosing a specific strength replaces it.
      const seeking = has ? previous.seeking.filter(item => item !== value) : value === 'Open' ? ['Open'] : [...previous.seeking.filter(item => item !== 'Open'), value]
      return { ...previous, seeking }
    })
    setErrors(previous => ({ ...previous, seeking: undefined }))
  }
  const toggleDay = (value: string) => setValues(previous => ({ ...previous, days: previous.days.includes(value) ? previous.days.filter(item => item !== value) : [...previous.days, value] }))
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (inFlight.current) return
    setSubmitError(false)
    const next: Partial<Record<FieldName, string>> = {}
    if (!values.name.trim()) next.name = 'Please tell us your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = 'Enter an email address, like you@example.com.'
    if (!values.sector) next.sector = 'Choose a sector, or select “Still exploring”.'
    if (!values.skill) next.skill = 'Choose your main skill, or tell us you’re exploring.'
    if (!values.seeking.length) next.seeking = 'Choose who you’d like to meet, or “Open to anyone”.'
    if (!values.style) next.style = 'Choose how you like to work, or “Still finding out”.'
    if (!values.hours) next.hours = 'Choose roughly how much time you could give.'
    setErrors(next)
    const first = order.find(field => next[field])
    if (first) { form.current?.querySelector<HTMLElement>(`#interest-${first}`)?.focus(); return }
    if (!registration.enabled) {
      // Local and standalone previews never store or send personal information.
      setCompleted(true)
      requestAnimationFrame(() => confirmation.current?.focus())
      return
    }
    const botField = new FormData(form.current!).get('bot-field')?.toString() || ''
    inFlight.current = true
    setSubmitting(true)
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': registration.formName,
          'bot-field': botField,
          name: values.name.trim(),
          email: values.email.trim(),
          sector: values.sector,
          skill: values.skill,
          looking_for: values.seeking.join(', '),
          working_style: values.style,
          weekly_hours: values.hours,
          availability: values.days.join(', '),
        }).toString(),
        signal: AbortSignal.timeout(15_000),
      })
      if (!response.ok) throw new Error('Registration was not accepted')
      setCompleted(true)
      requestAnimationFrame(() => confirmation.current?.focus())
    } catch {
      setSubmitError(true)
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }
  const fieldProps = (name: TextField) => ({
    id: `interest-${name}`,
    name,
    value: values[name],
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `error-${name}` : undefined,
    required: true,
    disabled: submitting,
  })
  const firstName = values.name.trim().split(/\s+/)[0]

  return completed ? <div className="form-success" ref={confirmation} tabIndex={-1} role="status">
    <span className="success-mark"><CheckIcon size={29} weight="light" /></span>
    <span className="eyebrow">{registration.enabled ? 'INTEREST RECEIVED' : 'REGISTRATION PREVIEW'}</span>
    <h3>{registration.enabled ? 'Thanks for raising your hand.' : 'That’s the first step.'}</h3>
    <p>{registration.enabled ? `Thanks, ${firstName}. We’ve received your interest. We’ll review your details and get in touch about a short conversation if there’s a potential fit.` : `Thanks for trying it, ${firstName}. In the live pilot, we’ll use these details to help shape a group with complementary strengths.`}</p>
    <p className="form-success__notice">{registration.enabled ? 'This is an expression of interest, not a confirmed place. Any pilot invitation will be sent separately, with the details you need before deciding.' : 'This was a preview. Your details have not been sent or saved, and you have not joined a waitlist.'}</p>
    <Invite />
    {!registration.enabled && <button className="text-button" onClick={() => { setCompleted(false); setValues(empty); setPresetApplied(false); requestAnimationFrame(() => document.getElementById('interest-name')?.focus()) }}>Try the form again <ArrowRightIcon size={18} /></button>}
  </div> : <form ref={form} name={registration.formName} method="POST" action="/" onSubmit={submit} noValidate className="interest-form" aria-busy={submitting}>
    <input type="hidden" name="form-name" value={registration.formName} />
    <p hidden><label>Leave this field empty<input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
    <div className="form-preview-note"><span>{registration.enabled ? 'REGISTER YOUR INTEREST' : 'REGISTRATION PREVIEW'}</span><p>{registration.enabled ? 'Start a conversation about the first Melbourne pilot.' : 'Try the form. Nothing is sent or saved yet.'}</p></div>
    {presetApplied && <p className="form-preset" role="status"><PuzzlePieceIcon size={20} weight="fill" aria-hidden="true" />We’ve added your piece and who you’re looking for. Change anything you like.</p>}
    <div className="field"><label htmlFor="interest-name">Your name</label><input {...fieldProps('name')} autoComplete="name" maxLength={100} placeholder="First and last name" onChange={event => update('name', event.target.value)} />{errors.name && <p id="error-name" className="field-error">{errors.name}</p>}</div>
    <div className="field"><label htmlFor="interest-email">Email address</label><input {...fieldProps('email')} type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" onChange={event => update('email', event.target.value)} />{errors.email && <p id="error-email" className="field-error">{errors.email}</p>}</div>
    <div className="form-row">
      <div className="field"><label htmlFor="interest-sector">Your sector</label><div className="select-wrap"><select {...fieldProps('sector')} onChange={event => update('sector', event.target.value)}><option value="" disabled>Choose your sector</option>{sectors.map(sector => <option key={sector}>{sector}</option>)}</select><CaretDownIcon size={16} aria-hidden="true" /></div>{errors.sector && <p id="error-sector" className="field-error">{errors.sector}</p>}</div>
      <div className="field"><label htmlFor="interest-skill">Your main skill</label><div className="select-wrap"><select {...fieldProps('skill')} onChange={event => update('skill', event.target.value)}><option value="" disabled>Choose your main skill</option>{skills.map(skill => <option key={skill}>{skill}</option>)}</select><CaretDownIcon size={16} aria-hidden="true" /></div>{errors.skill && <p id="error-skill" className="field-error">{errors.skill}</p>}</div>
    </div>
    <fieldset className="field-group" data-invalid={Boolean(errors.seeking)} aria-describedby={errors.seeking ? 'error-seeking' : 'hint-seeking'}>
      <legend>Who would you like to meet?</legend>
      <p id="hint-seeking" className="field-group__hint">Choose any that apply.</p>
      <div className="chip-grid">{seekingOptions.map((option, index) => <label key={option.value} className="chip">
        <input id={index === 0 ? 'interest-seeking' : undefined} type="checkbox" name="looking_for" value={option.value} checked={values.seeking.includes(option.value)} disabled={submitting} onChange={() => toggleSeeking(option.value)} />
        <span>{option.label}</span><small>{option.hint}</small>
      </label>)}</div>
      {errors.seeking && <p id="error-seeking" className="field-error">{errors.seeking}</p>}
    </fieldset>
    <fieldset className="field-group" data-invalid={Boolean(errors.style)} aria-describedby={errors.style ? 'error-style' : 'hint-style'}>
      <legend>How do you like to work?</legend>
      <p id="hint-style" className="field-group__hint">A preference to talk about, not a label.</p>
      <div className="chip-grid">{workingStyles.map((style, index) => <label key={style.value} className="chip">
        <input id={index === 0 ? 'interest-style' : undefined} type="radio" name="working_style" value={style.value} checked={values.style === style.value} disabled={submitting} onChange={() => update('style', style.value)} />
        <span>{style.value}</span><small>{style.hint}</small>
      </label>)}</div>
      {errors.style && <p id="error-style" className="field-error">{errors.style}</p>}
    </fieldset>
    <fieldset className="field-group" data-invalid={Boolean(errors.hours)} aria-describedby={errors.hours ? 'error-hours' : 'hint-hours'}>
      <legend>Time you could give during the trial</legend>
      <p id="hint-hours" className="field-group__hint">The pilot is designed around 4–6 hours a week, alongside work or study.</p>
      <div className="chip-grid chip-grid--three">{weeklyHours.map((option, index) => <label key={option.value} className="chip">
        <input id={index === 0 ? 'interest-hours' : undefined} type="radio" name="weekly_hours" value={option.value} checked={values.hours === option.value} disabled={submitting} onChange={() => update('hours', option.value)} />
        <span>{option.value}</span><small>{option.hint}</small>
      </label>)}</div>
      {errors.hours && <p id="error-hours" className="field-error">{errors.hours}</p>}
    </fieldset>
    <fieldset className="field-group" aria-describedby="hint-days">
      <legend>When usually suits you? <span className="field-optional">Optional</span></legend>
      <p id="hint-days" className="field-group__hint">Helps us pick a date that works for the group.</p>
      <div className="day-chips">{availability.map(day => <label key={day} className="day-chip">
        <input type="checkbox" name="availability" value={day} checked={values.days.includes(day)} disabled={submitting} onChange={() => toggleDay(day)} />
        <span>{day}</span>
      </label>)}</div>
    </fieldset>
    {submitError && <p className="form-submit-error" role="alert">We couldn’t confirm your registration. Your details are still here; please try again. You can also contact <a href={`mailto:${registration.contactEmail}`}>{registration.contactEmail}</a>.</p>}
    <button className="button form-submit" type="submit" disabled={submitting}>{submitting ? 'Sending your interest…' : registration.enabled ? 'Register your interest' : 'Preview registration'} <ArrowUpRightIcon size={20} /></button>
    <p className="form-privacy">{registration.enabled ? 'By submitting, you agree that StartBeside can use these details to plan the pilot and contact you about your interest. Submissions are stored with Netlify and reviewed by the organiser.' : 'For the live pilot, your details will be used to plan the group and contact you about StartBeside. They won’t be shared without your permission.'} <a href="#privacy" onClick={onPrivacy}>Privacy details</a></p>
  </form>
}

/** Lets someone bring a person they'd like to build with. Nothing is tracked. */
function Invite() {
  const [status, setStatus] = useState('')
  if (!window.location.protocol.startsWith('http')) return null
  const url = `${window.location.origin}/`
  const text = 'StartBeside is a Melbourne pilot for future co-founders: meet people, try a startup idea together and see if you’re a team. I thought of you.'
  const canShare = typeof navigator.share === 'function'
  const share = async () => { try { await navigator.share({ title: 'StartBeside — Don’t build alone.', text, url }) } catch { /* dismissed */ } }
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setStatus('Link copied.') } catch { setStatus(url) }
  }

  return <div className="invite">
    <h4>Know someone who should be in the room?</h4>
    <p>If they’d bring something different to the table, pass this on. We talk to everyone before any invitation.</p>
    <div className="invite__actions">
      {canShare && <button type="button" className="invite__primary" onClick={() => void share()}><ShareNetworkIcon size={17} aria-hidden="true" />Share</button>}
      <button type="button" onClick={() => void copy()}><LinkSimpleIcon size={17} aria-hidden="true" />Copy link</button>
      <a href={`mailto:?subject=${encodeURIComponent('Want to build something together?')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`}><EnvelopeSimpleIcon size={17} aria-hidden="true" />Email</a>
    </div>
    <p className="invite__status" aria-live="polite">{status}</p>
  </div>
}
