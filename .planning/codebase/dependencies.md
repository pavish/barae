# Dependency Standards

These rules apply to all npm package additions, removals, and audits. They are enforced during every phase.

## Before Adding a Dependency

1. **Verify the package is well-maintained.** Check:
   - GitHub repository activity (recent commits, open issues addressed)
   - npm download counts (not trending down)
   - Last publish date (not abandoned)
   - Maintenance status (has active maintainers)
2. **Check if an official Fastify plugin exists** for the capability. Prefer `@fastify/*` packages over third-party alternatives.
3. **Do not pre-install dependencies for future phases.** Add packages when the phase that needs them executes, not earlier. This keeps the dependency tree clean and avoids unused packages.

## Direct Dependencies

These packages are confirmed as actively used and well-maintained:

### Backend (production)
- `fastify` -- HTTP framework
- `fastify-plugin` -- Plugin wrapper for shared state
- `@fastify/env` -- Environment variable validation (wraps `env-schema`)
- `@fastify/type-provider-typebox` -- TypeBox type provider for route schemas
- `@sinclair/typebox` -- JSON Schema builder, used by `@fastify/env` and route schemas
- `better-auth` -- Authentication framework
- `drizzle-orm` -- Database ORM
- `postgres` -- PostgreSQL driver
- `nodemailer` -- Email sending
- `close-with-grace` -- Graceful shutdown

### Backend (dev)
- `drizzle-kit` -- Migration generation and management
- `typescript` -- Type checking
- `tsx` -- TypeScript execution for dev
- `eslint` + `typescript-eslint` + `eslint-config-prettier` -- Linting
- `prettier` -- Code formatting
- `pino-pretty` -- Dev log formatting

### Frontend (production)
- `react` + `react-dom` -- UI framework
- `@tanstack/react-query` -- Server state management
- `better-auth` -- Auth client
- `clsx` + `tailwind-merge` -- Class name utilities (shadcn/ui)
- `class-variance-authority` -- Component variant utilities (shadcn/ui)

### Frontend (dev)
- `vite` -- Bundler and dev server
- `tailwindcss` -- CSS framework
- `typescript` -- Type checking

## Frontend Scaffolded Dependencies

These packages are installed for Phase 3 (Dashboard Shell, the next execution phase) and are intentionally kept:
- `react-router-dom` -- Client-side routing
- `zustand` -- Client state management
- `zod` -- Schema validation (for forms)
- `react-hook-form` + `@hookform/resolvers` -- Form handling
- `lucide-react` -- Icons
- `sonner` -- Toast notifications

**This is an intentional decision**, not an oversight. Removing and re-adding them for the next phase would be wasteful.

## Per-Phase Dependency Audit

During each phase's review cycle:
1. List all dependencies in `package.json` (both packages).
2. Verify each is imported in at least one source file OR is documented as intentionally scaffolded.
3. Remove any that are unused and not documented as intentional.
4. Check for security advisories: `npm audit`.

## ESLint Plugin Rule

- **Use `eslint-config-prettier`** to disable formatting rules. This is a configuration-only package.
- **Do NOT use `eslint-plugin-prettier`.** It runs Prettier as an ESLint rule, causing performance issues and conflicting behavior. The Prettier project recommends against it.

## Version Choices

- High-level version choices (Node.js, npm, PostgreSQL major versions) are deferred to the user.
- Pin major versions in Dockerfiles (e.g., `node:22-alpine`, `postgres:17-alpine`).
- Use `^` ranges in `package.json` for npm packages (default npm behavior).

## `@sinclair/typebox`

`@sinclair/typebox` is a **direct dependency** in the backend, not just a transitive one. It is used explicitly for:
- `@fastify/env` schema definitions (TypeBox `Type.Object`, `Type.String`, etc.)
- Route validation schemas with `@fastify/type-provider-typebox`

Do not remove it even if it appears to be a duplicate of what `@fastify/type-provider-typebox` brings.
