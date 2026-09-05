# Quickstart for humans

## 1. Install the system in a project

In the ChromaRelay repository:

```bash
npm install
npm run build
node scripts/install.mjs --target /path/to/project --omp
```

The installer merges without deleting existing files:

- copies the framework to `.chromarelay/system/`;
- creates the initial `.chromarelay/project/` state;
- installs portable Skills in `.agents/skills/`;
- installs agents, commands, prompts, hook, and custom tool in `.omp/`;
- adds a delimited block to the project's `AGENTS.md`.

Use `--minimal` to install only the core and the Coordinator Skill. Use `--force` only to update ChromaRelay files you have already reviewed.

## 2. Open OMP in the target project

Configure model roles per `docs/humans/omp-integration.md`, open OMP at the root, and invoke:

```text
/chromarelay I want to create a hub for managing research agents...
```

You can also declare the Workflow:

```text
/chromarelay workflow=DOCUMENT document the current design before suggesting changes
/chromarelay workflow=REDESIGN transform the site while keeping content and behavior
/chromarelay workflow=EXPLORE generate directions for an orchestration UI
/chromarelay workflow=REFINE improve the first fold without changing identity
```

## 3. What the human needs to provide

The ideal input has:

```text
What I'm building:
Who uses it:
Core task:
What it needs to look or communicate:
What must not change:
What is open:
Optional references:
Scope:
Autonomy mode:
```

No need to pick grid, font, color, or layout. Those are the system's problems while still open.

## 4. Autonomy modes

- `assisted`: the human approves brief, Direction, system, pilot, and result;
- `guarded`: recommended; the system interrupts only for ambiguous, irreversible, or high-impact decisions;
- `full`: the system picks and executes reversible decisions on its own, reporting Evidence.

## 5. How to follow along

```text
/chromarelay-status
```

Status shows Workflow, current Phase, required Artifacts, active agents, blockers, and next decision.

In OMP, use `Alt+A` to follow subagents. The Coordinator remains the default human contact.

## 6. How to resume

```text
/chromarelay-resume
```

Resumption reads `active-run.json`, the Run Contract, and the latest Phase Packet. It doesn't inject the whole previous transcript.

## 7. When to intervene

Intervene when:

- two finalist Directions represent different products;
- an identity Lock needs reopening;
- competent critics disagree materially;
- a decision has high reversal cost;
- the system can't distinguish requirement from preference.

Don't intervene just to pick CSS values the system can test and compare.
