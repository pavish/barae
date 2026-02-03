import fastify, { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { sql } from 'drizzle-orm'
import config from './config.js'
import db from './db/index.js'
import email from './lib/email/index.js'
import auth from './features/auth/index.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: true,
  }).withTypeProvider<TypeBoxTypeProvider>()

  // Register core plugins
  await app.register(config)
  await app.register(db)
  await app.register(cookie)

  // Register CORS after config is available
  await app.register(cors, {
    origin: app.config.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // Allow cookies for auth
  })

  // Register services
  await app.register(email)

  // Register features
  await app.register(auth)

  // Health check endpoint
  app.get('/health', async (request, reply) => {
    try {
      // Check database connectivity
      await app.db.do.execute(sql`SELECT 1`)
      return { status: 'ok', timestamp: new Date().toISOString() }
    } catch (err) {
      reply.status(503)
      return { status: 'error', message: 'Database connection failed' }
    }
  })

  return app
}
