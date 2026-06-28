import { StatusChip } from 'myautospace-frontend'

export function States() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <StatusChip status="Active" label="Active" />
      <StatusChip status="Pending" label="En attente" />
      <StatusChip status="Sold" label="Vendu" />
      <StatusChip status="Completed" label="Terminée" />
      <StatusChip status="Failed" label="Échec" />
      <StatusChip status="Cancelled" label="Annulé" />
    </div>
  )
}
