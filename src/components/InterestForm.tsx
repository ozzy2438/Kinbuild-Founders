import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon, CaretDownIcon } from '@phosphor-icons/react'
import { registration } from '../registration'

type FieldName = 'name' | 'email' | 'sector' | 'skill'
type Fields = Record<FieldName, string>
const empty: Fields = { name: '', email: '', sector: '', skill: '' }
const sectors = ['AI & machine learning', 'SaaS & software', 'Fintech', 'E-commerce & retail', 'Health & wellbeing', 'Climate & sustainability', 'Education', 'Creative industries', 'Still exploring', 'Something else']
const skills = ['Engineering & development', 'Product & strategy', 'Design & user experience', 'Marketing & growth', 'Sales & partnerships', 'Operations & finance', 'Industry expertise', 'Research & data', 'Still discovering my strengths', 'Something else']

export default function InterestForm({ onPrivacy }: { onPrivacy: () => void }) {
  const [values, setValues] = useState<Fields>(empty)
  const [errors, setErrors] = useState<Partial<Fields>>({})
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const inFlight = useRef(false)
  const form = useRef<HTMLFormElement>(null)
  const confirmation = useRef<HTMLDivElement>(null)

  const update = (field: FieldName, value: string) => {
    setValues(previous => ({ ...previous, [field]: value }))
    setErrors(previous => ({ ...previous, [field]: undefined }))
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (inFlight.current) return
    setSubmitError(false)
    const next: Partial<Fields> = {}
    if (!values.name.trim()) next.name = 'Please tell us your name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = 'Enter an email address, like you@example.com.'
    if (!values.sector) next.sector = 'Choose a sector, or select “Still exploring”.'
    if (!values.skill) next.skill = 'Choose your main skill, or tell us you’re exploring.'
    setErrors(next)
    const first = Object.keys(next)[0]
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
  const fieldProps = (name: FieldName) => ({
    id: `interest-${name}`,
    name,
    value: values[name],
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `error-${name}` : undefined,
    required: true,
    disabled: submitting,
  })

  return completed ? <div className="form-success" ref={confirmation} tabIndex={-1} role="status">
    <span className="success-mark"><CheckIcon size={29} weight="light" /></span>
    <span className="eyebrow">{registration.enabled ? 'INTEREST RECEIVED' : 'REGISTRATION PREVIEW'}</span>
    <h3>{registration.enabled ? 'Thanks for raising your hand.' : 'That’s the first step.'}</h3>
    <p>{registration.enabled ? `Thanks, ${values.name.trim().split(/\s+/)[0]}. We’ve received your interest. We’ll review your details and get in touch about a short conversation if there’s a potential fit.` : `Thanks for trying it, ${values.name.trim().split(/\s+/)[0]}. In the live pilot, we’ll use these details to help shape a group with complementary strengths.`}</p>
    <p className="form-success__notice">{registration.enabled ? 'This is an expression of interest, not a confirmed place. Any pilot invitation will be sent separately, with the details you need before deciding.' : 'This was a preview. Your details have not been sent or saved, and you have not joined a waitlist.'}</p>
    {!registration.enabled && <button className="text-button" onClick={() => { setCompleted(false); setValues(empty); requestAnimationFrame(() => document.getElementById('interest-name')?.focus()) }}>Try the form again <ArrowRightIcon size={18} /></button>}
  </div> : <form ref={form} name={registration.formName} method="POST" action="/" onSubmit={submit} noValidate className="interest-form" aria-busy={submitting}>
    <input type="hidden" name="form-name" value={registration.formName} />
    <p hidden><label>Leave this field empty<input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
    <div className="form-preview-note"><span>{registration.enabled ? 'REGISTER YOUR INTEREST' : 'REGISTRATION PREVIEW'}</span><p>{registration.enabled ? 'Start a conversation about the first Melbourne pilot.' : 'Try the form. Nothing is sent or saved yet.'}</p></div>
    <div className="field"><label htmlFor="interest-name">Your name</label><input {...fieldProps('name')} autoComplete="name" maxLength={100} placeholder="First and last name" onChange={event => update('name', event.target.value)} />{errors.name && <p id="error-name" className="field-error">{errors.name}</p>}</div>
    <div className="field"><label htmlFor="interest-email">Email address</label><input {...fieldProps('email')} type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" onChange={event => update('email', event.target.value)} />{errors.email && <p id="error-email" className="field-error">{errors.email}</p>}</div>
    <div className="form-row">
      <div className="field"><label htmlFor="interest-sector">Your sector</label><div className="select-wrap"><select {...fieldProps('sector')} onChange={event => update('sector', event.target.value)}><option value="" disabled>Choose your sector</option>{sectors.map(sector => <option key={sector}>{sector}</option>)}</select><CaretDownIcon size={16} aria-hidden="true" /></div>{errors.sector && <p id="error-sector" className="field-error">{errors.sector}</p>}</div>
      <div className="field"><label htmlFor="interest-skill">Your main skill</label><div className="select-wrap"><select {...fieldProps('skill')} onChange={event => update('skill', event.target.value)}><option value="" disabled>Choose your main skill</option>{skills.map(skill => <option key={skill}>{skill}</option>)}</select><CaretDownIcon size={16} aria-hidden="true" /></div>{errors.skill && <p id="error-skill" className="field-error">{errors.skill}</p>}</div>
    </div>
    {submitError && <p className="form-submit-error" role="alert">We couldn’t confirm your registration. Your details are still here; please try again. You can also contact <a href={`mailto:${registration.contactEmail}`}>{registration.contactEmail}</a>.</p>}
    <button className="button form-submit" type="submit" disabled={submitting}>{submitting ? 'Sending your interest…' : registration.enabled ? 'Register your interest' : 'Preview registration'} <ArrowUpRightIcon size={20} /></button>
    <p className="form-privacy">{registration.enabled ? 'By submitting, you agree that StartBeside can use these details to plan the pilot and contact you about your interest. Submissions are stored with Netlify and reviewed by the organiser.' : 'For the live pilot, your details will be used to plan the group and contact you about StartBeside. They won’t be shared without your permission.'} <a href="#privacy" onClick={onPrivacy}>Privacy details</a></p>
  </form>
}
