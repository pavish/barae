# Project Research Summary

**Project:** Barae - Git-backed Blogging Platform
**Domain:** Git-based CMS with hosted editing experience
**Researched:** 2026-02-03
**Confidence:** HIGH

## Executive Summary

Barae is a git-backed blogging platform where users own standard Astro projects in their GitHub repositories. The platform bridges the gap between developer-first tools (TinaCMS, Decap CMS) and content creator needs through a dual-mode editor that genuinely serves both audiences. Users get a web dashboard for content editing (hosted or self-hosted) while maintaining full portability - their content lives in standard Astro projects they own, not in Barae's database.

Barae is purpose-built for long-term maintenance, not just initial site creation. It targets developers who find website maintenance tedious, and people helping non-technical family and friends build sites they can take over. LLM instructions are included in templates so users can extend sites with AI tools. Strict repo structure and verification scripts before commits and in CI/CD make it easier for AI agents to verify their work.

The recommended architecture separates four major concerns: (1) authentication via better-auth with native Drizzle support, (2) content editing through a React/Vite dashboard with MDXEditor for dual-mode Markdown/WYSIWYG, (3) git operations via GitHub App and Octokit, and (4) builds/hosting via GitHub Actions and GitHub Pages. The stack prioritizes mature, actively-maintained libraries that integrate cleanly with Barae's existing Fastify/Drizzle/PostgreSQL backend.

