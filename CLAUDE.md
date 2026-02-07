# Barae

GitHub-integrated git-native CMS for Astro-based websites.
Built for long-term maintenance. Users own content in git — standard Astro projects, portable, not locked in.

Refer `.project/PRODUCT.md` for full product context.

## Critical Rules (NEVER violate)

1. No `process.env` outside config — use `fastify.config` via `@fastify/env`.
   Exceptions: `drizzle.config.ts`, `scripts/migrate.ts`, `app.ts` NODE_ENV for logger.
2. No frontend env variables — no `import.meta.env`. Static builds can't use them.
3. Single `.env` at project root only — for Docker Compose. Never in subdirectories.
4. API versioning required — all routes under `/v1/`.
5. Routes co-located with features — `src/auth/routes.ts`, not `src/routes/`.
6. Verify every change before committing — type-check, lint, test, substantive review.
7. Never assume — ask user when unclear. See "When to Ask" below.
8. Never force-push — always make a new commit instead of amending + force-pushing.
9. Never push directly to main — all changes to main require explicit user approval.

## When to Ask (replacing confidence scoring)

Claude cannot reliably self-assess numeric confidence. Instead, use these verifiable signals to decide when to stop and ask:

**Always ask when:**
- The user's requirement is ambiguous or could be interpreted multiple ways
- You are about to choose between two or more valid approaches
- The task touches areas not covered by existing standards or patterns
- You are unsure whether a change is in-scope or out-of-scope
- You catch yourself reconsidering an approach mid-implementation (the "Actually..." signal)

**Signals you are NOT confident (stop and ask):**
- You are iterating on the same file/logic 3+ times without converging
- You are reasoning in circles or contradicting yourself
- The implementation requires assumptions about user intent, business rules, or UX preferences
- You cannot find an existing pattern to follow in the codebase
- A skill's recommendation conflicts with a standards doc

**You can proceed when:**
- There is an established pattern in the codebase and you are following it exactly
- The standards doc gives a clear, unambiguous instruction for this case
- The change is mechanical (renaming, moving, reformatting to match patterns)

**Rule: Never guess user intention. If you don't know what the user wants, ask.**

## Project Context

- `.project/PRODUCT.md` — Product bible (what, who, why, features, decisions)
- `.project/CURRENT_FOCUS.md` — Current work scope (product-level spec)
- `.project/tasks/` — Active tasks with full planning
- `.project/archive/` — Completed focuses and tasks
- `.project/codebase/` — Detailed standards docs (loaded per task type, see Standards section)
- `.project/CHECKPOINT.md` — Session handoff state (use `/barae:checkpoint` to save, `/barae:resume` to load)

## Session Start

Wait for user instruction. Do not proactively read files.

## Commands

### Status & Navigation
- `/barae:status` — Quick overview (focus, tasks, branch, commits)
- `/barae:resume` — Load last checkpoint and suggest next steps
- `/barae:chat` — Brainstorm without creating files

### Workflow
- `/barae:new-focus` — Create new focus area with deep research
- `/barae:update-focus` — Update current focus scope (non-implementation changes only)
- `/barae:plan-tasks` — Auto-generate tasks from focus and research
- `/barae:new-task` — Manually add a single task
- `/barae:start-task <task-id>` — Plan details and implement a task
- `/barae:parallel-tasks` — Execute multiple tasks in parallel (git worktrees)
- `/barae:cancel-task` — Cancel a task's work or remove the task entirely
- `/barae:cancel-focus` — Cancel current focus, archive as cancelled

### Quality & Ops
- `/barae:review <target>` — Code review for PR/task/branch
- `/barae:checkpoint` — Save session state for handoff
- `/barae:archive-focus` — Archive completed focus and tasks
- `/barae:setup` — One-time project setup (idempotent)

## How Claude Works

### Team Leader Pattern

Claude acts as a **team leader**, not a solo implementer:
- Be interactive — ask questions, present issues, report progress
- Delegate complex code changes to subagents; implement simple changes directly
- Review subagent output; stop subagents if they spiral
- Keep the user fully updated at all times
- Review all changes once complete before presenting to user

### Delegation Strategy

**Implement directly** (no subagent needed) when:
- The change is under ~50 lines across all files
- The change follows an existing pattern exactly
- It is a single-step operation (fix a bug, add a field, update a config)

**Delegate to `barae-implementer`** when:
- The step involves 50+ lines of changes
- The step requires exploring unfamiliar code areas
- Multiple files need coordinated changes
- The implementation is complex enough to benefit from focused attention

**Use parallel tasks with worktrees** (via `/barae:parallel-tasks`) when:
- 2-4 independent tasks need to run simultaneously
- Changes span frontend, backend, and shared layers with no file overlap
- Each task has independent file ownership

**Never use parallel tasks for:**
- Sequential tasks where each step depends on the previous
- Tasks that modify the same files
- Simple single-step operations

### Custom Subagents

