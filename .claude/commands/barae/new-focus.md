# /barae:new-focus — Create New Focus

You are creating a new CURRENT_FOCUS through deep research and analysis. This is a critical workflow — take your time, ask questions, and get it right.

## Pre-Flight

1. Check `gh auth status` — if not authenticated, stop and guide user to run `gh auth login`
2. If `.project/CURRENT_FOCUS.md` exists, ask user if they want to archive it first (run archive-focus flow)

## Step 1: Gather Requirements

Ask the user these questions (and more if needed):
- What feature area or capability are we building?
- What user outcomes should this achieve? (think user flows, not implementation)
- What constraints or things to avoid?
- Any specific technical concerns?

Ask: "Should I ask more clarifying questions, or is this enough to research and draft the focus?"

## Step 2: Deep Research (delegate to `barae-researcher` subagent — Opus)

Delegate to the `barae-researcher` subagent with:
- The user's answers from Step 1
- Instruction to read `.project/PRODUCT.md` for product context
- Instruction to read relevant standards from `.project/codebase/`

The subagent will:
- Check its persistent memory for existing knowledge about this feature area
- Research best practices (web search, docs, existing code patterns)
- Identify pitfalls and anti-patterns specific to this feature area
- Define clear scope boundaries (in-scope vs NOT in-scope)
- Update its memory with new learnings

After research, write `.project/CURRENT_FOCUS.md` using this template:

```markdown
# Focus: <name>

Created: <YYYY-MM-DD HH:MM>
Status: active
Branch: focus/<focus-name>
PR: <to be filled after creation>

## What We're Building
<Product-level description — user flows, not implementation>

## User Flows
<Key flows affected or created>

## Success Criteria
- [ ] <criterion>

## Scope
### In Scope
- <item>

### NOT in Scope (do not build)
- <item>

## Pitfalls & Anti-Patterns
- <pitfall>: <how to avoid>

## Constraints for Claude
- DO NOT <constraint>
- ALWAYS <constraint>

## Tasks
<!-- Tasks added here via /barae:new-task -->
<!-- Format: - [ ] `<task-id>` — <brief description> -->
```

## Step 3: Review

Review the subagent's output:
- Is it product-focused (user flows, not implementation details)?
- Are success criteria measurable and verifiable?
- Is scope clearly bounded?
- Are pitfalls specific and actionable?

## Step 4: Present to User

Show the full CURRENT_FOCUS.md to the user for approval. Wait for explicit confirmation or change requests.

If the user rejects it, incorporate their feedback and re-delegate to the subagent (or edit directly if changes are minor).

## Step 5: Git Setup (after user approval)

```bash
git checkout main && git pull origin main
git checkout -b focus/<focus-name>
git add .project/CURRENT_FOCUS.md
git commit -m "focus(<focus-name>): initialize focus"
git push -u origin focus/<focus-name>
gh pr create --draft --base main --title "Focus: <focus-name>" --body "$(cat .project/CURRENT_FOCUS.md)"
```

Capture the PR URL from the `gh pr create` output. Update `.project/CURRENT_FOCUS.md` with the PR URL, then make a second commit:

```bash
git add .project/CURRENT_FOCUS.md
git commit -m "focus(<focus-name>): add PR URL"
git push origin focus/<focus-name>
```

Never amend. Never force-push.

## Git Error Recovery

- **Branch already exists**: Ask user — switch to existing branch, or use a different name?
- **`gh auth status` fails**: Guide user to run `gh auth login`, then re-run this command
- **`gh pr create` fails**: Show error, check if PR already exists (`gh pr list --head focus/<name>`), suggest retry
- **Network failure**: Suggest retrying or checking connection

## Rules
- Focus names are kebab-case (e.g., `github-app-integration`)
- CURRENT_FOCUS.md describes WHAT we're building, not HOW
- Tasks are NOT created here — use `/barae:new-task` separately
- Never force-push
