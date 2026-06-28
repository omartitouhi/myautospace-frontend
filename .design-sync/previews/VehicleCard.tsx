import { VehicleCard } from 'myautospace-frontend'

const base = {
  id: '11111111-1111-1111-1111-111111111111',
  make: 'Tesla',
  model: 'Model 3',
  year: 2023,
  price: 255000,
  mileage: 42000,
  fuelType: 'Electric',
  transmission: 'Automatic',
  bodyType: 'Sedan',
  listingType: 'ForSale',
  status: 'Active',
  city: 'Tunis',
  country: 'Tunisia',
  imageUrls: [],
}

export function ForSale() {
  return (
    <div style={{ width: 340 }}>
      <VehicleCard vehicle={base} />
    </div>
  )
}

export function Rental() {
  return (
    <div style={{ width: 340 }}>
      <VehicleCard
        vehicle={{ ...base, id: '22222222-2222-2222-2222-222222222222', make: 'Volkswagen', model: 'Golf 8', price: 220, fuelType: 'Petrol', transmission: 'Manual', bodyType: 'Hatchback', listingType: 'ForRent', city: 'Sfax' }}
      />
    </div>
  )
}

export function SoldWithStatus() {
  return (
    <div style={{ width: 340 }}>
      <VehicleCard vehicle={{ ...base, status: 'Sold' }} showStatus />
    </div>
  )
}
