import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

// Placeholder pages - will be replaced with actual components
function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Barae</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">Auth page placeholder</p>
        <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">
          Login and signup forms will be implemented in Plan 02
        </p>
      </div>
    </div>
  )
}

function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Dashboard</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">Dashboard placeholder</p>
      </div>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Settings</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">Settings placeholder</p>
      </div>
    </div>
  )
}

// Root redirect component that checks auth status
function RootRedirect() {
  // For now, redirect to auth since we don't have session check at route level
  // This will be improved when auth UI is complete
  return <Navigate to="/auth" replace />
}

export const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <RootRedirect />,
  },
  // Public routes
  {
    path: '/auth',
    element: <AuthPage />,
  },
  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
])
