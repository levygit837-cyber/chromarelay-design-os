import { randomUUID } from "node:crypto";
import type {
  DesignRequest,
  PhasePacket,
  RegistryBundle,
  RouteDecision,
  RunContract,
  RunStatusView,
  SpecialistHandoff,
  WorkflowId
} from "./domain.js";
import { ContractError, validateHandoff, validateRequest } from "./domain.js";
import type { Workspace } from "./workspace.js";
import { assertValidRegistry } from "./registry.js";

export interface StartRunOptions {
  now?: Date;
  runId?: string;
}

export interface AdvanceOptions {
  force?: boolean;
  skip?: boolean;
  outcome?: string;
}

export class DesignManager {
  constructor(
    private readonly workspace: Workspace,
    private readonly registry: RegistryBundle
  ) {
    assertValidRegistry(registry);
  }

  route(request: DesignRequest): RouteDecision {
    validateRequest(request);

    const rationale: string[] = [];
    const magnitude = request.changeMagnitude ?? (request.hasExistingDesign ? "localized" : "systemic");
    const level = this.decisionLevel(magnitude);

    if (request.explicitWorkflow) {
      this.assertExplicitWorkflowCompatible(request, request.explicitWorkflow);
      return { workflow: request.explicitWorkflow, decisionLevel: level, rationale: ["explicit compatible workflow requested"] };
    }

    if (request.explorationOnly) {
      return { workflow: "EXPLORE", decisionLevel: Math.max(level, 2) as 2 | 3, rationale: ["the requested outcome is a creative direction decision, not implementation"] };
    }

    if (request.hasExistingDesign) {
      if (!request.documentationTrusted) {
        const continuation: WorkflowId = request.existingQuality === "poor" || magnitude === "systemic" ? "REDESIGN" : "REFINE";
        return {
          workflow: "DOCUMENT",
          continuation,
          decisionLevel: Math.max(level, 2) as 2 | 3,
          rationale: ["an existing design is present", "operational documentation is missing or untrusted", `continue to ${continuation} after fidelity validation`]
        };
      }

      if (request.existingQuality === "poor" || magnitude === "systemic") {
        rationale.push("the existing design is documented", "the requested change or quality problem is systemic");
        return { workflow: "REDESIGN", decisionLevel: 3, rationale };
      }

      rationale.push("a trusted baseline exists", "the requested change is bounded");
      return { workflow: "REFINE", decisionLevel: level === 0 ? 0 : 1, rationale };
    }

    if (request.needsCreativeExploration) rationale.push("creative exploration is required inside creation");
    rationale.push("no existing design is authoritative");
    return { workflow: "CREATE", decisionLevel: Math.max(level, 2) as 2 | 3, rationale };
  }

