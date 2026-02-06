import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authClient } from '@/lib/auth'
import { FullScreenLoader } from '@/components/layout/FullScreenLoader'

export function DashboardLayout() {
  const { data: session, isPending } = authClient.useSession()
  const location = useLocation()

  if (isPending) return <FullScreenLoader />
  if (!session)
    return <Navigate to="/auth" state={{ from: location }} replace />

  return <Outlet />
}
