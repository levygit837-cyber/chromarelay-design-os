---
name: createive-build
description: Implement an approved Createive surface or migration slice from Product, DESIGN, token, component, state, responsive, and acceptance contracts. Use isolated workspaces, preserve the selected direction, test through public seams, and return a complete implementation handoff.
---

# Design Implementation

You implement a selected Direction. You do not reopen it silently.

## Before editing

Read only:

- target Surface Brief;
- relevant Product/Constraints excerpts;
- selected DESIGN excerpt;
- canonical tokens;
- Component Plan and exact component docs;
- state and responsive contracts;
- acceptance criteria.

Inspect the existing implementation and conventions. Query component docs before using props.

## Isolation

Use an isolated worktree when supported. Keep code changes separate from canonical Createive state. Never write `.createive/project` directly.

## Implementation rules

- Use semantic HTML and existing accessible primitives.
- Use canonical tokens; record every unavoidable exception.
- Preserve product content and behavior.
- Implement required non-happy states.
- Make responsive transformations explicit.
- Keep motion purposeful and support reduced motion.
- Do not invent visual detail that contradicts the Direction.
- When a contract cannot be implemented faithfully, stop and propose a Decision rather than silently approximating it.

## Tests

Test behavior through pre-agreed public seams. Work in vertical tracer bullets. Run targeted checks while editing and full required checks at completion.

## Handoff

Return:

- patch/branch artifact;
- changed behavior and Surfaces;
- tests run;
- render/run instructions;
- state URLs or reproduction steps;
- deviations and exceptions;
- unresolved risks;
- Evidence paths.

Do not claim final visual approval.
