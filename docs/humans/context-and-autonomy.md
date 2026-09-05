# Context, autonomy, and consistency

## Central rule

The Coordinator knows the map. Each specialist knows only its current region.

Loading all documentation and all Skills into every agent reduces clarity, mixes authorities, and increases convergence toward mediocre answers.

## What stays permanent

In the Coordinator context:

- glossary;
- Workflow index;
- Role, Skill Kit, and Gate registry;
- active Run Contract;
- relevant Locks and constraints;
- Artifact pointers.

In a specialist context:

- Role contract;
- Phase Packet;
- one primary Skill;
- up to two narrow references;
- output schemas;
- explicit paths and non-goals.

## What must never be injected by default

- all transcripts;
- all design Skills;
- all competing Directions before divergence ends;
- creator reasoning in the blind critic;
- old reports unrelated to the Phase;
- whole canonical files when only a snippet is needed.

## Phase Packet

Every Phase Packet contains:

```text
Goal
Scope
Inputs
Locks
Open decisions
Role authority
Primary skill
Supporting references
Output schema
Acceptance evidence
Exit policy
Non-goals
```

It contains no contradictory instructions. The Context Compiler resolves precedence and records conflicts before dispatch.

## Sandboxes

- Read Roles get no editing tools.
- Builders and Repairers use an isolated worktree when available.
- Handoffs are persisted before any merge.
- The Coordinator evaluates patches and applies them only after the required gates.
- `.chromarelay/project` is not a scratch area.

## Locks

A Lock doesn't eliminate creativity. It declares that a decision has already been made at a given scope. An agent may propose reopening, but not silently replace it.

A reopening proposal must state:

- affected Lock;
- reason;
- new Evidence;
- impact;
- alternatives;
- reversal cost.

## Reversible choices

In `guarded` mode, the system automatically decides reversible choices when they:

- respect Locks;
- have sufficient Evidence;
- don't change global identity;
- generate no material disagreement between critics.

## Human escalation

The Coordinator asks for a human decision only when the decision's value outweighs the interruption cost. The question must present at most three options, material differences, Evidence, and a recommendation.
