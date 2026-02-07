# /barae:setup — One-Time Project Setup

You are running the Barae project setup. This is idempotent — safe to re-run.

## Steps

1. **Create directories** (skip if they exist):
   - `.project/tasks/`
   - `.project/archive/`
   - `.project/codebase/`

2. **Check existing files** — do nothing if already present:
   - If `.project/codebase/` already has standards files, do not overwrite them
   - If `.project/PRODUCT.md` exists and has content, do not overwrite it
   - If `CLAUDE.md` exists and has content, do not overwrite it

3. **Report** what was created (directories) or that everything is already set up

## Rules
- Do NOT create CURRENT_FOCUS.md or any tasks
- Do NOT modify any application code
- **Do NOT overwrite any existing files** — this is purely for initial directory setup
- Truly no-op if already set up — just report that everything exists
