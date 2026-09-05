---
name: chromarelay-components
description: Resolve component requirements against the existing codebase and component registry. Prefer reuse, composition, and extension before justified creation; define states, accessibility, tokens, responsive behavior, and provenance. Use before implementation or during system migration.
---

# Component Architecture

Every requirement is answered from an inventory of what already exists. The inventory comes first, and each resolution names the thing it reuses, composes, extends, or replaces.

## Resolution order

Take the first rung that satisfies the requirement:

1. native HTML;
2. an existing project component;
3. a composition of existing components;
4. a documented variant of an existing component;
5. an installed accessible primitive;
6. a new component, with the rejection of rungs 1-5 recorded.

Rung 5 exists because keyboard behavior, focus management, and ARIA semantics for dialogs, menus, comboboxes, and tooltips are already solved in the installed primitive. Hand-rolling one re-solves a problem the project already paid for, and the re-solution is unverified.

Search code, the component registry or Storybook, props, stories, and existing call sites before deciding. A component found under a second name late in the Phase produces two resolutions for one requirement.

## Resolution record

Every requirement gets one record. All nine fields are required; a field with no answer says so rather than being dropped:

- **requirement** — the need, stated from the Surface Brief;
- **resolution** — one of `native | reuse | compose | extend | primitive | create`;
- **components involved** — paths or registry ids of every component and primitive used;
- **rejected alternatives** — the rungs above the chosen one and why each fails;
- **token roles** — the semantic token roles consumed, by role name rather than raw value;
- **required states** — from the state list below;
- **responsive behavior** — how the component behaves across the Responsive Model's breakpoints;
- **accessibility behavior** — role, name, keyboard path, focus order, and announced state;
- **owner and scope** — the Surfaces this resolution covers.

`create` and `extend` records are what the `component-reuse` Gate reads. A `create` record whose rejected-alternatives field is empty reads as a component that was never checked against the inventory.

## States

Draw required states from: default, hover, focus, active, disabled, loading, empty, error, success, permission, long content, overflow, and domain-specific states.

Include a state when the component contract or the Surface Brief can produce it. A form control that can be submitted has a loading state; a list fed by a query has empty and error states; a component behind a role check has a permission state. States the contract cannot reach stay out of the record, because a state matrix padded with unreachable rows sends the Builder and the Auditor after evidence for behavior that does not exist.

## Interface quality

A component interface is **deep**: a small surface of props hiding substantial correct behavior. Depth is the ratio, so both moves increase it — remove a prop whose behavior the component can decide itself, and absorb a correctness concern that every call site currently repeats.

Props exist for what callers legitimately vary. Tests reach the component through the same interface callers use, which is what makes a passing test evidence that callers work.

## Migration

For broad component replacements, use expand-contract:

1. add the new form beside the old one;
2. migrate call sites in bounded batches, each batch demoable or mechanically safe;
3. remove the legacy form once no caller remains.

Sequence waves so a wave's dependencies land in an earlier wave: foundations and tokens, then primitives, then the application shell, then core Surfaces, then domain components, then the long tail and edge states, then legacy removal. Record the dependency graph alongside the waves.

## Output and authority

This Skill produces the Component Plan, the component state contracts, and in REDESIGN the Migration Plan and dependency graph. All of them are Run drafts: they are written under the Run directory and become project truth only when the Memory Curator promotes them.

Two costs make that boundary worth holding:

- Implementing the plan yourself costs the plan its independent review — a Component Plan that arrives with its implementation attached is judged as that implementation, and the reuse decisions inside it stop being separable from the code. Implementation is the Builder Role's Phase; if the plan should be implemented by you, that reassignment comes from the Coordinator.
- Writing into `.chromarelay/project/` costs the Run its provenance, because Promotion is where a resolution acquires its rationale, scope, and status. The pre-tool guard blocks the write, so the only thing an attempt buys is a burned turn.

Where this Skill's guidance and a Lock, a canonical token, or a component contract disagree, the higher source wins and the conflict goes in the Handoff's `unresolved` list.
