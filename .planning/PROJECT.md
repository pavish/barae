# Barae

## What This Is

Barae is a git-backed blogging and portfolio platform with a hosted CMS experience. Users create and manage content through Barae's dashboard — writing in a dual-mode editor (raw markdown or visual), customizing themes, managing SEO — and everything lives in their own GitHub repository. Sites are built via GitHub Actions and hosted on GitHub Pages. Users own standard Astro projects they can edit with or without Barae.

The platform is for developers, creators, and small businesses who want a polished blog or portfolio without vendor lock-in. Git knowledge isn't required, but power users can extend their sites directly.

## Core Value

**Users own their content in git** — standard Astro projects, portable, not locked into Barae. The repo works with or without Barae, but people prefer Barae for its ease of use and great UX.

## Requirements

### Validated

- ✓ Fastify backend with TypeScript and TypeBox validation — existing
- ✓ PostgreSQL database with Drizzle ORM — existing
- ✓ Plugin-based modular architecture — existing
- ✓ Environment configuration with validation — existing
- ✓ Docker containerization support — existing

### Active

**Authentication**
- [ ] User can sign up with email/password
- [ ] User can log in with GitHub OAuth
- [ ] User session persists across browser sessions
- [ ] User can reset password via email

**GitHub Integration**
- [ ] User installs Barae GitHub App for repo access
- [ ] User can create new repos from Barae templates
- [ ] Barae configures GitHub Actions for Astro builds
- [ ] Barae configures GitHub Pages deployment

**Sites & Templates**
- [ ] User can create unlimited sites
- [ ] User chooses from curated templates (Personal Dev Site, Product Site)
- [ ] Each site is a standard Astro project in user's GitHub repo

**Content Management**
- [ ] User can create blog posts with title, date, tags, content
- [ ] User can create static pages (about, contact, etc.)
- [ ] User can create portfolio/project items
- [ ] User can save content as draft or published
- [ ] User can filter content by title, tags, date
- [ ] User can manage tags (create, edit, delete)

**Editor**
- [ ] User can write in raw markdown mode
- [ ] User can edit visually on rendered preview (click-to-edit)
- [ ] User can toggle between modes
- [ ] Split-view shows live preview alongside editor
- [ ] Editor supports MDX (React components in markdown)
- [ ] Editor supports Barae components (code blocks, callouts, embeds)
- [ ] Editor works well on mobile

**Themes & Customization**
- [ ] User can select from curated themes
- [ ] User can customize visual settings (colors, fonts, logo)
- [ ] User can inject custom CSS
- [ ] Changes reflect in live preview

**SEO**
- [ ] User can set meta title/description per page
- [ ] Templates generate OG images automatically
- [ ] Templates include Twitter card meta tags
- [ ] Templates generate JSON-LD structured data
- [ ] Templates generate sitemap.xml
- [ ] Templates generate robots.txt

**Images**
- [ ] User can upload images in editor
- [ ] Images are compressed before commit
- [ ] Images stored in git repo (public/ directory)

**Social & Feeds**
- [ ] Sites have automatic RSS feed
- [ ] User can configure social share buttons (which platforms to show)

**Hosting**
- [ ] GitHub Pages deployment works out of the box
- [ ] In-app documentation guides custom domain setup

**Frontend Dashboard**
- [ ] React + Vite dashboard for all user interactions
- [ ] Dashboard is responsive and mobile-friendly

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

**Existing codebase:**
- Backend scaffold with Fastify 5.7, TypeScript 5.9, Drizzle ORM
- PostgreSQL 18 database, Docker Compose for local dev
- Users table exists but no auth implementation yet
- Plugin architecture ready for feature modules
- No frontend yet — needs to be built

**Technical approach:**
- **Library-first**: Use stable, maintained open-source libraries instead of custom implementations
- **better-auth** for authentication (email/password, GitHub OAuth, sessions, Drizzle adapter)
- **GitHub App** for repo creation, Actions configuration, Pages deployment
- **React + Vite** for the dashboard frontend
- **Dual-mode editor**: raw markdown + visual editing (library TBD via research)
- **Astro templates** maintained by Barae, forked to user repos
- **Git-native design**: repos are standard Astro projects, no Barae lock-in

**Content model (in user's repo):**
- Blog posts: MDX files in `src/content/blog/`
- Static pages: MDX in `src/content/pages/`
- Portfolio items: MDX in `src/content/portfolio/`
- Site config: YAML/JSON in repo (standard Astro config)
- Images: stored in `public/images/`
- Custom CSS: stored in designated location

**Templates:**
1. **Personal Dev Site**: Portfolio showcase, blog, about page
2. **Product Site**: Landing page, features, about, blog

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
| GitHub App for repo access | Granular permissions, no token management, can create repos and configure Actions | ✓ Adopted |
| GitHub Actions for builds | Users don't need Barae running to build — eliminates server-side build infrastructure | ✓ Adopted |
| GitHub Pages for hosting | Free, integrated with GitHub, sufficient for blogs | ✓ Adopted |
| Git for image storage | Simple, portable, user owns everything — accept repo size tradeoff | ✓ Adopted |
| Dual-mode editor | Power users get raw markdown, casual users get visual editing | ✓ Adopted |
| MDX support | Full React component support for advanced users | ✓ Adopted |
| Astro for templates | Static by default, content collections, island architecture | ✓ Adopted |
| React + Vite for dashboard | Simple, fast, widely known | ✓ Adopted |

---
*Last updated: 2026-02-03 after comprehensive questioning*
