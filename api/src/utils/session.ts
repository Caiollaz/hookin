import type { FastifyRequest } from 'fastify'

export function getSessionSlug(request: FastifyRequest): string | undefined {
  let sessionSlug = request.cookies.session_slug
  if (sessionSlug) {
    const unsigned = request.unsignCookie(sessionSlug)
    if (unsigned.valid && unsigned.value) {
      sessionSlug = unsigned.value
    } else {
      sessionSlug = undefined
    }
  }
  return sessionSlug
}
