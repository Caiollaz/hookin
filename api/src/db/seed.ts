import { faker } from '@faker-js/faker'
import { db } from '.'
import { webhooks, endpoints, sessions } from './schema'
import { generateUniqueSlug } from '../utils/slug-generator'
import { addHours } from 'date-fns'

// Eventos comuns do Stripe
const stripeEvents = [
  'charge.succeeded',
  'charge.failed',
  'charge.refunded',
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.created',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.created',
  'invoice.finalized',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'checkout.session.completed',
  'checkout.session.expired',
  'payment_method.attached',
  'payment_method.detached',
]

// Eventos do GitHub
const githubEvents = [
  'push',
  'pull_request',
  'issues',
  'issue_comment',
  'release',
  'create',
  'delete',
  'fork',
  'star',
  'watch',
]

// Eventos do Shopify
const shopifyEvents = [
  'orders/create',
  'orders/updated',
  'orders/paid',
  'orders/cancelled',
  'orders/fulfilled',
  'products/create',
  'products/update',
  'customers/create',
  'customers/update',
]

function generateStripeWebhook(endpointId: string) {
  const eventType = faker.helpers.arrayElement(stripeEvents)
  const amount = faker.number.int({ min: 1000, max: 50000 })
  const currency = faker.helpers.arrayElement(['usd', 'eur', 'brl'])

  const body = {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: 'event',
    api_version: '2023-10-16',
    created: faker.date.recent({ days: 30 }).getTime() / 1000,
    type: eventType,
    data: {
      object: {
        id: eventType.includes('charge')
          ? `ch_${faker.string.alphanumeric(24)}`
          : eventType.includes('payment_intent')
            ? `pi_${faker.string.alphanumeric(24)}`
            : eventType.includes('invoice')
              ? `in_${faker.string.alphanumeric(24)}`
              : eventType.includes('customer')
                ? `cus_${faker.string.alphanumeric(14)}`
                : `cs_${faker.string.alphanumeric(24)}`,
        object: eventType.split('.')[0],
        amount: amount,
        currency: currency,
        customer: `cus_${faker.string.alphanumeric(14)}`,
        description: faker.company.catchPhrase(),
        status: eventType.includes('failed') ? 'failed' : 'succeeded',
        receipt_email: faker.internet.email(),
      },
    },
  }

  const bodyString = JSON.stringify(body, null, 2)

  return {
    endpointId,
    method: 'POST',
    pathname: '/',
    ip: faker.internet.ipv4(),
    statusCode: faker.helpers.arrayElement([200, 200, 200, 200, 500]),
    contentType: 'application/json',
    contentLength: Buffer.byteLength(bodyString),
    queryParams: null,
    headers: JSON.stringify({
      'content-type': 'application/json',
      'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${faker.string.alphanumeric(64)}`,
      'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
      accept: '*/*',
      'accept-encoding': 'gzip, deflate',
    }),
    body: bodyString,
    createdAt: faker.date.recent({ days: 30 }),
  }
}

function generateGitHubWebhook(endpointId: string) {
  const eventType = faker.helpers.arrayElement(githubEvents)
  const action = faker.helpers.arrayElement([
    'opened',
    'closed',
    'created',
    'updated',
    'deleted',
  ])

  const body = {
    action,
    repository: {
      id: faker.number.int({ min: 100000, max: 999999 }),
      name: faker.internet.domainWord(),
      full_name: `${faker.internet.username()}/${faker.internet.domainWord()}`,
      private: faker.datatype.boolean(),
      html_url: `https://github.com/${faker.internet.username()}/${faker.internet.domainWord()}`,
      description: faker.lorem.sentence(),
      created_at: faker.date.past().toISOString(),
      updated_at: faker.date.recent().toISOString(),
      pushed_at: faker.date.recent().toISOString(),
    },
    sender: {
      login: faker.internet.username(),
      id: faker.number.int({ min: 1000, max: 99999 }),
      avatar_url: faker.image.avatar(),
    },
  }

  const bodyString = JSON.stringify(body, null, 2)

  return {
    endpointId,
    method: 'POST',
    pathname: '/',
    ip: faker.internet.ipv4(),
    statusCode: 200,
    contentType: 'application/json',
    contentLength: Buffer.byteLength(bodyString),
    queryParams: null,
    headers: JSON.stringify({
      'content-type': 'application/json',
      'x-github-event': eventType,
      'x-github-delivery': faker.string.uuid(),
      'x-hub-signature-256': `sha256=${faker.string.alphanumeric(64)}`,
      'user-agent': 'GitHub-Hookshot/1.0',
    }),
    body: bodyString,
    createdAt: faker.date.recent({ days: 30 }),
  }
}

