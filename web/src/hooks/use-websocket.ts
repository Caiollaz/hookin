import { useEffect, useRef } from 'react'
import { API_URL } from '../config'

type WebSocketMessage = {
  type: 'new_webhook'
  webhook: any
}

type WebSocketHandler = (message: WebSocketMessage) => void

export function useWebSocket(onMessage: WebSocketHandler) {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const handlerRef = useRef(onMessage)

  // Keep handler fresh
  useEffect(() => {
    handlerRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    function connect() {
      const wsUrl = API_URL.replace(/^http/, 'ws') + '/ws'
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handlerRef.current(data)
        } catch (err) {
          console.error('Failed to parse WebSocket message', err)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...')
        wsRef.current = null
        reconnectTimeoutRef.current = setTimeout(connect, 3000)
      }

      ws.onerror = (err) => {
        console.error('WebSocket error', err)
        ws.close()
      }

      wsRef.current = ws
    }

    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])
}
