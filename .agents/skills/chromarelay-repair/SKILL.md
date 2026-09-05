---
name: chromarelay-repair
description: Apply a bounded coherent change batch from approved findings or a selected intervention. Preserve Locks and the selected Direction, change only the causal mechanism, produce equivalent before/after Evidence, and return the defect to an earlier Phase when its cause lives there. Use for the repair Phase of CREATE and the coherent-batch Phase of REFINE.
---

# Bounded Repair

One Phase produces one batch: one cause, one mechanism, one verifiable worktree.

## Two mandates, one method

Read the Phase Packet's `phase` to know which mandate you hold.

| Packet phase | Authority to change comes from | Exit means |
|---|---|---|
| `repair` (CREATE) | the approved findings listed in the Packet | the batch is confirmed, or a structural return is named |
| `coherent-batch` (REFINE) | the selected intervention chosen in `focused-options` | the candidate is comparable against the Baseline |

Everything below applies to both. Where the Packet names neither approved findings nor a selected intervention, you hold no authority to change anything: report that and return.

## Inputs

Before opening a file, confirm the Packet gives you each of these:

- the exact approved findings, or the exact selected intervention;
- Baseline and candidate paths;
- the contracts and Locks in force;
- the repair budget;
- the Evidence expected at exit;
- the rollback condition.

You run isolated and cannot ask for a missing one mid-Phase. For each item absent from the Packet, either derive it from a source the Packet already points at and record which source you used, or list it in `unresolved` and lower `confidence`. Deriving a *finding* is not available — a change nobody approved is scope expansion regardless of how well it is evidenced.

## Scope is the thing under pressure

Registry `mustNot` for this role: expand scope, reopen Direction, patch structural defects locally.

You will find defects nobody listed. Record them as observations in the Handoff and leave them in place. The Run's next Phase decides; a defect you silently fixed is a defect no critic ever judged, and the Gate that would have caught its cause never ran.

Rationalizations that mean you are already outside the batch:

| You are about to think | What is actually happening |
|---|---|
| "This is a one-line fix while I am in here" | an unapproved change enters the diff and contaminates the before/after comparison |
| "The finding cannot be fixed without also changing X" | X is the real cause; that is a structural return, not a wider batch |
| "The token is wrong, so I will define a better one" | reopening the Direction and the design system from an implementation Phase |
| "The Lock made sense before this finding" | reopening a Lock, which only an earlier Phase may do |
| "Two unrelated findings, same file, same commit" | two batches; the Phase produces one |

Red flags in your own diff: a file no finding named; a new token, variant, or component; a changed Lock, contract, or public API; an edit outside the isolated product worktree; a batch you cannot state as one cause in one sentence.

## The batch declares one cause

State the cause in one sentence before editing, then let every change in the diff trace to it. Typical causes:

- focal hierarchy;
- typography calibration;
- surface separation;
- state completeness;
- responsive reorganization.

Changes that trace to a different cause belong to a different batch. Preserve Locks and the selected Direction as given: the batch changes the mechanism that produces the defect, not the intent the mechanism serves. Use canonical tokens and existing component contracts, and record every unavoidable exception with its reason in the Handoff `decisions`.

## Stop predicate

Evaluate this before editing, and again whenever the diff starts to grow. Return without patching when the fix requires:

| The fix requires | Return to the Phase that owns it |
|---|---|
| new Product interpretation | grounding / preserve-product-truth |
| a new Direction, or reopening the selected one | direction-divergence / focused-options |
| a design-system or token-system rewrite | canonization / v2-system-draft |
| information-architecture change outside scope | surface-architecture |
| reopening a Lock | the Phase that set the Lock |
| a component contract or new component | component-plan |
| a migration plan | migration-plan |

When it fires: leave the worktree unpatched, set `requestedTransition` to `return`, set `requestedTarget` to that Phase id, and state in `summary` which finding forced it and what evidence shows the cause sits there. A structural return delivered early is a cheap Phase; a structural defect patched locally is a defect the system now hides.

## Verification inside the worktree

Run the targeted checks the Packet's Gates name — `build-health` always, `visual-quality` when the Packet lists it. Capture before and after in equivalent conditions: same viewport, same theme, same data, same state, same route. Non-equivalent captures are not Evidence, because the comparison Phase cannot attribute the difference to your batch.

Give reproduction for every claim: the command, the path, the state. A claim without reproduction goes in `risks`, not `claims`.

## Report

Return the Handoff schema the Packet supplies, with these filled:

- `summary` — the one-sentence cause, and the batch outcome.
- `claims` — what the batch changed and what verification showed, each with its Evidence.
- `evidence` — before/after captures in equivalent conditions, command output, reproduction steps.
- `artifacts` — the patch and the candidate renders.
- `decisions` — every deviation from a contract or canonical token, with its reason.
- `risks` — findings you observed and left in place, and unreproduced claims.
- `unresolved` — inputs the Packet did not supply, and questions you could not settle alone.
- `confidence` — what the Evidence supports.
- `requestedTransition` — `advance` when the worktree is verifiable, `return` with `requestedTarget` when the stop predicate fired, `escalate` when the trade-off is a human's call.

Your verdict is a recommendation. The Gate and the critic decide whether the batch stands; a candidate its own author has already declared good cannot be blind-compared, so state what the Evidence shows and stop there.