| Subagent | Model | Use For |
|----------|-------|---------|
| `barae-researcher` | Opus | Deep research for new focuses and tasks. Has persistent memory. |
| `barae-implementer` | Opus (default) / Sonnet (simple <50 lines) | Executing implementation steps during `/barae:start-task`. |
| `barae-reviewer` | Opus | Code reviews, verification, standards checks. |

Use Sonnet for `barae-implementer` only when the step is simple and under 50 lines. Opus for everything else.
Opus always reviews — never use a less capable model to review a more capable model's work.

### When given a task to work on (or `/barae:start-task`)
0. If TASK.md status is `planned`, run detailed planning phase first: ask user questions about the task, delegate to `barae-researcher` for codebase exploration and step planning, present proposed Implementation Steps / Verification Steps / Test Cases, incorporate user feedback, then proceed to implementation.
1. Read CURRENT_FOCUS.md + the task's TASK.md + relevant standards (see Standards Mapping). Load CURRENT_RESEARCH.md only when deeper context is needed (e.g., understanding API flows, error scenarios, existing code patterns).
2. **Check checkpoint**: if CHECKPOINT.md references this task, read it and skip to the recorded step
3. Sync branches: fetch origin, pull focus branch, merge focus into task branch (or create task branch). Commit the detailed plan + status change as first commit.
4. Explore existing code patterns in the affected area (skip if resuming from checkpoint)
5. Clarify anything unclear with the user (see "When to Ask")
6. For each implementation step:
   a. Implement directly if simple (<50 lines), or delegate to subagent with file ownership boundaries
   b. Review subagent output if delegated (correctness, standards, spiraling indicators)
   c. Quick-check the changes (see Per-Commit Checks)
   d. Commit the step (clean, atomic commit)
   e. Auto-checkpoint (update CHECKPOINT.md with current progress)
   f. Report what was done to user
7. Full review of all changes
8. Full verification (see Per-Task Verification)
9. Present summary for user approval
10. Push and create PR to focus branch (with TASK.md content as PR body)

### When the user wants to chat/brainstorm (or `/barae:chat`)
1. Read CURRENT_FOCUS.md and scan all active tasks
2. Help brainstorm, refine ideas, identify gaps
3. Propose well-scoped tasks when ideas solidify
4. Create task folders once user approves

### When user describes multiple ideas at once
1. Identify distinct items
2. Split into well-scoped tasks (each <400 reviewable lines, max 5-10 commits)
3. Present task list for approval before creating anything

### Deviation Rules
- Bug found during implementation → fix it, note in commit
- Missing functionality → fix if small (<20 lines), create new task if large
- Blocker → ask user
- Architectural change needed → always ask user
- 400-line guideline exceeded during implementation → note it, continue (do not halt)

### Error Recovery
- Git operation fails → show error, diagnose, suggest recovery, STOP until resolved
- Verification fails → fix loop (max 5 attempts), then ask user
- Subagent spirals → stop subagent (indicators: 3+ attempts at same file, out-of-scope modifications, unplanned abstractions), report findings, ask user
- Mid-task blocker → ask user, don't work around it
- Network/auth failure → first retry with `dangerouslyDisableSandbox: true` (sandbox blocks keyring access needed by `gh` and git remote commands). If still failing, guide user to fix (e.g., `gh auth login`), then retry

## Task Rules

