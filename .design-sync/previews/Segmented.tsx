import { Segmented } from 'myautospace-frontend'

export function Listing() {
  return (
    <div style={{ maxWidth: 320 }}>
      <Segmented
        value="ForSale"
        onChange={() => {}}
        ariaLabel="Listing type"
        options={[
          ['ForSale', 'À vendre'],
          ['ForRent', 'À louer'],
        ]}
      />
    </div>
  )
}
