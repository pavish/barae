import { ForgotPasswordForm } from '../components/ForgotPasswordForm'
import { Card } from '../../../shared/components'

export function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Barae</h1>
        </div>

        <Card className="p-6">
          <h2 className="mb-6 text-center text-xl font-medium text-[var(--color-foreground)]">
            Reset your password
          </h2>
          <ForgotPasswordForm />
        </Card>
      </div>
    </div>
  )
}
