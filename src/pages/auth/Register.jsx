import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { Brand } from '../../components/Brand'
import { Alert, Field } from '../../components/app/ui'
import { Icon } from '../../lib/Icon'

const ROLES = ['Buyer', 'Seller', 'ServiceProvider']

export function Register() {
  const { t, theme, toggleTheme, toggleLang } = useUI()
  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Buyer',
  })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const a = t.app.auth

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await register(form)
      // Profile onboarding comes next; AppLayout redirects there.
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-tools">
        <button className="tool-btn" onClick={toggleTheme} aria-label={t.nav.switchTheme}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
        <button className="tool-btn" onClick={toggleLang} aria-label={t.nav.switchLang}>
          {t.other}
        </button>
      </div>
      <div className="auth-card glass">
        <Brand />
        <h1>{a.registerTitle}</h1>
        <p className="auth-sub">{a.registerSub}</p>
        {error ? <Alert>{error}</Alert> : null}
        <form onSubmit={onSubmit}>
          <div className="field-row">
            <Field label={a.firstName}>
              <input
                className="input"
                autoComplete="given-name"
                required
                value={form.firstName}
                onChange={set('firstName')}
              />
            </Field>
            <Field label={a.lastName}>
              <input
                className="input"
                autoComplete="family-name"
                required
                value={form.lastName}
                onChange={set('lastName')}
              />
            </Field>
          </div>
          <Field label={a.email}>
            <input
              className="input"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={set('email')}
            />
          </Field>
          <Field label={a.password}>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={set('password')}
            />
          </Field>
          <fieldset className="role-pick">
            <legend className="field-label">{a.iWantTo}</legend>
            {ROLES.map((role) => (
              <label key={role} className="role-opt" data-on={form.role === role ? '1' : '0'}>
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={form.role === role}
                  onChange={set('role')}
                />
                <b>{a.roles[role]}</b>
                <span>{a.roleHints[role]}</span>
              </label>
            ))}
          </fieldset>
          <button className="btn btn-primary btn-lg auth-submit" disabled={busy}>
            {busy ? a.creating : a.create}
          </button>
        </form>
        <p className="auth-switch">
          {a.haveAccount} <Link to="/login">{a.signinLink}</Link>
        </p>
      </div>
    </div>
  )
}
