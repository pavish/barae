---
phase: 01-foundation-auth
plan: 01
subsystem: auth
tags: [better-auth, drizzle, fastify, react, vite, tailwind, typescript]

# Dependency graph
requires: []
provides:
  - better-auth instance with Drizzle adapter for PostgreSQL
  - Fastify plugin mounting auth endpoints at /api/auth/*
  - React frontend scaffold with Vite, React Router, TanStack Query
  - Auth client with useSession hook for frontend
  - Protected route wrapper component
  - Dark mode theme hook with system preference support
  - Database migration for user, session, account, verification tables
affects: [01-02, 01-03, 02-01, 02-02]

# Tech tracking
tech-stack:
  added: [better-auth, resend, react-router-dom, @tanstack/react-query, tailwindcss v4, @tailwindcss/vite]
  patterns: [fastify-plugin for modular registration, Web Request/Response conversion for better-auth, CSS variables for theming]

key-files:
  created:
    - backend/src/auth/index.ts
    - backend/src/auth/schema.ts
    - backend/src/plugins/auth.ts
    - frontend/src/features/auth/lib/auth-client.ts
    - frontend/src/routes/ProtectedRoute.tsx
    - frontend/src/routes/index.tsx
    - frontend/src/shared/hooks/useTheme.ts
  modified:
    - backend/src/index.ts
    - backend/src/config.ts
    - backend/src/db/schema/index.ts
    - backend/drizzle.config.ts

key-decisions:
  - "better-auth uses separate postgres client to avoid Fastify plugin dependency"
  - "Auth schema in src/auth/schema.ts, re-exported via src/db/schema/index.ts"
  - "drizzle-kit generate requires tsx wrapper due to ESM .js extension imports"
  - "Two user tables exist: users (scaffold) and user (better-auth) - better-auth table is source of truth"

patterns-established:
  - "Fastify plugin pattern: use fastify-plugin wrapper with named dependencies"
  - "Web Request conversion: construct Headers, URL, body from Fastify request for better-auth handler"
  - "Theme management: CSS variables in :root and .dark, localStorage persistence, system preference listener"
  - "Protected routes: useSession hook + Navigate redirect pattern"

# Metrics
duration: 15min
completed: 2026-02-03
---

# Phase 01 Plan 01: Backend Auth + Frontend Scaffold Summary

**better-auth configured with Drizzle adapter, React frontend scaffolded with Vite/Tailwind/React Router, migration generated for auth tables**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-02-03T15:15:00Z
- **Completed:** 2026-02-03T15:30:00Z
- **Tasks:** 3
- **Files modified:** 20+

## Accomplishments

- Configured better-auth with email/password and GitHub OAuth support
- Created Fastify plugin to mount auth at /api/auth/* with proper Web Request/Response conversion
- Scaffolded React frontend with Vite, React Router, TanStack Query, and Tailwind v4
- Set up auth client with useSession hook for frontend session management
- Created ProtectedRoute wrapper for authenticated routes
- Implemented useTheme hook with light/dark/system preference
- Generated Drizzle migration for all better-auth tables

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure better-auth with Drizzle adapter** - `325d356` (feat)
2. **Task 2: Scaffold React frontend with Vite and routing** - `7e00198` (feat)
3. **Task 3: Run database migration for auth tables** - `3ef3c7d` (chore)

## Files Created/Modified

**Backend:**
- `backend/src/auth/index.ts` - better-auth instance with Drizzle adapter, email/password + GitHub OAuth
- `backend/src/auth/schema.ts` - Auth tables: user, session, account, verification
- `backend/src/plugins/auth.ts` - Fastify plugin mounting auth at /api/auth/*
- `backend/src/index.ts` - Updated to register auth plugin after CORS
- `backend/src/config.ts` - Added GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, FRONTEND_URL
- `backend/src/db/schema/index.ts` - Re-exports auth schema
- `backend/drizzle.config.ts` - Schema paths for migration generation
- `backend/.env.example` - Environment variable template
- `backend/migrations/0000_*.sql` - Initial migration with all tables

**Frontend:**
- `frontend/src/features/auth/lib/auth-client.ts` - better-auth React client with hooks
- `frontend/src/routes/ProtectedRoute.tsx` - Route guard for authenticated pages
- `frontend/src/routes/index.tsx` - Router configuration with public and protected routes
- `frontend/src/shared/hooks/useTheme.ts` - Theme management hook
- `frontend/src/App.tsx` - Root component with QueryClientProvider and RouterProvider
- `frontend/src/index.css` - Tailwind v4 import with CSS theme variables
- `frontend/index.html` - Theme flash prevention script
- `frontend/vite.config.ts` - Tailwind plugin and API proxy configuration
- `frontend/.env.example` - Frontend environment template

## Decisions Made

1. **Separate postgres client for better-auth** - Auth module creates its own database connection to avoid circular dependency with Fastify config plugin. This allows auth to work independently of Fastify's plugin lifecycle.

2. **Auth schema location** - Placed in `src/auth/schema.ts` (close to auth code) and re-exported from `src/db/schema/index.ts` (for Drizzle config compatibility).

3. **drizzle-kit with tsx** - Standard `npx drizzle-kit generate` fails due to ESM `.js` extension imports. Using `npx tsx node_modules/drizzle-kit/bin.cjs generate` works correctly.

4. **Two user tables** - Kept existing `users` table from scaffold alongside better-auth's `user` table. The `user` table is the source of truth for authentication. Old `users` table can be removed in future cleanup.

5. **CORS credentials enabled** - Changed CORS config from `origin: '*'` to specific frontend URL with `credentials: true` to allow auth cookies.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] drizzle-kit ESM module resolution**
- **Found during:** Task 3 (migration generation)
- **Issue:** `npx drizzle-kit generate` failed with "Cannot find module './users.js'" due to ESM `.js` extension imports in TypeScript files
- **Fix:** Used `npx tsx node_modules/drizzle-kit/bin.cjs generate` to run drizzle-kit through tsx which handles TypeScript properly
- **Files modified:** None (workaround in command)
- **Verification:** Migration generated successfully with all 5 tables
- **Committed in:** 3ef3c7d (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Workaround documented. No code changes needed.

## Issues Encountered

- **Database connection for migration apply:** The migration was generated but could not be applied without database credentials. User must run `npx tsx node_modules/drizzle-kit/bin.cjs migrate` with proper POSTGRES_* environment variables set.

## User Setup Required

**GitHub OAuth requires manual configuration.** To enable GitHub login:

1. Go to https://github.com/settings/developers
2. Create new OAuth App:
   - Application name: Barae (dev)
   - Homepage URL: http://localhost:5173
   - Callback URL: http://localhost:3000/api/auth/callback/github
3. Add to backend `.env`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

**Database setup required:**
1. Create PostgreSQL database named `barae`
2. Add to backend `.env`:
   ```
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=barae
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   ```
3. Run migration: `cd backend && npx tsx node_modules/drizzle-kit/bin.cjs migrate`

## Next Phase Readiness

**Ready for Plan 02 (Auth UI):**
- Auth endpoints available at /api/auth/* (pending database setup)
- Frontend routing configured with /auth, /dashboard, /settings placeholders
- Auth client with useSession hook ready for login/signup forms
- ProtectedRoute wrapper ready for dashboard protection

**Blockers:**
- Database must be set up and migration applied before auth can be tested
- GitHub OAuth credentials optional but recommended for full testing

## Commands to Run

**Start backend:**
```bash
cd backend && npm run dev
```

**Start frontend:**
```bash
cd frontend && npm run dev
```

**Apply migration (after database setup):**
```bash
cd backend && npx tsx node_modules/drizzle-kit/bin.cjs migrate
```

---
*Phase: 01-foundation-auth*
*Completed: 2026-02-03*
