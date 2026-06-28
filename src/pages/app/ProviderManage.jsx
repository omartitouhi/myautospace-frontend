import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { providerApi, ApiError } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatPrice, hueOf } from '../../lib/format'
import { Alert, EmptyState, Field, PageHead, Select, Spinner } from '../../components/app/ui'
import { UploadButton } from '../../components/app/MediaUpload'
import { LocationPanel } from '../../components/app/LocationPanel'

const CATEGORIES = ['Maintenance', 'Repair', 'Inspection', 'Cleaning', 'Tuning', 'BodyWork', 'Tires', 'Other']

function trimSeconds(time) {
  return typeof time === 'string' ? time.slice(0, 5) : time
}

export function ProviderManage() {
  const { t } = useUI()
  const { isServiceProvider } = useAuth()
  const p = t.app.providers
  const c = t.app.common
  // null = loading, 'missing' = no profile, object = profile
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  const load = () => {
    providerApi
      .getMine()
      .then((data) => {
        setProfile(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setProfile(null)
          setStatus('missing')
        } else {
          setError(err.message)
          setStatus('error')
        }
      })
  }

  useEffect(() => {
    if (!isServiceProvider) return
    let cancelled = false
    providerApi
      .getMine()
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setProfile(null)
          setStatus('missing')
        } else {
          setError(err.message)
          setStatus('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [isServiceProvider])

  if (!isServiceProvider) {
    return <Alert tone="info">{p.notProvider}</Alert>
  }

  return (
    <>
      <PageHead title={p.manageTitle} sub={p.manageSub} />
      {error ? <Alert>{error}</Alert> : null}

      {status === 'loading' ? (
        <Spinner label={c.loading} />
      ) : status === 'missing' ? (
        <CreateProfile onError={setError} onCreated={load} />
      ) : profile ? (
        <ProfileManager profile={profile} reload={load} onError={setError} />
      ) : null}
    </>
  )
}

function CreateProfile({ onCreated, onError }) {
  const { t } = useUI()
  const p = t.app.providers
  const c = t.app.common
  const [form, setForm] = useState({ businessName: '', description: '', phoneNumber: '', address: '', city: '', country: 'Tunisie' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      await providerApi.create({
        businessName: form.businessName.trim(),
        description: form.description.trim() || null,
        phoneNumber: form.phoneNumber.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim(),
        country: form.country.trim(),
      })
      onCreated()
    } catch (err) {
      onError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="page-narrow">
      <EmptyState icon="wrench" title={p.createProfile} hint={p.createProfileHint} />
      <form className="panel glass" onSubmit={submit}>
        <Field label={p.businessName}>
          <input className="input" required maxLength={200} value={form.businessName} onChange={set('businessName')} />
        </Field>
        <Field label={p.description} hint={c.optional}>
          <textarea className="input" rows={3} maxLength={2000} value={form.description} onChange={set('description')} />
        </Field>
        <div className="field-row">
          <Field label={p.phone} hint={c.optional}>
            <input className="input" value={form.phoneNumber} onChange={set('phoneNumber')} />
          </Field>
          <Field label={p.address} hint={c.optional}>
            <input className="input" value={form.address} onChange={set('address')} />
          </Field>
        </div>
        <div className="field-row">
          <Field label={p.city}>
            <input className="input" required value={form.city} onChange={set('city')} />
          </Field>
          <Field label={p.country}>
            <input className="input" required value={form.country} onChange={set('country')} />
          </Field>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy}>
            {busy ? p.saving : p.saveProfile}
          </button>
        </div>
      </form>
    </div>
  )
}

function ProfileManager({ profile, reload, onError }) {
  const { t } = useUI()
  const p = t.app.providers
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  const deleteProfile = async () => {
    if (!window.confirm(p.deleteProfileConfirm)) return
    setBusy(true)
    onError(null)
    try {
      await providerApi.remove(profile.id)
      reload()
    } catch (err) {
      onError(err.message)
      setBusy(false)
    }
  }

  return (
    <>
      <BrandingSection profile={profile} reload={reload} onError={onError} />

      <section className="panel glass">
        <div className="panel-head">
          <h2 className="panel-sub">{p.profileSection}</h2>
          {!editing ? (
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
              <Icon name="pen" /> {p.editProfile}
            </button>
          ) : null}
        </div>
        {editing ? (
          <ProfileEditForm
            profile={profile}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false)
              reload()
            }}
            onError={onError}
          />
        ) : (
          <>
            <h3>{profile.businessName}</h3>
            <p className="profile-meta">
              <Icon name="pin" /> {profile.city}, {profile.country}
            </p>
            {profile.description ? <p>{profile.description}</p> : null}
            <button className="btn btn-danger btn-sm" onClick={deleteProfile} disabled={busy}>
              <Icon name="trash" /> {p.deleteProfile}
            </button>
          </>
        )}
      </section>

      <ServicesSection profile={profile} reload={reload} onError={onError} />
      <AvailabilitySection profile={profile} reload={reload} onError={onError} />
      <GallerySection profile={profile} reload={reload} onError={onError} />
      <LocationPanel entityId={profile.id} entityType="Provider" defaultCity={profile.city} defaultCountry={profile.country} />
    </>
  )
}

