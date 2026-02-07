# Add GitHub account link and unlink functionality to settings page

**ID**: `f9a333-gh-settings-link`
**Type**: feature
**Focus**: github-app-auth
**Created**: 2026-02-08 10:30
**Branch**: `task/f9a333-gh-settings-link`
**Status**: planned

## Dependencies

- `184b60-gh-availability-endpoint` — needs provider availability endpoint to determine card visibility
- `412b79-gh-auth-page` — established auth page patterns for OAuth error handling

## Description

Replace the placeholder "GitHub Account" card on the settings page with a functional one. When the user has no linked GitHub account, show a "Link GitHub Account" button. When linked, show the connected GitHub username/profile info and an "Unlink" button. Unlinking is blocked if GitHub is the user's only login method (no password set). The link flow uses authClient.linkSocial() and unlink uses authClient.unlinkAccount(). Both operations need proper error handling and success feedback.

## Acceptance Criteria

- [ ] The settings page shows a functional "GitHub Account" card (replaces the placeholder)
- [ ] When no GitHub account is linked, a "Link GitHub Account" button initiates the OAuth flow via authClient.linkSocial()
- [ ] When a GitHub account is linked, the card shows the GitHub username and an "Unlink" button
- [ ] Unlinking calls authClient.unlinkAccount({ providerId: "github" })
- [ ] Unlinking is blocked with a clear message when GitHub is the user's only login method (no password set)
- [ ] Each Barae user can have at most one GitHub account linked (enforced by better-auth, UI reflects this)
- [ ] Success and error states are shown for both link and unlink operations
- [ ] The card is hidden/disabled when GitHub is not configured on the server (uses provider availability)
- [ ] TypeScript type-checks pass, no lint errors
