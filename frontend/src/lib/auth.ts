import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: '/api/v1/auth',
  plugins: [emailOTPClient()],
})

export type Session = typeof authClient.$Infer.Session
