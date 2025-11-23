import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getSessionSlug } from '@/utils/session'
import { wsManager } from '@/utils/websocket-manager'

export const wsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get('/ws', { websocket: true }, (connection, req) => {
    const sessionSlug = getSessionSlug(req)

    if (!sessionSlug) {
      connection.socket.close(1008, 'Unauthorized')
      return
    }

    const ws = connection.socket || connection
    wsManager.addConnection(sessionSlug, ws)
  })
}
