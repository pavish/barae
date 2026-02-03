import type { FastifyInstance } from 'fastify'
import type { AuthService } from './service.js'
import { createAuthHandler } from './handler.js'

export function registerAuthRoutes(fastify: FastifyInstance, auth: AuthService) {
  const handler = createAuthHandler(auth)

  // Register versioned auth routes
  fastify.all('/api/v1/auth/*', handler)

  fastify.log.info('Auth routes registered at /api/v1/auth/*')
}
