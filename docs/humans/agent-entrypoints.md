# How to start each conversation and which agent to use

## Default rule

Always start with the Coordinator, not a specialist:

```text
/chromarelay <goal and context>
```

The Coordinator routes, compiles context, and calls the right Role. Invoking specialists directly is only useful for debugging or work already bounded by a Phase Packet.

## Scenarios

| Situation | Input | First specialist Role |
| --- | --- | --- |
| New idea with no design | `/chromarelay workflow=CREATE ...` | Product Strategist |
| Existing design with no docs | `/chromarelay workflow=DOCUMENT ...` | Inspector |
| Bad design and broad change | `/chromarelay workflow=REDESIGN ...` | Product Strategist + Inspector in separate phases |
| Needs creative ideas | `/chromarelay workflow=EXPLORE ...` | Product Strategist, then independent Art Directors |
| Improve a section/component | `/chromarelay workflow=REFINE ...` | Inspector, then Visual Critic |
| Resume work | `/chromarelay-resume` | Role of the active Phase |
| Check state | `/chromarelay-status` | none; deterministic read |
| Create an experiment | `/chromarelay-eval ...` | eval Coordinator |

## Useful inputs

### CREATE

```text
/chromarelay workflow=CREATE
Product: research-agent hub.
User: technical person tracking parallel work.
Task: understand status and intervene.
Perception: precise, alive, advanced; not a generic SaaS dashboard.
Must not change: data architecture.
Open: direction, composition, typography, and motion.
Autonomy: guarded.
```

### DOCUMENT

```text
/chromarelay workflow=DOCUMENT
Inspect all public routes and critical states. Generate as-is documentation with Evidence and confidence. Do not suggest fixes until fidelity validation.
```

### REDESIGN

```text
/chromarelay workflow=REDESIGN
Preserve content, behavior, and SEO. Diagnose the root cause before generating three replacement worlds and validate a lighthouse pilot against the Baseline.
```

### EXPLORE

```text
/chromarelay workflow=EXPLORE
Question: how to communicate parallel activity and control without generic dashboard cards? Generate independent Directions and select via blind tournament.
```

### REFINE

```text
/chromarelay workflow=REFINE
Target: above the fold of page X. Preserve identity and content. Capture the Baseline, formulate a hypothesis, and compare before/after blindly.
```

## Direct specialist invocation

Only do this when a Phase Packet and output schema already exist:

```text
Use chromarelay-inspector with .chromarelay/runs/<id>/phase-packets/<phase>.json
```

Never send an open-ended request directly to the Builder or Repairer.
