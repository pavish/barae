# Phase 1: Foundation & Auth - Research

**Researched:** 2026-02-03
**Domain:** Authentication (better-auth) + React Dashboard (Vite)
**Confidence:** HIGH

## Summary

This phase implements user authentication and a responsive dashboard shell using better-auth with Drizzle adapter for the Fastify backend and React + Vite for the frontend. Better-auth is a comprehensive TypeScript authentication library that provides email/password authentication, GitHub OAuth, session management, email verification, and password reset out of the box with minimal configuration.

The frontend will use React 19 with Vite, React Router v7 for routing with protected routes, react-hook-form with Zod for form validation, and Tailwind CSS for styling including dark mode support. Better-auth provides a React client with hooks like `useSession` that automatically sync UI state with authentication changes.

**Primary recommendation:** Use better-auth's built-in features for all auth flows (don't customize unless necessary), and structure the frontend with feature-based organization separating auth, dashboard, and settings modules.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-auth | latest | Authentication framework | Full-featured TypeScript auth with Drizzle adapter, handles sessions, OAuth, email flows |
| @better-auth/cli | latest | Schema generation | CLI tool to generate Drizzle schema for auth tables |
| react | ^19.0.0 | UI framework | Latest stable with improved hooks and concurrent features |
| react-dom | ^19.0.0 | React DOM bindings | Required for React web apps |
| vite | ^6.x | Build tool | Fast dev server, HMR, optimized builds |
| react-router-dom | ^7.x | Client routing | Latest with data-first approach, protected routes support |
| @tanstack/react-query | ^5.x | Server state | Caching, background updates, optimistic UI |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | ^7.x | Form handling | All forms (login, signup, settings) |
| @hookform/resolvers | ^3.x | Validation integration | Connect Zod schemas to forms |
| zod | ^3.x | Schema validation | Shared validation between frontend and backend |
| tailwindcss | ^4.x | Utility CSS | All styling, dark mode support |
| @fastify/cors | ^11.x | CORS handling | Already installed, needed for auth endpoints |
| resend | latest | Email sending | Verification and password reset emails |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| better-auth | Auth.js/NextAuth | Auth.js less TypeScript-native, better-auth has better Drizzle integration |
| Resend | Nodemailer | Nodemailer requires SMTP setup; Resend is API-based, simpler for serverless |
| TanStack Query | SWR | TanStack has more features, better devtools, more widely adopted |
| Tailwind CSS | CSS Modules | Tailwind faster development, built-in dark mode, responsive utilities |

**Installation (Backend):**
```bash
npm install better-auth resend
npm install -D @better-auth/cli
```

**Installation (Frontend):**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router-dom @tanstack/react-query react-hook-form @hookform/resolvers zod better-auth
npm install -D tailwindcss @tailwindcss/vite
```

## Architecture Patterns

### Recommended Project Structure

```
backend/
  src/
    auth/
      index.ts           # better-auth instance configuration
      schema.ts          # Generated auth schema (from CLI)
    plugins/
      auth.ts            # Fastify plugin wrapping auth handler
    routes/
      api/               # Protected API routes
    db/
      schema/
        index.ts         # Re-export all schemas including auth
    index.ts

frontend/
  src/
    features/
      auth/
        components/      # AuthPage, LoginForm, SignupForm
        hooks/           # useAuth custom hook
        lib/             # auth-client.ts (better-auth client)
      dashboard/
        components/      # Shell, Sidebar, Header
        pages/           # DashboardPage, EmptyState
      settings/
        components/      # SettingsPage, ProfileForm, SecurityForm
        pages/
    shared/
      components/        # Button, Input, Modal, Banner
      hooks/             # useTheme, useMediaQuery
      lib/               # api client, utils
    routes/
      index.tsx          # Router configuration
      ProtectedRoute.tsx
    App.tsx
    main.tsx
```

### Pattern 1: Better-Auth Fastify Integration

**What:** Mount better-auth handler as catch-all route
**When to use:** All auth endpoints (signup, signin, oauth, session)

```typescript
// Source: https://www.better-auth.com/docs/integrations/fastify
// backend/src/plugins/auth.ts
import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { auth } from '../auth/index.js'

async function authPlugin(fastify: FastifyInstance) {
  fastify.all('/api/auth/*', async (request: FastifyRequest, reply: FastifyReply) => {
    const url = new URL(request.url, `http://${request.headers.host}`)

    const headers = new Headers()
    for (const [key, value] of Object.entries(request.headers)) {
      if (value) headers.append(key, Array.isArray(value) ? value.join(', ') : value)
    }

    const response = await auth.handler(new Request(url, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? JSON.stringify(request.body)
        : undefined,
    }))

    // Forward response
    reply.status(response.status)
    response.headers.forEach((value, key) => reply.header(key, value))

    const body = await response.text()
    return reply.send(body)
  })
}

