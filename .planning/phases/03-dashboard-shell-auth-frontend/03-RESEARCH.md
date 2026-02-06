# Phase 3: Dashboard Shell & Auth Frontend - Research

**Researched:** 2026-02-06
**Domain:** React frontend auth flows, responsive dashboard shell, form validation, session management
**Confidence:** HIGH

## Summary

Phase 3 implements the browser-side authentication lifecycle (signup, OTP verification, login, password reset) and a responsive dashboard navigation shell. The backend auth API (better-auth with emailOTP plugin) already exists from Phase 2. The frontend stack is already scaffolded: React 19, Vite 7, Tailwind CSS v4, shadcn/ui (new-york style), TanStack Query, Zustand, react-hook-form with Zod 4, and react-router-dom 7.13. The better-auth React client (`authClient`) is configured in `lib/auth.ts` with `emailOTPClient()` plugin.

The primary work is: (1) setting up React Router with route protection, (2) building auth forms with react-hook-form + Zod + shadcn/ui Field components, (3) wiring forms to better-auth client methods, (4) implementing OTP verification with shadcn/ui InputOTP, (5) building a responsive dashboard layout with bottom tabs (mobile) and top nav (desktop), and (6) implementing session detection with polling + lazy 401 detection.

**Primary recommendation:** Use the existing stack entirely -- no new library installations needed except `input-otp` (added via `npx shadcn@latest add input-otp`). Build auth as a single `/auth` route with tabbed login/signup and inline view states for OTP verification and password reset. Use `createBrowserRouter` with a layout route pattern for the dashboard shell.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Auth page flow:**
- Single auth page with tabs for login and signup (e.g., `/auth`)
- Verify and reset flows handled as view states within the auth page, not separate routes
- After signup: form transforms inline to OTP verification input (no page redirect)
- After successful OTP verification: user is automatically logged in and redirected to dashboard
- Password reset: Claude's discretion on whether inline or separate pages, fitting the tabbed auth pattern
- OTP retry rules:
  - User can re-request OTP after 1-minute cooldown
  - After 3 failed verification attempts, locked out for 30 minutes
  - Handle email delivery failures gracefully (research best approaches for retry/resend UX)

**Dashboard layout:**
- Mobile support is a top-class priority -- design mobile-first, ensure all flows work well on phone
- Bottom tab navigation on mobile, top horizontal navigation on desktop
- Navigation sections for Phase 3: Home and Settings only (more added in later phases)
- Header bar style: Claude's discretion -- pick what fits the responsive layout best
- Home page: clear CTAs and steps, structured to evolve (pre-GitHub state, post-GitHub state, with repos/sites state). Exact content details deferred to implementation phase -- design the layout to accommodate future states

**Auth form design:**
- Split layout: form on one side, brand illustration or marketing copy on the other (like Notion, Figma)
- On mobile: split layout collapses appropriately (likely form-only or stacked)
- Validation: inline errors below each invalid field + common error banner within the form for general errors (e.g., "invalid credentials")
- Avoid toast notifications unless absolutely necessary
- OTP input: individual digit boxes (6 digits), auto-advance focus, must support paste (pasting fills all boxes). Research best UX patterns for this
- GitHub OAuth button: visible but disabled with "Coming soon" or similar disabled state on login/signup

**Session & navigation guards:**
- Unauthenticated users accessing dashboard routes: silently redirect to auth page (login tab), then redirect back to original page after successful login
- Authenticated users visiting auth page: always redirect to dashboard
- Session expiry: both proactive detection (polling/heartbeat) AND lazy detection (on API 401 responses)
- On session expiry: show "Please log in again" message, then redirect to auth page
- Auth loading state: full-screen loader/spinner while auth state is being determined on page load (no blank flash)

