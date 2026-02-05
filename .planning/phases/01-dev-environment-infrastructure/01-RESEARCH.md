# Phase 1: Dev Environment & Infrastructure - Research

**Researched:** 2026-02-05
**Domain:** Docker, Caddy, Fastify, Drizzle ORM, Vite, TypeScript configuration, frontend scaffolding
**Confidence:** HIGH

## Summary

Phase 1 rebuilds the existing codebase skeleton into the architecture decided during discussion. The current codebase has Docker Compose files using nginx for the frontend proxy, separate Dockerfiles inside `backend/` and `frontend/` subdirectories, and a `@fastify/env`-based config that uses TypeBox schemas on the Fastify instance. The target architecture replaces nginx with Caddy (single Proxy Dockerfile at root), consolidates Dockerfiles at root level, rewrites the config to a standalone module (not a Fastify plugin), adds the `shared/` directory, sets up very strict TypeScript, configures shadcn/ui with Tailwind v4, and creates the initial STANDARDS.md skeleton.

The standard approach is straightforward: Caddy's `handle_path` directive cleanly strips `/api/` before proxying to Fastify, `try_files` + `file_server` handles SPA fallback, and the multi-stage Proxy Dockerfile uses `caddy:2-alpine` for prod (static files) and a Node + Caddy combination for dev (proxying to Vite). Drizzle migrations run via a standalone script using `drizzle-orm/postgres-js/migrator` with `max: 1` connections. The existing compose files need restructuring but follow sound patterns (healthchecks, named volumes, bind mounts).

**Primary recommendation:** Rebuild from the existing skeleton, replacing nginx with Caddy, consolidating Dockerfiles at root, and tightening TypeScript strictness. Most patterns are well-established and can be implemented with HIGH confidence.

## Standard Stack

### Core (Already in package.json)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fastify | ^5.7.0 | HTTP framework | Already installed, Fastify 5 is current |
| drizzle-orm | ^0.45.1 | Database ORM | Already installed, codebase-first migrations |
| drizzle-kit | ^0.31.8 | Migration CLI | Already installed, generates SQL migration files |
| postgres | ^3.4.8 | PostgreSQL driver | Already installed, fastest JS Postgres client |
| react | ^19.2.0 | UI framework | Already installed, React 19 current |
| react-router-dom | ^7.13.0 | Routing | Already installed (v7, can import from react-router too) |
| @tanstack/react-query | ^5.90.20 | Server state | Already installed |
| vite | ^7.2.4 | Build tool | Already installed |
| tailwindcss | ^4.1.18 | CSS framework | Already installed, Tailwind v4 |
| typescript | ^5.9.3 | Type checking | Already installed |

### To Add

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | latest | Client state management | For UI state not tied to server data (modals, sidebar, theme) |
| shadcn/ui | CLI latest | Component library | Init via `npx shadcn@latest init`, adds components to `src/components/ui/` |
| tw-animate-css | latest | Animation utilities | Required by shadcn/ui v4 (replaces deprecated tailwindcss-animate) |
| pino-pretty | latest (devDep) | Dev log formatting | Backend devDependency for readable dev logs |
| prettier | latest (devDep frontend) | Code formatting | Frontend needs prettier added (backend already has it) |
| eslint-config-prettier | latest (devDep frontend) | Disable conflicting ESLint rules | Frontend needs this to match backend pattern |

### Docker Images

| Image | Tag | Purpose |
|-------|-----|---------|
| node | 22-alpine | Backend + Proxy dev stage base |
| caddy | 2-alpine | Proxy prod stage (Caddy 2.10.x, current stable) |
| postgres | 17-alpine | Database (already in compose files) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| caddy:2-alpine | Build custom with xcaddy | Only needed if rate limiting plugin required (not needed now) |
| Standalone migrate script | drizzle-kit migrate CLI | CLI requires drizzle.config.ts + devDeps in prod image; standalone script is smaller |
| pino-pretty | fastify logger: false | Losing structured logs in dev makes debugging harder |

**Installation (new packages only):**
```bash
# Frontend
cd frontend && npm install zustand
npx shadcn@latest init
# Backend
cd backend && npm install -D pino-pretty
```

