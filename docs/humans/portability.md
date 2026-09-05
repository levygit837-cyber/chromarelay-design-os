# Portability and Project Overlay

## Goal

ChromaRelay must enter an existing project without taking over its architecture, dependencies, or documentation.

## Installed contents

```text
.chromarelay/system/       versioned framework copy
.chromarelay/project/      canonical project documents
.chromarelay/runs/         local runs
.agents/skills/          portable Skills
.omp/                    optional OMP adapter
AGENTS.md                delimited block, without deleting existing content
```

## Modes

### Full with OMP

```bash
node scripts/install.mjs --target ../product --omp
```

### Portable without harness

```bash
node scripts/install.mjs --target ../product
```

Installs the framework, Skills, and contract for generic agents, but no OMP agents/commands/tools.

### Minimal

```bash
node scripts/install.mjs --target ../product --minimal
```

Installs only the Coordinator Skill, schemas, Workflows, and essential templates.

## Safe merge

The installer:

- never removes project files;
- writes only ChromaRelay paths;
- doesn't overwrite by default;
- updates the `BEGIN CHROMARELAY`/`END CHROMARELAY` block in `AGENTS.md`;
- produces a manifest with version and hashes;
- supports dry-run.

## Update

Back up or commit before updating. Run:

```bash
node scripts/install.mjs --target ../product --omp --dry-run
node scripts/install.mjs --target ../product --omp --force
```

Compare `install-manifest.json` and review changes to Skills, hook, and schemas.

## Removal

Removing ChromaRelay means deleting only:

- `.chromarelay/`;
- `chromarelay-*` files in `.omp/`;
- `chromarelay-*` Skills in `.agents/skills/`;
- the delimited block in `AGENTS.md`.

Never use a glob-based removal routine without checking the manifest.

## Future distribution

The core may be published as an npm package and the OMP adapter as an extension. Until then, the repository installer is the distribution source.
