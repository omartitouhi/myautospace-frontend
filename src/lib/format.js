/* Locale-aware display formatting. Prices are Tunisian Dinar ("DT"). */

export function formatPrice(value, lang = 'fr') {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  const locale = lang === 'fr' ? 'fr-TN' : 'en-US'
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n)} DT`
}

export function formatKm(value, lang = 'fr') {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  const locale = lang === 'fr' ? 'fr-TN' : 'en-US'
  return `${new Intl.NumberFormat(locale).format(n)} km`
}

export function formatDate(value, lang = 'fr') {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(value, lang = 'fr') {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(value, lang = 'fr') {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const rtf = new Intl.RelativeTimeFormat(lang === 'fr' ? 'fr' : 'en', { numeric: 'auto' })
  const seconds = (date.getTime() - Date.now()) / 1000
  const steps = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.345, 'week'],
    [12, 'month'],
    [Infinity, 'year'],
  ]
  let unit = 'second'
  let amount = seconds
  for (const [step, name] of steps) {
    unit = name
    if (Math.abs(amount) < step) break
    amount /= step
  }
  return rtf.format(Math.round(amount), unit)
}

/* Deterministic hue from a string — used for placeholder vehicle art. */
export function hueOf(str) {
  let hash = 0
  for (let i = 0; i < String(str).length; i++) {
    hash = (hash * 31 + String(str).charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 360
}
