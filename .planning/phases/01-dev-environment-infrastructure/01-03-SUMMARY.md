---
phase: 01-dev-environment-infrastructure
plan: 03
subsystem: infra
tags: [docker, caddy, compose, dockerfile, reverse-proxy, multi-stage]

# Dependency graph
requires:
  - phase: 01-dev-environment-infrastructure (01-01)
    provides: Backend config, app.ts, db, migration script
  - phase: 01-dev-environment-infrastructure (01-02)
    provides: Frontend Vite config, app scaffold, directory structure
provides:
  - Caddy dev config (HTTP proxy on port 8100)
  - Caddy prod config (auto-HTTPS, security headers, SPA fallback)
  - Root-level Dockerfile.backend (multi-stage dev/prod)
  - Root-level Dockerfile.proxy (multi-stage dev/dev-frontend/prod)
  - compose.dev.yml with 5 services (db, mailpit, backend, frontend, proxy)
  - compose.prod.yml with 3 services (db, backend, proxy)
  - compose.test.yml with 3 services (db, mailpit, backend)
  - Root .dockerignore for project-root build context
affects: [01-04, all-phases]

# Tech tracking
tech-stack:
  added: [caddy:2-alpine]
  patterns: [root-level-dockerfiles, multi-stage-builds, caddy-reverse-proxy, handle_path-api-stripping]

key-files:
  created:
    - caddy/Caddyfile.dev
    - caddy/Caddyfile.prod
    - Dockerfile.proxy
    - Dockerfile.backend
    - .dockerignore
  modified:
    - compose.dev.yml
    - compose.prod.yml
    - compose.test.yml
    - .env.example
    - .gitignore

key-decisions:
  - "Dockerfiles at project root with backend/ and frontend/ prefixed COPY paths (root build context)"
  - "Caddy handle_path strips /api/ prefix so Fastify sees clean /v1/... routes"
  - "Prod Dockerfile.proxy includes frontend build stage -- no separate frontend container in production"
  - "Dev frontend runs as separate container from Dockerfile.proxy dev-frontend target"
  - "Caddy dev config uses auto_https off for HTTP-only development"
  - "Prod backend image includes migrations/ and scripts/ for runtime migration support"
  - "DOMAIN env var controls Caddy prod site address (defaults to localhost)"
  - "Removed VITE_API_URL, FRONTEND_URL, HTTP_PORT, GITHUB vars from .env.example"

patterns-established:
  - "Root build context: All Dockerfiles at project root, COPY uses subdirectory prefixes"
  - "Multi-stage Dockerfiles: dev/build/prod stages in each Dockerfile"
  - "Caddy API stripping: handle_path /api/* removes prefix before proxying to backend"
  - "Compose service naming: barae-dev-* for dev, barae-* for prod, barae-test-* for test"

# Metrics
duration: 3min
completed: 2026-02-05
---

# Phase 1 Plan 3: Docker & Caddy Infrastructure Summary

**Caddy reverse proxy configs (dev HTTP + prod auto-HTTPS), root-level multi-stage Dockerfiles for backend and proxy, three compose files rewritten for Caddy architecture**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-05T16:12:48Z
- **Completed:** 2026-02-05T16:15:38Z
- **Tasks:** 2
- **Files modified:** 14 (5 created, 4 modified, 5 deleted)

## Accomplishments
- Caddy dev config serves everything through port 8100 with /api/ prefix stripping to backend
- Caddy prod config with auto-HTTPS, gzip, security headers (HSTS, X-Frame-Options, CSP-related), and SPA fallback
- Root-level Dockerfile.backend with multi-stage (base, deps, dev, build, prod) including migrations and scripts
- Root-level Dockerfile.proxy with 4 stages (dev Caddy, dev-frontend Vite, build, prod Caddy+static)
- Dev compose: 5 services (db, mailpit, backend, frontend, proxy) all accessible through localhost:8100
- Prod compose: 3 services (db, backend, proxy) with Caddy handling static files and auto-HTTPS
- Test compose: 3 services (db, mailpit, backend) with ephemeral tmpfs database
- Cleaned up old nginx.conf, subdirectory Dockerfiles and .dockerignore files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Caddy configs + Proxy Dockerfile** - `9e28b70` (feat)
2. **Task 2: Backend Dockerfile at root + all compose files + env + cleanup** - `bb1177c` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `caddy/Caddyfile.dev` - Caddy dev config: HTTP-only on port 8100, proxies /api/ to backend, rest to Vite
- `caddy/Caddyfile.prod` - Caddy prod config: auto-HTTPS, security headers, static files with SPA fallback
- `Dockerfile.proxy` - Multi-stage: dev (Caddy), dev-frontend (Vite), build (Node), prod (Caddy+static)
- `Dockerfile.backend` - Multi-stage: base, deps, dev, build, prod with migrations and scripts
- `.dockerignore` - Root-level Docker build context exclusions
- `compose.dev.yml` - Rewritten: 5 services with root build context and Caddy proxy
- `compose.prod.yml` - Rewritten: 3 services with Caddy replacing nginx, DOMAIN env var
- `compose.test.yml` - Rewritten: root build context, removed unused env vars
- `.env.example` - Cleaned: removed VITE_API_URL, FRONTEND_URL, HTTP_PORT, GitHub vars; added DOMAIN
- `.gitignore` - Added caddy/data/ and caddy/config/ entries

**Deleted:**
- `backend/Dockerfile` - Replaced by root Dockerfile.backend
- `backend/.dockerignore` - No longer needed (root build context)
- `frontend/Dockerfile` - Replaced by root Dockerfile.proxy
- `frontend/.dockerignore` - No longer needed (root build context)
- `frontend/nginx.conf` - Replaced by Caddy

## Decisions Made
- Dockerfiles placed at project root with backend/ and frontend/ prefixed COPY paths to use a single root build context
- Caddy handle_path strips /api/ prefix so Fastify sees clean /v1/ routes without path manipulation
- Prod proxy image includes frontend build stage (no separate frontend container in production)
- Dev frontend is a separate container targeting Dockerfile.proxy dev-frontend stage (one-process-per-container)
- DOMAIN env var defaults to localhost for local testing, set to real domain in production for auto-HTTPS
- Prod backend image copies migrations/ and scripts/ directories for runtime migration support
- Removed VITE_API_URL, FRONTEND_URL, HTTP_PORT, and premature GitHub vars from .env.example

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Docker and Caddy infrastructure complete, ready for 01-04 integration verification
- Dev stack can be brought up with `docker compose -f compose.dev.yml up` at localhost:8100
- All services use root build context with proper Dockerfile references
- .env.example reflects the actual required configuration

---
*Phase: 01-dev-environment-infrastructure*
*Completed: 2026-02-05*
