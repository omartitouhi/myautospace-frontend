import { useEffect, useRef, useState } from 'react'
import { useUI } from '../../lib/ui'
import { mediaApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'
import { Alert, Spinner } from './ui'

/* A file-picker button that uploads to MediaService and reports the asset. */
export function UploadButton({
  accept = 'image/*',
  label,
  busyLabel,
  relatedEntityType = null,
  relatedEntityId = null,
  onUploaded,
  onError,
  className = 'btn btn-ghost btn-sm',
}) {
  const { t } = useUI()
  const m = t.app.media
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const pick = () => inputRef.current?.click()

  const onChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const asset = await mediaApi.upload(file, { relatedEntityType, relatedEntityId })
      onUploaded?.(asset)
    } catch (err) {
      onError?.(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={onChange} />
      <button type="button" className={className} onClick={pick} disabled={busy}>
        <Icon name="cam" /> {busy ? (busyLabel ?? m.uploading) : (label ?? m.upload)}
      </button>
    </>
  )
}

/* Manage the gallery for an entity (a vehicle/provider). When `readOnly`,
   renders the images only (used on public detail pages). */
export function EntityGallery({ entityType, entityId, readOnly = false }) {
  const { t } = useUI()
  const m = t.app.media
  const c = t.app.common
  const [assets, setAssets] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    mediaApi
      .byEntity(entityId, entityType)
      .then((data) => {
        if (!cancelled) setAssets(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [entityId, entityType])

  const onUploaded = (asset) => setAssets((prev) => [...(prev ?? []), asset])

  const remove = async (id) => {
    if (!window.confirm(m.deleteConfirm)) return
    setBusy(true)
    setError(null)
    try {
      await mediaApi.remove(id)
      setAssets((prev) => (prev ?? []).filter((a) => a.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!assets && !error) return <Spinner />

  return (
    <>
      {error ? <Alert>{error}</Alert> : null}
      {assets && assets.length > 0 ? (
        <div className="gallery-grid">
          {assets.map((a) => (
            <figure key={a.id} className="gallery-item">
              <img src={a.url} alt={a.fileName} loading="lazy" />
              {!readOnly ? (
                <button className="icon-btn gallery-del" aria-label={c.delete} disabled={busy} onClick={() => remove(a.id)}>
                  <Icon name="x" />
                </button>
              ) : null}
            </figure>
          ))}
        </div>
      ) : readOnly ? null : (
        <p className="profile-meta">{m.noPhotos}</p>
      )}
      {!readOnly ? (
        <UploadButton
          relatedEntityType={entityType}
          relatedEntityId={entityId}
          label={m.addPhoto}
          onUploaded={onUploaded}
          onError={setError}
        />
      ) : null}
    </>
  )
}
