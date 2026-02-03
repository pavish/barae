import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { createAuthService, AuthService } from './service.js'
import { registerAuthRoutes } from './routes.js'

async function authFeature(fastify: FastifyInstance) {
  const auth = createAuthService(fastify)
  fastify.decorate('auth', auth)

  registerAuthRoutes(fastify, auth)

  fastify.log.info('Auth feature registered')
}

export default fp(authFeature, {
  name: 'auth',
  dependencies: ['config', 'db', 'email'],
})

declare module 'fastify' {
  interface FastifyInstance {
    auth: AuthService
  }
}
