import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { sessions } from './sessions'

export const endpoints = pgTable('endpoints', {
  id: text()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  slug: text().notNull().unique(),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  createdAt: timestamp().notNull().defaultNow(),
})
