import { timestamp } from 'drizzle-orm/pg-core'

export const metaColumns = {
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
}
