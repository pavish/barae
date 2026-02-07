# Add backend endpoint to expose GitHub auth availability

**ID**: `184b60-gh-availability-endpoint`
**Type**: feature
**Focus**: github-app-auth
**Created**: 2026-02-08 10:30
**Branch**: `task/184b60-gh-availability-endpoint`
**Status**: planned

## Dependencies

- `22eb84-gh-backend-provider` — GitHub config must exist to check against

## Description

The frontend needs to know whether GitHub login is available (i.e., whether the server has GitHub credentials configured) to decide whether the "Continue with GitHub" button should be enabled or disabled. Add a lightweight API endpoint that returns the availability status of configured auth providers. This endpoint does not expose secrets — it only returns a boolean indicating whether GitHub auth is available.

## Acceptance Criteria

- [ ] A new GET endpoint exists (e.g., /v1/auth/providers) that returns which social providers are available
- [ ] The response includes a boolean flag for GitHub availability (e.g., `{ github: true }`)
- [ ] No secrets or credentials are exposed in the response
- [ ] The endpoint is publicly accessible (no auth required — needed before login)
- [ ] Route follows the existing co-located pattern (in backend/src/auth/)
- [ ] TypeScript type-checks pass, no lint errors
