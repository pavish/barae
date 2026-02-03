# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** Users own their content in git — standard Astro projects, portable, not locked into Barae.
**Current focus:** Phase 1 - Foundation & Auth (executing plan 01-03)

## Current Position

Phase: 1 of 4 (Foundation & Auth)
Plan: 01-03 Dashboard Shell (in progress - checkpoint awaiting verification)
Status: Executing
Last activity: 2026-02-03 - Tasks 1-3 of plan 01-03 complete, awaiting human verification checkpoint

Progress: [████░░░░░░] 40%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: ~13.5min
- Total execution time: ~27min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation & Auth | 2/3 | ~27min | ~13.5min |
| 2. GitHub Integration | 0/2 | - | - |
| 3. Sites & Templates | 0/2 | - | - |
| 4. Content & Editor | 0/3 | - | - |

**Recent Trend:**
- Last 5 plans: 01-01 (~15min), 01-02 (~12min)
- Trend: Consistent

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

**From 01-03 (During Verification):**
- Custom `/api/v1/auth/resend-verification` endpoint created
  - better-auth disables `/send-verification-email` when `requireEmailVerification: false`
  - Custom endpoint reads session cookie, extracts token, sends verification email
- Cookie handling: better-auth uses signed cookies (`token.signature` format)
  - Extract token by splitting on `.` before database lookup
  - Database stores raw token, not hashed
- Added @fastify/cookie for parsing cookies in custom endpoints
- .env.example updated with Mailpit defaults for local dev

### Pending Todos

- Set up GitHub OAuth App for login testing (callback URL: /api/v1/auth/callback/github)
- Complete Phase 1 Plan 01-03 human verification checkpoint
- Configure production SMTP for email sending

### Blockers/Concerns

- None currently - email verification flow working with Mailpit

### Roadmap Evolution

- Phase 1.1 inserted after Phase 1: Code Refactoring (URGENT) - User requested quality improvements before continuing

## Session Continuity

Last session: 2026-02-03
Stopped at: Plan 01-03 human verification checkpoint (tasks 1-3 complete, email fix applied)
Resume action: Complete verification checklist at http://localhost:5173, check emails at http://localhost:8025
