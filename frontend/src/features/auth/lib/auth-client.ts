import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

// Export individual methods for cleaner imports
export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient

// Type for API responses
type ApiResponse<T> = {
  data: T | null
  error: { message: string; code?: string } | null
}

// Password reset - request email
export async function forgetPassword(params: {
  email: string
  redirectTo?: string
}): Promise<ApiResponse<{ status: boolean; message: string }>> {
  try {
    const response = await authClient.$fetch('/request-password-reset', {
      method: 'POST',
      body: params,
    })
    return { data: response.data as { status: boolean; message: string }, error: null }
  } catch (err) {
    const error = err as Error
    return { data: null, error: { message: error.message || 'Failed to send reset email' } }
  }
}

// Password reset - set new password
export async function resetPassword(params: {
  newPassword: string
  token: string
}): Promise<ApiResponse<{ status: boolean }>> {
  try {
    const response = await authClient.$fetch('/reset-password', {
      method: 'POST',
      body: params,
    })
    return { data: response.data as { status: boolean }, error: null }
  } catch (err) {
    const error = err as Error
    return { data: null, error: { message: error.message || 'Failed to reset password' } }
  }
}

// Send verification email
export async function sendVerificationEmail(params: {
  email: string
  callbackURL?: string
}): Promise<ApiResponse<{ status: boolean }>> {
  try {
    const response = await authClient.$fetch('/send-verification-email', {
      method: 'POST',
      body: params,
    })
    return { data: response.data as { status: boolean }, error: null }
  } catch (err) {
    const error = err as Error
    return { data: null, error: { message: error.message || 'Failed to send verification email' } }
  }
}

// Change password (for logged-in users)
export async function changePassword(params: {
  currentPassword: string
  newPassword: string
}): Promise<ApiResponse<{ status: boolean }>> {
  try {
    const response = await authClient.$fetch('/change-password', {
      method: 'POST',
      body: params,
    })
    return { data: response.data as { status: boolean }, error: null }
  } catch (err) {
    const error = err as Error
    return { data: null, error: { message: error.message || 'Failed to change password' } }
  }
}

// Update user profile
export async function updateUser(params: {
  name?: string
  image?: string
}): Promise<ApiResponse<{ user: { id: string; name: string; email: string } }>> {
  try {
    const response = await authClient.$fetch('/update-user', {
      method: 'POST',
      body: params,
    })
    return { data: response.data as { user: { id: string; name: string; email: string } }, error: null }
  } catch (err) {
    const error = err as Error
    return { data: null, error: { message: error.message || 'Failed to update user' } }
  }
}

// Delete user account
export async function deleteUser(): Promise<ApiResponse<{ status: boolean }>> {
  try {
    const response = await authClient.$fetch('/delete-user', {
      method: 'POST',
    })
    return { data: response.data as { status: boolean }, error: null }
  } catch (err) {
    const error = err as Error
    return { data: null, error: { message: error.message || 'Failed to delete account' } }
  }
}
