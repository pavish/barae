import { useSession, sendVerificationEmail } from '../../auth/lib/auth-client'
import { useState } from 'react'
import { Button } from '../../../shared/components'

export function EmptyState() {
  const { data: session } = useSession()
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const user = session?.user
  const isEmailVerified = user?.emailVerified ?? false

  const handleResendVerification = async () => {
    if (!user?.email) return

    setVerificationStatus('sending')

    const result = await sendVerificationEmail({
      email: user.email,
      callbackURL: `${window.location.origin}/auth`,
    })

    if (result.error) {
      setVerificationStatus('error')
    } else {
      setVerificationStatus('sent')
    }

    // Reset after 3 seconds
    setTimeout(() => setVerificationStatus('idle'), 3000)
  }

  const steps = [
    {
      id: 'verify-email',
      title: 'Verify your email',
      description: 'Check your inbox for a verification link',
      completed: isEmailVerified,
      enabled: true,
      action: !isEmailVerified ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendVerification}
          loading={verificationStatus === 'sending'}
          disabled={verificationStatus === 'sent'}
        >
          {verificationStatus === 'sent' ? 'Email sent!' : verificationStatus === 'error' ? 'Try again' : 'Resend email'}
        </Button>
      ) : null,
    },
    {
      id: 'connect-github',
      title: 'Connect GitHub',
      description: 'Link your GitHub account to manage repositories',
      completed: false,
      enabled: false,
      comingSoon: 'Coming in Phase 2',
    },
    {
      id: 'create-site',
      title: 'Create your first site',
      description: 'Set up an Astro site to start editing content',
      completed: false,
      enabled: false,
      comingSoon: 'Coming in Phase 3',
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      {/* Welcome message */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
          Welcome to Barae{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </h2>
        <p className="text-[var(--color-muted-foreground)] max-w-md">
          Let's get you set up. Complete the steps below to start managing your content.
        </p>
      </div>

      {/* Onboarding checklist */}
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`
                flex items-start gap-4 p-4
                ${index !== steps.length - 1 ? 'border-b border-[var(--color-border)]' : ''}
                ${!step.enabled ? 'opacity-60' : ''}
              `.trim()}
            >
              {/* Status indicator */}
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  // Completed checkmark
                  <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white"
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
                ) : !step.enabled ? (
                  // Locked icon
                  <div className="h-6 w-6 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-[var(--color-muted-foreground)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                ) : (
                  // Empty circle (pending)
                  <div className="h-6 w-6 rounded-full border-2 border-[var(--color-border)]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-[var(--color-foreground)]">
                    {step.title}
                  </h3>
                  {step.comingSoon && (
                    <span className="text-xs text-[var(--color-muted-foreground)] bg-[var(--color-muted)] px-2 py-0.5 rounded">
                      {step.comingSoon}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                  {step.description}
                </p>
              </div>

              {/* Action button */}
              {step.action && (
                <div className="flex-shrink-0">
                  {step.action}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Help text */}
      <p className="mt-6 text-xs text-[var(--color-muted-foreground)]">
        Need help? Check out our{' '}
        <a
          href="https://docs.barae.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-primary)] hover:underline"
        >
          documentation
        </a>
      </p>
    </div>
  )
}
