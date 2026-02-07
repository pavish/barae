# /barae:start-task — Plan and Implement a Task

You are planning the details of a task and then implementing it. Task ID: $ARGUMENTS

If no task ID provided:
1. List folders in `.project/tasks/`
2. For each, read first 8 lines of TASK.md to show ID, title, status
3. Ask user which task to start

---

## Phase 1: Interactive Planning

### Step 1: Load Context

1. Read `.project/CURRENT_FOCUS.md`
2. Read `.project/tasks/$ARGUMENTS/TASK.md`
3. Read relevant standards from `.project/codebase/` based on the Standards Mapping in CLAUDE.md:
   - Backend task → `backend.md` + `typescript.md`
   - Frontend task → `frontend.md` + `typescript.md`
   - Full-stack task → `backend.md` + `frontend.md` + `typescript.md`
   - Database/migration task → `backend.md` + `migrations.md` + `typescript.md`
   - Docker/infra task → `docker.md`
   - If adding new dependencies → additionally load `dependencies.md`
4. Load `.project/CURRENT_RESEARCH.md` only when deeper context is needed (e.g., understanding API flows, error scenarios, existing code patterns)

### Step 2: Check for Resume

If `.project/CHECKPOINT.md` exists and references this task:
1. Read CHECKPOINT.md
2. If the checkpoint shows planning is complete (status `detailed` or `in_progress` with Implementation Steps already in TASK.md), skip to **Phase 2, Step 9**
3. If the checkpoint shows implementation is underway, skip to the recorded step in Phase 2
4. If no checkpoint or checkpoint references a different task, continue normally

### Step 3: Check Dependencies

If TASK.md has a `## Dependencies` section listing other task IDs:
1. Check each dependency task's status (read their TASK.md)
2. If any blocking task is still `planned`, `detailed`, or `in_progress`, tell user and stop
3. If all dependencies are `completed`, proceed

### Step 4: Check Task Status

- `planned` → proceed with planning (Phase 1)
- `detailed` → planning already done. Ask user: "This task already has implementation details from a previous session. Want to reuse them or re-plan?" If reuse, skip to Phase 2, Step 9. If re-plan, proceed with Phase 1.
- `in_progress` → resume from checkpoint (Phase 2)
- `completed` → inform user the task is already done
- `cancelled` → inform user the task was cancelled, ask if they want to reopen it

### Step 5: Ask User Questions

Before researching, ask the user about this task:
- Any priorities or concerns for this task?
- Specific areas they want to focus on or avoid?
- Any constraints not captured in the acceptance criteria?
- Anything they've learned since the task was created?

Always ask: **"Is there anything else you want me to know before I research this?"**

Wait for user's answers before proceeding.

### Step 6: Research and Plan (delegate to `barae-researcher` subagent — Opus)

Delegate to the `barae-researcher` subagent with:
- The user's answers from Step 5
- CURRENT_FOCUS.md context
- The lightweight TASK.md content (Description + Acceptance Criteria)
- Instruction to read `.project/PRODUCT.md` for product context
- Instruction to explore existing codebase in the affected area
- Instruction to read relevant standards from `.project/codebase/` (per Standards Mapping in CLAUDE.md)

The subagent will:
- Check its persistent memory for existing knowledge about this area
- Explore the codebase to find patterns, existing code to build on
- Plan specific implementation steps (with file paths and what changes)
- Define verification steps and test cases
- Update its memory with new findings

**Do NOT modify the Description or Acceptance Criteria** — scope is immutable after creation.

### Step 7: Present the Plan

Show the user the proposed additions to TASK.md:
- **Implementation Steps** — numbered, with specific file paths and what changes
- **Verification Steps** — how to verify the implementation
- **Test Cases** — input → expected output

Ask: **"Does this plan look right? Anything to add, remove, or change?"**

### Step 8: Incorporate Feedback and Save Plan

If the user requests changes:
1. Adjust the Implementation Steps, Verification Steps, or Test Cases as requested
2. Re-present the updated plan
3. Loop until user approves

Once approved:
1. Update TASK.md with the full details (Implementation Steps, Verification Steps, Test Cases)
2. Add `**Detailed**: <YYYY-MM-DD HH:MM>` metadata line
3. Change `**Status**` to `detailed`
4. Commit the plan (on the focus branch or task branch if it exists):
   ```bash
   git add .project/tasks/$ARGUMENTS/TASK.md
   git commit -m "plan($ARGUMENTS): add implementation details"
   ```
5. Save a checkpoint

Proceed to Phase 2.

---

## Phase 2: Implementation

### Step 9: Sync Branches and Begin Implementation

```bash
git fetch origin
git checkout focus/<focus-name> && git pull origin focus/<focus-name>
```

If the task branch already exists:
```bash
git checkout task/$ARGUMENTS && git pull origin task/$ARGUMENTS
git merge focus/<focus-name>
```

If the task branch does not exist:
```bash
git checkout -b task/$ARGUMENTS
```

Change `**Status**` in TASK.md to `in_progress`. Commit:
```bash
git add .project/tasks/$ARGUMENTS/TASK.md
git commit -m "chore($ARGUMENTS): begin implementation"
```

### Step 10: Explore

