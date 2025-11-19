import { z } from 'zod'

export const endpointSchema = z.object({
  id: z.string(),
  slug: z.string(),
  url: z.string(),
  webhookCount: z.number().optional(),
  createdAt: z.coerce.date(),
})

export const endpointListSchema = z.object({
  endpoints: z.array(endpointSchema),
})

export const endpointDetailSchema = z.object({
  id: z.string(),
  slug: z.string(),
  url: z.string(),
  createdAt: z.coerce.date(),
  webhooks: z.array(
    z.object({
      id: z.string(),
      method: z.string(),
      pathname: z.string(),
      createdAt: z.coerce.date(),
    })
  ),
  nextCursor: z.string().nullable(),
})

export const createEndpointResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  url: z.string(),
})

