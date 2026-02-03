# Roadmap: Barae

## Overview

Barae delivers a git-backed blogging platform in 4 phases: authenticate users, connect their GitHub, create sites from templates, and enable content editing. Each phase builds on the previous, progressing from foundation to the complete create-edit-publish flow. Milestone 1 covers the core MVP (38 requirements).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Auth** - User authentication with dashboard shell
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
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD
- [ ] 01-03: TBD

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
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 0/3 | Not started | - |
| 2. GitHub Integration | 0/2 | Not started | - |
| 3. Sites & Templates | 0/2 | Not started | - |
| 4. Content & Editor | 0/3 | Not started | - |