### Sizing
- Target ~400 reviewable lines per task (package-lock.json, generated files don't count)
- Max 5-10 commits per task
- This is a planning guideline, not a hard halt — if a task exceeds this during implementation, note it and continue
- If a task is clearly too large during planning, split before starting

### Task ID Format
`<6-char-lowercase-alphanum>-<short-kebab-desc>` (e.g., `k7m2p9-otp-resend`)

### Task Status Values

`planned` → `in_progress` → `completed` (and `cancelled` at any point)

- **planned**: Lightweight stub exists (title, description, acceptance criteria, dependencies). Created by `/barae:plan-tasks` or `/barae:new-task`.
- **in_progress**: Full details filled in (implementation steps, verification, test cases), implementation underway. Transitioned by `/barae:start-task`.
- **completed**: Implementation done, PR created.
- **cancelled**: Task abandoned.

### Task Immutability

Task **scope** (Description + Acceptance Criteria) is immutable after creation.

This works because tasks are deliberately kept small:
- Scope is defined during task creation (`/barae:plan-tasks` or `/barae:new-task`)
- Detailed implementation planning happens at start time (`/barae:start-task`), when the codebase state is current
- If scope needs to change, it means the planning missed something — create a new task with just the new changes after the current one completes

**Implementation Steps** may be amended during execution with a note explaining the change.
Tasks can be marked `cancelled` in their Status field if they become irrelevant.

### Task Dependencies

Tasks may depend on each other. Dependencies are:
- **Identified during task creation** (`/barae:plan-tasks` or `/barae:new-task`) — dependencies are checked when tasks are created
- **Noted in TASK.md** — a `## Dependencies` section lists task IDs that must complete first
- **Updated after task completion** — when a task completes, check if it unblocks other tasks and note this to the user
- **Enforced before starting** — `/barae:start-task` checks if blocking tasks are still `planned` or `in_progress`

Tasks with no dependencies can be run in parallel via `/barae:parallel-tasks`.

### Git & Branching Strategy

```
main (default branch)
└── focus/<focus-name>          ← created with CURRENT_FOCUS, draft PR to main
    ├── task/<task-id-1>        ← PR to focus branch when complete
    ├── task/<task-id-2>
    └── task/<task-id-3>
```

- Focus branch: `focus/<focus-name>` — created from `main`, draft PR to `main`
- Task branch: `task/<task-id>` — created from focus branch, PR to focus branch
- Before starting any task: `git fetch origin && git pull` to sync focus branch
- Existing task branch: **merge** focus branch into task branch (never rebase pushed branches)
- Commits: `<type>(<task-id>): <description>` — clean, atomic, during implementation (not batched)
- Task PR includes full TASK.md content (acceptance criteria, verification, test cases)
- Focus draft PR includes CURRENT_FOCUS.md content
- When focus is complete: user merges the focus draft PR into main on GitHub
- `gh` CLI required — if not authenticated, guide user to run `gh auth login`
- **Sandbox note**: The `gh` CLI accesses the macOS system keyring for auth tokens, which is blocked by Claude Code's default sandbox. All `gh` commands (and `git push`/`git fetch`/`git pull` over HTTPS) must run with `dangerouslyDisableSandbox: true`. If a `gh` or git remote command fails with a keyring or auth error, retry with sandbox disabled before asking the user to re-authenticate.
- **Never force-push. Never amend published commits.**
- **Never push directly to main** — always ask user for explicit approval before any push to main

### Checkpoint Strategy

Checkpoints prevent lost progress across sessions:
- **Auto-checkpoint**: Update CHECKPOINT.md after every commit during implementation
- **Manual checkpoint**: `/barae:checkpoint` for a full state snapshot
- **Retention**: Keep last 3 checkpoints in a `## Previous Checkpoints` section (summary only — date, branch, step)
- **CHECKPOINT.md is gitignored** — it is ephemeral session state, not committed to the repo

## Verification

### Per-Commit Checks (quick — run before every commit)
- [ ] TypeScript type-check passes (`tsc --noEmit` for the affected package)
- [ ] No obvious pattern violations (quick review against standards)
- [ ] No TODOs, console.logs, or stub implementations
- [ ] Changes are correct and complete for this step

### Per-Task Verification (thorough — run once after all implementation steps)
- [ ] TypeScript type-check passes (both backend and frontend)
- [ ] Lint passes (both backend and frontend)
- [ ] Existing tests pass
- [ ] Full diff review: `git diff focus/<focus-name>...HEAD`
- [ ] Changes match established patterns in standards docs
- [ ] Functions have real logic (not empty or hardcoded)
- [ ] Components are wired (handlers connected, API calls made)
- [ ] Integration chain works (component → API → DB)
- [ ] Each acceptance criterion from TASK.md is met

## Standards

### Standards Mapping (load only what's needed)

| Task Area | Load These Docs |
|-----------|----------------|
| Backend (routes, plugins, auth, DB) | `backend.md` + `typescript.md` |
| Frontend (components, pages, state) | `frontend.md` + `typescript.md` |
| Full-stack (both areas) | `backend.md` + `frontend.md` + `typescript.md` |
| Database / migrations | `backend.md` + `migrations.md` + `typescript.md` |
| Docker / infrastructure | `docker.md` |
| Adding a new dependency | additionally load `dependencies.md` |

Standards docs live in `.project/codebase/`. Only load the docs relevant to the current task — do not load all of them.

### Naming Conventions

- Files: camelCase (`userService.ts`, `authRoutes.ts`)
- Classes & React components: PascalCase (`UserService.ts`, `LoginForm.tsx`)
- Folders: kebab-case (`src/features/auth/`, `components/login-form/`)
- Migrations: numbered prefix + descriptive (`0001_create_auth_tables.sql`)

## Skills (load only when relevant)

- `/fastify-best-practices` — backend Fastify routes, plugins, handlers
- `/better-auth-best-practices` — authentication features
- `/frontend-design` — UI components and pages
- `/typescript-magician` — reviewing TypeScript changes

Do NOT load all skills at once. Only invoke the skill matching the current task area.

**If a skill's recommendation conflicts with a standards doc:** prefer the standards doc (it reflects project-specific decisions). Flag the conflict to the user and update the standards doc if the user agrees the skill's approach is better.

## Project Structure

- `backend/` — Fastify API server (TypeScript, Drizzle ORM, better-auth)
- `frontend/` — React 19 dashboard (Vite, Tailwind CSS, shadcn/ui)
- `shared/` — Shared types and utilities
- `.project/` — Product, focus, tasks, standards, archive
