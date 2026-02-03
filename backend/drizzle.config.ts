import { defineConfig } from 'drizzle-kit'

export const dbCredentials = {
  host: process.env.POSTGRES_HOST!,
  port: Number(process.env.POSTGRES_PORT!),
  database: process.env.POSTGRES_DB!,
  user: process.env.POSTGRES_USER!,
  password: process.env.POSTGRES_PASSWORD!,
}

export default defineConfig({
  schema: ['./src/db/schema/users.ts', './src/db/schema/common.ts', './src/auth/schema.ts'],
  out: './migrations',
  dialect: 'postgresql',
  migrations: {
    table: '__migrations__',
    schema: 'public',
  },
  dbCredentials,
})
