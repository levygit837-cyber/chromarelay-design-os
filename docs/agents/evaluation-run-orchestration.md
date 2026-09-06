# Evaluation Run Orchestration Contract

Authority for parallel evaluation Runs. The Run tickets (#19 finance dashboard, #20 agentic chat, #21 battleground game) reference this contract as their orchestration authority; #22 compares the resulting Runs. A Run coordinator executing under this contract does not ask the user for any orchestration decision recorded here — workflow, autonomy, isolation, Role sandboxes, Skill budget, specimen rule, prototype layout, archive location, and PR policy are all fixed. The only user-facing question permitted is the escalate state in the PR policy.

This contract outranks Skill guidance (ADR-0005) but sits inside the normal authority order: explicit user requirements, `PRODUCT.md`, `CONSTRAINTS.md`, and accepted Locks still outrank it. It does not override ADRs — ADR-0002 keeps evaluation in this repository, and ADR-0003 keeps the Coordinator as the only owner of canonical state.

## Fixed Workflow and autonomy

- **Workflow: CREATE** for every evaluation Run. Each case creates a new product with no existing design, so an explicit CREATE is compatible with the routing facts; the other four Workflows are out of scope for this batch.
- **Decision level 3** (the registry's typical for CREATE). Each Run Contract records `workflow: "CREATE"`, `decisionLevel: 3`, and validates against `framework/schemas/run-contract.schema.json`.
- **Autonomy: full.** The Coordinator auto-decides every reversible choice — respecting Locks, backed by Evidence, not changing global identity, and with no material critic disagreement. Orchestration choices below are pre-decided by this contract and are never re-asked. Escalate to a human only for a choice that is irreversible, changes global identity, or where material disagreement survives the Evidence; present at most three options, the material differences, and a recommendation.

## Parallel isolation

- **One Run per case, and Runs run in parallel.** No Run reads, writes, or reasons about another Run's Run folder, Handoffs, Directions, or specimens. Parallel Runs are replications for comparison, not a committee — cross-Run awareness is contamination of the eval, exactly like a critic seeing creator reasoning.
- **One worktree and one branch per Run.** The Coordinator creates them before intake and the Run owns them exclusively for its lifetime. Branch name: `eval/<runId>` using the Run Contract's `runId`. The worktree lives outside the tracked source tree and outside every Run folder; register its path in the Run state so it is recoverable.
- Builders and Repairers write product code only inside their own Run's worktree. Read Roles get no file-editing tools anywhere. `.chromarelay/project` is not a scratch area and no evaluation Run writes to it.
- **Promotion is scoped to the Run folder.** Evaluation Runs never promote into `.chromarelay/project`; the memory-curator's Promotion Manifest for these Runs records the Run folder as destination, and the merged PR is the durable record.

## Role sandbox boundaries

Compile each Phase Packet from the Role's registry contract (`framework/registry/agents.json`) and enforce its `mustNot` list as non-goals in the dispatch:

- Read Roles — inspector, product-strategist, reference-analyst, art-director, visual-critic — receive no editing tools and may not write product code.
- Only builder and repairer write product code, only in the isolated worktree (`mayWrite: ["isolated product worktree", "Run evidence"]`).
- The deterministic-auditor writes Run reports and Evidence only, and never edits the implementation under audit.
- The Coordinator authors only coordinator-Role Phases; every specialist output arrives as a dispatched Handoff, validated and persisted before any transition.
- Contamination controls from `docs/agents/context-policy.md` apply unchanged: art-directors do not see competing candidates, critics do not see creator reasoning or identity, builders do not see rejected Directions.

## Skill Kit budget

- **One primary Skill plus at most two supporting references per Phase**, taken from the Phase's declared kit in `framework/registry/kits.json`. This matches `defaultBudget` in `framework/registry/skills.json` and the budget `validateRun` enforces; the Coordinator must not bundle kits, borrow a second kit's primary, or add a third supporting reference.
- **Global skills are disabled for Runs.** Harness-level or user-global skills outside the registry stay off for the Coordinator and every dispatched specialist. The only Skills a Phase Packet may load are the registry Skills in that Phase's kit. The Coordinator's own `chromarelay-design-manager` is a registry Skill and remains allowed.
- Each Run Contract records this as a hard constraint: "kit-only Skill loading; global skills disabled".

## HTML specimens are reference only

- The `visual-specimens` Phase renders fast HTML Direction specimens to judge hierarchy, signature, component language, and system potential. **A specimen is a visual reference Artifact, never the source of truth for the final build.**
- The `lighthouse-build` Phase implements from the DESIGN draft, tokens, Component Plan, and Surface Brief. Its Phase Packet carries the non-goal: do not port specimen markup. Specimen HTML/CSS must not be copied, translated line-by-line, or otherwise promoted into the React implementation.
- Each Run Contract records this as a hard constraint so the rule survives Phase compaction.

## Final prototype layout

- **One bootable React plus TypeScript application per Run, inside that Run's own Run folder.** Runs share no application scaffold; similar structure is acceptable, code is per-Run.
- The app includes a README stating the exact commands. From a clean checkout of the Run's branch, `npm install` followed by the documented dev command must boot the app.
- The builder smoke-tests boot before its Handoff, and the smoke output is recorded as Evidence for the `build-health` Gate.
- The typed Artifact folder layout is defined by ticket #18; where that layout is silent, place Artifacts inside the Run folder rather than inventing new top-level directories.

## Local archive: base prompt and adapted Run Contract

- Each Run archives locally, inside its Run folder, the **original base prompt text verbatim** alongside the **adapted Run Contract** that the intake Phase produced from it. The pair lives together so #22 can audit the adaptation without hunting.
- The Run Contract validates against `framework/schemas/run-contract.schema.json`. The archive is a repository file, never only a PR description, chat message, or issue body.

## PR, review, and merge policy

- **One PR per Run**, opened from `eval/<runId>`, referencing the Run ticket and the Run Contract. The PR body links the Run's Evidence — Gate results, smoke test, and the archived base prompt and Run Contract paths — so the record lives in the repository, not only in PR discussion.
- **Code-review Gate before merge.** A declared Gate over the full PR diff: method is a code review of the implementation, inputs are the diff, the README boot instructions, and the Run Contract; pass policy is a clean review with no blocking findings and boot instructions that hold.
- Exactly three post-review states:

  1. **Merge.** Review is clean: merge, then delete the Run's branch and worktree. Record the review result as Evidence in the Run folder before deleting anything.
  2. **Fix and re-review.** Blocking findings that are bounded become one coherent repair batch — repairer or builder, same worktree, no scope expansion, no Direction change — the PR updates, and the review re-runs. The loop repeats; an exhausted loop with the same findings recurring is an escalation, not a third silent retry.
  3. **Escalate.** Findings that are open questions of product truth, Direction, or unresolvable reviewer disagreement: park the PR, record the question with options, Evidence, and a recommendation in the Run state as `awaiting-human`, and do not merge.

- Merge never happens with unresolved blocking findings. Branch and worktree deletion happens only after merge (or explicit abandonment) and after Evidence is persisted.
- The three PRs are independent and may merge in any order; #22 starts only when all three Runs are complete with smoke Evidence.
