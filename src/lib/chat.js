/* SignalR connection to the MessagingService chat hub.
   The hub authenticates via the access token in the query string (WebSockets
   can't set an Authorization header), so we use accessTokenFactory +
   skipNegotiation to connect straight over WebSocket. */

import { useEffect, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { getSession } from './api'

export function useChat(onMessage) {
  const onMessageRef = useRef(onMessage)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    if (!getSession()?.accessToken) return undefined

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/api/messages/hub', {
        accessTokenFactory: () => getSession()?.accessToken ?? '',
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .build()

    connection.on('ReceiveMessage', (message) => {
      onMessageRef.current?.(message)
    })

    let cancelled = false
    connection
      .start()
      .then(() => {
        if (!cancelled) setConnected(true)
      })
      .catch(() => {
        if (!cancelled) setConnected(false)
      })

    return () => {
      cancelled = true
      connection.stop()
    }
  }, [])

  return { connected }
}