  async start(request: DesignRequest, options: StartRunOptions = {}): Promise<RunContract> {
    const route = this.route(request);
    const workflow = this.registry.workflows[route.workflow];
    const now = options.now ?? new Date();
    const timestamp = now.toISOString();
    const runId = options.runId ?? this.makeRunId(route.workflow, now);
    const firstPhase = workflow.phases[0];
    if (!firstPhase) throw new ContractError(`Workflow ${route.workflow} has no phases`);

    const run: RunContract = {
      version: "1.0",
      runId,
      workflow: route.workflow,
      objective: request.objective.trim(),
      scope: {
        kind: request.scopeKind ?? "project",
        targets: request.targets?.length ? request.targets : ["project"],
        nonGoals: request.nonGoals ?? []
      },
      autonomy: request.autonomy ?? "guarded",
      status: "active",
      currentPhase: firstPhase.id,
      decisionLevel: route.decisionLevel,
      ...(request.surfaceClass ? { surfaceClass: request.surfaceClass } : {}),
      hardConstraints: request.hardConstraints ?? [],
      lockedDecisions: request.lockedDecisions ?? [],
      openDecisions: request.openDecisions ?? [],
      authority: {
        canonicalOwner: "coordinator",
        promotionRole: "memory-curator",
        creatorMayFinalCritique: false
      },
      skillBudget: { primary: 1, supporting: 2 },
      phaseHistory: [{ phase: firstPhase.id, enteredAt: timestamp }],
      artifactRefs: [],
      decisionRefs: [],
      blockers: [],
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const runRoot = this.runRoot(runId);
    await this.workspace.ensureDir(runRoot);
    await this.workspace.writeText(`${runRoot}/run.json`, this.json(run));
    await this.workspace.writeText(`${runRoot}/request.json`, this.json({ request, route }));
    await this.workspace.writeText(`${runRoot}/events.jsonl`, `${JSON.stringify({ at: timestamp, type: "run.started", workflow: route.workflow, phase: firstPhase.id })}\n`);
    await this.workspace.writeText(".createive/active-run.json", this.json({ runId, updatedAt: timestamp }));
    await this.phasePacket(runId);
    return run;
  }

  async getRun(runId?: string): Promise<RunContract> {
    const resolved = runId ?? await this.activeRunId();
    const run = JSON.parse(await this.workspace.readText(`${this.runRoot(resolved)}/run.json`)) as RunContract;
    this.validateRun(run);
    return run;
  }

  async status(runId?: string): Promise<RunStatusView> {
    const run = await this.getRun(runId);
    const phase = this.phaseDefinition(run);
    return {
      runId: run.runId,
      workflow: run.workflow,
      status: run.status,
      currentPhase: run.currentPhase,
      phasePurpose: phase.purpose,
      role: phase.role,
      requiredOutputs: phase.outputs,
      gates: phase.gates,
      blockers: run.blockers,
      openDecisions: run.openDecisions
    };
  }

  async phasePacket(runId?: string): Promise<PhasePacket> {
    const run = await this.getRun(runId);
    const phase = this.phaseDefinition(run);
    const role = this.registry.roles[phase.role];
    if (!role) throw new ContractError(`Unknown role ${phase.role}`);
    const kit = phase.kit ? this.registry.kits[phase.kit] : undefined;
    if (kit && !kit.roles.includes(role.id)) throw new ContractError(`Kit ${kit.id} is not allowed for role ${role.id}`);

    const packet: PhasePacket = {
      runId: run.runId,
      workflow: run.workflow,
      phase: phase.id,
      role: role.id,
      goal: phase.purpose,
      scope: run.scope.targets,
      inputs: phase.inputs,
      locks: run.lockedDecisions,
      openDecisions: run.openDecisions,
      authority: [role.purpose, ...role.mustNot.map(rule => `must not: ${rule}`)],
      skillKit: {
        primary: kit?.primary ?? null,
        supporting: kit?.supporting.slice(0, run.skillBudget.supporting) ?? []
      },
      outputSchema: "framework/schemas/handoff.schema.json",
      acceptance: [...phase.outputs.map(output => `produce: ${output}`), ...phase.gates.map(gate => `satisfy or report gate: ${gate}`)],
      exitPolicy: phase.exit,
      nonGoals: run.scope.nonGoals,
      omittedContext: this.defaultOmissions(phase.role),
      independenceControls: phase.contextControls ?? []
    };

    const packetPath = `${this.runRoot(run.runId)}/phase-packets/${phase.id}.json`;
    await this.workspace.writeText(packetPath, this.json(packet));
    return packet;
  }

  async recordHandoff(handoff: SpecialistHandoff): Promise<void> {
    validateHandoff(handoff);
    const run = await this.getRun(handoff.runId);
    if (run.status !== "active" && run.status !== "blocked") throw new ContractError(`Run ${run.runId} is not accepting Handoffs`);
    if (run.currentPhase !== handoff.phase) throw new ContractError(`Handoff phase ${handoff.phase} does not match active phase ${run.currentPhase}`);
    const phase = this.phaseDefinition(run);
    if (phase.role !== handoff.role) throw new ContractError(`Handoff role ${handoff.role} does not own phase ${phase.id}`);

    const handoffPath = `${this.runRoot(run.runId)}/handoffs/${handoff.phase}/${this.safeSegment(handoff.agentId)}.json`;
    await this.workspace.writeText(handoffPath, this.json(handoff));

    const artifactIds = new Set(run.artifactRefs.map(artifact => artifact.id));
    for (const artifact of handoff.artifacts) {
      if (!artifactIds.has(artifact.id)) {
        run.artifactRefs.push(artifact);
        artifactIds.add(artifact.id);
      }
    }
    const decisionIds = new Set(run.decisionRefs);
    for (const decision of handoff.decisions) {
      if (!decisionIds.has(decision.id)) {
        run.decisionRefs.push(decision.id);
        decisionIds.add(decision.id);
      }
      await this.workspace.writeText(`${this.runRoot(run.runId)}/decisions/${this.safeSegment(decision.id)}.json`, this.json(decision));
    }
    run.updatedAt = new Date().toISOString();
    await this.saveRun(run);
    await this.appendEvent(run.runId, { type: "handoff.recorded", phase: handoff.phase, role: handoff.role, agentId: handoff.agentId, transition: handoff.requestedTransition });
  }

  async advance(runId?: string, options: AdvanceOptions = {}): Promise<RunContract> {
    const run = await this.getRun(runId);
    if (run.status !== "active" && run.status !== "blocked") throw new ContractError(`Run ${run.runId} cannot advance from ${run.status}`);
    const workflow = this.registry.workflows[run.workflow];
    const currentIndex = workflow.phases.findIndex(phase => phase.id === run.currentPhase);
    if (currentIndex < 0) throw new ContractError(`Unknown current phase ${run.currentPhase}`);
    const phase = workflow.phases[currentIndex]!;

    if (!options.force && phase.role !== "coordinator") {
      const handoffDir = `${this.runRoot(run.runId)}/handoffs/${phase.id}`;
      const handoffs = await this.workspace.list(handoffDir);
      if (handoffs.length === 0 && !options.skip) throw new ContractError(`Phase ${phase.id} requires at least one persisted Handoff before advancing`);
    }
    if (options.skip && !phase.skipWhen && !options.force) throw new ContractError(`Phase ${phase.id} is not declared skippable`);

    const now = new Date().toISOString();
    const history = run.phaseHistory.findLast(entry => entry.phase === run.currentPhase && !entry.exitedAt);
    if (history) {
      history.exitedAt = now;
      history.outcome = options.outcome ?? (options.skip ? "skipped" : "advanced");
    }

    const next = workflow.phases[currentIndex + 1];
    if (!next) {
      run.status = "completed";
      run.updatedAt = now;
      await this.saveRun(run);
      await this.appendEvent(run.runId, { type: "run.completed", phase: phase.id });
      return run;
    }

    run.currentPhase = next.id;
    run.status = "active";
    run.phaseHistory.push({ phase: next.id, enteredAt: now });
    run.updatedAt = now;
    await this.saveRun(run);
    await this.appendEvent(run.runId, { type: "phase.advanced", from: phase.id, to: next.id });
    await this.phasePacket(run.runId);
    return run;
  }

  validateRun(run: RunContract): void {
    if (run.version !== "1.0") throw new ContractError("Run Contract version must be 1.0");
    if (run.authority.canonicalOwner !== "coordinator") throw new ContractError("Coordinator must own canonical state");
    if (run.authority.promotionRole !== "memory-curator") throw new ContractError("Memory Curator must own Promotion");
    if (run.authority.creatorMayFinalCritique !== false) throw new ContractError("Creator may not perform final critique");
    if (run.skillBudget.primary > 1 || run.skillBudget.supporting > 2) throw new ContractError("Run exceeds Skill budget");
    const workflow = this.registry.workflows[run.workflow];
    if (!workflow.phases.some(phase => phase.id === run.currentPhase)) throw new ContractError(`Run references unknown phase ${run.currentPhase}`);
  }

  private assertExplicitWorkflowCompatible(request: DesignRequest, workflow: WorkflowId): void {
    if (workflow === "CREATE" && request.hasExistingDesign && request.documentationTrusted) {
      throw new ContractError("CREATE is incompatible with an authoritative existing design; use REFINE, REDESIGN, or EXPLORE");
    }
    if ((workflow === "REFINE" || workflow === "REDESIGN" || workflow === "DOCUMENT") && !request.hasExistingDesign) {
      throw new ContractError(`${workflow} requires an existing design`);
    }
  }

  private decisionLevel(magnitude: NonNullable<DesignRequest["changeMagnitude"]>): 0 | 1 | 2 | 3 {
    return { trivial: 0, localized: 1, surface: 2, systemic: 3 }[magnitude] as 0 | 1 | 2 | 3;
  }

  private phaseDefinition(run: RunContract) {
    const phase = this.registry.workflows[run.workflow].phases.find(candidate => candidate.id === run.currentPhase);
    if (!phase) throw new ContractError(`Unknown phase ${run.currentPhase}`);
    return phase;
  }

  private defaultOmissions(role: string): string[] {
    const omissions = ["unrelated project documents", "unrelated Run history", "Skills outside the active kit"];
    if (role === "art-director") omissions.push("peer Direction candidates");
    if (role === "visual-critic") omissions.push("creator identity", "creator reasoning", "detector report before first verdict", "which candidate is new");
    if (role === "builder") omissions.push("rejected Directions");
    return omissions;
  }

  private makeRunId(workflow: WorkflowId, now: Date): string {
    const stamp = now.toISOString().replaceAll(/[-:.TZ]/g, "").slice(0, 14);
    return `${workflow.toLowerCase()}-${stamp}-${randomUUID().slice(0, 8)}`;
  }

  private runRoot(runId: string): string {
    return `.createive/runs/${this.safeSegment(runId)}`;
  }

  private safeSegment(value: string): string {
    const safe = value.replaceAll(/[^a-zA-Z0-9._-]/g, "-");
    if (!safe || safe === "." || safe === "..") throw new ContractError(`Unsafe path segment: ${value}`);
    return safe;
  }

  private async activeRunId(): Promise<string> {
    const active = JSON.parse(await this.workspace.readText(".createive/active-run.json")) as { runId?: string };
    if (!active.runId) throw new ContractError("No active Createive Run");
    return active.runId;
  }

  private async saveRun(run: RunContract): Promise<void> {
    this.validateRun(run);
    await this.workspace.writeText(`${this.runRoot(run.runId)}/run.json`, this.json(run));
    await this.workspace.writeText(".createive/active-run.json", this.json({ runId: run.runId, updatedAt: run.updatedAt }));
  }

  private async appendEvent(runId: string, event: Record<string, unknown>): Promise<void> {
    await this.workspace.appendText(`${this.runRoot(runId)}/events.jsonl`, `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`);
  }

  private json(value: unknown): string {
    return `${JSON.stringify(value, null, 2)}\n`;
  }
}
