import { db } from '@/db'
import { webhooks, endpoints } from '@/db/schema'
import { desc, lt, eq, and } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const listWebhooks: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/webhooks',
    {
      schema: {
        summary: 'List webhooks',
        tags: ['Webhooks'],
        querystring: z.object({
          limit: z.coerce.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
          endpoint: z.string().optional(),
        }),
        response: {
          200: z.object({
            webhooks: z.array(
              createSelectSchema(webhooks).pick({
                id: true,
                method: true,
                pathname: true,
                createdAt: true,
              }),
            ),
            nextCursor: z.string().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { limit, cursor, endpoint: endpointSlug } = request.query

      let endpointId: string | undefined

      if (endpointSlug) {
        const endpointResult = await db
          .select({ id: endpoints.id })
          .from(endpoints)
          .where(eq(endpoints.slug, endpointSlug))
          .limit(1)

        if (endpointResult.length === 0) {
          return reply.status(404).send({
            message: 'Endpoint not found.',
            webhooks: [],
            nextCursor: null,
          })
        }

        endpointId = endpointResult[0].id
      }

      const conditions = []
      if (endpointId) {
        conditions.push(eq(webhooks.endpointId, endpointId))
      }
      if (cursor) {
        conditions.push(lt(webhooks.id, cursor))
      }

      const result = await db
        .select({
          id: webhooks.id,
          method: webhooks.method,
          pathname: webhooks.pathname,
          createdAt: webhooks.createdAt,
        })
        .from(webhooks)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(webhooks.id))
        .limit(limit + 1)

      const hasMore = result.length > limit
      const items = hasMore ? result.slice(0, limit) : result
      const nextCursor = hasMore ? items[items.length - 1].id : null

      return reply.send({
        webhooks: items,
        nextCursor,
      })
    },
  )
}
