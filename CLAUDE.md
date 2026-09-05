# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run build              # tsc -p tsconfig.json -> dist/
npm test                   # node --test dist/test/*.test.js (requires a build first)
npm run check              # build + test + typecheck:omp; this is what CI runs
npm run validate:framework # build + CLI validate-framework against ./framework
```

Tests run against compiled JS in `dist/`, not TypeScript sources. Always `npm run build` before `npm test`.

Single test file:

```bash
npm run build && node --test dist/test/design-manager.test.js
```

Single test case:

```bash
npm run build && node --test --test-name-pattern "routes new design work to CREATE" dist/test/
```

Exercise the CLI directly (all commands accept `--root` for the workspace and `--system` for the framework root):

```bash
node dist/src/cli.js route examples/request.create.json --system framework
node dist/src/cli.js start examples/request.create.json --root /tmp/target --system framework
node dist/src/cli.js status  # phase | handoff | advance | validate | validate-framework
```

Install the Project Overlay into another repository (this is the product's real entry point):

```bash
node scripts/install.mjs --target /path/to/repo --omp   # --minimal, --force, --dry-run
```

CI (`.github/workflows/ci.yml`) additionally smoke-tests the overlay by installing into a temp dir and validating the copied framework.

## What this repository is

ChromaRelay is a portable design-work management OS for agent teams. It is **not** a design library: it ships a state machine, contracts, and role/authority rules that another repository installs as an overlay. The TypeScript core is small; most of the system's behavior lives in declarative JSON under `framework/` and in Markdown Skills under `.agents/skills/`.

## Architecture

Three layers that must stay separable:

1. **Core** (`src/`) — pure TypeScript, no harness dependencies. `DesignManager` is the one deep module (ADR-0001): routing, the phase state machine, skill budgets, authority validation, and persistence all hide behind it. `Workspace` is the only real seam, with `FileWorkspace` and `MemoryWorkspace` as its two adapters — tests use the memory adapter and observe behavior through the same interface callers use.
2. **Framework** (`framework/`) — the declarative definition of the system: five workflow definitions, registries (`agents`, `kits`, `gates`, `skills`, `surfaces`, `workflows`), JSON Schemas, rubrics, and document templates. `loadRegistryBundle` reads these at runtime; `validateRegistryBundle` cross-checks that every phase references a known role, kit, and gate, and that no kit exceeds the supporting-skill budget.
3. **Harness adapter** (`.omp/`) — OMP-specific agents, slash commands, prompts, a pre-tool guard hook, and a `chromarelay_state` custom tool. The core never imports this; a Claude Code or Codex adapter could replace it without touching the Run model.

Adding a workflow phase, role, kit, or gate means editing JSON in `framework/`, not `src/`. `validate:framework` is the check that keeps those references honest.

### Execution model

```
DesignRequest -> route() -> RunContract -> PhasePacket -> specialist -> Handoff
  -> recordHandoff() -> advance()/branch/return/escalate -> Promotion
```

`route()` picks among `CREATE | DOCUMENT | REDESIGN | EXPLORE | REFINE` from request attributes (`hasExistingDesign`, `documentationTrusted`, `existingQuality`, `changeMagnitude`, `explorationOnly`) and assigns a decision level 0–3 that controls how much process the run gets. An explicit workflow is still checked for compatibility — `CREATE` on a trusted existing design and `REFINE`/`REDESIGN`/`DOCUMENT` without one both throw `ContractError`.

Run state is written under the target workspace, never in this repo's source tree:

```
.chromarelay/system/       installed framework; only setup/upgrade writes
.chromarelay/project/      canonical truth; only Promotion writes
.chromarelay/runs/<id>/    run.json, request.json, events.jsonl, phase-packets/, handoffs/, decisions/
.chromarelay/active-run.json
```

`.chromarelay/runs/` and `active-run.json` are gitignored here.

### Invariants enforced in code

`validateRun` rejects any Run where the coordinator is not the canonical owner, the memory-curator is not the promotion role, `creatorMayFinalCritique` is not `false`, or the skill budget exceeds 1 primary / 2 supporting. `recordHandoff` rejects a handoff whose phase or role does not match the run's active phase. `advance` refuses to leave a specialist phase with no persisted handoff unless `--force`, and refuses `--skip` on a phase that lacks `skipWhen`. `FileWorkspace` and `MemoryWorkspace` both reject paths that escape the root.

These are load-bearing, not defensive noise. Do not relax them to make a scenario work.

### Context isolation

`defaultOmissions` in `design-manager.ts` is where contamination controls are encoded: art-directors do not see peer candidates, visual critics do not see creator identity or reasoning or which candidate is new, builders do not see rejected directions. Changes that widen a Phase Packet can silently break the system's core claim — creator is not final judge, and divergence is genuinely independent. See `docs/agents/context-policy.md`.

## Conventions

`AGENTS.md` is the primary instruction file and applies here; read it plus `CONTEXT.md` before naming domain concepts. `CONTEXT.md` is a strict glossary with `_Avoid_` lists — use Run, Phase, Phase Packet, Role, Skill, Handoff, Lock, Gate, Evidence, Direction, Surface, Baseline, Promotion, Project Overlay exactly as defined, and module/interface/implementation/seam/adapter/depth/leverage/locality for architecture.

Authority order when sources conflict (record the conflict, follow the higher source): explicit user requirements → `PRODUCT.md` and `CONSTRAINTS.md` → accepted Locks and ADRs → `DESIGN.md` and canonical tokens → component contracts → Surface Brief and current Run decisions → skill guidance.

TypeScript is strict with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. The latter is why the codebase spreads conditionals for optional fields (`...(request.surfaceClass ? { surfaceClass: request.surfaceClass } : {})`) instead of assigning `undefined`. Module resolution is `NodeNext`, so relative imports carry a `.js` extension even from `.ts` sources. `.omp/**/*.ts` is excluded from the build — it compiles against OMP's own types.

Specs, tickets, and Wayfinder maps live in GitHub Issues, not in files; see `docs/agents/issue-tracker.md`. ADRs in `docs/adr/` are only for decisions that are costly to reverse, surprising without context, and a real trade-off.

Documentation language splits by audience: `docs/humans/`, `README.md`, and `docs/architecture/` are Portuguese; agent contracts (`AGENTS.md`, `CONTEXT.md`, `docs/agents/`), code, and framework JSON are English. Match whichever file you are editing.
