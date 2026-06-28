import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { userApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatDate, timeAgo } from '../../lib/format'
import { Alert, Field, PageHead, Select, Spinner, StatusChip, Toggle } from '../../components/app/ui'
import { UploadButton } from '../../components/app/MediaUpload'

const DOC_TYPES = ['CIN', 'Passport', 'CompanyRegistration', 'TaxDocument']
const PACKS = ['Free', 'Premium', 'Pro']

export function Profile() {
  const { t, lang } = useUI()
  const { profile, session, setProfile, refreshProfile } = useAuth()
  const a = t.app.profile
  const c = t.app.common
  const [error, setError] = useState(null)

  if (!profile) {
    return <Spinner label={c.loading} />
  }

  return (
    <>
      <PageHead title={a.title} />
      {error ? <Alert>{error}</Alert> : null}
      <div className="profile-grid">
        <div className="profile-main">
          <IdentityPanel profile={profile} session={session} setProfile={setProfile} onError={setError} />
          <VerificationPanel profile={profile} refreshProfile={refreshProfile} onError={setError} />
        </div>
        <div className="profile-side">
          <TrustPanel profile={profile} refreshProfile={refreshProfile} onError={setError} />
          <PlanPanel profile={profile} refreshProfile={refreshProfile} onError={setError} />
          <PreferencesPanel profile={profile} refreshProfile={refreshProfile} onError={setError} />
          <ActivityPanel activities={profile.userActivities ?? []} lang={lang} />
          <PrivacyPanel onError={setError} />
        </div>
      </div>
    </>
  )
}

