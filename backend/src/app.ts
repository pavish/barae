import process from 'node:process'
import fastify, { type FastifyInstance } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { sql } from 'drizzle-orm'
import configPlugin from './plugins/config.js'
import db from './db/index.js'
import authPlugin from './auth/index.js'
import authRoutes from './auth/routes.js'

export async function buildApp(): Promise<FastifyInstance> {
  // Logger config needs NODE_ENV at instantiation time, before any plugins run.
  // This is the single acceptable use of process.env outside the config plugin.
  const nodeEnv = process.env.NODE_ENV ?? 'development'

  const app = fastify({
    logger: {
      level: nodeEnv === 'production' ? 'info' : 'debug',
      ...(nodeEnv !== 'production' && {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }),
    },
  }).withTypeProvider<TypeBoxTypeProvider>()

  // Registration order matters: config -> db -> auth -> auth-routes
  await app.register(configPlugin)
  await app.register(db)
  await app.register(authPlugin)
  await app.register(authRoutes)

  // Health check endpoint
  app.get('/health', async (_request, reply) => {
    try {
      await app.db.do.execute(sql`SELECT 1`)
      return { status: 'ok', timestamp: new Date().toISOString() }
    } catch (_err) {
      reply.status(503)
      return { status: 'error', message: 'Database connection failed' }
    }
  })

  return app
}
