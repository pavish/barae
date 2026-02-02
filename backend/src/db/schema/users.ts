import { pgTable, uuid, text, varchar } from 'drizzle-orm/pg-core'
import { metaColumns } from './common.js'

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  fullName: text('full_name'),
  email: varchar({ length: 255 }).notNull().unique(),
  ...metaColumns,
})
