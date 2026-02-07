# /barae:checkpoint — Save Session State

You are saving the current session state for handoff to the next session. Just do it — no questions needed.

This command creates a full manual checkpoint. Note that auto-checkpoints also happen after every commit during `/barae:work-task`.

## Steps

1. **Gather current state**:
   - What branch are we on?
   - Is there an active task? What implementation step are we on?
   - What was completed this session?
   - What's pending/next?
   - Any decisions made this session?
   - Any open questions or blockers?

2. **Read context**:
   - `.project/CURRENT_FOCUS.md` (if exists)
   - Active task TASK.md files in `.project/tasks/`
   - Recent git log for this session's commits:
     ```bash
     git log --oneline -10
     git diff --stat HEAD~5..HEAD 2>/dev/null || git diff --stat
     ```

3. **Read existing checkpoint** (if `.project/CHECKPOINT.md` exists):
   - Extract the `## Previous Checkpoints` section to preserve history
   - Move the current checkpoint's summary into the previous checkpoints list

4. **Write `.project/CHECKPOINT.md`**:

```markdown
# Checkpoint

**Date**: <YYYY-MM-DD HH:MM>
**Branch**: <current branch>
**Active Task**: <task-id or "none">

## Completed This Session
- <what was done>

## Key Commits
- `<short SHA>`: <commit message>
- `<short SHA>`: <commit message>

## Files Changed
- <file path> (modified | added | deleted)

## Current Progress
**Task**: <task-id or "none">
**Step**: <which implementation step number from TASK.md>
**Detail**: <specific detail — what's done within this step, what remains>

## Pending / Next Steps
1. <immediate next action>
2. <what comes after>

## Decisions Made
- <decision>: <rationale>

## Open Questions / Blockers
- <question or blocker>: <context>

## Previous Checkpoints
<!-- Keep last 3 entries. Each is a one-line summary. -->
- <YYYY-MM-DD HH:MM> | <branch> | <task-id or "none"> | <what was in progress>
- <previous entry>
- <previous entry>
```

5. **Report** to user what was saved

## Auto-Checkpoint (during work-task)

When called automatically after a commit (not via `/barae:checkpoint`), write a lighter checkpoint:
- Update only: Date, Branch, Active Task, Current Progress (step number), and Previous Checkpoints
- Do not re-gather the full context — just update the progress marker

## Rules
- CHECKPOINT.md is gitignored — do not commit it
- Keep last 3 entries in Previous Checkpoints (drop oldest when adding new)
- Keep it concise — just enough for `/barae:resume` to pick up without re-reading everything
- Include specific file names, line numbers, and commit SHAs where work was happening
