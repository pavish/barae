# /barae:update-focus — Update Current Focus

You are updating the current focus scope. Focus describes WHAT we're building (product-level), not HOW (no implementation details).

## Pre-Flight

1. Read `.project/CURRENT_FOCUS.md` — if it doesn't exist, tell user to create a focus first via `/barae:new-focus`
2. Get the current focus name and branch

## Step 1: Understand the Change

Ask the user:
- What needs to change in the focus?
- Is this a scope expansion, scope reduction, or clarification?
- Has anything been learned during implementation that changes the goals?

## Step 2: Make the Change

Switch to the focus branch:
```bash
git checkout focus/<focus-name> && git pull origin focus/<focus-name>
```

Update `.project/CURRENT_FOCUS.md` based on user's input. Common changes:
- **Success criteria**: Add, remove, or refine criteria
- **Scope boundaries**: Adjust in-scope / NOT in-scope lists
- **Pitfalls**: Add newly discovered pitfalls
- **Constraints**: Add or relax constraints based on learnings
- **Task list**: (task entries are managed by `/barae:plan-tasks`, `/barae:new-task`, and `/barae:cancel-task`, not here)

**Do NOT change:**
- The focus name or branch name (these are immutable identifiers)
- Implementation details (focus is product-level, not technical)

## Step 3: Review with User

Show the diff of changes to CURRENT_FOCUS.md. Wait for user approval.

## Step 4: Commit and Push

```bash
git add .project/CURRENT_FOCUS.md
git commit -m "focus(<focus-name>): update focus scope"
git push origin focus/<focus-name>
```

Update the focus draft PR body if it exists:
```bash
gh pr edit <number> --body "$(cat .project/CURRENT_FOCUS.md)"
```

## Step 5: Impact Assessment

After updating the focus, check if any existing tasks are affected:
- Read each TASK.md in `.project/tasks/`
- If a task's scope no longer aligns with the updated focus, flag it to the user
- Suggest cancelling or creating replacement tasks as needed

## Rules
- Focus describes WHAT, not HOW — no implementation details
- Focus name and branch name are immutable
- Always show the diff to user before committing
- Always push to the focus branch after committing
- Check task alignment after every focus update
