import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AuthPage } from '../features/auth/pages/AuthPage'
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage'

// Placeholder pages - will be replaced with actual components in Plan 03
function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">Dashboard</h1>
        <p className="mt-2 text-[var(--color-muted-foreground)]">Welcome! Dashboard coming soon.</p>
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
  // Redirect to auth - if user is logged in, AuthPage will redirect to dashboard
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
  {
    path: '/auth/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/auth/reset-password',
    element: <ResetPasswordPage />,
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
