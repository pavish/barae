# Feature Landscape: Git-Backed Blogging Platform

**Domain:** Git-backed CMS / Hosted blogging platform
**Researched:** 2026-02-03
**Confidence:** MEDIUM-HIGH (multiple sources cross-referenced)

## Executive Summary

Git-backed CMS platforms have matured significantly, with clear patterns emerging for what users expect versus what delights them. The market leaders (TinaCMS, Decap CMS, CloudCannon, Sveltia CMS) have established baseline expectations while also revealing gaps that Barae can exploit.

**Key insight:** The ecosystem is bifurcating into (1) developer-first tools that frustrate content creators and (2) editor-first tools that frustrate developers. Barae's opportunity is bridging this gap with a dual-mode editor that genuinely serves both.

---

## Table Stakes

Features users expect. Missing = product feels incomplete or users leave.

### CMS Core Features

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **WYSIWYG/Rich Text Editor** | Non-technical users won't write raw markdown | Medium | All competitors offer this. Decap's is "limiting" per user complaints. TinaCMS excels here with live preview. |
| **Markdown Support** | Developers expect to write in markdown, portability | Low | Table stakes for dev audience. Must support standard GFM. |
| **Draft/Publish States** | Basic editorial workflow | Low | Every CMS has this. "Draft: true/false" in frontmatter is minimum. |
| **Media Upload** | Users need to add images to posts | Medium | Drag-and-drop expected. Git LFS or external DAM for scale. |
| **Content Preview** | See what content looks like before publishing | Medium | Decap offers real-time preview. TinaCMS has live in-context editing. |
| **Git Sync** | Core value prop - content lives in user's repo | Medium | Two-way sync essential. Conflict handling critical (see Pitfalls). |
| **Authentication** | Secure access to CMS | Medium | GitHub OAuth is standard. Decap's Git Gateway being deprecated is causing user pain. |

### Blog-Specific Features

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Categories/Tags** | Basic content organization | Low | Standard frontmatter fields. UI for managing them. |
| **Author Attribution** | Multi-author blogs are common | Low | Author field with optional profile data. |
| **Publication Date** | Chronological ordering, SEO | Low | Date picker in editor, frontmatter field. |
| **Post Slugs/URLs** | SEO, readable URLs | Low | Auto-generate from title, allow override. |
| **SEO Metadata** | Title, description, OG tags | Low | Essential fields: title (50-60 chars), description, keywords deprecated but sometimes still used. |
| **RSS Feed** | Blog standard since forever | Low | Astro generates automatically. Template must include. |
| **Sitemap** | SEO essential | Low | Astro generates automatically. Template must include. |

### Template Features (Personal Dev Portfolio)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **About Page** | "Who is this person?" | Low | Personal info, skills, professional background, photo. |
| **Projects Section** | Showcase work | Medium | 3-5 highlighted projects with case study format: problem, role, solution, outcome. |
| **Blog** | Share knowledge, demonstrate expertise | Medium | Core content type with standard features above. |
| **Contact Info** | How to reach you | Low | Email, social links (GitHub, LinkedIn, Twitter). |
| **Resume/CV** | Professional credibility | Low | Downloadable PDF option, or dedicated page. |
| **Dark/Light Mode** | Modern UX expectation | Low | 72%+ of portfolio sites offer this per templates surveyed. |
| **Responsive Design** | Mobile traffic is 50%+ | Low | Non-negotiable for any 2026 site. |

### Template Features (Product/Landing Page)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Hero Section** | Above-fold value prop | Low | Headline, subhead, CTA, optional demo/visual. |
| **Features/Benefits** | "What does it do?" | Low | Feature list with icons/descriptions. |
| **Social Proof** | Trust building | Low | Testimonials, customer logos, stats. |
| **Pricing (Optional)** | SaaS standard | Medium | Tiered pricing tables, FAQ. Defer for MVP. |
| **CTA Buttons** | Conversion focus | Low | Single focused CTA increases conversion 161% per research. |
| **About/Team Page** | Company credibility | Low | Story, mission, team bios. |
| **Blog** | Content marketing, SEO | Medium | Same as above. |

---

## Differentiators

Features that set Barae apart. Not universally expected, but highly valued.