Key risks center on MDX security (user content is executable code), GitHub integration complexity (installation token expiration, rate limits, webhook timeouts), and repository bloat from images. These are well-understood challenges with documented mitigations: never render user MDX server-side, use Octokit SDK for automatic token management, implement async webhook processing, and compress images aggressively before commit. The domain has matured significantly - the recommended stack addresses lessons learned from earlier git-based CMS platforms that have since been deprecated (Forestry) or struggled with user experience (Decap's "limiting" editor).

## Key Findings

### Recommended Stack

The ecosystem has matured significantly. Better-auth provides production-ready authentication with native Drizzle adapter support. Octokit handles all GitHub API needs including automatic installation token refresh. MDXEditor is the clear choice for dual-mode markdown/MDX editing despite its 851KB gzipped bundle size - the alternative is months of custom development on Lexical or ProseMirror. Sharp dominates image compression with 4-5x faster performance than alternatives.

**Core technologies:**
- **better-auth (^1.4.15)**: Auth framework with built-in Drizzle adapter, email/password + GitHub OAuth, 2x-3x faster session queries with experimental joins
- **Octokit (^5.0.5) + @octokit/auth-app (^8.1.2)**: Full GitHub SDK with automatic installation token generation/renewal, handles JWT authentication for GitHub Apps
- **React 19 + Vite 7 + TanStack Query 5**: Frontend stack - Vite replaces deprecated CRA, React Router 7 SPA mode, TanStack Query for server state caching
- **MDXEditor (^3.52.3)**: Purpose-built MDX WYSIWYG editor, true inline formatting, built on Lexical framework - only mature option for dual-mode editing
- **Astro 5.16.x + @astrojs/mdx**: Static site generator with new Content Layer API (5x faster Markdown, 2x faster MDX builds), perfect for GitHub Pages deployment
- **Sharp (^0.34.5)**: Image processing powered by libvips, 4-5x faster than ImageMagick, essential for preventing repository bloat

**Critical version requirements:**
- Node.js 22+ (aligns with existing package.json requirement)
- better-auth Drizzle adapter requires `provider: "pg"` configuration
- Astro 5.x Content Layer uses `glob()` loader instead of old `type: "content"` pattern
- Tailwind v4 requires `@tailwindcss/vite` plugin, no config file needed

### Expected Features

Git-backed CMS platforms have established clear baseline expectations. Users expect both WYSIWYG editing (for non-technical users) and raw Markdown support (for developers), with the market bifurcating into tools that frustrate one audience or the other. Barae's opportunity is the dual-mode editor that genuinely serves both.

**Must have (table stakes):**
- Dual-mode Markdown/WYSIWYG editor with content preview
- Draft/publish states in frontmatter
- Media upload with drag-and-drop
- Git sync (two-way, content lives in user's repo)
- GitHub OAuth authentication
- SEO metadata (title, description, OG tags)
- RSS feed and sitemap generation (Astro provides automatically)
- Responsive design with dark/light mode

**Should have (competitive differentiators):**
- True portability - export complete Astro project, run anywhere without Barae
- One-click setup - connect repo, pick template, done (reduces friction vs manual Decap/TinaCMS setup)
- Mobile-responsive CMS (Decap has "terrible" mobile UX per user feedback, major market gap)
- Curated template quality for personal dev portfolio (about page, projects section, blog, contact, resume/CV)
- Image compression before commit (prevents repository bloat)

**Defer (v2+):**
- Product/landing page template (focus on personal dev portfolio first)
- Content scheduling (requires build trigger infrastructure)
- Real-time collaboration (high complexity, limited value for solo/small teams)
- AI writing assistance (enhancement, not core value prop)
- Multi-language/i18n support (complex, niche need initially)
- Non-dev editors without GitHub accounts (Decap's Git Gateway is deprecated, CloudCannon does this but adds complexity)

**Anti-features (explicitly avoid):**
- Database backend for content storage (defeats git-based value prop, creates lock-in)
- Custom template language (use standard Astro, users can customize or eject)
- Plugin marketplace (Decap shows this leads to fragmentation and maintenance hell)
- Complex editorial workflows (users turned off Decap's approval chains "after 15 minutes")
- Built-in comments system (use Giscus/GitHub Discussions instead)
- ~~Social media publishing~~ **Now in scope** - auto-posting to connected platforms

### Architecture Approach

Barae uses a clean separation of concerns: React dashboard talks to Fastify backend via REST API, backend uses GitHub App to operate on user repositories, GitHub Actions builds Astro sites, GitHub Pages hosts static output. Content lives in user repositories (MDX files), not in Barae's database - PostgreSQL only stores user accounts, site metadata, and GitHub installation mappings.

**Major components:**
1. **Fastify Backend** - Authentication (better-auth), API endpoints, GitHub App operations, business logic. Organized into feature modules: auth/, github/, sites/, content/
2. **GitHub App Integration** - Repository access via installation tokens (expire after 1 hour, Octokit auto-refreshes). Required permissions: Contents (R/W), Actions (R/W), Pages (R/W), Administration (R/W for repo creation), Metadata (R). Critical limitation: GitHub Apps cannot create repos from templates in user's personal account - workaround is create blank repo + push template content as initial commit
3. **React Dashboard (Vite)** - Content editing UI, site management, settings. Uses TanStack Query for server state, Zustand for client state, Tailwind v4 for styling
4. **Astro Templates in User Repos** - Standard Astro blog structure with GitHub Actions workflow (`.github/workflows/deploy.yml`), content collections in `src/content/blog/`, MDX files with YAML frontmatter
5. **PostgreSQL Database** - Users table (extended from better-auth), github_installations table (tracks installation_id per user), sites table (repo_full_name, template_type, custom_domain, pages_url)

**Key patterns:**
- **Content as Code**: MDX files are source of truth, not database. Read from GitHub on dashboard load, write to GitHub on save
- **Installation Token Caching**: Octokit handles automatically, caches up to 15,000 tokens
- **Optimistic UI Updates**: Update dashboard immediately, sync with backend async (TanStack Query pattern)
- **Webhook Signature Verification**: Use X-Hub-Signature-256 with HMAC validation, never accept unverified webhooks
- **Async Webhook Processing**: Acknowledge within milliseconds (GitHub 10-second timeout), queue actual processing with BullMQ

### Critical Pitfalls

Research identified 14 domain-specific pitfalls across severity levels. Top 5 critical ones that cause rewrites or data loss:

1. **GitHub App Installation Token Expiration** - Tokens expire after 1 hour. Applications that don't handle refresh fail silently. Prevention: use Octokit SDK with automatic token management, never cache tokens beyond single operation, implement validation before multi-step operations
2. **MDX User Content is Inherently Unsafe** - MDX allows arbitrary JavaScript execution. Prevention: never render user MDX on Barae's servers (all compilation in GitHub Actions), preview in sandboxed iframes, accept that MDX is user-owned code not user data
3. **Git Repository Bloat from Images** - Git stores every version of every file, images cause exponential growth. Prevention: compress aggressively with Sharp before commit, generate unique filenames instead of updating existing (prevent re-committing), implement 2MB upload limits, track repo size in dashboard
4. **Webhook 10-Second Response Timeout** - GitHub terminates connections after 10 seconds without 2XX response. Prevention: acknowledge immediately and return 200, queue processing with BullMQ, implement idempotency using X-GitHub-Delivery header, store raw payloads before processing
5. **Dual-Mode Editor State Synchronization** - Keeping Markdown and WYSIWYG views synchronized loses formatting or corrupts content with naive implementations. Prevention: use single AST as source of truth (MDXEditor does this with Lexical), don't convert between formats, test mode switching extensively

**Moderate pitfalls requiring attention:**
- GitHub rate limit exhaustion (5,000 requests/hour, monitor X-RateLimit-Remaining)
- Merge conflicts on concurrent edits (fetch before write, detect conflicts early, clear error messages)
- Astro template version drift (version templates explicitly, design for upgradeability)
- better-auth Fastify integration quirks (use community plugin, test OAuth flows end-to-end)
- GitHub Pages build timeouts (10-minute limit, pre-optimize images, cache node_modules)

## Implications for Roadmap

Based on research, suggested phase structure follows component dependencies and risk mitigation:

### Phase 1: Foundation & Authentication
**Rationale:** Everything depends on user authentication. Prove better-auth + Fastify integration works before building GitHub features. Addresses Pitfall #9 (better-auth Fastify quirks) early.

**Delivers:** Users can sign up with email/password, log in, access dashboard shell

**Addresses:**
- Authentication (table stakes feature)
- Database schema for users, sessions
- Basic React dashboard with routing

**Avoids:** better-auth Fastify integration quirks by implementing and testing OAuth flows end-to-end before GitHub App complexity

**Research flag:** Standard patterns, official docs available - skip `/gsd:research-phase`

### Phase 2: GitHub App Integration
**Rationale:** Sites require GitHub access. Prove installation flow and token management work before building site creation. Addresses Pitfall #1 (token expiration) and #4 (webhook timeout) architecturally.

**Delivers:** Users can install GitHub App, backend can make authenticated API calls on user's behalf

**Uses:**
- Octokit + @octokit/auth-app for automatic token management
- Webhook endpoint with async processing (BullMQ queue)
- Installation_id storage in PostgreSQL

**Implements:** GitHub App component from architecture, webhook signature verification pattern

**Avoids:**
- Pitfall #1 by using Octokit SDK for automatic token refresh
- Pitfall #4 by acknowledging webhooks immediately, processing async
- Pitfall #6 by monitoring rate limits from start

**Research flag:** GitHub App permissions testing needed - consider `/gsd:research-phase` for installation flow verification

### Phase 3: Site Creation & Templates
**Rationale:** Users need sites before they can create content. Template repo must exist before site creation. Addresses architecture limitation (can't create from template via API) and Pitfall #8 (version drift).

**Delivers:** Users can create new Astro blog from template, GitHub Pages automatically configured

**Uses:**
- Astro 5.x with Content Layer API
- GitHub Actions workflow (withastro/action)
- Template versioning strategy

**Implements:** Repository structure from architecture, create blank repo + push template pattern

**Addresses:**
- One-click setup (differentiator feature)
- Personal dev portfolio template (about, projects, blog, contact sections)
- GitHub Pages deployment automation

**Avoids:**
- Pitfall #8 by versioning templates explicitly
- Pitfall #12 by pinning MDX dependency versions in template

**Research flag:** Template design is well-documented - skip `/gsd:research-phase`

### Phase 4: Content Management (CRUD)
**Rationale:** Core value proposition. Users must be able to read and write content. Addresses Pitfall #7 (merge conflicts) and implements "content as code" pattern.

**Delivers:** Users can list blog posts, view content, create new posts with basic frontmatter

**Uses:**
- GitHub Contents API via Octokit
- Optimistic UI updates (TanStack Query)
- Fetch-before-write conflict prevention

**Implements:** Content service from architecture, content as code pattern

**Addresses:**
- Content CRUD (table stakes)
- Draft/publish states
- Content list view with status indicators

**Avoids:**
- Pitfall #7 by fetching latest before commit, detecting conflicts early
- Architecture anti-pattern #1 by reading from GitHub, not database

**Research flag:** Standard git operations - skip `/gsd:research-phase`

### Phase 5: Dual-Mode Editor
**Rationale:** Editor quality defines UX, but requires content infrastructure from Phase 4. Addresses Pitfall #2 (MDX security) and #5 (state sync). Most complex technical component.

**Delivers:** Users can edit posts in visual mode (WYSIWYG) or markdown mode, switch between modes without data loss

**Uses:**
- MDXEditor (^3.52.3) for visual editing
- Separate CodeMirror/Monaco for raw markdown view
- Frontmatter editing UI (title, date, tags, description)

**Implements:** Dual-mode editor (core differentiator), single AST pattern for state sync

**Addresses:**
- WYSIWYG editor (table stakes for non-technical users)
- Markdown editor with preview (table stakes for developers)
- Dual-mode editing (Barae's key differentiator)

**Avoids:**
- Pitfall #2 by never rendering user MDX server-side, previews in sandboxed iframes
- Pitfall #5 by using MDXEditor's Lexical-based single AST approach
- Alternative of building custom editor (months of work)

**Research flag:** Editor library evaluation needed - **NEEDS `/gsd:research-phase`** for MDXEditor integration patterns, bundle size optimization, JSX component descriptor configuration

### Phase 6: Media Upload & Image Handling
**Rationale:** Images are essential for blogging, but must handle correctly to avoid Pitfall #3 (repository bloat). Requires content infrastructure from Phase 4.

**Delivers:** Users can upload images, images are compressed and committed to repo with unique filenames

**Uses:**
- Sharp (^0.34.5) for compression
- Unique filename generation (prevent re-commits)
- Upload size validation (2MB limit)

**Implements:** Image compression pipeline from stack research

**Addresses:**
- Media upload (table stakes)
- Drag-and-drop expected UX
- Repository size tracking

**Avoids:**
- Pitfall #3 by compressing with Sharp before commit, unique filenames, size limits
- Pitfall #10 by pre-optimizing images (not during build)
- Pitfall #14 by monitoring repo size, displaying in dashboard

**Research flag:** Sharp integration is straightforward - skip `/gsd:research-phase`

### Phase 7: SEO & Configuration
**Rationale:** Polish features after core functionality works. Template customization without breaking updates.

**Delivers:** Users can configure site metadata, SEO defaults, theme settings

**Uses:**
- barae.config.json in user repos
- Template configuration pattern

**Addresses:**
- SEO metadata (table stakes)
- Custom domain documentation
- Theme/styling customization

**Avoids:**
- Pitfall #8 by keeping customization separate from template core
- Architecture anti-pattern #5 by using template configuration files

**Research flag:** Standard patterns - skip `/gsd:research-phase`

### Phase Ordering Rationale

**Dependency-driven order:**
- Auth must come first (everything requires authenticated users)
- GitHub integration before sites (sites need repo access)
- Sites before content (content needs repos to commit to)
- Content CRUD before editor (editor needs infrastructure)
- Images after editor (nice-to-have, can be added)

**Risk mitigation order:**
- Phase 1 addresses Pitfall #9 (auth integration) early
- Phase 2 addresses Pitfall #1, #4, #6 (GitHub complexity) architecturally
- Phase 3 addresses Pitfall #8, #12 (template versioning) from start
- Phase 4 addresses Pitfall #7 (merge conflicts) before editor adds complexity
- Phase 5 addresses Pitfall #2, #5 (MDX security, state sync) - most complex phase
- Phase 6 addresses Pitfall #3, #10, #14 (image bloat, build/size limits)

**Grouping by component boundaries:**
- Phases 1-2: Backend infrastructure (auth, GitHub App)
- Phases 3-4: Repository operations (templates, content CRUD)
- Phases 5-6: Content creation UX (editor, images)
- Phase 7: Configuration and polish

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 2 (GitHub App Integration):** GitHub App installation flow and permission testing may need experimentation with actual App registration to verify workaround for template repo creation limitation
- **Phase 5 (Dual-Mode Editor):** MDXEditor integration patterns, bundle optimization strategies (code splitting), JSX component descriptor configuration for custom Barae components, handling of complex MDX edge cases - **high priority for `/gsd:research-phase`**

Phases with standard patterns (skip research-phase):

- **Phase 1 (Foundation & Auth):** better-auth + Drizzle integration well-documented, existing backend scaffold provides foundation
- **Phase 3 (Site Creation):** Astro template structure and GitHub Actions workflows documented in official sources
- **Phase 4 (Content Management):** Standard git operations via Octokit, well-understood patterns
- **Phase 6 (Media Upload):** Sharp compression pipeline is straightforward
- **Phase 7 (SEO & Configuration):** Template customization patterns well-established

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core technologies verified against official documentation, active maintenance confirmed via npm/GitHub, version compatibility validated |
| Features | HIGH | Multiple git-based CMS platforms analyzed (TinaCMS, Decap, CloudCannon, Sveltia), user feedback from GitHub issues/discussions cross-referenced, clear patterns emerged |
| Architecture | MEDIUM-HIGH | Component boundaries clear, GitHub App patterns verified in official docs, some integration details (better-auth + Fastify) need validation during implementation |
| Pitfalls | MEDIUM-HIGH | Critical pitfalls verified against official GitHub docs (tokens, webhooks, limits), moderate pitfalls based on community reports (may be addressed in recent releases), testing will validate during implementation |

**Overall confidence:** HIGH

The domain is well-explored with mature patterns. Stack recommendations are based on official documentation and active maintenance verification. Feature landscape informed by analysis of multiple existing platforms and user feedback. Architecture follows established patterns for git-backed CMS platforms with specific Barae adaptations.

### Gaps to Address

Research was comprehensive but these areas need validation during implementation:

- **better-auth + Fastify integration nuances:** Official docs exist but community reports integration quirks. Phase 1 should thoroughly test OAuth flows, route prefixing, error handling, CORS configuration. Recommend using [fastify-better-auth](https://github.com/flaviodelgrosso/fastify-better-auth) community plugin to reduce risk.

- **MDXEditor bundle size optimization:** 851KB gzipped is significant. Phase 5 planning should research code splitting strategies, lazy loading patterns, and whether toolbar components can be selectively included. May impact initial load performance.

- **GitHub App template repo creation workaround:** Architecture identified limitation (can't create from template via API) with workaround (create blank + push content). Phase 2/3 should verify this pattern works reliably, especially with GitHub Actions workflow files requiring workflow scope (may need user OAuth token, not installation token).

- **Template update/versioning mechanism:** Deferred to post-MVP but Phase 3 should design template structure to make future updates feasible. Research didn't find established patterns for this - may need custom Barae solution.

- **Conflict resolution UX:** Phase 4 identified fetch-before-write pattern but user experience for actual conflicts needs design. How do we explain to non-technical users that someone else (or they themselves via git) changed the same content?

- **Image optimization settings:** Phase 6 should validate Sharp settings (quality 80, effort 6, max dimension 1920) produce acceptable results across different image types. Might need user configuration or different presets (photos vs screenshots vs graphics).

## Sources

### Primary (HIGH confidence)

**Stack research:**
- [Better Auth Documentation](https://www.better-auth.com/docs/) - Authentication framework, Drizzle adapter, Fastify integration
- [Octokit Documentation](https://github.com/octokit/octokit.js) - GitHub SDK, @octokit/auth-app patterns
- [GitHub REST API Official Docs](https://docs.github.com/en/rest) - Pages API, rate limits, webhook best practices
- [Astro Documentation](https://docs.astro.build/) - Content Layer API (Astro 5.0), MDX integration, deployment
- [MDXEditor Documentation](https://mdxeditor.dev/) - Features, API, limitations
- [Sharp Documentation](https://sharp.pixelplumbing.com/) - Image processing, compression settings
- [Vite Documentation](https://vite.dev/) - Build tool configuration
- [React Router Documentation](https://reactrouter.com/) - SPA mode, routing patterns
- [TanStack Query Documentation](https://tanstack.com/query) - Server state management

**Features research:**
- [TinaCMS](https://tina.io) - Official docs, features, pricing
- [Decap CMS](https://decapcms.org) - Official docs, Git Gateway deprecation
- [CloudCannon](https://cloudcannon.com) - Features, pricing, non-dev editor support
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) - Schema, querying, glob loader

**Architecture research:**
- [GitHub App Authentication](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app) - Installation token flow, JWT generation
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages) - Configuration endpoints
- [GitHub Webhook Events](https://docs.github.com/en/webhooks/webhook-events-and-payloads) - Event payloads, best practices
- [Astro GitHub Pages Deployment](https://docs.astro.build/en/guides/deploy/github/) - Official workflow

**Pitfalls research:**
- [GitHub App Rate Limits](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/rate-limits-for-github-apps) - 5,000 requests/hour baseline
- [GitHub Webhook Best Practices](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks) - 10-second timeout, signature verification
- [GitHub Pages Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) - 1GB repo size, 100GB/month bandwidth
- [MDX Security Discussion](https://github.com/orgs/mdx-js/discussions/1371) - XSS risks, code execution

### Secondary (MEDIUM confidence)

**Stack comparisons:**
- [Strapi Editor Comparison](https://strapi.io/blog/top-5-markdown-editors-for-react) - MDXEditor vs alternatives
- [Sharp vs Squoosh Comparison](https://sureshkhirwadkar.dev/posts/optimising-images-with-astro-image-copy/) - Performance benchmarks

**Features research:**
- [StaticMania Git-Based CMS Comparison 2025](https://staticmania.com/blog/top-git-based-cms) - Feature matrix across platforms
- [Statichunt Git-Based Headless CMS 2026](https://statichunt.com/blog/git-based-headless-cms) - Market analysis
- [LogRocket 9 Best Git-Based CMS](https://blog.logrocket.com/9-best-git-based-cms-platforms/) - Platform comparison
- [Sveltia CMS GitHub](https://github.com/sveltia/sveltia-cms) - Improvements over Decap
- [Forestry Migration Pain](https://dev.to/aws-builders/the-death-of-forestryio-1pi) - Platform shutdown lessons

**Best practices:**
- [Elementor Portfolio Best Practices 2026](https://elementor.com/blog/best-web-developer-portfolio-examples/) - Dev portfolio features
- [BrainStation Portfolio Guide 2026](https://brainstation.io/career-guides/how-to-build-a-web-developer-portfolio) - Portfolio standards
- [KlientBoost SaaS Landing Pages](https://www.klientboost.com/landing-pages/saas-landing-page/) - Product page patterns

**Architecture patterns:**
- [TinaCMS Documentation](https://tina.io/docs) - Hybrid git/database approach
- [CloudCannon Git CMS](https://cloudcannon.com/git-cms/) - Commercial git-backed CMS patterns

**Pitfall sources:**
- [better-auth Fastify Discussion](https://github.com/better-auth/better-auth/discussions/6266) - Integration issues reported
- [fastify-better-auth Plugin](https://github.com/flaviodelgrosso/fastify-better-auth) - Community solution
- [TOAST UI Editor Architecture](https://toastui.medium.com/the-need-for-a-new-markdown-parser-and-why-e6a7f1826137) - Dual-mode editor challenges
- [Git LFS Overview](https://www.git-tower.com/learn/git/faq/handling-large-files-with-lfs) - Repository bloat solutions

### Tertiary (LOW confidence)

- [Feature Bloat Killing Headless CMS](https://alangleeson.medium.com/feature-bloat-is-killing-headless-cms-c4154aba5604) - Opinion piece, anti-feature guidance
- [Git Performance Guide](https://www.git-tower.com/blog/git-performance) - General performance tips

## What This Means for Barae

**Clear path forward:**

The research establishes Barae can be built with proven technologies and patterns. The dual-mode editor differentiator is achievable with MDXEditor (not a custom build). The GitHub App integration is well-documented with automatic token management via Octokit. The architecture avoids database-for-content anti-pattern while maintaining hosted dashboard UX.

**Key decisions made:**

1. **Use MDXEditor despite bundle size** - The alternative is months building on Lexical/ProseMirror. 851KB is acceptable with code splitting for the core differentiator.
2. **Templates version from day one** - Track which version each site uses, design for future updates even if MVP doesn't implement update mechanism.
3. **Images compressed before commit** - Sharp integration is straightforward, prevents repository bloat that would emerge later.
4. **Personal dev portfolio template first** - Market is clearer, feature set is well-defined, defer product/landing page template.
5. **Accept MDX security model** - User content is code, not data. All compilation in GitHub Actions, never server-side.

**Tensions and tradeoffs:**

- **Portability vs convenience:** Users own standard Astro projects (portability) means Barae can't lock them in with proprietary features. This is intentional - differentiator is better UX for standard stack.
- **Editor bundle size vs functionality:** MDXEditor is large but provides dual-mode editing. Mitigate with lazy loading, accept that editor routes will have larger bundles.
- **GitHub App vs user OAuth tokens:** App provides better UX (users don't manage tokens) but has permission limitations (can't create from template). Workaround pattern validated.
- **Feature minimalism vs competition:** TinaCMS/CloudCannon have more features but create complexity. Barae wins with focus - do blog editing exceptionally well.

**Confidence to proceed:**

Research provides sufficient confidence to begin roadmap creation and Phase 1 implementation. Critical unknowns (better-auth + Fastify, MDXEditor integration) are planned for early validation in Phases 1 and 5. Architecture addresses known pitfalls. Stack is stable with active maintenance.

---

*Research completed: 2026-02-03*
*Ready for roadmap: yes*
