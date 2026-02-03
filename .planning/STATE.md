# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** Users own their content in git — standard Astro projects, portable, not locked into Barae.
**Current focus:** Phase 2 GitHub Integration - Connect users' GitHub accounts for repository access

## Current Position

Phase: 1.3 of 4 (Review Fixes) - COMPLETE
Plan: 01 of 1 (Code Review Recommendations) - COMPLETE
Status: Phase 1.3 complete, ready for Phase 2
Last activity: 2026-02-04 - Completed 01.3-01 (Code Review Fixes)

Progress: [████████░░] 80%

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: ~13min
- Total execution time: ~103min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation & Auth | 4/4 | ~87min | ~22min |
| 1.1 Code Refactoring | 1/1 | ~15min | ~15min |
| 1.2 Code Review | 3/3 | ~13min | ~4min |
| 1.3 Review Fixes | 1/1 | ~3min | ~3min |
| 2. GitHub Integration | 0/2 | - | - |
| 3. Sites & Templates | 0/2 | - | - |
| 4. Content & Editor | 0/3 | - | - |

**Recent Trend:**
- Last 5 plans: 01.1-01 (~15min), 01.2-01 (~2min), 01.2-02 (~3min), 01.2-03 (~8min), 01.3-01 (~3min)
- Trend: Implementation fixes execute quickly when well-planned

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- better-auth for authentication (Drizzle adapter, email/password + GitHub OAuth)
- GitHub App for repo access (granular permissions, automatic token refresh)
- MDXEditor for dual-mode editing (despite 851KB bundle, best option)

**From 01-01:**
- better-auth uses separate postgres client to avoid Fastify plugin dependency
- drizzle-kit generate requires tsx wrapper due to ESM .js extension imports
- Two user tables exist (scaffold's `users` and better-auth's `user`) - better-auth is source of truth

**From 01-02:**
- Two-column auth layout: form on left, GitHub OAuth on right (stacked on mobile)
- Fire-and-forget email sending to prevent timing attacks
- Form validation: Zod schema + react-hook-form zodResolver pattern

**From 01.1 (Backend Refactoring):**
- Single DB connection: auth uses `fastify.db.do` via factory pattern (was duplicate connection)
- Versioned routes: all auth endpoints now at `/api/v1/auth/*`
- Config access: all via `fastify.config.*` (no direct process.env in src/)
- Plugin patterns: scoped type declarations in each plugin file
- Email service: Fastify plugin with proper dependency chain
- Feature modules: routes, service, handler, contracts pattern
- Health check: `/health` endpoint with DB connectivity test
- Docker: compose.test.yml for ephemeral testing, auto-migrations via entrypoint

**Email (Post-Refactoring):**
- SMTP via Nodemailer replaces Resend API (standard protocol, no vendor lock-in)
- Mailpit for local dev email testing (UI at http://localhost:8025)
- Graceful fallback to console logging when SMTP_HOST not set
- Config: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE, EMAIL_FROM

**From 01-03:**
- Custom `/api/v1/auth/resend-verification` endpoint created
  - better-auth disables `/send-verification-email` when `requireEmailVerification: false`
  - Custom endpoint reads session cookie, extracts token, sends verification email
- Cookie handling: better-auth uses signed cookies (`token.signature` format)
  - Extract token by splitting on `.` before database lookup
  - Database stores raw token, not hashed
- Added @fastify/cookie for parsing cookies in custom endpoints
- Adaptive navigation: sidebar on desktop (md+), bottom nav on mobile
- Theme persistence: localStorage with system option respecting OS preference

**From 01-04 (Gap Closure):**
- better-auth emailVerification.sendOnSignUp: true for auto-send on signup
- baseURL set to FRONTEND_URL for correct email links (password reset, verification)
- Removed custom verify-email endpoint - better-auth handles via catch-all with JWT tokens
- resend-verification uses auth.api.sendVerificationEmail for JWT token generation
- Frontend VerifyEmailPage uses authClient.$fetch instead of direct fetch

**From 01.2-01 (Backend Review):**
- No critical security issues found - better-auth provides secure defaults
- Two immediate recommendations identified:
  1. Add rate limiting to `/resend-verification` endpoint (email abuse prevention)
  2. Add `minLength: 32` to APP_SECRET validation (stronger secret enforcement)
- Architecture fully compliant with established patterns in backend-patterns.md
- Future tech debt: Add indexes on session.userId and account.userId

**From 01.2-02 (Frontend Review):**
- No critical security issues found in frontend auth code
- 2 medium accessibility issues (ARIA roles for auth tabs) - recommended not blocking
- 11 low issues documented including:
  - ErrorBoundary missing at app root
  - Header logo uses `<a>` instead of React Router `<Link>`
  - Icon components duplicated between Sidebar and MobileNav
- Security checklist verified: no hardcoded creds, no localStorage secrets, route protection works
- Form validation pattern (Zod + react-hook-form) verified as correct
- better-auth client SDK integration verified as secure

**From 01.2-03 (Shared/Settings Review + Final Report):**
- 14 shared/settings files reviewed: no critical or important issues
- 6 low accessibility improvements identified (aria-labels, focus traps)
- better-auth integration verified as architecturally sound:
  - APP_SECRET properly centralized (config.ts -> service.ts -> better-auth)
  - No custom crypto anywhere - all signing delegated to better-auth
  - resend-verification endpoint correctly uses auth.api.sendVerificationEmail()
- Consolidated report: 53 files, 0 critical, 2 important, 19 low issues
- Phase 2 recommendations: rate limiting + APP_SECRET minLength validation

**From 01.3-01 (Review Fixes):**
- Rate limiting on resend-verification: 3 requests per hour via @fastify/rate-limit
- Scoped plugin pattern: rate limiting isolated to single endpoint via fastify.register scope
- APP_SECRET validation: minLength: 32 enforced at config load time
- ErrorBoundary: class component with styled fallback wraps entire React app
- SPA navigation: Header logo uses React Router Link instead of anchor tag

### Pending Todos

- Set up GitHub OAuth App for login testing (callback URL: /api/v1/auth/callback/github)
- Configure production SMTP for email sending
- Consider remaining accessibility improvements from 01.2-02 (ARIA roles, icon deduplication)

### Blockers/Concerns

- None blocking. All "important" code review recommendations addressed in Phase 1.3.

### Roadmap Evolution

- Phase 1.1 inserted after Phase 1: Code Refactoring (URGENT) - User requested quality improvements before continuing
- Phase 1.2 inserted after Phase 1.1: Code Review - Thorough review of implemented code for quality and issues
- Phase 1.3 inserted after Phase 1.2: Review Fixes (URGENT) - Address 2 important + 2 low recommendations before Phase 2

## Session Continuity

Last session: 2026-02-04
Stopped at: Completed Phase 1.3 (Review Fixes)
Resume action: Plan and execute Phase 2 (GitHub Integration)
