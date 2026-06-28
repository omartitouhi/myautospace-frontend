import { Toggle } from 'myautospace-frontend'

export function On() {
  return (
    <div style={{ maxWidth: 320 }}>
      <Toggle checked label="Notifications e-mail" onChange={() => {}} />
    </div>
  )
}

export function Off() {
  return (
    <div style={{ maxWidth: 320 }}>
      <Toggle checked={false} label="Notifications SMS" onChange={() => {}} />
    </div>
  )
}
