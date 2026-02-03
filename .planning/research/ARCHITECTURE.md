# Architecture Patterns

**Domain:** Git-backed CMS with hosted editing experience
**Researched:** 2026-02-03
**Overall Confidence:** MEDIUM-HIGH

## Executive Summary

Barae is a git-backed CMS platform where users own standard Astro projects in their GitHub repositories. The architecture separates four major concerns: (1) user authentication and session management, (2) content editing through a web dashboard, (3) git operations via GitHub App, and (4) builds/hosting via GitHub Actions and GitHub Pages.

This research draws from analysis of similar platforms (TinaCMS, DecapCMS, CloudCannon) and official GitHub documentation for Apps, webhooks, and Pages APIs.

---

## Recommended Architecture

```
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|  React Dashboard |<--->|  Fastify Backend  |<--->|    PostgreSQL    |
|  (Vite)          |     |  (API Server)     |     |    (State DB)    |
|                  |     |                   |     |                  |
+------------------+     +-------------------+     +------------------+
                               |      ^
                               |      | Webhooks
                               v      |
                         +---------------------+
                         |                     |
                         |   GitHub (via App)  |
                         |   - User Repos      |
                         |   - Actions         |
                         |   - Pages           |
                         +---------------------+
                                   |
                                   | Triggers
                                   v
                         +---------------------+
                         |  GitHub Actions     |
                         |  (Astro builds)     |
                         +---------------------+
                                   |
                                   | Deploys
                                   v
                         +---------------------+
                         |  GitHub Pages       |
                         |  (Static hosting)   |
                         +---------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Technology |
|-----------|---------------|-------------------|------------|
| **React Dashboard** | User interface for content editing, site management, settings | Fastify Backend (REST API) | React, Vite, TanStack Query |
| **Fastify Backend** | Authentication, API endpoints, GitHub App operations, business logic | Dashboard (HTTP), PostgreSQL (Drizzle), GitHub API (Octokit) | Fastify 5, TypeScript, better-auth |
| **PostgreSQL** | User accounts, site metadata, GitHub installation mappings, sessions | Backend only | PostgreSQL 18, Drizzle ORM |
| **GitHub App** | Repository access, content CRUD, Actions/Pages configuration | Backend (via Octokit), User Repos (API) | @octokit/auth-app |
| **GitHub Actions** | Build Astro sites on push | User Repos (triggered by commits), GitHub Pages (deployment) | withastro/action |
| **GitHub Pages** | Host static sites | GitHub Actions (receives deploys) | Built-in GitHub |
| **Astro Templates** | Blog/portfolio starter projects | User Repos (forked/templated) | Astro 5, Tailwind |

### Data Flow

**Content Creation Flow:**
```
User writes post in Dashboard
    |
    v
Dashboard sends content to Backend API
    |
    v
Backend authenticates user, validates content
    |
    v
Backend uses GitHub App to commit MDX file to user's repo
    |
    v
GitHub triggers push webhook to Backend (optional: for sync)
    |
    v
GitHub Actions workflow runs (triggered by push)
    |
    v
Astro site builds, deploys to GitHub Pages
    |
    v
Site live at user's GitHub Pages URL
```

**GitHub App Installation Flow:**
```
User clicks "Connect GitHub" in Dashboard
    |
    v
Redirect to GitHub App installation page
    |
    v
User authorizes app for specific repos (or all)
    |
    v
GitHub redirects back with installation_id
    |
    v
Backend stores installation_id linked to user account
    |
    v
Backend can now make API calls on behalf of user
```

---

## Detailed Component Architecture

### 1. Backend (Fastify)

**Confidence:** HIGH (existing scaffold, well-understood patterns)

The backend serves as the central coordinator. It should be organized into feature modules:

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # better-auth integration
│   │   │   ├── routes.ts   # Auth endpoints
│   │   │   ├── config.ts   # better-auth configuration
│   │   │   └── index.ts
│   │   ├── github/         # GitHub App operations
│   │   │   ├── app.ts      # GitHub App instance (Octokit)
│   │   │   ├── webhooks.ts # Webhook handlers
│   │   │   ├── routes.ts   # Installation, repo operations
│   │   │   └── index.ts
│   │   ├── sites/          # Site management
│   │   │   ├── routes.ts   # CRUD for sites
│   │   │   ├── service.ts  # Business logic
│   │   │   └── index.ts
│   │   └── content/        # Content operations
│   │       ├── routes.ts   # CRUD for posts/pages
│   │       ├── service.ts  # Git commit operations
│   │       └── index.ts
│   ├── db/
│   │   └── schema/         # Drizzle schemas
│   ├── plugins/            # Fastify plugins
│   └── index.ts
```

