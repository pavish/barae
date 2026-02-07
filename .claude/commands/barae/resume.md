# /barae:resume — Resume from Last Checkpoint

Load the last checkpoint and help user continue from where they left off.

## Steps

1. **Check for checkpoint**:
   - If `.project/CHECKPOINT.md` doesn't exist: "No checkpoint found. Use `/barae:status` to see current state."
   - Read CHECKPOINT.md in full

2. **Load additional context**:
   - Read `.project/CURRENT_FOCUS.md` (if exists) — first 20 lines for focus overview
   - If an active task is noted in checkpoint, read its `.project/tasks/<task-id>/TASK.md`

3. **Sync git state**:
   ```bash
   git fetch origin
   git status --short
   git branch --show-current
   ```
   Report if there are new commits on remote or uncommitted local changes.

4. **Summarize to user**:
   ```
   ## Resuming from Checkpoint

   **Last Session:** <date>
   **Branch:** <branch>
   **Active Task:** <task-id or "none">

   ### What was completed
   <from checkpoint>

   ### Where we left off
   <current progress from checkpoint, including implementation step>

   ### Key commits from last session
   <from checkpoint>

   ### Next steps
   <pending items from checkpoint>

   ### Open questions / blockers
   <from checkpoint, if any>

   ### Git sync
   <branch status — ahead/behind/diverged/clean>
   ```

5. **Suggest next action**:
   - If active task exists: "Continue with `/barae:work-task <task-id>`?"
   - If no active task but pending tasks: "Pick a task — see list above"
   - If blockers noted: "Let's address the blockers first"
   - If focus is done: "All tasks complete — archive with `/barae:archive-focus`?"

## Rules

- Do NOT start working on anything automatically
- Just summarize state and suggest next steps — user decides what to do
- If checkpoint references files or branches that no longer exist, note the discrepancy
