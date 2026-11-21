import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { Img, Mark } from '../components/ui'
import { img } from '../data/listings'
import { useStore } from '../lib/store'
import { BRAND } from '../brand'

export default function Auth({ mode }: { mode: 'signin' | 'signup' }) {
  const { login, register, live } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/account'
  const isUp = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (isUp && !name.trim()) errs.name = 'Please enter your name'
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Enter a valid email'
    if (pw.length < 8) errs.pw = 'At least 8 characters'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    const err = isUp ? await register(name.trim(), email.trim(), pw) : await login(email.trim(), pw)
    setBusy(false)
    if (err === 'CHECK_EMAIL') return setSent(true)
    if (err) return setErrors({ form: err })
    nav(next, { replace: true })
  }

  return (
    <section className="auth">
      <Img className="auth__bg" src={img('1582268611958-ebfd161ef9cf', 2000)} alt="" />
      <div className="auth__scrim" />
      <div className="auth__card glass-card">
        <span className="auth__mark"><Mark size={40} /></span>
        <h1>{isUp ? `Join ${BRAND}` : 'Welcome back'}</h1>
        <p className="muted">{isUp ? 'Save homes, book faster and reach the concierge.' : 'Sign in to see your trips and saved homes.'}</p>
        {sent ? (
          <p className="auth__sent">
            Check <strong>{email}</strong> for a link to confirm your account, then come back to sign in.
          </p>
        ) : (
        <form onSubmit={submit} noValidate>
          {isUp && (
            <label className="field field--full">
              Full name
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              {errors.name && <span className="field__err">{errors.name}</span>}
            </label>
          )}
          <label className="field field--full">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            {errors.email && <span className="field__err">{errors.email}</span>}
          </label>
          <label className="field field--full">
            Password
            <span className="pw">
              <input type={show ? 'text' : 'password'} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={isUp ? 'new-password' : 'current-password'} />
              <button type="button" className="pw__toggle" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>
                <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </span>
            {errors.pw && <span className="field__err">{errors.pw}</span>}
          </label>
          {errors.form && <p className="field__err">{errors.form}</p>}
          <button className="btn btn--primary btn--lg btn--block" disabled={busy}>
            {busy ? <span className="spinner" /> : isUp ? 'Create account' : 'Sign in'}
          </button>
        </form>
        )}
        <p className="auth__switch">
          {isUp ? 'Already a member?' : 'New here?'}{' '}
          <Link to={`${isUp ? '/signin' : '/signup'}${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-link">
            {isUp ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
        {!live && <p className="auth__note">Demo only: no real account is created and nothing leaves your browser.</p>}
      </div>
    </section>
  )
}
