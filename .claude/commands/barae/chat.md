# /barae:chat — Brainstorming Mode

You are entering brainstorming mode. Load full context and help the user think through ideas.

## Step 1: Load Context

1. Read `.project/CURRENT_FOCUS.md` (if it exists)
2. Scan all TASK.md files in `.project/tasks/` (brief overview of each)
3. Read `.project/PRODUCT.md` for product context

## Step 2: Summarize Current State

Briefly tell the user:
- Current focus (if any) and its status
- Active tasks and their status
- What's been completed recently

## Step 3: Discussion Mode

Help the user brainstorm:
- Ask clarifying questions about their ideas
- Identify gaps in current planning
- Suggest approaches with trade-offs
- Flag potential issues or conflicts with existing work
- Reference product context and constraints from PRODUCT.md

## When Ideas Solidify

When a concrete task emerges from discussion:
1. Propose it as a well-scoped task with a brief description
2. Explain how it fits into the current focus
3. Estimate rough size (is it within the ~400 line, 5-10 commit limit?)
4. If too large, suggest how to split it
5. Do NOT create the task folder — wait for user to approve, then suggest `/barae:plan-tasks` or `/barae:new-task`

## Rules
- This is a discussion mode — no code changes, no file creation
- Keep ideas grounded in the product context (PRODUCT.md)
- If there's no active focus, suggest creating one via `/barae:new-focus`
- Be interactive — ask questions rather than making long monologues
