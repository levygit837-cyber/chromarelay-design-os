---
name: createive-memory
description: Curate and promote approved Createive artifacts and decisions into canonical project state. Verify provenance, gates, scope, locks, exceptions, hashes, rollback pointers, and reuse value. Never promote experiments or one-off accidents.
---

# Memory and Promotion

Canonical state must stay smaller and more trustworthy than Run history.

## Eligibility

Promote only when:

- status is approved;
- required Gates passed or an accepted exception exists;
- provenance is complete;
- destination scope is explicit;
- no Lock conflict is silent;
- the Artifact or Decision is intended for reuse or canonical explanation.

## Destinations

- project truth -> Product/Constraints;
- visual grammar -> DESIGN;
- exact values -> canonical tokens;
- reusable behavior -> component contracts;
- hard-to-reverse surprising trade-off -> ADR;
- scoped deviation -> Exceptions;
- one-off Surface decision -> Surface contract;
- rejected experiment -> Run archive only.

## Locks

Create a Lock only for a decision whose silent drift would damage identity, consistency, behavior, or compliance. Record scope and reopening conditions.

## ADR threshold

All must be true:

1. hard to reverse;
2. surprising without context;
3. real alternatives were traded off.

Do not create ADRs for every visual choice.

## Promotion manifest

Record source, destination, status, producer, hash, Evidence, Gates, Decisions, Locks, exceptions, deprecated artifacts, verification, and rollback pointer.

Use the Createive state tool or CLI. Do not raw-copy files into canonical state.