### Claude's Discretion
- Password reset flow structure (inline vs separate views within the auth page)
- Dashboard header bar design (avatar dropdown, logo placement, etc.)
- Split layout specifics (illustration content, responsive collapse behavior)
- Loading spinner/skeleton design
- Exact polling interval for proactive session detection
- Home page placeholder content and CTA copy

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.0 | UI framework | Project stack |
| react-router-dom | 7.13.0 | Client-side routing | Project stack; v7 imports from `react-router` preferred but `react-router-dom` still works |
| react-hook-form | 7.71.1 | Form state management | Project stack; uncontrolled components, minimal re-renders |
| @hookform/resolvers | 5.2.2 | Schema validation bridge | Connects Zod schemas to react-hook-form; supports Zod v4 |
| zod | 4.3.6 | Schema validation | Project stack; Zod v4 (not v3) -- `import { z } from "zod"` still works |
| better-auth | 1.4.18 | Auth client | Project stack; React client in `lib/auth.ts` with `emailOTPClient()` |
| @tanstack/react-query | 5.90.20 | Server state management | Project stack; 5min staleTime, 1 retry |
| zustand | 5.0.11 | Client state management | Project stack; for UI state (not server data) |
| tailwindcss | 4.1.18 | Styling | Project stack; v4 CSS-first config |
| lucide-react | 0.563.0 | Icons | Project stack; shadcn/ui default icon library |
| radix-ui | 1.4.3 | Primitive components | Underlies shadcn/ui components |

### Supporting (needs shadcn CLI install)

| Library | Purpose | When to Use |
|---------|---------|-------------|
| input-otp | OTP digit input | Underlies shadcn/ui InputOTP component; install via `npx shadcn@latest add input-otp` |

### shadcn/ui Components Needed

Install via `npx shadcn@latest add [component]` from the `frontend/` directory:

| Component | Purpose |
|-----------|---------|
| button | Form submit buttons, nav items |
| input | Email, password fields |
| field | Form field wrapper with label, description, error |
| tabs | Login/signup tab switching |
| input-otp | OTP 6-digit input with auto-advance and paste |
| card | Form containers, dashboard cards |
| separator | Visual dividers (e.g., "or continue with") |
| alert | Error banners within forms |
| avatar | User avatar in header |
| dropdown-menu | User menu in header |
| badge | "Coming soon" badge on GitHub OAuth button |
| spinner / loader | Loading states (may need custom) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hook-form | TanStack Form | shadcn/ui docs show react-hook-form integration; already installed |
| Zod | TypeBox (backend uses it) | Zod is the frontend standard; TypeBox is backend-only for @fastify/env |
| Custom OTP input | react-otp-input | shadcn/ui InputOTP uses input-otp by guilhermerodz; better integration |
| Custom bottom nav | Radix NavigationMenu | Custom with Tailwind is simpler for bottom tab pattern |

**Installation:**
```bash
cd frontend
npx shadcn@latest add button input field tabs input-otp card separator alert avatar dropdown-menu badge
```

## Architecture Patterns

### Recommended Project Structure

```
frontend/src/
  components/
    ui/           # shadcn/ui primitives (auto-generated)
    auth/         # Auth-specific components (LoginForm, SignupForm, OtpVerification, etc.)
    layout/       # Dashboard layout components (DashboardShell, Header, BottomNav, TopNav)
  hooks/
    useAuth.ts    # Auth state hook wrapping better-auth useSession
    useAuthGuard.ts # Route protection logic
  lib/
    api.ts        # apiFetch wrapper (existing)
    auth.ts       # better-auth React client (existing)
    queryClient.ts # TanStack Query client (existing)
    utils.ts      # cn() utility (existing)
    schemas/      # Zod validation schemas for forms
  pages/
    AuthPage.tsx  # Single auth page with tabbed login/signup + inline verify/reset
    HomePage.tsx  # Dashboard home with CTAs
    SettingsPage.tsx # Settings placeholder
  stores/
    authStore.ts  # Zustand store for auth UI state (active tab, view state, etc.)
  routes.tsx      # React Router configuration
  app.tsx         # Root component with providers
  main.tsx        # React root entry point
  index.css       # Tailwind + shadcn/ui theme variables (existing)
```

### Pattern 1: Auth Page State Machine

**What:** The auth page manages multiple view states (login, signup, verify-otp, forgot-password, reset-password) as a single-page state machine rather than separate routes.

**When to use:** When the user decision requires inline transitions without page redirects.

**Example:**
```typescript
// stores/authStore.ts
import { create } from 'zustand'

type AuthView = 'login' | 'signup' | 'verify-otp' | 'forgot-password' | 'reset-password'

interface AuthStore {
  view: AuthView
  email: string // preserved across view transitions
  setView: (view: AuthView) => void
  setEmail: (email: string) => void
  reset: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  view: 'login',
  email: '',
  setView: (view) => set({ view }),
  setEmail: (email) => set({ email }),
  reset: () => set({ view: 'login', email: '' }),
}))
```

