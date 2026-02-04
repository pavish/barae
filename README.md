# Barae

Open source git-native CMS for blogs, portfolios, and product sites.

> [!WARNING]
> Barae is in active development and not ready to use. Content below describes the planned v1 version.

## What is Barae?

Barae is a content management system where your content lives in your own GitHub repository. You manage posts through Barae's dashboard, but everything is stored as standard Markdown/MDX files in an Astro project you own.

If you stop using Barae, your site keeps working. The repository is a standard Astro project that can be edited with any text editor, IDE, or other CMS. You can use Barae as a hosted service or self-host it on your own infrastructure.

Barae's interface is designed for both technical and non-technical users. Git knowledge is not required, but power users can work directly with their repositories.

## Who is this for?

- Developers, creators, and small businesses who want a blog, portfolio, or product site without the mainteance overhead and vendor lock-in.
- People helping their non-technical family members and friends build blogs or portfolios, and let them take over.

## What does it offer?

- **Built for maintenance** - Purpose built for long-term upkeep, not just initial site creation.
- **No lock-in** - Your site is a standard Astro project that works with or without Barae.
- **Open source** - Self-host or use the hosted service.
- **Simple setup** - Connect GitHub, pick a template, start writing; SEO, RSS, sitemap, OG images, and social sharing included.
- **Auto-configured hosting** - CI/CD and deployment set up automatically. First version supports GitHub Actions and GitHub Pages, other hosts planned.
- **Dual-mode editing** - Switch between visual editor and raw markdown without losing formatting.
- **LLM-ready** - AI instructions included in templates so you can extend your site with tools like Claude or Cursor.

## How does it work?

1. Sign up and connect your GitHub account.
2. Choose a template and create a new site (creates a repository in your GitHub account).
3. Write and manage content through the Barae dashboard.
4. Changes are committed to your repository and automatically deployed.

## Why am I building this?

I have ideas for blog posts but I find website maintenance work annoying. I just want to note ideas on my phone, refine them later, and have the commits, SEO, deployment, and social media handled for me.

I help family and friends with their websites, but I'm not always around when they need changes. Most platforms lock non-technical users in, and I don't want that for them. I want them to update content themselves, or even customize visual aspects of their sites with AI tools, without depending on me and without breaking stuff.

Barae's strict repo structure and verification scripts before commits and in CI/CD make it easier for AI agents to verify their work, so when my family and friends use AI to modify the sites, I'm not worried about them breaking stuff. All state lives in git, so I can pick up where they left off, and recovering from mistakes is straightforward.

## What does "Barae" mean?

"Barae" is a Badaga word that means: To Write, Draw, or Construct.

Possible root words from close languages:
- "Varai" (Tamil), means: To Draw or Construct.
- "Bare" (Kannada), means: To Write.

## License

[MIT](LICENSE)
