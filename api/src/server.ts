import fastifyCookie from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'
import fastifyWebsocket from '@fastify/websocket'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './env'
import { captureWebhook } from './routes/capture-webhook'
import { createEndpoint } from './routes/create-endpoint'
import { deleteWebhook } from './routes/delete-webhook'
import { getEndpoint } from './routes/get-endpoint'
import { getWebhook } from './routes/get-webhook'
import { health } from './routes/health'
import { initSession } from './routes/init-session'
import { wsRoute } from './routes/ws'
import { listEndpoints } from './routes/list-endpoints'
import { listWebhooks } from './routes/list-webhooks'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
})

app.register(fastifyCookie, {
  secret: env.COOKIE_SECRET,
  hook: 'onRequest',
})

app.register(fastifyWebsocket)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Webhook Inspector API',
      description: 'API for capturing and inspecting webhook requests',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(ScalarApiReference, {
  routePrefix: '/docs',
})

app.register(health)
app.register(wsRoute)
app.register(initSession)
app.register(listWebhooks)
app.register(getWebhook)
app.register(deleteWebhook)
app.register(createEndpoint)
app.register(listEndpoints)
app.register(getEndpoint)
app.register(captureWebhook)

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`🔥 HTTP server running on http://localhost:${env.PORT}`)
  console.log(`📚 Docs available at http://localhost:${env.PORT}/docs`)
})
