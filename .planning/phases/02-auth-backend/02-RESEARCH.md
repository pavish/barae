# Phase 2: Auth Backend - Research

**Researched:** 2026-02-05
**Domain:** Authentication with better-auth (email/password, OTP verification, sessions, password reset)
**Confidence:** HIGH

## Summary

Phase 2 implements complete email/password authentication using better-auth, a framework-agnostic TypeScript authentication library already listed as a dependency (^1.4.18). The library provides email/password auth, session management, and an email OTP plugin out of the box. It integrates with the existing Drizzle ORM via a dedicated adapter and connects to Fastify through a catch-all route handler.

The key architectural challenge is the Caddy reverse proxy configuration: Caddy's `handle_path` strips `/api/` from requests, so Fastify receives `/auth/...` instead of `/api/auth/...`. better-auth must be configured with `basePath: "/auth"` to match this internal routing, while the client uses `/api` as its base to align with the public-facing URL structure.

The email OTP plugin handles both email verification (AUTH-02) and password reset (AUTH-05) via 6-digit codes rather than URL-based flows, which simplifies the proxy/URL generation concerns significantly.

**Primary recommendation:** Use better-auth with the email OTP plugin, Drizzle adapter (provider: "pg"), and nodemailer for email transport. Mount as a Fastify catch-all route at `/auth/*` with `basePath: "/auth"`. Use Mailpit (already in dev compose) for dev email testing.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-auth | ^1.4.18 | Authentication framework | Already a project dependency; full-featured with Drizzle adapter, email/password, OTP, sessions |
| better-auth/plugins (emailOTP) | ^1.4.18 | OTP-based email verification and password reset | Built-in plugin; handles AUTH-02 and AUTH-05 without URL-based flows |
| drizzle-orm | ^0.45.1 | Database ORM (existing) | Already in project; better-auth has a first-class Drizzle adapter |
| nodemailer | ^7.0.13 | Email transport (SMTP) | Already a project dependency; works with Mailpit (dev) and any SMTP provider (prod) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/nodemailer | ^7.0.9 | TypeScript types for nodemailer | Already a dev dependency |
| Mailpit | latest (Docker image) | Dev email capture and UI | Already in compose.dev.yml; view emails at http://localhost:8025 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| better-auth email OTP | better-auth built-in email verification (link-based) | Link-based requires URL generation that's complicated by Caddy's path stripping; OTP is simpler and matches AUTH-02's "OTP code" requirement |
| nodemailer | Resend SDK | Resend is a hosted service; nodemailer works with any SMTP including Mailpit for dev; more flexible |
| fastify-better-auth plugin | Manual Fastify integration | The fastify-better-auth plugin (52 GitHub stars) is still very new; manual integration is well-documented and gives more control |

### No New Installation Needed

All required packages are already in `backend/package.json`:
- `better-auth: ^1.4.18`
- `nodemailer: ^7.0.13`
- `@types/nodemailer: ^7.0.9`
- `drizzle-orm: ^0.45.1`
- `drizzle-kit: ^0.31.8`

## Architecture Patterns

### Recommended Project Structure

```
backend/src/
├── config.ts              # Existing: env validation (add BETTER_AUTH_URL)
├── app.ts                 # Existing: Fastify app builder (register auth routes)
├── index.ts               # Existing: server startup
├── auth/
│   ├── index.ts           # better-auth instance (betterAuth config)
│   └── email.ts           # Email transport (nodemailer createTransport)
├── db/
│   ├── index.ts           # Existing: Drizzle plugin for Fastify
│   └── schema/
│       ├── index.ts       # Barrel export for all schemas
│       └── auth.ts        # better-auth schema (user, session, account, verification)
└── routes/
    └── auth.ts            # Fastify catch-all route for better-auth handler
```

### Pattern 1: better-auth Instance Configuration

**What:** Create a standalone better-auth instance that can be imported by both the Fastify route handler and any server-side code needing auth operations.
**When to use:** Always -- this is the entry point for all auth operations.