**Key Design Decisions:**

1. **Use @octokit/auth-app for GitHub authentication** - Handles JWT generation, token caching, and automatic refresh. Installation tokens expire after 1 hour; Octokit handles this automatically.

2. **Store installation_id per user** - Each user's GitHub App installation is tracked in PostgreSQL. When making API calls, retrieve the installation_id and create an authenticated Octokit instance.

3. **Webhook endpoint for GitHub events** - Handle `installation`, `installation_repositories`, and `push` events. The push event is optional but useful for syncing state.

### 2. GitHub App Integration

**Confidence:** HIGH (official GitHub documentation verified)

**Required Permissions for the GitHub App:**

| Permission | Level | Purpose |
|------------|-------|---------|
| Contents | Read & Write | Read/write files (MDX content, images) |
| Actions | Read & Write | Configure workflow files |
| Pages | Read & Write | Enable and configure GitHub Pages |
| Administration | Read & Write | Create repositories (if creating on behalf of user) |
| Metadata | Read | Basic repo information |

**Webhook Events to Subscribe:**

| Event | Purpose |
|-------|---------|
| `installation` | Track when app is installed/uninstalled |
| `installation_repositories` | Track repo access changes |
| `push` | Optional: sync content state after external commits |

**Authentication Flow:**

```typescript
// Using @octokit/auth-app
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";

// Create app-level Octokit (for app endpoints)
const appOctokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: GITHUB_APP_ID,
    privateKey: GITHUB_PRIVATE_KEY,
  },
});

// Create installation-level Octokit (for user operations)
function getInstallationOctokit(installationId: number) {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: GITHUB_APP_ID,
      privateKey: GITHUB_PRIVATE_KEY,
      installationId,
    },
  });
}
```

**CRITICAL LIMITATION:** GitHub Apps cannot create repositories from templates in a user's personal account via API. The template endpoint only works for the authenticated user or organizations they belong to.

**Workaround Options:**

1. **Fork instead of template** - Fork the template repo, then customize. Forks work via API for installation tokens.

2. **Create blank repo + push template content** - Create empty repo, then push template files as initial commit. More control, slightly more complex.

3. **Instruct user to create from template** - Provide direct link to GitHub's "Use this template" page, then have them return to Barae. Simplest but breaks flow.

**Recommendation:** Use option 2 (create blank + push). This gives full control and works reliably with GitHub App tokens. The template content can be fetched from Barae's template repo and pushed as the initial commit.

### 3. Repository Structure (User's Astro Project)

**Confidence:** HIGH (Astro patterns well-documented)

Each user's repository follows standard Astro blog structure:

```
user-blog/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions workflow (Barae-managed)
├── public/
│   ├── images/             # User-uploaded images
│   └── CNAME               # Custom domain (if configured)
├── src/
│   ├── components/         # Astro/React components
│   ├── content/
│   │   ├── blog/           # MDX blog posts
│   │   ├── pages/          # MDX static pages
│   │   └── config.ts       # Content collection config
│   ├── layouts/            # Page layouts
│   └── pages/              # Route pages
├── astro.config.mjs        # Astro configuration
├── tailwind.config.js      # Styling
├── package.json
└── barae.config.json       # Barae-specific settings (theme, SEO defaults)
```

**Content File Format (MDX):**

```mdx
---
title: "My First Post"
date: 2026-02-03
tags: ["intro", "blogging"]
draft: false
description: "Welcome to my blog"
---

# Hello World

This is my first post written with Barae.
```

**GitHub Actions Workflow (deploy.yml):**

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: withastro/action@v5
        with:
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### 4. Frontend Dashboard (React + Vite)

**Confidence:** MEDIUM (standard patterns, specific editor library TBD)

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/         # App shell, navigation
│   │   ├── editor/         # Markdown/visual editor
│   │   ├── content/        # Content list, filters
│   │   └── settings/       # Site settings, themes
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Sites.tsx
│   │   ├── Editor.tsx
│   │   └── Settings.tsx
│   ├── hooks/              # Custom hooks
│   ├── api/                # API client (TanStack Query)
│   └── main.tsx
├── index.html
├── vite.config.ts
└── package.json
```

### 5. Database Schema (PostgreSQL)

**Confidence:** HIGH (standard patterns)

```sql
-- Users (managed by better-auth, extended)
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name TEXT,
  github_id VARCHAR(255),  -- From OAuth
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- GitHub App installations
github_installations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  installation_id INTEGER NOT NULL,  -- GitHub's installation ID
  account_type VARCHAR(20),  -- 'user' or 'organization'
  account_login VARCHAR(255),  -- GitHub username/org name
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Sites (repos managed by Barae)
sites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  installation_id UUID REFERENCES github_installations(id),
  repo_full_name VARCHAR(255) NOT NULL,  -- 'username/repo-name'
  repo_id INTEGER NOT NULL,  -- GitHub's repo ID
  template_type VARCHAR(50),  -- 'personal-dev', 'product-site'
  custom_domain VARCHAR(255),
  pages_url VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- better-auth tables (sessions, accounts, verification_tokens, etc.)
