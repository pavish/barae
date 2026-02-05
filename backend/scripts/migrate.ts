import process from 'node:process'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

// --- Env validation ---
// This script reads process.env directly (not via app config).
// It runs independently: in CI/CD, manually, or before the app starts.

const required = [
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
] as const

const missing = required.filter((name) => {
  const value = process.env[name]
  return value === undefined || value === ''
})

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`)
  process.exit(1)
}

const client = postgres({
  host: process.env['POSTGRES_HOST'],
  port: Number.parseInt(process.env['POSTGRES_PORT']!, 10),
  database: process.env['POSTGRES_DB']!,
  username: process.env['POSTGRES_USER'],
  password: process.env['POSTGRES_PASSWORD'],
  max: 1,
})

const db = drizzle(client)

async function main(): Promise<void> {
  try {
    console.log('Running migrations...')
    await migrate(db, { migrationsFolder: './migrations' })
    console.log('Migrations completed successfully.')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
