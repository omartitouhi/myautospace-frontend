import { useEffect, useState } from 'react'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { userApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatDate } from '../../lib/format'
import { Alert, EmptyState, Field, PageHead, Spinner } from '../../components/app/ui'

export function Company() {
  const { t } = useUI()
  const { session } = useAuth()
  const co = t.app.company
  const c = t.app.common
  const [companies, setCompanies] = useState(null)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let cancelled = false
    userApi
      .listCompanies()
      .then((data) => {
        if (!cancelled) setCompanies(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const reload = async () => {
    try {
      setCompanies(await userApi.listCompanies())
    } catch (err) {
      setError(err.message)
    }
  }

  if (creating) {
    return (
      <CreateCompanyForm
        onCancel={() => setCreating(false)}
        onCreated={async () => {
          setCreating(false)
          await reload()
        }}
        onError={setError}
        error={error}
      />
    )
  }

  return (
    <>
      <PageHead title={co.title} sub={co.sub}>
        {companies && companies.length > 0 ? (
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            <Icon name="plus" /> {co.create}
          </button>
        ) : null}
      </PageHead>

      {error ? <Alert>{error}</Alert> : null}

      {!companies && !error ? (
        <Spinner label={c.loading} />
      ) : companies && companies.length === 0 ? (
        <EmptyState icon="user" title={co.none} hint={co.noneHint}>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            <Icon name="plus" /> {co.create}
          </button>
        </EmptyState>
      ) : companies ? (
        <div className="company-list">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              currentUserId={session?.userId}
              onChanged={reload}
              onError={setError}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}

function CompanyCard({ company, currentUserId, onChanged, onError }) {
  const { t, lang } = useUI()
  const co = t.app.company
  const c = t.app.common
  const isOwner = company.ownerUserId === currentUserId
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ userId: '', role: '' })
  const [busy, setBusy] = useState(false)

  const members = [...(company.members ?? [])].sort((a, b) =>
    a.role === 'Owner' ? -1 : b.role === 'Owner' ? 1 : 0,
  )

  const addMember = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      await userApi.addCompanyMember({
        companyAccountId: company.id,
        userId: form.userId.trim(),
        role: form.role.trim(),
      })
      setForm({ userId: '', role: '' })
      setAdding(false)
      await onChanged()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const removeMember = async (memberId) => {
    if (!window.confirm(co.removeMemberConfirm)) return
    setBusy(true)
    onError(null)
    try {
      await userApi.removeCompanyMember(memberId)
      await onChanged()
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel glass company-card">
      <div className="company-head">
        <span className="company-logo">
          <Icon name="shield" />
        </span>
        <div>
          <h2>{company.companyName}</h2>
          <p className="profile-meta">
            {co.createdOn} {formatDate(company.createdAt, lang)}
          </p>
        </div>
      </div>

      <dl className="spec-grid">
        <div className="spec">
          <dt>{co.registration}</dt>
          <dd>{company.registrationNumber || c.notProvided}</dd>
        </div>
        <div className="spec">
          <dt>{co.tax}</dt>
          <dd>{company.taxNumber || c.notProvided}</dd>
        </div>
      </dl>

      <h3 className="panel-sub">{co.members}</h3>
      <ul className="member-list">
        {members.map((m) => {
          const isOwnerMember = m.role === 'Owner' || m.userId === company.ownerUserId
          return (
            <li key={m.id}>
              <span className="member-ava">{(m.role?.[0] ?? '?').toUpperCase()}</span>
              <div className="member-main">
                <b>
                  {isOwnerMember ? co.owner : m.role}
                  {m.userId === currentUserId ? <span className="member-you"> · {co.you}</span> : null}
                </b>
                <code className="member-id">{m.userId}</code>
              </div>
              {isOwner && !isOwnerMember ? (
                <button className="icon-btn" aria-label={c.delete} onClick={() => removeMember(m.id)} disabled={busy}>
                  <Icon name="trash" />
                </button>
              ) : null}
            </li>
          )
        })}
      </ul>

      {!isOwner ? (
        <p className="profile-meta">{co.ownerOnly}</p>
      ) : adding ? (
        <form className="member-add" onSubmit={addMember}>
          <div className="field-row">
            <Field label={co.memberUserId} hint={co.memberUserIdHint}>
              <input
                className="input"
                required
                placeholder="00000000-0000-0000-0000-000000000000"
                value={form.userId}
                onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))}
              />
            </Field>
            <Field label={co.role}>
              <input
                className="input"
                required
                placeholder={co.rolePlaceholder}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              />
            </Field>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAdding(false)} disabled={busy}>
              {c.cancel}
            </button>
            <button className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? co.adding : co.add}
            </button>
          </div>
        </form>
      ) : (
        <button className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>
          <Icon name="plus" /> {co.addMember}
        </button>
      )}
    </section>
  )
}

function CreateCompanyForm({ onCancel, onCreated, onError, error }) {
  const { t } = useUI()
  const co = t.app.company
  const c = t.app.common
  const [form, setForm] = useState({ companyName: '', registrationNumber: '', taxNumber: '' })
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      await userApi.createCompany({
        companyName: form.companyName.trim(),
        registrationNumber: form.registrationNumber.trim(),
        taxNumber: form.taxNumber.trim(),
      })
      await onCreated()
    } catch (err) {
      onError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="page-narrow">
      <PageHead title={co.createTitle} sub={co.sub} />
      {error ? <Alert>{error}</Alert> : null}
      <form className="panel glass" onSubmit={submit}>
        <Field label={co.companyName}>
          <input className="input" required maxLength={150} value={form.companyName} onChange={set('companyName')} />
        </Field>
        <div className="field-row">
          <Field label={co.registrationNumber}>
            <input className="input" value={form.registrationNumber} onChange={set('registrationNumber')} />
          </Field>
          <Field label={co.taxNumber}>
            <input className="input" value={form.taxNumber} onChange={set('taxNumber')} />
          </Field>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            {c.cancel}
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? co.submitting : co.submit}
          </button>
        </div>
      </form>
    </div>
  )
}
