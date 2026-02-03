---
phase: 01-foundation-auth
plan: 02
subsystem: auth
tags: [react-hook-form, zod, resend, better-auth, forms, oauth, github, email]

# Dependency graph
requires:
  - phase: 01-01
    provides: better-auth backend, auth-client hooks, ProtectedRoute
provides:
  - Login/Signup forms with validation
  - GitHub OAuth button
  - Password reset flow (forgot/reset pages)
  - Resend email integration for verification and password reset
  - Shared UI components (Button, Input, Card)
affects: [01-03, 02-01]

# Tech tracking
tech-stack:
  added: [react-hook-form, @hookform/resolvers, zod]
  patterns: [Zod schema validation with react-hook-form, fire-and-forget email sending]

key-files:
  created:
    - frontend/src/features/auth/components/LoginForm.tsx
    - frontend/src/features/auth/components/SignupForm.tsx
    - frontend/src/features/auth/components/GithubButton.tsx
    - frontend/src/features/auth/components/ForgotPasswordForm.tsx
    - frontend/src/features/auth/components/ResetPasswordForm.tsx
    - frontend/src/features/auth/pages/AuthPage.tsx
    - frontend/src/features/auth/pages/ForgotPasswordPage.tsx
    - frontend/src/features/auth/pages/ResetPasswordPage.tsx
    - frontend/src/features/auth/schemas/auth.ts
    - frontend/src/shared/components/Button.tsx
    - frontend/src/shared/components/Input.tsx
    - frontend/src/shared/components/Card.tsx
    - backend/src/lib/email.ts
  modified:
    - frontend/src/features/auth/lib/auth-client.ts
    - frontend/src/routes/index.tsx
    - backend/src/auth/index.ts
    - backend/src/config.ts
    - backend/.env.example
    - frontend/package.json

key-decisions:
  - "Two-column auth layout: form on left, GitHub OAuth on right (stacked on mobile)"
  - "Fire-and-forget email sending to prevent timing attacks"
  - "Graceful fallback to console logging when RESEND_API_KEY not set"
  - "Password visibility toggle in Input component for better UX"

patterns-established:
  - "Form validation: Zod schema + react-hook-form zodResolver"
  - "API error handling: Check error.code for specific cases (USER_NOT_FOUND, USER_ALREADY_EXISTS)"
  - "Shared components: Button with variants/sizes, Input with error state and label"

# Metrics
duration: 12min
completed: 2026-02-03
---

# Phase 01 Plan 02: Auth UI & Email Integration Summary

**Login/Signup forms with GitHub OAuth, password reset flow, and Resend email service for verification emails**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-02-03T15:26:00Z
- **Completed:** 2026-02-03T15:38:00Z
- **Tasks:** 3
- **Files modified:** 19

## Accomplishments

- Created shared UI components (Button, Input, Card) with dark mode support and variants
- Built complete auth flow: login, signup, forgot password, reset password
- Integrated GitHub OAuth button with better-auth social sign-in
- Configured Resend email service with styled HTML templates for verification and password reset
- Implemented form validation with Zod schemas and react-hook-form

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared UI components and install form libraries** - `3d8c10e` (feat)
2. **Task 2: Build authentication forms and pages** - `fd2e0a8` (feat)
3. **Task 3: Configure Resend email sending in backend** - `203c621` (feat)

## Files Created/Modified

**Frontend - Shared Components:**
- `frontend/src/shared/components/Button.tsx` - Button with variants (primary/secondary/outline/ghost/danger), sizes, loading state
- `frontend/src/shared/components/Input.tsx` - Input with label, error state, password visibility toggle
- `frontend/src/shared/components/Card.tsx` - Simple card container with border and shadow
- `frontend/src/shared/components/index.ts` - Barrel export for shared components

**Frontend - Auth Feature:**
- `frontend/src/features/auth/schemas/auth.ts` - Zod schemas for all auth forms
- `frontend/src/features/auth/components/LoginForm.tsx` - Email/password login with remember me
- `frontend/src/features/auth/components/SignupForm.tsx` - Registration with password confirmation
- `frontend/src/features/auth/components/GithubButton.tsx` - GitHub OAuth button
- `frontend/src/features/auth/components/ForgotPasswordForm.tsx` - Password reset request
- `frontend/src/features/auth/components/ResetPasswordForm.tsx` - New password form with token validation
- `frontend/src/features/auth/pages/AuthPage.tsx` - Combined login/signup with tabs and GitHub OAuth
- `frontend/src/features/auth/pages/ForgotPasswordPage.tsx` - Password reset request page
- `frontend/src/features/auth/pages/ResetPasswordPage.tsx` - New password entry page
- `frontend/src/features/auth/lib/auth-client.ts` - Added forgetPassword, resetPassword exports
- `frontend/src/routes/index.tsx` - Added auth routes

**Backend:**
- `backend/src/lib/email.ts` - Resend email service with styled HTML templates
- `backend/src/auth/index.ts` - Connected real email functions to better-auth callbacks
- `backend/src/config.ts` - Added RESEND_API_KEY and EMAIL_FROM env vars
- `backend/.env.example` - Documented Resend configuration

## Decisions Made

1. **Two-column auth layout** - Form section on left, GitHub OAuth on right (stacked on mobile). Provides clear separation between email/password and social auth options.

2. **Fire-and-forget email pattern** - Email sends are not awaited to prevent timing attacks that could enumerate valid email addresses.

3. **Graceful email fallback** - When RESEND_API_KEY is not set, emails are logged to console instead of failing. This enables local development without Resend account.

4. **Password visibility toggle** - Added eye icon toggle in Input component for password fields to improve UX while maintaining security.

5. **Email enumeration protection** - Forgot password always shows success message regardless of whether email exists in database.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **npm cache permission issue** - Initial npm install failed due to root-owned files in cache. Resolved by retrying the command.

## User Setup Required

**Resend email service (optional for development):**
1. Create account at https://resend.com/signup
2. Create API key at https://resend.com/api-keys
3. Add to backend `.env`:
   ```
   RESEND_API_KEY=re_xxxxx
   EMAIL_FROM=Barae <noreply@yourdomain.com>
   ```

Note: Without Resend configuration, emails are logged to console - auth flows still work for local development.

## Next Phase Readiness

**Ready for Plan 03 (Dashboard Shell):**
- Auth UI complete with login, signup, password reset flows
- Session management works via useSession hook
- ProtectedRoute redirects unauthenticated users to /auth
- AuthPage redirects authenticated users to /dashboard

**Testing Requirements:**
1. Database must be set up and migration applied
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`
4. Visit http://localhost:5173/auth

**Optional for full testing:**
- GitHub OAuth: Configure GITHUB_CLIENT_ID/SECRET
- Resend: Configure RESEND_API_KEY for real emails

---

## Post-Completion Updates

**2026-02-03: Email changed from Resend to SMTP**

The email implementation was refactored to use standard SMTP via Nodemailer instead of Resend API:
- Removed `resend` dependency, added `nodemailer`
- Config changed: `RESEND_API_KEY` → `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE`
- Added Mailpit to Docker compose files for local email testing (UI at http://localhost:8025)
- Same graceful fallback: without SMTP_HOST, emails log to console

See commit `c0906c0` for details.

---
*Phase: 01-foundation-auth*
*Completed: 2026-02-03*