### High-Impact Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Dual-Mode Editor** | Devs get markdown, non-devs get WYSIWYG - same content | High | This is Barae's core differentiator. TinaCMS has live editing but less focus on raw markdown. Decap's markdown editor is "very limiting." |
| **True Portability** | Export complete Astro project, run anywhere | Medium | Users own standard Astro project, not locked in. Competitors have varying lock-in. Forestry shutdown caused user pain - portability matters. |
| **No GitHub Account for Editors** | Content team can edit without GitHub | High | Decap's Git Gateway did this but is being deprecated. CloudCannon handles this. Huge value for teams with non-technical editors. |
| **One-Click Setup** | Connect repo, pick template, done | Medium | Reduce friction vs. manual Decap/Tina setup. CloudCannon does this well. |
| **Mobile-Responsive CMS** | Edit from phone | Medium | Decap CMS has "terrible" mobile UX per user feedback. Sveltia CMS added mobile support. Major gap in market. |

### Medium-Impact Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Content Scheduling** | Publish at future date/time | Medium | Strapi, Hygraph, and API-based CMSs have this. Git-based CMSs often lack it. Requires build triggering. |
| **Real-Time Collaboration** | Multiple editors, live updates | High | Sanity excels here. Most git-based CMSs don't support this. Defer to post-MVP. |
| **AI Writing Assistance** | Generate drafts, improve prose | Medium | TinaCMS has AI in beta. Market expectation growing. Could use Claude API. |
| **Stock Photo Integration** | Pexels, Unsplash in media picker | Low | Sveltia CMS added this. Nice convenience feature. |
| **i18n/Multi-Language** | Create content in multiple languages | High | Sveltia CMS has "first-class i18n support" as differentiator. Complex but valuable for global audiences. |
| **Custom Fields UI** | Non-devs can add metadata fields | Medium | TinaCMS has schema-as-code. Visual field builder would differentiate. |

### Lower-Impact Differentiators (Nice to Have)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Keyboard Shortcuts** | Power user efficiency | Low | Quick search, theme toggle via shortcuts. Astro Micro has this. |
| **Comments via Giscus** | Blog engagement | Low | Template feature, not CMS feature. Easy to add. |
| **Search (Pagefind)** | Find content on site | Low | Template feature. Pagefind is current standard. |
| **Analytics Dashboard** | Traffic insights without leaving CMS | Medium | Integration with Plausible/Fathom. Nice but not core. |
| **A/B Testing** | Optimize conversions | High | Landing page feature. Defer significantly. |

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Database Backend** | Defeats git-based value prop, adds complexity, hosting costs | Keep everything in git. Use GitHub API. Content stays portable. |
| **Custom Template Language** | Lock-in, learning curve, maintenance burden | Use standard Astro. Users can customize or eject. |
| **Plugin Marketplace** | Decap CMS shows this leads to fragmentation and maintenance hell | Curated integrations. Quality over quantity. |
| **Unlimited Content Types** | Feature bloat - "8/10 people delete apps they can't figure out" | Two templates, focused collections: posts, projects, pages. Expand carefully. |
| **Complex Permissions** | Enterprise feature, adds UI complexity, confuses individuals/small teams | Simple owner/editor model initially. Role complexity later if needed. |
| **Inline Code Editor** | Users who want to edit code will use VS Code/GitHub | Link to repo. Don't recreate IDE. |
| **Social Media Publishing** | Scope creep, API maintenance burden, not core value | Users post links manually. Integration ecosystem exists. |
| **Email Newsletter** | Different domain entirely, mature solutions exist | Recommend Buttondown, ConvertKit integration instead. |
| **Comments System (Built-in)** | Spam management, moderation complexity | Giscus (GitHub Discussions) or Disqus. External service. |
| **Complex Editorial Workflows** | Decap users turned it off "after 15 minutes" | Simple draft/published. Avoid approval chains, multiple review states. |
| **TOML/Other Frontmatter Formats** | TinaCMS dropped TOML support, caused migration pain | YAML only. It's the standard. |
| **Branching/PR Workflow in CMS** | Confuses non-technical users, git expertise expected | Publish to main. Developers can use branches via git. |

---

## Feature Dependencies

```
Authentication
    |
    v
Git Connection (GitHub OAuth)
    |
    +--> Media Upload (needs repo access)
    |
    +--> Content CRUD (needs repo access)
            |
            +--> Draft/Publish (flag in content)
            |
            +--> Categories/Tags (frontmatter)
            |
            +--> Preview (needs content)
                    |
                    +--> Live Preview (needs build)

Templates (Independent Track)
    |
    +--> Personal Dev Site
    |       +--> About page
    |       +--> Projects collection
    |       +--> Blog collection
    |       +--> Contact info
    |
    +--> Product Site
            +--> Landing page
            +--> About page
            +--> Blog collection
            +--> Pricing (optional)
```

**Critical Path:** Auth -> Git -> Content CRUD -> Preview -> Templates

---

## MVP Recommendation

