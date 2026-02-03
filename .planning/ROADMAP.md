# Roadmap: Barae

## Overview

Barae delivers a git-backed blogging platform in 4 phases: authenticate users, connect their GitHub, create sites from templates, and enable content editing. Each phase builds on the previous, progressing from foundation to the complete create-edit-publish flow. Milestone 1 covers the core MVP (38 requirements).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Auth** - User authentication with dashboard shell
- [x] **Phase 1.1: Code Refactoring** - Improve code quality before proceeding (INSERTED)
- [x] **Phase 1.2: Code Review** - Thoroughly review implemented code for quality and issues (INSERTED)
- [x] **Phase 1.3: Review Fixes** - Address recommendations from code review before Phase 2 (INSERTED)
- [ ] **Phase 2: GitHub Integration** - GitHub App installation and repo access
- [ ] **Phase 3: Sites & Templates** - Site creation with Astro templates and GitHub Pages
- [ ] **Phase 4: Content & Editor** - Content management with dual-mode editor

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: Users can securely access Barae and navigate a responsive dashboard
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. User can create account with email/password and verify via email link
  2. User can log in with email/password or GitHub OAuth
  3. User session persists across browser sessions (stays logged in)
  4. User can reset forgotten password via email
  5. Dashboard is responsive and works on mobile devices
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Backend auth setup with better-auth + Frontend scaffold with Vite
- [x] 01-02-PLAN.md — Auth UI (login/signup/OAuth) + Email integration (SMTP/Nodemailer)
- [x] 01-03-PLAN.md — Dashboard shell with responsive navigation + Settings page

### Phase 1.1: Code Refactoring (INSERTED)
**Goal**: Improve code quality and structure before building on the foundation
**Depends on**: Phase 1
**Requirements**: None (technical debt / quality improvement)
**Success Criteria** (what must be TRUE):
  1. Code follows consistent patterns and conventions ✓
  2. Components are properly organized and reusable ✓
  3. No unnecessary complexity or dead code ✓
  4. Clear separation of concerns ✓
**Plans**: 1 plan (completed)

Plans:
- [x] 01.1-01: Backend refactoring (single DB, versioned routes, plugin patterns, infra docs)

### Phase 1.2: Code Review (INSERTED)
**Goal**: Thoroughly review all implemented code for quality, patterns, and potential issues
**Depends on**: Phase 1.1
**Requirements**: None (quality assurance)
**Success Criteria** (what must be TRUE):
  1. All code reviewed for quality, consistency, and best practices
  2. Potential bugs, security issues, or performance problems identified
  3. Code patterns documented and any anti-patterns flagged
  4. Recommendations provided for improvements
**Plans**: 3 plans

Plans:
- [x] 01.2-01-PLAN.md — Backend security audit and architecture review (14 files)
- [x] 01.2-02-PLAN.md — Frontend auth, dashboard, and routing review (25 files)
- [x] 01.2-03-PLAN.md — Shared components, settings review, and consolidated report (14 files)

### Phase 1.3: Review Fixes (INSERTED)
**Goal**: Address important recommendations from Phase 1.2 code review before continuing
**Depends on**: Phase 1.2
**Requirements**: None (quality improvements based on code review findings)
**Success Criteria** (what must be TRUE):
  1. Rate limiting added to /resend-verification endpoint (3 requests/hour/user)
  2. APP_SECRET validation requires minimum 32 characters
  3. ErrorBoundary added at React app root
  4. Header logo uses React Router Link instead of anchor tag
**Plans**: 1 plan

Plans:
- [x] 01.3-01-PLAN.md — Implement code review recommendations (rate limiting, APP_SECRET validation, ErrorBoundary, Header fix)

### Phase 2: GitHub Integration
**Goal**: Barae can operate on user's GitHub repositories via installed App
**Depends on**: Phase 1
**Requirements**: GHUB-01, GHUB-02, GHUB-03, GHUB-04, GHUB-05, GHUB-06, GHUB-07
**Success Criteria** (what must be TRUE):
  1. User can install Barae GitHub App to their account
  2. User can select which repositories the App can access
  3. Barae can create repositories and read/write files on user's behalf
  4. Installation tokens refresh automatically (no user action required)
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Sites & Templates
**Goal**: Users can create Astro blog sites deployed to GitHub Pages
**Depends on**: Phase 2
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, SITE-06, SITE-07, FEED-01
**Success Criteria** (what must be TRUE):
  1. User can create a new site (new repo or connect existing)
  2. Site uses selected theme and is a standard Astro project
  3. GitHub Actions builds site automatically on push
  4. Site is live on GitHub Pages after creation
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Content & Editor
**Goal**: Users can create and edit content with dual-mode editor
**Depends on**: Phase 3
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, EDIT-06, EDIT-07, IMG-01, IMG-02
**Success Criteria** (what must be TRUE):
  1. User can create, edit, and delete blog posts and static pages
  2. User can write in raw markdown or visual mode, toggling between them
  3. Changes sync correctly between modes without data loss
  4. User can upload images that are stored in the git repo
  5. Content changes commit to user's GitHub repository
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 1.1 -> 1.2 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 3/3 | Complete | 2026-02-03 |
| 1.1 Code Refactoring | 1/1 | Complete | 2026-02-03 |
| 1.2 Code Review | 3/3 | Complete | 2026-02-04 |
| 1.3 Review Fixes | 1/1 | Complete | 2026-02-04 |
| 2. GitHub Integration | 0/2 | Not started | - |
| 3. Sites & Templates | 0/2 | Not started | - |
| 4. Content & Editor | 0/3 | Not started | - |
