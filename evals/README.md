# ChromaRelay Eval Playground

This directory is the eval-harness seam. It shares schemas and rubrics with the core but does not mutate canonical project state.

```text
cases/       fixed briefs and execution contracts
rubrics/     judgment protocols
runs/        ignored generated manifests and outputs
baselines/   ignored heavy baseline media; keep text manifests
candidates/  ignored heavy candidate media; keep text manifests
```

A valid experiment compares the same model/brief/stack/assets/data with and without ChromaRelay, then uses deterministic gates and blind randomized pairwise judgment. Record model, role mapping, prompts, active Skills, cost, latency, interventions, outputs, and critic disagreement.

Use `framework/schemas/eval-case.schema.json`. Start small; do not optimize the framework to one showcase case.