**Rationale:** Zustand manages the auth view state because it is pure client UI state (not server data). The email is preserved across transitions so the user does not have to re-enter it (e.g., signup -> verify-otp, forgot-password -> reset-password).

### Pattern 2: Protected Route Layout

**What:** Use React Router's layout route pattern with an auth-checking wrapper component.

**When to use:** All dashboard routes that require authentication.

**Example:**
```typescript
// routes.tsx
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'

function AuthLayout() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) return <FullScreenLoader />
  if (session) return <Navigate to="/" replace />

  return <Outlet />
}

function DashboardLayout() {
  const { data: session, isPending } = authClient.useSession()
  const location = useLocation()

  if (isPending) return <FullScreenLoader />
  if (!session) return <Navigate to="/auth" state={{ from: location }} replace />

  return <DashboardShell><Outlet /></DashboardShell>
}

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/auth', element: <AuthPage /> },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
```

### Pattern 3: Form with react-hook-form + Zod + shadcn/ui Field

**What:** Standard form pattern using Zod schema for validation, react-hook-form for state, and shadcn/ui Field components for presentation.

**When to use:** Every auth form (login, signup, reset password).

**Example:**
```typescript
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const [formError, setFormError] = useState<string | null>(null)

  async function onSubmit(data: LoginFormData) {
    setFormError(null)
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setFormError(error.message ?? 'Invalid credentials')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {formError && <Alert variant="destructive"><AlertDescription>{formError}</AlertDescription></Alert>}

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input {...field} id="email" type="email" aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input {...field} id="password" type="password" aria-invalid={fieldState.invalid} />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}
```

### Pattern 4: OTP Input with shadcn/ui InputOTP

**What:** 6-digit OTP input with auto-advance, paste support, and digits-only validation.

**When to use:** Email verification after signup and password reset flows.

**Example:**
```typescript
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS } from 'input-otp'

function OtpVerification({ email }: { email: string }) {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleComplete(value: string) {
    setError(null)
    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp: value,
    })
    if (error) {
      setError(error.message ?? 'Invalid verification code')
      setOtp('')
    }
    // On success, better-auth auto-signs in if autoSignIn is enabled
  }

  return (
    <div>
      <InputOTP
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS}
        value={otp}
        onChange={setOtp}
        onComplete={handleComplete}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}
```

### Pattern 5: Session Polling + Lazy 401 Detection

**What:** Dual-strategy session expiry detection combining periodic polling and 401 response interception.

**When to use:** Dashboard routes to detect session expiry.

**Example:**
```typescript
// hooks/useSessionPolling.ts
import { useEffect, useRef } from 'react'
import { authClient } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'

const POLL_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useSessionPolling() {
  const navigate = useNavigate()
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const { data, error } = await authClient.getSession()
      if (error || !data) {
        navigate('/auth', { state: { expired: true } })
      }
    }, POLL_INTERVAL)

    return () => clearInterval(intervalRef.current)
  }, [navigate])
}

// Lazy 401 detection in apiFetch wrapper
// Modify lib/api.ts to check for 401 and trigger redirect
```

### Pattern 6: Responsive Dashboard Shell

**What:** Mobile-first dashboard with bottom tabs on small screens and top horizontal nav on desktop.

**When to use:** The dashboard wrapper layout.

