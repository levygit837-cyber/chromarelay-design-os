# ChromaRelay Design OS Architecture

## Architectural goal

The system must hide orchestration, transitions, authority, context, and persistence behind a small interface. The Coordinator works with Runs, Phase Packets, and Handoffs; it never needs to know the internals of each harness adapter.

## Deep modules

### Design Manager

External interface:

- classify a Design Work;
- start or resume a Run;
- compile the current Phase Packet;
- record a Handoff;
- validate and execute a transition;
- promote approved decisions and Artifacts.

The implementation hides routing, state machine, skill budgets, authority policies, schemas, and persistence. This is the primary deep module.

### Workspace

External interface:

- read and write text atomically;
- check existence;
- list paths;
- create directories.

Initial adapters:

- filesystem for real use;
- memory for tests.

Two adapters make the seam real. Design Manager tests use the in-memory adapter and observe behavior through the same interface.

### Harness Adapter

Converts Phase Packets into agent execution and Handoffs. The OMP adapter uses `task`, model roles, isolation, output schemas, and `hub`.

The core never imports OMP. The adapter can be replaced with Codex, Claude Code, or custom execution without changing the Run model.

### Gate Runner

Runs deterministic gates or prepares packets for qualitative critics. A gate always produces Evidence; it never promotes decisions.

### Eval Harness

Consumes the same Run Contracts, Handoffs, Directions, and rubrics as the core, but has its own seam. The eval harness can move to another repository without changing the Workflows.

## State

```text
.chromarelay/
├── system/                 installed framework; only setup/upgrade writes
├── project/                canonical state; Coordinator promotes
│   ├── PRODUCT.md
│   ├── CONSTRAINTS.md
│   ├── DESIGN.md
│   ├── DECISIONS.md
│   ├── EXCEPTIONS.md
│   ├── tokens/
│   └── components/
├── runs/
│   └── <run-id>/
│       ├── run.json
│       ├── request.json
│       ├── events.jsonl
│       ├── phase-packets/
│       ├── handoffs/
│       ├── specimens/      HTML Direction references (visual reference only)
│       ├── prototype/      bootable React + TypeScript app (README plus install/dev)
│       ├── directions/     generated creative theses and selection records
│       ├── context/        briefs, maps, drafts, plans, state contracts
│       ├── audit/          Gate Evidence, critic reports, captures, validation output
│       ├── decisions/
│       └── gate-results/
└── active-run.json
```

## Context-corruption protection

1. Specialists start with no conversation history.
2. The Coordinator compiles minimal Phase Packets.
3. Independent Art Directors don't see each other's proposals during initial divergence.
4. The visual critic receives screenshots and contracts, not creator reasoning.
5. Specialists write only to the Run or an isolated worktree.
6. Canonical state changes only through Promotion.
7. Compaction and resumption use artifacts, not informal chat memory.

## Execution flow

```text
Design Work
  -> route()
  -> Run Contract
  -> compilePhasePacket()
  -> dispatch specialist(s)
  -> Handoff
  -> recordHandoff()
  -> evaluate exit policy
  -> advance | branch | return | request human decision | stop
```

## Freedom and authority

Divergence phases have wide creative latitude. After selection, the Direction becomes a Lock of appropriate scope. The system doesn't block unusual choices; it requires that changes to Locks be explicit, justified, and evaluated.

## Proportional granularity

The Router classifies the decision level:

- `0`: trivial fix;
- `1`: localized refinement;
- `2`: Surface direction;
- `3`: systemic change.

Low levels skip phases with no value. High levels require comparison and Evidence before commitment.
