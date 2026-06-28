import { VehicleArt } from 'myautospace-frontend'

export function Sedan() {
  return (
    <div style={{ width: 320, height: 200 }}>
      <VehicleArt vehicle={{ id: 'a1b2', make: 'Tesla', model: 'Model 3', bodyType: 'Sedan' }} />
    </div>
  )
}

export function SUV() {
  return (
    <div style={{ width: 320, height: 200 }}>
      <VehicleArt vehicle={{ id: 'c3d4', make: 'Toyota', model: 'RAV4', bodyType: 'SUV' }} />
    </div>
  )
}

export function Truck() {
  return (
    <div style={{ width: 320, height: 200 }}>
      <VehicleArt vehicle={{ id: 'e5f6', make: 'Ford', model: 'Ranger', bodyType: 'Truck' }} />
    </div>
  )
}
