import { useEffect, useState } from 'react'
import { useUI } from '../../lib/ui'
import { paymentApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatPrice, formatDateTime } from '../../lib/format'
import { Alert, EmptyState, Field, PageHead, Select, Spinner, StatusChip } from '../../components/app/ui'

const TOPUP_METHODS = ['Stripe', 'Paymee']

export function Wallet() {
  const { t, lang } = useUI()
  const w = t.app.payments
  const c = t.app.common
  const [wallet, setWallet] = useState(null)
  const [txns, setTxns] = useState([])
  const [payments, setPayments] = useState([])
  const [error, setError] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [topup, setTopup] = useState({ amount: '', method: 'Stripe' })
  const [busy, setBusy] = useState(false)

  const reload = async () => {
    try {
      const [walletData, txnData, paymentData] = await Promise.all([
        paymentApi.wallet(),
        paymentApi.transactions(),
        paymentApi.listMine(),
      ])
      setWallet(walletData)
      setTxns(txnData)
      setPayments(paymentData)
      setLoaded(true)
    } catch (err) {
      setError(err.message)
      setLoaded(true)
    }
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([paymentApi.wallet(), paymentApi.transactions(), paymentApi.listMine()])
      .then(([walletData, txnData, paymentData]) => {
        if (cancelled) return
        setWallet(walletData)
        setTxns(txnData)
        setPayments(paymentData)
        setLoaded(true)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const submitTopup = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await paymentApi.topUp({ amount: Number(topup.amount), method: topup.method })
      setTopup({ amount: '', method: 'Stripe' })
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const downloadInvoice = async (paymentId) => {
    try {
      const invoice = await paymentApi.invoice(paymentId)
      const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.number}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!loaded) return <Spinner label={c.loading} />

  return (
    <>
      <PageHead title={w.title} sub={w.sub} />
      {error ? <Alert>{error}</Alert> : null}

      <section className="mas-wallet-hero">
        <div>
          <div className="label">{w.balance}</div>
          <div className="amount">{wallet ? formatPrice(wallet.balance, lang) : '—'}</div>
        </div>
        <div className="ico">
          <Icon name="card" />
        </div>
      </section>

      <section className="panel glass">
        <h2 className="panel-sub">{w.topUp}</h2>
        <form className="avail-form" onSubmit={submitTopup}>
          <Field label={w.amount}>
            <input
              className="input"
              type="number"
              min="0.001"
              step="any"
              required
              value={topup.amount}
              onChange={(e) => setTopup((f) => ({ ...f, amount: e.target.value }))}
            />
          </Field>
          <Field label={w.method}>
            <Select
              value={topup.method}
              onChange={(e) => setTopup((f) => ({ ...f, method: e.target.value }))}
              options={TOPUP_METHODS.map((m) => [m, w.methods[m] ?? m])}
            />
          </Field>
          <button className="btn btn-primary btn-sm" disabled={busy}>
            <Icon name="plus" /> {busy ? w.processing : w.topUpBtn}
          </button>
        </form>
      </section>

      <div className="dash-grid">
      <section className="panel glass">
        <h2 className="panel-sub">{w.history}</h2>
        {payments.length === 0 ? (
          <EmptyState icon="card" title={w.noPayments} />
        ) : (
          <ul className="admin-list">
            {payments.map((p) => (
              <li key={p.id} className="admin-row">
                <div className="admin-row-main">
                  <b>{formatPrice(p.amount, lang)} {p.currency}</b>
                  <span className="profile-meta">
                    {w.methods[p.method] ?? p.method} · {formatDateTime(p.createdAt, lang)}
                  </span>
                </div>
                <StatusChip status={p.status} label={w.statuses[p.status] ?? p.status} />
                {p.status === 'Succeeded' || p.status === 'Refunded' ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => downloadInvoice(p.id)}>
                    <Icon name="doc" /> {w.invoice}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel glass">
        <h2 className="panel-sub">{w.transactions}</h2>
        {txns.length === 0 ? (
          <p className="profile-meta">{w.noTransactions}</p>
        ) : (
          <ul className="admin-list">
            {txns.map((tx) => (
              <li key={tx.id} className="admin-row">
                <div className="admin-row-main">
                  <b>{tx.reason}</b>
                  <span className="profile-meta">{formatDateTime(tx.createdAt, lang)}</span>
                </div>
                <span className={tx.type === 'Credit' ? 'wallet-credit' : 'wallet-debit'}>
                  {tx.type === 'Credit' ? '+' : '−'}{formatPrice(tx.amount, lang)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
    </>
  )
}
