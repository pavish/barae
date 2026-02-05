---
phase: 02-auth-backend
plan: 01
subsystem: database
tags: [drizzle, postgres, better-auth, schema, migration]

# Dependency graph
requires:
  - phase: 01-dev-environment-infrastructure
    provides: Fastify backend, config module, Drizzle setup, Docker compose
provides:
  - Standalone Drizzle client importable outside Fastify lifecycle
  - Auth schema tables (user, session, account, verification) with relations
  - AUTH_BASE_URL config field for better-auth URL generation
  - Initial SQL migration for auth tables
affects: [02-auth-backend plan 02, 03-dashboard-shell, 04-github-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Standalone db client pattern: db/client.ts exports shared postgres+drizzle instance, Fastify plugin wraps it"
    - "Schema files listed individually in drizzle.config.ts (array) to avoid barrel .js import conflict with drizzle-kit CJS loader"

key-files:
  created:
    - backend/src/db/client.ts
    - backend/src/db/schema/auth.ts
    - backend/migrations/0000_orange_bloodaxe.sql
  modified:
    - backend/src/db/index.ts
    - backend/src/db/schema/index.ts
    - backend/src/config.ts
    - backend/drizzle.config.ts
    - .env.example
    - compose.dev.yml
    - compose.test.yml

key-decisions:
  - "Standalone db client in db/client.ts shared by Fastify plugin and better-auth (no duplicate connections)"
  - "drizzle.config.ts uses schema array instead of barrel index.ts to avoid CJS .js import resolution conflict"
  - "AUTH_BASE_URL is required env var set via compose environment overrides (dev/test) and .env (prod)"

patterns-established:
  - "Standalone db client: import { db } from '@/db/client.js' for module-level db access outside Fastify"
  - "Schema file listing: add new schema files to drizzle.config.ts schema array, not just barrel export"

# Metrics
duration: 4min
completed: 2026-02-05
---

# Phase 2 Plan 1: Database Foundation & Config Summary

**Standalone Drizzle client extracted from Fastify plugin, better-auth schema tables (user/session/account/verification) with relations, AUTH_BASE_URL config, and initial SQL migration**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-05T17:54:57Z
- **Completed:** 2026-02-05T17:58:47Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Extracted database connection into standalone module (`db/client.ts`) that both Fastify and better-auth can import
- Created four auth schema tables matching better-auth requirements with Drizzle relations
- Added AUTH_BASE_URL as required config field with compose environment overrides
- Generated initial SQL migration creating all auth tables with proper FK constraints

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract standalone Drizzle client and refactor Fastify db plugin** - `c07dbc0` (refactor)
2. **Task 2: Create auth schema, update config, and generate migration** - `397e8bb` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `backend/src/db/client.ts` - Standalone postgres.js client and Drizzle instance (new)
- `backend/src/db/index.ts` - Refactored Fastify plugin that imports from client.ts
- `backend/src/db/schema/auth.ts` - better-auth schema: user, session, account, verification tables with relations (new)
- `backend/src/db/schema/index.ts` - Barrel export including auth schema
- `backend/src/config.ts` - Added auth.baseURL from AUTH_BASE_URL env var
- `backend/drizzle.config.ts` - Changed schema to array format for drizzle-kit compatibility
- `.env.example` - Added AUTH_BASE_URL with dev/prod guidance
- `compose.dev.yml` - Added AUTH_BASE_URL environment override
- `compose.test.yml` - Added AUTH_BASE_URL environment value
- `backend/migrations/0000_orange_bloodaxe.sql` - Initial migration creating auth tables (new)
- `backend/migrations/meta/` - Drizzle migration metadata (new)

## Decisions Made
- **Standalone db client pattern:** `db/client.ts` creates and exports the postgres client and Drizzle instance at module level. The Fastify plugin imports from it rather than creating its own connection. This ensures better-auth and Fastify share the same database connection.
- **drizzle.config.ts schema array:** Changed from `./src/db/schema/index.ts` to `['./src/db/schema/auth.ts']` because drizzle-kit uses CJS `require()` internally, which cannot resolve `.js` extension imports in the barrel `index.ts`. Individual schema files are listed explicitly.
- **AUTH_BASE_URL in compose files:** Added as environment override in compose.dev.yml (defaulting to `http://localhost:8100/api`) and hardcoded in compose.test.yml (`http://localhost:3000/api` since test bypasses proxy). Production reads from .env file.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] drizzle.config.ts schema path changed to array format**
- **Found during:** Task 2 (migration generation)
- **Issue:** drizzle-kit uses CJS `require()` to load schema files, which cannot resolve `.js` extension imports in the barrel `index.ts` (`export * from './auth.js'`). Migration generation failed with `Cannot find module './auth.js'`.
- **Fix:** Changed `schema` in `drizzle.config.ts` from `'./src/db/schema/index.ts'` to `['./src/db/schema/auth.ts']`, listing schema files directly instead of through the barrel.
- **Files modified:** `backend/drizzle.config.ts`
- **Verification:** `npx drizzle-kit generate` succeeded, producing correct migration SQL
- **Committed in:** `397e8bb` (part of Task 2 commit)

**2. [Rule 3 - Blocking] Added AUTH_BASE_URL to compose.dev.yml and compose.test.yml**
- **Found during:** Task 2 (config update)
- **Issue:** AUTH_BASE_URL is now a required env var in config.ts. Without it in compose files, backend containers would fail to start with missing env var error.
- **Fix:** Added `AUTH_BASE_URL` environment override to compose.dev.yml (with default `http://localhost:8100/api`) and compose.test.yml (`http://localhost:3000/api`).
- **Files modified:** `compose.dev.yml`, `compose.test.yml`
- **Verification:** TypeScript compilation passes; env var will be available at container startup
- **Committed in:** `397e8bb` (part of Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were necessary for correct migration generation and container startup. No scope creep.

## Issues Encountered
None beyond the deviations documented above.

## User Setup Required
None - no external service configuration required. AUTH_BASE_URL is set automatically by Docker Compose.

## Next Phase Readiness
- Standalone Drizzle client ready for better-auth initialization in Plan 02-02
- Auth schema tables ready for migration against a running database
- Config auth.baseURL ready for better-auth URL configuration
- No blockers for Plan 02-02

---
*Phase: 02-auth-backend*
*Completed: 2026-02-05*
