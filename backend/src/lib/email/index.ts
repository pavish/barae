import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { Resend } from 'resend'
import { verificationEmailHtml, passwordResetEmailHtml } from './templates.js'

export interface EmailService {
  sendVerificationEmail(email: string, url: string): void
  sendPasswordResetEmail(email: string, url: string): void
}

function createEmailService(
  resend: Resend | null,
  defaultFrom: string,
  logger: FastifyInstance['log']
): EmailService {
  return {
    sendVerificationEmail(email: string, url: string): void {
      if (!resend) {
        logger.info({ email, url }, '[Email] Verification email (console mode)')
        return
      }

      resend.emails
        .send({
          from: defaultFrom,
          to: email,
          subject: 'Verify your Barae account',
          html: verificationEmailHtml(url),
        })
        .catch((err) => {
          logger.error({ err, email }, '[Email] Failed to send verification email')
        })
    },

    sendPasswordResetEmail(email: string, url: string): void {
      if (!resend) {
        logger.info({ email, url }, '[Email] Password reset email (console mode)')
        return
      }

      resend.emails
        .send({
          from: defaultFrom,
          to: email,
          subject: 'Reset your Barae password',
          html: passwordResetEmailHtml(url),
        })
        .catch((err) => {
          logger.error({ err, email }, '[Email] Failed to send password reset email')
        })
    },
  }
}

async function emailPlugin(fastify: FastifyInstance) {
  const resendApiKey = fastify.config.RESEND_API_KEY
  const resend = resendApiKey ? new Resend(resendApiKey) : null
  const defaultFrom = fastify.config.EMAIL_FROM || 'Barae <onboarding@resend.dev>'

  if (!resend) {
    fastify.log.warn('[Email] RESEND_API_KEY not set - emails will be logged to console')
  }

  const emailService = createEmailService(resend, defaultFrom, fastify.log)
  fastify.decorate('email', emailService)

  fastify.log.info('[Email] Email service registered')
}

export default fp(emailPlugin, { name: 'email', dependencies: ['config'] })

declare module 'fastify' {
  interface FastifyInstance {
    email: EmailService
  }
}
