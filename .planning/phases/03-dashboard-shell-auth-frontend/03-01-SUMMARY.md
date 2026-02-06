---
phase: 03-dashboard-shell-auth-frontend
plan: 01
subsystem: frontend-infrastructure
tags: [react-router, shadcn-ui, zustand, zod, routing, auth-guards]
requires:
  - 01-02 (frontend foundation with Vite, Tailwind, shadcn/ui config)
  - 02-02 (better-auth client in lib/auth.ts)
provides:
  - shadcn/ui component library (button, input, field, tabs, input-otp, card, separator, alert, avatar, dropdown-menu, badge, label)
  - React Router configuration with auth-guarded layouts
  - Zod validation schemas for all auth forms
  - Zustand auth view state machine
  - apiFetch 401 detection with auth:expired event
  - Session type export from lib/auth.ts
  - Placeholder pages for AuthPage, HomePage, SettingsPage
affects:
  - 03-02 (auth forms consume schemas, store, AuthPage placeholder)
  - 03-03 (dashboard shell wraps DashboardLayout Outlet, uses shadcn/ui components)
  - 03-04 (integration verification of all routing and guards)
tech-stack:
  added:
    - input-otp@1.4.2 (dependency for shadcn/ui InputOTP component)
  patterns:
    - Layout route pattern for auth guards (AuthLayout, DashboardLayout)
    - Auth view state machine via Zustand (login/signup/verify-otp/forgot-password/reset-password)
    - 401 detection via custom DOM event (auth:expired)
key-files:
  created:
    - frontend/src/components/ui/button.tsx
    - frontend/src/components/ui/input.tsx
    - frontend/src/components/ui/field.tsx
    - frontend/src/components/ui/tabs.tsx
    - frontend/src/components/ui/input-otp.tsx
    - frontend/src/components/ui/card.tsx
    - frontend/src/components/ui/separator.tsx
    - frontend/src/components/ui/alert.tsx
    - frontend/src/components/ui/avatar.tsx
    - frontend/src/components/ui/dropdown-menu.tsx
    - frontend/src/components/ui/badge.tsx
    - frontend/src/components/ui/label.tsx
    - frontend/src/lib/schemas/auth.ts
    - frontend/src/stores/authStore.ts
    - frontend/src/components/layout/FullScreenLoader.tsx
    - frontend/src/components/layout/AuthLayout.tsx
    - frontend/src/components/layout/DashboardLayout.tsx
    - frontend/src/routes.tsx
    - frontend/src/pages/AuthPage.tsx
    - frontend/src/pages/HomePage.tsx
    - frontend/src/pages/SettingsPage.tsx
  modified:
    - frontend/src/app.tsx
    - frontend/src/lib/api.ts
    - frontend/src/lib/auth.ts
    - frontend/package.json
    - frontend/package-lock.json
  deleted:
    - frontend/src/pages/.gitkeep
    - frontend/src/stores/.gitkeep
key-decisions:
  - AuthLayout and DashboardLayout are separate layout route components (not a single guard HOC)
  - DashboardLayout does NOT include the dashboard shell (header, nav) yet -- that wraps Outlet in Plan 03
  - Auth view state machine uses Zustand (not URL params or separate routes) per CONTEXT.md decisions
  - 401 detection dispatches a DOM CustomEvent rather than directly navigating (allows any listener to respond)
  - label.tsx added as auto-dependency of field.tsx by shadcn CLI
duration: ~2min
completed: 2026-02-06
---

# Phase 3 Plan 01: Foundation & Routing Infrastructure Summary

**One-liner:** shadcn/ui component library installed, React Router with auth-guarded layouts, Zod form schemas, Zustand auth state machine, and 401 detection wired into apiFetch

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~2min |
| Tasks | 2/2 |
| Deviations | 0 |

## Accomplishments

1. **Installed 12 shadcn/ui components** via CLI: button, input, field, tabs, input-otp, card, separator, alert, avatar, dropdown-menu, badge, plus label (auto-dependency of field). All compile cleanly.

