import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../lib/auth-client'
import { LoginForm } from '../components/LoginForm'
import { SignupForm } from '../components/SignupForm'
import { GithubButton } from '../components/GithubButton'
import { Card } from '../../../shared/components'

type AuthTab = 'login' | 'signup'

export function AuthPage() {
  const { data: session, isPending } = useSession()
  const [activeTab, setActiveTab] = useState<AuthTab>('login')

  // Redirect if already logged in
  if (!isPending && session) {
    return <Navigate to="/dashboard" replace />
  }

  // Show loading state
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-[var(--color-muted-foreground)]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Barae</h1>
          <p className="mt-2 text-[var(--color-muted-foreground)]">
            Manage your Astro sites with ease
          </p>
        </div>

        {/* Two-column layout on desktop, stacked on mobile */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* OAuth Section */}
          <Card className="order-1 flex flex-col justify-center p-6 md:order-2">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-medium text-[var(--color-foreground)]">
                Quick access
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Sign in with your GitHub account
              </p>
            </div>
            <GithubButton />
            <p className="mt-4 text-center text-xs text-[var(--color-muted-foreground)]">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </Card>

          {/* Email/Password Section */}
          <Card className="order-2 p-6 md:order-1">
            {/* Tab Toggle */}
            <div className="mb-6 flex border-b border-[var(--color-border)]">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === 'login'
                    ? 'border-[var(--color-primary)] text-[var(--color-foreground)]'
                    : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className={`flex-1 border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === 'signup'
                    ? 'border-[var(--color-primary)] text-[var(--color-foreground)]'
                    : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
          </Card>
        </div>
      </div>
    </div>
  )
}
