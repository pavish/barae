import { useSearchParams } from 'react-router-dom'
import { ResetPasswordForm } from '../components/ResetPasswordForm'
import { Card } from '../../../shared/components'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Barae</h1>
        </div>

        <Card className="p-6">
          <h2 className="mb-6 text-center text-xl font-medium text-[var(--color-foreground)]">
            Set new password
          </h2>
          <ResetPasswordForm token={token} />
        </Card>
      </div>
    </div>
  )
}