2. **Created Zod validation schemas** for login, signup, forgot-password, and reset-password forms with type-safe inferred types exported.

3. **Created Zustand auth store** with view state machine managing transitions between login, signup, verify-otp, forgot-password, and reset-password views. Email is preserved across transitions.

4. **Created auth-guarded layout routes**: AuthLayout redirects authenticated users to dashboard; DashboardLayout redirects unauthenticated users to /auth with return-to location state. Both show FullScreenLoader during session resolution (no blank flash).

5. **Configured React Router** with createBrowserRouter: /auth behind AuthLayout, / and /settings behind DashboardLayout, catch-all redirect to /.

6. **Updated app.tsx** to render RouterProvider with QueryClientProvider (replaced placeholder content).

7. **Updated apiFetch** with 401 detection that dispatches `auth:expired` custom DOM event before throwing.

8. **Exported Session type** from lib/auth.ts for use by components that need session data typing.

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install shadcn/ui components | adf8644 | 12 component files in components/ui/, package.json |
| 2 | Create foundation files | f8dde5b | schemas/auth.ts, authStore.ts, routes.tsx, layouts, pages, app.tsx, api.ts, auth.ts |

## Files Created/Modified

### Created (21 files)
- `frontend/src/components/ui/` -- 12 shadcn/ui component files (button, input, field, label, tabs, input-otp, card, separator, alert, avatar, dropdown-menu, badge)
- `frontend/src/lib/schemas/auth.ts` -- Zod validation schemas + inferred types
- `frontend/src/stores/authStore.ts` -- Zustand auth view state machine
- `frontend/src/components/layout/FullScreenLoader.tsx` -- Full-screen loading spinner
- `frontend/src/components/layout/AuthLayout.tsx` -- Auth route guard (redirects authenticated users)
- `frontend/src/components/layout/DashboardLayout.tsx` -- Dashboard route guard (redirects unauthenticated users)
- `frontend/src/routes.tsx` -- React Router configuration
- `frontend/src/pages/AuthPage.tsx` -- Placeholder (replaced in Plan 02)
- `frontend/src/pages/HomePage.tsx` -- Placeholder (replaced in Plan 03)
- `frontend/src/pages/SettingsPage.tsx` -- Placeholder (replaced in Plan 03)

### Modified (3 files)
- `frontend/src/app.tsx` -- RouterProvider replaces placeholder content
- `frontend/src/lib/api.ts` -- 401 detection with auth:expired event
- `frontend/src/lib/auth.ts` -- Session type export added

### Deleted (2 files)
- `frontend/src/pages/.gitkeep` -- Replaced by real page files
- `frontend/src/stores/.gitkeep` -- Replaced by authStore.ts

## Decisions Made

1. **AuthLayout and DashboardLayout as separate components** -- Each layout handles its own auth guard logic. AuthLayout redirects authenticated users away; DashboardLayout redirects unauthenticated users to /auth. Both share FullScreenLoader for loading state.

2. **DashboardLayout does not include shell yet** -- The dashboard shell (header, nav, bottom tabs) is built in Plan 03 and will wrap the Outlet inside DashboardLayout.

3. **401 detection via CustomEvent** -- apiFetch dispatches `window.dispatchEvent(new CustomEvent('auth:expired'))` rather than navigating directly. This decouples the API layer from routing, allowing any component to listen and respond.

4. **label.tsx included** -- shadcn CLI automatically installed label.tsx as a dependency of field.tsx. This is expected and correct.

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

Plan 02 (Auth page & forms) and Plan 03 (Dashboard shell & pages) can proceed immediately. All prerequisites are in place:
- shadcn/ui components available for form building
- Zod schemas ready for react-hook-form integration
- Zustand store ready for auth view state management
- Route structure defined with placeholder pages ready to be replaced
- AuthLayout and DashboardLayout guards operational

## Self-Check

- [x] `frontend/src/components/ui/button.tsx` exists on disk
- [x] `frontend/src/lib/schemas/auth.ts` exists on disk
- [x] `git log --oneline --all --grep="03-01"` returns at least 1 commit

## Self-Check: PASSED
