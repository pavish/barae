---
phase: 03-dashboard-shell-auth-frontend
plan: 02
subsystem: frontend-auth
tags: [react-hook-form, zod, better-auth, otp, input-otp, zustand, auth-forms]
requires:
  - 03-01 (shadcn/ui components, Zod schemas, auth store, route guards)
  - 02-02 (better-auth client with emailOTP plugin)
provides:
  - Complete auth page with tabbed login/signup and split layout
  - Login form wired to authClient.signIn.email
  - Signup form wired to authClient.signUp.email with OTP transition
  - OTP verification with 6-digit InputOTP, cooldown, and lockout
  - Forgot password form requesting OTP-based reset
  - Reset password form with OTP + new password
  - Reusable AuthErrorBanner component for form-level errors
  - Reusable useOtpCooldown hook
affects:
  - 03-03 (dashboard shell renders after successful auth)
  - 03-04 (integration verification covers auth flow end-to-end)
  - 04 (GitHub OAuth button placeholder ready for wiring)
tech-stack:
  added: []
  patterns:
    - Controller + Field + FieldLabel + FieldError pattern for forms
    - OTP lockout via localStorage persistence (barae:otp-lockout)
    - Inline view transitions via Zustand auth store (no route changes)
    - AuthErrorBanner for form-level errors (no toasts)
key-files:
  created:
    - frontend/src/pages/AuthPage.tsx
    - frontend/src/components/auth/LoginForm.tsx
    - frontend/src/components/auth/SignupForm.tsx
    - frontend/src/components/auth/OtpVerification.tsx
    - frontend/src/components/auth/ForgotPasswordForm.tsx
    - frontend/src/components/auth/ResetPasswordForm.tsx
    - frontend/src/components/auth/AuthErrorBanner.tsx
    - frontend/src/hooks/useOtpCooldown.ts
  modified:
    - frontend/src/pages/AuthPage.tsx (replaced placeholder)
key-decisions:
  - OTP lockout (30min / 3 attempts) stored in localStorage with key barae:otp-lockout
  - OTP resend cooldown is 60 seconds, started on mount (OTP already sent)
  - Password reset success shows confirmation card then auto-redirects to login after 2 seconds
  - Split layout uses neutral-900 to neutral-800 gradient for brand panel
  - Form-level errors use AuthErrorBanner (Alert destructive variant), no toasts anywhere
  - GitHub OAuth button disabled with secondary Badge "Coming soon" on both login and signup
patterns-established:
  - react-hook-form + zodResolver + Controller + Field pattern for all auth forms
  - useOtpCooldown reusable hook pattern for OTP resend timers
  - localStorage-based client-side lockout for rate limiting
duration: ~4min
completed: 2026-02-06
---

# Phase 3 Plan 02: Auth Pages and Forms Summary

**One-liner:** Auth forms with tabbed login/signup, OTP 6-digit verification with cooldown and lockout, forgot-password and reset-password flows, all wired to better-auth emailOTP client methods

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~4min |
| Tasks | 2/2 |
| Deviations | 0 |

## Accomplishments

1. **Built AuthPage with split layout** -- Two-column grid on desktop (brand panel + form area), single-column on mobile. Brand panel shows Barae name, tagline, and description on a neutral gradient background. Form area is vertically centered with max-width constraint.

2. **Built LoginForm** wired to `authClient.signIn.email` with react-hook-form + zodResolver using the `loginSchema`. Inline field validation, form-level error via AuthErrorBanner. "Forgot password?" link transitions to forgot-password view via Zustand store.

3. **Built SignupForm** wired to `authClient.signUp.email`. On success, transitions to verify-otp view with email preserved in store (OTP sent automatically via `sendVerificationOnSignUp`).

4. **Built OtpVerification** with shadcn/ui InputOTP (6 digits, REGEXP_ONLY_DIGITS, auto-advance, paste support). On complete, calls `authClient.emailOtp.verifyEmail`. Includes 1-minute resend cooldown (useOtpCooldown hook) and 30-minute lockout after 3 failed attempts (localStorage-persisted).

