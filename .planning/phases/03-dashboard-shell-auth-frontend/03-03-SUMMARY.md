---
phase: 03-dashboard-shell-auth-frontend
plan: 03
subsystem: frontend-dashboard
tags: [dashboard-shell, responsive-navigation, session-management, mobile-first]
requires:
  - 03-01 (routing infrastructure, shadcn/ui components, layout routes, Session type)
provides:
  - Responsive dashboard shell with header, top nav, bottom tabs, user menu
  - Session polling (5-min interval) and auth:expired event listener
  - Getting-started home page with disabled step cards
  - Settings page with account info and placeholder sections
affects:
  - 03-04 (integration plan verifies all dashboard navigation works end-to-end)
  - 04-xx (GitHub integration fills in home page CTAs and settings sections)
tech-stack:
  added: []
  patterns:
    - DashboardShell wrapper pattern (header + main + bottom tabs)
    - Responsive nav pattern (TopNav desktop, BottomTabs mobile)
    - Session management hooks (polling + event listener)
key-files:
  created:
    - frontend/src/components/layout/DashboardShell.tsx
    - frontend/src/components/layout/Header.tsx
    - frontend/src/components/layout/TopNav.tsx
    - frontend/src/components/layout/BottomTabs.tsx
    - frontend/src/components/layout/UserMenu.tsx
    - frontend/src/hooks/useSessionPolling.ts
    - frontend/src/hooks/useAuthExpiry.ts
  modified:
    - frontend/src/components/layout/DashboardLayout.tsx
    - frontend/src/pages/HomePage.tsx
    - frontend/src/pages/SettingsPage.tsx
key-decisions:
  - Session hooks (useSessionPolling, useAuthExpiry) wired inside DashboardShell, active for all dashboard routes
  - SettingsPage reads session via authClient.useSession() rather than receiving props (rendered as Outlet child)
  - AuthPage session-expired message handling documented as cross-plan note for Plan 04 integration
  - HomePage steps structured for evolution -- opacity-60 and "Coming soon" badges indicate future activation
patterns-established:
  - DashboardShell as wrapper inside DashboardLayout (shell receives session, renders Header/BottomTabs)
  - Navigation items defined as const arrays for easy extension in future phases
duration: ~3min
completed: 2026-02-06
---

# Phase 3 Plan 03: Dashboard Shell & Pages Summary

**One-liner:** Responsive dashboard shell with desktop top nav, mobile bottom tabs, avatar user menu with sign out, getting-started home page, settings page, and dual session expiry detection (5-min polling + 401 event listener)

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~3min |
| Tasks | 2/2 |
| Deviations | 0 |

## Accomplishments

1. **Built responsive dashboard shell** -- DashboardShell wraps all authenticated content with Header (top) and BottomTabs (bottom, mobile only). The shell is rendered inside DashboardLayout, receiving the authenticated session.

2. **Created Header component** with two responsive variants: desktop (h-16, logo + TopNav + UserMenu) and mobile (h-14, logo + UserMenu). Uses hidden/flex responsive Tailwind classes.

3. **Created TopNav** -- horizontal navigation links (Home, Settings) with NavLink active state styling. Desktop only (hidden on mobile).

4. **Created BottomTabs** -- fixed bottom tab bar with Home and Settings icons (lucide-react). Mobile only (hidden on md+). Safe area padding for mobile devices.

5. **Created UserMenu** -- Avatar with initials fallback, DropdownMenu with user name/email display, Settings navigation link, and Sign out action. Sign out calls `authClient.signOut()` then navigates to `/auth`.

6. **Created session management hooks** -- `useSessionPolling` polls `authClient.getSession()` every 5 minutes; `useAuthExpiry` listens for `auth:expired` CustomEvent from apiFetch. Both redirect to `/auth` with `{ expired: true }` state.

7. **Built HomePage** -- "Welcome to Barae" with 3-step getting-started cards (Connect GitHub, Choose a template, Create your site). All steps shown as disabled with opacity-60 and "Coming soon" badges.

8. **Built SettingsPage** -- Account card showing user name and email from session, plus a disabled "GitHub Account" section with "Coming soon" badge.

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Build DashboardShell, Header, TopNav, BottomTabs, UserMenu | f82cbee | DashboardShell.tsx, Header.tsx, TopNav.tsx, BottomTabs.tsx, UserMenu.tsx, DashboardLayout.tsx |
| 2 | Build HomePage, SettingsPage, and session management hooks | b489cba | HomePage.tsx, SettingsPage.tsx, useSessionPolling.ts, useAuthExpiry.ts, DashboardShell.tsx |

## Files Created/Modified

### Created (7 files)
- `frontend/src/components/layout/DashboardShell.tsx` -- Responsive dashboard wrapper (header + main + bottom tabs)
- `frontend/src/components/layout/Header.tsx` -- Dual-variant header (desktop/mobile)
- `frontend/src/components/layout/TopNav.tsx` -- Desktop horizontal navigation with NavLink
- `frontend/src/components/layout/BottomTabs.tsx` -- Mobile fixed bottom tab bar with icons
- `frontend/src/components/layout/UserMenu.tsx` -- Avatar dropdown with sign out
- `frontend/src/hooks/useSessionPolling.ts` -- 5-minute session polling hook
- `frontend/src/hooks/useAuthExpiry.ts` -- auth:expired event listener hook

### Modified (3 files)
- `frontend/src/components/layout/DashboardLayout.tsx` -- Wraps Outlet in DashboardShell with session
- `frontend/src/pages/HomePage.tsx` -- Replaced placeholder with getting-started content
- `frontend/src/pages/SettingsPage.tsx` -- Replaced placeholder with account info and settings

## Decisions Made

1. **Session hooks inside DashboardShell** -- useSessionPolling and useAuthExpiry are called inside DashboardShell so they are active whenever any dashboard route is mounted, and cleaned up when navigating away.

2. **SettingsPage reads session directly** -- Since SettingsPage is rendered as an Outlet child (not a direct child of DashboardShell), it uses `authClient.useSession()` directly rather than receiving session as props.

3. **AuthPage expired message is a cross-plan note** -- The hooks navigate with `{ state: { expired: true } }`. AuthPage (owned by Plan 02) should read `location.state?.expired` and show an alert. Plan 04 (integration) should verify this works or add it.

4. **Navigation items as const arrays** -- TopNav and BottomTabs define nav items as `const` arrays for easy extension when new sections are added in later phases.

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## Cross-Plan Notes

- **For Plan 02/04:** AuthPage should read `useLocation().state?.expired` and display a "Session expired. Please sign in again." alert at the top of the form. The hooks in this plan navigate with `{ state: { expired: true } }` but AuthPage rendering that message is not in this plan's scope.

## Next Phase Readiness

Plan 04 (integration verification) can proceed. All dashboard shell components, pages, and session management are operational:
- Dashboard shell renders correctly with responsive navigation
- Sign out works via UserMenu
- Session polling and 401 detection redirect to /auth
- HomePage and SettingsPage render meaningful content

## Self-Check

- [x] `frontend/src/components/layout/DashboardShell.tsx` exists on disk
- [x] `frontend/src/hooks/useSessionPolling.ts` exists on disk
- [x] `git log --oneline --all --grep="03-03"` returns at least 1 commit

## Self-Check: PASSED
