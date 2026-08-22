# Context Policy

## Context tiers

### Tier 0: permanent

Coordinator Role contract, glossary, registry indexes, authority order, active Run pointer.

### Tier 1: canonical on demand

Relevant excerpts of Product, Constraints, Design, tokens, component contracts, ADRs, and Locks.

### Tier 2: Run state

Run Contract, current Phase, prior accepted Handoffs, Artifact pointers, blockers, and open Decisions.

### Tier 3: Phase Packet

Minimum compiled context for one Role and one Phase.

### Tier 4: Evidence payload

Screenshots, source excerpts, test outputs, reference captures, or datasets explicitly needed for the assignment.

## Compilation rules

1. Start from the Phase output contract, not from available files.
2. Include only canonical sections that constrain this assignment.
3. Include accepted prior Handoffs only when they are dependencies.
4. Convert long inputs to stable file/URI pointers.
5. State Locks and open Decisions separately.
6. Include one primary Skill and no more than two supporting references by default.
7. Record omitted context categories when omission is a deliberate independence control.

## Contamination controls

- Candidate names and creator identity are removed for blind comparison.
- Art Director packets do not include competing Directions.
- Critic packets do not include creator reasoning.
- Builder packets include selected Direction, not rejected alternatives.
- Auditor packets include acceptance contracts and implementation, not aspirational creator claims.

## Compaction

Compaction must preserve:

- Run id and Workflow;
- current Phase;
- Locks;
- unresolved Decisions;
- Artifact index;
- last accepted Handoff;
- exact next action.

Reasoning traces are not operational state.
