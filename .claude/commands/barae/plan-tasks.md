# /barae:plan-tasks — Auto-Generate Tasks from Focus

You are generating lightweight task stubs from the current focus and research findings. Tasks are high-level — detailed planning happens later via `/barae:start-task`.

## Pre-Flight

1. Read `.project/CURRENT_FOCUS.md` — if it doesn't exist, tell user to create a focus first via `/barae:new-focus`
2. Read `.project/CURRENT_RESEARCH.md` — if it doesn't exist, warn user that research is missing and ask if they want to proceed without it
3. Scan existing tasks in `.project/tasks/` to avoid overlap or duplication

## Step 1: Research and Break Down (delegate to `barae-researcher` subagent — Opus)

Delegate to the `barae-researcher` subagent with:
- CURRENT_FOCUS.md content (full)
- CURRENT_RESEARCH.md content (full, if available)
- Instruction to read `.project/PRODUCT.md` for product context
- List of any existing tasks (to avoid overlap)
- **Instruction: break the focus scope into well-scoped tasks (~400 reviewable lines each)**
- **Instruction: identify dependencies between tasks and order by dependency chain**
- **Instruction: do NOT plan implementation details** — no implementation steps, no verification steps, no test cases. Only title, description, acceptance criteria, and dependencies.

The subagent will:
- Check its persistent memory for existing knowledge about this feature area
- Analyze focus scope and success criteria
- Break work into well-scoped, ordered tasks
- Identify task dependencies (which tasks must complete before others can start)
- Update its memory with new findings

## Step 2: Generate Task IDs

For each task from the researcher, generate a 6-char random ID:
```bash
head -c 3 /dev/urandom | xxd -p
```

Combine with a short kebab-case description: `<6chars>-<short-desc>` (e.g., `k7m2p9-otp-resend`)

## Step 3: Review Task Set

Review the researcher's output before presenting to user:
- Is each task properly sized? (target ~400 reviewable lines)
- Are tasks independent where possible?
- Do tasks cover all success criteria from CURRENT_FOCUS.md?
- Is there overlap between tasks?
- Are dependencies correctly identified and ordering makes sense?
- If any task is too large, split it

## Step 4: Present to User

Show a summary table:
```
## Proposed Tasks

| # | Task ID | Title | Dependencies | Est. Size |
|---|---------|-------|--------------|-----------|
| 1 | `<id>`  | <title> | none | ~200 lines |
| 2 | `<id>`  | <title> | #1 | ~300 lines |
| ...

### Dependency Chain
<visual or textual description of task ordering>
```

Wait for user approval. If user wants changes (reorder, split, merge, remove, add), incorporate feedback and re-present.

## Step 5: Create Task Files

For each approved task, create `.project/tasks/<task-id>/TASK.md` using the lightweight template:

```markdown
# <Task Title>

**ID**: `<task-id>`
**Type**: feature | bugfix | refactor | review | docs
**Focus**: <current-focus-name>
**Created**: <YYYY-MM-DD HH:MM>
**Branch**: `task/<task-id>`
**Status**: planned

## Dependencies
<!-- Remove section if none -->
- `<task-id>` — <why this dependency exists>

## Description
<2-4 sentences in product terms, not code terms>

## Acceptance Criteria
- [ ] <criterion>
```

## Step 6: Update Focus

Add all tasks to CURRENT_FOCUS.md's task list, ordered by dependency chain:
```markdown
- [ ] `<task-id>` — <brief description>
```

Note the dependency chain to the user:
- Which tasks can start immediately (no dependencies)
- Which tasks are blocked and by what

## Rules
- Task **scope** (Description + Acceptance Criteria) is immutable after creation
- Do NOT include Implementation Steps, Verification Steps, or Test Cases — those are added by `/barae:start-task`
- Each task must map to one or more success criteria in CURRENT_FOCUS.md
- Dependencies must be identified — do not create tasks that silently depend on unfinished work
- Target ~400 reviewable lines per task (planning guideline, not hard limit)
- Max 5-10 commits per task
