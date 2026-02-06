import fp from 'fastify-plugin'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { createEmailSender } from './email.js'

export default fp(
  async (fastify) => {
    const { config } = fastify

    const sendEmail = createEmailSender({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      user: config.SMTP_USER,
      password: config.SMTP_PASSWORD,
      from: config.EMAIL_FROM,
    })

    // config.AUTH_BASE_URL is "http://localhost:8100/api" (or prod equivalent).
    // better-auth derives basePath from the URL pathname when it already has one,
    // so we append "/auth" to get the full public endpoint base.
    const authBaseURL = `${config.AUTH_BASE_URL}/auth`

    const auth = betterAuth({
      appName: 'Barae',
      baseURL: authBaseURL,
      basePath: '/api/v1/auth',
      secret: config.APP_SECRET,
      database: drizzleAdapter(fastify.db.do, {
        provider: 'pg',
        schema: fastify.db.schema,
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        autoSignIn: true,
      },
      emailVerification: {
        autoSignInAfterVerification: true,
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
      },
      plugins: [
        emailOTP({
          otpLength: 6,
          expiresIn: 300,
          sendVerificationOnSignUp: true,
          sendVerificationOTP: async ({ email, otp, type }) => {
            const subjects: Record<string, string> = {
              'email-verification': 'Verify your Barae email',
              'forget-password': 'Reset your Barae password',
              'sign-in': 'Your Barae sign-in code',
            }
            try {
              await sendEmail({
                to: email,
                subject: subjects[type] ?? 'Your Barae verification code',
                text: `Your verification code is: ${otp}\n\nThis code expires in 5 minutes.`,
              })
            } catch (err) {
              fastify.log.error({ err, email, type }, 'Failed to send verification email')
            }
          },
        }),
      ],
      trustedOrigins: [new URL(config.AUTH_BASE_URL).origin],
    })

    fastify.decorate('auth', auth)
  },
  { name: 'auth', dependencies: ['config', 'db'] }
)

declare module 'fastify' {
  interface FastifyInstance {
    auth: ReturnType<typeof betterAuth>
  }
}
