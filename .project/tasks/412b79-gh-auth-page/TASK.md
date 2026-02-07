# Enable "Continue with GitHub" buttons on login and signup forms

**ID**: `412b79-gh-auth-page`
**Type**: feature
**Focus**: github-app-auth
**Created**: 2026-02-08 10:30
**Branch**: `task/412b79-gh-auth-page`
**Status**: planned

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
