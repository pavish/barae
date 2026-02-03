import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Card } from '../../../shared/components'

type VerifyState = 'loading' | 'success' | 'error'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [state, setState] = useState<VerifyState>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setState('error')
      setErrorMessage('No verification token provided')
      return
    }

    async function verifyEmail() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/auth/verify-email?token=${token}`
        )
        const data = await response.json()

        if (response.ok) {
          setState('success')
          // Redirect to dashboard after 2 seconds
          setTimeout(() => navigate('/dashboard'), 2000)
        } else {
          setState('error')
          setErrorMessage(data.error || 'Verification failed')
        }
      } catch {
        setState('error')
        setErrorMessage('Failed to connect to server')
      }
    }

    verifyEmail()
  }, [token, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Barae</h1>
        </div>

        <Card className="p-6 text-center">
          {state === 'loading' && (
            <>
              <div className="mb-4 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
              </div>
              <h2 className="text-xl font-medium text-[var(--color-foreground)]">
                Verifying your email...
              </h2>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="mb-2 text-xl font-medium text-[var(--color-foreground)]">
                Email verified!
              </h2>
              <p className="text-[var(--color-muted-foreground)]">
                Redirecting to dashboard...
              </p>
            </>
          )}

          {state === 'error' && (
            <>
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h2 className="mb-2 text-xl font-medium text-[var(--color-foreground)]">
                Verification failed
              </h2>
              <p className="mb-4 text-[var(--color-muted-foreground)]">
                {errorMessage}
              </p>
              <Link
                to="/dashboard"
                className="text-[var(--color-primary)] hover:underline"
              >
                Go to dashboard
              </Link>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