export default fp(authPlugin, { name: 'auth' })
```

### Pattern 2: Better-Auth Configuration with Drizzle

**What:** Configure better-auth with all required features
**When to use:** Initial auth setup

```typescript
// Source: https://www.better-auth.com/docs/installation
// backend/src/auth/index.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db/index.js'
import * as schema from './schema.js'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false, // Non-blocking per CONTEXT.md
    sendVerificationEmail: async ({ user, url }) => {
      // Send via Resend - don't await to prevent timing attacks
      sendVerificationEmail(user.email, url)
    },
    sendResetPassword: async ({ user, url }) => {
      sendPasswordResetEmail(user.email, url)
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days for "remember me"
    updateAge: 60 * 60 * 24,      // Refresh daily
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache
    },
  },

  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
  ],
})
```

### Pattern 3: React Protected Routes

**What:** Wrapper component that redirects unauthenticated users
**When to use:** All dashboard routes

```typescript
// Source: https://blog.logrocket.com/authentication-react-router-v7/
// frontend/src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../features/auth/lib/auth-client'

export function ProtectedRoute() {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) {
    return <LoadingSpinner /> // Or skeleton
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <Outlet />
}
```

### Pattern 4: Dark Mode with System Preference

**What:** Theme toggle supporting light/dark/system
**When to use:** Dashboard shell, user settings

```typescript
// Source: https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/
// frontend/src/shared/hooks/useTheme.ts
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system'
  })

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (t: Theme) => {
      if (t === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', isDark)
      } else {
        root.classList.toggle('dark', t === 'dark')
      }
    }

    applyTheme(theme)
    localStorage.setItem('theme', theme)

    // Listen for system preference changes
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      media.addEventListener('change', handler)
      return () => media.removeEventListener('change', handler)
    }
  }, [theme])

  return { theme, setTheme }
}
```

### Pattern 5: Form Validation with react-hook-form + Zod

**What:** Type-safe forms with runtime validation
**When to use:** All forms (login, signup, password reset, settings)

```typescript
// Source: https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1
// frontend/src/features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().default(true),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: true },
  })

  const onSubmit = async (data: LoginForm) => {
    await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields with errors[field]?.message */}
    </form>
  )
}
```

### Anti-Patterns to Avoid

- **Storing session in React state:** Use better-auth's `useSession` hook which automatically syncs with cookies
- **Custom auth middleware:** Use better-auth's built-in session management instead of rolling your own JWT handling
- **Awaiting email sends:** Prevents timing attacks - fire and forget email sends
- **Hardcoded CORS origins:** Use environment variables for trusted origins
- **Global error handlers hiding auth errors:** Return specific error codes so frontend can show appropriate messages

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management | JWT implementation | better-auth sessions | Handles token rotation, expiry, cookies automatically |
| Password hashing | bcrypt/argon2 wrapper | better-auth (uses scrypt) | Handles salt, timing-safe comparison |
| OAuth flow | Manual OAuth dance | better-auth socialProviders | Handles state, PKCE, callback, token exchange |
| Email verification tokens | UUID + expiry logic | better-auth sendVerificationEmail | Handles secure token generation, expiry |
| CSRF protection | Manual token handling | better-auth (built-in) | Automatic with same-site cookies |
| Form validation | Manual if/else | react-hook-form + zod | Type inference, performance, error handling |
| Dark mode | CSS custom properties | Tailwind dark: + useTheme hook | Built-in class toggling, media query support |
| Protected routes | Manual session checks | ProtectedRoute component | Centralized, consistent redirect handling |

**Key insight:** better-auth handles 95% of auth edge cases. Custom auth code introduces security vulnerabilities and maintenance burden. Use the library's features even if they seem "simple" to build.

## Common Pitfalls

### Pitfall 1: CORS Blocking Better-Auth Endpoints

**What goes wrong:** Auth endpoints return CORS errors while regular API endpoints work
**Why it happens:** Better-auth creates its own Request/Response objects; CORS must be configured both in Fastify AND in better-auth's trustedOrigins
**How to avoid:**
1. Register CORS plugin BEFORE auth plugin
2. Add frontend URL to better-auth `trustedOrigins` array
3. Ensure credentials: 'include' on client fetch calls
**Warning signs:** "Access-Control-Allow-Origin" errors only on /api/auth/* routes

### Pitfall 2: Remember Me Not Working

**What goes wrong:** Users always stay logged in or never stay logged in
**Why it happens:** Misunderstanding of how better-auth's `rememberMe` works - it's passed per sign-in call, not configured globally
**How to avoid:**
- Pass `rememberMe: true` in signIn.email() call when checkbox is checked
- Default session expiry is 7 days; for "remember me" checked, session expiry should be longer (30 days)
- When `rememberMe: false`, cookie has no maxAge (session cookie)
**Warning signs:** Same behavior regardless of checkbox state

### Pitfall 3: Session Expiry Modal Not Appearing

**What goes wrong:** User is suddenly logged out instead of prompted to re-authenticate
**Why it happens:** No active session validity checking on the frontend
**How to avoid:**
- Use TanStack Query with refetch interval to poll session status
- Implement global error boundary that catches 401s
- Show modal when session expires but user has activity
**Warning signs:** User complaints about losing work when session expires

### Pitfall 4: Email Verification Timing Attack

**What goes wrong:** Attackers can enumerate valid emails by timing response
**Why it happens:** Awaiting email send makes verified/unverified paths take different times
**How to avoid:**
- Never await the sendVerificationEmail function
- Return success response immediately regardless of email validity
- Use `waitUntil` on serverless platforms
**Warning signs:** Measurable timing difference between valid and invalid emails

### Pitfall 5: GitHub OAuth Email Not Found

**What goes wrong:** "email_not_found" error when signing in with GitHub
**Why it happens:** GitHub App doesn't have email read permission
**How to avoid:**
- Go to GitHub App settings > Permissions and Events > Account Permissions
- Set "Email Addresses" to "Read-Only"
- Ensure user:email scope is requested
**Warning signs:** Works with some GitHub accounts but not others (private email settings)

### Pitfall 6: Hydration Mismatch with Dark Mode

**What goes wrong:** Flash of wrong theme, React hydration warnings
**Why it happens:** Server renders with default theme, client has different localStorage value
**How to avoid:**
- For SPA (Vite), not an issue - no SSR
- Apply theme class in index.html script tag BEFORE React loads
- Use Tailwind's `dark:` prefix consistently
**Warning signs:** Brief flash of light mode when dark is preferred

### Pitfall 7: Form Submission During Session Expiry

**What goes wrong:** User fills form, submits, gets logged out, loses data
**Why it happens:** Session expired between page load and form submit
**How to avoid:**
- Check session validity before showing important forms
- On 401 error, show re-auth modal instead of redirecting
- Store form data in localStorage as backup
**Warning signs:** User complaints about lost form data

## Code Examples

Verified patterns from official sources:

### Better-Auth Client Setup (React)

```typescript
// Source: https://www.better-auth.com/docs/basic-usage
// frontend/src/features/auth/lib/auth-client.ts
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
  sendVerificationEmail,
  forgetPassword,
  resetPassword,
} = authClient
```

### Sign Up with Password Confirmation

```typescript
// Source: https://www.better-auth.com/docs/authentication/email-password
// frontend/src/features/auth/components/SignupForm.tsx
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// In form submit:
const result = await authClient.signUp.email({
  name: data.name,
  email: data.email,
  password: data.password,
  callbackURL: '/dashboard', // Redirect after signup
})

