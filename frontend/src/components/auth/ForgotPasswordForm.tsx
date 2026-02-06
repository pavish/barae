import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authClient } from '@/lib/auth'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/schemas/auth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'

export function ForgotPasswordForm() {
  const { setView, setViewWithEmail } = useAuthStore()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    setFormError(null)
    try {
      const { error } = await authClient.emailOtp.requestPasswordReset({
        email: data.email,
      })
      if (error) {
        setFormError(error.message ?? 'Could not send reset code')
        return
      }
      setViewWithEmail('reset-password', data.email)
    } catch {
      setFormError('Something went wrong. Please try again.')
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we will send you a reset code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AuthErrorBanner message={formError} />

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid || undefined}
                />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending code...' : 'Send reset code'}
          </Button>

          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors self-center"
            onClick={() => setView('login')}
          >
            Back to sign in
          </button>
        </form>
      </CardContent>
    </Card>
  )
}
