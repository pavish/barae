# Add GitHub social provider to better-auth backend configuration

**ID**: `22eb84-gh-backend-provider`
**Type**: feature
**Focus**: github-app-auth
**Created**: 2026-02-08 10:30
**Branch**: `task/22eb84-gh-backend-provider`
**Status**: planned

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
