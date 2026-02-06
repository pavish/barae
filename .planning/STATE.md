# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** Built for long-term maintenance, not just initial site creation. Users own their content in git -- standard Astro projects, portable, not locked into Barae.
**Current focus:** Phase 3 in progress. Plans 01-03 complete (foundation, routing, auth forms, dashboard shell). Next: Plan 04 (integration verification).

## Current Position

Phase: 3 of 6 (Dashboard Shell & Auth Frontend)
Plan: 3 of 4 in current phase
Status: In progress
Last activity: 2026-02-06 -- Completed 03-03-PLAN.md

Progress: [████████░░] ~76%

## Performance Metrics

**Velocity:**
- Total plans completed: 13
- Average duration: ~5min
- Total execution time: ~64min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 4/4 | ~16min | ~4min |
| 2 | 2/2 | ~14min | ~7min |
| 2.1 | 4/4 | ~25min | ~6min |
| 3 | 3/4 | ~9min | ~3min |

**Recent Trend:**
- Last 5 plans: 02.1-04 (~13min), 02.1-02 (~2min), 03-01 (~2min), 03-02 (~4min), 03-03 (~3min)
- Trend: fast (shell components + page building, straightforward wiring)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Single GitHub App for both OAuth login and repo access (no separate OAuth App)
- [Roadmap]: better-auth for all authentication (email/password, OTP, sessions, GitHub OAuth)
- [Roadmap]: Caddy reverse proxy for both dev and prod (port 8100 in dev)
- [Roadmap]: Testing deferred to Phase 6 after all features are built
- [01-01]: ~~Config is a standalone module, not a Fastify plugin -- imported directly~~ (superseded by 02.1-03)
- [02.1-03]: Config via @fastify/env plugin -- accessed as fastify.config after plugin registration
- [01-01]: Migration script reads process.env directly (only exception to config-only rule)
- [01-01]: CORS removed -- Caddy handles all proxying
- [01-01]: TypeScript very strict mode: noUncheckedIndexedAccess + exactOptionalPropertyTypes
- [01-02]: Vite proxy removed -- Caddy handles all /api routing
- [01-02]: apiFetch wrapper uses relative /api path, no env variables
- [01-02]: shadcn/ui defaults: new-york style, neutral base color, CSS variables
- [01-02]: TanStack Query defaults: 5min staleTime, 1 retry
- [01-03]: Dockerfiles at project root with backend/ and frontend/ prefixed COPY paths (root build context)
- [01-03]: Caddy handle_path strips /api/ prefix so Fastify sees clean /v1/ routes
- [01-03]: Prod proxy image includes frontend build -- no separate frontend container in production
- [01-03]: DOMAIN env var controls Caddy prod site address (defaults to localhost)
- [01-03]: Removed VITE_API_URL, FRONTEND_URL, HTTP_PORT, premature GitHub vars from .env.example
- [02-01]: ~~Standalone db client in db/client.ts shared by Fastify plugin and better-auth (no duplicate connections)~~ (superseded by 02.1-03)
- [02.1-03]: db/client.ts is a factory function; client created inside Fastify db plugin using fastify.config
- [02-01]: drizzle.config.ts uses schema array instead of barrel index.ts (CJS .js import resolution conflict)
- [02-01]: AUTH_BASE_URL is required env var set via compose environment overrides (dev/test) and .env (prod)
- [02-02]: better-auth baseURL must include full public path (/api/auth) -- basePath is ignored when URL already has pathname
- [02-02]: Fastify auth route handler prepends /api to request URL to reconstruct Caddy-stripped prefix
- [02-02]: sendVerificationOnSignUp: true auto-sends OTP on registration
- [02-02]: trustedOrigins uses origin only (scheme+host), not full URL with path
- [02-02]: Frontend auth client uses relative /api baseURL with no env variables
- [02.1-02]: Keep @sinclair/typebox -- needed for @fastify/env schema definitions in Plan 03
- [02.1-02]: @fastify/cookie safely removed -- better-auth has no fastify peer deps, handles cookies via Web API
- [02.1-01]: Standards docs describe TARGET state (post-refactor) to guide code fixes in Plans 02 and 03
- [02.1-01]: Frontend scaffolded deps kept intentionally for Phase 3
- [02.1-01]: Review-after-phase documented as project convention (user preference), not workflow enforcement
- [02.1-01]: CLAUDE.md is a concise pointer (37 lines) to .planning/codebase/, not a full standards doc
- [02.1-03]: process.env.NODE_ENV read directly in app.ts for logger bootstrap (single documented exception)
- [02.1-03]: Plugin dependency chain enforced: config -> db -> auth -> auth-routes
- [02.1-03]: Email errors caught and logged (replaced void sendEmail fire-and-forget)
- [02.1-03]: close-with-grace replaces manual process.on signal handlers for graceful shutdown

