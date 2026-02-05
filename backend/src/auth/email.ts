import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  from: string
}

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export function createEmailSender(config: EmailConfig) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    ...(config.user ? { auth: { user: config.user, pass: config.password } } : {}),
  })

  return async function sendEmail(options: EmailOptions): Promise<void> {
    await transporter.sendMail({
      from: config.from,
      ...options,
    })
  }
}
