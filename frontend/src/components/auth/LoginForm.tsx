import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Github } from 'lucide-react'
import { authClient } from '@/lib/auth'
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'

interface LoginFormProps {
  defaultEmail?: string
}

export function LoginForm({ defaultEmail }: LoginFormProps) {
  const setView = useAuthStore((s) => s.setView)
  const setViewWithEmail = useAuthStore((s) => s.setViewWithEmail)
  const setOtpAutoSent = useAuthStore((s) => s.setOtpAutoSent)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: defaultEmail ?? '', password: '' },
  })

  async function onSubmit(data: LoginFormData) {
    setFormError(null)
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      })
      if (error) {
        if (error.code === 'EMAIL_NOT_VERIFIED') {
          // Attempt to send verification OTP from the frontend.
          // If server rate-limits (429), an OTP already exists — no cooldown needed.
          // If success, a new OTP was sent — start the 60s cooldown.
          const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
            email: data.email,
            type: 'email-verification',
          })
          if (otpError) {
            setFormError('Your email is not verified. Could not send verification code. Please try again.')
            return
          }
          setOtpAutoSent(true)
          setViewWithEmail('verify-otp', data.email)
          return
        }
        setFormError(error.message ?? 'Invalid credentials')
      }
    } catch {
      setFormError('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <AuthErrorBanner message={formError} />

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel htmlFor="login-email">Email</FieldLabel>
            <Input
              {...field}
              id="login-email"
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

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid || undefined}>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setView('forgot-password')}
              >
                Forgot password?
              </button>
            </div>
            <Input
              {...field}
              id="login-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={fieldState.invalid || undefined}
            />
            {fieldState.error && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>

      <div className="relative my-2">
        <Separator />
        <span className="bg-card text-muted-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
          or
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled
      >
        <Github />
        Continue with GitHub
        <Badge variant="secondary" className="ml-1 text-[10px]">
          Coming soon
        </Badge>
      </Button>
    </form>
  )
}
