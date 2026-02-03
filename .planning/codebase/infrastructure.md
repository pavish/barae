# Infrastructure Guide

How to run, test, and debug the Barae application.

**Related docs:**
- [Backend Patterns](./backend-patterns.md) - Code conventions and plugin patterns
- [Verification Workflow](./verification-workflow.md) - Testing checklist for all phases

## Quick Start

### Development (with hot reload)

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit .env with your values (at minimum, set APP_SECRET)
# Generate secret: openssl rand -hex 32

# 3. Start all services
docker compose -f compose.dev.yml up --build

# 4. Run database migrations (first time only, in another terminal)
docker compose -f compose.dev.yml exec backend npm run db:migrate

# Services:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3000
# - Database: localhost:5432
```

### Testing (ephemeral, for CI)

```bash
# Start test environment with migrations auto-run
docker compose -f compose.test.yml up --build

# Or run detached and wait for health
docker compose -f compose.test.yml up -d --build
docker compose -f compose.test.yml exec backend wget -qO- http://localhost:3000/health

# Cleanup
docker compose -f compose.test.yml down -v
```

### Production

```bash
# 1. Configure .env with production values
# 2. Build and start
docker compose -f compose.prod.yml up -d --build

# Frontend (with nginx): http://localhost:80
# Backend API proxied through nginx at /api/*
```

## Docker Compose Files

| File | Purpose | Database | Hot Reload |
|------|---------|----------|------------|
| `compose.dev.yml` | Local development | Persistent volume | Yes |
| `compose.test.yml` | CI/Testing | tmpfs (ephemeral) | No |
| `compose.prod.yml` | Production | Persistent volume | No |

## Services

### Database (PostgreSQL 17)

- **Dev/Prod**: Data persisted in Docker volume
- **Test**: tmpfs for fast ephemeral tests
- Health check: `pg_isready`

### Backend (Node.js 22)

- **Dev target**: Uses tsx for hot reload, source mounted
- **Prod target**: Compiled JS, non-root user, healthcheck built-in
- Health check endpoint: `GET /health`
- Migrations: Set `MIGRATE_ON_START=true` to run on container start

### Frontend

- **Dev target**: Vite dev server with HMR on port 5173
- **Prod target**: nginx serving static files, proxies /api to backend

## Health Checks

All services have health checks configured:

```bash
# Check backend health
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"2024-..."}

# Check via Docker
docker compose -f compose.dev.yml ps
```

## Database Operations

```bash
# Run migrations
docker compose -f compose.dev.yml exec backend npm run db:migrate

# Generate new migration after schema changes
docker compose -f compose.dev.yml exec backend npm run db:generate

# Push schema changes (dev only, skips migration files)
docker compose -f compose.dev.yml exec backend npm run db:push

# Open Drizzle Studio (database GUI)
docker compose -f compose.dev.yml exec backend npm run db:studio
```

## Debugging

### View logs

```bash
# All services
docker compose -f compose.dev.yml logs -f

# Specific service
docker compose -f compose.dev.yml logs -f backend

# Last 100 lines
docker compose -f compose.dev.yml logs --tail=100 backend
```

### Shell access

```bash
# Backend container
docker compose -f compose.dev.yml exec backend sh

# Database container
docker compose -f compose.dev.yml exec db psql -U barae -d barae
```

### Common issues

**Backend won't start**
- Check database is healthy: `docker compose -f compose.dev.yml ps`
- Verify .env has required values (APP_SECRET, POSTGRES_*)
- Check logs: `docker compose -f compose.dev.yml logs backend`

**Database connection refused**
- Wait for db healthcheck to pass
- Verify POSTGRES_HOST=db (not localhost) in container

**Migrations fail**
- Ensure database is running and healthy
- Check migration files in backend/migrations/

## API Testing

### Health check
```bash
curl http://localhost:3000/health
```

### Auth endpoints (v1)
```bash
# Signup
curl -X POST http://localhost:3000/api/v1/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Sign in
curl -X POST http://localhost:3000/api/v1/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get session
curl http://localhost:3000/api/v1/auth/get-session \
  -H "Cookie: <session-cookie>"
```

## Environment Variables

See `.env.example` for all available configuration options.

### Required
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` - Database credentials
- `APP_SECRET` - Session encryption key (generate with `openssl rand -hex 32`)

### Optional
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - GitHub OAuth
- `RESEND_API_KEY` - Email sending (otherwise logged to console)
- `FRONTEND_URL` - CORS origin (default: http://localhost:5173)
