# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** Users own their content in git — standard Astro projects, portable, not locked into Barae.
**Current focus:** Phase 1.1 - Code Refactoring

## Current Position

Phase: 1.1 of 4 (Code Refactoring)
Plan: Backend refactoring complete
Status: In progress
Last activity: 2026-02-03 - Completed backend refactoring (single DB connection, versioned routes, plugin patterns)

Progress: [███░░░░░░░] 30%

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
- Graceful fallback to console logging when RESEND_API_KEY not set
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

### Pending Todos

- Set up GitHub OAuth App for login testing (callback URL now: /api/v1/auth/callback/github)
- Configure Resend for production email sending
- Complete Phase 1 Plan 03-03 (Dashboard shell)

### Blockers/Concerns

- None currently - test environment works with `docker compose -f compose.test.yml up --build`

### Roadmap Evolution

- Phase 1.1 inserted after Phase 1: Code Refactoring (URGENT) - User requested quality improvements before continuing

## Session Continuity

Last session: 2026-02-03T15:38:00Z
Stopped at: Completed 01-02-PLAN.md
Resume file: .planning/phases/01-foundation-auth/01-03-PLAN.md (next)
