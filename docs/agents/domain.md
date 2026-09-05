# Domain documentation

ChromaRelay is currently a single-context repository.

## Before exploring or changing the system

Read:

1. `CONTEXT.md` for canonical domain terms;
2. ADRs in `docs/adr/` that affect the area being changed;
3. the relevant human or agent contract under `docs/`;
4. the active Workflow and Role registries when behavior is being changed.

If a document does not exist, proceed silently. Create domain documentation lazily when a real term or decision is resolved.

## Vocabulary

Use terms exactly as defined in `CONTEXT.md`. Do not substitute generic near-synonyms for Run, Phase, Phase Packet, Role, Skill, Handoff, Lock, Gate, Evidence, Direction, Surface, Baseline, Promotion, or Project Overlay.

For architecture, use module, interface, implementation, seam, adapter, depth, leverage, and locality.

When a new domain concept is necessary:

- confirm it is specific to ChromaRelay rather than general programming vocabulary;
- define what it is in one or two sentences;
- choose one canonical term;
- list misleading synonyms under `_Avoid_`;
- update `CONTEXT.md` when the term crystallizes, not at the end of a long session.

## ADRs

Create an ADR only when the decision is all three:

1. costly to reverse;
2. surprising without context;
3. a real trade-off among alternatives.

Most Workflow details, visual rules, and Run decisions belong in registries, contracts, `DESIGN.md`, Decision records, or Surface briefs rather than ADRs.

If proposed work conflicts with an ADR, state the conflict explicitly and explain why reopening it may be justified. Do not silently override it.
