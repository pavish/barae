# Requirements: Barae

**Defined:** 2026-02-05
**Core Value:** Built for long-term maintenance, not just initial site creation. Users own their content in git — standard Astro projects, portable, not locked into Barae.

## v1 Requirements

Requirements for Milestone 1: Foundation & Integration.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User verifies email via OTP code after signup
- [ ] **AUTH-03**: User can log in with email and password
- [ ] **AUTH-04**: User can log in via GitHub App OAuth (creates Barae account if none exists)
- [ ] **AUTH-05**: User can reset password via email
- [ ] **AUTH-06**: User session persists across browser closes
- [ ] **AUTH-07**: User can view active sessions and revoke them
- [ ] **AUTH-08**: User can log out from any page

### GitHub Integration

- [ ] **GHUB-01**: User can link their GitHub account to their Barae account (one-to-one mapping, optional column for future GitLab support)
- [ ] **GHUB-02**: Email-signup users can connect GitHub account from settings
- [ ] **GHUB-03**: Barae receives GitHub App installation webhooks (created, deleted) and updates internal state
- [ ] **GHUB-04**: User can view which orgs/accounts have the Barae GitHub App installed
- [ ] **GHUB-05**: User can see repositories accessible through their GitHub App installations
- [ ] **GHUB-06**: Domain models for GitHub accounts and installations are designed and implemented

### Infrastructure

- [ ] **INFR-01**: Separate Docker Compose files per environment (dev, test, prod)
- [ ] **INFR-02**: Caddy reverse proxy in dev — port 8100, proxies Vite frontend + `/api/` to Fastify backend
- [ ] **INFR-03**: Caddy reverse proxy in prod — serves static frontend files, proxies `/api/` to Fastify
- [ ] **INFR-04**: Backend Dockerfile with proper entrypoint and migration handling
- [ ] **INFR-05**: Environment configuration complete and documented

### Testing

- [ ] **TEST-01**: Backend API tests using Vitest (route and handler testing, business-critical paths)
- [ ] **TEST-02**: Frontend component tests using Vitest (critical UI components only)
- [ ] **TEST-03**: E2E tests using Cypress (core user flows — auth, GitHub linking)
- [ ] **TEST-04**: CI pipeline runs all tests on main branch commits and PR events (not every branch push)

### Codebase Standards

- [ ] **STND-01**: `.planning/codebase/` contains user-approved patterns and structure docs
- [ ] **STND-02**: Standards captured from user conversations throughout development

### Frontend

- [ ] **FRNT-01**: Login page with email/password and GitHub OAuth option
- [ ] **FRNT-02**: Signup page with email/password
- [ ] **FRNT-03**: OTP email verification page
- [ ] **FRNT-04**: Password reset flow (request + reset pages)
- [ ] **FRNT-05**: Dashboard shell with navigation layout (pluggable for future features)
- [ ] **FRNT-06**: GitHub account linking page in settings
- [ ] **FRNT-07**: GitHub installations and accessible repos view

## v2 Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Notifications

- **NOTF-01**: Email notifications for account events

### Additional Auth

- **AUTH-09**: Magic link login
- **AUTH-10**: Two-factor authentication (TOTP)

### Additional Integrations

- **GHUB-07**: GitLab account integration (schema prepared in v1)

## Out of Scope

Explicitly excluded from all milestones. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Sites & templates | Deferred — foundation must be solid first |
| Content management & editor | Deferred to future milestone |
| Themes & customization | Deferred to future milestone |
| SEO management | Deferred to future milestone |
| Image handling | Deferred — git storage for v1 |
| Social/feeds | Deferred to future milestone |
| Multiple hosting providers | GitHub Pages only for v1 (architected for extensibility) |
| Other OAuth providers (Google) | GitHub + email sufficient for v1 |
| Team collaboration | Single-user for v1 |
| Full-text search | Basic filtering for v1 |
| Scheduled publishing | Simple draft/published for v1 |
| Import/export tools | Content is in git, manual migration |
| Analytics | Users add their own (GA, Plausible) |
| Server-side Astro builds | GitHub Actions handles builds |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| AUTH-04 | Phase 4 | Pending |
| AUTH-05 | Phase 2 | Complete |
| AUTH-06 | Phase 2 | Complete |
| AUTH-07 | Phase 2 | Complete |
| AUTH-08 | Phase 2 | Complete |
| GHUB-01 | Phase 4 | Pending |
| GHUB-02 | Phase 4 | Pending |
| GHUB-03 | Phase 4 | Pending |
| GHUB-04 | Phase 4 | Pending |
| GHUB-05 | Phase 4 | Pending |
| GHUB-06 | Phase 4 | Pending |
| INFR-01 | Phase 1 | Complete |
| INFR-02 | Phase 1 | Complete |
| INFR-03 | Phase 1 | Complete |
| INFR-04 | Phase 1 | Complete |
| INFR-05 | Phase 1 | Complete |
| TEST-01 | Phase 6 | Pending |
| TEST-02 | Phase 6 | Pending |
| TEST-03 | Phase 6 | Pending |
| TEST-04 | Phase 6 | Pending |
| STND-01 | Phase 1 | Complete |
| STND-02 | Phase 1 | Complete |
| FRNT-01 | Phase 3 | Pending |
| FRNT-02 | Phase 3 | Pending |
| FRNT-03 | Phase 3 | Pending |
| FRNT-04 | Phase 3 | Pending |
| FRNT-05 | Phase 3 | Pending |
| FRNT-06 | Phase 5 | Pending |
| FRNT-07 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-05 after roadmap creation*
