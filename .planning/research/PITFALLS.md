# Domain Pitfalls: Git-Backed Blogging/CMS Platform

**Domain:** Git-backed CMS with hosted experience
**Researched:** 2026-02-03
**Overall Confidence:** MEDIUM-HIGH (verified against official docs where possible)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or major architectural problems.

---

### Pitfall 1: GitHub App Installation Token Expiration Handling

**What goes wrong:** Installation access tokens expire after 1 hour. Applications that don't handle token refresh properly fail silently or produce confusing errors when performing git operations hours after the user initiated them.

**Why it happens:** Developers test with fresh tokens and never encounter expiration during development. Long-running operations (large commits, batch operations) exceed the 1-hour window.

**Consequences:**
- Content commits fail partway through
- Users see cryptic 401 errors
- State becomes inconsistent between Barae's database and the git repo

**Prevention:**
- Use Octokit SDKs that handle token refresh automatically
- Never cache installation tokens beyond a single operation
- Implement token validation before multi-step operations
- Add clear error messages distinguishing auth failures from other errors

**Detection:**
- 401 errors appearing in production logs
- Operations that work in testing but fail intermittently in production
- User reports of "random" failures

**Phase relevance:** GitHub Integration phase - build token management correctly from the start.

**Confidence:** HIGH - [verified against GitHub official docs](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app)

---

### Pitfall 2: MDX User Content is Inherently Unsafe

**What goes wrong:** MDX allows arbitrary JavaScript execution. Users can (intentionally or accidentally) introduce XSS vulnerabilities, break their sites with bad React, or create security holes that affect other users if any content is rendered server-side.

**Why it happens:** MDX looks like "enhanced Markdown" but is actually "JavaScript with Markdown support." The security model is fundamentally different from sanitizable Markdown.

**Consequences:**
- XSS vulnerabilities in user sites
- Broken builds from invalid React syntax
- Potential for malicious content if any sharing/preview features exist
- Build failures that cascade through the template

**Prevention:**
- **Accept the risk explicitly**: MDX content is user-owned code, not user data
- **Never render user MDX on Barae's servers**: All MDX compilation happens in GitHub Actions on user's repo
- **Preview in iframe sandbox**: If showing previews in Barae dashboard, use sandboxed iframes
- **Provide safe Barae components**: Offer curated components (CodeBlock, Callout, Embed) that handle edge cases
- **Document the risk**: Users need to understand MDX = code

**Detection:**
- Plans to render MDX server-side
- Shared preview functionality between users
- Missing Content Security Policy headers

**Phase relevance:** Editor phase - establish MDX security boundaries before building the editor.