function generateShopifyWebhook(endpointId: string) {
  const eventType = faker.helpers.arrayElement(shopifyEvents)
  const shopDomain = `${faker.internet.domainWord()}.myshopify.com`

  const body = {
    id: faker.number.int({ min: 1000000, max: 9999999 }),
    email: faker.internet.email(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    number: faker.number.int({ min: 1, max: 10000 }),
    note: faker.lorem.sentence(),
    token: faker.string.alphanumeric(32),
    gateway: 'shopify_payments',
    test: faker.datatype.boolean(),
    total_price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
    subtotal_price: faker.number.float({
      min: 10,
      max: 1000,
      fractionDigits: 2,
    }),
    total_weight: faker.number.int({ min: 0, max: 5000 }),
    total_tax: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
    currency: faker.helpers.arrayElement(['USD', 'EUR', 'BRL']),
    financial_status: faker.helpers.arrayElement([
      'paid',
      'pending',
      'refunded',
    ]),
    fulfillment_status: faker.helpers.arrayElement([
      'fulfilled',
      'partial',
      'unfulfilled',
      null,
    ]),
    line_items: Array.from(
      { length: faker.number.int({ min: 1, max: 5 }) },
      () => ({
        id: faker.number.int({ min: 100000, max: 999999 }),
        title: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 10 }),
        price: faker.number.float({ min: 5, max: 500, fractionDigits: 2 }),
      }),
    ),
  }

  const bodyString = JSON.stringify(body, null, 2)

  return {
    endpointId,
    method: 'POST',
    pathname: '/',
    ip: faker.internet.ipv4(),
    statusCode: 200,
    contentType: 'application/json',
    contentLength: Buffer.byteLength(bodyString),
    queryParams: null,
    headers: JSON.stringify({
      'content-type': 'application/json',
      'x-shopify-shop-domain': shopDomain,
      'x-shopify-hmac-sha256': faker.string.alphanumeric(64),
      'x-shopify-topic': eventType,
      'x-shopify-webhook-id': faker.string.uuid(),
    }),
    body: bodyString,
    createdAt: faker.date.recent({ days: 30 }),
  }
}

function generateGenericWebhook(endpointId: string) {
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  const method = faker.helpers.arrayElement(methods)
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method)

  const body = hasBody
    ? {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        message: faker.lorem.paragraph(),
        timestamp: new Date().toISOString(),
        data: {
          value: faker.number.int({ min: 1, max: 1000 }),
          status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
        },
      }
    : null

  const bodyString = body ? JSON.stringify(body, null, 2) : null

  return {
    endpointId,
    method,
    pathname: faker.helpers.arrayElement([
      '/',
      '/api',
      '/webhook',
      '/callback',
      '/notify',
    ]),
    ip: faker.internet.ipv4(),
    statusCode: faker.helpers.arrayElement([200, 201, 400, 404, 500]),
    contentType: hasBody ? 'application/json' : null,
    contentLength: bodyString ? Buffer.byteLength(bodyString) : null,
    queryParams: faker.datatype.boolean()
      ? JSON.stringify({
          id: faker.string.uuid(),
          token: faker.string.alphanumeric(32),
        })
      : null,
    headers: JSON.stringify({
      'user-agent': faker.internet.userAgent(),
      accept: '*/*',
      'accept-language': faker.helpers.arrayElement([
        'en-US',
        'pt-BR',
        'es-ES',
      ]),
      ...(hasBody && { 'content-type': 'application/json' }),
    }),
    body: bodyString,
    createdAt: faker.date.recent({ days: 30 }),
  }
}

async function seed() {
  console.log('🌱 Seeding database...')

  // Limpar dados existentes
  await db.delete(webhooks)
  await db.delete(endpoints)

  // Criar sessão padrão
  const sessionSlug = 'demo-session'
  const [session] = await db
    .insert(sessions)
    .values({
      slug: sessionSlug,
      sharePin: 'demo123',
      expiresAt: addHours(new Date(), 24),
    })
    .returning()

  console.log(`✅ Created demo session: ${sessionSlug}`)

  // Criar 5 endpoints mock
  const endpointsData = []
  for (let i = 0; i < 5; i++) {
    const slug = await generateUniqueSlug()
    const endpoint = await db
      .insert(endpoints)
      .values({ slug, sessionId: session.id })
      .returning()
    endpointsData.push(endpoint[0])
  }

  console.log(`✅ Created ${endpointsData.length} endpoints`)

  // Gerar webhooks para cada endpoint
  const webhooksData = []

  // Endpoint 1: Stripe webhooks (20 webhooks)
  for (let i = 0; i < 20; i++) {
    webhooksData.push(generateStripeWebhook(endpointsData[0].id))
  }

  // Endpoint 2: GitHub webhooks (15 webhooks)
  for (let i = 0; i < 15; i++) {
    webhooksData.push(generateGitHubWebhook(endpointsData[1].id))
  }

  // Endpoint 3: Shopify webhooks (15 webhooks)
  for (let i = 0; i < 15; i++) {
    webhooksData.push(generateShopifyWebhook(endpointsData[2].id))
  }

  // Endpoint 4: Generic webhooks (10 webhooks)
  for (let i = 0; i < 10; i++) {
    webhooksData.push(generateGenericWebhook(endpointsData[3].id))
  }

  // Endpoint 5: Mix de webhooks (10 webhooks)
  for (let i = 0; i < 10; i++) {
    const webhookType = faker.helpers.arrayElement([
      'stripe',
      'github',
      'shopify',
      'generic',
    ])
    switch (webhookType) {
      case 'stripe':
        webhooksData.push(generateStripeWebhook(endpointsData[4].id))
        break
      case 'github':
        webhooksData.push(generateGitHubWebhook(endpointsData[4].id))
        break
      case 'shopify':
        webhooksData.push(generateShopifyWebhook(endpointsData[4].id))
        break
      default:
        webhooksData.push(generateGenericWebhook(endpointsData[4].id))
    }
  }

  // Ordenar por data de criação (mais antigos primeiro)
  webhooksData.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

  await db.insert(webhooks).values(webhooksData)

  console.log(
    `✅ Created ${webhooksData.length} webhooks across ${endpointsData.length} endpoints`,
  )
  console.log('✅ Database seeded successfully!')
}

seed()
  .catch((error) => {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
