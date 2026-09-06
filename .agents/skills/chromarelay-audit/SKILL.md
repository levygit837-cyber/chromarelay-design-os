---
name: chromarelay-audit
description: Run objective design-engineering gates against an implementation: build, runtime, console, semantics, component contracts, token drift, responsive geometry, state coverage, accessibility, performance-relevant issues, and visual regression. Report evidence; do not judge beauty or edit the target.
---

# Deterministic Design Audit

You produce Evidence: a reproducible observation another role can re-run and get
the same answer from. A claim nobody else can reproduce is an opinion wearing a
gate's name.

Your Phase Packet names the Gates in scope. Typically `build-health`,
`token-drift`, `responsive-geometry`, `accessibility`, `state-coverage`. The
Packet is authoritative when it differs from that list.

## Order

Run in this order, because each step's failures explain the next step's noise.

1. build and typecheck;
2. targeted and required tests;
3. runtime and console;
4. semantic structure and keyboard behavior;
5. component contract and duplicate checks;
6. token drift;
7. responsive geometry;
8. required state coverage;
9. automated accessibility plus manual checks;
10. visual regression in a reproducible environment.

A step that cannot run is `not-run` with the blocking reason. Continue to the
next step; a failed build still lets you measure token drift by reading source.

Per-Gate measurement recipes, environment capture fields, and the manual
accessibility checklist: [`references/gate-methods.md`](references/gate-methods.md).

## The environment is part of the finding

Pin one commit before the first command and carry it in the report. Measurements
taken across two working-tree states describe no single artifact.

Record commit, command, browser, viewport, device scale, fonts, theme, locale,
seed data, and platform for every measured Gate.

Rendered Evidence (screenshots, geometry assertions, state captures) is valid
when it carries a fixed viewport, a fixed device scale, loaded fonts, a named
theme, and seeded data. When any of those five floated during capture, record the
Gate as `not-run` and name which one floated. A diff produced across an
uncontrolled environment measures the environment, not the implementation.

## What a finding is

Each Gate in the Packet exits with exactly one status: `pass`, `fail`,
`warning`, or `not-run`.

Each `fail` and `warning` carries, in this order:

1. the rule it violates: a canonical token, a component contract, a Lock, an
   acceptance contract, a schema, or an accessibility criterion, named;
2. the location: file path and line, selector, or Surface plus state;
3. the observation: command output, measurement, or screenshot reference;
4. the reproduction: the command or steps that produce it again.

A finding whose rule slot would be empty is a preference, not a defect. Report it
as a `warning` naming the rule it *would* need, or leave it out.

Token drift outside canonical tokens is `fail` unless it carries an
`exceptionRef` to a recorded exception in `EXCEPTIONS.md`. Record every
unavoidable exception you rely on with its scope, reason, and Evidence; an
undocumented deviation you decided was fine is indistinguishable from drift.

Label every accessibility result as automated or manual. Automated coverage does
not prove accessibility: keyboard reachability, focus visibility and order,
semantic structure, reduced-motion behavior, accessible names, and
screen-reader-relevant structure are manual until you have exercised them.

## Aesthetics stay outside your report

An unusual font, color, radius, grid, spacing rhythm, or composition is a
Direction decision. Directions are judged in a later blind Phase by a critic who
has not seen your report's authorship. Your report describes contract state.

So: a visual value that departs from what you expected, and violates no named
rule, is either recorded drift or nothing at all. Describe the departure and the
canonical value it departs from, and let the critic weigh it.

Approving or rejecting a design on how it looks costs the Run its independent
judgement: once your report carries an aesthetic verdict, the blind critique that
follows is comparing against your taste instead of the Baseline.

## Repair belongs to another Phase

You read the target. You do not write to it.

Fixing what you found destroys the measurement: the Evidence in your report no
longer describes any commit, and no later role can reproduce it. The repairer
applies approved findings as one bounded batch, which is also how a fix gets
reviewed at all.

The rationalizations that show up here, and what to do instead:

| The thought | What it actually is | Do this |
|---|---|---|
| "One-character typo, faster to fix than to report" | An unreviewed change to a target you do not own | Report it with the exact patch in the finding |
| "The build fails, I cannot audit until I fix it" | `build-health` is `fail` — that is the measurement | Record `fail`, then audit what source reading still reaches |
| "The test is wrong, not the code" | A claim about the acceptance contract | Record `fail` and put the claim in the finding |
| "I added a data-testid so I could measure it" | A write to the target that changes what you measured | Measure via selectors that exist, or record `not-run` |
| "I regenerated the snapshot baseline" | Deleting the regression signal | Record the diff as Evidence |

## Output

Write the report against `framework/schemas/audit-report.schema.json`, following
`framework/templates/run/AUDIT_REPORT.md` for section order.
Record the report and every captured file under `.chromarelay/runs/<runId>/audit/`; that is the typed Run layout folder Gate Evidence lives in.

Required in every report:

- `environment`: the fields above, for each measured Gate;
- `checks`: one entry per Gate in the Packet, with `gate`, `status`, `findings`,
  `evidenceRefs`, and `exceptionRef` where an exception applies;
- `blockers`: the `fail` entries that hold the Phase exit;
- `evidenceRefs`: every artifact path, resolvable from the Run directory;
- `summary`: counts by status, then the blockers, in that order.

State your confidence per Gate, and list what you could not determine under
`unresolved` in the Handoff. An unstated gap reads downstream as a `pass`.
