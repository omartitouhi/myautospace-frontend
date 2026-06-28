import { useEffect, useState } from 'react'
import { useUI } from '../../lib/ui'
import { mapApi, ApiError } from '../../lib/api'
import { getCurrentPosition } from '../../lib/geo'
import { Icon } from '../../lib/Icon'
import { Alert, Field, Spinner } from './ui'

/* Create-or-update the MapService location for a single entity
   (a vehicle or a provider profile). Self-contained: loads the existing
   location, lets the owner edit coordinates, and upserts on save. */
export function LocationPanel({ entityId, entityType, defaultCity = '', defaultCountry = 'Tunisie' }) {
  const { t } = useUI()
  const m = t.app.map
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ latitude: '', longitude: '', address: '', city: defaultCity, country: defaultCountry })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    let cancelled = false
    mapApi
      .getByEntity(entityId, entityType)
      .then((loc) => {
        if (cancelled) return
        setForm({
          latitude: String(loc.latitude),
          longitude: String(loc.longitude),
          address: loc.address ?? '',
          city: loc.city ?? defaultCity,
          country: loc.country ?? defaultCountry,
        })
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) setStatus('ready')
        else {
          setError(err.message)
          setStatus('ready')
        }
      })
    return () => {
      cancelled = true
    }
  }, [entityId, entityType, defaultCity, defaultCountry])

  const locate = async () => {
    setError(null)
    try {
      const pos = await getCurrentPosition()
      setForm((f) => ({ ...f, latitude: pos.latitude.toFixed(6), longitude: pos.longitude.toFixed(6) }))
    } catch {
      setError(m.geoError)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setSaved(false)
    try {
      await mapApi.upsertForEntity(entityId, entityType, {
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        address: form.address.trim() || null,
        city: form.city.trim(),
        country: form.country.trim(),
      })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel glass">
      <h2 className="panel-sub">{m.location}</h2>
      <p className="profile-meta">{m.locationHint}</p>
      {status === 'loading' ? (
        <Spinner />
      ) : (
        <form onSubmit={save}>
          {error ? <Alert>{error}</Alert> : null}
          {saved ? <Alert tone="success">{m.saved}</Alert> : null}
          <div className="field-row">
            <Field label={m.latitude}>
              <input className="input" type="number" step="any" min="-90" max="90" required value={form.latitude} onChange={set('latitude')} />
            </Field>
            <Field label={m.longitude}>
              <input className="input" type="number" step="any" min="-180" max="180" required value={form.longitude} onChange={set('longitude')} />
            </Field>
          </div>
          <Field label={m.address} hint={t.app.common.optional}>
            <input className="input" value={form.address} onChange={set('address')} />
          </Field>
          <div className="field-row">
            <Field label={m.city}>
              <input className="input" required value={form.city} onChange={set('city')} />
            </Field>
            <Field label={m.country}>
              <input className="input" required value={form.country} onChange={set('country')} />
            </Field>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={locate} disabled={busy}>
              <Icon name="pin" /> {m.useMyLocation}
            </button>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? m.saving : m.save}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
