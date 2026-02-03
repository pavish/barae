import { Resend } from 'resend'

// Initialize Resend client (only if API key is provided)
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Default from address - uses Resend's dev domain if no custom domain
const defaultFrom = process.env.EMAIL_FROM || 'Barae <onboarding@resend.dev>'

// Log warning if Resend is not configured
if (!resend) {
  console.warn(
    '[Email] RESEND_API_KEY not set - emails will be logged to console instead of sent'
  )
}

/**
 * Send verification email to user after signup.
 * Fire-and-forget to prevent timing attacks.
 */
export function sendVerificationEmail(email: string, url: string): void {
  if (!resend) {
    console.log(`[Email] Verification email for ${email}:`)
    console.log(`  URL: ${url}`)
    return
  }

  // Don't await - fire and forget to prevent timing attacks
  resend.emails
    .send({
      from: defaultFrom,
      to: email,
      subject: 'Verify your Barae account',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background-color: #f8fafc;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h1 style="color: #0f172a; font-size: 24px; margin: 0 0 16px 0;">Welcome to Barae!</h1>
    <p style="color: #475569; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
      Thanks for signing up. Please verify your email address by clicking the button below.
    </p>
    <a href="${url}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
      Verify Email
    </a>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0;">
      This link expires in 24 hours.
    </p>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 16px 0 0 0;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
      `,
    })
    .catch((err) => {
      console.error('[Email] Failed to send verification email:', err)
    })
}

/**
 * Send password reset email to user.
 * Fire-and-forget to prevent timing attacks.
 */
export function sendPasswordResetEmail(email: string, url: string): void {
  if (!resend) {
    console.log(`[Email] Password reset email for ${email}:`)
    console.log(`  URL: ${url}`)
    return
  }

  // Don't await - fire and forget to prevent timing attacks
  resend.emails
    .send({
      from: defaultFrom,
      to: email,
      subject: 'Reset your Barae password',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background-color: #f8fafc;">
  <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h1 style="color: #0f172a; font-size: 24px; margin: 0 0 16px 0;">Reset your password</h1>
    <p style="color: #475569; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">
      We received a request to reset your password. Click the button below to choose a new one.
    </p>
    <a href="${url}" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
      Reset Password
    </a>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0;">
      This link expires in 1 hour.
    </p>
    <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 16px 0 0 0;">
      If you didn't request a password reset, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
      `,
    })
    .catch((err) => {
      console.error('[Email] Failed to send password reset email:', err)
    })
}
