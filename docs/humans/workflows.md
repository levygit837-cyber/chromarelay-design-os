# ChromaRelay Workflows

Each Workflow is a reusable state machine. The Coordinator may skip phases only when the phase policy and the decision level justify it.

## CREATE

Use when there is a product idea but no canonical visual direction.

```text
intake
-> grounding
-> domain exploration
-> independent directions
-> visual specimens
-> blind tournament
-> canonization
-> information architecture
-> component plan
-> lighthouse implementation
-> deterministic audit
-> blind visual critique
-> bounded repair
-> promotion
```

Output: documented product, selected Direction, `DESIGN.md`, tokens, Surface contracts, pilot implementation, and Evidence.

Don't use CREATE for a small change in an already consistent project.

## DOCUMENT

Use when there is an existing design or codebase but no reliable operational representation.

```text
freeze baseline
-> code inventory
-> render inventory
-> as-is model
-> fidelity validation
-> canonical analysis
-> opportunity map
-> route to maintenance, REFINE or REDESIGN
```

Documentation distinguishes `observed`, `inferred`, `proposed`, `approved`, `locked`, and `deprecated`. Frequency doesn't automatically become intent.

Output: `AS_IS_DESIGN`, token/component/state inventories, Drift Report, and Opportunity Map.

## REDESIGN

Use when the problem is systemic, compositional, structural, or identity-level.

```text
preserve product truths
-> root-cause diagnosis
-> redesign charter
-> target-world divergence
-> lighthouse pilot
-> baseline comparison
-> design system v2
-> migration waves
-> full verification
-> promotion
```

The old system stays available until the pilot beats the Baseline. Migration uses expand-contract when a broad swap can't stay green in a single slice.

## EXPLORE

Use when the main decision is still creative, not implementational.

```text
frame the creative question
-> define exploration axes
-> independent generation
-> eligibility gate
-> visual prototypes
-> pairwise tournament
-> system-potential review
-> select or preserve finalists
```

Directions must diverge on at least three material axes: composition, typography, navigation, density, surfaces, rhythm, motion, or signature.

The same agent shouldn't generate every option when diversity is critical. Use independent contexts and, preferably, more than one model.

## REFINE

Use when there is a reasonable base and the target is localized.

```text
bound scope
-> capture baseline
-> diagnose
-> form hypothesis
-> explore only uncertain decisions
-> coherent change batch
-> blind before/after
-> deterministic audit
-> promote or revert
```

Each change must answer an observable hypothesis. If the diagnosis requires swapping identity, shell, and information architecture, the work must be reclassified as REDESIGN.

## Composition

Workflows can chain:

- `DOCUMENT -> REFINE`;
- `DOCUMENT -> REDESIGN`;
- `CREATE -> EXPLORE -> canonization`;
- `REDESIGN -> EXPLORE -> pilot`;
- `REFINE -> REDESIGN` when the root cause is systemic.

## Proportional process

| Level | Example | Minimum process |
| --- | --- | --- |
| 0 | typo, label, obvious alignment | fix and verify |
| 1 | component or section | Baseline, hypothesis, change, comparison |
| 2 | page or central Surface | brief, 2-3 Directions, selection, audit |
| 3 | system or product | full Workflow, pilot, and controlled promotion |
