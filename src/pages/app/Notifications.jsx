import { useEffect, useState } from 'react'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { notificationApi, reminderApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatDateTime, timeAgo } from '../../lib/format'
import { Alert, EmptyState, Field, PageHead, Segmented, Select, Spinner, StatusChip, Toggle } from '../../components/app/ui'

const CHANNEL_ICONS = { Email: 'mail', Sms: 'phone', Push: 'bell' }
const STATUSES = ['Pending', 'Sent', 'Failed', 'Cancelled']
const CHANNELS = ['Email', 'Sms', 'Push']
const RECURRENCES = ['None', 'Daily', 'Weekly', 'Monthly']

export function Notifications() {
  const { t } = useUI()
  const a = t.app.notifications
  const [tab, setTab] = useState('inbox')

  return (
    <>
      <PageHead title={a.title} sub={tab === 'inbox' ? a.sub : t.app.reminders.sub} />
      <Segmented
        ariaLabel={a.title}
        value={tab}
        onChange={setTab}
        options={[
          ['inbox', a.tabInbox],
          ['reminders', a.tabReminders],
        ]}
      />
      {tab === 'inbox' ? <Inbox /> : <Reminders />}
    </>
  )
}

/* ---- Inbox (notification history) ---------------------------------- */
function Inbox() {
  const { t, lang } = useUI()
  const a = t.app.notifications
  const c = t.app.common
  const [filter, setFilter] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    let cancelled = false
    notificationApi
      .list(filter || undefined)
      .then((data) => {
        if (!cancelled) setResult({ filter, items: data })
      })
      .catch((err) => {
        if (!cancelled) setResult({ filter, error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [filter])

  const current = result && result.filter === filter ? result : null
  const items = current?.items ?? null
  const error = current?.error ?? null

  return (
    <>
      <Segmented
        ariaLabel={a.title}
        value={filter}
        onChange={setFilter}
        options={[['', a.all], ...STATUSES.map((s) => [s, a.statuses[s]])]}
      />
      {error ? <Alert>{error}</Alert> : null}
      {!items && !error ? (
        <Spinner label={c.loading} />
      ) : items && items.length === 0 ? (
        <EmptyState icon="bell" title={a.empty} hint={a.emptyHint} />
      ) : items ? (
        <ul className="notif-list">
          {items.map((n) => (
            <NotificationRow key={n.id} notification={n} t={t} lang={lang} />
          ))}
        </ul>
      ) : null}
    </>
  )
}

function NotificationRow({ notification: n, t, lang }) {
  const a = t.app.notifications
  const [open, setOpen] = useState(false)
  const [attempts, setAttempts] = useState(null)

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && attempts === null) {
      notificationApi
        .attempts(n.id)
        .then(setAttempts)
        .catch(() => setAttempts([]))
    }
  }

  return (
    <li className="notif glass-card" data-open={open ? '1' : '0'}>
      <button className="notif-row" onClick={toggle} aria-expanded={open}>
        <span className="notif-ico" data-status={n.status}>
          <Icon name={CHANNEL_ICONS[n.channel] ?? 'bell'} />
        </span>
        <span className="notif-main">
          <b>{n.subject || a.channels[n.channel] || n.channel}</b>
          <span className="notif-body">{n.body}</span>
        </span>
        <span className="notif-meta">
          <StatusChip status={n.status} label={a.statuses[n.status]} />
          <time>{timeAgo(n.createdAt, lang)}</time>
        </span>
        <Icon name="chevDown" className="notif-chev" />
      </button>
      {open ? (
        <div className="notif-detail">
          {n.scheduledAt ? (
            <p>
              <Icon name="clock" /> {a.scheduledFor} {formatDateTime(n.scheduledAt, lang)}
            </p>
          ) : null}
          {n.sentAt ? (
            <p>
              <Icon name="check" /> {a.sentAt} {formatDateTime(n.sentAt, lang)}
            </p>
          ) : null}
          {n.lastError ? (
            <p className="notif-error">
              <Icon name="alert" /> {n.lastError}
            </p>
          ) : null}
          <h4>{a.attempts}</h4>
          {attempts === null ? (
            <Spinner />
          ) : attempts.length === 0 ? (
            <p className="notif-none">—</p>
          ) : (
            <ul className="attempt-list">
              {attempts.map((at) => (
                <li key={at.id}>
                  <StatusChip status={at.status} />
                  <span>
                    {a.attempt(at.attemptNumber)} · {formatDateTime(at.attemptedAt, lang)}
                  </span>
                  {at.detail ? <em>{at.detail}</em> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </li>
  )
}

/* ---- Reminders (user-scheduled) ------------------------------------ */
const pad = (n) => String(n).padStart(2, '0')

// UTC ISO → local "YYYY-MM-DDTHH:mm" for a datetime-local input.
function toLocalInput(iso) {
  const d = iso ? new Date(iso) : new Date()
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function defaultRemindAt() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(9, 0, 0, 0)
  return toLocalInput(d.toISOString())
}

function Reminders() {
  const { t } = useUI()
  const { session } = useAuth()
  const r = t.app.reminders
  const c = t.app.common
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  // null = list view; 'new' or a reminder object = form view.
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    let cancelled = false
    reminderApi
      .list()
      .then((data) => {
        if (!cancelled) setItems(data)
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
      setItems(await reminderApi.list())
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleActive = async (reminder) => {
    setError(null)
    // Optimistic flip.
    setItems((list) => list.map((x) => (x.id === reminder.id ? { ...x, isActive: !x.isActive } : x)))
    try {
      await reminderApi.update(reminder.id, { isActive: !reminder.isActive })
    } catch (err) {
      setError(err.message)
      reload()
    }
  }

  const remove = async (reminder) => {
    if (!window.confirm(r.deleteConfirm)) return
    setError(null)
    try {
      await reminderApi.remove(reminder.id)
      setItems((list) => list.filter((x) => x.id !== reminder.id))
    } catch (err) {
      setError(err.message)
    }
  }

  if (editing) {
    return (
      <ReminderForm
        reminder={editing === 'new' ? null : editing}
        defaultRecipient={session?.email ?? ''}
        onCancel={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null)
          await reload()
        }}
        onError={setError}
        error={error}
      />
    )
  }

  return (
    <>
      {error ? <Alert>{error}</Alert> : null}
      <div className="reminders-head">
        <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
          <Icon name="plus" /> {r.add}
        </button>
      </div>
      {!items && !error ? (
        <Spinner label={c.loading} />
      ) : items && items.length === 0 ? (
        <EmptyState icon="clock" title={r.none} hint={r.noneHint}>
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            <Icon name="plus" /> {r.add}
          </button>
        </EmptyState>
      ) : items ? (
        <ul className="reminder-list">
          {items.map((rem) => (
            <ReminderCard
              key={rem.id}
              reminder={rem}
              onEdit={() => setEditing(rem)}
              onToggle={() => toggleActive(rem)}
              onDelete={() => remove(rem)}
            />
          ))}
        </ul>
      ) : null}
    </>
  )
}

function ReminderCard({ reminder: rem, onEdit, onToggle, onDelete }) {
  const { t, lang } = useUI()
  const r = t.app.reminders
  const c = t.app.common
  return (
    <li className="reminder glass-card" data-off={rem.isActive ? '0' : '1'}>
      <span className="reminder-ico">
        <Icon name={CHANNEL_ICONS[rem.channel] ?? 'bell'} />
      </span>
      <div className="reminder-main">
        <b>{rem.title}</b>
        {rem.message ? <span className="reminder-msg">{rem.message}</span> : null}
        <div className="reminder-meta">
          <span>
            <Icon name="clock" /> {r.nextAt} {formatDateTime(rem.remindAt, lang)}
          </span>
          {rem.recurrence && rem.recurrence !== 'None' ? (
            <span className="chip" data-tone="neutral">
              <Icon name="refresh" /> {r.recurrences[rem.recurrence]}
            </span>
          ) : null}
        </div>
      </div>
      <div className="reminder-actions">
        <Toggle label={rem.isActive ? r.active : r.paused} checked={rem.isActive} onChange={onToggle} />
        <div className="reminder-btns">
          <button className="icon-btn" aria-label={c.edit} onClick={onEdit}>
            <Icon name="pen" />
          </button>
          <button className="icon-btn" aria-label={c.delete} onClick={onDelete}>
            <Icon name="trash" />
          </button>
        </div>
      </div>
    </li>
  )
}

function ReminderForm({ reminder, defaultRecipient, onCancel, onSaved, onError, error }) {
  const { t } = useUI()
  const r = t.app.reminders
  const c = t.app.common
  const [form, setForm] = useState(() => ({
    title: reminder?.title ?? '',
    message: reminder?.message ?? '',
    channel: reminder?.channel ?? 'Email',
    recipient: reminder?.recipient ?? defaultRecipient,
    remindAt: reminder ? toLocalInput(reminder.remindAt) : defaultRemindAt(),
    recurrence: reminder?.recurrence ?? 'None',
  }))
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      channel: form.channel,
      recipient: form.recipient.trim(),
      // Local wall-clock → UTC instant (backend stores RemindAt as UTC).
      remindAt: new Date(form.remindAt).toISOString(),
      recurrence: form.recurrence,
    }
    try {
      if (reminder) await reminderApi.update(reminder.id, payload)
      else await reminderApi.create(payload)
      await onSaved()
    } catch (err) {
      onError(err.message)
      setBusy(false)
    }
  }

  return (
    <form className="panel glass page-narrow" onSubmit={submit}>
      <h2>{reminder ? r.edit : r.add}</h2>
      {error ? <Alert>{error}</Alert> : null}
      <Field label={r.title}>
        <input className="input" required maxLength={120} placeholder={r.titlePlaceholder} value={form.title} onChange={set('title')} />
      </Field>
      <Field label={r.message}>
        <textarea className="input" rows={2} placeholder={r.messagePlaceholder} value={form.message} onChange={set('message')} />
      </Field>
      <div className="field-row">
        <Field label={r.remindAt}>
          <input className="input" type="datetime-local" required value={form.remindAt} onChange={set('remindAt')} />
        </Field>
        <Field label={r.recurrence}>
          <Select value={form.recurrence} onChange={set('recurrence')} options={RECURRENCES.map((v) => [v, r.recurrences[v]])} />
        </Field>
      </div>
      <div className="field-row">
        <Field label={r.channel}>
          <Select value={form.channel} onChange={set('channel')} options={CHANNELS.map((v) => [v, t.app.notifications.channels[v]])} />
        </Field>
        <Field label={r.recipient} hint={r.recipientHint}>
          <input className="input" required value={form.recipient} onChange={set('recipient')} />
        </Field>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          {c.cancel}
        </button>
        <button className="btn btn-primary" disabled={busy}>
          {busy ? r.saving : r.save}
        </button>
      </div>
    </form>
  )
}
