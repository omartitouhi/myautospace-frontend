import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { messageApi } from '../../lib/api'
import { Icon } from '../../lib/Icon'

/* Starts (or reuses) a conversation with another user and opens the chat. */
export function ContactButton({ otherUserId, vehicleId = null, label, className = 'btn btn-ghost contact-btn' }) {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  const contact = async () => {
    setBusy(true)
    try {
      const conversation = await messageApi.startConversation({ otherUserId, vehicleId })
      navigate(`/app/messages?c=${conversation.id}`)
    } catch {
      setBusy(false)
    }
  }

  return (
    <button type="button" className={className} disabled={busy} onClick={contact}>
      <Icon name="chat" /> {label}
    </button>
  )
}
