# Pre-declared deliverable format on DesignRequest

- Date: 2026-09-06
- Status: considering (issue #26: https://github.com/levygit837-cyber/chromarelay-design-os/issues/26)
- Context: while reviewing how ChromaRelay produces results, we found the system defines no explicit output type. Format (HTML file, full frontend project, stack, language) only exists today as free text inside `objective` or `hardConstraints` (e.g. `mirror/chromarelay/runs/run-cli-landing-001/` became single-file HTML only because the objective literally asked for it).
- Problem: without a pre-declared deliverable, the Run has no verifiable final shape. The builder infers the stack from the target repo or free text, and no Gate can check "the delivery is what was asked for" because nothing structured was asked.
- Idea: add an optional structured deliverable declaration to `DesignRequest`, captured at Run intake, carried into the `RunContract`, and surfaced to implementation Phases. It declares the final objective (e.g. complete frontend project vs. HTML artifact), noting that a frontend project may still contain intermediate HTML artifacts (specimens, captures). When the deliverable is a frontend project, `ProgrammingLanguage` and at least one `Framework` become required. Phase outputs (`implementation patch`, `renderable Surface`) stay format-agnostic.
- Sketch: new optional field on `DesignRequest` (precedent: `surfaceClass`), copied to `RunContract` at `route()` time, cross-validated in `validateRequest`, mirrored as a technical constraint so existing Skills keep working on text, and included in builder/repairer Phase Packets. Schema updates in `framework/schemas/run-contract.schema.json`. String-based values with documented examples rather than a closed enum.
- Worth doing if: a builder receiving only the Phase Packet can determine the expected final format without reading free-text constraints, and a Gate can verify the delivery matches the declared format.
- Open questions:
  - Default when absent: infer, `"unspecified"`, or require at decisionLevel >= 2?
  - How to represent "no framework" (vanilla HTML/CSS/JS) without making `frameworks: min 1` meaningless — accept `"none"`?
  - REDESIGN/REFINE/DOCUMENT already have code: infer stack/language from the Baseline instead of asking, allow explicit override only?
  - Does the field apply to EXPLORE (conceptual output, no implementation) and DOCUMENT (as-is output)?
  - Closed enum vs. free strings for language/framework (enum rots fast; free strings are the repo's existing style for `hardConstraints`)?
  - Should the coordinator also materialize the declaration as a technical constraint in CONSTRAINTS.md, or keep a single source of truth?
- Decision: (filled on close: done/dropped + reason + date)
