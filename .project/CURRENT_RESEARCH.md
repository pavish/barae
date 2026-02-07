# Research: GitHub App Authentication

Researched: 2026-02-07
Focus: GitHub App Authentication

## 1. GitHub App OAuth Flow

**GitHub Apps and OAuth Apps use the same OAuth endpoints.** The authorization endpoint is `https://github.com/login/oauth/authorize` and the token exchange endpoint is `https://github.com/login/oauth/access_token` — identical for both.

**The flow:**
1. Frontend calls `authClient.signIn.social({ provider: "github" })` which redirects the user to GitHub's authorization page
2. User authorizes the app on GitHub
3. GitHub redirects to the callback URL (e.g., `http://localhost:8100/api/v1/auth/callback/github`) with a `code` parameter
4. better-auth exchanges the code for an access token via POST to GitHub's token endpoint
5. better-auth fetches user info from `https://api.github.com/user` and `https://api.github.com/user/emails`
6. better-auth creates or links the account and establishes a session

**Important difference from OAuth Apps:** GitHub Apps use fine-grained permissions instead of scopes. The `scope` parameter in the token response is always an empty string. The user access token only has permissions that both the app and the user have (intersection-based access control).

**Token types for GitHub Apps:**
- User access tokens start with `ghu_`, expire after 8 hours (when token expiration is enabled — the default and recommended setting)
- Refresh tokens start with `ghr_`, expire after 6 months
- This contrasts with OAuth Apps where tokens never expire unless revoked

## 2. better-auth Integration

**better-auth's built-in GitHub provider works with GitHub Apps out of the box.** The configuration is identical to an OAuth App — provide `clientId` and `clientSecret` from the GitHub App settings.

**Server-side configuration:**
```typescript
socialProviders: {
  github: {
    clientId: config.GITHUB_CLIENT_ID,
    clientSecret: config.GITHUB_CLIENT_SECRET,
  },
},
```

**Client-side usage:**
```typescript
// signIn.social is built into the core client — no additional plugin needed
await authClient.signIn.social({
  provider: "github",
  callbackURL: "/",           // Where to go after success
  errorCallbackURL: "/auth",  // Where to go on error
})
```

**What better-auth handles automatically:**
- Authorization URL generation with `read:user` and `user:email` scopes by default
- Code-to-token exchange
- User info fetching (profile + emails endpoint to find primary email)
- Account creation in the `account` table (with `provider_id: "github"`, `account_id: <github-user-id>`)
- User creation in the `user` table if new
- Session creation
- Access token and refresh token storage in the `account` table
- Token refresh via `refreshAccessToken` (uses the same endpoint with `grant_type: refresh_token`)

**Account linking configuration:**
```typescript
account: {
  accountLinking: {
    enabled: true,
    trustedProviders: ["github"],
  },
},
```

When a user signs in via GitHub and their GitHub email matches an existing Barae account's email, better-auth automatically links the GitHub account to the existing user if account linking is enabled and the provider is trusted.

**Client-side APIs available:**
- `authClient.signIn.social({ provider: "github" })` — Initiate GitHub login
- `authClient.linkSocial({ provider: "github" })` — Link GitHub to an existing authenticated account
- `authClient.unlinkAccount({ providerId: "github" })` — Unlink GitHub from account
- `authClient.getAccessToken({ providerId: "github" })` — Get stored GitHub access token (auto-refreshes if expired)

**No additional client plugin is needed.** The social sign-in functionality is built into the core better-auth client, unlike `emailOTP` which requires a client plugin.

## 3. GitHub App Installation Flow

**Installation and OAuth authorization are separate concerns** that can be combined or kept independent.

GitHub Apps have two distinct flows:
1. **OAuth authorization** (user authorizes the app to act on their behalf) — this is the login flow
2. **App installation** (user or org installs the app on specific repos) — this grants the app access to repos