-- These are created by better-auth's Drizzle adapter
```

---

## Patterns to Follow

### Pattern 1: Installation Token Caching

**What:** Cache GitHub installation tokens to avoid regenerating on every request.
**When:** Any GitHub API operation.
**Why:** Tokens are valid for 1 hour. Regenerating wastes time and API calls.

```typescript
// @octokit/auth-app handles this automatically
// Just create the Octokit instance with installationId
// The library caches up to 15,000 tokens
```

### Pattern 2: Optimistic UI Updates

**What:** Update the dashboard UI immediately, then sync with backend.
**When:** Content edits, settings changes.
**Why:** Better UX - users don't wait for GitHub API round-trips.

```typescript
// TanStack Query optimistic update pattern
const mutation = useMutation({
  mutationFn: updatePost,
  onMutate: async (newPost) => {
    await queryClient.cancelQueries(['posts', postId]);
    const previous = queryClient.getQueryData(['posts', postId]);
    queryClient.setQueryData(['posts', postId], newPost);
    return { previous };
  },
  onError: (err, newPost, context) => {
    queryClient.setQueryData(['posts', postId], context.previous);
  },
});
```

### Pattern 3: Webhook Signature Verification

**What:** Verify GitHub webhook payloads using HMAC signature.
**When:** All webhook endpoints.
**Why:** Security - ensures requests are genuinely from GitHub.

```typescript
import { verify } from '@octokit/webhooks-methods';

async function verifyWebhook(payload: string, signature: string) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  return await verify(secret, payload, signature);
}
```

### Pattern 4: Content as Code

**What:** Treat MDX files as the source of truth, not database.
**When:** All content operations.
**Why:** Portability - users can edit files directly, use other tools.

**Implication:** Barae reads from GitHub on dashboard load, writes to GitHub on save. PostgreSQL stores metadata (site config, user preferences) not content.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Content in Database

**What:** Duplicating MDX content in PostgreSQL.
**Why bad:** Creates sync problems, loses git history benefits, defeats portability.
**Instead:** Read content from GitHub, write to GitHub. Use GitHub as source of truth.

### Anti-Pattern 2: Server-Side Builds

**What:** Building Astro sites on Barae's servers.
**Why bad:** Requires build infrastructure, scaling, security isolation. Users depend on Barae being up.
**Instead:** Use GitHub Actions. Sites build even if Barae is down.

### Anti-Pattern 3: Long-Lived Personal Access Tokens

**What:** Using user PATs instead of GitHub App installation tokens.
**Why bad:** PATs have broad scope, don't expire automatically, security risk.
**Instead:** GitHub App with installation tokens. Scoped permissions, automatic rotation.

### Anti-Pattern 4: Monolithic API Design

**What:** Single endpoint handling all operations.
**Why bad:** Hard to maintain, test, extend.
**Instead:** Feature modules with clear boundaries (auth, sites, content, github).

### Anti-Pattern 5: Tight Coupling to Specific Template

**What:** Hardcoding paths, component names specific to one template.
**Why bad:** Can't add new templates without code changes.
**Instead:** Template configuration files that describe content locations, build settings.

---

## Component Communication

### API Contract (Backend <-> Frontend)

```typescript
// Sites
GET    /api/sites                    // List user's sites
POST   /api/sites                    // Create new site
GET    /api/sites/:id                // Get site details
DELETE /api/sites/:id                // Delete site

// Content (scoped to site)
GET    /api/sites/:id/content        // List all content
GET    /api/sites/:id/content/:slug  // Get specific content
POST   /api/sites/:id/content        // Create content
PUT    /api/sites/:id/content/:slug  // Update content
DELETE /api/sites/:id/content/:slug  // Delete content

// GitHub
GET    /api/github/installation      // Get installation status
POST   /api/github/installation/callback  // Handle OAuth callback
POST   /api/github/webhooks          // Webhook endpoint (from GitHub)
```

### Event Flow (Webhooks)

```
GitHub Event        ->  Backend Handler  ->  Action
--------------------------------------------------------------------------------
installation        ->  handleInstall    ->  Store installation_id in DB
created

