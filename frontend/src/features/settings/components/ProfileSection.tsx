import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession, sendVerificationEmail, updateUser } from '../../auth/lib/auth-client'
import { profileSchema, type ProfileFormData } from '../schemas/settings'
import { Card, Button, Input } from '../../../shared/components'

export function ProfileSection() {
  const { data: session, refetch } = useSession()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null)

  const user = session?.user

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
    },
  })

  // Reset form when user data changes
  useEffect(() => {
    if (user?.name) {
      reset({ name: user.name })
    }
  }, [user?.name, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setApiError(null)
    setSuccessMessage(null)

    const result = await updateUser({ name: data.name })

    if (result.error) {
      setApiError(result.error.message || 'Failed to update profile')
      return
    }

    setSuccessMessage('Profile updated successfully')
    // Refetch session to get updated user data
    await refetch()

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleResendVerification = async () => {
    if (!user?.email) return

    setVerificationStatus('sending')

    const result = await sendVerificationEmail({
      email: user.email,
      callbackURL: `${window.location.origin}/auth`,
    })

    if (result.error) {
      setVerificationStatus('error')
    } else {
      setVerificationStatus('sent')
    }

    // Clear status after 3 seconds
    setTimeout(() => setVerificationStatus(null), 3000)
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
        Profile
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email (read-only) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]">
            Email
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-2 text-sm text-[var(--color-foreground)]">
              {user?.email}
            </div>
            {user?.emailVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Unverified
              </span>
            )}
          </div>

          {/* Resend verification link for unverified users */}
          {!user?.emailVerified && (
            <div className="mt-2">
              {verificationStatus === 'sending' ? (
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  Sending...
                </span>
              ) : verificationStatus === 'sent' ? (
                <span className="text-xs text-green-600 dark:text-green-400">
                  Verification email sent!
                </span>
              ) : verificationStatus === 'error' ? (
                <span className="text-xs text-red-600 dark:text-red-400">
                  Failed to send. Try again.
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="text-xs text-[var(--color-primary)] hover:underline"
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}
        </div>

        {/* Name (editable) */}
        <Input
          label="Name"
          placeholder="Your name"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Error/Success messages */}
        {apiError && (
          <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
            {apiError}
          </div>
        )}

        {successMessage && (
          <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
            {successMessage}
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  )
}
