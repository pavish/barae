import { FastifyInstance } from 'fastify'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import * as schema from '../../db/schema/index.js'

export type AuthService = ReturnType<typeof createAuthService>

export function createAuthService(fastify: FastifyInstance) {
  return betterAuth({
    database: drizzleAdapter(fastify.db.do, {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),

    secret: fastify.config.APP_SECRET,

    // baseURL is used for generating email links (password reset, etc.)
    baseURL: fastify.config.FRONTEND_URL || 'http://localhost:5173',

    // Top-level email verification config - triggers on signup
    emailVerification: {
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
        fastify.email.sendVerificationEmail(user.email, url)
      },
    },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      requireEmailVerification: false, // Non-blocking - users can access dashboard immediately
      async sendVerificationEmail({ user, url }: { user: { email: string }; url: string }) {
        // Fire-and-forget to prevent timing attacks
        fastify.email.sendVerificationEmail(user.email, url)
      },
      async sendResetPassword({ user, url }: { user: { email: string }; url: string }) {
        // Fire-and-forget to prevent timing attacks
        fastify.email.sendPasswordResetEmail(user.email, url)
      },
    },

    socialProviders: {
      github: {
        clientId: fastify.config.GITHUB_CLIENT_ID || '',
        clientSecret: fastify.config.GITHUB_CLIENT_SECRET || '',
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days for "remember me"
      updateAge: 60 * 60 * 24, // Refresh session daily
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes cache
      },
    },

    basePath: '/api/v1/auth',

    trustedOrigins: [fastify.config.FRONTEND_URL || 'http://localhost:5173'],
  })
}
