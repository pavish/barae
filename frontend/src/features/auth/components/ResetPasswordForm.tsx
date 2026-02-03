import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { resetPassword } from '../lib/auth-client'
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/auth'
import { Button, Input } from '../../../shared/components'

interface ResetPasswordFormProps {
  token: string | null
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Show error if no token provided
  if (!token) {
    return (
      <div className="text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-[var(--color-foreground)]">
          Invalid reset link
        </h3>
        <p className="mb-6 text-sm text-[var(--color-muted-foreground)]">
          This password reset link is invalid or has expired.
        </p>
        <Link
          to="/auth/forgot-password"
          className="text-sm text-[var(--color-primary)] hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setApiError(null)

    const result = await resetPassword({
      token,
      newPassword: data.password,
    })

    if (result.error) {
      // Handle token errors
      const errorCode = result.error.code
      if (
        errorCode === 'INVALID_TOKEN' ||
        errorCode === 'EXPIRED_TOKEN' ||
        errorCode === 'TOKEN_EXPIRED'
      ) {
        setApiError('This reset link has expired. Please request a new one.')
      } else {
        setApiError(result.error.message || 'An error occurred. Please try again.')
      }
      return
    }

    setSuccess(true)
    // Redirect to auth page after short delay
    setTimeout(() => {
      navigate('/auth', { replace: true })
    }, 2000)
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
          <svg
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-[var(--color-foreground)]">
          Password reset successful
        </h3>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Redirecting to sign in...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
          {apiError}
          {apiError.includes('expired') && (
            <Link
              to="/auth/forgot-password"
              className="ml-2 underline hover:no-underline"
            >
              Request new link
            </Link>
          )}
        </div>
      )}

      <p className="text-sm text-[var(--color-muted-foreground)]">
        Enter your new password below.
      </p>

      <Input
        label="New Password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your new password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Reset password
      </Button>
    </form>
  )
}
