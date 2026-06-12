import { useEffect, useState } from 'react'
import { useUI } from '../../lib/ui'
import { notificationApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatDateTime, timeAgo } from '../../lib/format'
import { Alert, EmptyState, PageHead, Segmented, Spinner, StatusChip } from '../../components/app/ui'

const CHANNEL_ICONS = { Email: 'mail', Sms: 'phone', Push: 'bell' }
const STATUSES = ['Pending', 'Sent', 'Failed', 'Cancelled']

export function Notifications() {
  const { t, lang } = useUI()
  const a = t.app.notifications
  const c = t.app.common
  const [filter, setFilter] = useState('')
  // Result is keyed by the filter that produced it, so switching filters
  // shows the loading state without a synchronous reset in the effect.
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
      <PageHead title={a.title} sub={a.sub} />

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
