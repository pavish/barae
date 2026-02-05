# Frontend Standards

These rules apply to all frontend code in `frontend/src/`. They are enforced on every code change.

## Stack

- **React 19** with TypeScript strict mode.
- **Vite 7** for bundling and dev server.
- **Tailwind CSS v4** for styling.
- **shadcn/ui** for component primitives (new-york style, neutral base color, CSS variables).

## No Frontend Environment Variables

- **Never use `import.meta.env` or environment variables in frontend code.** This is impossible in production static builds served by Caddy. There is no runtime to inject env vars.
- **For rare dev-only exceptions**, ask the user first.

## API Communication

- **Use the `apiFetch` wrapper** in `lib/api.ts` for all API calls. It uses a relative `/api` base path, includes credentials, sets `Content-Type: application/json`, and handles error responses.
- **No hardcoded API URLs.** The relative `/api` path works because Caddy proxies all `/api/*` requests to the backend.

```typescript
// Good
const data = await apiFetch<User>('/v1/users/me')

// Bad
const data = await fetch('http://localhost:3000/v1/users/me')
```

## Authentication Client

- **better-auth React client** in `lib/auth.ts`. Uses relative `/api` baseURL with no environment variables.
- **Plugins must match server plugins.** If the server uses `emailOTP`, the client must include `emailOTPClient()`.

```typescript
import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: '/api',
  plugins: [emailOTPClient()],
})
```

## State Management

- **TanStack Query for server state.** Default configuration: 5-minute `staleTime`, 1 retry. Configured in `lib/queryClient.ts`.
- **Zustand for client state.** Use for UI state that does not come from the server (sidebar open/closed, form drafts, theme preference).
- **Do not mix concerns.** Server data flows through TanStack Query. Client-only state lives in Zustand stores.

## Component Patterns

- **shadcn/ui components** are copied into the project (not imported from a package). They live in `src/components/ui/`.
- **Style: new-york.** Base color: neutral. CSS variables enabled.
- **Use the `cn()` utility** from `lib/utils.ts` for conditional class merging (combines `clsx` + `tailwind-merge`).

```typescript
import { cn } from '@/lib/utils'

<div className={cn('base-class', isActive && 'active-class')} />
```

## Routing

- **React Router** for client-side routing. Currently scaffolded, not yet implemented.
- **Route structure TBD** in Phase 3 (Dashboard Shell).

## Import Alias

- **`@/` maps to `src/`** in both `tsconfig.json` and `vite.config.ts`.

```typescript
// Good
import { authClient } from '@/lib/auth'

// Bad
import { authClient } from '../../lib/auth'
```

## File Organization

```
frontend/src/
  components/
    ui/           # shadcn/ui primitives (Button, Input, Card, etc.)
    [feature]/    # Feature-specific components
  lib/
    api.ts        # apiFetch wrapper
    auth.ts       # better-auth React client
    queryClient.ts # TanStack Query client
    utils.ts      # cn() and shared utilities
  pages/          # Page components (Phase 3+)
  app.tsx         # Root component with providers
  main.tsx        # React root entry point
  index.css       # Tailwind + shadcn/ui theme variables
```

## Styling

- **Tailwind CSS v4** with CSS-first configuration.
- **CSS variables** for theme colors (defined in `index.css`, consumed by shadcn/ui).
- **No inline style objects.** Use Tailwind utility classes.
- **Responsive design** with Tailwind breakpoint prefixes (`sm:`, `md:`, `lg:`).
