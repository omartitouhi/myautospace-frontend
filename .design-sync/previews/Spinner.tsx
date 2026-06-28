import { Spinner } from 'myautospace-frontend'

export function WithLabel() {
  return <Spinner label="Chargement…" />
}

export function Bare() {
  return <Spinner />
}
