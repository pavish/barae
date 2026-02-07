# Docker Standards

These rules apply to all Docker and infrastructure configuration. They are enforced on every change to Dockerfiles, compose files, and Caddy configs.

## Everything Containerized

All services run in Docker containers in every environment: backend, frontend (dev only), proxy (Caddy), PostgreSQL, and Mailpit (dev only). No service runs directly on the host.

## Dockerfiles

- **Located at project root:** `Dockerfile.backend`, `Dockerfile.proxy`.
- **Root build context.** All compose files use `context: .` (project root). Dockerfiles reference subdirectories in COPY paths: `COPY backend/package.json ./`, `COPY frontend/ .`.
- **Multi-stage builds.** Each Dockerfile has stages for dev and prod. The proxy Dockerfile also has a `dev-frontend` stage for the Vite dev server.
- **Non-root user in production.** The prod stage creates and switches to a non-root user (`barae`).

```dockerfile
# Dockerfile.backend -- prod stage
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 barae
USER barae
```

## Compose Files

Three compose files, one per environment:

| File | Purpose | Port |
|------|---------|------|
| `compose.dev.yml` | Development with hot reload | 8100 |
| `compose.prod.yml` | Production with HTTPS | 80/443 |
| `compose.test.yml` | Test environment | 8100 |

### Container Naming

- **Prefix:** `barae-`
- **Dev:** `barae-dev-*` (e.g., `barae-dev-db`, `barae-dev-backend`, `barae-dev-proxy`)
- **Prod:** `barae-*` (e.g., `barae-db`, `barae-backend`, `barae-proxy`)
- **Test:** `barae-test-*` (e.g., `barae-test-db`, `barae-test-backend`)

### Service Configuration

- **`depends_on` with `condition`** for startup ordering. Use `service_healthy` for services with healthchecks, `service_started` otherwise.
- **Named volumes** for database persistence (`dev-pg-data`) and node_modules cache.
- **`env_file: .env`** for the backend service. Compose-level environment overrides specific values (e.g., `POSTGRES_HOST: db`).
- **Backend is only accessible through Caddy** in all environments. No direct port exposure for the backend container.

### Dev Compose Services

| Service | Container | Image/Build | Notes |
|---------|-----------|-------------|-------|
| db | barae-dev-db | postgres:17-alpine | Healthcheck with pg_isready |
| mailpit | barae-dev-mailpit | axllent/mailpit:latest | SMTP on 1025, UI on 8025 |
| backend | barae-dev-backend | Dockerfile.backend target:dev | Volume mounts for hot reload |
| frontend | barae-dev-frontend | Dockerfile.proxy target:dev-frontend | Vite dev server |
| proxy | barae-dev-proxy | Dockerfile.proxy target:dev | Caddy reverse proxy |

## Caddy Reverse Proxy

- **`handle_path /api/*`** strips the `/api/` prefix before forwarding to the backend. Fastify sees clean routes like `/v1/auth/sign-up/email`, `/health`.
- **Dev:** HTTP only on port 8100. Proxies `/api/*` to backend:3000 and everything else to frontend:5173.
- **Prod:** Auto-HTTPS via Let's Encrypt. `DOMAIN` env var controls the site address (defaults to `localhost`). Serves static frontend files from `/srv` and proxies `/api/*` to the backend.

## Environment Variables

- **Single `.env` at project root.** Used by Docker Compose for all services.
- **Single `.env.example`** at project root documenting all required variables.
- **Never create `.env` files in subdirectories** (not in `backend/`, `frontend/`, etc.).
- **Compose environment overrides** set container-specific values (e.g., `POSTGRES_HOST: db` to use Docker's internal DNS).

## Healthchecks

- **PostgreSQL:** `pg_isready -d $POSTGRES_DB -U $POSTGRES_USER`
- **Backend:** `wget --no-verbose --tries=1 --spider http://localhost:3000/health`
- **Production backend Dockerfile** includes a `HEALTHCHECK` instruction.

## Docker Ignore

- **`.dockerignore`** at project root excludes `node_modules`, `.git`, `.env`, and other non-essential files from the build context.
