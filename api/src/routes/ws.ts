import { getSessionSlug } from '@/utils/session'
import { wsManager } from '@/utils/websocket-manager'
import type { WebSocket } from '@fastify/websocket'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const wsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get('/ws', { websocket: true }, (socket: WebSocket, req) => {
    const sessionSlug = getSessionSlug(req)

    if (!sessionSlug) {
      socket.close(1008, 'Unauthorized')
      return
    }

    wsManager.addConnection(sessionSlug, socket)

    socket.on('close', () => {
      wsManager.removeConnection(sessionSlug, socket)
    })

    socket.on('error', (err: Error) => {
      app.log.error({ err, sessionSlug }, 'WebSocket error')
      wsManager.removeConnection(sessionSlug, socket)
    })
  })
}