/* Public-profile branding: cover + logo upload and a live stat preview.
   Image uploads persist immediately via providerApi.update. */
function BrandingSection({ profile, reload, onError }) {
  const { t, lang } = useUI()
  const p = t.app.providers
  const d = t.app.dashboard

  const saveImage = async (field, url) => {
    onError(null)
    try {
      await providerApi.update(profile.id, { [field]: url })
      reload()
    } catch (err) {
      onError(err.message)
    }
  }

  const stats = [
    profile.completedJobs > 0 && ['check', profile.completedJobs, p.stats.jobs],
    profile.yearsExperience > 0 && ['shield', profile.yearsExperience, p.stats.years],
    ['wrench', profile.services?.length ?? 0, p.stats.services],
    profile.responseTimeHours != null && ['clock', p.responseValue(profile.responseTimeHours), p.stats.response],
    profile.hourlyRate != null && ['card', formatPrice(profile.hourlyRate, lang), p.stats.rate],
  ].filter(Boolean)

  return (
    <section className="panel glass">
      <div className="panel-head">
        <h2 className="panel-sub">{p.branding}</h2>
        <Link to={`/app/providers/${profile.id}`} className="btn btn-ghost btn-sm">
          <Icon name="eye" /> {d.viewPublicProfile}
        </Link>
      </div>
      <p className="profile-meta" style={{ marginBottom: 16 }}>{p.brandingHint}</p>

      <div className="pp" style={{ '--vh': hueOf(profile.id) }}>
        <div className="pp-cover">
          {profile.coverImageUrl ? <img src={profile.coverImageUrl} alt="" /> : null}
        </div>
        <div className="pp-head">
          <div className="pp-avatar">
            {profile.logoImageUrl ? <img src={profile.logoImageUrl} alt="" /> : <Icon name="wrench" />}
          </div>
          <div className="pp-head-actions">
            <UploadButton
              label={profile.coverImageUrl ? p.changeCover : p.uploadCover}
              relatedEntityType="ProviderCover"
              relatedEntityId={profile.id}
              onUploaded={(asset) => saveImage('coverImageUrl', asset.url)}
              onError={onError}
              className="btn btn-ghost btn-sm"
            />
            <UploadButton
              label={profile.logoImageUrl ? p.changeLogo : p.uploadLogo}
              relatedEntityType="ProviderLogo"
              relatedEntityId={profile.id}
              onUploaded={(asset) => saveImage('logoImageUrl', asset.url)}
              onError={onError}
              className="btn btn-ghost btn-sm"
            />
          </div>
        </div>
      </div>

      {stats.length > 0 ? (
        <div className="pp-stats" style={{ margin: '22px 0 0' }}>
          {stats.map(([icon, value, label]) => (
            <div key={label} className="mas-stat">
              <div className="mas-stat-ico">
                <Icon name={icon} />
              </div>
              <b>{value}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ProfileEditForm({ profile, onCancel, onSaved, onError }) {
  const { t } = useUI()
  const p = t.app.providers
  const c = t.app.common
  const [form, setForm] = useState({
    businessName: profile.businessName ?? '',
    description: profile.description ?? '',
    phoneNumber: profile.phoneNumber ?? '',
    address: profile.address ?? '',
    city: profile.city ?? '',
    country: profile.country ?? '',
    tagline: profile.tagline ?? '',
    completedJobs: profile.completedJobs != null ? String(profile.completedJobs) : '',
    yearsExperience: profile.yearsExperience != null ? String(profile.yearsExperience) : '',
    responseTimeHours: profile.responseTimeHours != null ? String(profile.responseTimeHours) : '',
    hourlyRate: profile.hourlyRate != null ? String(profile.hourlyRate) : '',
  })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const numOrNull = (v) => (v === '' ? null : Number(v))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      await providerApi.update(profile.id, {
        businessName: form.businessName.trim(),
        description: form.description.trim() || null,
        phoneNumber: form.phoneNumber.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim(),
        country: form.country.trim(),
        tagline: form.tagline.trim() || null,
        completedJobs: numOrNull(form.completedJobs),
        yearsExperience: numOrNull(form.yearsExperience),
        responseTimeHours: numOrNull(form.responseTimeHours),
        hourlyRate: numOrNull(form.hourlyRate),
      })
      onSaved()
    } catch (err) {
      onError(err.message)
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <Field label={p.businessName}>
        <input className="input" required value={form.businessName} onChange={set('businessName')} />
      </Field>
      <Field label={p.description} hint={c.optional}>
        <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
      </Field>
      <div className="field-row">
        <Field label={p.phone} hint={c.optional}>
          <input className="input" value={form.phoneNumber} onChange={set('phoneNumber')} />
        </Field>
        <Field label={p.address} hint={c.optional}>
          <input className="input" value={form.address} onChange={set('address')} />
        </Field>
      </div>
      <div className="field-row">
        <Field label={p.city}>
          <input className="input" required value={form.city} onChange={set('city')} />
        </Field>
        <Field label={p.country}>
          <input className="input" required value={form.country} onChange={set('country')} />
        </Field>
      </div>

      <div className="form-section">{p.branding}</div>
      <Field label={p.tagline} hint={c.optional}>
        <input className="input" maxLength={160} value={form.tagline} onChange={set('tagline')} placeholder={p.taglinePlaceholder} />
      </Field>
      <div className="field-row">
        <Field label={p.completedJobs}>
          <input className="input" type="number" min="0" value={form.completedJobs} onChange={set('completedJobs')} />
        </Field>
        <Field label={p.yearsExperience}>
          <input className="input" type="number" min="0" value={form.yearsExperience} onChange={set('yearsExperience')} />
        </Field>
      </div>
      <div className="field-row">
        <Field label={p.responseTimeHours} hint={c.optional}>
          <input className="input" type="number" min="0" value={form.responseTimeHours} onChange={set('responseTimeHours')} />
        </Field>
        <Field label={p.hourlyRate} hint={c.optional}>
          <input className="input" type="number" min="0" step="0.01" value={form.hourlyRate} onChange={set('hourlyRate')} />
        </Field>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          {c.cancel}
        </button>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? p.saving : p.saveProfile}
        </button>
      </div>
    </form>
  )
}

function ServicesSection({ profile, reload, onError }) {
  const { t, lang } = useUI()
  const p = t.app.providers
  const c = t.app.common
  const a = t.app
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const blank = { name: '', description: '', price: '', durationMinutes: '60', category: 'Maintenance' }
  const [form, setForm] = useState(blank)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addService = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      await providerApi.addService(profile.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
        category: form.category,
      })
      setForm(blank)
      setAdding(false)
      reload()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const removeService = async (serviceId) => {
    if (!window.confirm(p.deleteConfirm)) return
    setBusy(true)
    onError(null)
    try {
      await providerApi.deleteService(profile.id, serviceId)
      reload()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel glass">
      <div className="panel-head">
        <h2 className="panel-sub">{p.servicesSection}</h2>
        {!adding ? (
          <button className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>
            <Icon name="plus" /> {p.addService}
          </button>
        ) : null}
      </div>

      {profile.services && profile.services.length > 0 ? (
        <ul className="service-list">
          {profile.services.map((s) => (
            <li key={s.id} className="service-row">
              <div>
                <b>{s.name}</b>
                <span className="service-cat">{a.enums.serviceCategory[s.category] ?? s.category}</span>
                {s.description ? <p className="profile-meta">{s.description}</p> : null}
              </div>
              <div className="service-price">
                <b>{formatPrice(s.price, lang)}</b>
                <span className="profile-meta">{s.durationMinutes} min</span>
              </div>
              <button className="icon-btn" aria-label={c.delete} onClick={() => removeService(s.id)} disabled={busy}>
                <Icon name="trash" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="profile-meta">{p.noServices}</p>
      )}

      {adding ? (
        <form className="member-add" onSubmit={addService}>
          <Field label={p.serviceName}>
            <input className="input" required value={form.name} onChange={set('name')} />
          </Field>
          <Field label={p.description} hint={c.optional}>
            <input className="input" value={form.description} onChange={set('description')} />
          </Field>
          <div className="field-row">
            <Field label={p.price}>
              <input className="input" type="number" min="0.01" step="0.01" required value={form.price} onChange={set('price')} />
            </Field>
            <Field label={p.durationMin}>
              <input className="input" type="number" min="1" max="1440" required value={form.durationMinutes} onChange={set('durationMinutes')} />
            </Field>
            <Field label={p.category}>
              <Select
                value={form.category}
                onChange={set('category')}
                options={CATEGORIES.map((cat) => [cat, a.enums.serviceCategory[cat]])}
              />
            </Field>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAdding(false)} disabled={busy}>
              {c.cancel}
            </button>
            <button className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? p.saving : p.addService}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}

function AvailabilitySection({ profile, reload, onError }) {
  const { t } = useUI()
  const p = t.app.providers
  const c = t.app.common
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ dayOfWeek: '1', startTime: '09:00', endTime: '17:00' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const slots = [...(profile.availabilities ?? [])].sort((x, y) => x.dayOfWeek - y.dayOfWeek)

  const setSlot = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      await providerApi.setAvailability(profile.id, {
        dayOfWeek: Number(form.dayOfWeek),
        startTime: `${form.startTime}:00`,
        endTime: `${form.endTime}:00`,
        isAvailable: true,
      })
      reload()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const removeSlot = async (availabilityId) => {
    if (!window.confirm(p.deleteConfirm)) return
    setBusy(true)
    onError(null)
    try {
      await providerApi.deleteAvailability(profile.id, availabilityId)
      reload()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel glass">
      <h2 className="panel-sub">{p.availabilitySection}</h2>
      {slots.length > 0 ? (
        <ul className="avail-list">
          {slots.map((slot) => (
            <li key={slot.id}>
              <span>{p.days[slot.dayOfWeek]}</span>
              <span className="profile-meta">
                {trimSeconds(slot.startTime)} – {trimSeconds(slot.endTime)}
              </span>
              <button className="icon-btn" aria-label={c.delete} onClick={() => removeSlot(slot.id)} disabled={busy}>
                <Icon name="trash" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="profile-meta">{p.noAvailability}</p>
      )}

      <form className="member-add avail-form" onSubmit={setSlot}>
        <Field label={p.day}>
          <Select value={form.dayOfWeek} onChange={set('dayOfWeek')} options={p.days.map((d, i) => [String(i), d])} />
        </Field>
        <Field label={p.startTime}>
          <input className="input" type="time" required value={form.startTime} onChange={set('startTime')} />
        </Field>
        <Field label={p.endTime}>
          <input className="input" type="time" required value={form.endTime} onChange={set('endTime')} />
        </Field>
        <button className="btn btn-primary btn-sm" disabled={busy}>
          <Icon name="plus" /> {p.addAvailability}
        </button>
      </form>
    </section>
  )
}

function GallerySection({ profile, reload, onError }) {
  const { t } = useUI()
  const p = t.app.providers
  const c = t.app.common
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ imageUrl: '', caption: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const addImage = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      await providerApi.addGalleryImage(profile.id, {
        imageUrl: form.imageUrl.trim(),
        caption: form.caption.trim() || null,
        displayOrder: profile.galleryImages?.length ?? 0,
      })
      setForm({ imageUrl: '', caption: '' })
      reload()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const removeImage = async (imageId) => {
    if (!window.confirm(p.deleteConfirm)) return
    setBusy(true)
    onError(null)
    try {
      await providerApi.deleteGalleryImage(profile.id, imageId)
      reload()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel glass">
      <h2 className="panel-sub">{p.gallerySection}</h2>
      {profile.galleryImages && profile.galleryImages.length > 0 ? (
        <div className="gallery-grid">
          {profile.galleryImages.map((g) => (
            <figure key={g.id} className="gallery-item">
              <img src={g.imageUrl} alt={g.caption ?? ''} loading="lazy" />
              <button className="icon-btn gallery-del" aria-label={c.delete} onClick={() => removeImage(g.id)} disabled={busy}>
                <Icon name="x" />
              </button>
            </figure>
          ))}
        </div>
      ) : (
        <p className="profile-meta">{p.noGallery}</p>
      )}

      <form className="member-add avail-form" onSubmit={addImage}>
        <Field label={p.imageUrl}>
          <input className="input" required value={form.imageUrl} onChange={set('imageUrl')} />
        </Field>
        <Field label={p.caption} hint={c.optional}>
          <input className="input" value={form.caption} onChange={set('caption')} />
        </Field>
        <button className="btn btn-primary btn-sm" disabled={busy}>
          <Icon name="plus" /> {p.addPhoto}
        </button>
      </form>
    </section>
  )
}
