# Phase 3 Plan 04: Testing Results

**Date:** 2026-02-07
**Branch:** `auth-flow-e2e`

## Status

- Task 1 (wire session-expired message): COMPLETE (commits `3afa704`, `56c46b9`)
- Task 2 (human verification checkpoint): REPLACED by automated testing
- Build fix needed: dropdown-menu.tsx `checked` prop (fix applied, not committed)

## Comprehensive Test Results

### API Auth Flow Tests: 40 tests — ALL PASS

| Category | Tests | Result |
|----------|-------|--------|
| Signup (valid, duplicate, empty, invalid email, short/long password, XSS, unicode) | 10 | All PASS |
| Login (valid, unverified, wrong password, non-existent, empty, malformed, case-insensitive) | 8 | All PASS |
| OTP (valid, invalid, empty, double-use, resend, already-verified) | 6 | All PASS |
| Password reset (request, reset, login new, old rejected, unverified account) | 5 | All PASS |
| Session (get, list, sign-out, after sign-out, concurrent sessions) | 6 | All PASS |
| Security (SQL injection, XSS in name, CSRF origin check) | 3 | All PASS |
| Edge cases (email case sensitivity, special chars in name) | 2 | All PASS |

### Frontend Routing Tests: 7 tests — ALL PASS

- SPA fallback for unknown routes
- API 404 returns JSON (not SPA HTML)
- SPA routes /auth, /settings serve HTML shell
- API health endpoint responds
- Content-Type headers correct (JSON for API, HTML for frontend)
- Caddy proxy routing works correctly

### Build & Compilation

| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | PASS |
| Production build (`vite build`) | PASS (after dropdown-menu fix) |
| All 26 expected files exist | PASS |

## Issues Found — Fixes Required

### FIX 1: Build error in dropdown-menu.tsx (ALREADY APPLIED, needs commit)

**File:** `frontend/src/components/ui/dropdown-menu.tsx:96`
**Problem:** `checked` prop is `CheckedState | undefined`, conflicts with `exactOptionalPropertyTypes: true`
**Fix:** Changed `checked={checked}` to `checked={checked ?? false}`
**Status:** Fix applied to working tree, needs to be committed.

### FIX 2: Network failure leaves forms in eternal loading state (P0)

**Files affected:**
- `frontend/src/components/auth/LoginForm.tsx` (onSubmit, line 34)
- `frontend/src/components/auth/SignupForm.tsx` (onSubmit, line 29)
- `frontend/src/components/auth/ForgotPasswordForm.tsx` (onSubmit, line 29)
- `frontend/src/components/auth/ResetPasswordForm.tsx` (onSubmit, line 56)
- `frontend/src/components/auth/OtpVerification.tsx` (handleComplete, line 82; handleResend, line 113)

**Problem:** No try-catch around `authClient` API calls. If network throws (offline, timeout), the form stays in `isSubmitting: true` forever — button disabled with "Signing in..." text, no error shown.
**Fix:** Wrap each `authClient` call in try-catch. On catch, set `setFormError('Something went wrong. Please try again.')` and let `isSubmitting` return to false (react-hook-form handles this when the onSubmit function completes/throws).

**Pattern:**
```tsx
// Before
async function onSubmit(data: LoginFormData) {
  setFormError(null)
  const { error } = await authClient.signIn.email({ ... })
  if (error) { setFormError(error.message ?? 'Invalid credentials') }
}

// After
async function onSubmit(data: LoginFormData) {
  setFormError(null)
  try {
    const { error } = await authClient.signIn.email({ ... })
    if (error) { setFormError(error.message ?? 'Invalid credentials') }
  } catch {
    setFormError('Something went wrong. Please try again.')
  }
}
```

For OtpVerification, the pattern is similar but uses `setError()` and `setIsVerifying(false)` in the catch block.

### FIX 3: Empty email on browser refresh for OTP/reset-password views (P0)

**Files affected:**
- `frontend/src/components/auth/OtpVerification.tsx`
- `frontend/src/components/auth/ResetPasswordForm.tsx`
- `frontend/src/pages/AuthPage.tsx` (renderView function)

**Problem:** If user refreshes the browser while on verify-otp or reset-password view, the Zustand store resets and `email` becomes empty string. Components show "We sent a code to " (blank) and API calls fail with generic errors.

**Fix:** In AuthPage.tsx `renderView`, check if `email` is empty when rendering OtpVerification or ResetPasswordForm. If empty, reset the auth store to 'login' view instead.

```tsx
case 'verify-otp':
  if (!email) {
    // Store was reset (e.g., browser refresh) — email context lost
    setView('login')
    return null
  }
  return <OtpVerification email={email} type="email-verification" />

case 'reset-password':
  if (!email) {
    setView('login')
    return null
  }
  return <ResetPasswordForm email={email} />
```

Note: `renderView` is currently a standalone function. To call `setView`, either:
- Move the check inside AuthPage component body (before calling renderView), or
- Make renderView a component that uses the store directly

### FIX 4: Unverified email login → OTP send failure (P1)

**File:** `frontend/src/components/auth/LoginForm.tsx` (lines 41-51)

**Problem:** When login returns EMAIL_NOT_VERIFIED, the code tries to send a verification OTP. If that send fails, the user is still navigated to the OTP screen but no code was sent. The `otpAutoSent` flag is set to `false`, so the cooldown won't start, but the user doesn't know why they're on an OTP screen or that no code was sent.

**Fix:** If OTP send fails, show the error on the login form instead of navigating away:
```tsx
if (error.code === 'EMAIL_NOT_VERIFIED') {
  const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
    email: data.email,
    type: 'email-verification',
  })
  if (otpError) {
    setFormError('Your email is not verified. Could not send verification code. Please try again.')
    return
  }
  setOtpAutoSent(true)
  setViewWithEmail('verify-otp', data.email)
  return
}
```

## Notes (Not Bugs — Documentation Items)

- Password reset for unverified accounts implicitly verifies the email (user-friendly behavior)
- Name field accepts raw HTML/script tags — safe because React auto-escapes JSX text, no `dangerouslySetInnerHTML` used
- No rate limiting on signup (expected, deferred to Phase 6)
- Verification OTP can be re-sent for already-verified users (minor unnecessary SMTP traffic)
- `vite.svg` favicon referenced in index.html doesn't exist (cosmetic, not a Phase 3 concern)
