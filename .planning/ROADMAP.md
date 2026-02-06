# Roadmap: Barae

## Overview

Milestone 1 delivers the foundation for Barae: working dev/prod infrastructure, complete authentication (email/password + GitHub OAuth), GitHub App integration with account linking and installation management, a dashboard shell with all auth and GitHub UI flows, and automated testing with CI. By the end, a user can sign up, verify their email, log in (via credentials or GitHub), link their GitHub account, view installations, and browse accessible repositories -- all tested and running in both development and production configurations.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Dev Environment & Infrastructure** - Working dev/prod stack with Docker, Caddy, migrations, and initial codebase standards
- [x] **Phase 2: Auth Backend** - Complete authentication API with email/password, OTP, sessions, and password reset
- [x] **Phase 2.1: Review & Standards Update** (INSERTED) - Full review of Phase 1 & 2 code, patterns, and standards documentation
- [x] **Phase 3: Dashboard Shell & Auth Frontend** - Browser-based auth flows and the pluggable dashboard navigation shell
- [ ] **Phase 4: GitHub App Integration** - GitHub OAuth login, account linking, webhook processing, installation and repo management
- [ ] **Phase 5: GitHub Frontend** - Dashboard pages for GitHub account linking and installation/repo browsing
- [ ] **Phase 6: Testing & CI** - Automated test suites and CI pipeline for regression prevention

## Phase Details

### Phase 1: Dev Environment & Infrastructure
**Goal**: The development and production environments are fully operational and documented
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04, INFR-05, STND-01, STND-02
**Success Criteria** (what must be TRUE):
  1. Running `docker compose up` starts the full dev stack (Fastify backend, Vite frontend, PostgreSQL, Caddy) accessible at localhost:8100
  2. Caddy proxies frontend requests and routes `/api/` to the Fastify backend in both dev and prod configurations
  3. Database migration script (`backend/scripts/migrate.ts`) exists and can be run independently to apply migrations
  4. `.planning/codebase/` contains the initial project structure and pattern documentation
  5. Environment variables are validated on startup with clear error messages for missing/invalid values
**Plans**: 4 plans, 4 waves (sequential — one wave per execution, clear context between waves)

Plans:
- [x] 01-01-PLAN.md [wave 1] -- Backend foundation (config rewrite, TypeScript strictness, migration script, shared/ scaffold)
- [x] 01-02-PLAN.md [wave 2] -- Frontend foundation (shadcn/ui, Vite config, path aliases, directory structure)
- [x] 01-03-PLAN.md [wave 3] -- Docker & Caddy infrastructure (Caddy configs, root Dockerfiles, compose rewrites)
- [ ] 01-04-PLAN.md [wave 4] -- Integration verification (STANDARDS.md update, user verifies dev stack)

### Phase 2: Auth Backend
**Goal**: Users can create accounts, authenticate, and manage sessions through the API
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-05, AUTH-06, AUTH-07, AUTH-08
**Success Criteria** (what must be TRUE):
  1. A new user can register with email/password and receives an OTP verification email
  2. A verified user can log in with email/password and receives a session token
  3. A user who forgot their password can request and complete a password reset via email
  4. User sessions persist across browser closes and can be listed and individually revoked
  5. A logged-in user can log out, invalidating their current session
**Plans**: 2 plans, 2 waves (sequential -- one wave per execution, clear context between waves)

Plans:
- [x] 02-01-PLAN.md [wave 1] -- Database foundation & config (standalone Drizzle client, auth schema, migration, AUTH_BASE_URL config)
- [x] 02-02-PLAN.md [wave 2] -- better-auth integration (email transport, auth instance, Fastify route, frontend auth client)

### Phase 2.1: Review & Standards Update (INSERTED)
**Goal**: All Phase 1 & 2 code, architecture, and patterns are reviewed for quality and consistency; codebase standards documentation is added and updated to reflect what was built
**Depends on**: Phase 2
**Requirements**: STND-01, STND-02 (review & update)
**Success Criteria** (what must be TRUE):
  1. All Phase 1 & 2 code has been reviewed for consistency, correctness, and adherence to project patterns
  2. Identified issues (code quality, missed patterns, inconsistencies) are documented and fixed
  3. `.planning/codebase/` standards documents are updated to reflect actual patterns established in Phases 1 & 2
  4. `.claude/` instructions are updated with any new conventions or rules discovered during review
  5. Technical debt or deferred items are captured as todos for future phases
