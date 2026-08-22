# Coordination Protocol

## Coordinator ownership

The Coordinator is the only Role allowed to:

- create or change a Run Contract;
- choose the next Phase;
- compile Phase Packets;
- resolve authority conflicts;
- request a human decision;
- promote accepted Artifacts or Decisions.

Specialists do not coordinate themselves into consensus. They return Handoffs.

## Dispatch contract

Every specialist assignment must include:

```text
# Goal
Why this assignment exists.

# Target
Exact Surface, Artifact, files, or decision space.

# Inputs
Pointers to the Phase Packet and required Evidence.

# Authority
What this Role may decide and what remains locked.

# Change
Expected work, not an implementation script.

# Output
Explicit JSON Schema or documented Handoff shape.

# Acceptance
Observable completion evidence.

# Non-goals
What not to inspect, decide, or edit.
```

Use OMP `task.batch` only for independent assignments. Shared context carries Goal, constraints, and shared contracts. Per-item tasks carry the distinct lens.

## Independence rules

- Divergent Art Directors must not read one another's candidates before submitting.
- Blind critics must not read creator reasoning before their first verdict.
- Deterministic auditors must not become art directors.
- Repairers receive approved findings, not an invitation to redesign.

## Handoff rule

A Handoff is complete only when it contains:

- claims;
- Evidence references;
- Artifacts produced;
- Decisions proposed;
- risks and uncertainty;
- confidence;
- requested transition;
- unresolved questions.

Do not return `see final message`, informal summaries, or unpersisted work.

## IRC usage

Peer messages are steering deltas, not replacement context. Use `hub` to:

- answer a precise question;
- correct a constraint;
- request a missing field;
- stop or redirect an invalid assignment.

Do not broadcast large context. Do not let peer discussion mutate Locks without Coordinator review.

## Completion

The Coordinator validates the Handoff against the Phase output contract, persists it, evaluates exit policy, and then advances, branches, returns to an earlier Phase, escalates, or stops.