if (result.error) {
  // Handle specific error codes
  if (result.error.code === 'USER_ALREADY_EXISTS') {
    setError('email', { message: 'Email already registered' })
  }
}
```

### GitHub OAuth Sign In

```typescript
// Source: https://www.better-auth.com/docs/authentication/github
// frontend/src/features/auth/components/GithubButton.tsx
import { signIn } from '../lib/auth-client'

export function GithubButton() {
  const handleClick = async () => {
    await signIn.social({
      provider: 'github',
      callbackURL: '/dashboard',
    })
  }

  return (
    <button onClick={handleClick} className="...">
      Continue with GitHub
    </button>
  )
}
```

### Email Verification Banner

```typescript
// frontend/src/features/dashboard/components/VerificationBanner.tsx
import { useSession, sendVerificationEmail } from '../../auth/lib/auth-client'
import { useState } from 'react'

export function VerificationBanner() {
  const { data: session } = useSession()
  const [sent, setSent] = useState(false)

  if (!session || session.user.emailVerified) return null

  const handleResend = async () => {
    await sendVerificationEmail({
      email: session.user.email,
      callbackURL: '/dashboard',
    })
    setSent(true)
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4">
      <p>Please verify your email to unlock all features.</p>
      <button onClick={handleResend} disabled={sent}>
        {sent ? 'Email sent!' : 'Resend verification email'}
      </button>
    </div>
  )
}
```

### Password Reset Flow

```typescript
// Source: https://www.better-auth.com/docs/authentication/email-password
// frontend/src/features/auth/pages/ForgotPassword.tsx
import { forgetPassword } from '../lib/auth-client'