**Example:**
```typescript
// components/layout/DashboardShell.tsx
function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop header - hidden on mobile */}
      <header className="hidden md:flex items-center justify-between px-6 h-16 border-b">
        <Logo />
        <TopNav />
        <UserMenu />
      </header>

      {/* Mobile header - simple with logo and avatar */}
      <header className="flex md:hidden items-center justify-between px-4 h-14 border-b">
        <Logo size="sm" />
        <UserMenu />
      </header>

      {/* Main content area */}
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Bottom tab navigation - mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t bg-background">
        <BottomTabs />
      </nav>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Do not use TanStack Query for auth session state.** better-auth's `useSession()` hook manages its own reactivity. Wrapping it in `useQuery` creates double-caching and stale state conflicts. Use `useSession()` directly.
- **Do not store server auth state in Zustand.** Session data comes from `useSession()`. Zustand is only for UI state like which auth view is active, whether the mobile menu is open, etc.
- **Do not create separate route files for each auth sub-flow.** The auth page is a single route (`/auth`) with inline view transitions managed by Zustand state. OTP verification, password reset -- all render within the same page component.
- **Do not use toast notifications for form errors.** User decision: inline field errors + form-level error banners only. Toasts are reserved for exceptional cases only.
- **Do not hardcode API URLs.** Use relative `/api` paths through the existing `apiFetch` wrapper and the auth client's `/api/v1` baseURL.
- **Do not use `import.meta.env`.** Frontend has no environment variables -- the relative API path works because Caddy proxies.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OTP digit input | Custom input splitting/focus logic | shadcn/ui InputOTP (wraps input-otp) | Handles paste, auto-advance, focus, accessibility, password manager detection |
| Form validation | Manual validation functions | react-hook-form + Zod schemas | Type-safe, minimal re-renders, schema-first validation |
| Auth session reactivity | Custom fetch + state management | `authClient.useSession()` from better-auth/react | Built-in reactivity, automatic cookie handling, error states |
| Route protection | Manual redirect logic scattered | React Router layout routes with auth check | Centralized, declarative, handles loading states |
| Class name merging | Manual string concatenation | `cn()` from `lib/utils.ts` (clsx + tailwind-merge) | Handles conflicts between Tailwind classes correctly |
| Form field accessibility | Manual aria attributes | shadcn/ui Field + FieldLabel + FieldError | Semantic HTML, `data-invalid`, `aria-invalid` patterns built in |

**Key insight:** The project already has react-hook-form, Zod, better-auth client, and shadcn/ui configured. The work is wiring these together, not introducing new libraries.

## Common Pitfalls

### Pitfall 1: better-auth Method Names for emailOTP Password Reset

**What goes wrong:** Using the wrong method names for the OTP-based password reset flow. The email/password plugin has `forgetPassword()` (link-based), but the emailOTP plugin uses different methods.
**Why it happens:** Confusion between the base email/password plugin methods and the emailOTP plugin methods.
**How to avoid:** Use the emailOTP-specific methods:
  - Request reset: `authClient.emailOtp.requestPasswordReset({ email })`
  - Complete reset: `authClient.emailOtp.resetPassword({ email, otp, password })`
  - Do NOT use `authClient.forgetPassword()` (that is the link-based flow from email/password plugin)
**Warning signs:** Getting 404 errors or "method not found" from the auth client.

### Pitfall 2: Zod v4 Import and zodResolver Compatibility

**What goes wrong:** Type errors when using Zod v4 schemas with `zodResolver`.
**Why it happens:** The project uses Zod 4.3.6 (not v3). Earlier versions of `@hookform/resolvers` had type issues with Zod v4.
**How to avoid:** The project has `@hookform/resolvers@5.2.2` which supports Zod v4. Use the standard `zodResolver` import:
  ```typescript
  import { zodResolver } from '@hookform/resolvers/zod'
  ```
  If type issues arise, the alternative `standardSchemaResolver` from `@hookform/resolvers/standard-schema` also works with Zod v4.
**Warning signs:** TypeScript errors on `resolver: zodResolver(schema)`.

### Pitfall 3: React Router v7 Import Path

**What goes wrong:** Importing from `react-router-dom` instead of `react-router`.
**Why it happens:** React Router v7 consolidated packages; `react-router-dom` is now a re-export wrapper.
**How to avoid:** Either import works in v7 (`react-router-dom` re-exports everything), but for consistency with the project's existing `react-router-dom` dependency, continue using `react-router-dom` imports. Both are valid.
**Warning signs:** None -- both work. This is a style choice.

### Pitfall 4: OTP Retry/Lockout Must Be Client-Side

**What goes wrong:** Assuming the backend handles the 1-minute resend cooldown and 30-minute lockout.
**Why it happens:** better-auth's emailOTP plugin has `allowedAttempts` (default 3) which invalidates the OTP after 3 wrong attempts, but it does NOT enforce a cooldown timer between resend requests or a 30-minute lockout.
**How to avoid:** Implement the following on the client:
  - **1-minute cooldown:** Track the last OTP request timestamp in component state. Disable the "Resend" button with a countdown timer until 60 seconds have passed.
  - **3 failed attempts -> 30-minute lockout:** Track attempt count in component state (or Zustand). After 3 consecutive failures from the API, show a lockout message with a 30-minute timer. Store the lockout expiry in `localStorage` so it persists across page reloads.
  - The backend's `allowedAttempts: 3` will also invalidate the OTP server-side, so the user MUST request a new OTP after 3 failures regardless.
**Warning signs:** Users can spam the resend button; no cooldown visible.

### Pitfall 5: Split Layout on Mobile

**What goes wrong:** The split layout (form + illustration) looks broken on small screens.
**Why it happens:** Not implementing the mobile collapse properly.
**How to avoid:** Use Tailwind's responsive classes: the split layout should be `grid grid-cols-1 lg:grid-cols-2`. On mobile (`< lg`), only the form side renders. The illustration/marketing side uses `hidden lg:flex` to show only on large screens.
**Warning signs:** Horizontal scrolling on mobile, squished form fields.

### Pitfall 6: Session Loading Flash

**What goes wrong:** User sees a brief flash of the auth page or blank content before the session check completes.
**Why it happens:** `useSession()` has an initial `isPending: true` state while fetching.
**How to avoid:** Show a full-screen loader/spinner while `isPending` is true in both `AuthLayout` and `DashboardLayout`. Never render content or perform redirects until the session check completes.
**Warning signs:** Flicker between auth page and dashboard on page load.

### Pitfall 7: better-auth signUp autoSignIn with requireEmailVerification

**What goes wrong:** Expecting the user to be automatically signed in after signup.
**Why it happens:** The backend has `requireEmailVerification: true` AND `autoSignIn: true`. When email verification is required, `autoSignIn` signs the user in but they still need to verify their email before they can use authenticated endpoints.
**How to avoid:** After signup, the backend sends an OTP automatically (`sendVerificationOnSignUp: true`). The frontend should immediately transition to the OTP verification view. After successful OTP verification via `authClient.emailOtp.verifyEmail()`, the user's email is verified and they are already signed in (from `autoSignIn`). Then redirect to dashboard.
**Warning signs:** User appears logged in but gets 403 on API calls because email is not verified.

## Code Examples

### better-auth Client Methods Reference

```typescript
// lib/auth.ts (existing)
import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: '/api/v1',
  plugins: [emailOTPClient()],
})

