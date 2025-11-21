import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { endpoints, sessions } from '@/db/schema'
import { db } from '@/db'
import { generateUniqueSlug } from '@/utils/slug-generator'
import { eq } from 'drizzle-orm'
import { env } from '@/env'

export const createEndpoint: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/api/endpoints',
    {
      schema: {
        summary: 'Create a new webhook endpoint',
        tags: ['Endpoints'],
        response: {
          201: z.object({
            id: z.string(),
            slug: z.string(),
            url: z.string(),
          }),
          401: z.null(),
        },
      },
    },
    async (request, reply) => {
      let sessionSlug = request.cookies.session_slug
      if (!sessionSlug) {
        return reply.status(401).send()
      }

      const unsigned = request.unsignCookie(sessionSlug)
      if (!unsigned.valid || !unsigned.value) {
        return reply.status(401).send()
      }
      sessionSlug = unsigned.value

      const session = await db.query.sessions.findFirst({
        where: eq(sessions.slug, sessionSlug),
      })

      if (!session) {
        return reply.status(401).send()
      }

      const slug = await generateUniqueSlug()

      const result = await db
        .insert(endpoints)
        .values({
          slug,
          sessionId: session.id,
        })
        .returning()

      const endpoint = result[0]
      const url = `${env.BASE_URL}/${endpoint.slug}`

      return reply.status(201).send({
        id: endpoint.id,
        slug: endpoint.slug,
        url,
      })
    },
  )
}
