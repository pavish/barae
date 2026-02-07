# /barae:new-task — Create a Fully Planned Task

You are creating a new task under the current focus. This is a critical workflow — thorough planning prevents wasted implementation time.

## Pre-Flight

1. Read `.project/CURRENT_FOCUS.md` — if it doesn't exist, tell user to create a focus first via `/barae:new-focus`
2. Scan existing tasks in `.project/tasks/` to avoid overlap

## Step 1: Gather Requirements

Ask the user these questions (and more if needed):
- What should this task accomplish? (product terms, not code terms)
- What type is it? (feature, bugfix, refactor, review, docs)
- What areas/files will be affected?
- Any specific concerns or constraints?

Ask: "Should I ask more clarifying questions, or is this enough to plan the task?"

## Step 2: Generate Task ID

Generate 6 random lowercase alphanumeric characters:
```bash
head -c 3 /dev/urandom | xxd -p
```

Combine with a short kebab-case description: `<6chars>-<short-desc>` (e.g., `k7m2p9-otp-resend`)

## Step 3: Plan Task (delegate to `barae-researcher` subagent — Opus)

Delegate to the `barae-researcher` subagent with:
- The user's answers from Step 1
- CURRENT_FOCUS.md context
- Instruction to read `.project/PRODUCT.md` for product context
- Instruction to explore existing codebase in the affected area
- Instruction to read relevant standards from `.project/codebase/` (per Standards Mapping in CLAUDE.md)
- **Instruction to check existing tasks for dependencies** — read all TASK.md files in `.project/tasks/` and identify if this task depends on any existing task or if existing tasks depend on this one

The subagent will:
- Check its persistent memory for existing knowledge about this area
- Explore the codebase to find patterns, existing code to build on
- Plan specific implementation steps (with file paths and what changes)
- Define verification steps and test cases
- **Identify task dependencies** — which existing tasks must complete before this one, and which future tasks this one might enable
- Update its memory with new findings

After research, write `.project/tasks/<task-id>/TASK.md` using this template:

```markdown
# <Task Title>

**ID**: `<task-id>`
**Type**: feature | bugfix | refactor | review | docs
**Focus**: <current-focus-name>
**Created**: <YYYY-MM-DD HH:MM>
**Branch**: `task/<task-id>`
**Status**: pending

## Dependencies
<!-- List task IDs that must complete before this one. Remove section if none. -->
- `<task-id>` — <why this dependency exists>

## Description
<What this task accomplishes in product terms>

## Acceptance Criteria
- [ ] <criterion>

## Implementation Steps
1. <step with specific files and changes>

## Verification Steps
1. <how to verify>

## Test Cases
- [ ] <input → expected output>
```

## Step 4: Review

Review the subagent's task plan:
- Are implementation steps specific enough to execute without guessing?
- Are acceptance criteria verifiable?
- Is the task properly sized? (target ~400 reviewable lines, 5-10 commits)
- If too large, split into multiple tasks
- **Are dependencies correctly identified?** Check that listed dependencies exist and make sense.
- **Are all scope questions resolved?** Every edge case and requirement should be mapped now — scope is immutable after approval.

## Step 5: Present to User

Show the full TASK.md to the user for approval. Wait for explicit confirmation or change requests.

If the user rejects it, incorporate feedback and re-delegate or edit directly.

## Step 6: Update Focus

Add the task to CURRENT_FOCUS.md's task list:
```markdown
- [ ] `<task-id>` — <brief description>
```

If dependencies were identified, also note them to the user:
- "This task depends on `<task-id>` — it should be completed first."
- "This task will unblock `<task-id>` once complete."

## Rules
- Task **scope** (Description + Acceptance Criteria) is immutable — all scope questions must be resolved during this planning phase
- If scope needs to change later, create a new task with just the new changes
- Implementation Steps may be amended during execution with a note explaining the change
- Tasks can be marked `cancelled` in their Status field if they become irrelevant
- Target ~400 reviewable lines per task (package-lock.json, generated files don't count)
- Max 5-10 commits per task
- Each task must map to success criteria in CURRENT_FOCUS.md
- Dependencies must be identified and noted — do not create tasks that silently depend on unfinished work
