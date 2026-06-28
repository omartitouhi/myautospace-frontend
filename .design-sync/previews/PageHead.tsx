import { PageHead } from 'myautospace-frontend'

export function WithAction() {
  return (
    <PageHead title="Mon garage" sub="Vos annonces, brouillons et ventes au même endroit.">
      <button className="btn btn-primary">Nouvelle annonce</button>
    </PageHead>
  )
}

export function Plain() {
  return <PageHead title="Réservations" sub="Vos essais et locations, et les demandes sur vos véhicules." />
}
