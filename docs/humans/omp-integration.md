# OMP / oh-my-pi integration

ChromaRelay uses OMP as its primary execution adapter. The core stays harness-independent.

## Subagents and `task.batch`

The Coordinator should use one batch for independent work, with minimal shared context and one specific task per agent.

```json
{
  "context": "# Goal\nGenerate independent Directions.\n# Constraints\nDo not see competing proposals.\n# Contract\nReturn the Direction schema.",
  "tasks": [
    {
      "name": "instrument-direction",
      "agent": "chromarelay-art-director",
      "task": "# Target\nDirection A\n# Change\nExplore the product as a precision instrument.\n# Acceptance\nOne coherent thesis, risks, and specimen.",
      "effort": "hi",
      "outputSchema": {},
      "schemaMode": "strict"
    }
  ]
}
```

Always provide an explicit `outputSchema` for important Handoffs. Agents start with no parent history; pass large payloads via files or local URIs, not one giant message.

Use `isolated: true` for Builder and Repairer. Isolated agents aren't revived after the workspace closes, so the Handoff must be complete.

## IRC and `hub`

Use `hub` to:

- clarify a constraint during a run;
- ask for missing Evidence;
- receive progress without injecting the whole transcript;
- coordinate job completion;
- revive a non-isolated agent when a small continuation is cheaper than a new dispatch.

Don't use IRC to build consensus between Art Directors during divergence. That would destroy independence. The Coordinator receives the proposals and controls the comparison.

`Alt+A` opens the Agent Hub for human supervision.

## Model roles

Agents reference aliases, not concrete IDs. Example for `~/.omp/agent/config.yml`:

```yaml
modelRoles:
  chromarelay_coordinator: "@slow"
  chromarelay_product: "@slow"
  chromarelay_research: "@task"
  chromarelay_art: "@designer"
  chromarelay_system: "@slow"
  chromarelay_builder: "@default"
  chromarelay_auditor: "@task"
  chromarelay_critic: "@slow"
  chromarelay_repair: "@default"
  chromarelay_advisor: "@slow"

task:
  maxConcurrency: 6
  maxRecursionDepth: 2
  enableEffort: true
```

Map creation and critique to different model families when the decision matters. Changing `modelRoles` changes routing without editing agents.

## Agents

Project agents live in `.omp/agents/*.md`. Project agents take precedence over user and bundled agents of the same name.

- The Coordinator may spawn specialists.
- Specialists don't get `task` and don't spawn other agents by default.
- Tool lists restrict Read Roles.
- `autoloadSkills` injects only the Role's primary Skill.

## Skills

Skills live in `.agents/skills/<name>/SKILL.md`, which OMP discovers as a capability. The system prompt gets only metadata; content is read on demand via `skill://<name>`.

The Coordinator uses the registry to select at most one primary Skill and two narrow references per Phase.

## Prompt templates

Templates in `.omp/prompts/` cover repetitive internal formats such as Direction proposal, audit handoff, and blind critique. They take arguments and must not replace the Run Contract.

## Slash commands

Commands in `.omp/commands/` are human entry points:

- `/chromarelay` starts and routes;
- `/chromarelay-resume` resumes the active Run;
- `/chromarelay-status` summarizes state without changing it;
- `/chromarelay-eval` creates an Eval Case.

They expand into Coordinator instructions; they don't duplicate state-machine logic.

## Protection hook

The ChromaRelay hook blocks raw writes to:

- `.chromarelay/system/`;
- `.chromarelay/project/`.

Normal Promotion uses the custom tool/CLI. The hook doesn't block product code or Run files.

The `CHROMARELAY_UNSAFE_CANONICAL_WRITE=1` variable exists only for deliberate manual recovery.

## Custom tool

The `chromarelay_state` custom tool offers deterministic status, event recording, path validation, and Promotion operations. It doesn't judge aesthetics and doesn't run critique.

Custom tools fit here because the model needs to call code with a schema and controlled effects. Skills stay static; hooks stay interceptors.

## Advisor

Enable the advisor on the Coordinator for system changes, high-risk redesigns, and decisions that reopen Locks. Don't enable it by default on every specialist: cost and correlated opinions can grow without improving output.

## Compaction and resumption

Preserve the Run Contract, Decision index, Artifact pointers, and current Phase Packet. Don't try to preserve all reasoning. Artifacts are the operational memory.
