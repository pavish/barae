import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'

export function AuthPage() {
  const { view, email, setView } = useAuthStore()

  const activeTab = view === 'signup' ? 'signup' : 'login'

  function handleTabChange(value: string) {
    if (value === 'login' || value === 'signup') {
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
        <div className="w-full max-w-md">
          {renderView(view, email, activeTab, handleTabChange)}
        </div>
      </div>
    </div>
  )
}

function renderView(
  view: string,
  email: string,
  activeTab: string,
  onTabChange: (value: string) => void,
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
                <LoginForm />
              </TabsContent>
              <TabsContent value="signup" className="mt-4">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )

    case 'verify-otp':
      return (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verify your email</CardTitle>
            <CardDescription>
              We sent a verification code to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              OTP verification coming in Task 2
            </p>
          </CardContent>
        </Card>
      )

    case 'forgot-password':
      return (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Forgot password</CardTitle>
            <CardDescription>
              Enter your email to receive a reset code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Forgot password form coming in Task 2
            </p>
          </CardContent>
        </Card>
      )

    case 'reset-password':
      return (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset password</CardTitle>
            <CardDescription>
              Enter the code sent to {email} and your new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Reset password form coming in Task 2
            </p>
          </CardContent>
        </Card>
      )

    default:
      return null
  }
}
