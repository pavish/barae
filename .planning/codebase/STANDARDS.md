# Barae Codebase Standards

## Priority Rules

These rules must never be disobeyed. User can add items here at any time.

1. **No `process.env` outside config** — Backend has a single `@fastify/env` config plugin that reads and validates env vars. All other files access config via `fastify.config` after plugin registration. *Exceptions:* `drizzle.config.ts` and `scripts/migrate.ts` may read `process.env` directly (CLI/deployment tools, not application code). `app.ts` reads `process.env.NODE_ENV` for logger bootstrap before any plugins run (documented single exception).
2. **No frontend env variables** — Frontend never uses `import.meta.env` or env vars. Impossible in production static builds. For rare dev-only exceptions, ask user first.
3. **Single .env at root only** — One `.env` and `.env.example` at project root for Docker Compose. Never in subdirectories including `backend/`.
4. **API versioning required** — All Fastify routes use URL path prefix versioning (`/v1/...`).
5. **Routes co-located with features** — Route files live inside their feature module (e.g., `src/auth/routes.ts`), not in a top-level `src/routes/` directory. Each feature owns its routes alongside its plugins and logic.
6. **Verify every commit** — User reviews all code/pattern commits before proceeding.
7. **Never assume** — Ask user for details on new features, data models, UI flows, API contracts.

## Standards Documents

Detailed, enforceable standards are maintained in individual topic documents. Each document is prescriptive ("do X", "never Y") and covers patterns established in Phases 1 and 2.

| Document | Scope |
|----------|-------|
| [backend.md](backend.md) | Fastify plugin architecture, config (`@fastify/env`), database, auth, routes, error handling, graceful shutdown, logging |
| [frontend.md](frontend.md) | React 19, shadcn/ui, TanStack Query, API communication, auth client, state management, component patterns |
| [typescript.md](typescript.md) | Very strict mode, no-`any` policy, ESLint + Prettier separation, import aliases, module format |
| [docker.md](docker.md) | Compose patterns, Caddy reverse proxy, container naming, healthchecks, environment variables |
| [dependencies.md](dependencies.md) | Dependency health verification, per-phase audit, no pre-install policy, `@sinclair/typebox` as direct dep |
| [migrations.md](migrations.md) | Naming convention, journal sync, schema array config, migration script |

**These documents are enforced on every code change.** When reviewing or writing code, consult the relevant topic document.

## Project Structure

- `backend/`, `frontend/`, `shared/` at root (no workspaces)
- Backend: feature-based (e.g., `src/auth/`, `src/db/`) — routes co-located within their feature module
- Shared: domain-based (`shared/auth/`, `shared/github/`)
- Package manager: npm

## Naming Conventions

- Files: camelCase (`userService.ts`, `authRoutes.ts`)
- Classes & React components: PascalCase (`UserService.ts`, `LoginForm.tsx`)
- Folders: kebab-case (`src/features/auth/`, `components/login-form/`)
- Migrations: numbered prefix + descriptive (`0001_create_auth_tables.sql`)

## Backend Stack

- Fastify with plugin-based architecture (see [backend.md](backend.md))
- Config via `@fastify/env` plugin -- accessed via `fastify.config` after registration
- Drizzle ORM (standard ops) + raw SQL via `sql` tag (complex queries)
- better-auth (authentication)
- Caddy handles CORS in dev/prod -- no `@fastify/cors` needed
- Graceful shutdown via `close-with-grace`
- Logging: pino-pretty for dev, JSON for production

## Frontend Stack

- React 19 + Vite 7 (see [frontend.md](frontend.md))
- React Router (routing)
- Zustand (client state) + TanStack Query (server state)
- Tailwind CSS v4 + shadcn/ui (styling/components)

## TypeScript

- Very strict mode (see [typescript.md](typescript.md))
- ESLint (`typescript-eslint/recommended`) + `eslint-config-prettier`
- Prettier runs separately (not through ESLint)
- Import alias: `@/` maps to `src/`
- Unused vars: `argsIgnorePattern: '^_'`

## Docker & Infrastructure

- Everything containerized (see [docker.md](docker.md))
- Three compose files: dev, prod, test
- Caddy reverse proxy: `handle_path` strips `/api/` prefix
- Dev: HTTP on port 8100. Prod: auto-HTTPS via Let's Encrypt.
- PostgreSQL 17

## Project Conventions

The team follows a **review-after-phase practice**: a review/standards phase is inserted after every execution phase and after full milestone completion to maintain code quality and standards accuracy. This is a project practice (user preference) for planning purposes, not an automated enforcement.

## Skills (load only when relevant to the task)

- `/fastify-best-practices` -- consult only when writing backend Fastify routes, plugins, or handlers
- `/better-auth-best-practices` -- consult only when implementing authentication features
- `/frontend-design` -- consult only when building or styling UI components and pages

**Do NOT load all skills at once.** Only invoke the skill that matches the current task area.
