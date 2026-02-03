import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type PasswordFormData = z.infer<typeof passwordSchema>

// Using a simple string schema, validation happens in component
export const deleteAccountSchema = z.object({
  confirmText: z.string().min(1, 'Please type DELETE to confirm'),
})

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>
