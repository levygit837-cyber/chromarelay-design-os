---
name: chromarelay-inspect
description: Inspect an existing frontend without changing it. Freeze a reproducible baseline; inventory tokens, typography, components, routes, layouts, assets, states, renders, and history; separate observed fact from inference; produce faithful as-is documentation and drift evidence.
---

# Design Inspection

Inspection produces the evidence every later Role trusts. Document what is there, and leave it there.

## Baseline first

Record:

- commit and branch;
- dependency state;
- run command and environment;
- routes and test data;
- theme and locale;
- required viewports;
- representative screenshots;
- console/runtime state.

The Baseline is reproducible when another Role can reach the same renders from these fields alone. If an item is unavailable, record it as a coverage boundary and mark every claim resting on it `inferred` with `low` confidence.

## Code inventory

Inspect:

- CSS variables and token files;
- Tailwind/theme configuration;
- font loading and roles;
- component libraries and primitives;
- component variants and states;
- layout and navigation modules;
- route-to-component relationships;
- repeated literal values;
- assets and icon systems;
- motion definitions;
- responsive rules.

## History

Commit history, changelogs, and blame carry intention that the current tree lost. Read it for: when a token or component was introduced, which values were deliberately changed, and which were copied forward. A value's age is `observed`; the reason behind it is `inferred` unless a commit message, ADR, or doc states it.

## Render inventory

Capture:

- key Surfaces;
- required breakpoints;
- light/dark or alternate themes;
- loading, empty, error, permission, disabled, success, long-content, overflow, and domain states;
- overlays, menus, dialogs, tables, and forms.

A state you could not reach is a coverage boundary, recorded with the reason it was unreachable.

## Claim status contract

Every claim carries `status`, `confidence`, and `evidenceRefs`.

- `observed` requires a file path, line, commit, or screenshot that shows the value.
- `inferred` requires the reasoning and the observations it rests on.
- Nothing ships as bare assertion.

**Canonical candidates get their own slots.** For every value you propose as canonical, record: the value, its occurrence count, and the declaring source (token file, theme config, documentation, ADR) or `none`. Status is `observed` only when a declaring source exists. With `none`, status is `inferred` and the count is the evidence, never the argument — frequency is repetition, and repetition of a mistake reads exactly like intention.

## Drift

Report:

- declared token vs actual value;
- repeated values without token;
- component variants outside contract;
- inconsistent control heights, spacing, radius, shadows, typography, and icon family;
- missing or duplicated components;
- documentation/code contradictions.

Every drift entry names the declared source, the actual value, and the locations.

### Drift stays unfixed

A value you tidy while inspecting stops being evidence. The Run then documents your edit instead of the product, the as-is model describes a state that never shipped, and the Role that owns the fix loses the before-state it needs to prove the change worked.

Rationalizations that precede the mistake:

| The thought | What is actually true |
|---|---|
| "It is a one-character typo." | A typo in a shipped token is data about the system that produced it. |
| "Fixing is faster than writing it up." | The write-up is the deliverable; the fix is another Role's phase. |
| "Nobody could want this value." | Want is a claim about intention, and intention is `inferred` at best. |
| "I will note it and fix it too." | The note now describes your tree, not the product's. |
| "The build is broken without it." | A broken build is a Baseline finding with high value. Record it. |

Red flags in your own output: a diff you did not intend to produce, a screenshot that no commit explains, a token value in your report that grep cannot find in the tree.

## Fidelity test

The as-is model should explain representative renders. Record anything that remains unmodeled as an open item. Final fidelity judgment belongs to a separate Role.

## Output

Return a Handoff carrying, in order:

1. `summary` — what was inspected and how far coverage reached.
2. `claims` — each with `status`, `confidence`, `evidenceRefs`.
3. `evidence` — paths to captures, screenshots, and source references.
4. `artifacts` — the inventories and as-is documents the phase asked for.
5. `risks` — drift and contradictions found, unfixed.
6. `unresolved` — coverage boundaries, unreachable states, and unmodeled renders, each with the check that would settle it.
7. `requestedTransition` and the recommended next Workflow.

Product code and canonical ChromaRelay state are read surfaces here; the Handoff is where your output lands.
