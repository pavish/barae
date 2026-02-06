import { Navigate, Outlet } from 'react-router-dom'
import { authClient } from '@/lib/auth'
import { FullScreenLoader } from '@/components/layout/FullScreenLoader'

export function AuthLayout() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) return <FullScreenLoader />
  if (session) return <Navigate to="/" replace />

  return <Outlet />
}
