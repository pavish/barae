# Phase 1: Foundation & Auth - Context

**Gathered:** 2026-02-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can securely access Barae and navigate a responsive dashboard. This phase delivers:
- Account creation (email/password with email verification)
- Login (email/password + GitHub OAuth)
- Password reset flow
- Persistent sessions
- Responsive dashboard shell with settings

GitHub integration (App installation, repo access) is Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Login/Signup Flow
- Combined auth page with Login | Sign Up tabs (single `/auth` route)
- Two-column layout on desktop: email/password form on one side, GitHub OAuth on other; stacked on mobile
- Password confirmation field required on signup
- Validation on both frontend and backend with proper error codes
- Backend returns meaningful error codes so frontend can display appropriate messages

### Email Verification UX
- Non-blocking: user enters dashboard immediately after signup
- Unverified users see persistent banner to verify email
- Unverified users cannot connect GitHub or create sites (enforced)
- Resend verification link available in banner AND in account settings
- Expired verification link shows error message with resend button
- Backend is JSON-only API (HTML only for email templates)

### Dashboard Shell
- Adaptive navigation: optimized for each viewport (desktop vs mobile) — Claude has discretion on exact implementation but UX must be frictionless
- Header contains: Barae logo, global search bar, user avatar menu
- Empty state shows onboarding checklist: 1. Verify email 2. Connect GitHub 3. Create site
- Dark mode with toggle (light/dark, plus follows system preference option)
- User menu is minimal: profile name/email, Settings link, Logout

### Account Settings (Phase 1)
- Profile info: name, email display
- Password change
- Email verification status
- Theme preference (light/dark/system)
- Danger zone: account deletion option

### Session & Security
- "Remember me" checkbox on login
  - Unchecked = session cookie (expires when browser closes)
  - Checked = persistent cookie (30 days)
- Session expiry while active: modal prompt to re-authenticate (preserves page context)
- After logout: redirect to login page with "You have been logged out" confirmation
- Password reset: standard email link flow (no security questions)

### Claude's Discretion
- Form validation error display style (inline vs summary)
- Exact navigation implementation per viewport
- Loading states and transitions
- Error state designs
- Search bar behavior in Phase 1 (may be placeholder until content exists)

</decisions>

<specifics>
## Specific Ideas

- Navigation should be "useful and frictionless" — don't follow conventions blindly, optimize for actual usability
- Backend must use proper HTTP error codes with JSON error responses that frontend can interpret

</specifics>

<deferred>
## Deferred Ideas

- **Multi-GitHub-account architecture** (Phase 2): Single Barae user can connect multiple GitHub App installations (personal account, client accounts, orgs). This is separate from OAuth login. Each installation grants independent repo access. The logged-in GitHub account doesn't determine repo access — App installations do. *Critical context for Phase 2 GitHub Integration.*

</deferred>

---

*Phase: 01-foundation-auth*
*Context gathered: 2026-02-03*
