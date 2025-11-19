import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

export const health: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/health',
    {
      schema: {
        summary: 'Health check endpoint',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
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

