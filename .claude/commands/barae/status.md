# /barae:status — Quick Project Status

Show a concise project overview without loading full context. Includes task list.

## Steps

1. **Check for active focus**:
   - If `.project/CURRENT_FOCUS.md` exists, read first 20 lines for name, status, branch, PR URL
   - If not: report "No active focus"

2. **List tasks** (lightweight — don't read full TASK.md):
   - List folders in `.project/tasks/`
   - For each, read only the first 8 lines of TASK.md (title, ID, type, focus, created, branch, status)
   - Check which task branches exist locally:
     ```bash
     git branch --list 'task/*' --format='%(refname:short)'
     ```
   - Check which task PRs exist and their state:
     ```bash
     gh pr list --search "head:task/" --json number,headRefName,state --limit 50
     ```
   - **Auto-detect completion**: If a task PR is merged but TASK.md status is not `completed`, note it as completed in the display.

3. **Git state**:
   ```bash
   git branch --show-current
   git status --short
   git log -3 --oneline
   ```

4. **Check for checkpoint**:
   - If `.project/CHECKPOINT.md` exists, read first 5 lines for date and active task

5. **Present summary**:
   ```
   ## Barae Status

   **Focus:** <name> (<status>)
   **PR:** <URL or "none">
   **Branch:** <current branch>
   **Uncommitted:** <count> files

   ### Tasks
   ✓ <task-id> — <title> [PR #<num> merged]
   ⧖ <task-id> — <title> [PR #<num> open]
   ⧗ <task-id> — <title> [branch exists, no PR]
   ☐ <task-id> — <title> [planned]

   ### Recent Commits
   - <SHA> <message>
   - <SHA> <message>
   - <SHA> <message>

   **Last Checkpoint:** <date> — <active task or "none">
   ```

   Status indicators:
   - `✓` = completed (PR merged)
   - `⧖` = in progress, PR open
   - `⧗` = branch exists, no PR (detailed or in_progress without PR)
   - `☐` = planned (not started)

6. **Suggest next action** based on state:
   - No focus → "Create one with `/barae:new-focus`"
   - Focus but no tasks → "Create tasks with `/barae:plan-tasks` or `/barae:new-task`"
   - Planned/detailed tasks → "Start a task with `/barae:start-task <id>`"
   - All tasks done → "Consider archiving with `/barae:archive-focus`"

## Rules

- Do NOT read full TASK.md files — just metadata from first 8 lines
- Do NOT read PRODUCT.md or standards docs
- Keep output under 30 lines
- This is read-only — no file changes, no git operations beyond status/log
