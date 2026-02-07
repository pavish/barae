# /barae:work-task — Execute a Planned Task

You are executing a planned task using the team leader pattern. Task ID: $ARGUMENTS

If no task ID provided:
1. List folders in `.project/tasks/`
2. For each, read first 8 lines of TASK.md to show ID, title, type
3. Ask user which task to work on

## Step 1: Load Context

1. Read `.project/CURRENT_FOCUS.md`
2. Read `.project/tasks/$ARGUMENTS/TASK.md`
3. Read relevant standards from `.project/codebase/` based on the Standards Mapping in CLAUDE.md:
   - Backend task → `backend.md` + `typescript.md`
   - Frontend task → `frontend.md` + `typescript.md`
   - Full-stack task → `backend.md` + `frontend.md` + `typescript.md`
   - Database/migration task → `backend.md` + `migrations.md` + `typescript.md`
   - Docker/infra task → `docker.md`
   - If adding new dependencies → additionally load `dependencies.md`

## Step 2: Check for Resume

If `.project/CHECKPOINT.md` exists and references this task:
1. Read CHECKPOINT.md
2. Note which implementation step was last completed
3. Skip Steps 3-4 below (branches already synced, code already explored)
4. Resume from the next implementation step in Step 5

If no checkpoint or checkpoint references a different task, continue normally.

## Step 3: Check Dependencies

If TASK.md has a `## Dependencies` section listing other task IDs:
1. Check each dependency task's status (read their TASK.md)
2. If any blocking task is still pending or in-progress, tell user and stop
3. If all dependencies are complete, proceed

## Step 4: Sync Branches

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

## Step 5: Explore

Before writing any code, explore existing code in the affected area:
- Find existing patterns to follow
- Understand the current state of files that will be modified
- Identify potential conflicts or dependencies

## Step 6: Clarify

Review TASK.md implementation steps. For anything unclear, ask the user (see "When to Ask" in CLAUDE.md). Never guess user intention.

## Step 7: Implement (Team Leader Pattern)

For each implementation step in TASK.md:

1. **Decide: direct or delegate?**
   - Under ~50 lines, follows existing pattern → implement directly
   - 50+ lines, complex, or unfamiliar code → delegate to `barae-implementer` subagent
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

## Step 8: Full Review

After all steps are complete:
- Review ALL changes together (not just individual steps): `git diff focus/<focus-name>...HEAD`
- Check cross-file consistency
- Verify all acceptance criteria from TASK.md are met

## Step 9: Per-Task Verification

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

## Step 10: Present to User

Summarize:
- What was built/changed
- Files modified
- Commits made (list SHAs and messages)
- Any deviations from the plan and why
- Any concerns or follow-up items
- Whether this unblocks any other tasks (check CURRENT_FOCUS.md task list)

Wait for user approval.

## Step 11: Ship (after user approval)

```bash
git push -u origin task/$ARGUMENTS
gh pr create --base focus/<focus-name> --title "<task title>" --body "$(cat .project/tasks/$ARGUMENTS/TASK.md)"
```

Commits were already made during Step 7. This step only pushes and creates the PR.

## Git Error Recovery

If any git command fails:
- **Branch already exists**: Ask user — switch to it, or use a different name?
- **Merge conflict**: Show conflicted files, ask user to resolve. After resolution, continue from where you left off.
- **Authentication failure**: Guide user to run `gh auth login`, then retry
- **Push rejected**: `git pull origin task/$ARGUMENTS` then merge, then retry push
- **Network failure**: Suggest retrying or checking connection

Do NOT proceed with subsequent steps until the error is resolved.

## Rules
- Never skip the review step — review ALL subagent output
- Never commit without running per-commit checks
- Never force-push
- If blocked, ask user — don't try to work around it
- Deviation rules from CLAUDE.md apply (small bug fix OK, large changes need new task)
- Commits happen during implementation (Step 7), not batched at the end
- Use merge (not rebase) for syncing with the focus branch
