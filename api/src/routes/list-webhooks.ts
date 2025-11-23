import { db } from '@/db'
import { endpoints, sessions, webhooks } from '@/db/schema'
import { getSessionSlug } from '@/utils/session'
import { and, desc, eq, lt } from 'drizzle-orm'
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
          404: z.object({
            message: z.string(),
            webhooks: z
              .array(
                createSelectSchema(webhooks).pick({
                  id: true,
                  method: true,
                  pathname: true,
                  createdAt: true,
                }),
              )
              .default([]),
            nextCursor: z.string().nullable().default(null),
          }),
        },
      },
    },
    async (request, reply) => {
      const { limit, cursor, endpoint: endpointSlug } = request.query

      const sessionSlug = getSessionSlug(request)

      if (!sessionSlug) {
        return reply.status(404).send({
          message: 'Endpoint not found.',
          webhooks: [],
          nextCursor: null,
        })
      }

      const sessionResult = await db
        .select({ id: sessions.id })
        .from(sessions)
        .where(eq(sessions.slug, sessionSlug))
        .limit(1)

      if (sessionResult.length === 0) {
        return reply.status(404).send({
          message: 'Endpoint not found.',
          webhooks: [],
          nextCursor: null,
        })
      }

      const sessionId = sessionResult[0].id

      let endpointId: string | undefined

      if (endpointSlug) {
        const endpointResult = await db
          .select({ id: endpoints.id })
          .from(endpoints)
          .where(
            and(
              eq(endpoints.slug, endpointSlug),
              eq(endpoints.sessionId, sessionId),
            ),
          )
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

      let query = db
        .select({
          id: webhooks.id,
          method: webhooks.method,
          pathname: webhooks.pathname,
          createdAt: webhooks.createdAt,
        })
        .from(webhooks)

      if (endpointId) {
        conditions.push(eq(webhooks.endpointId, endpointId))
      } else {
        // If no specific endpoint is requested, filter by session
        // We need to join with endpoints to check session ownership
        query.innerJoin(endpoints, eq(webhooks.endpointId, endpoints.id))
        conditions.push(eq(endpoints.sessionId, sessionId))
      }

      if (cursor) {
        conditions.push(lt(webhooks.id, cursor))
      }

      const result = await query
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