Before writing any code, explore existing code in the affected area:
- Find existing patterns to follow
- Understand the current state of files that will be modified
- Identify potential conflicts or dependencies

### Step 11: Clarify

Review implementation steps. For anything unclear, ask the user (see "When to Ask" in CLAUDE.md). Never guess user intention.

### Step 12: Implement (Team Leader Pattern)

For each implementation step in TASK.md:

1. **Decide: direct or delegate?**
   - Under ~20 lines, follows existing pattern → implement directly
   - 20+ lines, complex, or unfamiliar code → delegate to `barae-implementer` subagent
   - Default to delegation unless truly trivial
   - For delegated work: use Opus for complex steps, Sonnet for simple (<50 line) steps

2. **If delegating** to `barae-implementer`:
   - Give the subagent the specific step, relevant file contents, and standards to follow
   - Include the context from CURRENT_FOCUS.md and TASK.md
   - Assign clear file ownership — which files the subagent should touch

3. **Review** (for delegated work):
   - Does it follow the codebase standards?
   - Is it correct and complete (no stubs, no TODOs)?
   - Is it spiraling? Indicators: 3+ attempts at the same file, modifying files outside the step's scope, creating unplanned abstractions. If so, stop the subagent and course-correct.
   - Are there security issues?

4. **Per-commit checks** (quick — before every commit):
   - TypeScript type-check passes (`tsc --noEmit` for the affected package)
   - No obvious pattern violations
   - No TODOs, console.logs, or stub implementations
   - Changes are correct and complete for this step

5. **Commit** the step's changes (clean, atomic commit):
   ```bash
   git add <specific files for this step>
   git commit -m "<type>($ARGUMENTS): <description of this step>"
   ```

6. **Auto-checkpoint**: Update `.project/CHECKPOINT.md` with current progress (step number, what was done, what's next)

7. **Report** to user what was done for this step

Repeat for each step. If a step reveals something unexpected, report to user before proceeding.

### Step 13: Compression Handling

If context is getting large (many implementation steps completed), save a full checkpoint, assess remaining work. If significant work remains, create a new follow-up task with the remaining steps, place it immediately after the current task in CURRENT_FOCUS.md, set current task to `completed` for the work done so far, and instruct the user: "Context is getting large. Please run `/clear` and then `/barae:start-task <new-task-id>` to continue."

### Step 14: Full Review

After all steps are complete:
- Review ALL changes together (not just individual steps): `git diff focus/<focus-name>...HEAD`
- Check cross-file consistency
- Verify all acceptance criteria from TASK.md are met

### Step 15: Per-Task Verification

Delegate verification to the `barae-reviewer` subagent (Opus):
- TypeScript type-check (backend and frontend)
- Lint (backend and frontend)
- Tests (if they exist)
- Grep for TODOs, console.logs, stub implementations
- Standards compliance check
- Integration wiring check

If verification fails:
- Review failure details
- Fix issues (implement directly if small, delegate if complex)
- Commit the fix: `git commit -m "fix($ARGUMENTS): <what was fixed>"`
- Re-run verification
- Max 5 fix loops — if still failing, stop and ask user

### Step 16: Present to User

Summarize:
- What was built/changed
- Files modified
- Commits made (list SHAs and messages)
- Any deviations from the plan and why
- Any concerns or follow-up items
- Whether this unblocks any other tasks (check CURRENT_FOCUS.md task list)

Wait for user approval.

### Step 17: Ship (after user approval)

```bash
git push -u origin task/$ARGUMENTS
gh pr create --base focus/<focus-name> --title "<task title>" --body "$(cat .project/tasks/$ARGUMENTS/TASK.md)"
```

After creating the PR, update TASK.md with the PR URL:
- Add `**PR**: <URL>` metadata line
- Commit: `git commit -m "chore($ARGUMENTS): add PR URL"`
- Push: `git push origin task/$ARGUMENTS`

Task status stays `in_progress` — completion happens when the PR is merged (detected by `/barae:status` or `/barae:archive-focus`).

Save a final checkpoint.

---

## Git Error Recovery

If any git command fails:
- **Branch already exists**: Ask user — switch to it, or use a different name?
- **Merge conflict**: Show conflicted files, ask user to resolve. After resolution, continue from where you left off.
- **Authentication failure**: First retry with `dangerouslyDisableSandbox: true` (the `gh` CLI and git remote commands need macOS keyring access which the sandbox blocks). If it still fails, guide user to run `gh auth login`, then retry
- **Push rejected**: `git pull origin task/$ARGUMENTS` then merge, then retry push
- **Network failure**: Suggest retrying or checking connection

Do NOT proceed with subsequent steps until the error is resolved.

## Rules
- Never skip the review step — review ALL subagent output
- Never commit without running per-commit checks
- Never force-push
- If blocked, ask user — don't try to work around it
- Deviation rules from CLAUDE.md apply (small bug fix OK, large changes need new task)
- Commits happen during implementation (Step 12), not batched at the end
- Use merge (not rebase) for syncing with the focus branch
- Task **scope** (Description + Acceptance Criteria) is immutable — do NOT modify them during planning or implementation
- **Implementation Steps** may be amended during execution with a note explaining the change
