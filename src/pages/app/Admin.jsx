import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { adminApi, ApiError } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatDateTime, formatPrice } from '../../lib/format'
import { Alert, EmptyState, Field, PageHead, Select, Spinner, StatusChip } from '../../components/app/ui'

const TABS = ['users', 'moderation', 'payments', 'audit', 'config', 'reports']
const REPORT_TYPES = ['UserActivity', 'Sales', 'Moderation', 'Fraud', 'Custom']

export function Admin() {
  const { t } = useUI()
  const { isAdmin } = useAuth()
  const ad = t.app.admin
  const [tab, setTab] = useState('moderation')

  if (!isAdmin) return <Navigate to="/app" replace />

  return (
    <>
      <PageHead title={ad.title} sub={ad.sub} />
      <AdminKpis />
      <nav className="admin-tabs" role="tablist">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            data-on={tab === key ? '1' : '0'}
            onClick={() => setTab(key)}
          >
            {ad.tabs[key]}
          </button>
        ))}
      </nav>

      <div className="admin-panel">
        {tab === 'users' ? <UsersTab /> : null}
        {tab === 'moderation' ? <ModerationTab /> : null}
        {tab === 'payments' ? <PaymentsTab /> : null}
        {tab === 'audit' ? <AuditTab /> : null}
        {tab === 'config' ? <ConfigTab /> : null}
        {tab === 'reports' ? <ReportsTab /> : null}
      </div>
    </>
  )
}

