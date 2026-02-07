# /barae:setup — One-Time Project Setup

You are running the Barae project setup. This is idempotent — safe to re-run.

## Steps

1. **Create directories** (skip if they exist):
   - `.project/tasks/`
   - `.project/archive/`
   - `.project/codebase/`

2. **Copy standards files** from `.planning/codebase/` to `.project/codebase/`:
   - `backend.md`, `frontend.md`, `typescript.md`, `docker.md`, `dependencies.md`, `migrations.md`
   - Update any internal references from `.planning/codebase/` to `.project/codebase/`
   - Do NOT copy `STANDARDS.md` — its content is in `CLAUDE.md`

3. **Create `.project/PRODUCT.md`** populated from `.planning/PROJECT.md` + `.planning/STATE.md`:
   - Structure: What It Is, Who It's For, Value Proposition, Problems We Solve, Features (Implemented/Planned/Future), Technical Architecture, Constraints, Out of Scope, Templates, Decisions Log
   - Decisions Log is append-only with dated entries

4. **Delete `.project/PROJECT.md`** if it exists and is empty

5. **Write `CLAUDE.md`** at project root — but ONLY if CLAUDE.md does not already exist or is empty:
   - If CLAUDE.md already exists and has content, **do NOT overwrite it**
   - If it doesn't exist, write the full operating manual:
     Critical Rules, When to Ask, Project Context, Session Start, Team Leader Pattern, Task Rules, Git & Branching Strategy, Checkpoint Strategy, Verification, Standards Mapping, Skills

6. **Report** what was created/updated to the user

## Rules
- Do NOT modify `.planning/` — user handles that separately
- Do NOT create CURRENT_FOCUS.md or any tasks
- Do NOT modify any application code
- **Do NOT overwrite an existing CLAUDE.md** — it may have been hand-tuned
