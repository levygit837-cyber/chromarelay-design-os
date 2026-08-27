---
name: chromarelay-memory
description: Promotion of approved Run work into canonical ChromaRelay project state. Covers the eligibility bar, destination routing, Lock creation, the ADR threshold, and the Promotion Manifest.
---

# Memory and Promotion

Canonical state must stay smaller and more trustworthy than Run history. Every Promotion spends that trust: a reader who finds one experiment in canonical state stops believing the rest of it, and the cheapest way to keep the guarantee is to promote less.

Rejected and superseded work keeps living in the Run archive. The archive is what makes a Promotion reversible, so it stays whole.

## Eligibility

Promote a candidate when all six hold:

1. status is approved;
2. every required Gate passed, or an accepted exception covers the one that did not;
3. provenance is complete: producer, source Run, and the Evidence behind the claim;
4. the destination scope is explicit, down to the file;
5. every Lock the candidate touches is either compatible or reopened in the open;
6. the Artifact or Decision exists for reuse or for canonical explanation.

A candidate that fails one of the six is not a smaller Promotion. It is a finding: name the failing precondition and leave the candidate in the Run.

### Pressure to promote anyway

These arrive at the end of a Run, when the work looks finished and the remaining gap looks procedural.

| What it sounds like | What is actually true |
|---|---|
| "The Run is approved overall, so this file is approved." | Approval attaches to Artifacts. An unapproved file inside an approved Run is unapproved. |
| "The Gate is red on a detail nobody cares about." | Then an exception is cheap to record. Record it, or leave the file behind. |
| "It is obviously reusable, someone will need it." | Reuse nobody has asked for is an experiment. It stays in the Run archive until a second Surface needs it. |
| "The values match, I will note the source later." | Provenance recorded later is provenance invented later. |
| "This one-off keeps the Surface consistent." | A one-off promotes to the Surface contract, never to DESIGN or canonical tokens. |

Red flags in your own draft: a destination given as a directory rather than a file; a manifest slot filled with "n/a"; a hash you typed rather than read from the tool.

## Destination routing

Route by what the item claims authority over, not by who produced it:

| The item is | Destination |
|---|---|
| project truth: what the product is, what bounds it | PRODUCT, CONSTRAINTS |
| visual grammar: rules that hold across Surfaces | DESIGN |
| exact values | canonical tokens |
| reusable behavior | component contracts |
| a hard-to-reverse, surprising trade-off | ADR |
| a scoped deviation from canonical guidance | EXCEPTIONS |
| a decision that binds one Surface only | that Surface contract |
| a rejected or superseded experiment | Run archive only |

Canonical tokens carry exact values, so an exception to them is recorded with the scope that permits it and the condition that retires it. An unrecorded exception reads as a new rule at the next Run.

## Locks

Create a Lock when silent drift in this decision would damage identity, consistency, behavior, or compliance. Everything else is a Decision, which a later Phase may revisit without ceremony.

A Lock carries its scope and its reopening conditions. A Lock with no reopening condition is a decision nobody can revisit and everybody eventually works around.

## ADR threshold

Write an ADR when all three hold:

1. hard to reverse;
2. surprising without context;
3. real alternatives were traded off.

A choice that fails any of the three is recorded as a Decision, and a visual choice usually fails the first.

## Promotion Manifest

One manifest per Promotion Phase. Every slot is filled from something you read, not from memory:

```
# Promotion Manifest
## Run
runId, Workflow, Phase

## Promoted Artifacts
one row per Artifact: source path | destination path | status | producer | sha256 | Evidence refs | Gates passed

## Promoted Decisions
id, destination, scope

## Locks created or reopened
id, scope, reopening condition

## Exceptions recorded
what deviates, from which canonical rule, scope, retirement condition

## Deprecated Artifacts
what this Promotion supersedes, and where the old version now lives

## Not promoted
one row per candidate held back: candidate | the eligibility item it failed

## Verification
how you confirmed each destination now reads as intended

## Rollback pointer
the backup path for each destination, so a single reverse copy restores prior canonical state
```

The `Not promoted` slot is what makes the manifest complete rather than flattering: it accounts for every candidate the Run produced.

## Writing into canonical state

Every byte that enters canonical state goes through the ChromaRelay state tool (`op: promote`, with `source`, `destination`, and `approvalRef`) or the equivalent CLI command. The tool re-checks the approval record, backs up the destination it is about to overwrite, hashes what it wrote, and appends the Promotion event to the Run. A shell copy skips all four, and the pre-tool guard blocks it.

The Promotion is done when every candidate the Run produced appears in the manifest, either as a promoted row or in `Not promoted` with its failing precondition named.
