# Enable "Continue with GitHub" buttons on login and signup forms

**ID**: `412b79-gh-auth-page`
**Type**: feature
**Focus**: github-app-auth
**Created**: 2026-02-08 10:30
**Branch**: `task/412b79-gh-auth-page`
**Status**: in_progress
**Detailed**: 2026-02-08 14:00

## Dependencies

- `184b60-gh-availability-endpoint` — needs provider availability endpoint to determine button state

## Description

Replace the currently disabled "Continue with GitHub" buttons on the login and signup forms with functional ones. The buttons should fetch provider availability from the backend endpoint, remain disabled with a badge when GitHub is not configured, and initiate the GitHub OAuth flow via authClient.signIn.social() when clicked. OAuth error responses (from the errorCallbackURL query params) must be parsed and displayed as user-facing error messages on the auth page.

## Acceptance Criteria

- [ ] "Continue with GitHub" buttons on both LoginForm and SignupForm are functional when GitHub is configured
- [ ] Buttons remain disabled with appropriate indicator when GitHub credentials are not configured on the server
- [ ] Clicking the button calls authClient.signIn.social({ provider: "github", callbackURL: "/", errorCallbackURL: "/auth" })
- [ ] OAuth errors returned via ?error query params on /auth are parsed and displayed as error banners
- [ ] Error messages cover: user denied, invalid code, account conflict, GitHub down, and generic fallback
- [ ] Loading state is shown while the GitHub OAuth redirect is in progress
- [ ] GitHub login coexists with email/password — both methods are available on the same page
- [ ] TypeScript type-checks pass, no lint errors

## Implementation Steps

### Step 1: Create `useProviders` hook
- **File**: `frontend/src/hooks/useProviders.ts` (new)
- Uses TanStack Query `useQuery` to fetch `GET /v1/auth/providers` via `apiFetch`
- Returns `{ githubAvailable: boolean, isLoading: boolean }`
- Query key: `['auth', 'providers']`
- First TanStack Query usage in the codebase — establishes the pattern

### Step 2: Create OAuth error parser
- **File**: `frontend/src/lib/oauthErrors.ts` (new)
- Function `getOAuthErrorMessage(errorCode: string): string`
- Groups errors into categories:
  - **User-actionable** (specific messages): `access_denied`, `email_not_found`, `account_not_linked`, `account_already_linked_to_different_user`
  - **Retry** (generic "try again"): `invalid_code`, `state_mismatch`, `no_code`, `please_restart_the_process`, etc.
  - **Server-side** ("try again later"): `unable_to_get_user_info`, `internal_server_error`
  - **Fallback**: anything unrecognized
- Concise mapping — similar errors share messages

### Step 3: Create shared `GitHubSignInButton` component
- **File**: `frontend/src/components/auth/GitHubSignInButton.tsx` (new)
- Props: `githubAvailable: boolean`, `isLoadingProviders: boolean`, `onError: (message: string) => void`
- When unavailable: disabled button with "Not available" badge (replaces "Coming soon")
- When loading providers: disabled button with loading indicator
- When available: enabled button calling `authClient.signIn.social({ provider: "github", callbackURL: "/", errorCallbackURL: "/auth" })`
- Manages `isRedirecting` loading state
- Catches network errors from `signIn.social()` and calls `onError`

### Step 4: Update LoginForm to use GitHubSignInButton
- **File**: `frontend/src/components/auth/LoginForm.tsx` (modify)
- Replace hardcoded disabled button block with `<GitHubSignInButton />`
- Accept `githubAvailable` and `isLoadingProviders` props
- Wire `onError` to `setFormError`

### Step 5: Update SignupForm to use GitHubSignInButton
- **File**: `frontend/src/components/auth/SignupForm.tsx` (modify)
- Same changes as Step 4

### Step 6: Add OAuth error handling + wire providers in AuthPage
- **File**: `frontend/src/pages/AuthPage.tsx` (modify)
- Call `useProviders()` hook
- Pass `githubAvailable` and `isLoadingProviders` to LoginForm and SignupForm
- Read `?error` from URL via `useSearchParams()`
- Display OAuth errors using `AuthErrorBanner` above the form Card (page-level)
- Clear search params after reading so refresh doesn't re-show error

## Verification Steps

- [ ] TypeScript type-check: `npx tsc --noEmit` in frontend
- [ ] Lint: `npx eslint src/` in frontend
- [ ] No TODOs, console.logs, or stub implementations
- [ ] All acceptance criteria met
- [ ] Full diff review: `git diff focus/github-app-auth...HEAD`

## Test Cases

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Backend returns `{ github: true }` | Button enabled, no badge |
| 2 | Backend returns `{ github: false }` | Button disabled, "Not available" badge |
| 3 | Backend unreachable | Button disabled (fail-safe) |
| 4 | Click enabled button | Loading state shown, then redirect to GitHub |
| 5 | `/auth?error=access_denied` | Banner: "GitHub authorization was cancelled..." |
| 6 | `/auth?error=account_not_linked` | Banner: "An account with this email already exists..." |
| 7 | `/auth?error=account_already_linked_to_different_user` | Banner: "This GitHub account is already linked to another account." |
| 8 | `/auth?error=email_not_found` | Banner: "Could not retrieve your email from GitHub..." |
| 9 | `/auth?error=invalid_code` | Banner: "Authentication failed. Please try again." |
| 10 | `/auth?error=unable_to_get_user_info` | Banner: "Could not reach GitHub. Please try again later." |
| 11 | `/auth?error=unknown_thing` | Banner: "Something went wrong during GitHub sign-in..." |
| 12 | Error displayed, page refreshed | Error gone, URL clean |
| 13 | `signIn.social()` network error | Form-level error: "Could not connect to the server..." |
| 14 | Both login/signup tabs | Same GitHub button state on both |
