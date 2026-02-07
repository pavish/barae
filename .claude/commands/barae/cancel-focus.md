# /barae:cancel-focus — Cancel Current Focus

You are cancelling the entire active focus. This is a destructive operation — requires explicit confirmation.

## Pre-Flight

1. Read `.project/CURRENT_FOCUS.md` — if it doesn't exist, tell user there's no active focus and stop
2. Extract from CURRENT_FOCUS.md:
   - Focus name
   - Task list (all task IDs and descriptions)
3. Check for focus PR: `gh pr list --head focus/<focus-name> --state open`
4. List all task folders in `.project/tasks/`

## Step 1: Confirm with User

Display:
- Focus name
- Number of tasks (list them with IDs and titles)
- Whether a focus PR exists
- Warning: "This will close all PRs, delete all branches, and archive the focus as cancelled."

Ask for explicit confirmation before proceeding. Do NOT proceed without a clear "yes" from the user.

## Step 2: Clean Up Tasks

For each task in `.project/tasks/`:

1. **Close task PR** (if one exists and is open):
   ```bash
   gh pr list --head task/<task-id> --state open --json number -q '.[0].number'
   ```
   If a PR number is returned:
   ```bash
   gh pr close <number>
   ```
   If no PR exists or already closed, skip.

2. **Delete task branch locally** (if it exists):
   ```bash
   git branch -d task/<task-id>
   ```
   If `-d` fails (unmerged changes), warn user and ask: "Task branch `task/<task-id>` has unmerged changes. Force delete with `-D`?" Only use `-D` if user confirms.
   If the branch doesn't exist, skip.

3. **Delete task branch remotely** (if it exists):
   ```bash
   git push origin --delete task/<task-id>
   ```
   If the remote branch doesn't exist, skip.

Report progress as each task is cleaned up.

## Step 3: Close Focus PR

If a focus PR exists and is open:
```bash
gh pr close <number>
```
If no PR or already closed, skip.

## Step 4: Delete Focus Branch

1. **Switch to main first**:
   ```bash
   git checkout main && git pull origin main
   ```

2. **Delete focus branch locally** (if it exists):
   ```bash
   git branch -d focus/<focus-name>
   ```
   If `-d` fails (unmerged changes), warn user and ask: "Focus branch has unmerged changes. Force delete with `-D`?" Only use `-D` if user confirms.
   If the branch doesn't exist, skip.

3. **Delete focus branch remotely** (if it exists):
   ```bash
   git push origin --delete focus/<focus-name>
   ```
   If the remote branch doesn't exist, skip.

## Step 5: Archive as Cancelled

1. **Create archive directory**:
   ```
   .project/archive/<focus-name>-cancelled-<YYYYMMDD>/
   .project/archive/<focus-name>-cancelled-<YYYYMMDD>/tasks/
   ```
   Use today's date in YYYYMMDD format. The `-cancelled-<date>` suffix avoids conflicts if the same focus is attempted and cancelled multiple times.

2. **Move CURRENT_FOCUS.md to archive**:
   - Copy `.project/CURRENT_FOCUS.md` → `.project/archive/<focus-name>-cancelled-<YYYYMMDD>/FOCUS.md`
   - Update the `Status:` line (or add one) in the archived FOCUS.md to `cancelled`

3. **Move CURRENT_RESEARCH.md to archive** (if it exists):
   - Copy `.project/CURRENT_RESEARCH.md` → `.project/archive/<focus-name>-cancelled-<YYYYMMDD>/RESEARCH.md`

4. **Move task folders to archive**:
   - Move each folder in `.project/tasks/` → `.project/archive/<focus-name>-cancelled-<YYYYMMDD>/tasks/<task-id>/`

5. **Clean up active project files**:
   - Remove `.project/CURRENT_FOCUS.md`
   - Remove `.project/CURRENT_RESEARCH.md` (if it exists)
   - Remove all task folders from `.project/tasks/`

## Step 6: Commit and Ask to Push

```bash
git add .project/archive/
git rm .project/CURRENT_FOCUS.md
git rm .project/CURRENT_RESEARCH.md 2>/dev/null || true
git rm -r .project/tasks/*/ 2>/dev/null || true
git commit -m "chore(<focus-name>): archive cancelled focus"
```

**Ask user for explicit approval before pushing to main:**
"The archive commit is ready on main. Shall I push to origin/main?"

Only push after user confirms:
```bash
git push origin main
```

## Step 7: Verify Clean State

After all cleanup, verify:
- On `main` branch
- Focus branch deleted locally and remotely
- All task branches deleted locally and remotely
- Archive committed
- No stale `.project/CURRENT_FOCUS.md` or `.project/CURRENT_RESEARCH.md`

Report any discrepancies.

## Step 8: Checkpoint

Clear the checkpoint (since focus is cancelled, previous checkpoint content is stale). Write a minimal checkpoint noting the cancellation:
- Date
- What was cancelled
- Archive location
- "No active focus"

## Step 9: Offer Next Steps

Ask the user: "Would you like to create a new focus for the same problem area? I can start `/barae:new-focus` with context from the cancelled focus."

If yes, kick off `/barae:new-focus` and provide the cancelled focus's context (goals, learnings, what didn't work) as starting input.

## Rules
- Never proceed without explicit user confirmation
- Handle missing branches/PRs gracefully — skip with a note, don't error
- Never force-push
- Always switch to main before deleting focus branch
- Always archive before deleting — never lose the planning work
- The archive commit goes on main (since the focus branch is being deleted)
- Use `<focus-name>-cancelled-<YYYYMMDD>` naming to avoid archive conflicts
- Use `git branch -d` first; only escalate to `-D` with user approval
