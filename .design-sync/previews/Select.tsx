import { Select } from 'myautospace-frontend'

export function Fuel() {
  return (
    <div style={{ maxWidth: 280 }}>
      <Select
        value="Petrol"
        onChange={() => {}}
        options={[
          ['Petrol', 'Essence'],
          ['Diesel', 'Diesel'],
          ['Electric', 'Électrique'],
          ['Hybrid', 'Hybride'],
        ]}
      />
    </div>
  )
}
