# Phase 1: Dev Environment & Infrastructure - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Working dev/prod stack with Docker, Caddy, database migrations, environment validation, and initial codebase standards documentation. Everything in containers, accessible at localhost:8100 in dev.

</domain>

<decisions>
## Implementation Decisions

### Project Structure
- Top-level `backend/` and `frontend/` directories (no workspaces)
- `shared/` directory at root for types, constants, validation schemas — organized by domain (shared/auth/, shared/github/)
- Package manager: **npm**
- Backend organized by **feature** (src/features/auth/, src/features/github/) — routes, services, schemas grouped per feature
- Frontend uses **React Router** for routing
- Frontend state: **Zustand** (client state) + **TanStack Query** (server state)
- Frontend UI: **Tailwind CSS + shadcn/ui**
- Database: **Drizzle ORM** for standard ops, raw SQL via Drizzle's `sql` tag for complex queries
- TypeScript: **very strict** mode (strict: true + noUncheckedIndexedAccess, exactOptionalPropertyTypes)
- Linting/formatting: **ESLint + Prettier**

### File & Naming Conventions
- Files: **camelCase** (e.g., userService.ts, authRoutes.ts)
- Classes and React components: **PascalCase** (e.g., UserService.ts, LoginForm.tsx)
- Folders: **kebab-case** (e.g., src/features/auth/, components/login-form/)
- Migration files: **numbered prefix + descriptive name** (e.g., 0001_create_users.sql)

### Environment Configuration
- Single `.env` + `.env.example` at **root only** — used by Docker Compose
- **Never** place .env files in subdirectories (including backend/)
- Backend: single `config` file reads `process.env`, validates, and exports typed values
- **No other backend file may use `process.env`** — all code imports from config
- Optional env vars with defaults handled only in config — consumers assume values exist
- TypeScript enforces this: config exports are non-optional typed values
- Frontend: **never uses env variables** (impossible in production static builds)
- For rare dev-only frontend env cases, always ask user first

### Docker & Dev Workflow
- **Everything runs in containers** — backend, frontend, Postgres, Caddy
- Two Dockerfiles at root (not inside subdirectories):
  1. **Backend Dockerfile** — multi-stage (dev: hot reload, prod: built app)
  2. **Proxy Dockerfile** — multi-stage (dev: Caddy + Vite dev server, prod: Caddy + built static files)
- Three Docker Compose files:
  1. **docker-compose.dev.yml** — full dev stack
  2. **docker-compose.prod.yml** — production services
  3. **docker-compose.test.yml** — separate DB, auto-starts E2E/integration tests
- Other test types (unit, component) run on dev containers
- Source code: **bind mounts + volumes** (follow existing approach)
- node_modules: **installed inside container**, cached via named volume — local npm install for IDE support, container volume prevents cross-contamination (macOS host vs Linux container)
- PostgreSQL **17**
- **No seed script** — empty database in dev
- **Named volumes** for DB data persistence (survives docker compose down)
- Container naming: **barae- prefix** (barae-backend, barae-proxy, barae-db)
- Startup: **depends_on + healthcheck** (pg_isready for Postgres)

### Database Migrations
- **Separate deployment script** — not embedded in app startup
- Run by CI/CD before deploying services
- Also runnable manually
- Details to be discussed during implementation

### Caddy & Routing
- Dev: **HTTP only** at localhost:8100 (Caddy doesn't provide certs for localhost)
- Prod: **Caddy auto-HTTPS** via Let's Encrypt
- Caddy **strips /api/ prefix** before proxying to Fastify — Fastify routes are clean (e.g., /v1/auth/login)
- Error handling: **JSON errors for /api/ requests, HTML error page for frontend requests**
- API versioning: **URL path prefix** — client calls /api/v1/..., Fastify sees /v1/...

### Codebase Standards
- Single `STANDARDS.md` file in `.planning/codebase/`
- Patterns only — no implementation details, minimize context waste
- Includes a **priority section** for critical rules that must never be disobeyed
- Draft the standards doc during Phase 1 (skeleton based on discussion, refined during implementation)

### Claude's Discretion
- Security headers and rate limiting layer (Caddy vs app — Claude picks appropriate layer per concern)
- Node.js version for containers
- Log management approach
- Exact Caddy configuration syntax
- Frontend directory structure (pages, components, hooks, utils organization)
- Import path aliases configuration
- Git conventions (branch naming, commit format)

</decisions>

<specifics>
## Specific Ideas

- "Env config pattern: one config file is the single source of truth. The type system ensures no undefined access anywhere."
- "node_modules isolation: local install for IDE, container install for runtime — they must never interfere with each other"
- "Standards doc should have a priority section I can add items to anytime — these rules must never be disobeyed"
- Migration naming like 0001_create_users.sql — descriptive, ordered
- Caddy strips /api/ so Fastify stays deployment-agnostic

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-dev-environment-infrastructure*
*Context gathered: 2026-02-05*
