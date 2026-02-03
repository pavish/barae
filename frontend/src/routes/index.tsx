import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RootRedirect } from './RootRedirect'
import { AuthPage } from '../features/auth/pages/AuthPage'
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage'
import { DashboardLayout } from '../features/dashboard/components'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { SettingsPage } from '../features/settings/pages/SettingsPage'

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
  // Protected routes with DashboardLayout
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
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
    ],
  },
])
