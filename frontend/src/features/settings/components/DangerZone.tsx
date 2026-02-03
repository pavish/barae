import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { signOut, deleteUser } from '../../auth/lib/auth-client'
import { deleteAccountSchema, type DeleteAccountFormData } from '../schemas/settings'
import { Card, Button, Input, Modal } from '../../../shared/components'

export function DangerZone() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmText: '',
    },
  })

  const handleOpenModal = () => {
    setApiError(null)
    reset()
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    reset()
    setApiError(null)
  }

  const onSubmit = async (data: DeleteAccountFormData) => {
    setApiError(null)

    // Validate confirmation text
    if (data.confirmText !== 'DELETE') {
      setApiError('Please type DELETE to confirm')
      return
    }

    const result = await deleteUser()

    if (result.error) {
      setApiError(result.error.message || 'Failed to delete account')
      return
    }

    // Sign out and redirect to auth page
    await signOut()
    navigate('/auth', { state: { message: 'Your account has been deleted' } })
  }

  return (
    <>
      <Card className="border-red-200 dark:border-red-900/50 p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h2>

        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          Once you delete your account, there is no going back. All your data will be permanently removed.
        </p>

        <Button variant="danger" onClick={handleOpenModal}>
          Delete account
        </Button>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Delete Account"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="rounded-md bg-red-500/10 p-3">
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    This action cannot be undone
                  </p>
                  <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/80">
                    This will permanently delete your account and remove all associated data.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--color-foreground)] mb-2">
                Type <strong>DELETE</strong> to confirm
              </label>
              <Input
                placeholder="DELETE"
                error={errors.confirmText?.message}
                {...register('confirmText')}
              />
            </div>

            {apiError && (
              <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                {apiError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                loading={isSubmitting}
              >
                Delete account
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  )
}
