# Backend Patterns

Established conventions for the Barae backend (Fastify + TypeScript).

**Related docs:**
- [Infrastructure Guide](./infrastructure.md) - Docker setup and commands
- [Verification Workflow](./verification-workflow.md) - Testing checklist for all phases

## Directory Structure

```
backend/src/
├── index.ts                    # Entry point (startup/shutdown only)
├── app.ts                      # Fastify app factory (buildApp function)
├── config.ts                   # Config Fastify plugin
├── db/
│   ├── index.ts                # DB Fastify plugin (single connection)
│   └── schema/
│       ├── index.ts            # Re-exports all schemas
│       └── auth.ts             # Auth-related tables
├── features/
│   └── <feature>/
│       ├── index.ts            # Feature Fastify plugin
│       ├── routes.ts           # Route registration
│       ├── service.ts          # Business logic / external service factory
│       ├── handler.ts          # Request/response adapters
│       └── contracts.ts        # TypeBox request/response schemas
├── lib/
│   └── <service>/
│       ├── index.ts            # Service Fastify plugin
│       └── *.ts                # Supporting files (templates, utils)
└── shared/
    └── contracts/              # Shared TypeBox schemas (when needed)
```

## Plugin Pattern

### Scoped Type Declarations
Each plugin declares its own Fastify augmentation in the same file:

```typescript
// db/index.ts
import fp from 'fastify-plugin'

async function dbPlugin(fastify) {
  // ... setup
  fastify.decorate('db', dbHandler)
}

export default fp(dbPlugin, { name: 'db', dependencies: ['config'] })

// Type declaration at bottom of same file
declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof createDbHandler>
  }
}
```

### Dependency Declaration
Always declare plugin dependencies explicitly:

```typescript
export default fp(authFeature, {
  name: 'auth',
  dependencies: ['config', 'db', 'email'],
})
```

## Feature Module Pattern

Features live in `features/<name>/` with these files:

| File | Purpose |
|------|---------|
| `index.ts` | Fastify plugin that wires everything together |
| `routes.ts` | Route registration with versioned paths |
| `service.ts` | Business logic / factory for external services |
| `handler.ts` | Adapts between Fastify request/reply and service |
| `contracts.ts` | TypeBox schemas for request/response validation |

### Service Factory Pattern
Services receive the Fastify instance to access config and other plugins:

```typescript
// features/auth/service.ts
export function createAuthService(fastify: FastifyInstance) {
  return betterAuth({
    secret: fastify.config.APP_SECRET,
    database: drizzleAdapter(fastify.db.do, { ... }),
    // ...
  })
}
```

## Config Access Rules

**All configuration access MUST go through `fastify.config.*`**

- `config.ts` is the only file that reads `process.env`
- All other files access config via the Fastify instance
- This ensures validation and type safety

```typescript
// WRONG - direct process.env access
const smtpHost = process.env.SMTP_HOST

// CORRECT - via Fastify config
const smtpHost = fastify.config.SMTP_HOST
```

## Route Versioning

All API routes use versioned paths:

```typescript
// Pattern: /api/v1/<feature>/<action>
fastify.all('/api/v1/auth/*', handler)
```

This allows API evolution without breaking existing clients.

## Database Schema Organization

- All Drizzle schemas live in `db/schema/`
- One file per domain (e.g., `auth.ts` for auth tables)
- `db/schema/index.ts` re-exports all schemas
- `drizzle.config.ts` points to the index file

## Contract Naming

TypeBox schemas in `contracts.ts`:

```typescript
// Request schemas: <Action>Request
export const SignupRequest = Type.Object({ ... })
export type SignupRequestType = Static<typeof SignupRequest>

// Response schemas: <Entity>Response
export const UserResponse = Type.Object({ ... })
export type UserResponseType = Static<typeof UserResponse>
```

## Issues Resolved

### 1. Duplicate DB Connections
**Problem:** Auth module created its own postgres client, bypassing the centralized connection.

**Solution:** Factory pattern - `createAuthService(fastify)` receives `fastify.db.do` instead of creating its own connection.

### 2. Direct process.env Access
**Problem:** Multiple files accessed `process.env` directly, bypassing config validation.

**Solution:** All config access via `fastify.config.*` after plugin registration.

### 3. Schema Wrong Location
**Problem:** Auth schema lived in `auth/schema.ts`, re-exported awkwardly from `db/schema/`.

**Solution:** Moved schema to `db/schema/auth.ts` where it belongs.

### 4. No Route Versioning
**Problem:** Routes were `/api/auth/*` with no version prefix.

**Solution:** All routes now use `/api/v1/auth/*` pattern.
