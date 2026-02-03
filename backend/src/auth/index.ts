import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email.js'

// Create a separate postgres client for better-auth
// This avoids dependency on Fastify config plugin
const client = postgres({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  database: process.env.POSTGRES_DB || 'barae',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
})

const db = drizzle(client, { schema })

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false, // Non-blocking per CONTEXT.md - users can access dashboard immediately
    async sendVerificationEmail({ user, url }) {
      // Don't await to prevent timing attacks
      sendVerificationEmail(user.email, url)
    },
    async sendResetPassword({ user, url }) {
      // Don't await to prevent timing attacks
      sendPasswordResetEmail(user.email, url)
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
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

  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],
})
