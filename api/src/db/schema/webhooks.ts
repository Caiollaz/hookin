import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { endpoints } from './endpoints'

export const webhooks = pgTable('webhooks', {
  id: text()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  endpointId: text('endpoint_id').references(() => endpoints.id, {
    onDelete: 'cascade',
  }),
  method: text().notNull(),
  pathname: text().notNull(),
  ip: text().notNull(),
  statusCode: integer().notNull().default(200),
  contentType: text(),
  contentLength: integer(),
  queryParams: jsonb().$type<Record<string, string>>(),
  headers: jsonb().$type<Record<string, string>>().notNull(),
  body: text(),
  createdAt: timestamp().notNull().defaultNow(),
})
