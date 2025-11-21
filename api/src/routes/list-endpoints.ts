import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { endpoints, webhooks, sessions } from '@/db/schema'
import { db } from '@/db'
import { desc, sql, eq } from 'drizzle-orm'
import { env } from '@/env'

export const listEndpoints: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/endpoints',
    {
      schema: {
        summary: 'List all webhook endpoints',
        tags: ['Endpoints'],
        response: {
          200: z.object({
            endpoints: z.array(
              z.object({
                id: z.string(),
                slug: z.string(),
                url: z.string(),
                webhookCount: z.number(),
                createdAt: z.coerce.date(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        let sessionSlug = request.cookies.session_slug
        if (!sessionSlug) {
          return reply.send({ endpoints: [] })
        }

        const unsigned = request.unsignCookie(sessionSlug)
        if (!unsigned.valid || !unsigned.value) {
          return reply.send({ endpoints: [] })
        }
        sessionSlug = unsigned.value

        const session = await db.query.sessions.findFirst({
          where: eq(sessions.slug, sessionSlug),
        })

        if (!session) {
          return reply.send({ endpoints: [] })
        }

        const result = await db
          .select({
            id: endpoints.id,
            slug: endpoints.slug,
            createdAt: endpoints.createdAt,
            webhookCount: sql<number>`count(${webhooks.id})`.as(
              'webhook_count',
            ),
          })
          .from(endpoints)
          .leftJoin(webhooks, sql`${webhooks.endpointId} = ${endpoints.id}`)
          .where(eq(endpoints.sessionId, session.id))
          .groupBy(endpoints.id, endpoints.slug, endpoints.createdAt)
          .orderBy(desc(endpoints.createdAt))

        const endpointsList = Array.isArray(result)
          ? result.map((endpoint) => ({
              id: endpoint.id,
              slug: endpoint.slug,
              url: `${env.BASE_URL}/${endpoint.slug}`,
              webhookCount: Number(endpoint.webhookCount) || 0,
              createdAt: endpoint.createdAt,
            }))
          : []

        return reply.send({ endpoints: endpointsList })
      } catch (error) {
        return reply.send({ endpoints: [] })
      }
    },
  )
}