**Confidence:** HIGH - [MDX documentation explicitly warns about this](https://github.com/orgs/mdx-js/discussions/1371)

---

### Pitfall 3: Git Repository Bloat from Images

**What goes wrong:** Git stores every version of every file. Images updated frequently (logo iterations, reprocessed photos) cause exponential repo growth. A 100KB image updated weekly becomes 5MB in a year, and users hit GitHub's 1GB limit.

**Why it happens:** Git works great for text files but cannot diff binary files efficiently. Each "update" stores a complete copy. Users don't realize updating images differs from updating text.

**Consequences:**
- Clone times grow from seconds to minutes
- GitHub Pages builds slow dramatically
- Users hit GitHub's 1GB repo size recommendation
- New device setup becomes painful

**Prevention:**
- **Compress images aggressively before commit**: Use sharp/squoosh to compress to reasonable sizes
- **Generate unique filenames**: `post-hero-2026-02-03-abc123.jpg` instead of updating `hero.jpg`
- **Document image size guidelines**: Recommend max dimensions and file sizes
- **Implement upload limits**: Reject images over a threshold (e.g., 2MB)
- **Track repo size**: Show users their repo size in dashboard
- **Consider Git LFS for v2**: Plan architecture to support LFS later

**Detection:**
- Users reporting slow builds or clone times
- Repos approaching 500MB+
- Image directories growing faster than content

**Phase relevance:** Image handling phase - implement compression and unique naming from day one.

**Confidence:** HIGH - [well-documented Git limitation](https://www.git-tower.com/learn/git/faq/handling-large-files-with-lfs)

---

### Pitfall 4: Webhook 10-Second Response Timeout

**What goes wrong:** GitHub terminates webhook connections after 10 seconds without a 2XX response. Synchronous processing of webhook payloads causes missed events and inconsistent state.

**Why it happens:** Developers process webhooks synchronously during testing when operations are fast. Production introduces latency from database writes, external API calls, and queuing.

**Consequences:**
- GitHub marks deliveries as failed
- Events are lost or processed multiple times
- Barae's state diverges from actual repo state

**Prevention:**
- **Acknowledge immediately, process async**: Return 200 within milliseconds, queue actual processing
- **Use a job queue**: BullMQ or similar for background processing
- **Implement idempotency**: Handle duplicate deliveries gracefully using X-GitHub-Delivery header
- **Store raw payloads**: Persist payload before processing for debugging

**Detection:**
- Failed webhook deliveries in GitHub App settings
- State mismatches between Barae and repos
- Operations taking >1s in webhook handlers

**Phase relevance:** GitHub Integration phase - webhook architecture must be async from the start.

**Confidence:** HIGH - [GitHub official documentation](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks)

---

### Pitfall 5: Dual-Mode Editor State Synchronization

**What goes wrong:** Keeping raw Markdown and WYSIWYG views synchronized is architecturally difficult. Naive implementations lose formatting, corrupt content, or produce unexpected behavior when switching modes.

**Why it happens:** Markdown and DOM are different representations. Converting between them loses information (whitespace, specific syntax choices). Cursor position, selection state, and undo history don't transfer cleanly.

**Consequences:**
- Content corruption when switching modes
- Lost user edits
- Inconsistent preview rendering
- User frustration and distrust

**Prevention:**
- **Use a single AST as source of truth**: Libraries like TOAST UI Editor or Milkdown maintain one data model rendered to both views
- **Don't convert between formats**: Avoid Markdown->DOM->Markdown round trips
- **Test mode switching extensively**: Build test suite that switches modes with various content types
- **Limit WYSIWYG capabilities**: Not all Markdown features need visual editing equivalents

**Detection:**
- Content changes unexpectedly after mode switch
- Whitespace or formatting differences
- Cursor jumps or selection loss
- User complaints about "weird behavior"

**Phase relevance:** Editor phase - choose editor library carefully, architecture defines success.

**Confidence:** MEDIUM - [documented by TOAST UI team](https://toastui.medium.com/the-need-for-a-new-markdown-parser-and-why-e6a7f1826137)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded user experience.

---

### Pitfall 6: GitHub Rate Limit Exhaustion

**What goes wrong:** GitHub App installation tokens get 5,000 requests/hour minimum, scaling with org size. Heavy operations (listing files, fetching content, committing) can exhaust limits during bursts.

**Why it happens:** Testing with single users doesn't reveal rate limit patterns. Inefficient API usage (fetching full trees instead of specific files) multiplies requests.

**Consequences:**
- 429 errors during peak usage
- Operations fail midway
- Users can't save content

**Prevention:**
- **Monitor rate limit headers**: Track X-RateLimit-Remaining in every response
- **Implement caching**: Cache file listings and content with short TTLs
- **Use conditional requests**: ETags to avoid fetching unchanged content
- **Batch operations**: Use Git tree API to commit multiple files in one request
- **Backoff gracefully**: Implement exponential backoff before hitting limits

**Detection:**
- Monitor X-RateLimit-Remaining proactively
- Log requests per user per hour
- Alert when approaching 80% of limit

**Phase relevance:** GitHub Integration phase - design API usage patterns with limits in mind.

**Confidence:** HIGH - [GitHub official documentation](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)

---

### Pitfall 7: Merge Conflicts on User Content

**What goes wrong:** Users edit content in Barae while also making direct repo changes (or vice versa). Conflicting commits create merge conflicts that users can't resolve through Barae's UI.

**Why it happens:** Git-based CMS inherently supports multiple editors. Users expect "just works" behavior but git conflicts require manual resolution.

**Consequences:**
- Content commits fail
- Users must use git CLI to resolve
- Barae state shows stale content

**Prevention:**
- **Fetch before write**: Always get latest before committing
- **Detect conflicts early**: Check for upstream changes before save
- **Auto-merge when possible**: Non-overlapping changes can be merged automatically
- **Clear error messages**: Explain what happened and how to resolve
- **Branch-based editing (v2)**: Consider draft branches that merge via PR

**Detection:**
- Commit failures with merge conflict errors
- Users reporting "can't save" errors
- Divergent content between Barae view and actual repo

**Phase relevance:** Content Management phase - handle concurrent editing gracefully.

**Confidence:** MEDIUM - [general git-based CMS challenge](https://www.sanity.io/blog/you-should-never-build-a-cms)

---

### Pitfall 8: Astro Template Version Drift

**What goes wrong:** Barae templates are forked to user repos and never updated. As Astro releases breaking changes (Astro 6 requires Node 22, drops Astro.glob()), user sites break or can't use new features.

**Why it happens:** Template forking creates a one-time copy. No mechanism exists to propagate template improvements to existing sites.

**Consequences:**
- User sites break on Astro major versions
- Security vulnerabilities in old dependencies
- Feature disparity between new and old sites
- Support burden for multiple template versions

**Prevention:**
- **Version templates explicitly**: Track which template version each site uses
- **Design for upgradeability**: Keep customization separate from template core
- **Provide upgrade paths**: Document breaking changes, offer migration guides
- **Consider template updates feature (v2)**: Allow users to pull template updates
- **Pin dependencies carefully**: Use exact versions, test upgrades

**Detection:**
- Users reporting build failures after inactivity
- Increasing support requests about outdated dependencies
- Security advisories affecting template dependencies

**Phase relevance:** Templates phase - design template architecture for longevity.

**Confidence:** MEDIUM - [Astro 6 breaking changes documented](https://astro.build/blog/astro-6-beta/)

---

### Pitfall 9: better-auth Fastify Integration Quirks

**What goes wrong:** better-auth is designed primarily for standard Node/Express-style frameworks. Fastify integration requires manual request/response conversion and has reported issues with route prefixing, error handling, and CORS.

**Why it happens:** Fastify uses a different request/response model than the Fetch API that better-auth expects. Integration requires bridging code that can have subtle bugs.

**Consequences:**
- Routes not working as expected
- Errors not captured properly
- OAuth redirects going to wrong URLs
- Timeout issues with prefixed routes

**Prevention:**
- **Test auth flows end-to-end**: Don't trust unit tests alone
- **Use community plugin**: Consider [fastify-better-auth](https://github.com/flaviodelgrosso/fastify-better-auth) for tested integration
- **Avoid route prefixes initially**: Start with `/api/auth/*` exactly as documented
- **Configure trusted origins explicitly**: List all frontend origins
- **Set up proper error handling**: Catch better-auth errors in Fastify's error handler

**Detection:**
- Routes returning empty responses
- OAuth flows redirecting incorrectly
- Errors appearing in console but not Fastify logs
- Timeouts on auth endpoints

**Phase relevance:** Authentication phase - test thoroughly with real OAuth flows.

**Confidence:** MEDIUM - [multiple GitHub issues reported](https://github.com/better-auth/better-auth/discussions/6266)

---

### Pitfall 10: GitHub Pages Build Timeouts

**What goes wrong:** GitHub Pages deployments have a 10-minute timeout. Large sites with many images or complex MDX processing can exceed this.

**Why it happens:** Astro processes all content at build time. Image optimization, MDX compilation, and sitemap generation scale with content volume.

**Consequences:**
- Builds fail silently
- Sites don't update
- Users lose confidence in deployment

**Prevention:**
- **Pre-optimize images**: Compress before commit, not during build
- **Monitor build times**: Track GitHub Actions duration
- **Cache aggressively**: Use GitHub Actions cache for node_modules and Astro build cache
- **Limit build scope**: Consider incremental builds for large sites (v2)

**Detection:**
- Build timeout errors in GitHub Actions
- Deployments stuck at 10 minutes
- Build times approaching 5+ minutes

**Phase relevance:** GitHub Integration phase - set up efficient build workflows.

**Confidence:** HIGH - [GitHub Pages official limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

---

## Minor Pitfalls

Mistakes that cause annoyance but are recoverable.

---

### Pitfall 11: GitHub App Private Key Security

**What goes wrong:** Private key gets committed to repo, logged, or stored insecurely. Compromised key allows attacker to act as Barae on all installations.

**Why it happens:** Developers treat it like other environment variables. Copy-paste accidents during deployment.

**Prevention:**
- **Use key vault**: Azure Key Vault, AWS Secrets Manager, or similar
- **Never log the key**: Ensure logging doesn't capture environment variables
- **Rotate keys**: GitHub allows multiple active keys for zero-downtime rotation
- **Audit access**: Limit who can access production secrets

**Phase relevance:** Infrastructure setup - configure secrets management before any GitHub App work.

**Confidence:** HIGH - [GitHub best practices](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app)

---

### Pitfall 12: MDX/React Version Mismatches

**What goes wrong:** Template uses React 18, but @mdx-js/react expects a different version. Build fails with cryptic "Element rendered from older version of React" errors.

**Why it happens:** MDX ecosystem has specific version requirements. Transitive dependencies can pull wrong versions.

**Prevention:**
- **Pin MDX dependency versions**: Use exact versions in templates
- **Test builds with fresh installs**: npm ci, not npm install
- **Document version requirements**: Specify Node and npm versions
- **Use Astro's built-in MDX**: Prefer @astrojs/mdx over raw @mdx-js

**Detection:**
- Build errors mentioning React version
- "Multiple copies of React" warnings

**Phase relevance:** Templates phase - lock down dependency versions.

**Confidence:** HIGH - [known issue documented](https://github.com/vercel/next.js/issues/67573)

---

### Pitfall 13: Webhook Secret Verification Bypass

**What goes wrong:** Webhook signature verification is implemented incorrectly or disabled "temporarily" during development. Attackers can send forged webhooks.

**Why it happens:** Verification adds complexity during development. "I'll enable it later" becomes permanent.

**Prevention:**
- **Enable from day one**: Never accept unverified webhooks, even in development
- **Use X-Hub-Signature-256**: Not the older X-Hub-Signature
- **Test with actual GitHub payloads**: Don't mock signature verification

**Detection:**
- No signature verification in webhook handler code
- Commented-out verification "for testing"

**Phase relevance:** GitHub Integration phase - implement security correctly from the start.

**Confidence:** HIGH - [GitHub best practices](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks)

---

### Pitfall 14: GitHub Pages Bandwidth/Size Limits

**What goes wrong:** Popular sites exceed 100GB/month bandwidth or repos exceed 1GB size. Sites get rate limited or fail to deploy.

**Why it happens:** Limits seem generous but image-heavy sites can hit them. Users don't monitor usage.

**Prevention:**
- **Compress images aggressively**: Biggest bandwidth saver
- **Consider CDN (v2)**: Cloudflare in front of GitHub Pages
- **Monitor repo size**: Show in Barae dashboard
- **Document limits clearly**: Set expectations upfront

**Detection:**
- 429 errors on GitHub Pages
- Deploy failures mentioning size

**Phase relevance:** Content Management phase - track and display usage metrics.

**Confidence:** HIGH - [GitHub Pages official limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|----------------|------------|
| Authentication | better-auth Fastify quirks (#9) | Use community plugin, test OAuth flows end-to-end |
| GitHub Integration | Token expiration (#1), Webhook timeout (#4), Rate limits (#6) | Use Octokit SDK, async webhook processing, cache API responses |
| Content Management | Merge conflicts (#7), Image bloat (#3) | Fetch-before-write, compress images, unique filenames |
| Editor | MDX security (#2), State sync (#5) | Never render user MDX server-side, use single-AST editor library |
| Templates | Version drift (#8), MDX versions (#12) | Version templates, pin dependencies, document upgrade paths |
| Images | Repo bloat (#3), Build timeouts (#10) | Pre-optimize, track repo size, cache builds |
| Hosting/Deploy | Pages limits (#14), Build timeouts (#10) | Monitor usage, aggressive caching, consider CDN |

---

## Sources

### Official Documentation (HIGH confidence)
- [GitHub App Rate Limits](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/rate-limits-for-github-apps)
- [REST API Rate Limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [GitHub Webhook Best Practices](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks)
- [GitHub Pages Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [Managing GitHub App Private Keys](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/managing-private-keys-for-github-apps)
- [GitHub App Best Practices](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/best-practices-for-creating-a-github-app)

### Framework/Library Documentation (HIGH confidence)
- [better-auth Fastify Integration](https://www.better-auth.com/docs/integrations/fastify)
- [MDX Security Discussion](https://github.com/orgs/mdx-js/discussions/1371)
- [Astro 6 Breaking Changes](https://astro.build/blog/astro-6-beta/)

### Community/Blog Sources (MEDIUM confidence)
- [TOAST UI Editor Architecture](https://toastui.medium.com/the-need-for-a-new-markdown-parser-and-why-e6a7f1826137)
- [Git LFS Overview](https://www.git-tower.com/learn/git/faq/handling-large-files-with-lfs)
- [Git Performance Guide](https://www.git-tower.com/blog/git-performance)
- [better-auth Fastify Discussion](https://github.com/better-auth/better-auth/discussions/6266)
- [fastify-better-auth Plugin](https://github.com/flaviodelgrosso/fastify-better-auth)
- [MDX React Version Issues](https://github.com/vercel/next.js/issues/67573)

---

*Note: Pitfalls marked as MEDIUM confidence should be validated during implementation. They are based on community reports and may have been addressed in recent releases.*
