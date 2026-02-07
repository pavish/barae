# Add backend endpoint to expose GitHub auth availability

**ID**: `184b60-gh-availability-endpoint`
**Type**: feature
**Focus**: github-app-auth
**Created**: 2026-02-08 10:30
**Branch**: `task/184b60-gh-availability-endpoint`
**Status**: detailed
**Detailed**: 2026-02-08 12:00

## Dependencies

- `22eb84-gh-backend-provider` — GitHub config must exist to check against (completed)

## Description

The frontend needs to know whether GitHub login is available (i.e., whether the server has GitHub credentials configured) to decide whether the "Continue with GitHub" button should be enabled or disabled. Add a lightweight API endpoint that returns the availability status of configured auth providers. This endpoint does not expose secrets — it only returns a boolean indicating whether GitHub auth is available.

## Acceptance Criteria

- [ ] A new GET endpoint exists (e.g., /v1/auth/providers) that returns which social providers are available
- [ ] The response includes a boolean flag for GitHub availability (e.g., `{ github: true }`)
- [ ] No secrets or credentials are exposed in the response
- [ ] The endpoint is publicly accessible (no auth required — needed before login)
- [ ] Route follows the existing co-located pattern (in backend/src/auth/)
- [ ] TypeScript type-checks pass, no lint errors

## Implementation Steps

### Step 1: Add GET /v1/auth/providers route to auth routes

**File**: `backend/src/auth/routes.ts`

Add a new `fastify.get('/v1/auth/providers', ...)` route **before** the existing catch-all `/v1/auth/*` route. Fastify matches specific routes before wildcards, so ordering in code doesn't strictly matter, but placing it first improves readability.

The route:
- Uses `fastify.config` to check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (both non-empty = available)
- Returns `{ github: boolean }` as JSON
- No auth required (public endpoint, needed before login)
- Uses TypeBox for response schema validation

```typescript
import { Type } from '@sinclair/typebox'

fastify.get(
  '/v1/auth/providers',
  {
    schema: {
      response: {
        200: Type.Object({
          github: Type.Boolean(),
        }),
      },
    },
  },
  async () => {
    const { config } = fastify
    return {
      github:
        config.GITHUB_CLIENT_ID !== '' && config.GITHUB_CLIENT_SECRET !== '',
    }
  },
)
```

No changes to the catch-all route or auth plugin needed. The dependency on `auth` already implies `config` is available.

## Verification Steps

- [ ] TypeScript type-check passes (`tsc --noEmit` in backend)
- [ ] Lint passes (backend)
- [ ] `GET /v1/auth/providers` returns `{ "github": false }` when env vars are empty
- [ ] `GET /v1/auth/providers` returns `{ "github": true }` when both env vars are set
- [ ] Endpoint is accessible without authentication
- [ ] Existing auth routes still work (catch-all not broken)
- [ ] Diff review: only 1 file changed (`auth/routes.ts`)

## Test Cases

| Scenario | Expected |
|----------|----------|
| Both GitHub vars empty (defaults) | `GET /v1/auth/providers` → `{ "github": false }` |
| Both GitHub vars set | `GET /v1/auth/providers` → `{ "github": true }` |
| Only one var set | `GET /v1/auth/providers` → `{ "github": false }` |
| No auth header | Endpoint responds 200 (public) |
| POST to /v1/auth/providers | 404 (only GET defined) |
