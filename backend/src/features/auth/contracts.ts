import { Type, Static } from '@sinclair/typebox'

// Request schemas for auth endpoints
// These are for documentation and future validation - better-auth handles actual validation

export const SignupRequest = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8 }),
  name: Type.String(),
})
export type SignupRequestType = Static<typeof SignupRequest>

export const SigninRequest = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String(),
  rememberMe: Type.Optional(Type.Boolean()),
})
export type SigninRequestType = Static<typeof SigninRequest>

export const ForgotPasswordRequest = Type.Object({
  email: Type.String({ format: 'email' }),
  redirectTo: Type.Optional(Type.String()),
})
export type ForgotPasswordRequestType = Static<typeof ForgotPasswordRequest>

export const ResetPasswordRequest = Type.Object({
  newPassword: Type.String({ minLength: 8 }),
  token: Type.String(),
})
export type ResetPasswordRequestType = Static<typeof ResetPasswordRequest>

export const ChangePasswordRequest = Type.Object({
  currentPassword: Type.String(),
  newPassword: Type.String({ minLength: 8 }),
})
export type ChangePasswordRequestType = Static<typeof ChangePasswordRequest>

// Response schemas
export const UserResponse = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Type.String(),
  emailVerified: Type.Boolean(),
  image: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String(),
  updatedAt: Type.String(),
})
export type UserResponseType = Static<typeof UserResponse>

export const SessionResponse = Type.Object({
  user: UserResponse,
  session: Type.Object({
    id: Type.String(),
    expiresAt: Type.String(),
  }),
})
export type SessionResponseType = Static<typeof SessionResponse>