```typescript
// Source: https://www.better-auth.com/docs/installation
// Source: https://www.better-auth.com/docs/adapters/drizzle
// Source: https://www.better-auth.com/docs/plugins/email-otp
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'
import { db } from '../db/drizzle.js'
import * as schema from '../db/schema/index.js'
import { config } from '../config.js'
import { sendEmail } from './email.js'

export const auth = betterAuth({
  baseURL: config.auth.baseURL,   // e.g., "http://localhost:8100/api"
  basePath: '/auth',               // Caddy strips /api/, Fastify sees /auth/*
  secret: config.auth.secret,      // APP_SECRET from env (32+ chars)
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      // Not used when email OTP plugin overrides verification
    },
    autoSignInAfterVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 days (default)
    updateAge: 60 * 60 * 24,         // Refresh after 1 day
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,                // 5 minutes
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendEmail({
          to: email,
          subject: type === 'email-verification'
            ? 'Verify your email'
            : type === 'forget-password'
              ? 'Reset your password'
              : 'Sign in code',
          text: `Your verification code is: ${otp}`,
        })
      },
    }),
  ],
  trustedOrigins: [config.auth.baseURL],
})
```

### Pattern 2: Fastify Route Handler (Catch-All)

**What:** Mount better-auth as a Fastify catch-all route that converts between Fastify and Fetch API request/response formats.
**When to use:** In app.ts or a dedicated routes file.

```typescript
// Source: https://www.better-auth.com/docs/integrations/fastify
import { auth } from '../auth/index.js'

// In Fastify route registration:
fastify.route({
  method: ['GET', 'POST'],
  url: '/auth/*',
  async handler(request, reply) {
    const url = new URL(request.url, `http://${request.headers.host}`)

    const headers = new Headers()
    for (const [key, value] of Object.entries(request.headers)) {
      if (value !== undefined) {
        headers.append(key, Array.isArray(value) ? value.join(', ') : value)
      }
    }

    const req = new Request(url.toString(), {
      method: request.method,
      headers,
      ...(request.body ? { body: JSON.stringify(request.body) } : {}),
    })

    const response = await auth.handler(req)

    reply.status(response.status)
    response.headers.forEach((value, key) => {
      reply.header(key, value)
    })

    const text = await response.text()
    return reply.send(text || null)
  },
})
```

### Pattern 3: Drizzle Schema for better-auth

**What:** Define the database schema that better-auth requires using Drizzle ORM table definitions.
**When to use:** In `db/schema/auth.ts`.

```typescript
// Generated via: npx @better-auth/cli@latest generate
// Then adjusted for project conventions
import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

### Pattern 4: Email Transport Module

**What:** Standalone nodemailer transport that reads SMTP config and provides a simple `sendEmail` function.
**When to use:** Called by better-auth's OTP plugin and any future email needs.

```typescript
// Source: https://nodemailer.com/smtp
import nodemailer from 'nodemailer'
import { config } from '../config.js'

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  ...(config.smtp.user
    ? { auth: { user: config.smtp.user, pass: config.smtp.password } }
    : {}),
})

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  await transporter.sendMail({
    from: config.smtp.from,
    ...options,
  })
}
```

### Pattern 5: Auth Session Middleware for Protected Routes

**What:** Fastify preHandler hook that validates the session and attaches user/session data to the request.
**When to use:** On any route that requires authentication.

```typescript
import { auth } from '../auth/index.js'

// Fastify preHandler hook for protected routes
async function requireAuth(request, reply) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!session) {
    reply.status(401).send({ error: 'Unauthorized' })
    return
  }
  request.session = session.session
  request.user = session.user
}
```

### Anti-Patterns to Avoid

