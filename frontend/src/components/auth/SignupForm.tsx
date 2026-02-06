import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Github } from 'lucide-react'
import { authClient } from '@/lib/auth'
import { signupSchema, type SignupFormData } from '@/lib/schemas/auth'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner'

export function SignupForm() {
  const setViewWithEmail = useAuthStore((s) => s.setViewWithEmail)
  const setOtpAutoSent = useAuthStore((s) => s.setOtpAutoSent)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  async function onSubmit(data: SignupFormData) {
    setFormError(null)
    try {
      const { error } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      if (error) {
        setFormError(error.message ?? 'Could not create account')
        return
      }
      setOtpAutoSent(true)
      setViewWithEmail('verify-otp', data.email)
    } catch {
      setFormError('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <AuthErrorBanner message={formError} />

      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel htmlFor="signup-name">Name</FieldLabel>
            <Input
              {...field}
              id="signup-name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              aria-invalid={fieldState.invalid || undefined}
            />
            {fieldState.error && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel htmlFor="signup-email">Email</FieldLabel>
            <Input
              {...field}
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={fieldState.invalid || undefined}
            />
            {fieldState.error && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid || undefined}>
            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
            <Input
              {...field}
              id="signup-password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              aria-invalid={fieldState.invalid || undefined}
            />
            {fieldState.error && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>

      <div className="relative my-2">
        <Separator />
        <span className="bg-card text-muted-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
          or
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled
      >
        <Github />
        Continue with GitHub
        <Badge variant="secondary" className="ml-1 text-[10px]">
          Coming soon
        </Badge>
      </Button>
    </form>
  )
}