## Architecture Patterns

### Recommended Project Structure

```
barae/
├── .env                          # Single env file (root only)
├── .env.example                  # Template
├── Dockerfile.backend            # Multi-stage: dev + prod
├── Dockerfile.proxy              # Multi-stage: dev (Caddy+Vite) + prod (Caddy+static)
├── compose.dev.yml               # Dev stack
├── compose.prod.yml              # Production stack
├── compose.test.yml              # Test stack
├── backend/
│   ├── package.json
│   ├── drizzle.config.ts
│   ├── migrations/               # SQL migration files (0001_create_users.sql, etc.)
│   ├── scripts/
│   │   └── migrate.ts            # Standalone migration runner
│   ├── src/
│   │   ├── index.ts              # Entry point, server startup
│   │   ├── app.ts                # Fastify app builder
│   │   ├── config.ts             # ENV validation, typed exports (NOT a Fastify plugin)
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle instance creation (Fastify plugin)
│   │   │   └── schema/
│   │   │       └── index.ts      # Schema barrel export
│   │   └── features/
│   │       └── [feature]/        # Routes, services, schemas per feature
│   └── tsconfig.json
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   ├── components.json           # shadcn/ui config
│   ├── src/
│   │   ├── main.tsx              # Entry point
│   │   ├── app.tsx               # Root component with router
│   │   ├── index.css             # Tailwind + shadcn theme vars
│   │   ├── components/
│   │   │   └── ui/               # shadcn/ui components (auto-generated)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/
│   │   │   ├── api.ts            # API client (fetch wrapper)
│   │   │   ├── queryClient.ts    # TanStack Query client config
│   │   │   └── utils.ts          # shadcn cn() utility
│   │   ├── pages/                # Route page components
│   │   ├── stores/               # Zustand stores
│   │   └── types/                # TypeScript type definitions
│   └── tsconfig.json
├── shared/                       # Cross-project types, constants, validation
│   ├── auth/                     # Auth-related shared types
│   └── github/                   # GitHub-related shared types
└── caddy/
    ├── Caddyfile.dev             # Dev config (HTTP, proxy to Vite + backend)
    └── Caddyfile.prod            # Prod config (auto-HTTPS, static files + backend)
```

### Pattern 1: Caddy Dev Configuration (HTTP only, proxy everything)

**What:** Caddy in dev mode proxies all requests through a single port (8100). Frontend requests go to Vite dev server, API requests to Fastify backend.
**When to use:** Development environment only.

```caddyfile
# caddy/Caddyfile.dev
{
	auto_https off
}

:8100 {
	# API routes: strip /api/ prefix, proxy to backend
	handle_path /api/* {
		reverse_proxy backend:3000
	}

	# Everything else: proxy to Vite dev server
	reverse_proxy frontend:5173
}
```

**Key insight:** Using HTTP-only (`auto_https off`) with explicit port `:8100` avoids all HTTPS/WSS complications with Vite HMR. Caddy natively handles WebSocket upgrades (required for Vite HMR) without extra configuration when using plain HTTP. The `handle_path` directive strips `/api/` so Fastify routes remain clean (`/v1/auth/login`).

### Pattern 2: Caddy Prod Configuration (auto-HTTPS, static files)

**What:** Caddy serves built static files for the frontend and proxies API requests to backend.
**When to use:** Production deployment.

```caddyfile
# caddy/Caddyfile.prod
{domain} {
	encode gzip

	# Security headers
	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
		X-Content-Type-Options "nosniff"
		X-Frame-Options "DENY"
		Referrer-Policy "strict-origin-when-cross-origin"
		Permissions-Policy "camera=(), microphone=(), geolocation=()"
		-Server
	}

	# API routes: strip /api/ prefix, proxy to backend
	handle_path /api/* {
		reverse_proxy backend:3000
	}

	# Static frontend files with SPA fallback
	handle {
		root * /srv
		try_files {path} /index.html
		file_server
	}
}
```

**Key insight:** Caddy auto-HTTPS handles Let's Encrypt certificates automatically when given a real domain. The `{domain}` placeholder would be the actual domain name. Security headers are added at the Caddy layer (not the application) since Caddy is the edge. HSTS is only for prod (HTTPS).

