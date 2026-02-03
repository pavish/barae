import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../features/auth/lib/auth-client'

interface ProtectedRouteProps {
  requireVerified?: boolean
}

export function ProtectedRoute({ requireVerified = false }: ProtectedRouteProps) {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!session) {
    // Redirect to auth page, preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // Enforce email verification for certain routes (future use)
  if (requireVerified && !session.user.emailVerified) {
    return <Navigate to="/dashboard" state={{ needsVerification: true }} replace />
  }

  return <Outlet />
}
