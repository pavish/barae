import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AuthErrorBannerProps {
  message: string | null
}

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  if (!message) return null

  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
