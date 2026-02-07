# Barae — Product Bible

## What It Is

Barae is a git-backed blogging and portfolio platform. Users create and manage content through Barae's dashboard — writing in a dual-mode editor (raw markdown or visual), customizing themes, managing SEO, managing social media posts — and everything lives in their own GitHub repository. Sites are built via GitHub Actions and hosted on GitHub Pages. Users own standard Astro projects they can edit with or without Barae.

Barae can be used as a hosted service or self-hosted on your own infrastructure.

## Who It's For

- Developers, creators, and small businesses who want a blog, portfolio, or product site without the maintenance overhead and vendor lock-in.
- People helping their non-technical family members and friends build blogs or portfolios, and let them take over.

Git knowledge isn't required, but power users can extend their sites directly.

## Value Proposition

**Built for long-term maintenance, not just initial site creation.** Users own their content in git — standard Astro projects, portable, not locked into Barae. The repo works with or without Barae.

**LLM-ready with guardrails.** AI instructions are included in templates so users can extend their sites with tools like Claude or Cursor. Strict repo structure and verification scripts before commits and in CI/CD make it easier for AI agents to verify their work, preventing them from breaking stuff.

## Problems We Solve

- **Vendor lock-in**: Content trapped in proprietary CMS platforms with no portable export
- **Maintenance burden**: Sites that are easy to launch but painful to maintain long-term
- **Technical barrier**: Non-technical users need help getting started but should be able to take over
- **AI fragility**: AI tools can break sites without guardrails — Barae templates include verification and structure

## Features

### Implemented
- Fastify backend with TypeScript and TypeBox validation
- PostgreSQL database with Drizzle ORM
- Plugin-based modular architecture
- Environment configuration with validation (`@fastify/env`)
- Docker containerization (dev, prod, test compose files)
- Caddy reverse proxy (dev HTTP, prod auto-HTTPS)
- Email/password authentication with OTP verification (better-auth)
- Dashboard shell with auth flow (login, signup, OTP verify, password reset)
- Session management with polling and expiry detection
- Auth UI: form validation, error handling, lockout protection, GitHub OAuth button (disabled, coming soon)

### Planned — Milestone 1: Foundation & Integration
- GitHub App OAuth login (single GitHub App for auth + repo access)
- GitHub account/installation management UI
- Production-ready Docker setup with proper entrypoint and migration handling
- Testing infrastructure (API tests, component tests, E2E, CI pipeline)

### Future Milestones
- Sites & templates (Astro project scaffolding, forking to user repos)
- Content management (posts, pages, media)
- Dual-mode editor (raw markdown + visual editing)
- Themes and customization
- SEO management
- Image handling (git storage)
- Social media / feeds
- Hosting configuration (GitHub Pages, extensible to Vercel/Netlify/Cloudflare)

## Technical Architecture

- **Backend**: Fastify 5 + TypeScript + Drizzle ORM + better-auth
- **Frontend**: React 19 + Vite 7 + Tailwind CSS 4 + shadcn/ui
- **Database**: PostgreSQL 17
- **Infrastructure**: Docker Compose + Caddy reverse proxy
- **Auth**: better-auth (email/password, OTP, sessions, future GitHub OAuth)
- **Templates**: Astro-based, maintained by Barae, forked to user repos
- **Builds**: GitHub Actions (no server-side builds)
- **Hosting**: GitHub Pages (v1), extensible later

## Constraints

- **GitHub App permissions**: Need repo creation, Actions write, Pages configuration
- **Git storage for images**: Repo size will grow — basic compression helps but no external CDN
- **GitHub Pages limits**: 1GB repo size, 100GB/month bandwidth (sufficient for most blogs)
- **MDX complexity**: Full MDX support means users can break their sites with bad React
- **Existing stack**: Backend must use existing Fastify/Drizzle/PostgreSQL setup
- **Hosting extensibility**: GitHub Pages only for v1, but architecture must support Vercel/Netlify/Cloudflare later

## Out of Scope

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

## Templates

1. **Personal Dev Site**: Portfolio showcase, blog, about page
2. **Product Site**: Landing page, features, about, blog

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-05 | Prefer stable open-source libraries | Don't reinvent the wheel — use battle-tested libraries that scale |
| 2026-02-05 | better-auth for authentication | Full-featured auth library with Drizzle adapter, email/password, OAuth, sessions out of the box |
| 2026-02-05 | Single GitHub App for auth + repo access | One app handles OAuth login and repo access — no separate OAuth App needed |
| 2026-02-05 | GitHub Actions for builds | Users don't need Barae running to build — eliminates server-side build infrastructure |
| 2026-02-05 | GitHub Pages for hosting | Free, integrated with GitHub, sufficient for blogs |
| 2026-02-05 | Git for image storage | Simple, portable, user owns everything — accept repo size tradeoff |
| 2026-02-05 | Dual-mode editor | Power users get raw markdown, casual users get visual editing |
| 2026-02-05 | MDX support | Full React component support for advanced users |
| 2026-02-05 | Astro for templates | Static by default, content collections, island architecture |
| 2026-02-05 | React + Vite for dashboard | Simple, fast, widely known |
| 2026-02-05 | Caddy reverse proxy for dev and prod | Port 8100 in dev, auto-HTTPS in prod |
| 2026-02-05 | Testing deferred to Phase 6 | Test after all features are built |
| 2026-02-05 | Config via @fastify/env plugin | Accessed as fastify.config after plugin registration |
| 2026-02-05 | No CORS — Caddy handles proxying | Removed @fastify/cors |
| 2026-02-05 | TypeScript very strict mode | noUncheckedIndexedAccess + exactOptionalPropertyTypes |
| 2026-02-05 | close-with-grace for shutdown | Replaces manual process.on signal handlers |
| 2026-02-05 | Routes co-located with features | src/auth/routes.ts, not src/routes/ |
| 2026-02-05 | API versioning enforced: /v1/ | All routes under /v1/, AUTH_BASE_URL includes /api/v1 |
| 2026-02-07 | Auth view state machine uses Zustand | login/signup/verify-otp/forgot-password/reset-password |
| 2026-02-07 | OTP lockout stored in localStorage | 30min / 3 attempts under barae:otp-lockout |
| 2026-02-07 | AuthErrorBanner for form errors, no toasts | Alert destructive pattern for auth forms |
| 2026-02-07 | GitHub OAuth button disabled with "Coming soon" | On both login and signup forms |
| 2026-02-07 | All authClient calls wrapped in try-catch | Generic "Something went wrong" error fallback |
| 2026-02-07 | Custom workflow replacing GSD | Lighter workflow: PRODUCT + CURRENT_FOCUS + TASKS |
