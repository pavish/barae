# /barae:new-task — Create a Task Manually

You are creating a new task manually under the current focus. Use this for tasks missed during `/barae:plan-tasks` or for new needs discovered during implementation. Detailed planning happens later via `/barae:start-task`.

## Pre-Flight

1. Read `.project/CURRENT_FOCUS.md` — if it doesn't exist, tell user to create a focus first via `/barae:new-focus`
2. Scan existing tasks in `.project/tasks/` to avoid overlap

## Step 1: Gather Requirements

Ask the user these questions (and more if needed):
- What should this task accomplish? (product terms, not code terms)
- What type is it? (feature, bugfix, refactor, review, docs)
- What areas/files will be affected?
- Any specific concerns or constraints?

Always ask: **"Is there anything else?"**

Ask: "Should I ask more clarifying questions, or is this enough to define the task?"

## Step 2: Generate Task ID

Generate 6 random lowercase alphanumeric characters:
```bash
head -c 3 /dev/urandom | xxd -p
```

Combine with a short kebab-case description: `<6chars>-<short-desc>` (e.g., `k7m2p9-otp-resend`)

## Step 3: Draft Lightweight Task

Draft the TASK.md directly (no researcher subagent needed). Write:
- A clear title
- A 2-4 sentence description in product terms
- Acceptance criteria that are verifiable
- Dependencies on existing tasks (check existing TASK.md files in `.project/tasks/`)

Do NOT include Implementation Steps, Verification Steps, or Test Cases — those are added by `/barae:start-task`.

## Step 4: Choose Position

Show the existing task list from CURRENT_FOCUS.md with numbers:
```
Current task order:
1. `<task-id>` — <description> [status]
2. `<task-id>` — <description> [status]
3. `<task-id>` — <description> [status]
```

Auto-detect dependency ordering: if the new task depends on task #2, it must go after #2.

Ask the user: **"Where should this task go?"**
- As the next task to work on (after the last completed/in-progress task)
- At the end of the list
- After a specific task (specify which)

## Step 5: Present to User

Show the full TASK.md using the lightweight template:

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
<2-4 sentences in product terms>

## Acceptance Criteria
- [ ] <criterion>
```

Wait for explicit approval or change requests.

## Step 6: Create File and Update Focus

1. Create `.project/tasks/<task-id>/TASK.md` with the approved content
2. Insert the task entry into CURRENT_FOCUS.md's task list at the chosen position:
   ```markdown
   - [ ] `<task-id>` — <brief description>
   ```

If dependencies were identified, note them to the user:
- "This task depends on `<task-id>` — it should be completed first."
- "This task will unblock `<task-id>` once complete."

## Rules
- Task **scope** (Description + Acceptance Criteria) is immutable after creation
- Do NOT include Implementation Steps, Verification Steps, or Test Cases — those are added by `/barae:start-task`
- If scope needs to change later, create a new task with just the new changes
- Target ~400 reviewable lines per task (planning guideline, not hard limit)
- Max 5-10 commits per task
- Each task must map to success criteria in CURRENT_FOCUS.md
- Dependencies must be identified — do not create tasks that silently depend on unfinished work
