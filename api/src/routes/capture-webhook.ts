import { db } from '@/db'
import { endpoints, webhooks } from '@/db/schema'
import { eq, inArray, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { wsManager } from '@/utils/websocket-manager'
import { sessions } from '@/db/schema'

const MAX_WEBHOOKS_PER_ENDPOINT = 100

export const captureWebhook: FastifyPluginAsyncZod = async (app) => {
  app.route({
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
    url: '*',
    schema: {
      summary: 'Capture incoming webhook requests',
      tags: ['External'],
      hide: true,
      response: {
        201: z.object({ id: z.string() }),
        404: z.object({ message: z.string() }),
      },
    },
    handler: async (request, reply) => {
      const url = new URL(request.url, `http://${request.headers.host}`)
      const fullPathname = url.pathname

      if (
        fullPathname.startsWith('/api/') ||
        fullPathname.startsWith('/docs') ||
        fullPathname === '/'
      ) {
        return reply.callNotFound()
      }

      const pathParts = fullPathname.split('/').filter(Boolean)
      if (pathParts.length === 0) {
        return reply.status(404).send({ message: 'Endpoint not found.' })
      }

      const slug = pathParts[0]
      const subpath =
        pathParts.length > 1 ? '/' + pathParts.slice(1).join('/') : '/'

      const endpointResult = await db
        .select()
        .from(endpoints)
        .where(eq(endpoints.slug, slug))
        .limit(1)

      if (endpointResult.length === 0) {
        return reply.status(404).send({ message: 'Endpoint not found.' })
      }

      const endpoint = endpointResult[0]

      const method = request.method
      const ip = request.ip
      const contentType = request.headers['content-type']
      const contentLength = request.headers['content-length']
        ? Number(request.headers['content-length'])
        : null

      let body: string | null = null

      if (request.body) {
        body =
          typeof request.body === 'string'
            ? request.body
            : JSON.stringify(request.body, null, 2)
      }

      const headers = Object.fromEntries(
        Object.entries(request.headers).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(', ') : value || '',
        ]),
      )

      const queryParams = Object.fromEntries(url.searchParams.entries())

      const countResult = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(webhooks)
        .where(eq(webhooks.endpointId, endpoint.id))

      const currentCount = Number(countResult[0]?.count || 0)

      const result = await db.transaction(async (tx) => {
        if (currentCount >= MAX_WEBHOOKS_PER_ENDPOINT) {
          const toDelete = currentCount - MAX_WEBHOOKS_PER_ENDPOINT + 1

          const oldestWebhooks = await tx
            .select({ id: webhooks.id })
            .from(webhooks)
            .where(eq(webhooks.endpointId, endpoint.id))
            .orderBy(webhooks.createdAt)
            .limit(toDelete)

          if (oldestWebhooks.length > 0) {
            const idsToDelete = oldestWebhooks.map((w) => w.id)
            await tx.delete(webhooks).where(inArray(webhooks.id, idsToDelete))
          }
        }

        const insertResult = await tx
          .insert(webhooks)
          .values({
            endpointId: endpoint.id,
            method,
            ip,
            contentType,
            contentLength,
            body,
            headers,
            pathname: subpath,
            queryParams:
              Object.keys(queryParams).length > 0 ? queryParams : null,
          })
          .returning()

        return insertResult[0]
      })

      // Broadcast to session owner
      const sessionResult = await db
        .select({ slug: sessions.slug })
        .from(sessions)
        .where(eq(sessions.id, endpoint.sessionId))
        .limit(1)

      if (sessionResult.length > 0) {
        wsManager.broadcast(sessionResult[0].slug, {
          type: 'new_webhook',
          webhook: result,
        })
      }

      return reply.status(201).send({ id: result.id })
    },
  })
}
