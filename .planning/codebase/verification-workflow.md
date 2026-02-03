# Verification Workflow

All phases must include immediate feedback verification. This ensures changes work before proceeding.

## Quick Reference

```bash
# Start test environment (ephemeral, auto-migrates)
docker compose -f compose.test.yml up --build -d

# Verify services are healthy
docker compose -f compose.test.yml ps

# Test backend health
curl http://localhost:3000/health

# Test auth flow
curl -X POST http://localhost:3000/api/v1/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'

# Check logs
docker compose -f compose.test.yml logs backend

# Cleanup
docker compose -f compose.test.yml down -v
```

## Phase Verification Checklist

Every phase plan MUST include verification steps. Add this section to plan files:

```markdown
## Verification

### Build Check
- [ ] Backend compiles: `cd backend && npm run build`
- [ ] Frontend compiles: `cd frontend && npm run build`
- [ ] No TypeScript errors

### Runtime Check
- [ ] Start test environment: `docker compose -f compose.test.yml up --build -d`
- [ ] Backend health passes: `curl http://localhost:3000/health`
- [ ] Migrations apply successfully (check logs)

### Feature Check
- [ ] <specific feature tests based on phase goals>
- [ ] <API endpoint tests>
- [ ] <UI interaction tests if applicable>

### Cleanup
- [ ] `docker compose -f compose.test.yml down -v`
```

## Available Test Commands

### Backend
```bash
# TypeScript compile check
cd backend && npm run build

# Run tests (when test files exist)
cd backend && npm run test

# Lint check
cd backend && npm run check:lint

# Format check
cd backend && npm run check:format

# Database operations (requires running db)
npm run db:generate  # Generate migration from schema changes
npm run db:migrate   # Apply migrations (dev mode with drizzle-kit)
npm run db:push      # Push schema changes without migration files
```

### Frontend
```bash
# TypeScript + Vite build
cd frontend && npm run build

# Lint check
cd frontend && npm run lint

# Dev server preview
cd frontend && npm run preview
```

### Docker
```bash
# Development (with hot reload)
docker compose -f compose.dev.yml up --build

# Testing (ephemeral db, auto-migrate)
docker compose -f compose.test.yml up --build

# Production-like
docker compose -f compose.prod.yml up --build
```

## API Testing Patterns

### Auth Endpoints (v1)

```bash
# Health check
curl http://localhost:3000/health

# Sign up
curl -X POST http://localhost:3000/api/v1/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Sign in (returns session cookie)
curl -X POST http://localhost:3000/api/v1/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"password123"}'

# Get session (with cookie)
curl http://localhost:3000/api/v1/auth/get-session \
  -b cookies.txt

# Sign out
curl -X POST http://localhost:3000/api/v1/auth/sign-out \
  -b cookies.txt
```

## Debugging Failed Verification

### Container won't start
```bash
# Check status
docker compose -f compose.test.yml ps

# Check logs
docker compose -f compose.test.yml logs backend
docker compose -f compose.test.yml logs db

# Shell into container
docker compose -f compose.test.yml exec backend sh
```

### Database issues
```bash
# Check db is healthy
docker compose -f compose.test.yml exec db pg_isready

# Connect to psql
docker compose -f compose.test.yml exec db psql -U barae -d barae_test

# Check tables
\dt
SELECT * FROM "user";
```

### Migration issues
```bash
# Check migration files
ls backend/migrations/

# Check if migrations applied
docker compose -f compose.test.yml exec db psql -U barae -d barae_test -c "SELECT * FROM __migrations__"
```

## Integration with GSD Workflow

The GSD executor should run verification after each plan completes:

1. **Build verification** - Compile check before marking complete
2. **Runtime verification** - Start services and test health
3. **Feature verification** - Test the specific features implemented
4. **Summary update** - Record verification status in plan summary

This ensures problems are caught immediately, not discovered later.
