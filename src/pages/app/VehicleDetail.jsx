import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { vehicleApi, bookingApi, ApiError } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatDate, formatKm, formatPrice } from '../../lib/format'
import { Alert, EmptyState, Field, Spinner, StatusChip, VehicleArt } from '../../components/app/ui'

export function VehicleDetail() {
  const { id } = useParams()
  const { t, lang } = useUI()
  const { session } = useAuth()
  const navigate = useNavigate()
  const a = t.app
  const [vehicle, setVehicle] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    vehicleApi
      .get(id)
      .then((data) => {
        if (!cancelled) setVehicle(data)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
        else setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (notFound) {
    return (
      <EmptyState title={a.vehicle.notFound}>
        <Link className="btn btn-ghost" to="/app">
          {a.vehicle.backToBrowse}
        </Link>
      </EmptyState>
    )
  }
  if (!vehicle) {
    return error ? <Alert>{error}</Alert> : <Spinner label={a.common.loading} />
  }

  const isOwner = session?.userId === vehicle.ownerAuthUserId

  const setStatus = async (status) => {
    setBusy(true)
    setError(null)
    try {
      await vehicleApi.setStatus(vehicle.id, status)
      setVehicle((v) => ({ ...v, status }))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!window.confirm(a.vehicle.deleteConfirm)) return
    setBusy(true)
    setError(null)
    try {
      await vehicleApi.remove(vehicle.id)
      navigate('/app/garage', { replace: true })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const specs = [
    [a.vehicle.year, vehicle.year],
    [a.vehicle.mileage, formatKm(vehicle.mileage, lang)],
    [a.vehicle.fuel, a.enums.fuel[vehicle.fuelType] ?? vehicle.fuelType],
    [a.vehicle.transmission, a.enums.transmission[vehicle.transmission] ?? vehicle.transmission],
    [a.vehicle.body, a.enums.body[vehicle.bodyType] ?? vehicle.bodyType],
    [a.vehicle.color, vehicle.color || a.common.notProvided],
    [a.vehicle.vin, vehicle.vin || a.common.notProvided],
    [a.vehicle.location, `${vehicle.city}, ${vehicle.country}`],
    [a.vehicle.listed, formatDate(vehicle.createdAt, lang)],
    [a.vehicle.updated, formatDate(vehicle.updatedAt, lang)],
  ]

  return (
    <div className="vdetail">
      <Link to="/app" className="back-link">
        <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} /> {a.vehicle.backToBrowse}
      </Link>

      {error ? <Alert>{error}</Alert> : null}

      <div className="vdetail-grid">
        <div className="vdetail-media glass-card">
          <VehicleArt vehicle={vehicle} />
        </div>

        <div className="vdetail-side">
          <div className="panel glass">
            <div className="vdetail-chips">
              <StatusChip
                status={vehicle.listingType}
                label={a.enums.listing[vehicle.listingType] ?? vehicle.listingType}
              />
              <StatusChip status={vehicle.status} label={a.enums.vstatus[vehicle.status]} />
            </div>
            <h1 className="vdetail-title">
              {vehicle.make} {vehicle.model}
              <span className="vdetail-year">{vehicle.year}</span>
            </h1>
            <div className="vdetail-price">{formatPrice(vehicle.price, lang)}</div>
            <div className="vdetail-loc">
              <Icon name="pin" /> {vehicle.city}, {vehicle.country}
            </div>
          </div>

          {isOwner ? (
            <div className="panel glass owner-panel">
              <h3>
                <Icon name="shieldCheck" /> {a.vehicle.yourListing}
              </h3>
              <p>{a.vehicle.ownerHint}</p>
              <div className="owner-actions">
                <Link className="btn btn-ghost btn-sm" to={`/app/sell/${vehicle.id}`}>
                  <Icon name="pen" /> {a.common.edit}
                </Link>
                {vehicle.status === 'Active' ? (
                  <>
                    <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setStatus('Sold')}>
                      {a.vehicle.markSold}
                    </button>
                    {vehicle.listingType === 'ForRent' ? (
                      <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setStatus('Rented')}>
                        {a.vehicle.markRented}
                      </button>
                    ) : null}
                    <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setStatus('Inactive')}>
                      {a.vehicle.deactivate}
                    </button>
                  </>
                ) : (
                  <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setStatus('Active')}>
                    {a.vehicle.activate}
                  </button>
                )}
                <button className="btn btn-danger btn-sm" disabled={busy} onClick={remove}>
                  <Icon name="trash" /> {a.common.delete}
                </button>
              </div>
            </div>
          ) : vehicle.status === 'Active' ? (
            <BookingPanel vehicle={vehicle} />
          ) : null}
        </div>
      </div>

      <section className="panel glass">
        <h2>{a.vehicle.specs}</h2>
        <dl className="spec-grid">
          {specs.map(([label, value]) => (
            <div key={label} className="spec">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel glass">
        <h2>{a.vehicle.description}</h2>
        <p className="vdetail-desc">{vehicle.description || a.vehicle.noDescription}</p>
      </section>
    </div>
  )
}

/* Lets a non-owner request a test drive (for-sale) or a rental (for-rent). */
function BookingPanel({ vehicle }) {
  const { t } = useUI()
  const v = t.app.vehicle
  const isRental = vehicle.listingType === 'ForRent'
  // Default to tomorrow 10:00, formatted for <input type="datetime-local">.
  const defaultWhen = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(10, 0, 0, 0)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  const [when, setWhen] = useState(defaultWhen)
  const [days, setDays] = useState(3)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await bookingApi.create({
        vehicleId: vehicle.id,
        serviceType: isRental ? 'Rental' : 'TestDrive',
        scheduledAt: new Date(when).toISOString(),
        durationMinutes: isRental ? Math.max(1, Number(days)) * 1440 : 30,
        note: note.trim() || null,
      })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="panel glass">
        <Alert tone="info">{v.bookingSent}</Alert>
        <Link className="btn btn-ghost btn-sm" to="/app/bookings">
          <Icon name="cal" /> {t.app.bookings.mine}
        </Link>
      </div>
    )
  }

  return (
    <form className="panel glass booking-panel" onSubmit={submit}>
      <h3>
        <Icon name="cal" /> {isRental ? v.bookRental : v.bookTestDrive}
      </h3>
      {error ? <Alert>{error}</Alert> : null}
      <Field label={v.when}>
        <input className="input" type="datetime-local" required value={when} onChange={(e) => setWhen(e.target.value)} />
      </Field>
      {isRental ? (
        <Field label={v.days}>
          <input className="input" type="number" min={1} max={60} required value={days} onChange={(e) => setDays(e.target.value)} />
        </Field>
      ) : null}
      <Field label={v.bookNote} hint={t.app.common.optional}>
        <textarea
          className="input"
          rows={2}
          placeholder={v.bookNotePlaceholder}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      <button className="btn btn-primary" disabled={busy}>
        {busy ? v.sending : v.sendRequest}
      </button>
    </form>
  )
}
