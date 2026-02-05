# Barae

Barae is a GitHub-integrated git-native CMS for managing Astro-based websites for blogs, portfolios, and product sites, built for long-term maintenance.

Refer `./planning/PROJECT.md` when more information is needed on the project.

## Codebase Standards

All standards are in `.planning/codebase/`. The authority document is `.planning/codebase/STANDARDS.md`.

Individual topic docs: `backend.md`, `frontend.md`, `typescript.md`, `docker.md`, `dependencies.md`, `migrations.md`.

These documents are enforced on every code change. Consult the relevant topic doc before writing or reviewing code. Always follow the Priority Rules in `STANDARDS.md` and the patterns in the topic docs -- they are the source of truth for all code decisions.

## Skills (load only when relevant)

- `/fastify-best-practices` -- backend Fastify routes, plugins, handlers
- `/better-auth-best-practices` -- authentication features
- `/frontend-design` -- UI components and pages

Do NOT load all skills at once. Only invoke the skill that matches the current task area.

## Project Structure

- `backend/` -- Fastify API server (TypeScript, Drizzle ORM, better-auth)
- `frontend/` -- React 19 dashboard (Vite, Tailwind CSS, shadcn/ui)
- `shared/` -- Shared types and utilities
- `.planning/` -- Project planning, standards, and phase artifacts
