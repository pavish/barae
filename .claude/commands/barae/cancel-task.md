# /barae:cancel-task — Cancel a Task

You are cancelling a task. Task ID: $ARGUMENTS

If no task ID provided:
1. List folders in `.project/tasks/`
2. For each, read first 8 lines of TASK.md to show ID, title, status
3. Ask user which task to cancel

## Pre-Flight

1. Read `.project/CURRENT_FOCUS.md` — if it doesn't exist, tell user there's no active focus and stop
2. Read `.project/tasks/$ARGUMENTS/TASK.md` — if it doesn't exist, tell user the task doesn't exist and stop
3. Get the focus name from CURRENT_FOCUS.md

## Step 1: Show Task State

Gather and display the current state:
- Task title and status from TASK.md
- Whether the task branch exists locally: `git branch --list task/$ARGUMENTS`
- Whether the task branch exists remotely: `git ls-remote --heads origin task/$ARGUMENTS`
- Whether a PR exists: `gh pr list --head task/$ARGUMENTS --state open`

## Step 2: Ask User What To Do

Present two options:

**Option A: Cancel work only (keep task for later)**
> Closes PR, deletes branch, resets task status. The task plan stays — you can pick it up again later.

**Option B: Cancel task entirely (delete everything)**
> Closes PR, deletes branch, removes the task folder and its entry from CURRENT_FOCUS.md. The task is gone.

Wait for user to choose before proceeding.

## Option A: Cancel Work Only

1. **Close PR** (if one exists and is open):
   ```bash
   gh pr close <number>
   ```
   If no PR exists or already closed, skip.

2. **Switch to focus branch** (if currently on the task branch):
   ```bash
   git checkout focus/<focus-name>
   ```

3. **Delete task branch locally** (if it exists):
   ```bash
   git branch -d task/$ARGUMENTS
   ```
   If `-d` fails (unmerged changes), warn the user: "The task branch has unmerged changes. Force delete with `-D`?" Only use `-D` if user confirms.
   If the local branch doesn't exist, skip.

4. **Delete task branch remotely** (if it exists):
   ```bash
   git push origin --delete task/$ARGUMENTS
   ```
   If the remote branch doesn't exist, skip.

5. **Reset TASK.md status**:
   - If TASK.md has Implementation Steps (i.e., detailed planning was done), set status to `detailed`
   - If TASK.md has no Implementation Steps (only Description + Acceptance Criteria), set status to `planned`

6. **Update CURRENT_FOCUS.md** task list entry back to unchecked:
   - Change `- [x]` to `- [ ]` for the task's entry (if it was checked)

7. **Commit and push on focus branch**:
   ```bash
   git add .project/tasks/$ARGUMENTS/TASK.md .project/CURRENT_FOCUS.md
   git commit -m "chore: cancel task $ARGUMENTS work"
   git push origin focus/<focus-name>
   ```

8. **Update focus PR description** — delegate to a Bash subagent to save context window:
   ```
   Find the focus PR number and update its body with the latest CURRENT_FOCUS.md:
   gh pr list --head focus/<focus-name> --state open --json number -q '.[0].number'
   gh pr edit <number> --body "$(cat .project/CURRENT_FOCUS.md)"
   ```
   Run with `dangerouslyDisableSandbox: true` (gh needs keyring access).

9. **Report** what was cleaned up (PR closed? Branch deleted? Status reset?)

## Option B: Cancel Task Entirely

1. **Close PR** (if one exists and is open):
   ```bash
   gh pr close <number>
   ```
   If no PR exists or already closed, skip.

2. **Switch to focus branch** (if currently on task branch):
   ```bash
   git checkout focus/<focus-name>
   ```

3. **Delete task branch locally** (if it exists):
   ```bash
   git branch -d task/$ARGUMENTS
   ```
   If `-d` fails (unmerged changes), warn the user: "The task branch has unmerged changes. Force delete with `-D`?" Only use `-D` if user confirms.
   If the local branch doesn't exist, skip.

4. **Delete task branch remotely** (if it exists):
   ```bash
   git push origin --delete task/$ARGUMENTS
   ```
   If the remote branch doesn't exist, skip.

5. **Delete task folder**:
   - Remove `.project/tasks/$ARGUMENTS/` directory entirely

6. **Remove task entry from CURRENT_FOCUS.md**:
   - Delete the line matching the task ID from the task list

7. **Commit and push on focus branch**:
   ```bash
   git rm -r .project/tasks/$ARGUMENTS/
   git add .project/CURRENT_FOCUS.md
   git commit -m "chore: cancel task $ARGUMENTS entirely"
   git push origin focus/<focus-name>
   ```

8. **Update focus PR description** — delegate to a Bash subagent to save context window:
   ```
   Find the focus PR number and update its body with the latest CURRENT_FOCUS.md:
   gh pr list --head focus/<focus-name> --state open --json number -q '.[0].number'
   gh pr edit <number> --body "$(cat .project/CURRENT_FOCUS.md)"
   ```
   Run with `dangerouslyDisableSandbox: true` (gh needs keyring access).

9. **Report** what was deleted (PR closed? Branch deleted? Task folder removed? Focus updated?)

## Step 3: Checkpoint

Save a checkpoint after cancellation:
- What was cancelled and how (Option A or B)
- Current state of focus and remaining tasks

## Rules
- Always confirm the user's choice before doing anything destructive
- Handle missing branches/PRs gracefully — skip with a note, don't error
- Never force-push
- If currently on the task branch being deleted, switch to focus branch first
- Use `git branch -d` first; only escalate to `-D` with user approval
