import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { endpoints } from '@/db/schema'
import { db } from '@/db'
import { generateUniqueSlug } from '@/utils/slug-generator'
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
        },
      },
    },
    async (request, reply) => {
      const slug = await generateUniqueSlug()

      const result = await db
        .insert(endpoints)
        .values({
          slug,
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