**Decision: Keep installation separate from the OAuth login flow.** Users log in via GitHub OAuth (just authentication, no installation required). Users can install the GitHub App later from within Barae's dashboard or from GitHub directly.

**Setup URL vs Callback URL:**
- **Callback URL**: Where GitHub redirects after OAuth authorization. This is what better-auth uses.
- **Setup URL**: Where GitHub redirects after app installation. This would be a Barae page that records the installation (future focus).
- GitHub Apps support **up to 10 callback URLs**, unlike OAuth Apps (which support only 1).

## 4. Token Management

**The existing `account` table already has the right columns** for GitHub OAuth tokens:
- `access_token` (text)
- `refresh_token` (text)
- `access_token_expires_at` (timestamp)
- `refresh_token_expires_at` (timestamp)
- `scope` (text)
- `provider_id` (text) — will be "github"
- `account_id` (text) — will be the GitHub user ID

No schema changes or migrations needed for the basic OAuth flow.

**Token expiration decision:** Enabled (the default). Access tokens last 8 hours, refresh tokens 6 months. better-auth's `getAccessToken` method auto-refreshes expired tokens.

**For future repo operations:** The GitHub access token stored in the `account` table is a user-to-server token. For repo operations later, Barae will also need installation access tokens (obtained using the app's private key + JWT). This is out of scope for this focus.

## 5. Account Linking Strategy

**Auto-creation scenario (new user via GitHub):**
- better-auth checks if an account with `provider_id: "github"` exists for this GitHub user ID
- No existing account found → creates new `user` row (using GH name, email, avatar) + new `account` row with `provider_id: "github"`
- Session is created and user is redirected to the dashboard

**Auto-linking scenario (existing email-based account):**
- better-auth finds an existing user with a matching email
- If GitHub is in `trustedProviders`, it auto-links by creating a new `account` row under the same user
- The user is signed in with their existing account

**Manual linking from settings:**
- Frontend calls `authClient.linkSocial({ provider: "github" })`
- OAuth flow completes and a new `account` row is created under their user ID

**Unlinking from settings:**
- Frontend calls `authClient.unlinkAccount({ providerId: "github" })`
- better-auth removes the GitHub `account` row
- If the user only has a GitHub account (no password), unlinking is blocked by default (requires at least one sign-in method)

**One GH account per user:** Enforced naturally by better-auth — each `(provider_id, account_id)` pair maps to one user. If a different Barae user tries to link the same GitHub account, it fails with a "Social account already linked" error.

## 6. Error Scenarios

| Error | Cause | Handling |
|-------|-------|----------|
| User denies authorization | User clicks "Cancel" on GitHub | GitHub redirects to callback with `error=access_denied`. better-auth redirects to `errorCallbackURL` with error params. Frontend shows "GitHub authorization was cancelled." |
| Invalid/expired code | Network delay, callback replayed | Token exchange fails. better-auth redirects to `errorCallbackURL`. Frontend shows "Authentication failed. Please try again." |
| Email not found | GitHub App missing email permissions | better-auth gets null email. Shows `email_not_found` error. Fix: configure GH App email read permissions. |
| GitHub API down | GitHub outage | Token exchange or user info fetch fails. better-auth redirects to `errorCallbackURL`. Frontend shows "Could not reach GitHub. Please try again later." |
| Callback not received | Network issue, browser closed mid-flow | User stays on GitHub or gets a broken redirect. No action on Barae's side. User can retry from the auth page. |
| Account already linked to another user | Same GH account used by different Barae user | better-auth returns error. Frontend shows "This GitHub account is already linked to another Barae account." |
| CSRF / state mismatch | State parameter doesn't match on callback | better-auth validates state. Returns error on mismatch. Frontend shows generic error. |
| Rate limited by GitHub | Too many API calls | GitHub returns 403/429. Should be rare during auth (only 2 API calls). Log and show "Please try again in a few minutes." |

**Frontend error handling pattern:**
- `signIn.social` accepts `callbackURL` (success redirect) and `errorCallbackURL` (error redirect)
- On error, better-auth appends `?error=<code>&error_description=<message>` to the errorCallbackURL
- The auth page should parse these query params and display the error in the existing `AuthErrorBanner` component

## 7. Rate Limits

**Not a concern for the auth flow itself.** During OAuth, only 2 API calls are made:
1. `GET https://api.github.com/user` (get profile)
2. `GET https://api.github.com/user/emails` (get emails)

These use the user access token and share the user's personal rate limit (5,000 requests/hour).

**For future repo operations (out of scope):**
- Installation access tokens: 5,000 req/hour base, scaling up to 12,500
- User access tokens: share user's personal rate limit (5,000/hour)

## 8. Existing Code Patterns

**Backend auth plugin** (`backend/src/auth/index.ts`):
- better-auth instance created inside the Fastify plugin lifecycle
- Config values come from `fastify.config`
- Plugin decorates `fastify.auth`
- To add GitHub: add `socialProviders.github` to the `betterAuth()` config

**Backend config** (`backend/src/plugins/config.ts`):
- Uses TypeBox schema for env validation
- New env vars `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` must be added
- Should be optional (empty string defaults) so Barae runs without GitHub configured

**Backend routes** (`backend/src/auth/routes.ts`):
- Catches all `/v1/auth/*` routes and forwards to `fastify.auth.handler()`
- The GitHub callback route (`/v1/auth/callback/github`) is handled by this wildcard automatically
- No new route registration needed

**Frontend auth client** (`frontend/src/lib/auth.ts`):
- Uses `createAuthClient` with `basePath: '/api/v1/auth'`
- `signIn.social` is already available on the client without adding any plugin

**Frontend auth page** (`frontend/src/pages/AuthPage.tsx`):
- Uses a Zustand store for view state machine
- Login and Signup forms already have disabled "Continue with GitHub" buttons
- These buttons need to be enabled and wired to `authClient.signIn.social()`

**Frontend settings page** (`frontend/src/pages/SettingsPage.tsx`):
- Already has a placeholder "GitHub Account" card (grayed out with "Coming soon" badge)
- Needs to be replaced with functional link/unlink UI

**Caddy configuration** (`caddy/Caddyfile.dev`):
- Strips `/api/` prefix and proxies to backend
- GitHub callback URL works through this proxy correctly

## 9. GitHub App Permissions (Recommended)

For the GitHub App creation guide, these permissions should be configured:

**Repository permissions:**
- Contents: Read & Write (for future repo management)
- Actions: Read & Write (for future GitHub Actions integration)
- Pages: Read & Write (for future GitHub Pages configuration)
- Workflows: Read & Write (for future workflow management)
- Metadata: Read-only (required, always included)

**Account permissions:**
- Email Addresses: Read-only (required for auth — without this, `email_not_found` error occurs)

## Sources

- [GitHub Provider - Better Auth](https://www.better-auth.com/docs/authentication/github)
- [OAuth Concepts - Better Auth](https://www.better-auth.com/docs/concepts/oauth)
- [User & Accounts - Better Auth](https://www.better-auth.com/docs/concepts/users-accounts)
- [Options Reference - Better Auth](https://www.better-auth.com/docs/reference/options)
- [Differences between GitHub Apps and OAuth Apps - GitHub Docs](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps)
- [Generating a user access token for a GitHub App - GitHub Docs](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app)
- [Refreshing user access tokens - GitHub Docs](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens)
- [Rate limits for GitHub Apps - GitHub Docs](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/rate-limits-for-github-apps)
- [Building a "Login with GitHub" button with a GitHub App - GitHub Docs](https://docs.github.com/en/apps/creating-github-apps/writing-code-for-a-github-app/building-a-login-with-github-button-with-a-github-app)
- [Registering a GitHub App - GitHub Docs](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app)
- [Choosing permissions for a GitHub App - GitHub Docs](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app)
