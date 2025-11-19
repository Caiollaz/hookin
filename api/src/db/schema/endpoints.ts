import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const endpoints = pgTable('endpoints', {
  id: text()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  slug: text().notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
})
