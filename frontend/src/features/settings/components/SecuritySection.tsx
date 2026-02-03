import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePassword } from '../../auth/lib/auth-client'
import { passwordSchema, type PasswordFormData } from '../schemas/settings'
import { Card, Button, Input } from '../../../shared/components'

export function SecuritySection() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: PasswordFormData) => {
    setApiError(null)
    setSuccessMessage(null)

    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })

    if (result.error) {
      // Check for common error cases
      if (result.error.message?.toLowerCase().includes('incorrect') ||
          result.error.message?.toLowerCase().includes('invalid')) {
        setApiError('Current password is incorrect')
      } else {
        setApiError(result.error.message || 'Failed to change password')
      }
      return
    }

    setSuccessMessage('Password changed successfully')
    reset()

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">
        Security
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          Change your password. You'll need to enter your current password for verification.
        </p>

        <Input
          label="Current password"
          type="password"
          placeholder="Enter current password"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />

        <Input
          label="New password"
          type="password"
          placeholder="Enter new password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <Input
          label="Confirm new password"
          type="password"
          placeholder="Confirm new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
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

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>
            Change password
          </Button>
        </div>
      </form>
    </Card>
  )
}
