import { db } from '@/db'
import { sessions } from '@/db/schema'
import { env } from '@/env'
import { addHours, isPast } from 'date-fns'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { uuidv7 } from 'uuidv7'
import { z } from 'zod'
import { generateSlug } from 'random-word-slugs'

export const initSession: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/api/init',
    {
      schema: {
        summary: 'Initialize session',
        tags: ['Session'],
        response: {
          200: z.object({
            slugData: z.object({
              slug: z.string(),
              share_pin: z.string(),
              is_shared: z.boolean(),
              is_pending_delete: z.boolean(),
              created_at: z.coerce.date(),
              expires_at: z.coerce.date(),
            }),
            role: z.enum(['owner', 'guest']),
            authData: z.object({
              owner: z.array(z.string()),
              guest: z.array(z.string()),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      let sessionSlug = request.cookies.session_slug
      if (sessionSlug) {
        const unsigned = request.unsignCookie(sessionSlug)
        if (unsigned.valid && unsigned.value) {
          sessionSlug = unsigned.value
        } else {
          sessionSlug = undefined
        }
      }

      if (sessionSlug) {
        const existingSession = await db.query.sessions.findFirst({
          where: eq(sessions.slug, sessionSlug),
        })

        if (existingSession && !isPast(existingSession.expiresAt)) {
          return reply.send({
            slugData: {
              slug: existingSession.slug,
              share_pin: existingSession.sharePin,
              is_shared: existingSession.isShared,
              is_pending_delete: existingSession.isPendingDelete,
              created_at: existingSession.createdAt,
              expires_at: existingSession.expiresAt,
            },
            role: 'owner',
            authData: {
              owner: [existingSession.slug],
              guest: [],
            },
          })
        }
      }

      // Create new session
      const slug = generateSlug()
      const sharePin = Math.random().toString(36).substring(2, 10)
      const expiresAt = addHours(new Date(), 24) // 24 hours TTL

      const [newSession] = await db
        .insert(sessions)
        .values({
          slug,
          sharePin,
          expiresAt,
        })
        .returning()

      reply.setCookie('session_slug', slug, {
        path: '/',
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        signed: true,
        expires: expiresAt,
      })

      return reply.send({
        slugData: {
          slug: newSession.slug,
          share_pin: newSession.sharePin,
          is_shared: newSession.isShared,
          is_pending_delete: newSession.isPendingDelete,
          created_at: newSession.createdAt,
          expires_at: newSession.expiresAt,
        },
        role: 'owner',
        authData: {
          owner: [newSession.slug],
          guest: [],
        },
      })
    },
  )
}
