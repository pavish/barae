# Backend Standards

These rules apply to all backend code in `backend/src/`. They are enforced on every code change.

## Fastify Plugin Architecture

- **Use `fastify-plugin` (`fp`) for shared state.** Any plugin that decorates the Fastify instance (db, config, auth) must be wrapped with `fp` to break encapsulation and make decorators available to sibling plugins.
- **Avoid module-level singletons.** Database clients, auth instances, and email transports must be created inside their Fastify plugin's `async` function, not at module scope. Module-level singletons run before Fastify is ready and cannot access `fastify.config`.
- **Declare plugin dependencies.** Use the `dependencies` array in `fp` options (e.g., `{ name: 'auth', dependencies: ['config', 'db'] }`).
- **Register plugins in order in `app.ts`.** Config first, then db, then feature plugins, then routes.

```typescript
// Good: factory function + initialization inside plugin
// db/client.ts -- factory function, no module-level state
export function createDbClient(config: DbConnectionConfig) {
  const client = postgres({ host: config.host, ... })
  const db = drizzle(client, { schema })
  return { client, db }
}

// db/index.ts -- plugin calls factory with fastify.config
export default fp(async (fastify) => {
  const { client, db } = createDbClient({
    host: fastify.config.POSTGRES_HOST, ...
  })
  fastify.decorate('db', { client, schema, do: db })
}, { name: 'db', dependencies: ['config'] })

// Bad: module-level singleton
export const db = drizzle(postgres({ host: config.db.host }))
```

## Configuration

- **Use `@fastify/env` with a TypeBox schema.** This is the official Fastify wrapper around `env-schema`. Do not hand-roll `requireEnv`/`optionalEnv` helpers.
- **Access config via `fastify.config`** after the config plugin registers. Never import a standalone config module from application code.
- **Declare types with `declare module 'fastify'`.** Extend `FastifyInstance` to include `config: Config` for full IntelliSense.
- **Exempt files:** `drizzle.config.ts` and `scripts/migrate.ts` may read `process.env` directly (they are CLI/deployment tools, not application code).
- **Logger bootstrap exception:** `app.ts` reads `process.env.NODE_ENV` directly for logger configuration at Fastify instantiation time. This runs before any plugins, so `fastify.config` is not yet available. This is the single documented exception in application code.

```typescript
import { Type, type Static } from '@sinclair/typebox'

const schema = Type.Object({
  SERVER_HOST: Type.String({ default: '0.0.0.0' }),
  SERVER_PORT: Type.Number({ default: 3000 }),
  NODE_ENV: Type.String({ default: 'development' }),
  POSTGRES_HOST: Type.String(),
  // ... all env vars
})

type Config = Static<typeof schema>

declare module 'fastify' {
  interface FastifyInstance {
    config: Config
  }
}
```

## Database

- **Drizzle ORM via Fastify plugin.** The db plugin calls a factory function (`createDbClient`) inside its async function, passing config from `fastify.config`. The factory function in `db/client.ts` creates the `postgres` client and `drizzle` instance.
- **Schema files in `db/schema/`.** One file per domain (e.g., `auth.ts`, `github.ts`). Re-export from `db/schema/index.ts`.
- **Use Drizzle's `sql` tag for raw queries.** Only when Drizzle's query builder cannot express the query (e.g., `SELECT 1` for health checks).
- **Close connections on shutdown.** The db plugin must add an `onClose` hook that calls `client.end()`.

## Authentication

- **better-auth instance created inside Fastify plugin lifecycle.** The auth plugin depends on `config` and `db` plugins. It receives the database client and config values from `fastify.config` and `fastify.db`. The email transporter is created via `createEmailSender` factory function with config values.
- **Auth route handler reconstructs the Caddy-stripped prefix.** Caddy strips `/api/` so Fastify sees `/auth/*`. The handler prepends `/api` back onto `request.url` before passing to `better-auth.handler()`.
- **`sendVerificationOnSignUp: true`** auto-sends OTP on registration.
- **`trustedOrigins` uses origin only** (scheme+host+port), not full URL with path.
- **Never use `void asyncFn()`** for fire-and-forget async calls. At minimum, catch and log errors. Silent promise swallowing hides failures.

```typescript
// Bad: void swallows errors silently
void sendEmail({ to: email, subject, text })

// Good: catch and log
sendEmail({ to: email, subject, text }).catch((err) => {
  fastify.log.error({ err, email }, 'Failed to send email')
})
```

## Routes

- **Co-locate routes within their feature module.** Route files live alongside their feature code: `src/auth/routes.ts`, `src/github/routes.ts`, etc. Do NOT use a top-level `src/routes/` directory.
- **Wrap with `fp`.** Route plugins are wrapped with `fastify-plugin` and registered in `app.ts`.
- **API versioning required.** All routes use the `/v1/` prefix. Caddy strips `/api/` so Fastify registers routes under `/v1/auth/*`, `/v1/github/*`, etc. Exception: `/health` is unversioned.
- **Use TypeBox schemas for request validation** when defining typed route contracts (body, params, querystring, response).

## Error Handling

- **Log all errors.** Use `request.log.error({ err }, 'description')` for request-scoped errors. Use `fastify.log.error({ err }, 'description')` for plugin-level errors.
- **Never silently swallow promise rejections.** No `void asyncFn()`. Use `.catch()` with logging or `await` with try/catch.
- **Fastify's built-in error handler catches thrown errors.** Use `throw` in async handlers; Fastify serializes the error to JSON automatically.

## Graceful Shutdown

- **Use `close-with-grace`.** Do not manually register `process.on('SIGINT')` / `process.on('SIGTERM')` handlers. `close-with-grace` handles edge cases (delay, error shutdown) and is the pattern recommended by the Fastify team.

```typescript
import closeWithGrace from 'close-with-grace'

closeWithGrace({ delay: 10000 }, async ({ signal, err }) => {
  if (err) app.log.error({ err }, 'Server closing due to error')
  else app.log.info({ signal }, 'Server closing due to signal')
  await app.close()
})
```

## Logging

- **pino-pretty in development, JSON in production.** Configured via Fastify logger options in `app.ts`.
- **Structured logging.** Always pass an object as the first argument: `log.info({ userId, action }, 'message')`. Never use string concatenation.
- **Use request-scoped logging in routes** (`request.log`) for automatic request ID context.

## Health Check

- **`/health` endpoint checks database connectivity.** Returns `{ status: 'ok', timestamp }` on success, 503 with `{ status: 'error', message }` on failure.
- **No auth required on `/health`.** It is a public endpoint used by Docker healthchecks and load balancers.

## Other Rules

- **Caddy handles CORS.** Do not install or configure `@fastify/cors`.
- **Prefer official Fastify plugins** over hand-rolled implementations. Before writing custom middleware, check if an `@fastify/*` package exists.
- **`@sinclair/typebox` is a direct dependency.** It is used for `@fastify/env` schema definitions and route validation schemas.
