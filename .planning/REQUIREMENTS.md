# Requirements: Barae

**Defined:** 2026-02-03
**Core Value:** Users own their content in git — standard Astro projects, portable, not locked into Barae.

## Milestone 1: Core MVP

Essential end-to-end flow: login → connect/create repo → pick theme → add content → publish.

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User receives email verification after signup
- [ ] **AUTH-03**: User can log in with email/password
- [ ] **AUTH-04**: User can log in with GitHub OAuth
- [ ] **AUTH-05**: User can reset password via email link
- [ ] **AUTH-06**: User session persists across browser sessions
- [ ] **AUTH-07**: User can log out from any page

### GitHub Integration

- [ ] **GHUB-01**: User can install Barae GitHub App to their account
- [ ] **GHUB-02**: User can select which repositories App has access to
- [ ] **GHUB-03**: Barae can create new repositories in user's GitHub account
- [ ] **GHUB-04**: Barae can read and write files to user's repositories
- [ ] **GHUB-05**: Barae can configure GitHub Actions workflow in repository
- [ ] **GHUB-06**: Barae can enable GitHub Pages for repository
- [ ] **GHUB-07**: GitHub App handles token refresh automatically (1-hour expiry)

### Sites & Templates

- [ ] **SITE-01**: User can create a new site (create new repo OR connect existing)
- [ ] **SITE-02**: User can select from preset themes
- [ ] **SITE-03**: Site creation configures GitHub Actions for Astro builds
- [ ] **SITE-04**: Site creation enables GitHub Pages deployment
- [ ] **SITE-05**: User can have multiple sites
- [ ] **SITE-06**: User can delete a site (removes from Barae, repo remains)
- [ ] **SITE-07**: Each site is a standard Astro project editable outside Barae

### Content Management

- [ ] **CONT-01**: User can create blog posts with title, date, and content
- [ ] **CONT-02**: User can add tags to blog posts
- [ ] **CONT-03**: User can create static pages (about, contact, custom)
- [ ] **CONT-04**: User can edit existing content
- [ ] **CONT-05**: User can delete content
- [ ] **CONT-06**: User can save content as draft (not published)
- [ ] **CONT-07**: User can publish draft content
- [ ] **CONT-08**: Content changes commit to user's GitHub repository

### Editor

- [ ] **EDIT-01**: User can write content in raw markdown mode
- [ ] **EDIT-02**: User can edit content in visual mode (click-to-edit)
- [ ] **EDIT-03**: User can toggle between markdown and visual modes
- [ ] **EDIT-04**: Visual mode only supports features that work in markdown
- [ ] **EDIT-05**: Split-view shows live preview alongside editor
- [ ] **EDIT-06**: Editor supports code blocks with syntax highlighting
- [ ] **EDIT-07**: Changes sync between markdown and visual modes

### Images

- [ ] **IMG-01**: User can upload images in editor
- [ ] **IMG-02**: Images are stored in git repo (public/images/)

### Dashboard & Frontend

- [ ] **DASH-01**: React + Vite dashboard for all user interactions
- [ ] **DASH-02**: Dashboard is fully responsive
- [ ] **DASH-03**: Dashboard and editor work well on mobile devices

### Feeds

- [ ] **FEED-01**: Sites have automatic RSS feed generation

**Milestone 1 Total: 38 requirements**

---

## Milestone 2: Full Feature Set

Enhanced features after core MVP is validated.

### Templates

- [ ] **TMPL-01**: "Personal Dev Site" template (portfolio + blog + about)
- [ ] **TMPL-02**: "Product Site" template (landing + features + about + blog)

### Content — Portfolio

- [ ] **PORT-01**: User can create portfolio/project items
- [ ] **PORT-02**: Portfolio items have title, description, images, links
- [ ] **PORT-03**: User can order portfolio items

### Content — Advanced

