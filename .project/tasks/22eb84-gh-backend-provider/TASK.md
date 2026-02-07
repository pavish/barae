# Add GitHub social provider to better-auth backend configuration

**ID**: `22eb84-gh-backend-provider`
**Type**: feature
**Focus**: github-app-auth
**Created**: 2026-02-08 10:30
**Branch**: `task/22eb84-gh-backend-provider`
**Status**: detailed
**Detailed**: 2026-02-08 11:00

## Description

Configure the backend to support GitHub as a social login provider. This involves adding GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to the config plugin's TypeBox schema (with empty-string defaults so they remain optional), adding the socialProviders.github block to the betterAuth() configuration with account linking enabled, and updating .env.example with the new variables. When credentials are empty strings, the GitHub provider should be conditionally excluded so better-auth does not attempt to register it.

## Acceptance Criteria

- [ ] GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are added to the config plugin TypeBox schema with empty string defaults
- [ ] .env.example is updated with documented GitHub credential placeholders
- [ ] socialProviders.github is conditionally added to betterAuth() config only when both credentials are non-empty
- [ ] Account linking is enabled with GitHub as a trusted provider (accountLinking.enabled + trustedProviders)
- [ ] Token expiration is configured (8h access token, 6-month refresh token) with auto-refresh
- [ ] The existing wildcard /v1/auth/* route handles GitHub callback without modification
- [ ] TypeScript type-checks pass, no lint errors

## Implementation Steps

### Step 1: Add GitHub config vars to TypeBox schema
**File**: `backend/src/plugins/config.ts`

Add two new properties to the `Type.Object()` schema with empty string defaults (following the pattern of `SMTP_HOST`):
```typescript
GITHUB_CLIENT_ID: Type.String({ default: '' }),
GITHUB_CLIENT_SECRET: Type.String({ default: '' }),
```

No changes needed to the `Config` type export — it's automatically derived via `Static<typeof schema>`.

### Step 2: Update .env.example with GitHub credential placeholders
**File**: `.env.example`

Add a new "GitHub App" section after "Security" and before "Domain":
```bash
# -------------------------------------------
# GitHub App (optional — enables "Login with GitHub")
# -------------------------------------------
# Create a GitHub App and copy the Client ID and generate a Client Secret.
# See docs/github-app-setup.md for step-by-step instructions.
# When empty, GitHub login is disabled.
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

### Step 3: Add socialProviders.github and account linking to betterAuth() config
**File**: `backend/src/auth/index.ts`

- Add a `hasGitHubCredentials` boolean: `config.GITHUB_CLIENT_ID !== '' && config.GITHUB_CLIENT_SECRET !== ''`
- Add `account.accountLinking` block: `{ enabled: true, trustedProviders: ['github'] }`
- Add `socialProviders` with conditional spread: `...(hasGitHubCredentials ? { github: { clientId: config.GITHUB_CLIENT_ID, clientSecret: config.GITHUB_CLIENT_SECRET } } : {})`

No token expiration config needed — GitHub Apps handle expiration server-side (8h access, 6-month refresh). better-auth stores and refreshes tokens automatically.

No new routes needed — existing wildcard `/v1/auth/*` catches the callback.

No DB migration needed — `account` table already has all required columns.

## Verification Steps

- [ ] TypeScript type-check passes (`tsc --noEmit` in backend)
- [ ] Lint passes (backend)
- [ ] App starts without GitHub vars → provider excluded, no errors
- [ ] App starts with both vars set → provider registered
- [ ] Only one var set → provider NOT registered (both must be non-empty)
- [ ] Diff review: only 3 files changed (`config.ts`, `auth/index.ts`, `.env.example`)

## Test Cases

| Scenario | Expected |
|----------|----------|
| Both vars empty (defaults) | App starts, no GitHub provider registered, no errors |
| Both vars set (`GITHUB_CLIENT_ID='Iv1.abc'`, `GITHUB_CLIENT_SECRET='secret'`) | App starts, GitHub provider registered |
| Only one var set | `hasGitHubCredentials` is false, provider NOT registered |
| `GET /v1/auth/callback/github` with provider configured | Wildcard route catches it, better-auth handles token exchange |
| Non-string value for `GITHUB_CLIENT_ID` | `@fastify/env` rejects config at startup |