- **Don't use CORS with better-auth behind Caddy:** Caddy handles proxying from the same origin. Adding `@fastify/cors` would be redundant and could cause double-header issues. The `trustedOrigins` config in better-auth handles origin validation.
- **Don't set `BETTER_AUTH_SECRET` or `BETTER_AUTH_URL` env vars:** The project convention is to use `APP_SECRET` and pass config explicitly. better-auth auto-detects these env vars, which could conflict.
- **Don't use link-based email verification when OTP is required:** AUTH-02 specifies "OTP code". Using both the built-in email verification (link-based) and email OTP plugin creates confusion. Use the OTP plugin's `overrideDefaultEmailVerification: true` or configure only the OTP plugin for verification.
- **Don't create a separate Drizzle client for better-auth:** Reuse the existing Drizzle/postgres.js connection from the db plugin. better-auth's Drizzle adapter accepts a Drizzle instance.
- **Don't store OTPs in plain text in production:** The email OTP plugin supports encrypted or hashed storage. For Phase 2, hashed storage is recommended.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom bcrypt/argon2 wrapper | better-auth built-in (scrypt) | Scrypt is memory-hard, native to Node.js, better-auth handles salt generation |
| Session management | Custom JWT/cookie logic | better-auth sessions | Cookie-based, auto-refresh, revocation, multi-device tracking built-in |
| CSRF protection | Custom CSRF tokens | better-auth built-in | Origin checking, SameSite cookies, Sec-Fetch-* header validation |
| Rate limiting (auth routes) | Custom rate limiter | better-auth built-in | Auto-enabled in production, stricter on high-risk routes (login, signup) |
| Email verification flow | Custom OTP generation/storage/validation | emailOTP plugin | Handles code generation, expiry, attempt limiting, storage |
| Password reset flow | Custom token generation/validation | emailOTP plugin (OTP-based reset) | Secure, time-limited, attempt-limited |
| Request/response conversion | Custom adapter code | Documented Fastify pattern | The official Fastify integration pattern handles Headers, URL construction, body forwarding |

**Key insight:** better-auth is a comprehensive auth framework, not just a library. It handles password hashing, session cookies, CSRF, rate limiting, and OTP flows. Implementing any of these manually defeats the purpose of using it.

## Common Pitfalls

### Pitfall 1: Caddy Path Stripping vs better-auth basePath Mismatch

**What goes wrong:** Caddy `handle_path /api/*` strips the `/api/` prefix. If better-auth is configured with default `basePath: "/api/auth"`, no routes match because Fastify receives `/auth/...` not `/api/auth/...`.
**Why it happens:** The Phase 1 architecture decision to strip `/api/` for clean Fastify routes conflicts with better-auth's default expectations.
**How to avoid:**
- Set `basePath: "/auth"` on the server (matches what Fastify receives after Caddy strips `/api/`)
- Set `baseURL` to include `/api` in the path for URL generation: `"http://localhost:8100/api"` (dev) or `"https://domain.com/api"` (prod)
- Client uses `baseURL: "/api"` (relative, same origin)
**Warning signs:** 404 errors on all auth routes; "route not found" in Fastify logs.

### Pitfall 2: Fastify Body Parsing Conflicts

**What goes wrong:** Fastify automatically parses JSON request bodies. When the catch-all handler re-serializes with `JSON.stringify(request.body)`, the body is double-serialized or loses its original format.
**Why it happens:** better-auth expects a Fetch API Request with a raw body, but Fastify pre-parses JSON.
**How to avoid:** Use `JSON.stringify(request.body)` in the Request constructor, which correctly re-serializes the already-parsed body. Alternatively, use `fastify-raw-body` if issues arise, or use `toNodeHandler` from `better-auth/node` which handles this internally.
**Warning signs:** "Invalid JSON" errors from better-auth; signup/login returning 400 errors.

### Pitfall 3: TypeScript `exactOptionalPropertyTypes` with better-auth

**What goes wrong:** When calling `auth.api.*` methods with optional parameters, TypeScript errors with "Type 'X | undefined' is not assignable to type 'X'" because `exactOptionalPropertyTypes` doesn't allow `undefined` for optional properties.
**Why it happens:** Some better-auth API type definitions use `property?: Type` which under `exactOptionalPropertyTypes` only accepts the property being omitted entirely, not set to `undefined`.
**How to avoid:** This was fixed in PR #5003 (specific to the organization plugin). For core email/password + session + OTP features, verify there are no type errors during implementation. If issues arise, use conditional spreading: `...(value !== undefined && { prop: value })`.
**Warning signs:** TypeScript compilation errors on `auth.api.*` calls with optional parameters.

### Pitfall 4: Shared Drizzle Connection vs Standalone Auth Instance

