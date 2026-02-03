import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { AuthService } from './service.js'
import { createAuthHandler } from './handler.js'
import { eq } from 'drizzle-orm'
import * as schema from '../../db/schema/index.js'

export function registerAuthRoutes(fastify: FastifyInstance, auth: AuthService) {
  const handler = createAuthHandler(auth)

  // Custom endpoint for resending verification email (works when requireEmailVerification is false)
  fastify.post(
    '/api/v1/auth/resend-verification',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Get session from cookie using better-auth
        const sessionCookie = request.cookies['better-auth.session_token']
        if (!sessionCookie) {
          return reply.status(401).send({ error: 'Not authenticated' })
        }

        // Cookie format is "token.signature" - extract just the token
        const sessionToken = sessionCookie.split('.')[0]

        // Look up session and user (better-auth stores raw token, not hashed)
        const sessions = await fastify.db.do
          .select({
            userId: schema.session.userId,
          })
          .from(schema.session)
          .where(eq(schema.session.token, sessionToken))
          .limit(1)

        if (sessions.length === 0) {
          return reply.status(401).send({ error: 'Invalid session' })
        }

        const users = await fastify.db.do
          .select({
            id: schema.user.id,
            email: schema.user.email,
            emailVerified: schema.user.emailVerified,
          })
          .from(schema.user)
          .where(eq(schema.user.id, sessions[0].userId))
          .limit(1)

        if (users.length === 0) {
          return reply.status(404).send({ error: 'User not found' })
        }

        const user = users[0]

        if (user.emailVerified) {
          return reply.status(400).send({ error: 'Email already verified' })
        }

        // Use better-auth's sendVerificationEmail API
        // This generates JWT tokens compatible with better-auth's verify-email endpoint
        await auth.api.sendVerificationEmail({
          body: {
            email: user.email,
            callbackURL: `${fastify.config.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email`,
          },
        })

        return reply.send({ success: true })
      } catch (err) {
        fastify.log.error({ err }, 'Failed to resend verification email')
        return reply.status(500).send({ error: 'Failed to send verification email' })
      }
    }
  )

  // Register versioned auth routes (catch-all for better-auth)
  // Note: better-auth handles /verify-email via this catch-all
  fastify.all('/api/v1/auth/*', handler)

  fastify.log.info('Auth routes registered at /api/v1/auth/*')
}
