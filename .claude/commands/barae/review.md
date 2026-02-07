# /barae:review — Code Review

You are reviewing code for quality and standards compliance. Target: $ARGUMENTS

The argument can be a PR number, task ID, or branch name.

## Step 1: Determine Target

If `$ARGUMENTS` is provided, confirm the target briefly with the user.
If not provided, ask the user what to review (PR number, task ID, or branch name).

Optionally ask:
- Any specific concerns or focus areas?
- Is this a task review? (if so, which task ID for acceptance criteria)

## Step 2: Get the Diff

### For a PR number:
```bash
gh pr diff <number>
```

### For a task ID:
```bash
git diff focus/<focus-name>...task/<task-id>
```

### For a branch:
```bash
git diff main...<branch>
```

## Step 3: Review (delegate to `barae-reviewer` subagent — Opus)

Spawn a single `barae-reviewer` subagent (Opus) to perform a thorough review covering all aspects:

Give the reviewer:
- The full diff
- Relevant standards docs (per Standards Mapping in CLAUDE.md, based on files changed)
- The task's TASK.md if reviewing a task (for acceptance criteria)

The reviewer checks:

### Standards Compliance
- Every Critical Rule from CLAUDE.md (no process.env, no import.meta.env, etc.)
- Established code patterns from `.project/codebase/` topic docs
- API versioning, route co-location, plugin architecture

### Code Quality
- No stubs, TODOs, or console.logs
- No empty function bodies or hardcoded values
- Functions have real logic
- Error handling is present and meaningful
- No security vulnerabilities (injection, XSS, etc.)

### Wiring & Integration
- Components are properly connected (handlers, API calls, state)
- Integration chain complete (component → API → DB)
- No dangling imports or unused code

### Task Acceptance (if reviewing a task)
- Each acceptance criterion met
- Each verification step passes
- Each test case covered

## Step 4: Synthesize Findings

Review the subagent's findings:
- Verify accuracy (no false positives)
- Assign appropriate severity levels
- Check if anything was missed

## Step 5: Present Findings

Organize findings by severity:

### Critical (must fix)
- Security issues, broken functionality, standards violations

### Warning (should fix)
- Missing error handling, inconsistent patterns, potential bugs

### Suggestion (nice to have)
- Style improvements, minor optimizations

Include for each finding:
- File path and line number
- What's wrong and why
- The specific standard or pattern being violated
- Suggested fix

If the code is good, say so — don't manufacture issues.

## Rules
- Be thorough but fair — don't nitpick style if it matches existing patterns
- Always reference the specific standard or pattern being violated
- Use Opus for reviews — quality matters more than speed for code review
