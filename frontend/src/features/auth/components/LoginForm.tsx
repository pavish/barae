import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { signIn } from '../lib/auth-client'
import { loginSchema, type LoginFormData } from '../schemas/auth'
import { Button, Input } from '../../../shared/components'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const [apiError, setApiError] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: true },
  })

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null)

    const result = await signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    })

    if (result.error) {
      // Handle specific error codes from better-auth
      const errorCode = result.error.code
      if (errorCode === 'USER_NOT_FOUND' || errorCode === 'INVALID_EMAIL') {
        setError('email', { message: 'No account found with this email' })
      } else if (errorCode === 'INVALID_PASSWORD') {
        setError('password', { message: 'Incorrect password' })
      } else {
        setApiError(result.error.message || 'An error occurred. Please try again.')
      }
      return
    }

    // Redirect to intended destination or dashboard
    navigate(from, { replace: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
          {apiError}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-primary)]"
            {...register('rememberMe')}
          />
          <span className="text-[var(--color-muted-foreground)]">Remember me</span>
        </label>

        <Link
          to="/auth/forgot-password"
          className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Sign in
      </Button>
    </form>
  )
}
