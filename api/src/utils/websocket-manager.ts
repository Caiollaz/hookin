import type { WebSocket } from 'ws'

type SessionSlug = string

class WebSocketManager {
  private connections: Map<SessionSlug, Set<WebSocket>> = new Map()

  addConnection(sessionSlug: SessionSlug, ws: WebSocket) {
    if (!ws) {
      console.error('Attempted to add undefined connection for', sessionSlug)
      return
    }
    
    if (!this.connections.has(sessionSlug)) {
      this.connections.set(sessionSlug, new Set())
    }
    this.connections.get(sessionSlug)?.add(ws)

    if (typeof ws.on === 'function') {
      ws.on('close', () => {
        this.removeConnection(sessionSlug, ws)
      })
    } else {
      console.warn('WebSocket connection missing .on method', ws)
    }
  }

  removeConnection(sessionSlug: SessionSlug, ws: WebSocket) {
    const connections = this.connections.get(sessionSlug)
    if (connections) {
      connections.delete(ws)
      if (connections.size === 0) {
        this.connections.delete(sessionSlug)
      }
    }
  }

  broadcast(sessionSlug: SessionSlug, message: any) {
    const connections = this.connections.get(sessionSlug)
    if (connections) {
      const payload = JSON.stringify(message)
      for (const ws of connections) {
        if (!ws) {
            console.error('Found undefined connection in set for', sessionSlug)
            continue
        }
        if (ws.readyState === 1) { // WebSocket.OPEN is 1
          ws.send(payload)
        }
      }
    }
  }
}

export const wsManager = new WebSocketManager()
