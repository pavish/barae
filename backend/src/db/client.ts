import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as dbSchema from './schema/index.js'

interface DbConnectionConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
}

export function createDbClient(config: DbConnectionConfig) {
  const client = postgres({
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: config.password,
  })
  const db = drizzle(client, { schema: dbSchema })
  return { client, db }
}

export { dbSchema as schema }
