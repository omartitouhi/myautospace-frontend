import { EmptyState } from 'myautospace-frontend'

export function NoListings() {
  return (
    <EmptyState icon="car" title="Aucune annonce" hint="Créez votre première annonce — une minute suffit.">
      <button className="btn btn-primary">Nouvelle annonce</button>
    </EmptyState>
  )
}

export function NoMessages() {
  return <EmptyState icon="chat" title="Aucune conversation" hint="Contactez un vendeur ou un prestataire pour discuter." />
}
