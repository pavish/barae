# Barae

## What This Is

Barae is a git-backed blogging and portfolio platform. Users create and manage content through Barae's dashboard — writing in a dual-mode editor (raw markdown or visual), customizing themes, managing SEO, managing social media posts — and everything lives in their own GitHub repository. Sites are built via GitHub Actions and hosted on GitHub Pages. Users own standard Astro projects they can edit with or without Barae.

Barae can be used as a hosted service or self-hosted on your own infrastructure.

The platform is for:
- Developers, creators, and small businesses who want a blog, portfolio, or product site without the maintenance overhead and vendor lock-in.
- People helping their non-technical family members and friends build blogs or portfolios, and let them take over.

Git knowledge isn't required, but power users can extend their sites directly.

## Core Value

**Built for long-term maintenance, not just initial site creation.** Users own their content in git — standard Astro projects, portable, not locked into Barae. The repo works with or without Barae.

**LLM-ready with guardrails.** AI instructions are included in templates so users can extend their sites with tools like Claude or Cursor. Strict repo structure and verification scripts before commits and in CI/CD make it easier for AI agents to verify their work, preventing them from breaking stuff.

## Requirements

### Validated

- ✓ Fastify backend with TypeScript and TypeBox validation — existing
- ✓ PostgreSQL database with Drizzle ORM — existing
- ✓ Plugin-based modular architecture — existing
- ✓ Environment configuration with validation — existing
- ✓ Docker containerization support — existing

### Active — Milestone 1: Foundation & Integration

**Authentication**
- [ ] User can sign up with email/password
- [ ] User can log in via GitHub App OAuth (single GitHub App for both auth and repo access)
- [ ] User session persists across browser sessions
- [ ] User can reset password via email

**GitHub App Integration**
- [ ] User installs Barae GitHub App (handles both OAuth login and repo access)
- [ ] User can add/manage GitHub accounts linked to their Barae account
- [ ] User can view GitHub App installations and their status
- [ ] Domain models for GitHub accounts and installations are designed and implemented

**Production Setup & Docker**
- [ ] Docker Compose configs are production-ready (dev, test, prod)
- [ ] Backend Dockerfile includes proper entrypoint and migration handling
- [ ] Environment configuration is complete and documented

**Testing Infrastructure**
- [ ] Backend API tests (route/handler testing)
- [ ] Frontend component tests
- [ ] E2E tests
- [ ] CI pipeline runs all tests on commits (feedback loop)

**Codebase Standards**
- [ ] `.planning/codebase/` contains user-approved patterns and structure docs
- [ ] Standards are captured from user conversations throughout development

**Frontend (basic)**
- [ ] Basic dashboard with auth flow (login, signup, password reset)
- [ ] GitHub account/installation management UI (enough to test the integration)

### Deferred — Future Milestones

Sites & templates, content management, editor, themes, SEO, images, social/feeds, hosting configuration — all deferred until foundation is solid.

### Out of Scope

- Server-side Astro builds — GitHub Actions handles builds
- Analytics — users add their own (GA, Plausible)
- Import/export tools — content is in git, manual migration
- Scheduled publishing — simple draft/published for v1
- Full-text search — basic filtering for v1
- Team collaboration — single-user for v1
- External image hosting (S3, Cloudflare R2) — git storage for v1
- Other OAuth providers (Google) — GitHub + email for v1
- Other hosting platforms — GitHub Pages only for v1 (but architected for extensibility)
- Strict WCAG compliance — best effort accessibility

## Context

**Existing codebase (skeleton only):**
- Backend: Fastify 5.7, TypeScript 5.9, Drizzle ORM — entry point, config plugin, db plugin, health check
- Frontend: React 19, Vite 7, Tailwind CSS 4 — entry point only, no components or routes
- PostgreSQL 17 database, Docker Compose for local dev (dev, test, prod configs)
- No schemas, no features, no migrations — clean slate for implementation
- Plugin architecture ready for feature modules

**Technical approach:**
- **Library-first**: Use stable, maintained open-source libraries instead of custom implementations
- **better-auth** for authentication (email/password, sessions, Drizzle adapter)
- **Single GitHub App** handles both OAuth login and repo access — no separate OAuth App
- **React + Vite** for the dashboard frontend
- **Dual-mode editor**: raw markdown + visual editing (library TBD via research)
- **Astro templates** maintained by Barae, forked to user repos
- **Git-native design**: repos are standard Astro projects, no Barae lock-in

**Templates:**
1. **Personal Dev Site**: Portfolio showcase, blog, about page
2. **Product Site**: Landing page, features, about, blog

## Development Standards

**Quality enforcement:**
- Always verify code against the codebase standards defined in `.planning/codebase/`, and project patterns
- Every code and pattern commit must be reviewed and approved by the user before proceeding
- Never assume implementation details early — ask the user for specifics when building anything new (feature design, data models, UI flows, API contracts)
- When in doubt about approach, present options and wait for direction rather than picking one

## Constraints

- **GitHub App permissions**: Need repo creation, Actions write, Pages configuration
- **Git storage for images**: Repo size will grow — basic compression helps but no external CDN
- **GitHub Pages limits**: 1GB repo size, 100GB/month bandwidth (sufficient for most blogs)
- **MDX complexity**: Full MDX support means users can break their sites with bad React
- **Existing stack**: Backend must use existing Fastify/Drizzle/PostgreSQL setup
- **Hosting extensibility**: GitHub Pages only for v1, but architecture must support Vercel/Netlify/Cloudflare later

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Prefer stable open-source libraries** | Don't reinvent the wheel — use battle-tested libraries that scale | ✓ Adopted |
| better-auth for authentication | Full-featured auth library with Drizzle adapter, email/password, OAuth, sessions out of the box | ✓ Adopted |
| Single GitHub App for auth + repo access | One app handles OAuth login and repo access — no separate OAuth App needed | ✓ Adopted |
| GitHub Actions for builds | Users don't need Barae running to build — eliminates server-side build infrastructure | ✓ Adopted |
| GitHub Pages for hosting | Free, integrated with GitHub, sufficient for blogs | ✓ Adopted |
| Git for image storage | Simple, portable, user owns everything — accept repo size tradeoff | ✓ Adopted |
| Dual-mode editor | Power users get raw markdown, casual users get visual editing | ✓ Adopted |
| MDX support | Full React component support for advanced users | ✓ Adopted |
| Astro for templates | Static by default, content collections, island architecture | ✓ Adopted |
| React + Vite for dashboard | Simple, fast, widely known | ✓ Adopted |

---
*Last updated: 2026-02-05 after milestone 1 scoping*