// Request reset
await forgetPassword({
  email: data.email,
  redirectTo: '/auth/reset-password',
})

// frontend/src/features/auth/pages/ResetPassword.tsx
import { resetPassword } from '../lib/auth-client'
import { useSearchParams } from 'react-router-dom'

// Complete reset (token from URL)
const [searchParams] = useSearchParams()
const token = searchParams.get('token')

await resetPassword({
  token,
  newPassword: data.password,
})
```

### Protected Route with Role Check (Future-proofing)

```typescript
// frontend/src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../features/auth/lib/auth-client'

interface ProtectedRouteProps {
  requireVerified?: boolean
}

export function ProtectedRoute({ requireVerified = false }: ProtectedRouteProps) {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // Enforce email verification for certain routes
  if (requireVerified && !session.user.emailVerified) {
    return <Navigate to="/dashboard" state={{ needsVerification: true }} replace />
  }

  return <Outlet />
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JWT in localStorage | HTTP-only session cookies | 2023+ | Better security, XSS protection |
| Passport.js | better-auth / Auth.js | 2024+ | TypeScript-first, simpler API |
| Create React App | Vite | 2022+ | 10x faster dev server, smaller bundles |
| React Router v6 | React Router v7 | 2025 | Data-first routing, merged with Remix |
| Redux for auth state | Auth library hooks | 2023+ | Less boilerplate, auto-sync with cookies |
| Manual dark mode CSS | Tailwind dark: | 2022+ | Built-in, class-based switching |

**Deprecated/outdated:**
- **Passport.js:** Still works but verbose, callback-heavy, less TypeScript support
- **localStorage for tokens:** Security risk, prefer HTTP-only cookies
- **next-auth (standalone):** Now Auth.js, but better-auth has better DX for non-Next.js

## Open Questions

Things that couldn't be fully resolved:

1. **Session expiry modal timing**
   - What we know: better-auth has session expiry; frontend can poll /api/auth/get-session
   - What's unclear: Exact UX for modal trigger - on next navigation? On next API call? Timer?
   - Recommendation: Use TanStack Query error boundary + onError callback to show modal on 401

2. **Remember me implementation detail**
   - What we know: better-auth signIn.email accepts `rememberMe` boolean
   - What's unclear: Whether this affects cookie maxAge or just session duration in DB
   - Recommendation: Test with browser devtools to verify cookie behavior; may need custom session config

3. **Email sending in Fastify**
   - What we know: Resend has simple API; better-auth calls sendVerificationEmail callback
   - What's unclear: Best pattern for error handling when email fails (user shouldn't know, but we should log)
   - Recommendation: Use Fastify logger, wrap in try/catch, never block response

## Sources

### Primary (HIGH confidence)
- [better-auth docs: Installation](https://www.better-auth.com/docs/installation) - Setup, configuration
- [better-auth docs: Drizzle Adapter](https://www.better-auth.com/docs/adapters/drizzle) - Database integration
- [better-auth docs: Email & Password](https://www.better-auth.com/docs/authentication/email-password) - Auth flows
- [better-auth docs: GitHub OAuth](https://www.better-auth.com/docs/authentication/github) - Social auth
- [better-auth docs: Session Management](https://www.better-auth.com/docs/concepts/session-management) - Sessions
- [better-auth docs: Fastify Integration](https://www.better-auth.com/docs/integrations/fastify) - Handler setup
- [better-auth docs: Basic Usage](https://www.better-auth.com/docs/basic-usage) - Client hooks

### Secondary (MEDIUM confidence)
- [React Router v7 Authentication Guide](https://blog.logrocket.com/authentication-react-router-v7/) - Protected routes
- [React Hook Form with Zod Guide](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) - Form validation
- [CSS-Tricks Dark Mode Guide](https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/) - Theme implementation

### Tertiary (LOW confidence)
- [better-auth GitHub Issues](https://github.com/better-auth/better-auth/issues) - CORS issues, Fastify problems
- WebSearch results for authentication pitfalls - General security patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - better-auth official docs, Vite/React well-documented
- Architecture: HIGH - Patterns from official docs and widely adopted practices
- Pitfalls: MEDIUM - Mix of official docs and community issue reports

**Research date:** 2026-02-03
**Valid until:** 30 days (better-auth is stable, React ecosystem stable)
