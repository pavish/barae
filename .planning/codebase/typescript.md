# TypeScript Standards

These rules apply to all TypeScript code in `backend/` and `frontend/`. They are enforced on every code change.

## Strict Mode

Both `backend/tsconfig.json` and `frontend/tsconfig.json` must enable:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

- **`strict: true`** enables `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `noImplicitAny`, `noImplicitThis`, and `alwaysStrict`.
- **`noUncheckedIndexedAccess`** makes array/object index access return `T | undefined`, forcing explicit checks before use.
- **`exactOptionalPropertyTypes`** distinguishes between `{ key?: string }` (may be absent) and `{ key: string | undefined }` (present but undefined). You cannot assign `undefined` to an optional property unless the type explicitly includes `| undefined`.

## No `any` Type

**Never use `any`.** Use `unknown` instead and narrow the type before use.

### When to use `unknown`

- **Receiving external data** (API responses, parsed JSON, user input). Accept as `unknown`, then validate/narrow.
- **Catch blocks.** Error is `unknown` by default in strict mode. Narrow with `instanceof Error` or a type guard.
- **Generic boundaries.** When a function must accept truly any type, use a generic `<T>` or `unknown`.

```typescript
// Good: unknown with narrowing
function handleError(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}

// Good: generic instead of any
function identity<T>(value: T): T {
  return value
}

// Bad: any
function handleError(err: any): string {
  return err.message  // no type safety
}
```

### Rare exceptions where `any` may be acceptable

- **Third-party type gaps** where a library's types are incomplete or wrong, AND the value is immediately narrowed or cast to a known type within the same statement. Document with a `// eslint-disable-next-line` comment explaining why.
- **Type assertion chains** where `as unknown as TargetType` is too verbose for a well-understood cast. Still prefer `unknown` intermediary.

If you think you need `any`, apply this checklist:
1. Can a generic solve this? Use `<T>`.
2. Can `unknown` with narrowing solve this? Use `unknown`.
3. Can a union type solve this? Use `string | number | ...`.
4. Is this a third-party type gap with immediate narrowing? Document and suppress the lint rule.
5. None of the above? Ask the team before using `any`.

## Type Narrowing

- **Use discriminated unions** for related types with a common `kind` or `type` field.
- **Use type predicates** (`value is Type`) for custom type guard functions.
- **Use assertion functions** (`asserts value is Type`) for validation that throws on failure.
- **Narrow inline** where possible. TypeScript does not track narrowing across separate boolean variables.

```typescript
// Discriminated union
type Result = { ok: true; data: User } | { ok: false; error: string }

function handle(result: Result) {
  if (result.ok) {
    console.log(result.data.name) // narrowed to success case
  } else {
    console.log(result.error) // narrowed to error case
  }
}
```

## ESLint

- **`typescript-eslint/recommended`** ruleset.
- **`eslint-config-prettier`** to disable formatting rules that conflict with Prettier.
- **Do NOT use `eslint-plugin-prettier`.** It runs Prettier inside ESLint, causing performance issues and conflicting behavior. Prettier runs separately.

## Prettier

- **Run Prettier separately** from ESLint (via `prettier --check` / `prettier --write`).
- **Shared config** across backend and frontend (or identical settings).

## Unused Variables

- **`argsIgnorePattern: '^_'`** in both backend and frontend ESLint configs. Prefix unused function parameters with `_` (e.g., `_request`, `_reply`).

```typescript
// Good: unused parameter prefixed
app.get('/health', async (_request, reply) => { ... })

// Bad: unused parameter not prefixed
app.get('/health', async (request, reply) => { ... })
```

## Import Alias

- **`@/` maps to `src/`** in both backend and frontend `tsconfig.json`.
- Backend uses `tsconfig` paths. Frontend uses both `tsconfig` paths and `vite.config.ts` resolve alias.

## Module Format

- **ESM (`"type": "module"`)** in both `backend/package.json` and `frontend/package.json`.
- **Use `.js` extensions in imports** for backend TypeScript files (Node.js ESM resolution requires file extensions).

```typescript
// Good (backend)
import { buildApp } from './app.js'

// Bad (backend) -- will fail at runtime
import { buildApp } from './app'
```

Frontend imports do not need `.js` extensions (Vite handles resolution).

## Type Exports

- **Export types with `export type`** when the export is only used as a type. This enables proper tree-shaking and makes intent clear.

```typescript
export type Config = Static<typeof schema>
export type { FastifyInstance } from 'fastify'
```