5. **Built ForgotPasswordForm** with email input, calls `authClient.emailOtp.requestPasswordReset`, transitions to reset-password view on success.

6. **Built ResetPasswordForm** with OTP input + new password + confirm password. Calls `authClient.emailOtp.resetPassword`. Includes resend OTP with cooldown. On success, shows confirmation then auto-redirects to login after 2 seconds with email pre-filled.

7. **Created reusable components**: AuthErrorBanner (Alert destructive variant wrapper) and useOtpCooldown hook (60-second countdown timer).

8. **GitHub OAuth button** visible but disabled on both login and signup forms with "Coming soon" Badge.

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Build AuthPage with split layout, LoginForm, and SignupForm | 99a8a35 | AuthPage.tsx, LoginForm.tsx, SignupForm.tsx, AuthErrorBanner.tsx |
| 2 | Build OTP verification, forgot-password, and reset-password views | 19e17e4 | OtpVerification.tsx, ForgotPasswordForm.tsx, ResetPasswordForm.tsx, useOtpCooldown.ts, AuthPage.tsx |

## Files Created/Modified

### Created (8 files)
- `frontend/src/pages/AuthPage.tsx` -- Auth page with split layout, tab-based login/signup, and view state rendering
- `frontend/src/components/auth/LoginForm.tsx` -- Login form wired to authClient.signIn.email
- `frontend/src/components/auth/SignupForm.tsx` -- Signup form wired to authClient.signUp.email
- `frontend/src/components/auth/OtpVerification.tsx` -- OTP 6-digit verification with cooldown and lockout
- `frontend/src/components/auth/ForgotPasswordForm.tsx` -- Email input for password reset OTP request
- `frontend/src/components/auth/ResetPasswordForm.tsx` -- OTP + new password + confirm for password reset
- `frontend/src/components/auth/AuthErrorBanner.tsx` -- Reusable form-level error banner
- `frontend/src/hooks/useOtpCooldown.ts` -- Reusable OTP resend cooldown timer hook

### Modified (1 file)
- `frontend/src/pages/AuthPage.tsx` -- Replaced placeholder with full implementation (Task 1), then updated to replace Task 2 placeholders with real components

## Decisions Made

1. **OTP lockout persistence** -- Lockout expiry timestamp stored in `localStorage` under `barae:otp-lockout`. Survives page reloads. Auto-clears when expired. Client-side enforcement (backend also invalidates OTP after 3 attempts via `allowedAttempts`).

2. **Password reset success flow** -- Shows a success card ("Password reset successfully") for 2 seconds, then auto-redirects to login view with the email pre-filled so the user can sign in immediately.

3. **Brand panel design** -- Used neutral-900 to neutral-800 gradient (dark theme) for the split layout's left panel. Simple text-based branding (no illustration image). Hidden on mobile via `hidden lg:flex`.

4. **OTP resend type parameter** -- OtpVerification uses `type` prop (`'email-verification'` or `'forget-password'`) passed to `sendVerificationOtp`. ResetPasswordForm uses `'forget-password'` type for resend.

5. **Form IDs prefixed by context** -- Used `login-email`, `signup-email`, `forgot-email`, `reset-password` etc. to avoid ID collisions when multiple forms exist on the same page.

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

Plan 03 (Dashboard shell & pages) can proceed immediately. The auth flow is fully wired:
- Users can sign up, verify email via OTP, and land in dashboard
- Users can sign in with email/password
- Users can reset their password via OTP-based flow
- GitHub OAuth button is visible but disabled (ready for Phase 4 wiring)
- All form validations use the Zod schemas from Plan 01
- Auth view state machine manages all transitions via Zustand store

## Self-Check

- [x] `frontend/src/pages/AuthPage.tsx` exists on disk
- [x] `frontend/src/components/auth/OtpVerification.tsx` exists on disk
- [x] `git log --oneline --all --grep="03-02"` returns at least 1 commit

## Self-Check: PASSED
