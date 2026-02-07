# Write GitHub App creation guide for docs/

**ID**: `04bc80-gh-setup-guide`
**Type**: docs
**Focus**: github-app-auth
**Created**: 2026-02-08 10:30
**Branch**: `task/04bc80-gh-setup-guide`
**Status**: planned

## Dependencies

- `22eb84-gh-backend-provider` — needs to know the exact env variable names and callback URL format

## Description

Create a step-by-step guide at docs/github-app-setup.md that walks users through creating a GitHub App for use with Barae. The guide should cover creating the app, configuring the correct OAuth callback URL, setting the required permissions (including repo permissions needed for future features to avoid re-authorization later), enabling token expiration, and copying the client ID and secret into Barae's .env file.

## Acceptance Criteria

- [ ] docs/github-app-setup.md exists with a complete step-by-step guide
- [ ] Guide covers: creating the GitHub App, setting the homepage URL, configuring the callback URL
- [ ] Guide specifies the correct callback URL format for Barae (based on AUTH_BASE_URL)
- [ ] Guide recommends enabling token expiration for user-to-server tokens
- [ ] Guide includes recommended permissions (repo contents, actions, pages — for future use)
- [ ] Guide explains how to copy the Client ID and generate + copy the Client Secret
- [ ] Guide shows how to add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env
- [ ] Guide includes a verification step (restart Barae and confirm GitHub button is enabled)
- [ ] Written in clear, non-technical language suitable for users who may not be GitHub power users
