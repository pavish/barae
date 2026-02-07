# /barae:parallel-tasks — Execute Multiple Tasks in Parallel

Coordinate parallel task execution using git worktrees for full isolation.

## Pre-Flight

1. Read `.project/CURRENT_FOCUS.md` — if it doesn't exist, tell user to create a focus first
2. Scan `.project/tasks/` to list available tasks
3. Present tasks and ask user which ones to execute in parallel (recommend 2-4)

## Step 1: Validate Task Independence

For each selected task, read its TASK.md. Check:
- **Status**: Each task must have status `in_progress` with Implementation Steps already filled in. If any task has status `planned`, tell user to run `/barae:start-task <task-id>` first to complete the planning phase.
- **Dependencies**: Does any task have a `## Dependencies` section listing another selected task? If yes, those must run sequentially — remove from the parallel set and tell the user.
- **File overlap**: Do any tasks modify the same files? If yes, WARN user and suggest sequential execution for those.
- **Size**: Each task should be within normal sizing guidelines (~400 lines, 5-10 commits).

If tasks are not independent, tell user and suggest which ones can be parallelized vs which need sequential execution.

## Step 2: Ask for Worktree Location

Ask the user where to create git worktrees for the parallel tasks. Suggest a default:
```
../<project-name>-worktrees/
```

Each task will get its own worktree at `<location>/task-<task-id>/`.

## Step 3: Branch and Worktree Setup

First, sync the focus branch:
```bash
git fetch origin
git checkout focus/<focus-name> && git pull origin focus/<focus-name>
```

For each task, create a worktree with its own task branch:
```bash
git worktree add <worktree-location>/task-<task-id> -b task/<task-id> focus/<focus-name>
```

Return to the focus branch in the main repo:
```bash
git checkout focus/<focus-name>
```

## Step 4: Create Agent Team

Enter delegate mode (coordination only — do not implement yourself).

For each task, spawn a `barae-implementer` subagent (Opus):
- Set its working directory to the task's worktree path
- Give it: the task's TASK.md content, CURRENT_FOCUS.md context, relevant standards (per Standards Mapping in CLAUDE.md)
- Assign file ownership boundaries (which files/directories the subagent owns)
- Each subagent works entirely within its isolated worktree — no branch switching needed

Use the shared task list to track progress:
- Create a task entry for each parallel task
- Monitor status as subagents work

## Step 5: Monitor and Coordinate

While subagents work:
- Check progress via shared task list
- If a subagent reports a blocker, help unblock or reassign
- If a subagent is modifying files outside its ownership, intervene immediately
- If a subagent is spiraling (3+ attempts at same file, creating unplanned abstractions), stop it and course-correct

Relay important findings between subagents when relevant (e.g., "Subagent A discovered the auth middleware needs X — factor that into your approach").

## Step 6: Review Each Task

When a subagent finishes:
1. Review its changes using `barae-reviewer` (Opus) — point the reviewer at the worktree directory
2. Run per-task verification in the worktree:
   ```bash
   cd <worktree-location>/task-<task-id>
   # TypeScript type-check, lint, tests
   ```
3. If verification fails, send subagent back to fix (in its worktree)
4. If verification passes, mark task as ready to merge

## Step 7: Sequential Merge to Focus Branch

Merge each completed task branch into the focus branch, one at a time:

```bash
git checkout focus/<focus-name>
git merge task/<task-id-1> --no-ff -m "Merge task/<task-id-1> into focus/<focus-name>"
```

If the merge conflicts:
1. Show the conflicting files to the user
2. The conflict is between this task's changes and a previously merged task
3. Ask user how to resolve (or resolve if the conflict is straightforward)
4. After resolution, commit the merge

Repeat for each task. Run a quick type-check after each merge to catch integration issues early.

## Step 8: Push and Create PRs

For each merged task:
```bash
git push -u origin task/<task-id>
gh pr create --base focus/<focus-name> --title "<task title>" --body "$(cat .project/tasks/<task-id>/TASK.md)"
```

Also push the focus branch with the merges:
```bash
git push origin focus/<focus-name>
```

Present summary of all PRs created.

## Step 9: Clean Up Worktrees

Remove all worktrees automatically:
```bash
git worktree remove <worktree-location>/task-<task-id-1>
git worktree remove <worktree-location>/task-<task-id-2>
# ... for each task
```

If the worktree parent directory is now empty, remove it too:
```bash
rmdir <worktree-location> 2>/dev/null
```

Report final status: which tasks succeeded, which need follow-up, any merge conflicts that were resolved.

## Rules

- Max 4 tasks in parallel — more creates coordination overhead that exceeds the benefit
- Each task MUST have independent file ownership — no overlapping edits
- If ANY task fails verification, fix it before merging
- Use `barae-reviewer` (Opus) for review of each task's output
- Subagents use Opus for implementation (Sonnet only for simple <50 line steps)
- Never force-push on any branch
- Worktrees provide full isolation — no branch switching in the main repo during parallel execution
- Merge conflicts are expected when integrating independent work — resolve them during the sequential merge step
