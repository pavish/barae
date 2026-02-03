import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import nodemailer, { Transporter } from 'nodemailer'
import { verificationEmailHtml, passwordResetEmailHtml } from './templates.js'

export interface EmailService {
  sendVerificationEmail(email: string, url: string): void
  sendPasswordResetEmail(email: string, url: string): void
}

function createEmailService(
  transporter: Transporter | null,
  defaultFrom: string,
  logger: FastifyInstance['log']
): EmailService {
  return {
    sendVerificationEmail(email: string, url: string): void {
      if (!transporter) {
        logger.info({ email, url }, '[Email] Verification email (console mode)')
        return
      }

      transporter
        .sendMail({
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
      if (!transporter) {
        logger.info({ email, url }, '[Email] Password reset email (console mode)')
        return
      }

      transporter
        .sendMail({
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
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE, EMAIL_FROM } = fastify.config
  const defaultFrom = EMAIL_FROM || 'Barae <noreply@barae.app>'

  let transporter: Transporter | null = null

  if (SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT || 587,
      secure: SMTP_SECURE || false,
      auth:
        SMTP_USER && SMTP_PASSWORD
          ? {
              user: SMTP_USER,
              pass: SMTP_PASSWORD,
            }
          : undefined,
    })

    // Verify connection on startup
    try {
      await transporter.verify()
      fastify.log.info('[Email] SMTP connection verified')
    } catch (err) {
      fastify.log.error({ err }, '[Email] SMTP connection failed - emails will be logged to console')
      transporter = null
    }
  } else {
    fastify.log.warn('[Email] SMTP_HOST not set - emails will be logged to console')
  }

  const emailService = createEmailService(transporter, defaultFrom, fastify.log)
  fastify.decorate('email', emailService)

  fastify.log.info('[Email] Email service registered')
}

export default fp(emailPlugin, { name: 'email', dependencies: ['config'] })

declare module 'fastify' {
  interface FastifyInstance {
    email: EmailService
  }
}
