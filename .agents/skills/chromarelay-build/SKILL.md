---
name: chromarelay-build
description: Implement a selected ChromaRelay Direction as a patch — reading the Product, DESIGN, token, component, state, responsive, and acceptance contracts, working in an isolated worktree, testing through agreed public seams, and returning a Handoff an auditor can verify without you. Use when a Phase assigns implementation, a pilot, a lighthouse Surface, or a migration slice.
---

# Design Implementation

Implement the Direction as selected. The Direction is the one input here you did not author
and do not adjust: when it cannot be built faithfully, that is a Decision to propose, not a
gap to improvise across.

## Read before editing

A bounded read set. Read each of these that the Phase Packet points at, and stop there:

- the target Surface Brief;
- the Product and Constraints excerpts the Packet carries;
- the selected DESIGN excerpt;
- canonical tokens;
- the Component Plan, plus the doc for every component you will touch;
- the state and responsive contracts;
- the acceptance criteria.

Then read the existing implementation around the target. Its conventions outrank your
defaults, and where the Packet is silent the neighbouring Surface is the tiebreaker.

## Where each artifact goes

| Artifact | Destination |
|---|---|
| Product code on an existing project | the isolated worktree — one branch, one writer — as a patch; never into the Run folder |
| App files for a Run-generated app (CREATE with no existing project) | `.chromarelay/runs/<runId>/prototype/` (bootable: README plus install/dev; synced from the worktree at build-phase exit) |
| HTML Direction specimens | `.chromarelay/runs/<runId>/specimens/` (visual reference only) |
| Direction records | `.chromarelay/runs/<runId>/directions/` |
| Briefs, maps, drafts, plans, state contracts | `.chromarelay/runs/<runId>/context/` |
| Evidence, notes, captures, state matrices, Gate reports | `.chromarelay/runs/<runId>/audit/` |
| Canonical `DESIGN.md`, tokens, component docs | left as they are; the Memory Curator promotes approved work |

`.chromarelay/system` and `.chromarelay/project` are guarded, so a write there comes back
blocked. A blocked write means the artifact belongs under the Run path, not that the
command needs adjusting.

## Implementation contract

Every visual and structural decision traces to one of four things: the Direction, a
canonical token, a component doc, or a deviation you recorded. Concretely:

- **Semantics first.** Reach for the existing accessible primitive and the semantic element
  before composing one out of generic containers.
- **Tokens.** Use canonical tokens. Where a value has no token, ship the nearest token and
  record the exception in the Handoff with the value you wanted and the reason.
- **Props.** Query the component doc for the exact prop before you type it. A prop you
  cannot cite to a doc does not exist yet — propose it as a Decision.
- **Product content and behavior survive.** Copy, labels, ordering, and existing behavior
  carry over unchanged unless the Packet changes them explicitly.
- **States.** Implement every state the acceptance criteria require, not the success path
  alone. When the Packet names the `state-coverage` gate, each required state needs a
  reproducible route or trigger plus a capture, recorded as a state matrix under the Run.
- **Responsive.** Write each breakpoint transformation explicitly in code rather than
  letting it emerge from flow.
- **Motion.** Motion carries meaning — orientation, continuity, feedback — and honours the
  reduced-motion preference.

### When a contract cannot be met

Implement up to the boundary, leave the slice visibly unfinished, propose a Decision, and
ship the rest of the work.

| Pressure you will feel | What it costs | Do instead |
|---|---|---|
| "The Direction is ambiguous here, I will pick what looks better" | a second Direction nobody selected, judged as though it were the first | implement the reading nearest the Direction, record the ambiguity as an open Decision |
| "This contract is impossible, I will approximate it quietly" | the approximation ships as if it were the contract | propose the Decision and leave the gap legible |
| "The prop probably exists" | an undocumented API in the patch, found later by the auditor | cite the doc, or propose the prop |
| "This looks good, I will call it ready to approve" | the Run loses the independent verdict this Phase exists to produce — a build cannot be approved by whoever wrote it | report what renders and which checks passed; the verdict belongs to the critic and the gate |

## Tests

Work in vertical tracer bullets: one thin path, end to end and green, before widening.

Exercise behavior through the public seams the Packet agreed on rather than through
internals you happen to be able to reach.

Run targeted checks continuously while editing. At completion, run every check named in the
Packet's `acceptance` list and carry its output into the Handoff — passing or failing.

## Handoff

One object matching the schema at the Packet's `outputSchema`. Fill every slot:

| Slot | Content |
|---|---|
| `summary` | what renders now that did not before, and which Surfaces and behavior changed |
| `claims` | each with `status` — `observed` for what you ran, `inferred` for what you reason, `proposed` for what you suggest — and `evidenceRefs` |
| `artifacts` | the patch or branch reference |
| `evidence` | check output, captures, and console logs, by path under the Run |
| `decisions` | every contract you could not meet, every token exception, every prop you propose |
| `risks` | what may break that your checks do not cover |
| `unresolved` | every question you would have asked had there been someone to ask |
| `confidence` | `low` whenever a contract went unmet or a required check is missing |
| `requestedTransition` | `advance` when acceptance is met; `escalate` when a Decision blocks the slice |

Alongside those, in `summary` or `evidence`: how to render the result. Commands to run, the
URL or route per state, and reproduction steps for anything a reader has to see for
themselves.
