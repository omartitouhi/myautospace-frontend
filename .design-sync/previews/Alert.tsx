import { Alert } from 'myautospace-frontend'

export function ErrorTone() {
  return <Alert tone="error">Impossible de charger les annonces.</Alert>
}

export function SuccessTone() {
  return <Alert tone="success">Préférences enregistrées.</Alert>
}

export function InfoTone() {
  return <Alert tone="info">Recherche indisponible — résultats locaux affichés.</Alert>
}