- [ ] **CONT-09**: User can filter content by title
- [ ] **CONT-10**: User can filter content by tags
- [ ] **CONT-11**: User can filter content by date
- [ ] **CONT-12**: User can manage tags (create, rename, delete)

### Editor — MDX

- [ ] **EDIT-08**: Editor supports MDX (React components in markdown)
- [ ] **EDIT-09**: Editor supports callouts/alerts components
- [ ] **EDIT-10**: Editor supports embeds (YouTube, Twitter, etc.)

### Themes & Customization

- [ ] **THME-01**: User can customize logo
- [ ] **THME-02**: User can customize color scheme
- [ ] **THME-03**: User can customize fonts
- [ ] **THME-04**: Theme customizations are committed to user's repo

### SEO

- [ ] **SEO-01**: Templates auto-generate meta title from content
- [ ] **SEO-02**: Templates auto-generate meta description from content
- [ ] **SEO-03**: User can override meta title per page
- [ ] **SEO-04**: User can override meta description per page
- [ ] **SEO-05**: Templates auto-generate OG images
- [ ] **SEO-06**: Templates include Twitter card meta tags
- [ ] **SEO-07**: Templates generate JSON-LD structured data
- [ ] **SEO-08**: Templates generate sitemap.xml automatically
- [ ] **SEO-09**: Templates generate robots.txt automatically

### Images — Advanced

- [ ] **IMG-03**: Images are compressed before commit (Sharp)
- [ ] **IMG-04**: Uploaded images use unique filenames (prevent conflicts)

### Social Media

- [ ] **SOCL-01**: User can configure which social share buttons to show
- [ ] **SOCL-02**: User can connect LinkedIn account for auto-posting
- [ ] **SOCL-03**: User can connect Twitter/X account for auto-posting
- [ ] **SOCL-04**: Published posts auto-share to connected platforms (site-wide default)
- [ ] **SOCL-05**: User can disable auto-share per post
- [ ] **SOCL-06**: User can generate manual share links for any platform

### Documentation

- [ ] **DOCS-01**: In-app documentation for custom domain setup

**Milestone 2 Total: 29 requirements**

---

## Future (v3+)

Deferred beyond Milestone 2.

### Hosting Expansion

- **HOST-01**: Support Vercel deployment
- **HOST-02**: Support Netlify deployment
- **HOST-03**: Support Cloudflare Pages deployment

### Advanced Features

- **ADV-01**: Scheduled post publishing
- **ADV-02**: Full-text search across content
- **ADV-03**: Team collaboration (multiple editors)
- **ADV-04**: Custom CSS injection in dashboard
- **ADV-05**: Google OAuth login
- **ADV-06**: Instagram auto-posting (requires business account)

### Import/Export

- **IMEX-01**: Import from WordPress
- **IMEX-02**: Import from Medium
- **IMEX-03**: Import from Ghost

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Server-side Astro builds | GitHub Actions handles builds — eliminates infrastructure |
| Built-in analytics | Users add their own (GA, Plausible) — not core to value |
| External image hosting (S3, R2) | Git storage keeps everything portable — accept repo size |
| Real-time collaboration | Single-user — complexity not justified |
| WYSIWYG-only editor | Dual-mode is the differentiator — power users need markdown |
| Custom content types | Blog + pages + portfolio covers 90% of use cases |
| E-commerce features | Not a store builder — focused on content |
| Comment system | Users add Disqus/Giscus — not core to value |

## Traceability

Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-* | TBD | Pending |
| GHUB-* | TBD | Pending |
| SITE-* | TBD | Pending |
| CONT-* | TBD | Pending |
| EDIT-* | TBD | Pending |
| IMG-* | TBD | Pending |
| DASH-* | TBD | Pending |
| FEED-* | TBD | Pending |

**Milestone 1 Coverage:**
- Requirements: 38 total
- Mapped to phases: 0 (pending roadmap)

---
*Requirements defined: 2026-02-03*
*Last updated: 2026-02-03 — split into Milestone 1 (Core MVP) and Milestone 2 (Full Features)*
