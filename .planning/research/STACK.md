# Technology Stack

**Project:** Barae - Git-backed Blogging Platform
**Researched:** 2026-02-03
**Overall Confidence:** HIGH

---

## Executive Summary

This stack research covers six dimensions for Barae's git-backed blogging platform: authentication, GitHub App integration, frontend framework, markdown editor, Astro templates, and image compression. The recommendations prioritize stable, well-maintained libraries that integrate cleanly with Barae's existing Fastify/Drizzle/PostgreSQL backend.

**Key insight:** The ecosystem has matured significantly. better-auth provides production-ready auth with native Drizzle support. Octokit handles all GitHub API needs. MDXEditor is the clear choice for dual-mode markdown/MDX editing despite its bundle size. Sharp dominates image compression.

---

## Recommended Stack

### 1. Authentication: better-auth with Fastify + Drizzle

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| [better-auth](https://www.better-auth.com/) | ^1.4.15 | Auth framework | HIGH |
| [fastify-better-auth](https://github.com/flaviodelgrosso/fastify-better-auth) | latest | Fastify plugin | MEDIUM |
| drizzleAdapter (built-in) | - | Database adapter | HIGH |

**Why better-auth:**
- Native Drizzle adapter with PostgreSQL support (`provider: "pg"`)
- Built-in email/password + GitHub OAuth (40+ social providers)
- Session management with 2x-3x faster queries via experimental joins
- CLI for schema generation (`npx @better-auth/cli@latest generate`)
- Active maintenance (1.4.15 released 12 hours ago as of research date)

**Configuration pattern:**
```typescript
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

export const auth = betterAuth({
  trustedOrigins: [process.env.AUTH_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true, // matches Drizzle conventions
  }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  experimental: { joins: true }, // 2x-3x faster queries
})
```

**Fastify integration gotchas:**
- Must convert Fastify requests to Fetch API `Request` objects
- Configure `@fastify/cors` with explicit trusted origins
- Add `trustedOrigins` array for cross-origin requests
- Ensure `"esModuleInterop": true` in tsconfig.json

**Sources:**
- [Better Auth Installation](https://www.better-auth.com/docs/installation) - HIGH confidence
- [Drizzle Adapter Docs](https://www.better-auth.com/docs/adapters/drizzle) - HIGH confidence
- [Fastify Integration Guide](https://www.better-auth.com/docs/integrations/fastify) - HIGH confidence

---

### 2. GitHub App Integration: Octokit

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| [octokit](https://github.com/octokit/octokit.js) | ^5.0.5 | Full GitHub SDK | HIGH |
| [@octokit/auth-app](https://github.com/octokit/auth-app.js) | ^8.1.2 | GitHub App auth | HIGH |

**Why octokit (not @octokit/rest alone):**
- All-batteries-included: REST, GraphQL, App auth, webhooks
- Automatic installation token generation and renewal (tokens expire in 1 hour)
- Full TypeScript support with 100% test coverage
- Handles JWT generation for GitHub App authentication

**Required GitHub App permissions:**
| Permission | Access | Purpose |
|------------|--------|---------|
| Repository | Write | Create repos from templates |
| Actions | Write | Configure workflow files |
| Pages | Write | Enable and configure GitHub Pages |
| Contents | Write | Commit files to repos |
| Metadata | Read | List user repos |

**Key API endpoints:**
```typescript
// Create repo from template
POST /repos/{template_owner}/{template_repo}/generate

// Configure GitHub Pages
POST /repos/{owner}/{repo}/pages
PUT /repos/{owner}/{repo}/pages  // Update CNAME, HTTPS, source

// Commit files
PUT /repos/{owner}/{repo}/contents/{path}
```

**Installation token pattern:**
```typescript
import { Octokit } from "octokit"
import { createAppAuth } from "@octokit/auth-app"

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
    installationId: installationId, // From webhook or API
  },
})
// SDK auto-generates and refreshes installation tokens
```

**Important:** GitHub App workflow file modifications require user OAuth token with `workflow` scope, not installation token.

**Sources:**
- [GitHub REST API Docs](https://docs.github.com/en/rest) - HIGH confidence
- [GitHub Pages API](https://docs.github.com/en/rest/pages/pages) - HIGH confidence
- [@octokit/auth-app npm](https://www.npmjs.com/package/@octokit/auth-app) - HIGH confidence

---

### 3. Frontend Dashboard: React + Vite + TanStack Query

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| [Vite](https://vite.dev/) | ^7.3.1 | Build tool | HIGH |
| [React](https://react.dev/) | ^19.x | UI framework | HIGH |
| [react-router](https://reactrouter.com/) | ^7.x | Routing (SPA mode) | HIGH |
| [@tanstack/react-query](https://tanstack.com/query) | ^5.90.x | Server state | HIGH |
| [Zustand](https://zustand.docs.pmnd.rs/) | ^5.x | Client state | HIGH |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.x | Styling | HIGH |

**Why this stack:**

**Vite 7:**
- Native ES Modules = instant dev server startup (<300ms)
- CRA officially deprecated (Feb 2025) - Vite is the standard
- React SWC plugin for faster transforms
- Node.js 18, 20, 22+ supported

**React Router 7 SPA mode:**
- Package simplified: just `react-router` (not `react-router-dom`)
- Enable SPA mode: `ssr: false` in `react-router.config.ts`
- Client-side loaders/actions still work
- Unified package with framework capabilities

**TanStack Query:**
- Server state caching, background updates, optimistic mutations
- React 18+ compatible, 5.90.x is latest stable
- Perfect for API data fetching patterns

**Zustand over Jotai:**
- Single store model fits dashboard patterns better
- 1.2KB bundle, no providers needed
- Hook-based API for selective state access
- Both by same author (Daishi Kato) - Zustand for global state

**Tailwind v4:**
- No `tailwind.config.js` needed
- Just `@import "tailwindcss"` in CSS
- Requires `@tailwindcss/vite` plugin
- 5x faster full builds, 100x faster incremental

**Setup command:**
```bash
npm create vite@latest dashboard -- --template react-swc-ts
cd dashboard
npm install react-router @tanstack/react-query zustand
npm install tailwindcss @tailwindcss/vite
```

**vite.config.ts:**
```typescript
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Sources:**
- [Vite Getting Started](https://vite.dev/guide/) - HIGH confidence
- [React Router SPA Mode](https://reactrouter.com/how-to/spa) - HIGH confidence
- [TanStack Query Docs](https://tanstack.com/query/latest) - HIGH confidence
- [Tailwind v4 Install](https://tailwindcss.com/docs) - HIGH confidence

---

### 4. Dual-Mode Markdown/Visual Editor: MDXEditor

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| [@mdxeditor/editor](https://mdxeditor.dev/) | ^3.52.3 | MDX WYSIWYG editor | HIGH |

**Why MDXEditor (not alternatives):**

| Editor | Bundle | MDX Support | WYSIWYG | Verdict |
|--------|--------|-------------|---------|---------|
| MDXEditor | 851KB gzip | Native | Inline | **Best fit** |
| @uiw/react-md-editor | 4.6KB gzip | No | Split-pane | Too basic |
| Tiptap + markdown | ~200KB | Manual | Inline | More work |
| Milkdown | ~150KB | Manual | Inline | More work |

**MDXEditor wins because:**
- Purpose-built for MDX content (JSX components in markdown)
- True WYSIWYG: formatting appears inline, no preview pane
- Built on Lexical (Meta's editor framework) - battle-tested
- Supports tables, images, code blocks, frontmatter
- Custom JSX component editing
- Active: v3.52.3 released Dec 2024, 3.2k stars

**Bundle size tradeoff:**
- 851KB gzipped is significant
- But: MDX editing is core feature, not optional
- Alternative: build custom on Lexical/ProseMirror = months of work
- Lazy-load editor on dashboard routes that need it

**Implementation pattern:**
```tsx
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  tablePlugin,
  imagePlugin,
  frontmatterPlugin,
  toolbarPlugin,
  jsxPlugin,
} from "@mdxeditor/editor"
import "@mdxeditor/editor/style.css"

<MDXEditor
  markdown={content}
  onChange={setContent}
  plugins={[
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    markdownShortcutPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: "typescript" }),
    tablePlugin(),
    imagePlugin({ imageUploadHandler: handleImageUpload }),
    frontmatterPlugin(),
    toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
    jsxPlugin({ jsxComponentDescriptors: baraeComponents }),
  ]}
/>
```

**Dual-mode implementation:**
- MDXEditor IS the visual mode (WYSIWYG)
- Add "Source" button to toggle raw markdown view (built-in diffSourcePlugin)
- Or use separate CodeMirror/Monaco for raw mode

**Known limitations:**
- Large bundle (mitigate with code splitting)
- GenericJsxEditor has inline rendering issues for complex components
- Toolbar components not tree-shakeable

**Sources:**
- [MDXEditor Documentation](https://mdxeditor.dev/) - HIGH confidence
- [MDXEditor GitHub](https://github.com/mdx-editor/editor) - HIGH confidence
- [Strapi Editor Comparison](https://strapi.io/blog/top-5-markdown-editors-for-react) - MEDIUM confidence

---

### 5. Astro Template Development

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| [Astro](https://astro.build/) | ^5.16.x | Static site generator | HIGH |
| [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) | ^4.3.13 | MDX support | HIGH |
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | latest | SEO | HIGH |
| [Tailwind CSS](https://tailwindcss.com/) | ^4.x | Styling | HIGH |

**Why Astro 5.x:**
- Content Layer API (new in 5.0): 5x faster Markdown, 2x faster MDX builds
- `glob()` loader replaces old `type: "content"` pattern
- Content can live anywhere (not restricted to `src/content/`)
- Native RSS, sitemap, SEO support
- Perfect for static blogs deployed to GitHub Pages

**Content Layer pattern (Astro 5.0+):**
```typescript
// src/content.config.ts (note: moved from src/content/config.ts)
import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
})

export const collections = { blog }
```

**Template structure (user's repo):**
```
src/
  content/
    blog/           # MDX blog posts
    pages/          # Static pages
    portfolio/      # Portfolio items
  content.config.ts # Collection definitions
  layouts/
  components/
public/
  images/           # User-uploaded images
astro.config.mjs
```

**GitHub Actions workflow (in template):**
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
        with:
          node-version: 22
```

**Sources:**
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) - HIGH confidence
- [Astro 5.0 Announcement](https://astro.build/blog/astro-5/) - HIGH confidence
- [@astrojs/mdx npm](https://www.npmjs.com/package/@astrojs/mdx) - HIGH confidence

---

### 6. Image Compression: Sharp

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| [Sharp](https://sharp.pixelplumbing.com/) | ^0.34.5 | Image processing | HIGH |

**Why Sharp (not Squoosh):**

| Library | Speed | Maintenance | Node.js | Verdict |
|---------|-------|-------------|---------|---------|
| Sharp | 4-5x faster than ImageMagick | Active | Native | **Use this** |
| @squoosh/lib | Slower | Deprecated 2023 | WASM | Avoid |
| Jimp | Slow | Active | Pure JS | Too slow |

**Sharp dominates because:**
- Powered by libvips - extremely fast C library
- Node.js 18.17.0+, Deno, Bun support
- Native mozjpeg and pngquant for optimal compression
- Reads: JPEG, PNG, WebP, GIF, AVIF, TIFF, SVG
- Outputs: JPEG, PNG, WebP, GIF, AVIF, TIFF

**Compression pipeline for Barae:**
```typescript
import sharp from "sharp"

async function compressImage(
  buffer: Buffer,
  filename: string
): Promise<{ buffer: Buffer; format: string }> {
  const image = sharp(buffer)
  const metadata = await image.metadata()

  // Resize if too large (GitHub repo size limits)
  const maxDimension = 1920
  if ((metadata.width ?? 0) > maxDimension || (metadata.height ?? 0) > maxDimension) {
    image.resize(maxDimension, maxDimension, { fit: "inside" })
  }

  // Convert to WebP for best compression (or keep original format)
  const webp = await image
    .webp({ quality: 80, effort: 6 })
    .toBuffer()

  return { buffer: webp, format: "webp" }
}
```

**Why compress before git commit:**
- GitHub repo size limit: 1GB
- GitHub Pages bandwidth: 100GB/month
- WebP typically 25-35% smaller than JPEG at same quality
- Sharp processes images in memory without temp files

**Sources:**
- [Sharp Documentation](https://sharp.pixelplumbing.com/) - HIGH confidence
- [Sharp vs Squoosh Comparison](https://sureshkhirwadkar.dev/posts/optimising-images-with-astro-image-copy/) - MEDIUM confidence

---

## Alternatives NOT Recommended

| Category | Rejected | Why Not |
|----------|----------|---------|
| Auth | Lucia | Deprecated in favor of better-auth |
| Auth | Auth.js/NextAuth | Next.js focused, complex Fastify setup |
| Auth | Passport.js | Outdated patterns, manual session handling |
| Editor | @uiw/react-md-editor | No MDX/JSX support, split-pane only |
| Editor | Tiptap | Requires building MDX support from scratch |
| Editor | Draft.js | Meta deprecated it |
| Editor | Slate | Low-level, years to build full editor |
| State | Redux | Overkill for dashboard, verbose |
| State | Jotai | Atomic model less suited for global state |
| Images | @squoosh/lib | CLI deprecated 2023, not maintained |
| Images | Jimp | Too slow for production |
| GitHub | direct fetch | Octokit handles auth, pagination, rate limits |

---

## Full Installation

### Backend (add to existing)
```bash
cd backend
npm install better-auth octokit @octokit/auth-app sharp
npm install -D @types/sharp
```

### Frontend (new)
```bash
npm create vite@latest dashboard -- --template react-swc-ts
cd dashboard
npm install react-router @tanstack/react-query zustand @mdxeditor/editor
npm install tailwindcss @tailwindcss/vite
```

### Astro Templates (new repos)
```bash
npm create astro@latest -- --template minimal
cd template-name
npx astro add mdx sitemap tailwind
```

---

## Version Summary Table

| Package | Version | Node.js Req | Last Updated |
|---------|---------|-------------|--------------|
| better-auth | ^1.4.15 | 16+ | Feb 2026 |
| octokit | ^5.0.5 | 18+ | Nov 2025 |
| @octokit/auth-app | ^8.1.2 | 18+ | Dec 2025 |
| vite | ^7.3.1 | 18/20/22+ | Jan 2026 |
| react | ^19.x | - | 2025 |
| react-router | ^7.x | - | 2025 |
| @tanstack/react-query | ^5.90.x | - | Feb 2026 |
| zustand | ^5.x | - | 2025 |
| tailwindcss | ^4.x | - | Jan 2025 |
| @mdxeditor/editor | ^3.52.3 | - | Dec 2025 |
| astro | ^5.16.x | 18+ | Jan 2026 |
| @astrojs/mdx | ^4.3.13 | - | Jan 2026 |
| sharp | ^0.34.5 | 18.17.0+ | Nov 2025 |

**Existing stack versions (from package.json):**
| Package | Current Version |
|---------|-----------------|
| fastify | ^5.7.0 |
| drizzle-orm | ^0.45.1 |
| typescript | ^5.9.3 |
| node | >=22.0.0 |

All recommended packages are compatible with Node.js 22+.

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| better-auth + Fastify + Drizzle | HIGH | Official docs verify all integrations |
| Octokit for GitHub App | HIGH | Official GitHub SDK, comprehensive docs |
| Vite + React + TanStack Query | HIGH | Industry standard, well-documented |
| MDXEditor | HIGH | Only mature MDX WYSIWYG option |
| Astro 5.x templates | HIGH | Official docs, Content Layer is stable |
| Sharp for images | HIGH | Dominant library, actively maintained |

---

## Open Questions for Implementation

1. **MDXEditor bundle splitting:** Verify lazy loading reduces initial bundle significantly
2. **GitHub App scopes:** Test exact permission set needed for all operations
3. **better-auth session storage:** Decide on cookie vs database sessions for Barae's use case
4. **Template versioning:** Strategy for updating user repos when Barae templates change
