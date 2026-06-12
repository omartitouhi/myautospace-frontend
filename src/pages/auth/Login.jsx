import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { Brand } from '../../components/Brand'
import { Alert, Field } from '../../components/app/ui'
import { Icon } from '../../lib/Icon'

export function Login() {
  const { t, theme, toggleTheme, toggleLang } = useUI()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const a = t.app.auth

  if (isAuthenticated) {
    return <Navigate to={location.state?.from ?? '/app'} replace />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
      navigate(location.state?.from ?? '/app', { replace: true })
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
        <h1>{a.loginTitle}</h1>
        <p className="auth-sub">{a.loginSub}</p>
        {error ? <Alert>{error}</Alert> : null}
        <form onSubmit={onSubmit}>
          <Field label={a.email}>
            <input
              className="input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label={a.password}>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <button className="btn btn-primary btn-lg auth-submit" disabled={busy}>
            {busy ? a.signingIn : a.signin}
          </button>
        </form>
        <p className="auth-switch">
          {a.noAccount} <Link to="/register">{a.createOne}</Link>
        </p>
      </div>
    </div>
  )
}
