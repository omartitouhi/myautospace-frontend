import { Link } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { Icon } from '../../lib/Icon'
import { formatKm, formatPrice } from '../../lib/format'
import { StatusChip, VehicleArt } from './ui'

/* Card for a VehicleSummaryResponse. `showStatus` is for the owner's garage
   view, where non-Active statuses matter. */
export function VehicleCard({ vehicle, showStatus = false }) {
  const { t, lang } = useUI()
  const a = t.app

  return (
    <Link to={`/app/vehicles/${vehicle.id}`} className="vcard glass-card">
      <div className="vcard-media">
        {vehicle.imageUrls && vehicle.imageUrls.length > 0 ? (
          <img className="vcard-photo" src={vehicle.imageUrls[0]} alt={`${vehicle.make} ${vehicle.model}`} loading="lazy" />
        ) : (
          <VehicleArt vehicle={vehicle} />
        )}
        <span className="vcard-badge">
          <Icon name="tag" /> {a.enums.listing[vehicle.listingType] ?? vehicle.listingType}
        </span>
        {showStatus ? (
          <span className="vcard-status">
            <StatusChip status={vehicle.status} label={a.enums.vstatus[vehicle.status]} />
          </span>
        ) : null}
      </div>
      <div className="vcard-body">
        <div className="vcard-top">
          <div className="vcard-title">
            {vehicle.make} {vehicle.model}
          </div>
          <div className="vcard-price">{formatPrice(vehicle.price, lang)}</div>
        </div>
        <div className="vcard-specs">
          <span>
            <Icon name="cal" /> {vehicle.year}
          </span>
          <span>
            <Icon name="gauge" /> {formatKm(vehicle.mileage, lang)}
          </span>
          <span>
            <Icon name="fuel" /> {a.enums.fuel[vehicle.fuelType] ?? vehicle.fuelType}
          </span>
          <span>
            <Icon name="pin" /> {vehicle.city}
          </span>
        </div>
      </div>
    </Link>
  )
}
