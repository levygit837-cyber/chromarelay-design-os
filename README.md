# ChromaRelay Design OS

ChromaRelay is a portable creative-work management system for agents. It coordinates discovery, documentation, direction exploration, design-system creation, implementation, auditing, visual critique, repair, and promotion of approved decisions.

The goal is not to impose a style. The goal is to preserve freedom during exploration and increase consistency after a direction is chosen.

## Principles

1. **Diverge before deciding.** Creative directions are produced in independent contexts and compared before implementation.
2. **Converge after the choice.** The selected direction becomes contract, tokens, components, and surface rules.
3. **Creator is not final judge.** Deterministic auditing and visual critique are separate responsibilities.
4. **Skills are guidance, not truth.** Requirements, locked decisions, and project contracts take precedence.
5. **Minimum context per phase.** Each agent receives only what it needs for its current responsibility.
6. **Evidence before promotion.** Experiments stay in Runs; only approved decisions enter canonical state.
7. **Proportional process.** Trivial changes don't go through a creative tournament; systemic decisions aren't treated as small patches.

## Workflows

| Workflow | Primary use |
| --- | --- |
| `CREATE` | Create a direction and an implementation from scratch |
| `DOCUMENT` | Turn an existing undocumented design into a reliable operational model |
| `REDESIGN` | Replace a weak visual expression while preserving product truths and behaviors |
| `EXPLORE` | Generate and select independent creative directions |
| `REFINE` | Improve a localized base through hypothesis, comparison, and verification |

The workflows share the same core but enter and exit at different phases. See [docs/humans/workflows.md](docs/humans/workflows.md).

## Architecture

ChromaRelay uses a **Coordinator** as the sole owner of canonical state. Specialists work in isolated Runs, return structured Handoffs, and never promote decisions to the project directly.

```text
Request
  -> Workflow Router
  -> Run Contract
  -> Phase Packet
  -> Specialist Agent(s)
  -> Structured Handoff
  -> Coordinator Transition
  -> Deterministic Audit + Blind Visual Critique
  -> Bounded Repair
  -> Promotion to Canonical Project State
```

The core is portable. The main adapter included in this repository is for [OMP / oh-my-pi](https://omp.sh), with specialized agents, model roles, prompt templates, slash commands, hooks, custom tools, isolation, and coordination via `hub`/IRC.

## Repository structure

```text
.agents/skills/       Portable on-demand Skills
.omp/                 OMP adapter: agents, commands, prompts, hook, and custom tool
framework/            Registries, workflows, schemas, templates, and rubrics
src/                  TypeScript core and CLI
scripts/              Project Overlay installer
examples/             Minimal examples
evals/                Eval playground, isolated by seam
docs/humans/          Instructions for people
docs/agents/          Contracts for agents
docs/architecture/    System architecture
docs/adr/             Hard-to-reverse decisions
```

## Quickstart

```bash
npm install
npm run build
npm test
node scripts/install.mjs --target /path/to/project --omp
```

In the target project:

```text
/chromarelay <describe the work>
```

The Coordinator will classify the request, create a Run Contract, and load only the kit needed for the first phase.

Read [docs/humans/quickstart.md](docs/humans/quickstart.md) and [docs/humans/omp-integration.md](docs/humans/omp-integration.md).

## Evals

The eval playground lives in this repository because contracts, rubrics, and fixtures need to evolve together with the system. It sits behind its own interfaces and can be split out once it has an independent release cycle, artifact volume, or CI cost. See [ADR-0002](docs/adr/0002-keep-evals-in-this-repository-initially.md).

## State

This codebase defines the operating system, the contracts, the OMP adapter, and the initial harness. Specific visual integrations, external component registries, and multimodal runners can be added without widening the Coordinator interface.
