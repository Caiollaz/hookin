import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { endpoints, webhooks } from '@/db/schema'
import { db } from '@/db'
import { eq, desc, lt, and } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { env } from '@/env'

export const getEndpoint: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/endpoints/:slug',
    {
      schema: {
        summary: 'Get endpoint details with webhooks',
        tags: ['Endpoints'],
        params: z.object({
          slug: z.string(),
        }),
        querystring: z.object({
          limit: z.coerce.number().min(1).max(100).default(20),
          cursor: z.string().optional(),
        }),
        response: {
          200: z.object({
            id: z.string(),
            slug: z.string(),
            url: z.string(),
            createdAt: z.coerce.date(),
            webhooks: z.array(
              createSelectSchema(webhooks).pick({
                id: true,
                method: true,
                pathname: true,
                createdAt: true,
              })
            ),
            nextCursor: z.string().nullable(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params
      const { limit, cursor } = request.query

      const endpointResult = await db
        .select()
        .from(endpoints)
        .where(eq(endpoints.slug, slug))
        .limit(1)

      if (endpointResult.length === 0) {
        return reply.status(404).send({ message: 'Endpoint not found.' })
      }

      const endpoint = endpointResult[0]

      const conditions = [eq(webhooks.endpointId, endpoint.id)]
      if (cursor) {
        conditions.push(lt(webhooks.id, cursor))
      }

      const webhooksResult = await db
        .select({
          id: webhooks.id,
          method: webhooks.method,
          pathname: webhooks.pathname,
          createdAt: webhooks.createdAt,
        })
        .from(webhooks)
        .where(and(...conditions))
        .orderBy(desc(webhooks.createdAt))
        .limit(limit + 1)

      const hasMore = webhooksResult.length > limit
      const items = hasMore ? webhooksResult.slice(0, limit) : webhooksResult
      const nextCursor = hasMore ? items[items.length - 1].id : null

      return reply.send({
        id: endpoint.id,
        slug: endpoint.slug,
        url: `${env.BASE_URL}/${endpoint.slug}`,
        createdAt: endpoint.createdAt,
        webhooks: items,
        nextCursor,
      })
    },
  )
}

