/* Small shared building blocks for the authenticated app.
   Purely presentational; all styled by the `app` section of index.css. */

import { Icon } from '../../lib/Icon'
import { hueOf } from '../../lib/format'

export function Spinner({ label }) {
  return (
    <div className="busy" role="status">
      <span className="spinner" aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </div>
  )
}

const ALERT_ICONS = { error: 'alert', success: 'check', info: 'info' }

export function Alert({ tone = 'error', children }) {
  return (
    <div className="alert" data-tone={tone} role="alert">
      <Icon name={ALERT_ICONS[tone] ?? 'info'} />
      <div>{children}</div>
    </div>
  )
}

export function EmptyState({ icon = 'car', title, hint, children }) {
  return (
    <div className="empty">
      <div className="empty-ico">
        <Icon name={icon} />
      </div>
      <h3>{title}</h3>
      {hint ? <p>{hint}</p> : null}
      {children}
    </div>
  )
}

export function PageHead({ title, sub, children }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {sub ? <p>{sub}</p> : null}
      </div>
      {children ? <div className="page-head-actions">{children}</div> : null}
    </header>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">
        {label}
        {hint ? <em> · {hint}</em> : null}
      </span>
      {children}
    </label>
  )
}

export function Select({ value, onChange, options, ...rest }) {
  return (
    <span className="select-wrap">
      <select className="input" value={value} onChange={onChange} {...rest}>
        {options.map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
      <Icon name="chevDown" />
    </span>
  )
}

export function Segmented({ value, onChange, options, ariaLabel }) {
  return (
    <div className="seg" role="radiogroup" aria-label={ariaLabel}>
      {options.map(([val, label]) => (
        <button
          key={val}
          type="button"
          role="radio"
          aria-checked={value === val}
          data-on={value === val ? '1' : '0'}
          onClick={() => onChange(val)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <span className="toggle" data-on={checked ? '1' : '0'}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <i />
      </span>
    </label>
  )
}

/* Status chip; tone is derived from the backend enum value. */
const STATUS_TONES = {
  Active: 'ok',
  Sent: 'ok',
  Approved: 'ok',
  Succeeded: 'ok',
  Confirmed: 'ok',
  CheckedIn: 'ok',
  Draft: 'neutral',
  Pending: 'warn',
  Rescheduled: 'warn',
  Sold: 'accent',
  Rented: 'accent',
  Completed: 'accent',
  Inactive: 'neutral',
  Failed: 'bad',
  Rejected: 'bad',
  NoShow: 'bad',
  Cancelled: 'neutral',
}

export function StatusChip({ status, label }) {
  return (
    <span className="chip" data-tone={STATUS_TONES[status] ?? 'neutral'}>
      {label ?? status}
    </span>
  )
}

/* Placeholder vehicle visual — MediaService isn't implemented yet, so
   listings get a deterministic tinted tile with the body-type glyph. */
const BODY_ICONS = {
  Sedan: 'car',
  SUV: 'car',
  Hatchback: 'car',
  Coupe: 'car',
  Convertible: 'car',
  Van: 'truck',
  Truck: 'truck',
  Motorcycle: 'gauge',
  Other: 'car',
}

export function VehicleArt({ vehicle }) {
  const hue = hueOf(vehicle.id ?? `${vehicle.make}${vehicle.model}`)
  return (
    <div className="vart" style={{ '--vh': hue }} aria-hidden="true">
      <Icon name={BODY_ICONS[vehicle.bodyType] ?? 'car'} />
      <span className="vart-name">
        {vehicle.make} {vehicle.model}
      </span>
    </div>
  )
}
