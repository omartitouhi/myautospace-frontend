import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useUI } from '../../lib/ui'
import { useAuth } from '../../lib/auth'
import { messageApi } from '../../lib/api'
import { useChat } from '../../lib/chat'
import { Icon } from '../../lib/Icon'
import { timeAgo } from '../../lib/format'
import { Alert, EmptyState, PageHead, Spinner } from '../../components/app/ui'

export function Messages() {
  const { t, lang } = useUI()
  const { session } = useAuth()
  const m = t.app.messages
  const c = t.app.common
  const [params, setParams] = useSearchParams()
  const [conversations, setConversations] = useState(null)
  const [activeId, setActiveId] = useState(params.get('c') || null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const threadRef = useRef(null)

  const loadConversations = () =>
    messageApi.conversations().then(setConversations).catch((err) => setError(err.message))

  useEffect(() => {
    let cancelled = false
    messageApi
      .conversations()
      .then((data) => {
        if (cancelled) return
        setConversations(data)
        if (!activeId && data.length > 0) setActiveId(data[0].id)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load the active thread and mark it read.
  useEffect(() => {
    if (!activeId) return undefined
    let cancelled = false
    messageApi
      .messages(activeId)
      .then((data) => {
        if (cancelled) return
        setMessages(data)
        messageApi.markRead(activeId).then(loadConversations).catch(() => {})
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [activeId])

  // Real-time: append incoming messages for the open conversation; refresh list.
  const { connected } = useChat((message) => {
    if (message.conversationId === activeId) {
      setMessages((prev) => [...prev, message])
      messageApi.markRead(activeId).catch(() => {})
    }
    loadConversations()
  })

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight })
  }, [messages])

  const selectConversation = (id) => {
    setActiveId(id)
    setParams({ c: id })
  }

  const send = async (e) => {
    e.preventDefault()
    const body = draft.trim()
    if (!body || !activeId) return
    setBusy(true)
    setError(null)
    try {
      const message = await messageApi.send(activeId, { body, attachmentUrl: null })
      setMessages((prev) => [...prev, message])
      setDraft('')
      loadConversations()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const report = async (messageId) => {
    const reason = window.prompt(m.reportPrompt)
    if (!reason) return
    try {
      await messageApi.report(messageId, reason)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!conversations) return <Spinner label={c.loading} />

  const active = conversations.find((conv) => conv.id === activeId)

  return (
    <>
      <PageHead title={m.title} sub={connected ? m.online : m.connecting} />
      {error ? <Alert>{error}</Alert> : null}

      {conversations.length === 0 ? (
        <EmptyState icon="chat" title={m.none} hint={m.noneHint} />
      ) : (
        <div className="chat-layout">
          <aside className="chat-list glass">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                className="chat-conv"
                data-on={conv.id === activeId ? '1' : '0'}
                onClick={() => selectConversation(conv.id)}
              >
                <span className="chat-conv-ava">
                  <Icon name="user" />
                </span>
                <span className="chat-conv-main">
                  <b>{m.party}</b>
                  <span className="chat-conv-last">{conv.lastMessagePreview || '—'}</span>
                </span>
                {conv.unreadCount > 0 ? <span className="chat-unread">{conv.unreadCount}</span> : null}
              </button>
            ))}
          </aside>

          <section className="chat-thread glass">
            {active ? (
              <>
                <div className="chat-messages" ref={threadRef}>
                  {messages.map((msg) => {
                    const mine = msg.senderUserId === session?.userId
                    return (
                      <div key={msg.id} className={mine ? 'chat-msg mine' : 'chat-msg'}>
                        <div className="chat-bubble">
                          {msg.body}
                          {msg.attachmentUrl ? (
                            <a className="chat-attach" href={msg.attachmentUrl} target="_blank" rel="noreferrer">
                              <Icon name="doc" /> {m.attachment}
                            </a>
                          ) : null}
                        </div>
                        <div className="chat-meta">
                          {timeAgo(msg.createdAt, lang)}
                          {!mine ? (
                            <button className="chat-report" onClick={() => report(msg.id)}>
                              {m.report}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <form className="chat-compose" onSubmit={send}>
                  <input
                    className="input"
                    placeholder={m.placeholder}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button className="btn btn-primary" disabled={busy || !draft.trim()}>
                    <Icon name="arrow" />
                  </button>
                </form>
              </>
            ) : (
              <EmptyState icon="chat" title={m.selectConversation} />
            )}
          </section>
        </div>
      )}
    </>
  )
}
