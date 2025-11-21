import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'

export const sessions = pgTable('sessions', {
  id: text()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  slug: text().notNull().unique(),
  sharePin: text('share_pin').notNull(),
  isShared: boolean('is_shared').notNull().default(false),
  isPendingDelete: boolean('is_pending_delete').notNull().default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
