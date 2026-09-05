# Promotion Manifest — run-cli-landing-001

## Promotion could not be executed. This is a finding, not a step skipped.

The Run reached the `promotion` phase and stopped there. Three independent reasons, each
verified by command:

1. **The CLI has no `promote` command.** `grep -n "promote" src/cli.ts` → exit 1, no matches.
   The eight commands are route, start, status, phase, handoff, advance, validate,
   validate-framework.
2. **Promotion lives only in the OMP adapter.** `.omp/tools/chromarelay-state.ts` implements it,
   and that file is excluded from the build (`tsconfig.json` exclude lists `.omp/**/*.ts`). It
   does not compile standalone: `npx tsc --noEmit .omp/tools/chromarelay-state.ts` reports
   `Cannot find module '@oh-my-pi/pi-coding-agent'`, which is absent from `package.json`.
3. **`.chromarelay/project/` does not exist.** Only `runs/` and `active-run.json` were created by
   this Run. `promote` requires the destination to be inside `.chromarelay/project`, and nothing
   in `start` or `advance` creates it.

So the terminal phase of the flagship workflow is reachable in state but not executable through
the interface that ran the other thirteen phases.

## Nothing here was approvable anyway

The phase input is `approved Run Artifacts`. Counted in this Run: **9 artifacts, all
`status: "proposed"`; 3 decisions, all `status: "proposed"`.** Zero approved. No phase in
`create.json`, no gate in `gates.json`, and no CLI command transitions a proposed record to
approved. `promote`'s authorization predicate reads `status === "approved" || "locked"`, so the
honest state of this Run authorizes no promotion — correctly.

## What would have been promoted

Had approval existed, these are the reusable contracts worth canonical status:

| Artifact | Destination | Why reusable |
|---|---|---|
| `design-draft.md` token block | `.chromarelay/project/DESIGN.md` | 3-value palette, 1 family / 3 sizes, 5 spacing steps — measured zero drift |
| `DEC-002-token-contract` | `.chromarelay/project/DECISIONS.md` | the clamp and four-character rule are auditable terms |
| Anti-default Ledger from `domain-map.md` | `.chromarelay/project/DESIGN.md` | four rejected genre defaults, all held through implementation |
| `index.html` | product repo, not canonical | one surface, not a contract |

**Not promotable:** `visual-specimens.md` (prose standing in for renders), `shot-375.png`
(invalid — captured under the headless width floor), `tournament-report.md` verdict (formed on
prose, 3-point margin inside noise).

## Provenance chain, verified

Complete and traceable: 12 handoffs across 13 phases, 21 events in `events.jsonl`, every
artifact carrying `sourceRefs` back to its inputs. This part of the system worked exactly as
designed — the audit trail is real, and it is what makes every finding in this Run checkable.

## Self-approval probe

A decision with `scope: "project"`, `status: "approved"`, `approvedBy` equal to its own author,
and `evidence: []` was submitted through the real CLI. It was **accepted and written verbatim**
to `decisions/` and appended to `run.decisionRefs`. The record is preserved outside the Run as
evidence and was removed so it would not contaminate this manifest. See EXECUCAO-P-1.md.