function VerificationPanel({ profile, refreshProfile, onError }) {
  const { t, lang } = useUI()
  const a = t.app.profile
  const c = t.app.common
  const verification = (profile.identityVerifications ?? [])[0]
  const documents = profile.userDocuments ?? []
  const [busy, setBusy] = useState(false)
  const [adding, setAdding] = useState(false)
  const [docForm, setDocForm] = useState({ documentType: 'CIN', fileUrl: '' })

  const canRequest = !verification || verification.verificationStatus === 'Rejected'

  const request = async () => {
    setBusy(true)
    onError(null)
    try {
      await userApi.requestVerification()
      await refreshProfile()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const addDoc = async (e) => {
    e.preventDefault()
    if (!docForm.fileUrl.trim()) return
    setBusy(true)
    onError(null)
    try {
      await userApi.addDocument({ documentType: docForm.documentType, fileUrl: docForm.fileUrl.trim() })
      setDocForm({ documentType: 'CIN', fileUrl: '' })
      setAdding(false)
      await refreshProfile()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const removeDoc = async (id) => {
    setBusy(true)
    onError(null)
    try {
      await userApi.deleteDocument(id)
      await refreshProfile()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel glass">
      <div className="trust-head">
        <h2>{a.verification}</h2>
        {verification ? (
          <StatusChip
            status={verification.verificationStatus}
            label={a.verificationStatuses[verification.verificationStatus]}
          />
        ) : (
          <span className="chip" data-tone="neutral">
            {a.notVerified}
          </span>
        )}
      </div>
      <p className="trust-hint">{a.verifyHint}</p>
      {verification?.verificationStatus === 'Rejected' && verification.rejectionReason ? (
        <p className="profile-meta">
          <b>{a.rejectedReason}:</b> {verification.rejectionReason}
        </p>
      ) : null}
      {canRequest ? (
        <button className="btn btn-ghost btn-sm verify-btn" onClick={request} disabled={busy}>
          <Icon name="shieldCheck" /> {busy ? a.requesting : a.requestVerification}
        </button>
      ) : null}

      <h3 className="panel-sub">{a.documents}</h3>
      {documents.length === 0 ? (
        <p className="profile-meta">{a.noDocuments}</p>
      ) : (
        <ul className="doc-list">
          {documents.map((d) => (
            <li key={d.id}>
              <Icon name="doc" />
              <div className="doc-main">
                <a href={d.fileUrl} target="_blank" rel="noreferrer">
                  {a.docTypes[d.documentType] ?? d.documentType}
                </a>
                <span>
                  {a.uploadedOn} {formatDate(d.uploadedAt, lang)}
                </span>
              </div>
              <StatusChip status={d.status} label={a.verificationStatuses[d.status]} />
              <button className="icon-btn" aria-label={c.delete} onClick={() => removeDoc(d.id)} disabled={busy}>
                <Icon name="trash" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form className="doc-add" onSubmit={addDoc}>
          <Field label={a.documentType}>
            <Select
              value={docForm.documentType}
              onChange={(e) => setDocForm((f) => ({ ...f, documentType: e.target.value }))}
              options={DOC_TYPES.map((v) => [v, a.docTypes[v]])}
            />
          </Field>
          <Field label={a.fileUrl} hint={a.fileUrlHint}>
            <input
              className="input"
              type="url"
              required
              placeholder="https://…"
              value={docForm.fileUrl}
              onChange={(e) => setDocForm((f) => ({ ...f, fileUrl: e.target.value }))}
            />
            <div className="upload-row">
              <UploadButton
                accept="image/*,application/pdf"
                relatedEntityType="UserDocument"
                onUploaded={(asset) => setDocForm((f) => ({ ...f, fileUrl: asset.url }))}
                onError={onError}
              />
            </div>
          </Field>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAdding(false)} disabled={busy}>
              {c.cancel}
            </button>
            <button className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? c.saving : c.save}
            </button>
          </div>
        </form>
      ) : (
        <button className="btn btn-ghost btn-sm doc-add-btn" onClick={() => setAdding(true)}>
          <Icon name="plus" /> {a.addDocument}
        </button>
      )}
    </div>
  )
}

function PlanPanel({ profile, refreshProfile, onError }) {
  const { t, lang } = useUI()
  const a = t.app.profile
  const current = profile.userPack
  const currentType = current?.isActive ? current.packType : 'Free'
  const [busy, setBusy] = useState(null)

  const subscribe = async (packType) => {
    setBusy(packType)
    onError(null)
    try {
      await userApi.subscribePack({ packType, startDate: null, endDate: null })
      await refreshProfile()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(null)
    }
  }

  const cancel = async () => {
    setBusy('cancel')
    onError(null)
    try {
      await userApi.cancelPack()
      await refreshProfile()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="panel glass">
      <h2>{a.plan}</h2>
      <p className="trust-hint">{a.planHint}</p>
      <ul className="plan-list">
        {PACKS.map((p) => {
          const isCurrent = p === currentType
          return (
            <li key={p} className="plan-opt" data-on={isCurrent ? '1' : '0'}>
              <div className="plan-opt-top">
                <b>{a.packs[p]}</b>
                {isCurrent ? (
                  <span className="chip" data-tone="accent">
                    {a.current}
                  </span>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => subscribe(p)} disabled={!!busy}>
                    {busy === p ? a.subscribing : a.subscribe}
                  </button>
                )}
              </div>
              <span className="plan-perk">{a.packPerks[p]}</span>
            </li>
          )
        })}
      </ul>
      {current?.isActive && current.packType !== 'Free' ? (
        <div className="plan-foot">
          {current.endDate ? (
            <span className="profile-meta">
              {a.renews} {formatDate(current.endDate, lang)}
            </span>
          ) : (
            <span />
          )}
          <button className="btn btn-danger btn-sm" onClick={cancel} disabled={!!busy}>
            {busy === 'cancel' ? a.subscribing : a.cancelPlan}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function PrivacyPanel({ onError }) {
  const { t } = useUI()
  const a = t.app.profile
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(null)
  const [note, setNote] = useState(null)

  const exportData = async () => {
    setBusy('export')
    onError(null)
    setNote(null)
    try {
      const data = await userApi.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `myautospace-data-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(url)
      setNote(a.exported)
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(null)
    }
  }

  const removeAccount = async () => {
    if (!window.confirm(a.deleteConfirm)) return
    setBusy('delete')
    onError(null)
    try {
      await userApi.deleteAccount()
      await logout()
      navigate('/', { replace: true })
    } catch (err) {
      onError(err.message)
      setBusy(null)
    }
  }

  return (
    <div className="panel glass">
      <h2>{a.privacy}</h2>
      <p className="trust-hint">{a.privacyHint}</p>
      <div className="privacy-actions">
        <button className="btn btn-ghost btn-sm" onClick={exportData} disabled={!!busy}>
          <Icon name="doc" /> {busy === 'export' ? a.exporting : a.exportData}
        </button>
        <button className="btn btn-danger btn-sm" onClick={removeAccount} disabled={!!busy}>
          <Icon name="trash" /> {busy === 'delete' ? a.deleting : a.deleteAccount}
        </button>
      </div>
      {note ? <p className="saved-note">{note}</p> : null}
    </div>
  )
}

function IdentityPanel({ profile, session, setProfile, onError }) {
  const { t, lang } = useUI()
  const a = t.app.profile
  const w = t.app.welcome
  const c = t.app.common
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState(null)

  const verification = (profile.identityVerifications ?? [])[0]
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const startEdit = () => {
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber ?? '',
      address: profile.address ?? '',
      country: profile.country ?? '',
      city: profile.city ?? '',
      profilePictureUrl: profile.profilePictureUrl ?? '',
      bio: profile.bio ?? '',
    })
    setEditing(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      const updated = await userApi.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber || null,
        address: form.address || null,
        country: form.country || null,
        city: form.city || null,
        profilePictureUrl: form.profilePictureUrl || null,
        bio: form.bio || null,
      })
      setProfile(updated)
      setEditing(false)
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (editing) {
    return (
      <form className="panel glass" onSubmit={save}>
        <h2>{a.editTitle}</h2>
        <div className="field-row">
          <Field label={t.app.auth.firstName}>
            <input className="input" required value={form.firstName} onChange={set('firstName')} />
          </Field>
          <Field label={t.app.auth.lastName}>
            <input className="input" required value={form.lastName} onChange={set('lastName')} />
          </Field>
        </div>
        <div className="field-row">
          <Field label={w.phone} hint={c.optional}>
            <input className="input" type="tel" value={form.phoneNumber} onChange={set('phoneNumber')} />
          </Field>
          <Field label={w.city} hint={c.optional}>
            <input className="input" value={form.city} onChange={set('city')} />
          </Field>
        </div>
        <div className="field-row">
          <Field label={w.address} hint={c.optional}>
            <input className="input" value={form.address} onChange={set('address')} />
          </Field>
          <Field label={w.country} hint={c.optional}>
            <input className="input" value={form.country} onChange={set('country')} />
          </Field>
        </div>
        <Field label={w.avatarUrl} hint={c.optional}>
          <input className="input" type="url" value={form.profilePictureUrl} onChange={set('profilePictureUrl')} />
          <div className="upload-row">
            <UploadButton
              accept="image/*"
              relatedEntityType="Avatar"
              onUploaded={(asset) => setForm((f) => ({ ...f, profilePictureUrl: asset.url }))}
              onError={onError}
            />
          </div>
        </Field>
        <Field label={w.bio} hint={c.optional}>
          <textarea className="input" rows={3} value={form.bio} onChange={set('bio')} />
        </Field>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)} disabled={busy}>
            {c.cancel}
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? c.saving : c.save}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="panel glass profile-card">
      <div className="profile-id">
        <span className="profile-ava">
          {profile.profilePictureUrl ? (
            <img src={profile.profilePictureUrl} alt="" />
          ) : (
            `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
          )}
        </span>
        <div>
          <h2>
            {profile.firstName} {profile.lastName}
          </h2>
          <p className="profile-meta">
            {a.memberSince} {formatDate(profile.createdAt, lang)}
          </p>
          <div className="profile-chips">
            {verification ? (
              <StatusChip
                status={verification.verificationStatus}
                label={a.verificationStatuses[verification.verificationStatus]}
              />
            ) : (
              <span className="chip" data-tone="neutral">
                {a.notVerified}
              </span>
            )}
            {profile.userPack ? (
              <span className="chip" data-tone="accent">
                {a.pack}: {a.packs[profile.userPack.packType] ?? profile.userPack.packType}
              </span>
            ) : null}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm profile-edit" onClick={startEdit}>
          <Icon name="pen" /> {c.edit}
        </button>
      </div>

      <h3 className="panel-sub">{a.contact}</h3>
      <dl className="spec-grid">
        <div className="spec">
          <dt>{t.app.auth.email}</dt>
          <dd>{session?.email}</dd>
        </div>
        <div className="spec">
          <dt>{w.phone}</dt>
          <dd>{profile.phoneNumber || c.notProvided}</dd>
        </div>
        <div className="spec">
          <dt>{w.city}</dt>
          <dd>{[profile.city, profile.country].filter(Boolean).join(', ') || c.notProvided}</dd>
        </div>
        <div className="spec">
          <dt>{w.address}</dt>
          <dd>{profile.address || c.notProvided}</dd>
        </div>
      </dl>

      {profile.bio ? (
        <>
          <h3 className="panel-sub">{a.about}</h3>
          <p className="profile-bio">{profile.bio}</p>
        </>
      ) : null}
    </div>
  )
}

function TrustPanel({ profile, refreshProfile, onError }) {
  const { t, lang } = useUI()
  const a = t.app.profile
  const [busy, setBusy] = useState(false)
  const score = profile.trustScore

  const recalc = async () => {
    setBusy(true)
    onError(null)
    try {
      await userApi.recalculateTrustScore()
      await refreshProfile()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel glass trust-panel">
      <div className="trust-head">
        <h2>{a.trustScore}</h2>
        <button className="btn btn-ghost btn-sm" onClick={recalc} disabled={busy}>
          <Icon name="refresh" /> {busy ? a.recalculating : a.recalculate}
        </button>
      </div>
      <div className="trust-score">
        <b>{score ? score.score : '—'}</b>
        <span>/100</span>
      </div>
      <div className="trust-bar">
        <i style={{ width: `${Math.min(100, Math.max(0, score?.score ?? 0))}%` }} />
      </div>
      <p className="trust-hint">
        {a.trustHint}
        {score ? ` · ${timeAgo(score.lastCalculatedAt, lang)}` : ''}
      </p>
    </div>
  )
}

function PreferencesPanel({ profile, refreshProfile, onError }) {
  const { t } = useUI()
  const a = t.app.profile
  const c = t.app.common
  const pref = profile.userPreference
  const [form, setForm] = useState(() => ({
    language: pref?.language ?? 'fr',
    currency: pref?.currency ?? 'TND',
    notificationEmail: pref?.notificationEmail ?? true,
    notificationSms: pref?.notificationSms ?? false,
    notificationPush: pref?.notificationPush ?? true,
  }))
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setSaved(false)
    onError(null)
    try {
      await userApi.updatePreferences(form)
      await refreshProfile()
      setSaved(true)
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="panel glass" onSubmit={save}>
      <h2>{a.preferences}</h2>
      <div className="field-row">
        <Field label={a.language}>
          <Select
            value={form.language}
            onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
            options={[
              ['fr', 'Français'],
              ['en', 'English'],
            ]}
          />
        </Field>
        <Field label={a.currency}>
          <Select
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            options={[
              ['TND', 'TND (DT)'],
              ['EUR', 'EUR (€)'],
              ['USD', 'USD ($)'],
            ]}
          />
        </Field>
      </div>
      <Toggle
        label={a.notifEmail}
        checked={form.notificationEmail}
        onChange={(v) => setForm((f) => ({ ...f, notificationEmail: v }))}
      />
      <Toggle
        label={a.notifSms}
        checked={form.notificationSms}
        onChange={(v) => setForm((f) => ({ ...f, notificationSms: v }))}
      />
      <Toggle
        label={a.notifPush}
        checked={form.notificationPush}
        onChange={(v) => setForm((f) => ({ ...f, notificationPush: v }))}
      />
      <div className="form-actions">
        {saved ? <span className="saved-note">{a.prefsSaved}</span> : null}
        <button className="btn btn-primary btn-sm" disabled={busy}>
          {busy ? c.saving : c.save}
        </button>
      </div>
    </form>
  )
}

function ActivityPanel({ activities, lang }) {
  const { t } = useUI()
  const a = t.app.profile
  const recent = [...activities]
    .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt))
    .slice(0, 8)

  return (
    <div className="panel glass">
      <h2>{a.activity}</h2>
      {recent.length === 0 ? (
        <p className="profile-meta">{a.noActivity}</p>
      ) : (
        <ul className="activity-list">
          {recent.map((act) => (
            <li key={act.id}>
              <span className="activity-dot" />
              <div>
                <p>{act.description || act.action}</p>
                <time>{timeAgo(act.createdAt, lang)}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