**What goes wrong:** Creating the better-auth instance at module level requires a Drizzle `db` instance, but the current `db` is created inside a Fastify plugin and decorated onto the Fastify instance. better-auth needs a standalone Drizzle instance, not one tied to Fastify's lifecycle.
**Why it happens:** The current architecture creates `db` inside a Fastify plugin, but better-auth is initialized independently.
**How to avoid:** Extract the postgres.js client and Drizzle instance creation into a standalone module that both the Fastify db plugin and the better-auth instance can import. The Fastify plugin wraps it for lifecycle management (closing connections on shutdown), while better-auth uses the same underlying connection.
**Warning signs:** Circular imports; auth instance undefined at module load time; database connection not shared.

### Pitfall 5: Missing Schema Relations for Drizzle Adapter

**What goes wrong:** The Drizzle adapter may not work correctly without proper Drizzle relations defined between tables (user <-> session, user <-> account).
**Why it happens:** better-auth's experimental `joins` feature and some query patterns rely on Drizzle relations.
**How to avoid:** Generate the schema using `npx @better-auth/cli@latest generate` which includes relations, then verify they're properly defined. Pass the complete schema object to `drizzleAdapter`.
**Warning signs:** N+1 queries; missing data in session responses; adapter errors.

### Pitfall 6: better-auth Auto-Detection of Environment Variables

**What goes wrong:** better-auth automatically reads `BETTER_AUTH_SECRET`, `AUTH_SECRET`, and `BETTER_AUTH_URL` from `process.env`. If these are set (perhaps by a deployment platform), they override explicit config values.
**Why it happens:** better-auth has built-in env var detection for convenience.
**How to avoid:** Always pass `secret` and `baseURL` explicitly in the betterAuth config. Never set `BETTER_AUTH_SECRET`, `AUTH_SECRET`, or `BETTER_AUTH_URL` in `.env`. Use `APP_SECRET` (existing) for the secret and a new `AUTH_BASE_URL` for the base URL.
**Warning signs:** Auth working in one environment but not another; secret mismatch errors.

### Pitfall 7: Timing Attacks on Email Sending

**What goes wrong:** If email sending is awaited in the auth flow, the response time difference between "user exists" and "user doesn't exist" leaks information.
**Why it happens:** Sending email takes measurable time vs. returning immediately for non-existent users.
**How to avoid:** The better-auth docs warn: "Avoid awaiting the email sending to prevent timing attacks." In a server environment (not serverless), this is less critical because the OTP plugin handles this internally. But be aware if implementing custom email flows.
**Warning signs:** Measurably different response times for valid vs invalid email addresses.

## Code Examples

### Complete Auth Initialization (Server)

```typescript
// Source: https://www.better-auth.com/docs/installation
// Source: https://www.better-auth.com/docs/adapters/drizzle
// Source: https://www.better-auth.com/docs/plugins/email-otp
// Source: https://www.better-auth.com/docs/reference/options

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP } from 'better-auth/plugins'

export const auth = betterAuth({
  appName: 'Barae',
  baseURL: config.auth.baseURL,
  basePath: '/auth',
  secret: config.auth.secret,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 days
    updateAge: 60 * 60 * 24,         // Refresh after 1 day
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      sendVerificationOTP: async ({ email, otp, type }) => {
        // Fire-and-forget in production to prevent timing attacks
        void sendEmail({
          to: email,
          subject: getOtpSubject(type),
          text: `Your verification code is: ${otp}`,
        })
      },
    }),
  ],
  trustedOrigins: [config.auth.baseURL],
  advanced: {
    database: {
      generateId: false, // Let DB generate IDs, or use better-auth default
    },
  },
})
```

### Client-Side Auth Setup (React)

```typescript
// Source: https://www.better-auth.com/docs/concepts/client
import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: '/api',  // Same origin, Caddy handles routing
  plugins: [
    emailOTPClient(),
  ],
})
```

### Client-Side Usage Examples

```typescript
// Source: https://www.better-auth.com/docs/authentication/email-password
// Source: https://www.better-auth.com/docs/plugins/email-otp

// Sign up
const { data, error } = await authClient.signUp.email({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securePassword123',
})

// Request OTP for email verification
const { data, error } = await authClient.emailOtp.sendVerificationOtp({
  email: 'john@example.com',
  type: 'email-verification',
})

// Verify email with OTP
const { data, error } = await authClient.emailOtp.verifyEmail({
  email: 'john@example.com',
  otp: '123456',
})

// Sign in
const { data, error } = await authClient.signIn.email({
  email: 'john@example.com',
  password: 'securePassword123',
})

// Get current session
const { data: session } = authClient.useSession()

// List all sessions
const sessions = await authClient.listSessions()

// Revoke specific session
await authClient.revokeSession({ token: 'session-token' })

// Request password reset OTP
await authClient.emailOtp.sendVerificationOtp({
  email: 'john@example.com',
  type: 'forget-password',
})

// Reset password with OTP
await authClient.emailOtp.resetPassword({
  email: 'john@example.com',
  otp: '123456',
  password: 'newSecurePassword123',
})

// Sign out
await authClient.signOut()
```

