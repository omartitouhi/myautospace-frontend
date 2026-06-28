import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { providerApi, mapApi } from '../../lib/api'
import { getCurrentPosition } from '../../lib/geo'
import { Icon } from '../../lib/Icon'
import { hueOf } from '../../lib/format'
import { Alert, EmptyState, Spinner } from '../../components/app/ui'

export function Providers() {
  const { t } = useUI()
  const p = t.app.providers
  const b = t.app.browse
  const c = t.app.common
  const [providers, setProviders] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [nearMode, setNearMode] = useState('off')
  const [nearIds, setNearIds] = useState(null)

  useEffect(() => {
    let cancelled = false
    providerApi
      .listActive()
      .then((data) => {
        if (!cancelled) setProviders(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const toggleNear = async () => {
    if (nearMode === 'on' || nearMode === 'error') {
      setNearMode('off')
      setNearIds(null)
      return
    }
    setNearMode('loading')
    try {
      const pos = await getCurrentPosition()
      const results = await mapApi.nearby({
        latitude: pos.latitude,
        longitude: pos.longitude,
        radiusKm: 50,
        entityType: 'Provider',
        limit: 100,
      })
      setNearIds(new Set(results.map((r) => r.entityId)))
      setNearMode('on')
    } catch {
      setNearIds(null)
      setNearMode('error')
    }
  }

  // City chips derived from the live directory.
  const cities = useMemo(() => {
    if (!providers) return []
    return [...new Set(providers.map((prov) => prov.city).filter(Boolean))].sort().slice(0, 8)
  }, [providers])

  const visible = useMemo(() => {
    if (!providers) return null
    let list = providers
    if (nearMode === 'on' && nearIds) list = list.filter((prov) => nearIds.has(prov.id))
    if (city) list = list.filter((prov) => prov.city === city)
    const term = query.trim().toLowerCase()
    if (term) {
      list = list.filter((prov) =>
        `${prov.businessName} ${prov.tagline ?? ''} ${prov.city} ${prov.description ?? ''}`.toLowerCase().includes(term),
      )
    }
    return list
  }, [providers, nearMode, nearIds, city, query])

  return (
    <>
      <section className="mas-hero">
        <span className="eyebrow">
          <span className="dot" /> {p.title}
        </span>
        <h1>{p.title}</h1>
        <p>{p.directorySub}</p>
        <div className="mas-hero-actions">
          <div className="browse-search glass" style={{ flex: '1 1 320px', maxWidth: 440, borderRadius: 999, padding: '4px 14px' }}>
            <Icon name="search" />
            <input
              type="search"
              placeholder={p.searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-ghost near-btn"
            data-on={nearMode === 'on' ? '1' : '0'}
            onClick={toggleNear}
            disabled={nearMode === 'loading'}
          >
            <Icon name="pin" />
            {nearMode === 'loading' ? b.locating : nearMode === 'on' ? b.nearMeActive : b.nearMe}
          </button>
        </div>
        {cities.length > 0 ? (
          <div className="mas-chips" style={{ marginTop: 16 }}>
            <button type="button" className="mas-chip" data-on={city === '' ? '1' : '0'} onClick={() => setCity('')}>
              {p.allCategories}
            </button>
            {cities.map((ct) => (
              <button key={ct} type="button" className="mas-chip" data-on={city === ct ? '1' : '0'} onClick={() => setCity(ct)}>
                <Icon name="pin" /> {ct}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {error ? <Alert>{error}</Alert> : null}
      {nearMode === 'error' ? <Alert tone="info">{b.geoError}</Alert> : null}

      {!providers && !error ? (
        <Spinner label={c.loading} />
      ) : visible && visible.length === 0 ? (
        <EmptyState icon="wrench" title={p.none} hint={p.noneHint} />
      ) : visible ? (
        <div className="mas-provider-grid">
          {visible.map((prov) => (
            <ProviderCard key={prov.id} provider={prov} t={t} />
          ))}
        </div>
      ) : null}
    </>
  )
}

function ProviderCard({ provider, t }) {
  const p = t.app.providers
  const a = t.app
  return (
    <Link to={`/app/providers/${provider.id}`} className="mas-provider" style={{ '--vh': hueOf(provider.id) }}>
      <div className="mas-provider-cover">
        {provider.coverImageUrl ? <img src={provider.coverImageUrl} alt="" loading="lazy" /> : null}
        <span className="mas-provider-ava">
          {provider.logoImageUrl ? <img src={provider.logoImageUrl} alt="" loading="lazy" /> : <Icon name="wrench" />}
        </span>
      </div>
      <div className="mas-provider-body">
        <div className="mas-provider-top">
          <span className="mas-provider-name">{provider.businessName}</span>
          <StatusChipMini status={provider.status} label={a.enums.pstatus[provider.status]} />
        </div>
        {provider.tagline || provider.description ? (
          <p className="provider-desc">{provider.tagline || provider.description}</p>
        ) : null}
        <div className="mas-provider-meta">
          <span>
            <Icon name="pin" /> {provider.city}, {provider.country}
          </span>
          {provider.completedJobs > 0 ? (
            <span>
              <Icon name="check" /> {provider.completedJobs} {p.stats.jobs.toLowerCase()}
            </span>
          ) : null}
        </div>
        <div className="mas-provider-foot">
          {provider.yearsExperience > 0 ? (
            <span className="profile-meta">
              {provider.yearsExperience} {p.stats.years}
            </span>
          ) : (
            <span />
          )}
          <span className="provider-cta">
            {p.viewProfile} <Icon name="arrow" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function StatusChipMini({ status, label }) {
  if (status !== 'Active') return null
  return (
    <span className="chip" data-tone="ok">
      <Icon name="shieldCheck" /> {label}
    </span>
  )
}
