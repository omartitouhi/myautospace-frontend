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

  return (
    <>
      <PageHead title={a.garage.title} sub={a.garage.sub}>
        <Link to="/app/sell" className="btn btn-primary">
          <Icon name="plus" /> {a.garage.newListing}
        </Link>
      </PageHead>

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
