import { useEffect, useState } from 'react'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { contractApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatDate, formatPrice } from '../../lib/format'
import { Alert, EmptyState, Field, PageHead, Select, Spinner, StatusChip } from '../../components/app/ui'

export function Contracts() {
  const { t, lang } = useUI()
  const { session } = useAuth()
  const k = t.app.contracts
  const c = t.app.common
  const [contracts, setContracts] = useState(null)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)

  const reload = async () => {
    try {
      setContracts(await contractApi.listMine())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    let cancelled = false
    contractApi
      .listMine()
      .then((data) => {
        if (!cancelled) setContracts(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const sign = async (id) => {
    const name = window.prompt(k.signPrompt)
    if (!name) return
    setBusy(true)
    setError(null)
    try {
      await contractApi.sign(id, name)
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const archive = async (id) => {
    if (!window.confirm(k.archiveConfirm)) return
    setBusy(true)
    setError(null)
    try {
      await contractApi.archive(id)
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const download = (contract) => {
    const blob = new Blob([contract.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contract-${contract.id.slice(0, 8)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (creating) {
    return (
      <CreateContract
        onCancel={() => setCreating(false)}
        onCreated={async () => {
          setCreating(false)
          await reload()
        }}
        onError={setError}
        error={error}
      />
    )
  }

  return (
    <>
      <PageHead title={k.title} sub={k.sub}>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <Icon name="plus" /> {k.create}
        </button>
      </PageHead>

      {error ? <Alert>{error}</Alert> : null}

      {!contracts && !error ? (
        <Spinner label={c.loading} />
      ) : contracts && contracts.length === 0 ? (
        <EmptyState icon="doc" title={k.none} hint={k.noneHint} />
      ) : contracts ? (
        <div className="company-list">
          {contracts.map((contract) => {
            const signed = contract.signatures?.some((s) => s.signerUserId === session?.userId)
            return (
              <section key={contract.id} className="panel glass">
                <div className="panel-head">
                  <div>
                    <h2 className="panel-sub">{contract.title}</h2>
                    <p className="profile-meta">
                      {k.types[contract.type] ?? contract.type} · {formatDate(contract.generatedAt, lang)}
                      {contract.amount ? ` · ${formatPrice(contract.amount, lang)}` : ''}
                    </p>
                  </div>
                  <StatusChip status={contract.status} label={k.statuses[contract.status] ?? contract.status} />
                </div>

                <p className="profile-meta">
                  {k.signatures}: {contract.signatures?.length ?? 0}/2
                </p>

                <div className="form-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => download(contract)}>
                    <Icon name="doc" /> {k.download}
                  </button>
                  {!signed && contract.status !== 'Archived' && contract.status !== 'Cancelled' ? (
                    <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => sign(contract.id)}>
                      <Icon name="pen" /> {k.sign}
                    </button>
                  ) : null}
                  {contract.status !== 'Archived' ? (
                    <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => archive(contract.id)}>
                      {k.archive}
                    </button>
                  ) : null}
                </div>
              </section>
            )
          })}
        </div>
      ) : null}
    </>
  )
}

function CreateContract({ onCancel, onCreated, onError, error }) {
  const { t } = useUI()
  const k = t.app.contracts
  const c = t.app.common
  const [form, setForm] = useState({ type: 'Sale', partyBUserId: '', title: '', vehicleId: '', amount: '', terms: '' })
  const [busy, setBusy] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    onError(null)
    try {
      await contractApi.create({
        type: form.type,
        partyBUserId: form.partyBUserId.trim(),
        title: form.title.trim() || null,
        vehicleId: form.vehicleId.trim() || null,
        amount: form.amount ? Number(form.amount) : null,
        terms: form.terms.trim() || null,
      })
      await onCreated()
    } catch (err) {
      onError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="page-narrow">
      <PageHead title={k.createTitle} sub={k.createSub} />
      {error ? <Alert>{error}</Alert> : null}
      <form className="panel glass" onSubmit={submit}>
        <div className="field-row">
          <Field label={k.type}>
            <Select
              value={form.type}
              onChange={set('type')}
              options={[['Sale', k.types.Sale], ['Rental', k.types.Rental]]}
            />
          </Field>
          <Field label={k.amount} hint={c.optional}>
            <input className="input" type="number" min="0" step="any" value={form.amount} onChange={set('amount')} />
          </Field>
        </div>
        <Field label={k.counterparty} hint={k.counterpartyHint}>
          <input
            className="input"
            required
            placeholder="00000000-0000-0000-0000-000000000000"
            value={form.partyBUserId}
            onChange={set('partyBUserId')}
          />
        </Field>
        <Field label={k.contractTitle} hint={c.optional}>
          <input className="input" value={form.title} onChange={set('title')} />
        </Field>
        <Field label={k.vehicleId} hint={c.optional}>
          <input className="input" value={form.vehicleId} onChange={set('vehicleId')} />
        </Field>
        <Field label={k.terms} hint={c.optional}>
          <textarea className="input" rows={4} value={form.terms} onChange={set('terms')} />
        </Field>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            {c.cancel}
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? k.creating : k.create}
          </button>
        </div>
      </form>
    </div>
  )
}