### better-auth API Routes Reference

All routes are prefixed with `basePath` (i.e., `/auth/` in our setup). After Caddy, the public URLs are `/api/auth/...`.

| Operation | Method | Fastify Path | Public URL |
|-----------|--------|-------------|------------|
| Sign up | POST | `/auth/sign-up/email` | `/api/auth/sign-up/email` |
| Sign in | POST | `/auth/sign-in/email` | `/api/auth/sign-in/email` |
| Sign out | POST | `/auth/sign-out` | `/api/auth/sign-out` |
| Get session | GET | `/auth/get-session` | `/api/auth/get-session` |
| List sessions | GET | `/auth/list-sessions` | `/api/auth/list-sessions` |
| Revoke session | POST | `/auth/revoke-session` | `/api/auth/revoke-session` |
| Revoke other sessions | POST | `/auth/revoke-other-sessions` | `/api/auth/revoke-other-sessions` |
| Change password | POST | `/auth/change-password` | `/api/auth/change-password` |
| Forget password | POST | `/auth/forget-password` | `/api/auth/forget-password` |
| Reset password | POST | `/auth/reset-password` | `/api/auth/reset-password` |
| Verify email | POST | `/auth/verify-email` | `/api/auth/verify-email` |
| Update user | POST | `/auth/update-user` | `/api/auth/update-user` |
| Health check | GET | `/auth/ok` | `/api/auth/ok` |
| Email OTP: send | POST | `/auth/email-otp/send-verification-otp` | `/api/auth/email-otp/send-verification-otp` |
| Email OTP: verify email | POST | `/auth/email-otp/verify-email` | `/api/auth/email-otp/verify-email` |
| Email OTP: reset password | POST | `/auth/email-otp/reset-password` | `/api/auth/email-otp/reset-password` |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Passport.js / custom JWT | Framework-agnostic auth libraries (better-auth, lucia) | 2024+ | Less boilerplate, built-in security best practices |
| Link-based email verification | OTP-based verification (codes) | 2024+ | Better mobile UX, no deep linking issues, simpler proxy setup |
| Custom session management | Library-managed cookie sessions with DB backing | 2024+ | Handles refresh, revocation, multi-device out of the box |
| Manual CSRF tokens | Built-in origin + SameSite + Sec-Fetch-* checking | 2024+ | More robust, less configuration needed |

**Deprecated/outdated:**
- Lucia auth: While previously popular, Lucia was deprecated in early 2025. better-auth is the recommended successor.
- Custom JWT sessions: better-auth uses cookie-based sessions with DB storage by default, which is more secure than JWTs for web apps.

## Open Questions

1. **Drizzle Connection Sharing Architecture**
   - What we know: The current db plugin creates the postgres.js client + Drizzle instance inside a Fastify plugin. better-auth needs a Drizzle instance at module level, outside Fastify's lifecycle.
   - What's unclear: The exact refactoring pattern to share the connection without breaking the existing Fastify db plugin contract.
   - Recommendation: Extract db creation into a standalone module (`db/client.ts`) that exports the raw connection and Drizzle instance. The Fastify db plugin imports and wraps it for lifecycle management (close on shutdown). better-auth imports the same instance directly. This is a small refactor that keeps existing patterns working.

2. **better-auth CLI Schema Generation vs Manual Schema**
   - What we know: The CLI can auto-generate Drizzle schema, but it may not respect project conventions (naming, structure). Manual schema definition is also supported.
   - What's unclear: Whether the CLI-generated schema includes all necessary relations for the OTP plugin's `verification` table.
   - Recommendation: Use `npx @better-auth/cli@latest generate --output ./src/db/schema/auth.ts` to generate the initial schema, then review and adjust for project conventions (camelCase files, proper imports). Verify the OTP plugin doesn't require additional tables beyond the core four (user, session, account, verification). The OTP plugin uses the existing `verification` table.

