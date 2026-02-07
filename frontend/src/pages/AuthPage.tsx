import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Info } from 'lucide-react'
import { useAuthStore, type AuthView } from '@/stores/authStore'
import { useProviders } from '@/hooks/useProviders'
import { getOAuthErrorMessage } from '@/lib/oauthErrors'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'
import { OtpVerification } from '@/components/auth/OtpVerification'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export function AuthPage() {
  const { view, email, setView } = useAuthStore()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showExpired, setShowExpired] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(() => {
    const errorCode = searchParams.get('error')
    return errorCode ? getOAuthErrorMessage(errorCode) : null
  })
  const { githubAvailable, isLoading: isLoadingProviders } = useProviders()

  useEffect(() => {
    const state = location.state as { expired?: boolean } | null
    if (state?.expired) {
      setShowExpired(true)
      setView('login')
      window.history.replaceState({}, '')
    }
  }, [location.state, setView])

  useEffect(() => {
    if (searchParams.get('error')) {
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const activeTab = view === 'signup' ? 'signup' : 'login'

  function handleTabChange(value: string) {
    if (value === 'login' || value === 'signup') {
      setShowExpired(false)
      setOauthError(null)
      setView(value)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: Brand panel (desktop only) */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 p-12 text-white">
        <div className="max-w-md space-y-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Barae</h1>
          <p className="text-lg text-neutral-300 leading-relaxed">
            Your content, your git repo, your control.
          </p>
          <p className="text-sm text-neutral-400">
            A GitHub-integrated CMS for Astro websites.
            Manage your blog, portfolio, or product site with
            the power of git.
          </p>
        </div>
      </div>

      {/* Right: Auth form area */}
      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md space-y-4">
          {showExpired && (
            <Alert>
              <Info />
              <AlertDescription>
                Your session has expired. Please sign in again.
              </AlertDescription>
            </Alert>
          )}
          <AuthErrorBanner message={oauthError} />
          {renderView(view, email, activeTab, handleTabChange, setView, githubAvailable, isLoadingProviders)}
        </div>
      </div>
    </div>
  )
}

function renderView(
  view: AuthView,
  email: string,
  activeTab: string,
  onTabChange: (value: string) => void,
  setView: (view: AuthView) => void,
  githubAvailable: boolean,
  isLoadingProviders: boolean,
) {
  switch (view) {
    case 'login':
    case 'signup':
      return (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome to Barae</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1">
                  Sign in
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                  Sign up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-4">
                <LoginForm
                  githubAvailable={githubAvailable}
                  isLoadingProviders={isLoadingProviders}
                />
              </TabsContent>
              <TabsContent value="signup" className="mt-4">
                <SignupForm
                  githubAvailable={githubAvailable}
                  isLoadingProviders={isLoadingProviders}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )

    case 'verify-otp':
      if (!email) {
        setView('login')
        return null
      }
      return <OtpVerification email={email} type="email-verification" />

    case 'forgot-password':
      return <ForgotPasswordForm />

    case 'reset-password':
      if (!email) {
        setView('login')
        return null
      }
      return <ResetPasswordForm email={email} />

    default:
      return null
  }
}
