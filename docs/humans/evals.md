# Eval Playground

## Decision

The playground starts in this repository, under `evals/`, because it needs to share Workflow schemas, rubrics, and versions. It uses its own seam to allow later extraction.

## Core question

Does the system improve designs relative to a strong agent without ChromaRelay?

The answer must not depend only on a score from the same model that created the design.

## Basic comparison

For each Eval Case:

1. freeze brief, assets, stack, and seed when applicable;
2. run the Baseline without ChromaRelay;
3. run the Candidate with ChromaRelay;
4. normalize environment, viewport, and data;
5. apply deterministic gates;
6. run blind paired visual comparison;
7. use critics from different models;
8. record cost, latency, iterations, and human intervention.

## Metrics

### Quality

- product fit;
- hierarchy;
- specificity;
- composition;
- typography;
- coherence;
- responsiveness;
- craft;
- off-happy-path quality.

### Consistency

- token drift;
- component reuse;
- unjustified variation across Surfaces;
- Lock fidelity.

### Creativity

- material distance between Directions;
- memorability;
- absence of default template;
- system potential;
- originality without copying.

### Operational

- tokens and cost;
- wall time;
- number of Runs/phases;
- repairs needed;
- schema failure rate;
- number of human decisions.

## Blinding

- remove the `baseline` and `candidate` names from judgment packets;
- randomize A/B side;
- don't provide creator reasoning;
- keep the detector report hidden until the first visual verdict;
- record disagreement; don't force artificial consensus.

## When to split the repository

Extract the eval harness when at least one condition occurs:

- fixtures and screenshots dominate the repo size;
- eval CI has its own cycle and credentials;
- other systems consume the runner without consuming ChromaRelay;
- rubric releases need independent versioning.
