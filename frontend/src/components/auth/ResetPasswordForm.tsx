import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { authClient } from '@/lib/auth'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/schemas/auth'
import { useAuthStore } from '@/stores/authStore'
import { useOtpCooldown } from '@/hooks/useOtpCooldown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'

interface ResetPasswordFormProps {
  email: string
}

export function ResetPasswordForm({ email }: ResetPasswordFormProps) {
  const { setView, setViewWithEmail } = useAuthStore()
  const { canResend, secondsLeft, startCooldown } = useOtpCooldown(60)

  const [otp, setOtp] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  // Start cooldown on mount (OTP was sent when requesting the reset)
  useEffect(() => {
    startCooldown()
  }, [startCooldown])

  // Redirect to login after success with a delay
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => {
      setViewWithEmail('login', email)
    }, 2000)
    return () => clearTimeout(timer)
  }, [success, email, setViewWithEmail])

  async function onSubmit(data: ResetPasswordFormData) {
    if (otp.length < 6) {
      setFormError('Please enter the 6-digit code')
      return
    }

    setFormError(null)
    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password: data.password,
      })
      if (error) {
        setFormError(error.message ?? 'Could not reset password')
        return
      }
      setSuccess(true)
    } catch {
      setFormError('Something went wrong. Please try again.')
    }
  }

  async function handleResend() {
    setFormError(null)
    setIsResending(true)
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'forget-password',
      })
      if (error) {
        setFormError(error.message ?? 'Could not resend code')
        return
      }
      startCooldown()
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Password reset successfully</CardTitle>
          <CardDescription>
            Redirecting you to sign in...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>
          Enter the code sent to {email} and your new password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <AuthErrorBanner message={formError} />

          <Field>
            <FieldLabel>Verification code</FieldLabel>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                value={otp}
                onChange={setOtp}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </Field>

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="reset-password">New password</FieldLabel>
                <Input
                  {...field}
                  id="reset-password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid || undefined}
                />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="reset-confirm-password">
                  Confirm password
                </FieldLabel>
                <Input
                  {...field}
                  id="reset-confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid || undefined}
                />
                {fieldState.error && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset password'}
          </Button>

          <div className="flex flex-col items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canResend || isResending}
              onClick={handleResend}
            >
              {isResending
                ? 'Sending...'
                : canResend
                  ? 'Resend code'
                  : `Resend code (${secondsLeft}s)`}
            </Button>

            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setView('login')}
            >
              Back to sign in
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
