---
phase: 02-auth-backend
plan: 02
subsystem: auth
tags: [better-auth, email-otp, nodemailer, fastify, drizzle, session, csrf]

# Dependency graph
requires:
  - phase: 02-auth-backend plan 01
    provides: Standalone Drizzle client, auth schema tables, AUTH_BASE_URL config
  - phase: 01-dev-environment-infrastructure
    provides: Fastify backend, config module, Caddy proxy, Docker compose with Mailpit
provides:
  - better-auth instance with email/password + emailOTP plugin
  - Fastify catch-all route at /auth/* for all auth API endpoints
  - Email transport via nodemailer (Mailpit in dev, SMTP in prod)
  - Frontend auth client with type-safe methods and React hooks
  - Full auth API: signup, email verification, login, password reset, session management, logout
affects: [03-dashboard-shell, 04-github-integration, 05-production-deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "better-auth baseURL must include full public path (/api/auth) since it ignores basePath when URL already has a pathname"
    - "Fastify catch-all handler prepends /api to request URL to reconstruct Caddy-stripped prefix for better-auth"
    - "sendVerificationOnSignUp option auto-sends OTP email on registration"
    - "void sendEmail() fire-and-forget pattern to prevent timing attacks"
    - "trustedOrigins uses origin only (scheme+host), not full URL with path"

key-files:
  created:
    - backend/src/auth/email.ts
    - backend/src/auth/index.ts
    - backend/src/routes/auth.ts
    - frontend/src/lib/auth.ts
  modified:
    - backend/src/app.ts

key-decisions:
  - "better-auth baseURL set to config.auth.baseURL + '/auth' because better-auth ignores basePath when URL already has a pathname component"
  - "Route handler prepends /api to request.url to reconstruct the public URL that Caddy stripped"
  - "sendVerificationOnSignUp: true enables automatic OTP email on registration (single API call for signup + OTP)"
  - "trustedOrigins extracts origin from baseURL rather than using the full URL (better-auth needs origin for CSRF)"
  - "Frontend auth client uses relative /api baseURL with no env variables"

patterns-established:
  - "Auth route URL reconstruction: new URL(`/api${request.url}`, `http://${request.headers.host}`) to restore Caddy-stripped prefix"
  - "Frontend auth: import { authClient } from '@/lib/auth' for all auth operations"
  - "better-auth config: always set baseURL to full public path including basePath when behind reverse proxy"

# Metrics
duration: 10min
completed: 2026-02-05
---

# Phase 2 Plan 2: Auth Integration & Email Transport Summary

**better-auth with email/password + emailOTP plugin mounted on Fastify catch-all, nodemailer transport to Mailpit, and frontend React auth client**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-02-05T18:16:00Z
- **Completed:** 2026-02-05T18:26:26Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- better-auth instance configured with email/password auth, emailOTP plugin, Drizzle adapter, and 7-day sessions
- Fastify catch-all route at `/auth/*` converts Fastify requests to Fetch API for better-auth handler
- Email transport sends verification OTPs via Mailpit in dev (SMTP in prod)
- Frontend auth client with type-safe methods for all auth operations and React hooks
- All auth flows verified end-to-end: signup, OTP email, email verification, login, session retrieval, signout

## Task Commits

Each task was committed atomically:

1. **Task 1: Create email transport, better-auth instance, and Fastify route** - `9bc08e6` (feat)
2. **Task 2: Create frontend auth client** - `774fa9e` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `backend/src/auth/email.ts` - Nodemailer email transport with conditional SMTP auth (new)
- `backend/src/auth/index.ts` - better-auth instance with email/password, emailOTP, Drizzle adapter (new)
- `backend/src/routes/auth.ts` - Fastify catch-all plugin for `/auth/*` with Fetch API conversion (new)
- `backend/src/app.ts` - Registers auth routes plugin after db plugin
- `frontend/src/lib/auth.ts` - better-auth React client with emailOTPClient plugin (new)

## Decisions Made
- **baseURL includes /auth path:** better-auth's `withPath` function skips appending `basePath` when the URL already has a pathname. Since `config.auth.baseURL` is `http://localhost:8100/api` (has `/api` path), we append `/auth` explicitly to get `http://localhost:8100/api/auth` as the full baseURL.
- **Route handler reconstructs /api prefix:** Caddy strips `/api/` from requests, so Fastify receives `/auth/*`. The handler prepends `/api` to reconstruct the public URL that better-auth expects for route matching.
- **sendVerificationOnSignUp enabled:** The emailOTP plugin's `sendVerificationOnSignUp` option auto-sends the OTP email on registration, fulfilling the "single API call" requirement for signup.
- **trustedOrigins uses origin extraction:** `new URL(config.auth.baseURL).origin` extracts just the origin (scheme+host) rather than passing the full URL with path, which is what better-auth's CSRF protection expects.
- **basePath set to /api/auth:** Explicitly set as fallback, though better-auth derives it from the baseURL pathname. Ensures correct behavior if URL handling changes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed better-auth baseURL/basePath interaction**
- **Found during:** Task 1 (functional testing)
- **Issue:** better-auth's `withPath()` function skips appending `basePath` when the URL already has a pathname. With `baseURL: "http://localhost:8100/api"` and `basePath: "/auth"`, the basePath was silently ignored, causing all auth routes to return 404.
- **Fix:** Changed baseURL to `config.auth.baseURL + '/auth'` (full public path) and set `basePath: '/api/auth'` to match.
- **Files modified:** `backend/src/auth/index.ts`
- **Committed in:** `9bc08e6` (part of Task 1 commit)

**2. [Rule 1 - Bug] Fixed Fastify-to-better-auth URL construction**
- **Found during:** Task 1 (functional testing)
- **Issue:** The Request URL was constructed as `http://host/auth/ok` but better-auth expected `http://host/api/auth/ok` (with the `/api` prefix that Caddy strips).
- **Fix:** Changed URL construction to `new URL('/api' + request.url, ...)` to restore the Caddy-stripped prefix.
- **Files modified:** `backend/src/routes/auth.ts`
- **Committed in:** `9bc08e6` (part of Task 1 commit)

**3. [Rule 2 - Missing Critical] Enabled sendVerificationOnSignUp**
- **Found during:** Task 1 (functional testing)
- **Issue:** Signup created the user but did not automatically send the OTP verification email. The plan's must_have requires "single API call" for signup + OTP email trigger.
- **Fix:** Added `sendVerificationOnSignUp: true` to the emailOTP plugin configuration.
- **Files modified:** `backend/src/auth/index.ts`
- **Committed in:** `9bc08e6` (part of Task 1 commit)

**4. [Rule 2 - Missing Critical] Fixed trustedOrigins to use origin only**
- **Found during:** Task 1 (code review)
- **Issue:** `trustedOrigins` was set to the full baseURL including path (`http://localhost:8100/api`), but better-auth CSRF checks compare origins (scheme+host only).
- **Fix:** Changed to `[new URL(config.auth.baseURL).origin]` which extracts `http://localhost:8100`.
- **Files modified:** `backend/src/auth/index.ts`
- **Committed in:** `9bc08e6` (part of Task 1 commit)

---

**Total deviations:** 4 auto-fixed (2 bugs, 2 missing critical)
**Impact on plan:** All fixes were necessary for correct auth operation. The baseURL/basePath interaction is a subtle behavior in better-auth that the research document didn't fully anticipate. No scope creep.

## Issues Encountered
- better-auth's `withPath()` function has an undocumented behavior where it returns the URL as-is when it already has a pathname, silently ignoring the `basePath` parameter. This required reading the better-auth source code to diagnose. The fix is straightforward but the behavior is a potential pitfall for anyone using better-auth behind a reverse proxy with path stripping.

## User Setup Required
None - no external service configuration required. All SMTP config is handled by Docker Compose (Mailpit in dev).

## Next Phase Readiness
- Auth API fully functional at `/api/auth/*` for all Phase 2 requirements
- Frontend auth client ready for Phase 3 UI integration
- No blockers for Phase 3 (Dashboard Shell)
- AUTH-04 (GitHub OAuth) deferred to Phase 4 (GitHub Integration) per roadmap

---
*Phase: 02-auth-backend*
*Completed: 2026-02-05*