3. **Config Module Extension for Auth URLs**
   - What we know: The config module reads env vars and exports typed config. It already has `auth.secret` (from `APP_SECRET`) and `smtp.*` settings.
   - What's unclear: How to handle the `baseURL` for different environments (dev vs prod) cleanly.
   - Recommendation: Add `AUTH_BASE_URL` to `.env.example` with default `http://localhost:8100/api`. In dev compose, override to `http://localhost:8100/api`. In prod, set to `https://${DOMAIN}/api`. The config module validates and exports this.

4. **Rate Limiting Interaction**
   - What we know: better-auth has built-in rate limiting (enabled in production, disabled in dev). The project also has `@fastify/rate-limit` as a dependency.
   - What's unclear: Whether both rate limiters will conflict when applied to auth routes.
   - Recommendation: Do NOT apply `@fastify/rate-limit` to the auth catch-all route. Let better-auth handle rate limiting for its own routes. Use `@fastify/rate-limit` only for custom (non-auth) API routes added later.

## Sources

### Primary (HIGH confidence)

- [better-auth official docs: Installation](https://www.better-auth.com/docs/installation) - Setup, configuration basics
- [better-auth official docs: Email/Password](https://www.better-auth.com/docs/authentication/email-password) - Signup, login, password reset, email verification
- [better-auth official docs: Session Management](https://www.better-auth.com/docs/concepts/session-management) - Cookie sessions, expiration, revocation, listing
- [better-auth official docs: Email OTP Plugin](https://www.better-auth.com/docs/plugins/email-otp) - OTP verification, password reset, configuration
- [better-auth official docs: Drizzle Adapter](https://www.better-auth.com/docs/adapters/drizzle) - Adapter setup, schema generation, custom fields
- [better-auth official docs: Fastify Integration](https://www.better-auth.com/docs/integrations/fastify) - Route handler, request/response conversion
- [better-auth official docs: Options Reference](https://www.better-auth.com/docs/reference/options) - Complete configuration reference
- [better-auth official docs: Security](https://www.better-auth.com/docs/reference/security) - CSRF, origin checking, rate limiting
- [better-auth official docs: Database](https://www.better-auth.com/docs/concepts/database) - Core schema (user, session, account, verification)
- [better-auth official docs: Users & Accounts](https://www.better-auth.com/docs/concepts/users-accounts) - User/account model, custom fields, account linking
- [better-auth official docs: Email](https://www.better-auth.com/docs/concepts/email) - Email sending patterns, timing attack prevention
- [better-auth official docs: CLI](https://www.better-auth.com/docs/concepts/cli) - Schema generation, migration

### Secondary (MEDIUM confidence)

- [better-auth GitHub Discussion #6152](https://github.com/better-auth/better-auth/discussions/6152) - baseURL/basePath with reverse proxy
- [better-auth GitHub Issue #4804](https://github.com/better-auth/better-auth/issues/4804) - exactOptionalPropertyTypes fix (PR #5003)
- [deepwiki.com: better-auth API Routes](https://deepwiki.com/better-auth/better-auth/2.3-api-routes-and-endpoints) - Complete endpoint listing
- [fastify-better-auth plugin](https://github.com/flaviodelgrosso/fastify-better-auth) - Alternative integration approach (52 stars, not recommended for this project)

### Tertiary (LOW confidence)

- [Nodemailer SMTP transport docs](https://nodemailer.com/smtp) - SMTP configuration patterns
- [Mailpit GitHub](https://github.com/axllent/mailpit) - Dev email testing tool

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in package.json; better-auth docs are comprehensive and current
- Architecture: HIGH - Fastify integration is officially documented; Drizzle adapter is first-class; proxy path handling is well-understood from Phase 1
- Pitfalls: HIGH - basePath/proxy issue verified through official docs and GitHub discussions; TypeScript strict mode issues documented in GitHub issues
- Email OTP flow: HIGH - Plugin docs are clear with complete API reference

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (better-auth is actively developed; check for breaking changes in minor versions)
