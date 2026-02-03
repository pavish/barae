import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { signUp } from '../lib/auth-client'
import { signupSchema, type SignupFormData } from '../schemas/auth'
import { Button, Input } from '../../../shared/components'

export function SignupForm() {
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setApiError(null)

    const result = await signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    })

    if (result.error) {
      // Handle specific error codes from better-auth
      const errorCode = result.error.code
      if (errorCode === 'USER_ALREADY_EXISTS') {
        setError('email', { message: 'An account with this email already exists' })
      } else {
        setApiError(result.error.message || 'An error occurred. Please try again.')
      }
      return
    }

    // Redirect to dashboard - non-blocking email verification per CONTEXT.md
    navigate('/dashboard', { replace: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {apiError && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
          {apiError}
        </div>
      )}

      <Input
        label="Name"
        type="text"
        placeholder="Your name"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />

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
        placeholder="At least 8 characters"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Create account
      </Button>
    </form>
  )
}
