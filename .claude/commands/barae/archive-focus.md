# /barae:archive-focus — Archive Completed Focus

You are archiving a completed focus and its tasks. The user should have already merged the focus draft PR into main on GitHub.

## Pre-Flight

1. Read `.project/CURRENT_FOCUS.md` to get the focus name and task list
2. Verify the focus PR is merged:
   ```bash
   gh pr list --head focus/<focus-name> --state merged
   ```
   If not merged, tell the user and stop.

3. **Verify all tasks are complete or cancelled**:
   - Read each TASK.md in `.project/tasks/`
   - Check that every task listed in CURRENT_FOCUS.md either:
     - Has a merged PR (`gh pr list --head task/<task-id> --state merged`)
     - Is marked `cancelled` in its Status field
   - If any task is incomplete, warn the user and list the incomplete tasks
   - Ask user to confirm they want to archive anyway, or finish/cancel the remaining tasks first

## Steps

1. **Switch to main and pull**:
   ```bash
   git checkout main && git pull origin main
   ```

2. **Create archive directory**:
   ```
   .project/archive/<focus-name>/
   .project/archive/<focus-name>/tasks/
   ```

3. **Move files**:
   - `.project/CURRENT_FOCUS.md` → `.project/archive/<focus-name>/FOCUS.md`
   - Each folder in `.project/tasks/` → `.project/archive/<focus-name>/tasks/<task-id>/`

4. **Update PRODUCT.md**:
   - If new decisions were made during this focus, add them to the Decisions Log with today's date
   - Update the Features section if features moved from Planned to Implemented
   - Review CURRENT_FOCUS.md success criteria to determine what was accomplished

5. **Commit**:
   ```bash
   git add .project/archive/ .project/PRODUCT.md
   git rm .project/CURRENT_FOCUS.md
   git rm -r .project/tasks/*/
   git commit -m "archive(<focus-name>): archive completed focus and tasks"
   ```

6. **Ask user for explicit approval before pushing to main:**
   "The archive commit is ready on main. Shall I push to origin/main?"

   Only push after user confirms:
   ```bash
   git push origin main
   ```

7. **Mention branch cleanup to user**:
   Tell the user: "The focus and task branches still exist on the remote. You can clean them up manually when ready:
   ```bash
   git push origin --delete focus/<focus-name>
   git push origin --delete task/<task-id-1> task/<task-id-2> ...
   ```
   "

8. **Report** what was archived: focus name, number of tasks archived, PRODUCT.md updates made

## Rules
- Never archive if the focus PR is not merged
- Verify all tasks are complete or cancelled before archiving
- Always update PRODUCT.md when archiving (decisions log, feature status)
- **Never push to main without explicit user approval**
- Do NOT delete remote branches automatically — mention to user, let them do it
- The archive is permanent — completed work lives there for reference
