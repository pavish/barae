import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/auth/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  migrations: {
    table: '__migrations__',
    schema: 'public',
  },
  dbCredentials: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    database: process.env.POSTGRES_DB || 'barae',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
  },
})
