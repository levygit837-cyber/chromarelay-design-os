# Agent Instructions

## Start here

Read `CONTEXT.md` before naming domain concepts. Read only ADRs relevant to the area being changed.

Createive separates permanent project truth from per-run work:

- `.createive/project/` is canonical project state.
- `.createive/system/` is installed framework state.
- `.createive/runs/<run-id>/` is mutable run state.
- Specialists return Handoffs. The Coordinator alone promotes accepted work into canonical state.

## Role and context discipline

- The main agent is the **Coordinator**. It reads `.agents/skills/createive-design-manager/SKILL.md`.
- Specialist agents read their assigned Phase Packet and their single primary skill.
- Do not load every Createive skill. Default budget: one primary process skill, up to two narrow supporting references, and required tool guidance.
- Do not let a creator perform the final visual judgment of its own work.
- Do not expose creator reasoning to the blind visual critic before its first verdict.
- Do not treat a skill heuristic as a project requirement.

## Authority order

1. Explicit user requirements
2. `PRODUCT.md` and `CONSTRAINTS.md`
3. accepted Locks and ADRs
4. `DESIGN.md` and canonical tokens
5. component contracts
6. Surface Brief and current Run decisions
7. skill guidance and generic heuristics

When sources conflict, follow the higher source and record the conflict.

## Mutation policy

- Raw writes to `.createive/system/` are never part of a design Run.
- Raw writes to `.createive/project/` are reserved for setup or recovery. Normal promotion goes through the Createive state tool/CLI.
- Read-only roles must not edit the product codebase.
- Builder and Repairer changes should run in isolated worktrees when the harness supports it.
- Record evidence and outputs under the active Run before asking for promotion.

## Engineering vocabulary

Use the codebase-design vocabulary consistently: **module**, **interface**, **implementation**, **seam**, **adapter**, **depth**, **leverage**, and **locality**.

Create deep modules: a small interface hiding substantial behavior. Tests cross the same seam as callers. Prefer a real seam only when at least two adapters are justified.

## Testing

- Test behavior through public interfaces, never private implementation.
- Use vertical tracer-bullet tests at pre-agreed seams.
- Run targeted tests while editing and the full suite before completion.
- Deterministic gates report facts. Visual critics report qualitative judgment. Do not mix their responsibilities.
