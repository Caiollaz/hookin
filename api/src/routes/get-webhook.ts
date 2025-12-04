import { db } from '@/db'
import { webhooks } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { decrypt } from '@/utils/encryption'

export const getWebhook: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/webhooks/:id',
    {
      schema: {
        summary: 'Get a specific webhook by ID',
        tags: ['Webhooks'],
        params: z.object({
          id: z.uuidv7(),
        }),
        response: {
          200: createSelectSchema(webhooks).extend({
            queryParams: z.record(z.string(), z.string()).nullable(),
            headers: z.record(z.string(), z.string()),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const result = await db
        .select()
        .from(webhooks)
        .where(eq(webhooks.id, id))
        .limit(1)

      if (result.length === 0) {
        return reply.status(404).send({ message: 'Webhook not found.' })
      }

      const webhook = result[0]

      return reply.send({
        ...webhook,
        body: webhook.body ? decrypt(webhook.body) : null,
        headers: JSON.parse(decrypt(webhook.headers)),
        queryParams: webhook.queryParams
          ? JSON.parse(decrypt(webhook.queryParams))
          : null,
      })
    },
  )
}