**Phase 2.1 consolidated decisions** (summary of changes across plans 01-04):
- [02.1]: Config via @fastify/env plugin, replacing standalone config.ts module
- [02.1]: All initialization happens inside Fastify plugin lifecycle (db, auth, email) -- no module-level singletons
- [02.1]: close-with-grace for graceful shutdown (replaces manual signal handlers)
- [02.1]: Email errors logged, not silently swallowed (no void fire-and-forget)
- [02.1]: process.env.NODE_ENV read directly for logger bootstrap (single exception beyond config plugin)
- [02.1]: Migration naming convention enforced: NNNN_descriptive_name
- [02.1]: eslint-plugin-prettier removed, only eslint-config-prettier used
- [02.1-04]: Routes co-located within feature modules (src/auth/routes.ts, not src/routes/)
- [02.1-04]: CLAUDE.md simplified -- defers all rules to STANDARDS.md, no duplication
- [02.1-04]: Docker health checks use 127.0.0.1 (Alpine resolves localhost to IPv6 ::1)
- [02.1-04]: API versioning enforced: /v1/auth/*, AUTH_BASE_URL includes /api/v1
- [02.1-04]: Frontend auth client baseURL: /api/v1 (was /api)

**Phase 3 decisions** (Plans 01-03):
- [03-01]: AuthLayout and DashboardLayout are separate layout route components (not a single guard HOC)
- [03-01]: DashboardLayout does NOT include dashboard shell yet -- shell wraps Outlet in Plan 03
- [03-01]: Auth view state machine uses Zustand (login/signup/verify-otp/forgot-password/reset-password)
- [03-01]: 401 detection dispatches auth:expired CustomEvent (decoupled from routing)
- [03-01]: label.tsx auto-installed as field.tsx dependency by shadcn CLI
- [03-02]: OTP lockout (30min / 3 attempts) stored in localStorage under barae:otp-lockout
- [03-02]: Password reset success auto-redirects to login after 2 seconds with email pre-filled
- [03-02]: Form-level errors use AuthErrorBanner (Alert destructive), no toasts anywhere
- [03-02]: GitHub OAuth button disabled with "Coming soon" Badge on both login and signup forms
- [03-02]: Controller + Field + FieldLabel + FieldError pattern established for all auth forms
- [03-03]: Session hooks (useSessionPolling, useAuthExpiry) wired inside DashboardShell, active for all dashboard routes
- [03-03]: SettingsPage reads session via authClient.useSession() (Outlet child, no prop drilling)
- [03-03]: AuthPage expired-session message is cross-plan note for Plan 04 integration
- [03-03]: Navigation items as const arrays for easy extension in future phases

### Pending Todos

- [01-04]: Proxy container did not auto-start in dev compose — investigate depends_on timing or add restart policy
- [01-04]: compose.test.yml needs proxy + frontend services for Cypress E2E tests (Phase 6)

### Roadmap Evolution

- Phase 2.1 inserted after Phase 2: Full review of Phase 1 & 2 code, patterns, and standards documentation update (INSERTED)
- Convention established: review/standards phase inserted after every execution phase and after full milestone completion (user preference for maintaining code quality and standards accuracy)

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-06
Stopped at: Completed 03-03-PLAN.md
Resume file: None
