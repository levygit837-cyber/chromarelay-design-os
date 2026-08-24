---
name: createive-critique
description: Judge design blind against the Surface rubric. Use to review a rendered Surface, run a Direction tournament, compare a candidate against a frozen Baseline, diagnose a weak Surface, or test documentation fidelity against real renders.
---

# Blind Visual Critique

Judge what users see before you know how it was made.

## What the packet holds

- Product and Constraint excerpts;
- the relevant DESIGN excerpt;
- the Surface Brief;
- anonymous screenshots, specimens, or prototypes;
- the Surface rubric.

Five things are withheld until after your first verdict: creator identity, creator reasoning, the deterministic tooling report, the change log, and which candidate is new. If any of them is in your packet anyway, open the report by naming it. The blindness control failed, and the Coordinator decides whether the verdict still counts as independent Evidence.

## Which assessment the phase asks for

Read what you were handed; it tells you which one:

| Handed | Produce |
|---|---|
| One rendered Surface plus its Brief | **Visual Review** — scores, findings, verdict |
| Several anonymous specimens | **Tournament Report** — see [references/comparison.md](references/comparison.md) |
| A randomized pair, one of them a Baseline | **Comparison Report** — see [references/comparison.md](references/comparison.md) |
| A Baseline plus a stated weakness or goal | **Diagnosis** — the single highest-impact cause, and the improvement fixing it should produce |
| AS_IS documents plus representative evidence | **Fidelity Report** — what the documents predict, what the renders show, and every rule the renders obey that no document states |

A Diagnosis names one cause. A list of cosmetic symptoms is the failure mode here: rank by impact on the stated goal and lead with the top one.

## Whole before parts

Answer these before you look at any detail:

- What wins attention?
- Does the reading order match the task?
- Does this look specific to this product, or to its category?
- Does the composition have intentional rhythm?
- Does quality survive real content, every required state, and every required viewport?

Then work through typography, color, surfaces, components, motion, and details.

## Scoring

The rubric is the source of truth for dimensions, weights, and the 1–5 scale: read `rubrics/common.json` plus the file for the Surface class — `persuade.json`, `operate.json`, `read.json`, or `experience.json` — under the installed framework (`.createive/system/rubrics/`). Score every dimension the Surface's weights list, including the extra dimension that class adds.

Each class file carries an `antiBias` line. Quote the one you applied and say where it changed a score. A critic who judges every Surface by the same instincts scores category conformance, not quality.

## Findings

A finding has three parts, in this order:

1. what defaulted or failed;
2. what it costs the user, the product, or the system;
3. the decision that resolves it.

Part 2 is what separates a defect from a preference. A statement you cannot give a cost to is either a strength to preserve or nothing; file it as the former or drop it. A bold choice that serves the stated intent is not a defect because you would have chosen differently.

"Nothing blocks this" is a complete verdict. Padding the blocker list to look rigorous corrupts the one signal the Run cannot get anywhere else, and the `blockers` list in `common.json` is the bar a blocker has to clear.

## Report

Return these parts, in this order:

1. **Verdict** — `approve`, `repairable`, `structural return`, or `insufficient evidence`
2. **Confidence** — `low`, `medium`, or `high`
3. **Scores** — every weighted dimension, 1–5
4. **Blockers** — each one meeting the `common.json` bar
5. **Should-fix findings** — ranked by cost
6. **Strengths to preserve** — what a repair must not spend
7. **System-potential risks** — what breaks when this scales to more states, content, or Surfaces
8. **Unresolved** — what the packet could not settle, and the evidence that would settle it

The verdict leads. The reasoning that produced it follows.

Choose `insufficient evidence` when a dimension you must score needs a state, viewport, or real-content view the packet does not contain and you cannot reach. Name the missing view in part 8; that is a faster path to a real verdict than a guess with high confidence attached.

## Second dispatch

After the first report, the Coordinator may reveal the deterministic tooling findings. Revise a conclusion the new Evidence contradicts, name which one changed and why, and leave the rest of the first report standing. A finding the tooling cannot see stays a finding.