// Type inference for session
export type Session = typeof authClient.$Infer.Session
```

### Auth Client Method Signatures

```typescript
// Sign up (sends OTP automatically via sendVerificationOnSignUp)
const { data, error } = await authClient.signUp.email({
  email: string,
  password: string,
  name: string,
})

// Sign in with email/password
const { data, error } = await authClient.signIn.email({
  email: string,
  password: string,
  callbackURL?: string,  // optional redirect
  rememberMe?: boolean,  // default true
})

// Verify email with OTP (after signup)
const { data, error } = await authClient.emailOtp.verifyEmail({
  email: string,
  otp: string,
})

// Send/resend verification OTP
const { data, error } = await authClient.emailOtp.sendVerificationOtp({
  email: string,
  type: 'email-verification' | 'sign-in' | 'forget-password',
})

// Request password reset OTP
const { data, error } = await authClient.emailOtp.requestPasswordReset({
  email: string,
})

// Reset password with OTP
const { data, error } = await authClient.emailOtp.resetPassword({
  email: string,
  otp: string,
  password: string,
})

// Get session (reactive hook)
const { data: session, isPending, error } = authClient.useSession()

// Get session (one-time fetch)
const { data: session, error } = await authClient.getSession()

// Sign out
await authClient.signOut()
```

### Zod Validation Schemas

```typescript
// lib/schemas/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
```

### OTP Cooldown and Retry Logic

```typescript
// Example resend cooldown logic
function useOtpCooldown(cooldownSeconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  const startCooldown = useCallback(() => {
    setSecondsLeft(cooldownSeconds)
  }, [cooldownSeconds])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  return {
    canResend: secondsLeft === 0,
    secondsLeft,
    startCooldown,
  }
}
```

### Lazy 401 Detection in apiFetch

```typescript
// Modify lib/api.ts to detect session expiry
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
    ...options,
  })

  if (response.status === 401) {
    // Session expired -- trigger redirect
    // Use a custom event or Zustand store to signal auth expiry
    window.dispatchEvent(new CustomEvent('auth:expired'))
    throw new Error('Session expired')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error((error as { message?: string }).message ?? `API error: ${response.status}`)
  }

  return response.json() as Promise<T>
}
```

## Recommendations for Claude's Discretion Areas

### Password Reset Flow: Inline Within Auth Page

**Recommendation:** Keep the password reset as inline view states within the auth page, matching the verify-otp pattern.

**Flow:**
1. User clicks "Forgot password?" link on login tab
2. View transitions to `forgot-password` state showing an email input
3. User submits email -> OTP is sent -> view transitions to `reset-password` state
4. User enters OTP + new password + confirm password -> submits
5. On success -> show success message, transition to `login` state

**Rationale:** Consistent with the signup -> verify-otp inline transition. No separate routes needed. The email is preserved in Zustand state across transitions.

### Dashboard Header Bar Design

**Recommendation:** Minimal header with logo on the left and user avatar dropdown on the right.

- **Desktop:** Logo (left), horizontal nav links (center or left-aligned after logo), user avatar with dropdown (right)
- **Mobile:** Logo (left), user avatar with dropdown (right). Navigation moves to bottom tabs.
- **Avatar dropdown contents:** User name/email display, Settings link, Sign out button
- **No hamburger menu.** Navigation lives in bottom tabs on mobile, not in a hamburger.

### Split Layout Responsive Collapse

**Recommendation:** On mobile (below `lg` breakpoint), hide the illustration side entirely. Show form-only in a centered card layout.

- **Desktop (lg+):** Two-column grid. Left: illustration/marketing copy with brand gradient background. Right: auth form in a card.
- **Mobile (< lg):** Single column, full-width form. No illustration. Form rendered in a clean card or directly on the background.
- Use `grid grid-cols-1 lg:grid-cols-2 min-h-screen` for the split container.

### Loading Spinner Design

**Recommendation:** Simple centered spinner with the Barae logo or a generic loading indicator.

- Full-screen: `fixed inset-0 flex items-center justify-center bg-background`
- Use a simple CSS spinner (Tailwind's `animate-spin` on an SVG) or lucide-react's `Loader2` icon with `animate-spin`
- Keep it minimal -- no skeleton screens for auth loading (the content is not predictable enough for skeletons)

### Session Polling Interval

**Recommendation:** 5 minutes (300,000ms).

- Matches TanStack Query's staleTime (5 minutes) for consistency
- Low enough frequency to avoid unnecessary server load
- Supplemented by lazy 401 detection on every API call, so expired sessions are caught quickly during active use
- Polling catches expiry during idle periods (user has the tab open but is not actively making API calls)

### Home Page Placeholder Content

**Recommendation:** A "Getting Started" section with numbered steps that evolve based on state.

- **Pre-GitHub state (Phase 3):** "Welcome to Barae" heading, brief description, and a primary CTA: "Connect GitHub" (disabled with "Coming in next update" or similar). Below, show placeholder steps: 1. Connect GitHub 2. Choose a template 3. Create your site.
- **Structure it as a card-based layout** so future phases can replace placeholders with real functionality.
- Use muted/disabled styling for steps that are not yet available.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-router-dom imports | react-router imports | React Router v7 (2025) | Both work; react-router-dom re-exports. Project uses react-router-dom which is fine. |
| shadcn/ui Form + FormField | shadcn/ui Field + Controller | shadcn/ui 2025 update | New Field component is library-agnostic. Use Field + Controller pattern. |
| Zod v3 z.object().parse() | Zod v4 same API surface | Zod v4 (2025) | Mostly backward compatible. `z.infer` still works. Error customization changed slightly. |
| zodResolver (v3 only) | zodResolver (v3 + v4 auto-detect) | @hookform/resolvers 5.x | Seamless; no code changes needed for Zod v4 |

**Deprecated/outdated:**
- shadcn/ui `<Form>` wrapper with `<FormField>`: Replaced by the `<Field>` component pattern with `<Controller>`. The old Form component still exists but the newer Field approach is recommended.
- `react-router-dom` package: Still works but `react-router` is the canonical package in v7.

## Open Questions

1. **better-auth `autoSignIn` + `requireEmailVerification` interaction**
   - What we know: Backend has both enabled. `autoSignIn` creates a session on signup, but the session may be restricted until email is verified.
   - What's unclear: Does `verifyEmail()` automatically make the existing session "verified," or does the user need to sign in again after verification?
   - Recommendation: Test during implementation. If `verifyEmail()` upgrades the existing session, redirect to dashboard immediately. If not, call `signIn.email()` after verification. The user decision says "after successful OTP verification, user is automatically logged in" -- so if the existing session works, great; if not, sign in programmatically.

2. **30-minute lockout persistence**
   - What we know: User wants 30-minute lockout after 3 failed OTP attempts. better-auth's `allowedAttempts` invalidates the OTP after 3 failures but does not enforce a time-based lockout.
   - What's unclear: Whether the backend should enforce this or the client is sufficient.
   - Recommendation: Implement client-side with `localStorage` timestamp. The backend already invalidates the OTP after 3 attempts, so even without client-side lockout, the user must request a new OTP. The 30-minute client-side lockout is an additional UX guard. If the user clears localStorage, they can try again but still need a valid OTP.

3. **better-auth error codes for specific failures**
   - What we know: The auth client returns `{ error: { message, status, code } }`. Error code `TOO_MANY_ATTEMPTS` is documented for exceeding `allowedAttempts`.
   - What's unclear: Full list of error codes for different failure scenarios (invalid credentials, email not found, etc.).
   - Recommendation: Handle errors generically with the `error.message` string. Map known codes (like `TOO_MANY_ATTEMPTS`) to specific UI behaviors. Test and document codes discovered during implementation.

## Sources

### Primary (HIGH confidence)
- [better-auth Client docs](https://www.better-auth.com/docs/concepts/client) - React client API, useSession, signUp, signIn
- [better-auth Email OTP plugin](https://www.better-auth.com/docs/plugins/email-otp) - OTP methods, allowedAttempts, sendVerificationOtp, verifyEmail, resetPassword
- [better-auth Email & Password](https://www.better-auth.com/docs/authentication/email-password) - signUp.email, signIn.email, password rules
- [better-auth Session Management](https://www.better-auth.com/docs/concepts/session-management) - expiresIn, updateAge, cookie-based sessions
- [shadcn/ui InputOTP](https://ui.shadcn.com/docs/components/radix/input-otp) - Component API, paste support, REGEXP_ONLY_DIGITS
- [shadcn/ui Field](https://ui.shadcn.com/docs/components/field) - Field, FieldLabel, FieldError, FieldDescription component API
- [shadcn/ui Tabs](https://ui.shadcn.com/docs/components/radix/tabs) - Tabs, TabsList, TabsTrigger, TabsContent API
- [shadcn/ui React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form) - Integration pattern with Controller + Field

### Secondary (MEDIUM confidence)
- [better-auth OTP Forgot Password flow](https://dev.to/rogasper/how-to-build-a-secure-forgot-password-flow-with-otp-in-better-auth-4lek) - forgetPassword.emailOtp -> emailOtp.requestPasswordReset migration
- [React Router v7 Protected Routes](https://www.robinwieruch.de/react-router-private-routes/) - Layout route pattern for auth guards
- [React Hook Form + Zod 2026](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) - Zod v4 compatibility with zodResolver
- [React Router v7 Migration](https://dev.to/utkvishwas/react-router-v7-a-comprehensive-guide-migration-from-v6-7d1) - Import consolidation in v7
- [input-otp GitHub](https://github.com/guilhermerodz/input-otp) - Paste transformer, password manager detection

### Tertiary (LOW confidence)
- [React session polling patterns](https://www.dhiwise.com/post/a-guide-to-real-time-applications-with-react-polling) - General polling interval recommendations

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and verified in package.json; versions confirmed
- Architecture: HIGH - Patterns follow official docs from shadcn/ui, better-auth, and React Router
- Pitfalls: HIGH - Verified against official better-auth docs for method names and config behavior
- Auth client API: HIGH - Method signatures confirmed against official better-auth documentation
- OTP lockout implementation: MEDIUM - Client-side enforcement is a design choice; backend only has `allowedAttempts`
- Zod v4 + zodResolver: MEDIUM - Reports of type issues exist but @hookform/resolvers 5.2.2 claims support

**Research date:** 2026-02-06
**Valid until:** 2026-03-06 (stable stack, all libraries at recent versions)
