import { Navigate } from 'react-router-dom'

// Root redirect component that checks auth status
// Redirect to dashboard - if user is not logged in, ProtectedRoute will redirect to auth
export function RootRedirect() {
  return <Navigate to="/dashboard" replace />
}
