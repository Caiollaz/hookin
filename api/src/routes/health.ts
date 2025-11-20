import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const health: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/health',
    {
      schema: {
        summary: 'Health check endpoint',
        tags: ['Health'],
        response: {
          200: z.object({
            status: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
    async () => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      }
    },
  )
}
