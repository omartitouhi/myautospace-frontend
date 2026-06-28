import { useEffect, useState } from 'react'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { reviewApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { formatDate } from '../../lib/format'
import { Alert, Field, Select, Spinner } from './ui'

export function Stars({ value, max = 5 }) {
  return (
    <span className="stars" aria-label={`${value}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(value) ? 'star on' : 'star'}>
          <Icon name="star" />
        </span>
      ))}
    </span>
  )
}

/* Reviews for a target (a vehicle or provider). Shows the summary, the list,
   a write-review form, and a respond action for sellers/providers. */
export function ReviewsSection({ targetType, targetId }) {
  const { t, lang } = useUI()
  const { session, isSeller, isServiceProvider } = useAuth()
  const r = t.app.reviews
  const c = t.app.common
  const [summary, setSummary] = useState(null)
  const [reviews, setReviews] = useState(null)
  const [error, setError] = useState(null)
  const [writing, setWriting] = useState(false)
  const [form, setForm] = useState({ rating: '5', title: '', comment: '' })
  const [busy, setBusy] = useState(false)

  const load = () => {
    Promise.all([reviewApi.summary(targetType, targetId), reviewApi.forTarget(targetType, targetId)])
      .then(([s, list]) => {
        setSummary(s)
        setReviews(list)
      })
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([reviewApi.summary(targetType, targetId), reviewApi.forTarget(targetType, targetId)])
      .then(([s, list]) => {
        if (cancelled) return
        setSummary(s)
        setReviews(list)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [targetType, targetId])

  const alreadyReviewed = reviews?.some((rev) => rev.authorUserId === session?.userId)
  const canRespond = isSeller || isServiceProvider

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await reviewApi.create({
        targetType,
        targetId,
        rating: Number(form.rating),
        title: form.title.trim() || null,
        comment: form.comment.trim() || null,
      })
      setForm({ rating: '5', title: '', comment: '' })
      setWriting(false)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const respond = async (id) => {
    const text = window.prompt(r.respondPrompt)
    if (!text) return
    setBusy(true)
    setError(null)
    try {
      await reviewApi.respond(id, text)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel glass">
      <div className="panel-head">
        <h2 className="panel-sub">{r.title}</h2>
        {!alreadyReviewed && !writing ? (
          <button className="btn btn-ghost btn-sm" onClick={() => setWriting(true)}>
            <Icon name="pen" /> {r.write}
          </button>
        ) : null}
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {summary && summary.count > 0 ? (
        <div className="review-summary">
          <div className="review-avg">
            <b>{summary.averageRating.toFixed(1)}</b>
            <Stars value={summary.averageRating} />
            <span className="profile-meta">{r.count(summary.count)}</span>
          </div>
          {summary.badge ? <span className="chip" data-tone="accent">{r.badges[summary.badge] ?? summary.badge}</span> : null}
        </div>
      ) : null}

      {writing ? (
        <form className="panel-inset" onSubmit={submit}>
          <Field label={r.rating}>
            <Select
              value={form.rating}
              onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
              options={[5, 4, 3, 2, 1].map((n) => [String(n), `${n} ★`])}
            />
          </Field>
          <Field label={r.reviewTitle} hint={c.optional}>
            <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field label={r.comment} hint={c.optional}>
            <textarea className="input" rows={3} value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} />
          </Field>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setWriting(false)} disabled={busy}>
              {c.cancel}
            </button>
            <button className="btn btn-primary btn-sm" disabled={busy}>
              {busy ? r.submitting : r.submit}
            </button>
          </div>
        </form>
      ) : null}

      {!reviews ? (
        <Spinner />
      ) : reviews.length === 0 ? (
        <p className="profile-meta">{r.none}</p>
      ) : (
        <ul className="review-list">
          {reviews.map((rev) => (
            <li key={rev.id} className="review-item">
              <div className="review-top">
                <Stars value={rev.rating} />
                <span className="profile-meta">{formatDate(rev.createdAt, lang)}</span>
              </div>
              {rev.title ? <b>{rev.title}</b> : null}
              {rev.comment ? <p className="review-comment">{rev.comment}</p> : null}
              {rev.response ? (
                <div className="review-response">
                  <Icon name="chat" /> <span>{rev.response.text}</span>
                </div>
              ) : canRespond ? (
                <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => respond(rev.id)}>
                  <Icon name="chat" /> {r.respond}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
