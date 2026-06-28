import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { vehicleApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { VehicleCard } from '../../components/app/VehicleCard'
import { Alert, EmptyState, PageHead, Spinner } from '../../components/app/ui'

export function Garage() {
  const { t } = useUI()
  const { isSeller } = useAuth()
  const a = t.app
  const [vehicles, setVehicles] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSeller) return
    let cancelled = false
    vehicleApi
      .listMine()
      .then((data) => {
        if (!cancelled) setVehicles(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [isSeller])

  if (!isSeller) {
    return <Alert tone="info">{a.garage.notSeller}</Alert>
  }

  const d = a.dashboard
  const stats = vehicles
    ? [
        ['car', vehicles.filter((v) => v.status === 'Active').length, d.activeListings],
        ['doc', vehicles.filter((v) => v.status === 'Draft').length, d.drafts],
        ['check', vehicles.filter((v) => v.status === 'Sold' || v.status === 'Rented').length, d.sold],
        ['tag', vehicles.length, d.listings],
      ]
    : null

  return (
    <>
      <PageHead title={a.garage.title} sub={a.garage.sub}>
        <Link to="/app/sell" className="btn btn-primary">
          <Icon name="plus" /> {a.garage.newListing}
        </Link>
      </PageHead>

      {stats && vehicles.length > 0 ? (
        <div className="mas-stats">
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

      {error ? <Alert>{error}</Alert> : null}

      {!vehicles && !error ? (
        <Spinner label={a.common.loading} />
      ) : vehicles && vehicles.length === 0 ? (
        <EmptyState title={a.garage.empty} hint={a.garage.emptyHint}>
          <Link to="/app/sell" className="btn btn-primary">
            <Icon name="plus" /> {a.garage.newListing}
          </Link>
        </EmptyState>
      ) : vehicles ? (
        <div className="cards-grid">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} showStatus />
          ))}
        </div>
      ) : null}
    </>
  )
}