### Must Have for Launch

**CMS Features:**
1. GitHub OAuth authentication
2. Markdown editor with preview
3. Rich text editor (WYSIWYG) as alternative mode
4. Draft/publish toggle
5. Media upload (to repo or external)
6. Basic frontmatter fields (title, date, description, tags)
7. Content list view with status indicators

**Template Features (Personal Dev Site - ship first):**
1. About page (editable)
2. Projects section (3-5 projects, basic case study format)
3. Blog with posts collection
4. Contact section with social links
5. Dark/light mode toggle
6. Responsive design
7. RSS feed
8. Sitemap
9. SEO metadata per page

### Defer to Post-MVP

| Feature | Reason to Defer |
|---------|-----------------|
| Product site template | Focus on one template first, validate |
| Content scheduling | Requires build trigger infrastructure |
| Multi-language | Complex, niche need initially |
| AI writing assistance | Enhancement, not core |
| Real-time collaboration | High complexity, limited value for individual/small teams |
| Mobile-optimized CMS | Nice-to-have, desktop-first is acceptable for launch |
| Stock photo integration | Nice-to-have, users can upload |
| Analytics integration | External tools work fine |

---

## Competitor Feature Matrix

| Feature | TinaCMS | Decap CMS | CloudCannon | Sveltia CMS | Barae (Target) |
|---------|---------|-----------|-------------|-------------|----------------|
| Visual editing | Excellent | Basic | Excellent | Good | Good |
| Markdown editing | Good | Limited | Good | Good | **Excellent** |
| Dual-mode editor | No | No | No | No | **Yes** |
| Live preview | Excellent | Good | Excellent | Good | Good |
| Mobile CMS | No | Poor | Unknown | Yes | Later |
| Git providers | GitHub | GitHub | GH/GL/BB | GitHub | GitHub |
| Media management | Good | Basic | Good | **Excellent** | Good |
| i18n | Limited | Limited | Yes | **Excellent** | Later |
| Self-hostable | Yes | Yes | No | Yes | No (hosted) |
| Pricing | Free-$299 | Free | $55-350+ | Free | TBD |
| Non-dev friendly | Medium | Low | High | Medium | **High** |
| Template quality | Varies | Varies | Good | N/A | **Curated** |

---

## Sources

### Official Documentation (HIGH confidence)
- [TinaCMS](https://tina.io) - Features, pricing, documentation
- [Decap CMS](https://decapcms.org) - Features, Git Gateway
- [CloudCannon](https://cloudcannon.com) - Pricing, features
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) - Schema, querying

### Verified Comparisons (MEDIUM confidence)
- [StaticMania Git-Based CMS Comparison 2025](https://staticmania.com/blog/top-git-based-cms)
- [Statichunt Git-Based Headless CMS 2026](https://statichunt.com/blog/git-based-headless-cms)
- [LogRocket 9 Best Git-Based CMS](https://blog.logrocket.com/9-best-git-based-cms-platforms/)

### User Feedback (MEDIUM confidence)
- [Decap CMS GitHub Issues/Discussions](https://github.com/decaporg/decap-cms/discussions/) - User complaints, limitations
- [Sveltia CMS GitHub](https://github.com/sveltia/sveltia-cms) - Improvements over Decap
- [Forestry Migration Pain](https://dev.to/aws-builders/the-death-of-forestryio-1pi)

### Best Practices (MEDIUM confidence)
- [Elementor Portfolio Best Practices 2026](https://elementor.com/blog/best-web-developer-portfolio-examples/)
- [BrainStation Portfolio Guide 2026](https://brainstation.io/career-guides/how-to-build-a-web-developer-portfolio)
- [KlientBoost SaaS Landing Pages](https://www.klientboost.com/landing-pages/saas-landing-page/)
- [Userpilot SaaS Landing Page Practices](https://userpilot.com/blog/saas-landing-page-best-practices/)

### Feature Bloat Research (MEDIUM confidence)
- [Feature Bloat Killing Headless CMS](https://alangleeson.medium.com/feature-bloat-is-killing-headless-cms-c4154aba5604)
- [Contento on Headless CMS Feature Bloat](https://www.contento.io/blog/headless-cms-feature-bloat)

### Template Research (MEDIUM confidence)
- [ThemeFisher Astro Templates 2026](https://themefisher.com/best-astro-blog-templates)
- [Josh Comeau Building Effective Portfolio](https://www.joshwcomeau.com/effective-portfolio/)
- [Tobias van Schneider on Case Studies](https://vanschneider.com/blog/portfolio-tips/write-project-case-studies-portfolio/)
