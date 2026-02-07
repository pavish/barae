# Focus: GitHub App Authentication

Created: 2026-02-07 12:00
Status: active
Branch: focus/github-app-auth
PR: https://github.com/pavish/barae/pull/3

## Research
See `.project/CURRENT_RESEARCH.md` for detailed research findings (GitHub App OAuth flow, better-auth integration, token management, error scenarios, existing code patterns, etc.).

## What We're Building

GitHub-based login for Barae using a GitHub App (not an OAuth App). Users can sign up and log in via GitHub alongside the existing email/password auth. When a user authenticates with GitHub for the first time, their Barae account is automatically created (using their GitHub email) or linked to an existing account if the email matches. Users can also link/unlink their GitHub account from a settings page.

This uses GitHub Apps (rather than basic OAuth Apps) because Barae will use GitHub Apps for repo management capabilities in the future. The OAuth flow for GitHub Apps is identical to OAuth Apps from a protocol perspective, but GitHub Apps offer fine-grained permissions and app installations — both needed later.

## User Flows

### Flow 1: New user signs up via GitHub
1. User opens Barae auth page and clicks "Continue with GitHub"
2. A new tab/redirect opens to GitHub's authorization page
3. User authorizes the Barae GitHub App
4. GitHub redirects back to Barae with an auth code
5. Barae exchanges the code for tokens, fetches user profile + email
6. A new Barae account is created with the GitHub email
7. User is logged into Barae and lands on the dashboard

### Flow 2: Existing email user logs in via GitHub
1. User has an existing email/password Barae account
2. User clicks "Continue with GitHub" on the auth page
3. GitHub OAuth flow completes
4. Barae finds an existing account with a matching email
5. The GitHub account is automatically linked to the existing Barae account
6. User is logged in with their existing account and all their data

### Flow 3: Returning GitHub user logs in
1. User who previously signed up via GitHub clicks "Continue with GitHub"
2. GitHub OAuth flow completes
3. Barae finds the linked GitHub account and signs them in
4. User lands on the dashboard

### Flow 4: Link GitHub from settings
1. Authenticated user (email/password account) goes to Settings
2. Clicks "Link GitHub Account"
3. GitHub OAuth flow completes
4. GitHub account is linked to their existing Barae account
5. They can now log in via either method

### Flow 5: Unlink GitHub from settings
1. Authenticated user with a linked GitHub account goes to Settings
2. Clicks "Unlink GitHub Account"
3. If they have a password set (i.e., another login method), the GitHub account is unlinked
4. If GitHub is their only login method, the unlink is blocked with a message explaining they need to set a password first

### Flow 6: Error during GitHub auth
1. User clicks "Continue with GitHub"
2. Something goes wrong (user denies, network issue, GitHub down, etc.)
3. User is redirected back to the auth page with a clear error message
4. User can retry by clicking "Continue with GitHub" again

## Success Criteria

- [ ] Users can sign up and log in via GitHub from the auth page
- [ ] GitHub login coexists with email/password — users choose either method
- [ ] New GitHub users get a Barae account created automatically using their GH email
- [ ] Existing email users who login via GH get their accounts auto-linked
- [ ] Each Barae user can have at most one GitHub account linked
- [ ] Users can link their GitHub account from the settings page
- [ ] Users can unlink their GitHub account from settings (blocked if it's the only login method)
- [ ] When GitHub credentials are not configured, the "Continue with GitHub" button is disabled
- [ ] All error states have clear user-facing messages and retry paths
- [ ] GitHub App creation guide exists in docs/ with step-by-step instructions
- [ ] Token expiration is enabled (8h access, 6-month refresh) with auto-refresh

## Scope

### In Scope
- GitHub App OAuth login via better-auth's built-in GitHub social provider
- Account auto-creation for new GitHub users (using GH email)
- Account auto-linking when GH email matches an existing Barae account
- One GitHub account per Barae user constraint
- "Continue with GitHub" buttons on login and signup forms (enable existing disabled buttons)
- Settings page: link/unlink GitHub account functionality
- Conditional GitHub provider (skip when credentials not configured)
- Comprehensive error handling for all OAuth error states
- Environment variable configuration (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`)
- GitHub App creation guide in `docs/github-app-setup.md`
- GitHub App permission recommendations (include repo permissions now to avoid re-auth later)

### NOT in Scope (do not build)
- GitHub App installation management (installing app on repos/orgs) — future focus
- Repo access, creation, or management via GitHub API
- Installation webhook handling
- GitHub App private key / JWT authentication (server-to-server calls)
- GitHub Actions or GitHub Pages integration
- Any GitHub API calls beyond what better-auth does during auth (user profile + emails)
- "Set password" for GitHub-only accounts — separate future task
- GitHub App creation itself — guide only, user creates it manually

## Pitfalls & Anti-Patterns

- **Using OAuth Apps instead of GitHub Apps**: GitHub Apps are the modern, recommended approach with fine-grained permissions. They're also required for Barae's future repo management features. Always use GitHub App OAuth flow.
- **Hand-rolling the OAuth flow**: better-auth handles authorization URL generation, code exchange, user info fetching, token storage, and refresh. Do not implement custom OAuth logic.
- **Storing GitHub tokens on the frontend**: better-auth stores tokens server-side in the `account` table. The frontend never sees the GitHub access token.
- **Making GitHub credentials required**: Barae must function without GitHub configured. When env vars are empty, skip provider registration and disable the button.
- **Coupling app installation with auth**: The "Request user authorization (OAuth) during installation" option in GitHub App settings creates confusing UX. Keep installation and auth as separate flows.
- **Forgetting email read permission on the GH App**: The most common GitHub App OAuth error is `email_not_found` because the app's Account Permissions > Email Addresses is not set to Read-only.
- **Swallowing promise rejections on social sign-in**: Always handle errors from `signIn.social` — use try-catch with user-visible error messages.
- **Conflating Barae session with GitHub token**: The Barae session (7-day expiry) is independent of the GitHub access token (8h expiry). The token is only used for GitHub API calls, not Barae session management.

## Constraints for Claude

- DO NOT use `process.env` for GitHub credentials — add them to the TypeBox config schema in the config plugin, access via `fastify.config`
- DO NOT use frontend env variables (`import.meta.env`) — the GitHub client ID is not needed on the frontend; better-auth handles redirects server-side
- DO NOT create new routes for the GitHub callback — the existing wildcard `/v1/auth/*` handler covers it
- DO NOT build custom OAuth flows — use better-auth's built-in `socialProviders.github`
- DO NOT require GitHub credentials — they must be optional with empty string defaults
- DO NOT couple GitHub App installation with OAuth — keep them separate
- DO NOT add a client plugin for social sign-in — it's built into the core better-auth client
- ALWAYS handle errors exhaustively — every OAuth error state must have a user-facing message
- ALWAYS use `dangerouslyDisableSandbox: true` for `gh` CLI and git remote commands
- REMEMBER: GitHub App installations (personal + org) will be used later for repo management. The Barae user maps to a GH person, and their accessible installations will matter in a future focus.

## Tasks
<!-- Tasks added here via /barae:new-task -->
<!-- Format: - [ ] `<task-id>` — <brief description> -->
