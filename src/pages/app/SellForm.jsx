import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { vehicleApi } from '../../lib/api'
import { Alert, Field, PageHead, Segmented, Select, Spinner } from '../../components/app/ui'

const FUELS = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG']
const TRANSMISSIONS = ['Manual', 'Automatic', 'SemiAutomatic']
const BODIES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Van', 'Truck', 'Motorcycle', 'Other']

const BLANK = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  vin: '',
  price: '',
  description: '',
  mileage: '',
  fuelType: 'Petrol',
  transmission: 'Manual',
  bodyType: 'Sedan',
  listingType: 'ForSale',
  color: '',
  country: 'Tunisia',
  city: '',
}

export function SellForm() {
  const { id } = useParams()
  const isEdit = !!id
  const { t } = useUI()
  const { isSeller } = useAuth()
  const navigate = useNavigate()
  const a = t.app
  const [form, setForm] = useState(BLANK)
  const [loaded, setLoaded] = useState(!isEdit)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    vehicleApi
      .get(id)
      .then((v) => {
        if (cancelled) return
        setForm({
          make: v.make,
          model: v.model,
          year: v.year,
          vin: v.vin ?? '',
          price: String(v.price),
          description: v.description ?? '',
          mileage: String(v.mileage),
          fuelType: v.fuelType,
          transmission: v.transmission,
          bodyType: v.bodyType,
          listingType: v.listingType,
          color: v.color ?? '',
          country: v.country,
          city: v.city,
        })
        setLoaded(true)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  if (!isSeller) {
    return <Alert tone="info">{a.garage.notSeller}</Alert>
  }
  if (!loaded) {
    return error ? <Alert>{error}</Alert> : <Spinner label={a.common.loading} />
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setValue = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const payload = {
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      vin: form.vin.trim() || null,
      price: Number(form.price),
      description: form.description.trim() || null,
      mileage: Number(form.mileage),
      fuelType: form.fuelType,
      transmission: form.transmission,
      bodyType: form.bodyType,
      color: form.color.trim() || null,
      country: form.country.trim(),
      city: form.city.trim(),
    }
    try {
      if (isEdit) {
        const updated = await vehicleApi.update(id, payload)
        navigate(`/app/vehicles/${updated.id}`)
      } else {
        const created = await vehicleApi.create({ ...payload, listingType: form.listingType })
        navigate(`/app/vehicles/${created.id}`)
      }
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="page-narrow">
      <PageHead
        title={isEdit ? a.sell.editTitle : a.sell.createTitle}
        sub={isEdit ? a.sell.editSub : a.sell.createSub}
      />
      {error ? <Alert>{error}</Alert> : null}

      <form className="panel glass" onSubmit={onSubmit}>
        <h3 className="form-section">{a.sell.vehicleSection}</h3>
        <div className="field-row">
          <Field label={a.sell.make}>
            <input className="input" required maxLength={100} value={form.make} onChange={set('make')} />
          </Field>
          <Field label={a.sell.model}>
            <input className="input" required maxLength={100} value={form.model} onChange={set('model')} />
          </Field>
        </div>
        <div className="field-row">
          <Field label={a.sell.year}>
            <input className="input" type="number" required min={1900} max={2100} value={form.year} onChange={set('year')} />
          </Field>
          <Field label={a.sell.mileage}>
            <input className="input" type="number" required min={0} value={form.mileage} onChange={set('mileage')} />
          </Field>
        </div>
        <div className="field-row">
          <Field label={a.sell.fuel}>
            <Select value={form.fuelType} onChange={set('fuelType')} options={FUELS.map((v) => [v, a.enums.fuel[v]])} />
          </Field>
          <Field label={a.sell.transmission}>
            <Select
              value={form.transmission}
              onChange={set('transmission')}
              options={TRANSMISSIONS.map((v) => [v, a.enums.transmission[v]])}
            />
          </Field>
        </div>
        <div className="field-row">
          <Field label={a.sell.body}>
            <Select value={form.bodyType} onChange={set('bodyType')} options={BODIES.map((v) => [v, a.enums.body[v]])} />
          </Field>
          <Field label={a.sell.color} hint={a.common.optional}>
            <input className="input" maxLength={50} value={form.color} onChange={set('color')} />
          </Field>
        </div>
        <Field label={a.sell.vin} hint={a.common.optional}>
          <input
            className="input"
            minLength={17}
            maxLength={17}
            pattern="[A-HJ-NPR-Za-hj-npr-z0-9]{17}"
            value={form.vin}
            onChange={set('vin')}
          />
        </Field>

        <h3 className="form-section">{a.sell.listingSection}</h3>
        {!isEdit ? (
          <Field label={a.sell.listingType}>
            <Segmented
              value={form.listingType}
              onChange={setValue('listingType')}
              ariaLabel={a.sell.listingType}
              options={[
                ['ForSale', a.enums.listing.ForSale],
                ['ForRent', a.enums.listing.ForRent],
              ]}
            />
          </Field>
        ) : null}
        <Field label={a.sell.price}>
          <input className="input" type="number" required min={1} step="any" value={form.price} onChange={set('price')} />
        </Field>
        <Field label={a.sell.description} hint={a.common.optional}>
          <textarea
            className="input"
            rows={5}
            maxLength={2000}
            placeholder={a.sell.descriptionPlaceholder}
            value={form.description}
            onChange={set('description')}
          />
        </Field>

        <h3 className="form-section">{a.sell.locationSection}</h3>
        <div className="field-row">
          <Field label={a.sell.country}>
            <input className="input" required maxLength={100} value={form.country} onChange={set('country')} />
          </Field>
          <Field label={a.sell.city}>
            <input className="input" required maxLength={100} value={form.city} onChange={set('city')} />
          </Field>
        </div>

        <button className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? a.sell.submittingCreate : isEdit ? a.sell.submitSave : a.sell.submitCreate}
        </button>
      </form>
    </div>
  )
}
