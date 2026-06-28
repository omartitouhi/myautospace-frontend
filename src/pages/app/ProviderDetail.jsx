import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { providerApi, reviewApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatPrice, hueOf } from '../../lib/format'
import { Alert, Spinner, StatusChip } from '../../components/app/ui'
import { ReviewsSection, Stars } from '../../components/app/ReviewsSection'
import { ContactButton } from '../../components/app/ContactButton'

function formatSlot(time) {
  // TimeOnly serializes as "HH:mm:ss" — trim seconds for display.
  return typeof time === 'string' ? time.slice(0, 5) : time
}

export function ProviderDetail() {
  const { t, lang } = useUI()
  const { id } = useParams()
  const p = t.app.providers
  const c = t.app.common
  const a = t.app
  const [provider, setProvider] = useState(null)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    providerApi
      .get(id)
      .then((data) => {
        if (!cancelled) setProvider(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.status === 404 ? p.notFound : err.message)
      })
    // Rating summary is best-effort — ReviewService may be unavailable.
    reviewApi
      .summary('Provider', id)
      .then((s) => {
        if (!cancelled) setSummary(s)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [id, p.notFound])

  if (error) {
    return (
      <>
        <Alert>{error}</Alert>
        <Link to="/app/providers" className="btn btn-ghost">
          <Icon name="arrow" /> {p.back}
        </Link>
      </>
    )
  }

  if (!provider) return <Spinner label={c.loading} />

  const slots = [...(provider.availabilities ?? [])].sort((x, y) => x.dayOfWeek - y.dayOfWeek)
  const primaryCategory = provider.services?.[0]?.category
  const hasRating = summary && summary.count > 0

  // Headline stat cards — each hidden when its value is empty/zero.
  const stats = [
    provider.completedJobs > 0 && ['check', provider.completedJobs, p.stats.jobs],
    provider.yearsExperience > 0 && ['shield', provider.yearsExperience, p.stats.years],
    ['wrench', provider.services?.length ?? 0, p.stats.services],
    provider.responseTimeHours != null && ['clock', p.responseValue(provider.responseTimeHours), p.stats.response],
    provider.hourlyRate != null && ['card', formatPrice(provider.hourlyRate, lang), p.stats.rate],
  ].filter(Boolean)

  return (
    <div className="pp" style={{ '--vh': hueOf(provider.id) }}>
      <Link to="/app/providers" className="back-link">
        <Icon name="arrow" style={{ transform: 'rotate(180deg)' }} /> {p.back}
      </Link>

      <div className="pp-cover">
        {provider.coverImageUrl ? <img src={provider.coverImageUrl} alt="" /> : null}
      </div>

      <header className="pp-head">
        <div className="pp-avatar">
          {provider.logoImageUrl ? <img src={provider.logoImageUrl} alt="" /> : <Icon name="wrench" />}
        </div>
        <div className="pp-head-main">
          <h1>
            {provider.businessName}
            <StatusChip status={provider.status} label={a.enums.pstatus[provider.status]} />
          </h1>
          {provider.tagline ? <p className="pp-tagline">{provider.tagline}</p> : null}
          <div className="pp-meta">
            {hasRating ? (
              <span className="pp-rating">
                <Stars value={summary.averageRating} />
                <b>{summary.averageRating.toFixed(1)}</b>
                <span className="profile-meta">· {p.reviewsCount(summary.count)}</span>
              </span>
            ) : (
              <span className="profile-meta">{p.noReviewsYet}</span>
            )}
            <span>
              <Icon name="pin" /> {provider.city}, {provider.country}
            </span>
            {primaryCategory ? (
              <span>
                <Icon name="wrench" /> {a.enums.serviceCategory[primaryCategory] ?? primaryCategory}
              </span>
            ) : null}
          </div>
        </div>
        <div className="pp-head-actions">
          {provider.phoneNumber ? (
            <a className="btn btn-ghost" href={`tel:${provider.phoneNumber}`}>
              <Icon name="phone" /> {provider.phoneNumber}
            </a>
          ) : null}
          <ContactButton
            otherUserId={provider.authUserId}
            label={a.messages.contactProvider}
            className="btn btn-primary"
          />
        </div>
      </header>

      {stats.length > 0 ? (
        <div className="pp-stats">
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

      <div className="mas-pd-grid">
        <div className="dash-col">
          <section className="panel glass">
            <h2 className="panel-sub">{p.about}</h2>
            <p className="vdetail-desc">{provider.description || p.noAbout}</p>
          </section>

          <section className="panel glass">
            <h2 className="panel-sub">{p.services}</h2>
            {provider.services && provider.services.length > 0 ? (
              <ul className="service-list">
                {provider.services.map((s) => (
                  <li key={s.id} className="service-row">
                    <div>
                      <b>{s.name}</b>
                      <span className="service-cat">{a.enums.serviceCategory[s.category] ?? s.category}</span>
                      {s.description ? <p className="profile-meta">{s.description}</p> : null}
                    </div>
                    <div className="service-price">
                      <b>{formatPrice(s.price, lang)}</b>
                      <span className="profile-meta">
                        <Icon name="clock" /> {s.durationMinutes} {p.duration.toLowerCase()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="profile-meta">{p.noServices}</p>
            )}
          </section>

          {provider.galleryImages && provider.galleryImages.length > 0 ? (
            <section className="panel glass">
              <h2 className="panel-sub">{p.gallery}</h2>
              <div className="gallery-grid">
                {provider.galleryImages.map((g) => (
                  <figure key={g.id} className="gallery-item">
                    <img src={g.imageUrl} alt={g.caption ?? ''} loading="lazy" />
                    {g.caption ? <figcaption>{g.caption}</figcaption> : null}
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          <ReviewsSection targetType="Provider" targetId={provider.id} />
        </div>

        <aside className="mas-pd-side">
          <section className="panel glass">
            <h2 className="panel-sub">{p.availability}</h2>
            {slots.length > 0 ? (
              <ul className="avail-list">
                {slots.map((slot) => (
                  <li key={slot.id}>
                    <span>{p.days[slot.dayOfWeek]}</span>
                    <span className="profile-meta">
                      {slot.isAvailable ? `${formatSlot(slot.startTime)} – ${formatSlot(slot.endTime)}` : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="profile-meta">{p.noAvailability}</p>
            )}
            <ContactButton
              otherUserId={provider.authUserId}
              label={a.messages.contactProvider}
              className="btn btn-ghost provider-contact"
            />
          </section>
        </aside>
      </div>
    </div>
  )
}
