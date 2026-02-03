# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-03)

**Core value:** Users own their content in git — standard Astro projects, portable, not locked into Barae.
**Current focus:** Phase 1 - Foundation & Auth

## Current Position

Phase: 1 of 4 (Foundation & Auth)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-02-03 - Completed 01-02-PLAN.md (Auth UI & Email Integration)

Progress: [██░░░░░░░░] 20%

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

### Pending Todos

- Apply database migration after POSTGRES_* env vars configured
- Set up GitHub OAuth App for login testing
- Configure Resend for production email sending

### Blockers/Concerns

- Database must be running with credentials in .env before auth can be tested

## Session Continuity

Last session: 2026-02-03T15:38:00Z
Stopped at: Completed 01-02-PLAN.md
Resume file: .planning/phases/01-foundation-auth/01-03-PLAN.md (next)
