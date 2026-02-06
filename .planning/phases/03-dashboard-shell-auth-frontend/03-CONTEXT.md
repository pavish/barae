# Phase 3: Dashboard Shell & Auth Frontend - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Browser-based authentication flows (signup, email verification, login, password reset) and the pluggable dashboard navigation shell. Users can complete the full auth lifecycle through the UI and land in a dashboard that serves as the shell for all future features. GitHub OAuth button is visible but non-functional (wired in Phase 4). Backend auth API already exists from Phase 2.

</domain>

<decisions>
## Implementation Decisions

### Auth page flow
- Single auth page with tabs for login and signup (e.g., `/auth`)
- Verify and reset flows handled as view states within the auth page, not separate routes
- After signup: form transforms inline to OTP verification input (no page redirect)
- After successful OTP verification: user is automatically logged in and redirected to dashboard
- Password reset: Claude's discretion on whether inline or separate pages, fitting the tabbed auth pattern
- OTP retry rules:
  - User can re-request OTP after 1-minute cooldown
  - After 3 failed verification attempts, locked out for 30 minutes
  - Handle email delivery failures gracefully (research best approaches for retry/resend UX)

### Dashboard layout
- **Mobile support is a top-class priority** — design mobile-first, ensure all flows work well on phone
- Bottom tab navigation on mobile, top horizontal navigation on desktop
- Navigation sections for Phase 3: Home and Settings only (more added in later phases)
- Header bar style: Claude's discretion — pick what fits the responsive layout best
- Home page: clear CTAs and steps, structured to evolve (pre-GitHub state, post-GitHub state, with repos/sites state). Exact content details deferred to implementation phase — design the layout to accommodate future states

### Auth form design
- Split layout: form on one side, brand illustration or marketing copy on the other (like Notion, Figma)
- On mobile: split layout collapses appropriately (likely form-only or stacked)
- Validation: inline errors below each invalid field + common error banner within the form for general errors (e.g., "invalid credentials")
- Avoid toast notifications unless absolutely necessary
- OTP input: individual digit boxes (6 digits), auto-advance focus, must support paste (pasting fills all boxes). Research best UX patterns for this
- GitHub OAuth button: visible but disabled with "Coming soon" or similar disabled state on login/signup

### Session & navigation guards
- Unauthenticated users accessing dashboard routes: silently redirect to auth page (login tab), then redirect back to original page after successful login
- Authenticated users visiting auth page: always redirect to dashboard
- Session expiry: both proactive detection (polling/heartbeat) AND lazy detection (on API 401 responses)
- On session expiry: show "Please log in again" message, then redirect to auth page
- Auth loading state: full-screen loader/spinner while auth state is being determined on page load (no blank flash)

### Claude's Discretion
- Password reset flow structure (inline vs separate views within the auth page)
- Dashboard header bar design (avatar dropdown, logo placement, etc.)
- Split layout specifics (illustration content, responsive collapse behavior)
- Loading spinner/skeleton design
- Exact polling interval for proactive session detection
- Home page placeholder content and CTA copy

</decisions>

<specifics>
## Specific Ideas

- Split layout auth pages like Notion/Figma — form on one side, brand/marketing on the other
- OTP individual digit boxes must support paste — filling all 6 boxes at once
- Bottom tabs on mobile, top nav on desktop — not a sidebar
- "Coming soon" disabled state for GitHub OAuth button (not hidden, not functional)
- Avoid toasts — prefer inline form errors and in-form banners
- Home page should show clear steps/CTAs that evolve: connect GitHub → see repos → create site (future phases fill these in)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-dashboard-shell-auth-frontend*
*Context gathered: 2026-02-06*
