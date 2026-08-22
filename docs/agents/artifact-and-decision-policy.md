# Artifact and Decision Policy

## Artifact statuses

- `observed`: direct fact from code, render, data, or user statement;
- `inferred`: interpretation with confidence and source;
- `proposed`: candidate not yet selected;
- `approved`: accepted for the current Run or scope;
- `locked`: canonical and protected from silent change;
- `deprecated`: retained for history but no longer authoritative;
- `rejected`: evaluated and not selected.

## Provenance

Every Artifact must identify:

- Run and Phase;
- producer Role and agent id when available;
- source inputs;
- creation timestamp;
- status;
- content hash or immutable path;
- Evidence references.

## Decision record

A Decision contains:

```json
{
  "id": "typography-display-001",
  "scope": "project",
  "status": "approved",
  "choice": "Use a condensed grotesk for display roles",
  "rationale": ["..."],
  "alternatives": ["..."],
  "evidence": ["..."],
  "risks": ["..."],
  "revisitWhen": ["..."]
}
```

## Promotion eligibility

An Artifact or Decision may be promoted only when:

- its status is `approved`;
- required Gates passed or exceptions are recorded;
- provenance is complete;
- it does not silently conflict with a Lock;
- its destination scope is explicit;
- the Coordinator performs Promotion.

## ADR threshold

Create an ADR only when a decision is:

1. costly to reverse;
2. surprising without context;
3. a real trade-off among alternatives.

Most visual choices belong in `DESIGN.md` or Decision records, not ADRs.

## Exceptions

Exceptions are scoped, justified and reviewable. An exception never silently changes the general rule.
