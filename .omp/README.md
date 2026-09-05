# ChromaRelay OMP Adapter

- `agents/`: Role-scoped task agents using model aliases and autoloaded Skills.
- `commands/`: human entry points.
- `prompts/`: reusable internal assignment formats.
- `hooks/pre/chromarelay-guard.ts`: blocks raw canonical-state mutation.
- `tools/chromarelay-state.ts`: deterministic state and Promotion operations.
- `config.example.yml`: recommended role and concurrency mapping.

Use the main session as Coordinator with `/chromarelay`, or explicitly dispatch `chromarelay-coordinator`. Specialists are intended to be spawned by the Coordinator with explicit output schemas. Builder and Repairer should run with task isolation.
