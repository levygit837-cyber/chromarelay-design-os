# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.1] - 2026-09-06

Docs-only release: the remote repository is now fully EN-US.

### Changed

- Translated all PT-BR human-readable documentation to EN-US
  (`README.md`, `docs/humans/`, `docs/architecture/`), preserving
  meaning, structure, links, and code blocks.
- Documentation language policy is now EN-US everywhere (see
  `CLAUDE.md`); domain terms stay exactly as defined in `CONTEXT.md`.

### Fixed

- No Portuguese words remain in tracked filenames or prose.

[Unreleased]: https://github.com/levygit837-cyber/chromarelay-design-os/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/levygit837-cyber/chromarelay-design-os/releases/tag/v0.1.1

## [0.1.0] - 2026-09-05

Baseline release of ChromaRelay Design OS: the portable design-work
management core for agent teams, installable as a Project Overlay in
another repository.

### Added

- `DesignManager` core: routing across the five workflows (`CREATE`,
  `DOCUMENT`, `REDESIGN`, `EXPLORE`, `REFINE`), phase state machine,
  structured Handoffs, and Promotion to canonical project state.
- CLI (`route`, `start`, `status`, `phase`, `handoff`, `advance`,
  `validate`, `validate-framework`) for operating Runs from the terminal.
- Project Overlay installer (`scripts/install.mjs --target ... --omp`,
  with `--minimal`, `--force`, and `--dry-run`).
- Declarative framework in `framework/`: workflow, agent, kit, gate,
  skill, and surface registries, plus schemas, templates, and rubrics.
- Role-based agent skills and OMP adapter (agents, commands, prompts,
  guard hook, and `chromarelay_state` custom tool).
- Phase Packets with resolvable inputs, Gate result ledger, and honoured
  phase transitions.
- Skill attribution on every Handoff (traceability of which Skill
  produced the work).
- Authority and context-budget invariants: the Coordinator is the sole
  owner of canonical state, a creator is never the final judge of its own
  work, and each phase gets at most 1 primary and 2 supporting skills.

### Changed

- System renamed from Createive to ChromaRelay across the repository,
  framework, skills, and documentation.
- Agent bodies aligned to skill contracts, deduplicated, and speaking the
  Coordinator transition enum.

### Fixed

- Closed the seven P-0/P-1 conformance gaps (including the critique Skill
  referencing an existing rubric field).
- Framework cross-validation (`validate-framework`) covering phase
  references to known roles, kits, and gates.

[Unreleased]: https://github.com/levygit837-cyber/chromarelay-design-os/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/levygit837-cyber/chromarelay-design-os/releases/tag/v0.1.0
