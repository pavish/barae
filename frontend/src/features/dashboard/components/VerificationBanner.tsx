import { useState, useEffect } from 'react'
import { useSession, sendVerificationEmail } from '../../auth/lib/auth-client'
import { Button } from '../../../shared/components'

const BANNER_DISMISSED_KEY = 'verification_banner_dismissed'

export function VerificationBanner() {
  const { data: session } = useSession()
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem(BANNER_DISMISSED_KEY) === 'true'
  })
  const [isSending, setIsSending] = useState(false)
  const [sentMessage, setSentMessage] = useState<string | null>(null)

  // Reset dismissed state if email gets verified
  useEffect(() => {
    if (session?.user?.emailVerified) {
      sessionStorage.removeItem(BANNER_DISMISSED_KEY)
    }
  }, [session?.user?.emailVerified])

  // Don't show if verified, dismissed, or no session
  if (!session || session.user?.emailVerified || isDismissed) {
    return null
  }

  const handleResend = async () => {
    setIsSending(true)
    setSentMessage(null)

    try {
      await sendVerificationEmail({
        email: session.user.email,
        callbackURL: `${window.location.origin}/auth`,
      })
      setSentMessage('Verification email sent!')
    } catch {
      setSentMessage('Failed to send. Please try again.')
    } finally {
      setIsSending(false)
      // Clear message after 3 seconds
      setTimeout(() => setSentMessage(null), 3000)
    }
  }

  const handleDismiss = () => {
    sessionStorage.setItem(BANNER_DISMISSED_KEY, 'true')
    setIsDismissed(true)
  }

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500 mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Please verify your email to unlock all features
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
              Check your inbox for a verification link
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:flex-shrink-0">
          {sentMessage ? (
            <span className="text-sm text-amber-700 dark:text-amber-300">
              {sentMessage}
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              loading={isSending}
              className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-800/50"
            >
              Resend verification email
            </Button>
          )}

          <button
            onClick={handleDismiss}
            className="rounded-md p-1 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-800/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            aria-label="Dismiss banner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
          </button>
        </div>
      </div>
    </div>
  )
}
