import { useState, useEffect, useCallback } from 'react'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { authClient } from '@/lib/auth'
import { useAuthStore } from '@/stores/authStore'
import { useOtpCooldown } from '@/hooks/useOtpCooldown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

const LOCKOUT_KEY = 'barae:otp-lockout'
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes
const MAX_FAILED_ATTEMPTS = 3

interface OtpVerificationProps {
  email: string
  type: 'email-verification' | 'forget-password'
}

export function OtpVerification({ email, type }: OtpVerificationProps) {
  const reset = useAuthStore((s) => s.reset)
  const otpAutoSent = useAuthStore((s) => s.otpAutoSent)
  const { canResend, secondsLeft, startCooldown } = useOtpCooldown(60)

  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0)
  const [isResending, setIsResending] = useState(false)

  // Check for existing lockout on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCKOUT_KEY)
    if (stored) {
      const expiry = Number(stored)
      if (Date.now() < expiry) {
        setLockoutUntil(expiry)
      } else {
        localStorage.removeItem(LOCKOUT_KEY)
      }
    }
  }, [])

  // Start cooldown on mount only when an OTP was just sent
  // (signup always sends, login only sends when no valid OTP exists)
  useEffect(() => {
    if (otpAutoSent) {
      startCooldown()
    }
  }, [startCooldown, otpAutoSent])

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutUntil) {
      setLockoutSecondsLeft(0)
      return
    }

    function tick() {
      const remaining = Math.max(0, Math.ceil(((lockoutUntil as number) - Date.now()) / 1000))
      setLockoutSecondsLeft(remaining)
      if (remaining <= 0) {
        setLockoutUntil(null)
        setFailedAttempts(0)
        localStorage.removeItem(LOCKOUT_KEY)
      }
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [lockoutUntil])

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil

  const handleComplete = useCallback(
    async (value: string) => {
      if (isLockedOut) return

      setError(null)
      setIsVerifying(true)

      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email,
        otp: value,
      })

      setIsVerifying(false)

      if (verifyError) {
        const newFailedAttempts = failedAttempts + 1
        setFailedAttempts(newFailedAttempts)
        setError(verifyError.message ?? 'Invalid verification code')
        setOtp('')

        if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
          const expiry = Date.now() + LOCKOUT_DURATION_MS
          setLockoutUntil(expiry)
          localStorage.setItem(LOCKOUT_KEY, String(expiry))
        }
      }
      // On success, better-auth auto-signs in (autoSignInAfterVerification enabled).
      // AuthLayout guard will detect the session and redirect to dashboard.
    },
    [email, failedAttempts, isLockedOut],
  )

  async function handleResend() {
    setError(null)
    setIsResending(true)
    const { error: resendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type,
    })
    setIsResending(false)

    if (resendError) {
      setError(resendError.message ?? 'Could not resend code')
      return
    }
    startCooldown()
  }

  const lockoutMinutes = Math.ceil(lockoutSecondsLeft / 60)

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Check your email</CardTitle>
        <CardDescription>
          We sent a verification code to {email}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {isLockedOut ? (
          <p className="text-sm text-destructive text-center">
            Too many failed attempts. Please try again in{' '}
            {lockoutMinutes} {lockoutMinutes === 1 ? 'minute' : 'minutes'}.
          </p>
        ) : (
          <>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={otp}
              onChange={setOtp}
              onComplete={handleComplete}
              disabled={isVerifying}
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

            {isVerifying && (
              <p className="text-sm text-muted-foreground">Verifying...</p>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </>
        )}

        <div className="flex flex-col items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canResend || isResending || isLockedOut}
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
            onClick={reset}
          >
            Back to sign in
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