installation        ->  handleUninstall  ->  Remove installation, mark sites inactive
deleted

installation_       ->  handleRepoAdd    ->  Update accessible repos list
repositories
(added)

push                ->  handlePush       ->  Optional: invalidate content cache
```

---

## Suggested Build Order

Based on component dependencies, build in this order:

### Phase 1: Foundation (No GitHub Yet)
1. **Authentication (better-auth)** - Users can sign up, log in
2. **Database schema** - Users, sessions tables
3. **Basic frontend shell** - React app with routing, auth pages

**Rationale:** Everything depends on user authentication. Get this working first.

### Phase 2: GitHub App Integration
1. **GitHub App registration** - Create app in GitHub, get credentials
2. **Installation flow** - OAuth redirect, store installation_id
3. **Basic API operations** - Test repo listing with installation token

**Rationale:** Sites require GitHub access. Prove the integration works before building site features.

### Phase 3: Site Creation
1. **Template repository** - Create Barae's Astro template
2. **Site creation flow** - Create repo, push template, enable Pages
3. **Site listing** - Show user's sites in dashboard

**Rationale:** Users need sites before they can create content.

### Phase 4: Content Management
1. **Content reading** - Fetch MDX files from repo
2. **Content writing** - Commit new/updated files
3. **Content listing** - Dashboard shows posts/pages

**Rationale:** Core value - users need to create and edit content.

### Phase 5: Editor
1. **Markdown editor** - Raw mode editing
2. **Visual editor** - Click-to-edit on preview
3. **Media uploads** - Image handling

**Rationale:** Editor quality defines UX, but basic CRUD comes first.

### Phase 6: Polish
1. **Themes/customization** - Visual settings
2. **SEO configuration** - Meta tags, OG images
3. **Custom domains** - Documentation and API support

**Rationale:** Nice-to-have features after core is solid.

---

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **GitHub API Rate Limits** | Not a concern | May need caching | GitHub Enterprise or partner program |
| **Database Load** | Single PostgreSQL | Read replicas | Sharding by user |
| **Build Times** | GitHub Actions free tier | Users may hit Actions limits | Users self-manage Actions billing |
| **Image Storage** | Git repos work fine | Repo size limits (1GB) | Need CDN/external storage |
| **Webhook Volume** | Synchronous processing | Queue (BullMQ/Redis) | Dedicated webhook service |

**Recommendation:** Design for 10K users from start. Add queuing infrastructure, implement caching. The jump to 1M requires architectural changes regardless.

---

## Open Questions for Phase-Specific Research

1. **Editor library selection** - Need to research: TipTap, Milkdown, BlockNote for visual/markdown hybrid editing
2. **Template extensibility** - How to let users customize without breaking updates
3. **Conflict resolution** - What happens if user edits in both Barae and directly in GitHub?
4. **Offline support** - Is PWA/offline editing feasible?

---

## Sources

### HIGH Confidence (Official Documentation)
- [GitHub App Authentication](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation) - Installation token flow
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages) - Pages configuration endpoints
- [GitHub Webhook Events](https://docs.github.com/en/webhooks/webhook-events-and-payloads) - Event payload structures
- [@octokit/auth-app](https://github.com/octokit/auth-app.js/) - GitHub App authentication library
- [Astro GitHub Pages Deployment](https://docs.astro.build/en/guides/deploy/github/) - Official workflow

### MEDIUM Confidence (Verified Patterns)
- [Decap CMS Architecture](https://decapcms.org/docs/architecture/) - Redux-based CMS architecture
- [TinaCMS Documentation](https://tina.io/docs) - Hybrid git/database approach
- [CloudCannon Git CMS](https://cloudcannon.com/git-cms/) - Commercial git-backed CMS patterns

### LOW Confidence (Community Sources)
- [Git-based CMS Comparison](https://dev.to/linkb15/top-5-git-based-cms-comparison-as-of-april-2024-4k1e) - Feature comparison
- [Monorepo Best Practices](https://www.graphite.com/guides/monorepo-frontend-backend-best-practices) - Monorepo structure patterns

---

## Quality Gate Verification

- [x] Components clearly defined with boundaries
- [x] Data flow direction explicit (Dashboard -> Backend -> GitHub -> Actions -> Pages)
- [x] Build order implications noted (6 phases with rationale)
- [x] GitHub App permissions and limitations documented
- [x] Astro template structure specified
- [x] Database schema outlined
- [x] Anti-patterns identified to avoid