**Plans**: 4 plans, 3 waves (wave 1 parallel, then sequential — one wave per execution, clear context between waves)

Plans:
- [x] 02.1-01-PLAN.md [wave 1] — Standards documentation (create backend.md, frontend.md, typescript.md, docker.md, dependencies.md, migrations.md + CLAUDE.md)
- [x] 02.1-02-PLAN.md [wave 1] — Backend cleanup (remove unused deps, fix eslint, rename migration)
- [x] 02.1-03-PLAN.md [wave 2] — Config refactor (@fastify/env, plugin-scoped db+auth init, close-with-grace, fix email error handling)
- [x] 02.1-04-PLAN.md [wave 3] — Final sync (update standards docs to match actual code, update STATE.md, human verification)

### Phase 3: Dashboard Shell & Auth Frontend
**Goal**: Users can sign up, verify, log in, reset password, and navigate a dashboard through the browser
**Depends on**: Phase 2
**Requirements**: FRNT-01, FRNT-02, FRNT-03, FRNT-04, FRNT-05
**Success Criteria** (what must be TRUE):
  1. A visitor can sign up with email/password and complete OTP email verification in the browser
  2. A returning user can log in with email/password (with GitHub OAuth button visible for Phase 4)
  3. A user who forgot their password can request and complete a reset through the browser
  4. An authenticated user sees a dashboard with navigation layout that serves as the shell for all future features
**Plans**: 4 plans, 3 waves (wave 1 sequential, wave 2 parallel, wave 3 sequential — one wave per execution, clear context between waves)

Plans:
- [x] 03-01-PLAN.md [wave 1] — Foundation & routing infrastructure (shadcn/ui install, schemas, store, routes, layouts, app integration)
- [x] 03-02-PLAN.md [wave 2] — Auth page & forms (login, signup, OTP verification, forgot-password, reset-password)
- [x] 03-03-PLAN.md [wave 2] — Dashboard shell & pages (responsive layout, header, nav, user menu, home, settings, session management)
- [x] 03-04-PLAN.md [wave 3] — Integration & verification (session-expired message, human verification of all flows)

### Phase 4: GitHub App Integration
**Goal**: Users can log in via GitHub OAuth and link their GitHub account to manage installations
**Depends on**: Phase 2
**Requirements**: AUTH-04, GHUB-01, GHUB-02, GHUB-03, GHUB-04, GHUB-05, GHUB-06
**Success Criteria** (what must be TRUE):
  1. A user can log in via GitHub OAuth, creating a Barae account if none exists
  2. An email-signup user can link their GitHub account from settings (one-to-one mapping)
  3. The system processes GitHub App installation webhooks and reflects installation status internally
  4. A user can view which GitHub orgs/accounts have the Barae App installed and see accessible repositories
  5. Domain models for GitHub accounts and installations persist correctly with proper relationships
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: GitHub Frontend
**Goal**: Users can manage their GitHub connection and view installations through the dashboard
**Depends on**: Phase 3, Phase 4
**Requirements**: FRNT-06, FRNT-07
**Success Criteria** (what must be TRUE):
  1. A user can navigate to settings and link/view their connected GitHub account
  2. A user can view their GitHub App installations and browse accessible repositories per installation
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Testing & CI
**Goal**: The codebase has automated test coverage and a CI pipeline that catches regressions
**Depends on**: Phase 3, Phase 5
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. Backend API tests verify auth and GitHub integration routes (run via `vitest`)
  2. Frontend component tests verify critical UI components render and behave correctly
  3. E2E tests walk through core user flows (signup, login, GitHub linking) in a real browser
  4. CI pipeline runs all test suites on main branch commits and pull request events, reporting pass/fail status
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 2.1 -> 3 -> 4 -> 5 -> 6
Note: Phases 3 and 4 both depend on Phase 2. Phase 4 can begin once Phase 2 completes (it does not need Phase 3). Phase 5 needs both Phase 3 (dashboard shell) and Phase 4 (GitHub backend).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Dev Environment & Infrastructure | 4/4 | Complete | 2026-02-05 |
| 2. Auth Backend | 2/2 | Complete | 2026-02-05 |
| 2.1. Review & Standards Update (INSERTED) | 4/4 | Complete | 2026-02-06 |
| 3. Dashboard Shell & Auth Frontend | 4/4 | Complete | 2026-02-07 |
| 4. GitHub App Integration | 0/TBD | Not started | - |
| 5. GitHub Frontend | 0/TBD | Not started | - |
| 6. Testing & CI | 0/TBD | Not started | - |
