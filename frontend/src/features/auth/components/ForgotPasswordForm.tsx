import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { forgetPassword } from '../lib/auth-client'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../schemas/auth'
import { Button, Input } from '../../../shared/components'

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setApiError(null)

    const result = await forgetPassword({
      email: data.email,
      redirectTo: '/auth/reset-password',
    })

    if (result.error) {
      setApiError(result.error.message || 'An error occurred. Please try again.')
      return
    }

    // Always show success to prevent email enumeration
    setSubmitted(true)
  }

  if (submitted) {
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
          Check your email
        </h3>
        <p className="mb-6 text-sm text-[var(--color-muted-foreground)]">
          If an account exists with that email, you'll receive a password reset link.
        </p>
        <Link
          to="/auth"
          className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
          {apiError}
        </div>
      )}

      <p className="text-sm text-[var(--color-muted-foreground)]">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Send reset link
      </Button>

      <div className="text-center">
        <Link
          to="/auth"
          className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          Back to sign in
        </Link>
      </div>
    </form>
  )
}