/* Platform KPI cards above the tabs — best-effort, hidden until loaded. */
function AdminKpis() {
  const { t, lang } = useUI()
  const d = t.app.dashboard
  const [data, setData] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([adminApi.payments.stats(), adminApi.users.list(), adminApi.moderation.list()]).then(
      ([st, us, mo]) => {
        if (cancelled) return
        setData({
          stats: st.status === 'fulfilled' ? st.value : null,
          users: us.status === 'fulfilled' ? us.value : [],
          cases: mo.status === 'fulfilled' ? mo.value : [],
        })
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  if (!data) return null
  const openCases = data.cases.filter(
    (c) => c.status !== 'Resolved' && c.status !== 'Rejected' && c.status !== 'Approved',
  ).length
  const cards = [
    ['user', data.users.length, d.totalUsers],
    ['shield', openCases, d.openCases],
    ...(data.stats
      ? [
          ['card', formatPrice(data.stats.totalAmount, lang), d.revenue],
          ['doc', data.stats.totalPayments, t.app.payments.title],
        ]
      : []),
  ]

  return (
    <div className="mas-kpi">
      {cards.map(([icon, value, label]) => (
        <div key={label} className="mas-stat">
          <div className="mas-stat-ico">
            <Icon name={icon} />
          </div>
          <b>{value}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

/* Shared loader hook keeps each tab terse. */
function useLoader(fn, deps = []) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const reload = () => {
    setData(null)
    setError(null)
    setPending(false)
    setReloadKey((k) => k + 1)
  }

  useEffect(() => {
    let cancelled = false
    fn()
      .then((d) => {
        if (!cancelled) setData(d)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && (err.status === 501 || err.status === 502)) setPending(true)
        else setError(err.message)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, ...deps])

  return { data, error, pending, reload, setError }
}

function TabState({ data, error, pending, emptyTitle, emptyHint, children }) {
  const { t } = useUI()
  const ad = t.app.admin
  if (pending) return <Alert tone="info">{ad.integrationPending}</Alert>
  if (error) return <Alert>{error}</Alert>
  if (!data) return <Spinner label={t.app.common.loading} />
  if (Array.isArray(data) && data.length === 0) return <EmptyState icon="shield" title={emptyTitle} hint={emptyHint} />
  return children
}

function UsersTab() {
  const { t } = useUI()
  const ad = t.app.admin
  const { data, error, pending, reload, setError } = useLoader(adminApi.users.list)
  const [busy, setBusy] = useState(false)

  const act = async (fn, id) => {
    setBusy(true)
    setError(null)
    try {
      await fn(id)
      reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <TabState data={data} error={error} pending={pending} emptyTitle={ad.usersEmpty}>
      <ul className="admin-list">
        {(data ?? []).map((u) => (
          <li key={u.id} className="admin-row">
            <div className="admin-row-main">
              <b>{u.email}</b>
              <code className="member-id">{u.id}</code>
              <span className="admin-roles">{(u.roles ?? []).join(', ')}</span>
            </div>
            <StatusChip status={u.status} />
            <div className="admin-row-actions">
              <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act(adminApi.users.activate, u.id)}>
                {ad.activate}
              </button>
              <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act(adminApi.users.suspend, u.id)}>
                {ad.suspend}
              </button>
              <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => act(adminApi.users.block, u.id)}>
                {ad.block}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </TabState>
  )
}

function ModerationTab() {
  const { t, lang } = useUI()
  const ad = t.app.admin
  const c = t.app.common
  const { data, error, pending, reload, setError } = useLoader(adminApi.moderation.list)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ reportedEntityType: 'Vehicle', reportedEntityId: '', reason: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const create = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await adminApi.moderation.create({
        reportedEntityType: form.reportedEntityType.trim(),
        reportedEntityId: form.reportedEntityId.trim(),
        reportedByUserId: null,
        reason: form.reason.trim(),
      })
      setForm({ reportedEntityType: 'Vehicle', reportedEntityId: '', reason: '' })
      setCreating(false)
      reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const decide = async (fn, id) => {
    const decision = window.prompt(ad.decisionPlaceholder) ?? ''
    setBusy(true)
    setError(null)
    try {
      await fn(id, { decision })
      reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="admin-actions-bar">
        <button className="btn btn-primary btn-sm" onClick={() => setCreating((v) => !v)}>
          <Icon name="plus" /> {ad.newCase}
        </button>
      </div>
      {creating ? (
        <form className="panel glass" onSubmit={create}>
          <div className="field-row">
            <Field label={ad.entityType}>
              <input className="input" required value={form.reportedEntityType} onChange={set('reportedEntityType')} />
            </Field>
            <Field label={ad.entityId}>
              <input className="input" required placeholder="00000000-0000-0000-0000-000000000000" value={form.reportedEntityId} onChange={set('reportedEntityId')} />
            </Field>
          </div>
          <Field label={ad.reason}>
            <input className="input" required value={form.reason} onChange={set('reason')} />
          </Field>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCreating(false)} disabled={busy}>
              {c.cancel}
            </button>
            <button className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? ad.creating : ad.createCase}
            </button>
          </div>
        </form>
      ) : null}

      <TabState data={data} error={error} pending={pending} emptyTitle={ad.casesEmpty}>
        <ul className="admin-list">
          {(data ?? []).map((m) => (
            <li key={m.id} className="admin-row admin-row-col">
              <div className="admin-row-top">
                <b>
                  {m.reportedEntityType} · <code className="member-id">{m.reportedEntityId}</code>
                </b>
                <StatusChip status={m.status} label={ad.modStatuses[m.status] ?? m.status} />
              </div>
              <p className="profile-meta">{m.reason}</p>
              {m.decision ? (
                <p className="profile-meta">
                  <b>{ad.decision}:</b> {m.decision}
                </p>
              ) : null}
              <span className="admin-ago">{formatDateTime(m.createdAt, lang)}</span>
              <div className="admin-row-actions">
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => decide(adminApi.moderation.approve, m.id)}>
                  {ad.approve}
                </button>
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => decide(adminApi.moderation.reject, m.id)}>
                  {ad.reject}
                </button>
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => decide(adminApi.moderation.resolve, m.id)}>
                  {ad.resolve}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </TabState>
    </>
  )
}

function PaymentsTab() {
  const { t, lang } = useUI()
  const ad = t.app.admin
  const { data, error, pending } = useLoader(adminApi.payments.list)

  return (
    <TabState data={data} error={error} pending={pending} emptyTitle={ad.paymentsEmpty}>
      <ul className="admin-list">
        {(data ?? []).map((pmt) => (
          <li key={pmt.id} className="admin-row">
            <div className="admin-row-main">
              <b>{formatPrice(pmt.amount, lang)} {pmt.currency}</b>
              <code className="member-id">{pmt.userId}</code>
            </div>
            <StatusChip status={pmt.status} />
            <span className="admin-ago">{formatDateTime(pmt.createdAt, lang)}</span>
          </li>
        ))}
      </ul>
    </TabState>
  )
}

function AuditTab() {
  const { t, lang } = useUI()
  const ad = t.app.admin
  const { data, error, pending } = useLoader(adminApi.audit.list)

  return (
    <TabState data={data} error={error} pending={pending} emptyTitle={ad.auditEmpty}>
      <ul className="admin-list">
        {(data ?? []).map((log) => (
          <li key={log.id} className="admin-row admin-row-col">
            <div className="admin-row-top">
              <b>{log.action}</b>
              <span className="chip" data-tone="neutral">{log.targetService}</span>
            </div>
            <p className="profile-meta">{log.description}</p>
            <span className="admin-ago">{formatDateTime(log.createdAt, lang)}</span>
          </li>
        ))}
      </ul>
    </TabState>
  )
}

function ConfigTab() {
  const { t } = useUI()
  const ad = t.app.admin
  const c = t.app.common
  const { data, error, pending, reload, setError } = useLoader(adminApi.config.list)
  const [form, setForm] = useState({ key: '', value: '', description: '', isSensitive: false })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await adminApi.config.upsert(form.key.trim(), {
        value: form.value,
        description: form.description.trim() || null,
        isSensitive: form.isSensitive,
      })
      setForm({ key: '', value: '', description: '', isSensitive: false })
      reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const remove = async (key) => {
    if (!window.confirm(ad.deleteConfirm)) return
    setBusy(true)
    setError(null)
    try {
      await adminApi.config.remove(key)
      reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <form className="panel glass" onSubmit={save}>
        <div className="field-row">
          <Field label={ad.key}>
            <input className="input" required value={form.key} onChange={set('key')} />
          </Field>
          <Field label={ad.value}>
            <input className="input" required value={form.value} onChange={set('value')} />
          </Field>
        </div>
        <Field label={ad.description} hint={c.optional}>
          <input className="input" value={form.description} onChange={set('description')} />
        </Field>
        <div className="form-actions">
          <button className="btn btn-primary btn-sm" disabled={busy}>
            {busy ? c.saving : ad.addConfig}
          </button>
        </div>
      </form>

      <TabState data={data} error={error} pending={pending} emptyTitle={ad.configEmpty}>
        <ul className="admin-list">
          {(data ?? []).map((cfg) => (
            <li key={cfg.id} className="admin-row">
              <div className="admin-row-main">
                <b>{cfg.key}</b>
                <span className="profile-meta">{cfg.isSensitive ? '••••••' : cfg.value}</span>
                {cfg.description ? <span className="profile-meta">{cfg.description}</span> : null}
              </div>
              <button className="icon-btn" aria-label={c.delete} disabled={busy} onClick={() => remove(cfg.key)}>
                <Icon name="trash" />
              </button>
            </li>
          ))}
        </ul>
      </TabState>
    </>
  )
}

function ReportsTab() {
  const { t, lang } = useUI()
  const ad = t.app.admin
  const c = t.app.common
  const { data, error, pending, reload, setError } = useLoader(adminApi.reports.list)
  const [form, setForm] = useState({ reportType: 'Sales', title: '', description: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const generate = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await adminApi.reports.generate({
        reportType: form.reportType,
        title: form.title.trim() || null,
        description: form.description.trim() || null,
      })
      setForm({ reportType: 'Sales', title: '', description: '' })
      reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <form className="panel glass" onSubmit={generate}>
        <div className="field-row">
          <Field label={ad.reportType}>
            <Select value={form.reportType} onChange={set('reportType')} options={REPORT_TYPES.map((r) => [r, r])} />
          </Field>
          <Field label={ad.reportTitle} hint={c.optional}>
            <input className="input" value={form.title} onChange={set('title')} />
          </Field>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary btn-sm" disabled={busy}>
            {busy ? ad.generating : ad.generate}
          </button>
        </div>
      </form>

      <TabState data={data} error={error} pending={pending} emptyTitle={ad.reportsEmpty}>
        <ul className="admin-list">
          {(data ?? []).map((r) => (
            <li key={r.id} className="admin-row admin-row-col">
              <div className="admin-row-top">
                <b>{r.title}</b>
                <span className="chip" data-tone="accent">{r.reportType}</span>
              </div>
              {r.description ? <p className="profile-meta">{r.description}</p> : null}
              <pre className="admin-json">{r.dataJson}</pre>
              <span className="admin-ago">{formatDateTime(r.generatedAt, lang)}</span>
            </li>
          ))}
        </ul>
      </TabState>
    </>
  )
}
