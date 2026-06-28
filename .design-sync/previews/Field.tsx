import { Field } from 'myautospace-frontend'

export function Default() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Field label="Email">
        <input className="input" defaultValue="amine@myautospace.tn" />
      </Field>
    </div>
  )
}

export function WithHint() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Field label="VIN" hint="17 characters">
        <input className="input" placeholder="WVWZZZ1KZAW000000" />
      </Field>
    </div>
  )
}
