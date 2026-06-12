import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { userApi } from '../../lib/api'
import { Alert, Field, PageHead } from '../../components/app/ui'

/* Onboarding: AuthService knows the name from registration, but the
   UserService profile is a separate record the user creates here. */
export function Welcome() {
  const { t } = useUI()
  const { setProfile } = useAuth()
  const navigate = useNavigate()
  const a = t.app.welcome
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    phoneNumber: '',
    address: '',
    country: 'Tunisia',
    city: '',
    bio: '',
  })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const profile = await userApi.createProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        birthDate: form.birthDate || null,
        phoneNumber: form.phoneNumber || null,
        address: form.address || null,
        country: form.country || null,
        city: form.city || null,
        bio: form.bio || null,
      })
      setProfile(profile)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="page-narrow">
      <PageHead title={a.title} sub={a.sub} />
      {error ? <Alert>{error}</Alert> : null}
      <form className="panel glass" onSubmit={onSubmit}>
        <div className="field-row">
          <Field label={t.app.auth.firstName}>
            <input className="input" required value={form.firstName} onChange={set('firstName')} />
          </Field>
          <Field label={t.app.auth.lastName}>
            <input className="input" required value={form.lastName} onChange={set('lastName')} />
          </Field>
        </div>
        <div className="field-row">
          <Field label={a.phone} hint={t.app.common.optional}>
            <input className="input" type="tel" autoComplete="tel" value={form.phoneNumber} onChange={set('phoneNumber')} />
          </Field>
          <Field label={a.birthDate} hint={t.app.common.optional}>
            <input className="input" type="date" value={form.birthDate} onChange={set('birthDate')} />
          </Field>
        </div>
        <Field label={a.address} hint={t.app.common.optional}>
          <input className="input" autoComplete="street-address" value={form.address} onChange={set('address')} />
        </Field>
        <div className="field-row">
          <Field label={a.country} hint={t.app.common.optional}>
            <input className="input" value={form.country} onChange={set('country')} />
          </Field>
          <Field label={a.city} hint={t.app.common.optional}>
            <input className="input" value={form.city} onChange={set('city')} />
          </Field>
        </div>
        <Field label={a.bio} hint={t.app.common.optional}>
          <textarea
            className="input"
            rows={3}
            placeholder={a.bioPlaceholder}
            value={form.bio}
            onChange={set('bio')}
          />
        </Field>
        <button className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? a.submitting : a.submit}
        </button>
      </form>
    </div>
  )
}