### Pattern 3: Standalone Config Module (NOT a Fastify plugin)

**What:** Backend config reads `process.env` once, validates, and exports typed values. No Fastify plugin registration needed.
**When to use:** Always -- this is the ONLY place `process.env` is read.

```typescript
// backend/src/config.ts
import process from 'node:process'

// Validation + typing in one place
function requireEnv(name: string): string {
  const value = process.env[name]
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optionalEnv(name: string, defaultValue: string): string {
  const value = process.env[name]
  return (value !== undefined && value !== '') ? value : defaultValue
}

function requireEnvInt(name: string): number {
  const raw = requireEnv(name)
  const parsed = parseInt(raw, 10)
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer, got: ${raw}`)
  }
  return parsed
}

function optionalEnvInt(name: string, defaultValue: number): number {
  const value = process.env[name]
  if (value === undefined || value === '') return defaultValue
  const parsed = parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer, got: ${value}`)
  }
  return parsed
}

function requireEnvMinLength(name: string, minLength: number): string {
  const value = requireEnv(name)
  if (value.length < minLength) {
    throw new Error(`Environment variable ${name} must be at least ${minLength} characters`)
  }
  return value
}

// All exports are non-optional typed values
export const config = {
  server: {
    host: optionalEnv('SERVER_HOST', '0.0.0.0'),
    port: optionalEnvInt('SERVER_PORT', 3000),
  },
  db: {
    host: requireEnv('POSTGRES_HOST'),
    port: requireEnvInt('POSTGRES_PORT'),
    database: requireEnv('POSTGRES_DB'),
    user: requireEnv('POSTGRES_USER'),
    password: requireEnv('POSTGRES_PASSWORD'),
  },
  auth: {
    secret: requireEnvMinLength('APP_SECRET', 32),
  },
  smtp: {
    host: optionalEnv('SMTP_HOST', ''),
    port: optionalEnvInt('SMTP_PORT', 587),
    user: optionalEnv('SMTP_USER', ''),
    password: optionalEnv('SMTP_PASSWORD', ''),
    secure: optionalEnv('SMTP_SECURE', 'false') === 'true',
    from: optionalEnv('EMAIL_FROM', 'Barae <noreply@barae.app>'),
  },
} as const

export type Config = typeof config
```

**Key insight:** This replaces the current `@fastify/env` plugin approach. The config is a plain module import, not a Fastify decorator. Every consumer gets fully typed, non-optional values. Validation happens at module load time (before Fastify even starts). The `as const` assertion makes all values readonly and literal-typed. No `process.env` anywhere else in the codebase.

### Pattern 4: Standalone Migration Script

**What:** A script that runs Drizzle migrations against the database, independent of the application.
**When to use:** CI/CD before deploying services, or manually via `npm run db:migrate`.

```typescript
// backend/scripts/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
  const host = process.env.POSTGRES_HOST
  const port = process.env.POSTGRES_PORT
  const database = process.env.POSTGRES_DB
  const user = process.env.POSTGRES_USER
  const password = process.env.POSTGRES_PASSWORD

  if (!host || !port || !database || !user || !password) {
    console.error('Missing required database environment variables')
    process.exit(1)
  }

  const client = postgres({
    host,
    port: parseInt(port, 10),
    database,
    username: user,
    password,
    max: 1, // Required: single connection for migrations
  })

  const db = drizzle(client)

  console.log('Running migrations...')
  try {
    await migrate(db, { migrationsFolder: './migrations' })
    console.log('Migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigrations()
```

**Key insight:** The `max: 1` option is critical -- postgres-js requires a single connection for running migrations. This script reads env vars directly (not from the app config) since it runs independently. The `migrationsFolder` path is relative to CWD (the backend directory). For CI/CD, run with: `npx tsx scripts/migrate.ts`.

### Pattern 5: Proxy Dockerfile (Multi-stage Caddy + Vite)

**What:** Single Dockerfile at root that builds either a dev container (Caddy proxying to Vite) or prod container (Caddy serving static files).

```dockerfile
# Dockerfile.proxy

# ============================================
# Dev stage: Caddy as reverse proxy only
# ============================================
FROM caddy:2-alpine AS dev

COPY caddy/Caddyfile.dev /etc/caddy/Caddyfile

EXPOSE 8100

# ============================================
# Build stage: Build frontend assets
# ============================================
FROM node:22-alpine AS build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# ============================================
# Prod stage: Caddy serving static files
# ============================================
FROM caddy:2-alpine AS prod

COPY caddy/Caddyfile.prod /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 80 443

```

**Key insight:** In dev, the Caddy container is a thin reverse proxy -- Vite runs in a separate container (frontend service). In prod, the built static files are baked into the Caddy image. This follows the decision for a "Proxy Dockerfile" that is multi-stage for dev/prod.

### Pattern 6: Backend Dockerfile at Root

**What:** Single Dockerfile at root for the backend service.

```dockerfile
# Dockerfile.backend

# ============================================
# Base stage
# ============================================
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ============================================
# Dependencies
# ============================================
FROM base AS deps
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

# ============================================
# Development
# ============================================
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/package.json ./
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ============================================
# Build
# ============================================
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
RUN npm run build
RUN npm prune --production

# ============================================
# Production
# ============================================
FROM node:22-alpine AS prod
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 barae
COPY --from=build --chown=barae:nodejs /app/dist ./dist
COPY --from=build --chown=barae:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=barae:nodejs /app/package.json ./
COPY --from=build --chown=barae:nodejs /app/migrations ./migrations
USER barae
EXPOSE 3000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

**Key insight:** Dockerfiles move from inside `backend/` and `frontend/` to the project root. The build context for `Dockerfile.backend` is the project root, so COPY paths use `backend/` prefix. Migrations are copied to prod image so the standalone migration script can find them.

### Pattern 7: TypeScript Very Strict Configuration

**What:** TypeScript configuration that goes beyond `strict: true`.

```jsonc
// Backend tsconfig.base.json additions needed:
{
  "extends": "fastify-tsconfig",
  "compilerOptions": {
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true
  }
}
```

```jsonc
// Frontend tsconfig.app.json additions needed:
{
  "compilerOptions": {
    // Existing strict settings already in place...
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Key insight:** `fastify-tsconfig` already enables `strict: true`, `noUnusedLocals`, `noFallthroughCasesInSwitch`, and targets ES2023 with NodeNext module resolution. We only need to add `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` on top. The frontend already has `strict: true` from Vite's template but needs the two additional flags.

### Anti-Patterns to Avoid

- **Config as Fastify plugin:** The current approach registers config as a Fastify plugin via `@fastify/env`. This creates a dependency on Fastify being instantiated before config is accessible. The config module should be importable by anything (migration scripts, utilities, tests) without Fastify.
- **Dockerfiles inside subdirectories:** Current backend/Dockerfile and frontend/Dockerfile get their build context from subdirectories. Root-level Dockerfiles allow copying from any project directory (e.g., shared/).
- **nginx for reverse proxy:** The current frontend uses nginx. Caddy is simpler (automatic HTTPS, cleaner config syntax, better defaults) and aligns with the project decision.
- **`process.env` in drizzle.config.ts:** The current drizzle config reads env vars directly. This is acceptable since drizzle-kit is a CLI tool, not application code, but should be noted as an exception in standards.
- **Frontend .env files:** The current `frontend/.env.example` exists and should be removed. Frontend never uses env variables per project standards.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTPS certificates | Manual cert management | Caddy auto-HTTPS | Caddy auto-provisions and renews via Let's Encrypt |
| Static file serving + SPA fallback | Custom middleware | Caddy `try_files` + `file_server` | Battle-tested, handles edge cases (caching, compression) |
| Security headers | Per-route header setting | Caddy `header` directive | Applied globally at the edge, cannot be bypassed |
| Environment validation | Custom validation logic | Helper functions in config.ts | Keep it simple -- requireEnv/optionalEnv pattern is sufficient |
| Database migrations | Custom migration runner | `drizzle-orm/postgres-js/migrator` | Handles migration tracking, ordering, and idempotency |
| WebSocket proxying for HMR | Custom WebSocket relay | Caddy reverse_proxy | Caddy handles WebSocket upgrade transparently |
| Component library | Custom design system | shadcn/ui | Pre-built accessible components, fully customizable source code |
| CSS utilities | Custom CSS framework | Tailwind CSS v4 | Standard utility-first approach, works with shadcn/ui |

**Key insight:** Caddy eliminates entire categories of infrastructure code (HTTPS, headers, compression, WebSocket proxying). Let it handle what it does well at the edge layer.

## Common Pitfalls

### Pitfall 1: Vite HMR WebSocket Failures Behind Reverse Proxy
**What goes wrong:** Hot module replacement stops working -- page does full reloads or shows connection errors in console.
**Why it happens:** WebSocket connections for HMR fail when the reverse proxy doesn't properly handle the upgrade handshake, or when protocol mismatches occur (ws vs wss).
**How to avoid:** Use HTTP-only Caddy in dev (no HTTPS/WSS complexity). Caddy natively proxies WebSocket when using `reverse_proxy`. Ensure Vite's `server.host` is `"0.0.0.0"` so it's accessible from within Docker network.
**Warning signs:** Browser console shows "WebSocket connection failed" or page reloads on every save.

### Pitfall 2: node_modules Cross-Contamination (macOS host vs Linux container)
**What goes wrong:** Native modules compiled for macOS (host `npm install`) conflict with Linux (container runtime), causing crashes or subtle bugs.
**Why it happens:** Bind mounting source code also shares node_modules unless explicitly excluded. The existing compose files already handle this with anonymous volumes (`/app/node_modules`).
**How to avoid:** Keep the anonymous volume pattern: bind mount source, exclude node_modules via volume. Run `npm install` locally for IDE support but never let the container use host node_modules.
**Warning signs:** "Error: Cannot find module" or segfaults from native modules.

### Pitfall 3: Caddy Port Binding with auto_https
**What goes wrong:** Caddy doesn't listen on the expected port, or redirects HTTP to HTTPS in dev.
**Why it happens:** Caddy's default behavior is to serve HTTPS and redirect HTTP. Even with `auto_https off`, you must explicitly specify the HTTP port in the site address (e.g., `:8100`).
**How to avoid:** Always use `auto_https off` in the global options block AND specify the port explicitly in the site address (`:8100 { ... }`).
**Warning signs:** "Connection refused" on expected port, unexpected 301 redirects.

### Pitfall 4: Docker Build Context for Root-Level Dockerfiles
**What goes wrong:** COPY commands fail because paths are relative to the build context, which changes when Dockerfiles move to root.
**Why it happens:** When Dockerfile was in `backend/`, `COPY package.json .` worked. At root, it needs `COPY backend/package.json .`.
**How to avoid:** Always use the subdirectory prefix in COPY commands when Dockerfiles are at root. Set build context to `.` (project root) in compose files.
**Warning signs:** "COPY failed: file not found" during docker build.

### Pitfall 5: Drizzle Migration max Connections
**What goes wrong:** Migration script hangs or fails with connection pool errors.
**Why it happens:** The postgres-js client defaults to 10 connections, but the drizzle migrator requires a single connection to ensure sequential execution.
**How to avoid:** Always set `max: 1` when creating the postgres client for migration scripts.
**Warning signs:** Migration hangs indefinitely, or "too many connections" errors.

### Pitfall 6: exactOptionalPropertyTypes Breaks Common Patterns
**What goes wrong:** TypeScript errors on patterns like `{ prop?: string }` when assigning `undefined` explicitly.
**Why it happens:** With `exactOptionalPropertyTypes`, `{ prop?: string }` means the property can be absent (not set) but NOT explicitly set to `undefined`. To allow both, use `{ prop?: string | undefined }`.
**How to avoid:** When defining optional properties that may receive `undefined` values, explicitly include `| undefined` in the type. This is the correct strict typing behavior.
**Warning signs:** TS2375 errors on seemingly valid optional property assignments.

### Pitfall 7: Frontend Dockerfile Must Copy from frontend/ Subdirectory
**What goes wrong:** The Proxy Dockerfile's build stage cannot find frontend source files.
**Why it happens:** When Dockerfile.proxy is at root, build context is the project root. The COPY commands need `frontend/` prefix.
**How to avoid:** Set build context to project root in compose, use `COPY frontend/package.json` etc. in the Dockerfile.
**Warning signs:** Build fails with "COPY failed: file not found".

## Code Examples

### Dev Docker Compose (target architecture)

```yaml
# compose.dev.yml
services:
  db:
    container_name: barae-dev-db
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - dev-pg-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -d ${POSTGRES_DB} -U ${POSTGRES_USER}"]
      interval: 5s
      timeout: 3s
      retries: 30

  mailpit:
    container_name: barae-dev-mailpit
    image: axllent/mailpit:latest
    restart: unless-stopped
    ports:
      - "8025:8025"
      - "1025:1025"
    environment:
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1

  backend:
    container_name: barae-dev-backend
    build:
      context: .
      dockerfile: Dockerfile.backend
      target: dev
    depends_on:
      db:
        condition: service_healthy
      mailpit:
        condition: service_started
    env_file: .env
    environment:
      POSTGRES_HOST: db
      POSTGRES_PORT: 5432
    volumes:
      - ./backend:/app
      - /app/node_modules
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 30
      start_period: 10s

  frontend:
    container_name: barae-dev-frontend
    build:
      context: .
      dockerfile: Dockerfile.proxy
      target: dev-frontend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    # No ports exposed -- only accessed through proxy

  proxy:
    container_name: barae-dev-proxy
    build:
      context: .
      dockerfile: Dockerfile.proxy
      target: dev
    depends_on:
      backend:
        condition: service_healthy
      frontend:
        condition: service_started
    ports:
      - "8100:8100"
    volumes:
      - ./caddy/Caddyfile.dev:/etc/caddy/Caddyfile

volumes:
  dev-pg-data:
```

**Note on dev Proxy Dockerfile approach:** There are two viable strategies for the dev proxy:

1. **Caddy-only container** (simpler): The Caddy dev container only needs the Caddyfile. Vite runs in a separate `frontend` container. Caddy proxies to both `frontend:5173` and `backend:3000`. This is the recommended approach.

2. **Combined Caddy+Vite container** (per original decision): A single container runs both Caddy and the Vite dev server. More complex (requires a process manager or entrypoint script), but fewer containers.

The Caddy-only approach (option 1) is recommended because it follows Docker's one-process-per-container principle and is simpler to implement. The Proxy Dockerfile's dev stage just needs the Caddy image with the dev Caddyfile.

### Vite Configuration for Caddy Proxy

```typescript
// frontend/vite.config.ts
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',    // Listen on all interfaces (required for Docker)
    port: 5173,
    strictPort: true,     // Fail if port is taken
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Key insight:** No proxy configuration needed in Vite anymore -- Caddy handles all routing. The `server.host: '0.0.0.0'` makes Vite accessible from the Docker network. No HMR config needed since we use HTTP-only (Caddy handles WebSocket upgrade transparently).

### Pino Logger Configuration

```typescript
// In app.ts, configure Fastify logger:
const app = fastify({
  logger: {
    level: config.server.nodeEnv === 'production' ? 'info' : 'debug',
    ...(config.server.nodeEnv !== 'production' && {
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    }),
  },
})
```

**Key insight:** Fastify uses Pino natively. In dev, pino-pretty makes logs readable. In production, raw JSON logs are output (suitable for log aggregation). Never use pino-pretty in production -- it adds overhead and breaks structured logging.

### shadcn/ui Initialization

After installing dependencies:
```bash
npx shadcn@latest init
```

This creates:
- `components.json` -- shadcn configuration
- `src/lib/utils.ts` -- the `cn()` utility function
- `src/index.css` -- updated with theme CSS variables

The CSS variables follow Tailwind v4's `@theme inline` pattern:
```css
@import "tailwindcss";

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... theme variables */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark theme variables */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... theme mappings */
}
```

### Import Path Alias Configuration

```jsonc
// tsconfig.json (both backend and frontend root)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

For the backend, also configure in tsconfig.base.json. For the frontend, add to both tsconfig.json and tsconfig.app.json (Vite reads from tsconfig.app.json). The Vite `resolve.alias` setting makes it work at build time.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| nginx reverse proxy | Caddy reverse proxy | Decided in project discussion | Simpler config, auto-HTTPS, built-in WebSocket support |
| @fastify/env plugin | Standalone config module | Phase 1 decision | Config accessible without Fastify instance, simpler testing |
| tailwindcss-animate | tw-animate-css | Tailwind v4 / shadcn v4 | Must use tw-animate-css with shadcn/ui on Tailwind v4 |
| HSL color values | OKLCH color values | Tailwind v4 / shadcn v4 | shadcn themes now use OKLCH color space |
| forwardRef pattern | Regular function components | React 19 | shadcn v4 components no longer use forwardRef |
| Dockerfiles in subdirs | Dockerfiles at project root | Phase 1 decision | Better build context access, can copy from shared/ |
| react-router-dom package | react-router package | React Router v7 | Can import from react-router directly (react-router-dom still works as re-export) |

**Deprecated/outdated:**
- `tailwindcss-animate`: Replaced by `tw-animate-css` in shadcn/ui v4
- `@layer base` for CSS variables: Tailwind v4 uses `:root` outside `@layer`
- `forwardRef` in React components: React 19 passes ref as a regular prop
- `default` style in shadcn: Deprecated, use `new-york` style

## Discretion Recommendations

Items marked as "Claude's Discretion" in the CONTEXT.md, with researched recommendations:

### Security Headers (Caddy layer)

**Recommendation:** All security headers at Caddy layer, rate limiting at Fastify layer.

Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) belong at the Caddy level because:
- They apply uniformly to all responses
- They cannot be bypassed (even if app code forgets)
- Caddy is the edge -- it's the right place for transport-level security

Rate limiting belongs at the Fastify layer (`@fastify/rate-limit`, already installed) because:
- API rate limits need route-specific configuration
- Auth endpoints need different limits than read endpoints
- Caddy's rate limiting requires a custom build with xcaddy (unnecessary complexity)

**Confidence:** HIGH -- this is standard practice for reverse proxy architectures.

### Node.js Version

**Recommendation:** Node.js 22 (already in existing Dockerfiles as `node:22-alpine`).

Node 22 is the current LTS line and matches the `"engines": { "node": ">=22.0.0" }` in backend/package.json. No change needed.

**Confidence:** HIGH -- verified against Docker Hub tags and existing configuration.

### Log Management

**Recommendation:** Structured JSON logging via Pino (Fastify built-in) + pino-pretty for dev.

- Development: pino-pretty transport for human-readable colored output
- Production: Raw JSON to stdout (Docker captures stdout, works with any log aggregator)
- No log files -- Docker manages log output via its logging driver
- Use Fastify's built-in request ID for request tracing

**Confidence:** HIGH -- Pino is Fastify's native logger, this is the canonical approach.

### Frontend Directory Structure

**Recommendation:** Flat-with-purpose structure (not feature-based for frontend, unlike backend).

```
src/
├── components/
│   └── ui/          # shadcn/ui auto-generated
├── hooks/           # Custom React hooks
├── lib/             # Utilities, API client, query client
├── pages/           # Route page components (flat, one per route)
├── stores/          # Zustand stores
└── types/           # TypeScript definitions
```

Rationale: The frontend is relatively small (auth flows + GitHub management). Feature-based structure adds unnecessary nesting for a handful of pages. Pages map directly to routes. Shared components live in `components/`. This can evolve to feature-based if the frontend grows.

**Confidence:** MEDIUM -- this is a judgment call. Feature-based would also work but adds overhead for a small frontend.

### Import Path Aliases

**Recommendation:** Single `@/` alias mapping to `src/`.

Both backend and frontend use `@/*` -> `./src/*` in tsconfig paths. Vite resolves it via `resolve.alias`. Backend resolves it via TypeScript path mapping (tsx handles it in dev, tsc build resolves it).

**Confidence:** HIGH -- standard pattern, shadcn/ui documentation explicitly recommends it.

### Git Conventions

**Recommendation:**
- **Branch naming:** `feature/<name>`, `fix/<name>`, `chore/<name>`
- **Commit format:** Conventional Commits -- `type(scope): description`
  - Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`
  - Scopes: `backend`, `frontend`, `infra`, `shared`, `config`
  - Example: `feat(backend): add user registration endpoint`
- No enforced tooling (commitlint, husky) in Phase 1 -- keep it lightweight

**Confidence:** MEDIUM -- conventional commits are standard, but enforcement tooling is deferred.

## Open Questions

1. **Proxy Dockerfile dev stage architecture**
   - What we know: The decision calls for a "Proxy Dockerfile" with multi-stage dev/prod. In dev, Caddy needs to proxy to both Vite and the backend.
   - What's unclear: Should the dev stage run just Caddy (separate frontend container for Vite) or should it run both Caddy + Vite in one container?
   - Recommendation: Use a separate frontend container for Vite in dev (Docker one-process-per-container), with the Proxy Dockerfile dev stage being just Caddy. The compose file has `frontend` (Vite) + `proxy` (Caddy) as separate services. **The planner should present both options for user decision.**

2. **shared/ directory package setup**
   - What we know: Types, constants, and validation schemas shared between backend and frontend live in `shared/`.
   - What's unclear: How is `shared/` consumed? Does it need its own package.json? Is it imported via path alias, symlink, or TypeScript project references?
   - Recommendation: Use TypeScript path aliases (`@shared/*` -> `../../shared/*`) in both backend and frontend tsconfig. No separate package.json needed. For Vite, add a resolve alias. For backend, tsx handles path resolution in dev. **Needs validation during implementation.**

3. **Migration script execution in CI/CD**
   - What we know: Migrations run as a separate script, not embedded in app startup.
   - What's unclear: The exact CI/CD invocation mechanism (Docker exec? Separate container? Init container?).
   - Recommendation: For now, support running via `docker compose exec backend npx tsx scripts/migrate.ts` in dev, and as a separate Docker command in CI. Full CI/CD pipeline details deferred to Phase 6.

## Sources

### Primary (HIGH confidence)
- Caddy official docs: reverse_proxy, handle_path, try_files, header, global options -- verified via WebFetch
- Caddy common patterns: SPA + API pattern -- verified via WebFetch at caddyserver.com/docs/caddyfile/patterns
- Drizzle ORM migration docs -- verified via WebFetch at orm.drizzle.team/docs/migrations
- Drizzle-kit migrate docs -- verified via WebFetch at orm.drizzle.team/docs/drizzle-kit-migrate
- Vite server options -- verified via WebFetch at vite.dev/config/server-options
- shadcn/ui installation guide -- verified via WebFetch at ui.shadcn.com/docs/installation/vite
- shadcn/ui Tailwind v4 guide -- verified via WebFetch at ui.shadcn.com/docs/tailwind-v4
- fastify-tsconfig -- verified via WebFetch at github.com/fastify/tsconfig
- React Router v7 SPA docs -- verified via WebFetch at reactrouter.com/how-to/spa
- Existing codebase files -- verified via direct file reads

### Secondary (MEDIUM confidence)
- Drizzle standalone migration script pattern -- WebSearch verified with budivoogt.com blog + official docs
- Caddy security headers pattern -- WebSearch verified with paulbradley.dev + official Caddy header docs
- Zustand + TanStack Query integration pattern -- WebSearch multiple sources agree (dev.to, medium, official discussions)
- React frontend directory structure -- WebSearch multiple sources agree (robinwieruch.de, dev.to, geeksforgeeks)

### Tertiary (LOW confidence)
- Caddy rate limiting plugin (mholt/caddy-ratelimit) -- WebSearch only, requires custom build, NOT recommended for this project
- Node.js 24 as current LTS -- WebSearch result from Docker Hub, may be inaccurate (Node 22 is what we use regardless)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified, versions confirmed against existing package.json
- Architecture: HIGH -- Caddy patterns verified against official docs, Docker patterns based on existing working compose files
- Pitfalls: HIGH -- HMR/WebSocket issues well-documented in Vite issues tracker, node_modules contamination is known Docker pattern
- Discretion items: MEDIUM -- recommendations based on established patterns but involve judgment calls

**Research date:** 2026-02-05
**Valid until:** 2026-03-07 (30 days -- infrastructure tooling is stable)
