import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { bookingApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatDateTime, timeAgo } from '../../lib/format'
import { Alert, EmptyState, PageHead, Segmented, Spinner, StatusChip } from '../../components/app/ui'

export function Bookings() {
  const { t } = useUI()
  const { isSeller } = useAuth()
  const b = t.app.bookings
  const c = t.app.common
  const [tab, setTab] = useState('mine')
  // Result keyed by the tab that produced it (avoids a sync reset in the effect).
  const [result, setResult] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = tab === 'incoming' ? bookingApi.listIncoming() : bookingApi.listMine()
    load
      .then((data) => {
        if (!cancelled) setResult({ tab, items: data })
      })
      .catch((err) => {
        if (!cancelled) setResult({ tab, error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [tab, reloadKey])

  const current = result && result.tab === tab ? result : null
  const items = current?.items ?? null
  const error = current?.error ?? null
  const reload = () => setReloadKey((k) => k + 1)

  const tabs = [['mine', b.mine], ...(isSeller ? [['incoming', b.incoming]] : [])]

  return (
    <>
      <PageHead title={b.title} sub={b.sub} />
      {tabs.length > 1 ? <Segmented value={tab} onChange={setTab} options={tabs} ariaLabel={b.title} /> : null}

      {items && items.length > 0 ? (
        <div className="mas-stats">
          {[
            ['clock', items.filter((x) => x.status === 'Pending').length, b.statuses.Pending],
            ['check', items.filter((x) => x.status === 'Confirmed').length, b.statuses.Confirmed],
            ['shieldCheck', items.filter((x) => x.status === 'Completed').length, b.statuses.Completed],
          ].map(([icon, value, label]) => (
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

      {error ? <Alert>{error}</Alert> : null}

      {!items && !error ? (
        <Spinner label={c.loading} />
      ) : items && items.length === 0 ? (
        <EmptyState
          icon="cal"
          title={b.empty}
          hint={tab === 'incoming' ? b.emptyHintIncoming : b.emptyHintMine}
        >
          {tab === 'mine' ? (
            <Link className="btn btn-primary" to="/app">
              {b.browse}
            </Link>
          ) : null}
        </EmptyState>
      ) : items ? (
        <div className="booking-list">
          {items.map((bk) => (
            <BookingCard key={bk.id} booking={bk} role={tab} onChanged={reload} />
          ))}
        </div>
      ) : null}
    </>
  )
}

function BookingCard({ booking, role, onChanged }) {
  const { t, lang } = useUI()
  const b = t.app.bookings
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const act = async (status, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusy(true)
    setError(null)
    try {
      await bookingApi.setStatus(booking.id, status)
      await onChanged()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const isIncoming = role === 'incoming'
  const actions = []
  if (isIncoming) {
    if (booking.status === 'Pending') {
      actions.push(['Confirmed', b.confirm, 'primary', null])
      actions.push(['Cancelled', b.decline, 'danger', b.declineConfirm])
    } else if (booking.status === 'Confirmed') {
      actions.push(['Completed', b.complete, 'primary', null])
      actions.push(['Cancelled', b.cancel, 'danger', b.cancelConfirm])
    }
  } else if (booking.status === 'Pending' || booking.status === 'Confirmed') {
    actions.push(['Cancelled', b.cancel, 'danger', b.cancelConfirm])
  }

  return (
    <article className="booking-card glass-card">
      <div className="booking-type" data-type={booking.serviceType}>
        <Icon name={booking.serviceType === 'Rental' ? 'cal' : 'car'} />
      </div>
      <div className="booking-main">
        <div className="booking-top">
          {booking.vehicleId ? (
            <Link to={`/app/vehicles/${booking.vehicleId}`} className="booking-title">
              {booking.vehicleTitle || b.types[booking.serviceType] || booking.serviceType}
            </Link>
          ) : (
            <span className="booking-title">{booking.vehicleTitle}</span>
          )}
          <StatusChip status={booking.status} label={b.statuses[booking.status] ?? booking.status} />
        </div>
        <div className="booking-meta">
          <span>
            <Icon name="tag" /> {b.types[booking.serviceType] ?? booking.serviceType}
          </span>
          <span>
            <Icon name="clock" /> {formatDateTime(booking.scheduledAt, lang)}
          </span>
          {booking.vehicleLocation ? (
            <span>
              <Icon name="pin" /> {booking.vehicleLocation}
            </span>
          ) : null}
          <span className="booking-ago">
            {b.requestedBy} {timeAgo(booking.createdAt, lang)}
          </span>
        </div>
        {booking.note ? (
          <p className="booking-note">
            <b>{b.note}:</b> {booking.note}
          </p>
        ) : null}
        {booking.cancellationReason ? (
          <p className="booking-note booking-reason">{booking.cancellationReason}</p>
        ) : null}
        {error ? <Alert>{error}</Alert> : null}
        {actions.length > 0 ? (
          <div className="booking-actions">
            {actions.map(([status, label, tone, confirmMsg]) => (
              <button
                key={label}
                className={`btn btn-sm ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                disabled={busy}
                onClick={() => act(status, confirmMsg)}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
