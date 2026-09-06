import { randomUUID } from "node:crypto";
import path from "node:path";
import type {
  ArtifactRef,
  DecisionRecord,
  DesignRequest,
  GateResult,
  PhaseInput,
  PhasePacket,
  RegistryBundle,
  RequestedTransition,
  ResolvedInput,
  RouteDecision,
  RunAudit,
  RunContract,
  RunFinding,
  RunStatusView,
  SpecialistHandoff,
  WorkflowDefinition,
  WorkflowId,
  WorkflowPhaseDefinition
} from "./domain.js";
import { ContractError, REQUESTED_TRANSITIONS, isGateResultValid, validateGateResult, validateHandoff, validateRequest } from "./domain.js";
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
  /**
   * Why the phase is being forced. Required only when `force` actually bypasses a declared Gate, so
   * every existing `--force` call that bypasses nothing keeps working unchanged; a force that skips
   * a real check has to say so. Landing in `PhaseHistoryEntry.reason` alongside the computed
   * `bypassedGates` is what makes the bypass readable months later.
   */
  reason?: string;
  /**
   * The transition the Coordinator chooses to effect, overriding what the phase's Handoffs requested.
   * Absent, `advance()` honours the gravest request on record. Supplying it is how the Coordinator
   * keeps its authority over routing while leaving the divergence — requested against effected —
   * legible in the event log.
   */
  transition?: RequestedTransition;
}

export interface ApproveOptions {
  /** "<phase>/<agentId>" naming a Handoff already persisted in this Run. */
  attestation: string;
  /** Decision ids from run.decisionRefs. */
  decisions?: string[];
  /** Artifact ids from run.artifactRefs. */
  artifacts?: string[];
  /** Approve as "locked" instead of "approved"; locked project/system Decisions join run.lockedDecisions. */
  lock?: boolean;
  now?: Date;
}

export interface ApprovalResult {
  runId: string;
  approvedBy: string;
  approvedAt: string;
  status: "approved" | "locked";
  decisions: string[];
  artifacts: string[];
}

/**
 * Typed Run Artifact layout (issue #18). Every ArtifactRef.path a Handoff records lives under its
 * Run root in one of these folders, so specimens, buildable code, Direction records, and audit
 * Evidence stay browsable per Run and consistent across parallel evaluation Runs:
 *
 * - `specimens/`: HTML Direction references for judgment. Visual reference only, never the source
 *   of truth for the final build;
 * - `prototype/`: the bootable React + TypeScript app of the Run. The boot rule itself (README plus
 *   install and the documented dev command, proven by builder smoke Evidence) is owned by the
 *   evaluation orchestration contract; this layout only reserves the folder;
 * - `directions/`: generated creative theses and their selection records;
 * - `context/`: briefs, maps, drafts, plans, and state contracts a phase consumes;
 * - `audit/`: Gate Evidence, critic reports, captures, and validation output.
 *
 * Authority order still holds: explicit user requirements, product and constraint contracts, and
 * accepted Locks outrank this layout, which outranks Skill guidance (ADR-0005). Runs never write
 * outside their Run folder; only the Coordinator promotes to canonical state (ADR-0003).
 */
export const ARTIFACT_LAYOUT_DIRS = ["specimens", "prototype", "directions", "context", "audit"] as const;
export type ArtifactLayoutDir = (typeof ARTIFACT_LAYOUT_DIRS)[number];
/**
 * Kind-to-folder registry for the typed layout. Keys match after trim plus lowercase, so workflow
 * spellings ("Product Brief", "AS_IS_PRODUCT") resolve verbatim. recordHandoff enforces only the
 * layout prefix, not the kind match; this registry tells producers and the one migration where a
 * kind belongs. Unlisted kinds fall back to `context/`, the generic input/document folder.
 */
export const ARTIFACT_KIND_TO_DIR: Record<string, ArtifactLayoutDir> = {
  "visual specimens": "specimens",
  "renderable surface": "prototype",
  "implementation patch": "prototype",
  "patch": "prototype",
  "repair patch": "prototype",
  "pilot patch": "prototype",
  "expand-contract slices": "prototype",
  "surface": "prototype",
  "implementation notes": "prototype",
  "direction candidates": "directions",
  "direction archive": "directions",
  "selected direction": "directions",
  "selected direction or escalation": "directions",
  "selected and reserve directions": "directions",
  "selected direction record": "directions",
  "eligible candidates": "directions",
  "lens assignments": "directions",
  "exploration axes": "directions",
  "creative question": "directions",
  "creative opportunities": "directions",
  "anti-default ledger": "directions",
  "focused options": "directions",
  "refinement hypothesis": "directions",
  "product brief": "context",
  "constraint draft": "context",
  "domain map": "context",
  "design draft": "context",
  "current design draft": "context",
  "v2 design draft": "context",
  "token drafts": "context",
  "v2 tokens": "context",
  "canonical token proposal": "context",
  "surface brief": "context",
  "component plan": "context",
  "component state contracts": "context",
  "information architecture": "context",
  "responsive model": "context",
  "state matrix": "context",
  "product truths": "context",
  "behavior contracts": "context",
  "preserve/replace matrix": "context",
  "redesign charter": "context",
  "baseline manifest": "context",
  "token inventory": "context",
  "component inventory": "context",
  "route map": "context",
  "surface inventory": "context",
  "state inventory": "context",
  "as_is_product": "context",
  "as_is_design": "context",
  "opportunity map": "context",
  "workflow recommendation": "context",
  "migration plan": "context",
  "migration manifest": "context",
  "promotion manifest": "context",
  "promotion or revert manifest": "context",
  "dependency graph": "context",
  "bounded target": "context",
  "baseline": "context",
  "context captures": "context",
  "reference pack": "context",
  "decision records": "context",
  "exceptions": "context",
  "canonical artifacts": "context",
  "canonical current-state artifacts": "context",
  "canonical v2": "context",
  "v2 component principles": "context",
  "run contract": "context",
  "audit report": "audit",
  "visual review": "audit",
  "comparison report": "audit",
  "baseline comparison": "audit",
  "fidelity report": "audit",
  "drift report": "audit",
  "tournament report": "audit",
  "eligibility report": "audit",
  "diagnosis": "audit",
  "screenshots": "audit",
  "screenshot set": "audit",
  "candidate renders": "audit",
  "pilot renders": "audit",
  "state captures": "audit",
  "render evidence": "audit",
  "source evidence": "audit",
  "baseline evidence": "audit",
  "before/after evidence": "audit",
  "regression evidence": "audit",
  "risk notes": "audit",
  "confidence ledger": "audit",
  "priority findings": "audit",
  "problem evidence": "audit",
  "unmodeled findings": "audit",
  "scale or return recommendation": "audit",
  "comparison": "audit",
  "detector report": "audit"
};
/** One flat-to-typed move performed by migrateArtifactsToTypedLayout. Content at `to` is untouched. */
export interface ArtifactMigration {
  id: string;
  kind: string;
  from: string;
  to: string;
  dir: ArtifactLayoutDir;
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
    for (const dir of ARTIFACT_LAYOUT_DIRS) await this.workspace.ensureDir(`${runRoot}/${dir}`);
    await this.workspace.ensureDir(".chromarelay/project");
    await this.workspace.writeText(`${runRoot}/run.json`, this.json(run));
    await this.workspace.writeText(`${runRoot}/request.json`, this.json({ request, route }));
    await this.workspace.writeText(`${runRoot}/events.jsonl`, `${JSON.stringify({ at: timestamp, type: "run.started", workflow: route.workflow, phase: firstPhase.id })}\n`);
    await this.workspace.writeText(".chromarelay/active-run.json", this.json({ runId, updatedAt: timestamp }));
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

    const { inputs, unresolvedInputs } = await this.resolveInputs(run, phase);

    const packet: PhasePacket = {
      runId: run.runId,
      workflow: run.workflow,
      phase: phase.id,
      role: role.id,
      goal: phase.purpose,
      scope: run.scope.targets,
      inputs,
      unresolvedInputs,
      locks: run.lockedDecisions,
      openDecisions: run.openDecisions,
      rubric: `rubrics/${(run.surfaceClass ?? "COMMON").toLowerCase()}.json`,
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

  /**
   * Turns each input a phase declares into an address the specialist can open. Absence is handled by
   * class, not as one binary: a required Artifact from an earlier phase that never appeared means that
   * phase did not meet its contract, and emitting the Packet anyway would invite the specialist to
   * invent — the most expensive failure mode the system has, because it produces plausible work on a
   * foundation that does not exist. A missing canonical contract is the normal state of a new project
   * (`DESIGN.md` is an output of canonization, not an input), so it is reported, not refused.
   */
  private async resolveInputs(run: RunContract, phase: WorkflowPhaseDefinition): Promise<{ inputs: ResolvedInput[]; unresolvedInputs: string[] }> {
    const inputs: ResolvedInput[] = [];
    const unresolvedInputs: string[] = [];
    for (const declared of phase.inputs) {
      const resolved = await this.resolveInput(run, phase, declared);
      inputs.push(resolved);
      if (resolved.status === "absent-optional" || resolved.status === "absent-canonical") unresolvedInputs.push(resolved.name);
    }
    return { inputs, unresolvedInputs };
  }

  private async resolveInput(run: RunContract, phase: WorkflowPhaseDefinition, declared: PhaseInput): Promise<ResolvedInput> {
    if (declared.source === "artifact") {
      // artifactRefs is append-only and ordered by insertion, so the last match of a kind is the
      // most recent one. No disk check: the path comes from an ArtifactRef another agent persisted,
      // which makes this a question about Run state rather than about I/O.
      const latest = run.artifactRefs.filter(artifact => artifact.kind === declared.kind).at(-1);
      if (!latest) {
        if (declared.required === false) return { name: declared.name, path: null, status: "absent-optional" };
        throw new ContractError(
          `Phase ${phase.id} requires input "${declared.name}" of kind ${declared.kind ?? "<unnamed>"}, ` +
          `which no earlier phase of Run ${run.runId} produced`
        );
      }
      return {
        name: declared.name,
        path: latest.path,
        status: "resolved",
        ...(latest.contentHash ? { contentHash: latest.contentHash } : {})
      };
    }

    if (!declared.path) {
      throw new ContractError(`Phase ${phase.id} declares input "${declared.name}" from ${declared.source} with no path`);
    }
    const root = declared.source === "canonical"
      ? ".chromarelay/project"
      : declared.source === "framework"
        ? ".chromarelay/system"
        : this.runRoot(run.runId);
    const path = `${root}/${declared.path}`;
    // Checking the file means `status` is an observation rather than an unverified assertion; the
    // cost is a handful of stats per Packet.
    if (declared.source === "canonical" && !(await this.workspace.exists(path))) {
      return { name: declared.name, path, status: "absent-canonical" };
    }
    return { name: declared.name, path, status: declared.source };
  }

  async recordHandoff(handoff: SpecialistHandoff): Promise<void> {
    // Schema first: `validateHandoff` iterates handoff.artifacts, and a document arriving from the
    // CLI is cast, not parsed, so a non-array there would surface as a raw TypeError.
    this.registry.handoffValidator(handoff);
    validateHandoff(handoff);
    const run = await this.getRun(handoff.runId);
    if (run.status !== "active" && run.status !== "blocked") throw new ContractError(`Run ${run.runId} is not accepting Handoffs`);
    if (run.currentPhase !== handoff.phase) throw new ContractError(`Handoff phase ${handoff.phase} does not match active phase ${run.currentPhase}`);
    const phase = this.phaseDefinition(run);
    if (phase.role !== handoff.role) throw new ContractError(`Handoff role ${handoff.role} does not own phase ${phase.id}`);
    this.assertGatesAddressed(phase, handoff);

    // approvedBy must name an agent that actually attested in this Run, not any string the author chose.
    for (const decision of handoff.decisions) {
      if (decision.status !== "approved" && decision.status !== "locked") continue;
      if (!(await this.hasAttested(run, decision.approvedBy, handoff.phase))) {
        throw new ContractError(`Decision ${decision.id} names approvedBy ${decision.approvedBy}, which has no persisted Handoff in Run ${run.runId}`);
      }
    }
    // Typed layout (issue #18): every recorded Artifact path lives under this Run's root in one of
    // the five layout folders, mirroring resolveEvidence's within-root check. Prefix here, file
    // existence below: a layout-conformant path that points at nothing is still a dangling ref.
    for (const artifact of handoff.artifacts) {
      if (!this.isArtifactLayoutPath(run.runId, artifact.path)) {
        throw new ContractError(
          `Artifact ${artifact.id} path "${artifact.path}" is outside the typed layout of Run ${run.runId}; ` +
          `record it under ${this.runRoot(run.runId)}/<${ARTIFACT_LAYOUT_DIRS.join("|")}>/...`
        );
      }
    }
    // An approved Artifact status must already be recorded by approve(), not asserted in a Handoff.
    for (const artifact of handoff.artifacts) {
      if (artifact.status !== "approved" && artifact.status !== "locked") continue;
      const recorded = run.artifactRefs.find(entry => entry.id === artifact.id);
      if (recorded?.status !== artifact.status) {
        throw new ContractError(`Artifact ${artifact.id} claims ${artifact.status} but Run ${run.runId} records ${recorded?.status ?? "no such Artifact"}`);
      }
    }
    // Every referenced path resolves to an existing file, exactly like Gate evidence: relative to
    // the Run root first (where specialists write), then to the workspace root for absolute-style
    // refs (`.chromarelay/runs/<id>/...`). Missing files are rejections, not warnings.
    for (const artifact of handoff.artifacts) {
      if (!(await this.resolveEvidence(run.runId, this.workspaceRelative(run.runId, artifact.path)))) {
        throw new ContractError(`Artifact ${artifact.id} path "${artifact.path}" does not exist in Run ${run.runId}`);
      }
    }
    // Stored canonical (workspace-style under the Run root) so resolveInput always emits an
    // addressable path however the producer wrote it. Normalization only, never a content change.
    for (const artifact of handoff.artifacts) {
      artifact.path = this.canonicalArtifactPath(run.runId, artifact.path);
    }

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
  /**
   * One migration placing pre-existing flat Artifacts into the matching typed folder. Copies file
   * bytes to the typed destination and rewrites run.json paths only; content is never rewritten and
   * the pre-existing flat file stays in place as inert history (the Workspace seam has no delete
   * primitive; run.json no longer references it). A flat path is any recorded Artifact path under
   * the Run root outside the five layout folders (legacy `artifacts/PRODUCT.md`,
   * `evidence/desktop.png`, `reports/grounding.json`). The destination folder comes from
   * ARTIFACT_KIND_TO_DIR; the file name is preserved. Persisted Handoff documents keep their
   * original paths as history; resolveInput matches by kind against run.artifactRefs, so Packets
   * resolve to the migrated path automatically.
   */
  async migrateArtifactsToTypedLayout(runId: string): Promise<ArtifactMigration[]> {
    const run = await this.getRun(runId);
    const moved: ArtifactMigration[] = [];
    for (const artifact of run.artifactRefs) {
      const relative = this.workspaceRelative(run.runId, artifact.path);
      if (this.isArtifactLayoutPath(run.runId, artifact.path)) continue;
      const fileName = relative.split("/").pop() ?? artifact.id;
      const dir = ARTIFACT_KIND_TO_DIR[artifact.kind.trim().toLowerCase()] ?? "context";
      const to = `${this.runRoot(run.runId)}/${dir}/${this.safeSegment(fileName)}`;
      const from = this.workspacePath(run.runId, relative);
      if (!(await this.workspace.exists(from))) {
        throw new ContractError(`Artifact ${artifact.id} path "${artifact.path}" does not exist in Run ${run.runId}`);
      }
      if (await this.workspace.exists(to)) {
        throw new ContractError(`Artifact ${artifact.id} cannot migrate to "${to}": destination already exists`);
      }
      await this.workspace.writeText(to, await this.workspace.readText(from));
      artifact.path = to;
      moved.push({ id: artifact.id, kind: artifact.kind, from, to, dir });
    }
    run.updatedAt = new Date().toISOString();
    await this.saveRun(run);
    if (moved.length > 0) {
      await this.appendEvent(run.runId, { type: "artifacts.migrated", migrations: moved.map(entry => ({ id: entry.id, from: entry.from, to: entry.to })) });
    }
    return moved;
  }

  /**
   * Records one evaluated Gate against the Phase that declared it. The verdict is written under the
   * Run at `gate-results/<phase>/<gate>.json`, one file per Gate per Phase, so re-recording is the
   * Refresh path: a fresh verdict overwrites a stale one and no second mechanism is needed. The
   * `return` transition a specialist may request in a Handoff is the Deprecate path — the same
   * machinery, driving the Run back to the phase whose result no longer holds.
   *
   * Read `GateResult` in `domain.ts` for what this ledger does and does not prove. In short: it
   * proves what was claimed, by whom, against which existing files. It does not prove the Gate ran.
   */
  async recordGateResult(result: GateResult): Promise<void> {
    validateGateResult(result);
    if (!this.registry.gates.has(result.gate)) throw new ContractError(`Unknown gate ${result.gate}`);

    const run = await this.getRun(result.runId);
    if (run.status !== "active" && run.status !== "blocked") throw new ContractError(`Run ${run.runId} is not accepting Gate results`);
    const phase = this.registry.workflows[run.workflow].phases.find(candidate => candidate.id === result.phase);
    if (!phase) throw new ContractError(`Run ${run.runId} has no phase ${result.phase}`);
    if (!phase.gates.includes(result.gate)) {
      throw new ContractError(`Phase ${result.phase} does not declare gate ${result.gate}; it declares [${phase.gates.join(", ")}]`);
    }

    // The teeth of the ledger. Without this, `evidenceRefs: ["I ran axe, honest"]` passes and the
    // structure records a sentence instead of a trail. Checked here rather than in
    // `validateGateResult` so that function stays pure and sync, matching `validateHandoff`.
    for (const reference of result.evidenceRefs) {
      if (!(await this.resolveEvidence(run.runId, reference))) {
        throw new ContractError(`Gate ${result.gate} names evidence "${reference}", which does not exist in Run ${run.runId}`);
      }
    }

    await this.workspace.writeText(this.gateResultPath(run.runId, result.phase, result.gate), this.json(result));

    if (result.status === "waived") {
      // A waiver is deliberately noisy: it advances the Run and leaves a blocker behind, so the
      // exception travels with the Run instead of disappearing into a file nobody opens.
      run.blockers = [...new Set([...run.blockers, this.waivedBlocker(result)])];
      run.updatedAt = new Date().toISOString();
      await this.saveRun(run);
      await this.appendEvent(run.runId, {
        type: "gate.waived",
        phase: result.phase,
        gate: result.gate,
        scope: result.waiver.scope,
        reason: result.waiver.reason,
        recordedBy: result.recordedBy,
        approvedBy: result.waiver.approvedBy,
        revisitWhen: result.waiver.revisitWhen,
        ...(result.validUntil ? { validUntil: result.validUntil } : {})
      });
      return;
    }

    await this.appendEvent(run.runId, {
      type: "gate.recorded",
      phase: result.phase,
      gate: result.gate,
      status: result.status,
      recordedBy: result.recordedBy,
      evidenceRefs: result.evidenceRefs,
      ...(result.validUntil ? { validUntil: result.validUntil } : {})
    });
  }

  /** Every Gate a phase declares that has no valid recorded verdict, with why it does not count. */
  private async missingGates(runId: string, phase: WorkflowPhaseDefinition, at: Date): Promise<string[]> {
    const missing: string[] = [];
    for (const gate of phase.gates) {
      const recorded = await this.readGateResult(runId, phase.id, gate);
      if (!recorded) {
        missing.push(`Phase ${phase.id} declares gate ${gate} with no recorded result`);
        continue;
      }
      if (!isGateResultValid(recorded, at)) {
        missing.push(`Phase ${phase.id} declares gate ${gate} whose recorded result expired at ${recorded.validUntil}`);
        continue;
      }
      if (recorded.status === "fail") {
        missing.push(`Phase ${phase.id} declares gate ${gate} whose recorded result is fail`);
      }
    }
    return missing;
  }

  /**
   * How much a transition withholds forward motion. A phase may be worked by several specialists at
   * once — `parallelism` says so on nineteen of the framework's phases — so the phase produces a set
   * of requests, not one. Taking the gravest is the only reading that keeps a dissent meaningful:
   * two critics who pass and one who returns is a phase that did not clear, and honouring the
   * majority would let the Run outvote its own evidence.
   */
  private static readonly TRANSITION_GRAVITY: readonly RequestedTransition[] = REQUESTED_TRANSITIONS;

  /**
   * The gravest transition any Handoff of this phase requested, and the target it named. `advance`
   * when the phase has no readable Handoff, which is the case for Coordinator phases and for a
   * `--force` past a phase that produced nothing.
   */
  private async requestedTransitionOf(runId: string, phaseId: string): Promise<{ transition: RequestedTransition; target?: string }> {
    const handoffDir = `${this.runRoot(runId)}/handoffs/${this.safeSegment(phaseId)}`;
    let gravest: RequestedTransition = "advance";
    let target: string | undefined;
    for (const fileName of await this.workspace.list(handoffDir)) {
      let parsed: Partial<SpecialistHandoff>;
      try {
        parsed = JSON.parse(await this.workspace.readText(`${handoffDir}/${fileName}`)) as Partial<SpecialistHandoff>;
      } catch {
        continue;
      }
      const requested = parsed.requestedTransition;
      if (!requested || !DesignManager.TRANSITION_GRAVITY.includes(requested)) continue;
      if (DesignManager.TRANSITION_GRAVITY.indexOf(requested) <= DesignManager.TRANSITION_GRAVITY.indexOf(gravest)) continue;
      gravest = requested;
      target = parsed.requestedTarget;
    }
    return { transition: gravest, ...(target ? { target } : {}) };
  }

  /**
   * Where a `return` may land. Forward is not a return, and a phase absent from this Workflow is not
   * a phase at all; both fail by naming the target, because a silent fallback to `advance` would
   * turn a specialist's rejection into the Run's approval.
   */
  private returnIndex(workflow: WorkflowDefinition, currentIndex: number, target: string | undefined): number {
    if (!target?.trim()) {
      throw new ContractError(
        `Phase ${workflow.phases[currentIndex]!.id} requested return without naming requestedTarget; ` +
        `a return with no target is not a route`
      );
    }
    const targetIndex = workflow.phases.findIndex(candidate => candidate.id === target);
    if (targetIndex < 0) {
      throw new ContractError(`Requested return target ${target} is not a phase of Workflow ${workflow.id}`);
    }
    if (targetIndex >= currentIndex) {
      throw new ContractError(
        `Requested return target ${target} is not behind phase ${workflow.phases[currentIndex]!.id} in Workflow ${workflow.id}; ` +
        `a return goes back`
      );
    }
    return targetIndex;
  }

  async advance(runId?: string, options: AdvanceOptions = {}): Promise<RunContract> {
    const run = await this.getRun(runId);
    if (run.status !== "active" && run.status !== "blocked") throw new ContractError(`Run ${run.runId} cannot advance from ${run.status}`);
    const workflow = this.registry.workflows[run.workflow];
    const currentIndex = workflow.phases.findIndex(phase => phase.id === run.currentPhase);
    if (currentIndex < 0) throw new ContractError(`Unknown current phase ${run.currentPhase}`);
    const phase = workflow.phases[currentIndex]!;

    const phaseAudit = await this.phaseFindings(run.runId, phase.id);
    if (!options.force && phase.role !== "coordinator") {
      if (phaseAudit.fileCount === 0 && !options.skip) throw new ContractError(`Phase ${phase.id} requires at least one persisted Handoff before advancing`);
    }
    if (options.skip && !phase.skipWhen && !options.force) throw new ContractError(`Phase ${phase.id} is not declared skippable`);

    // What the phase's Handoffs asked for, against what the Coordinator chose to do. Resolved before
    // the Gate ledger because `return`, `escalate`, and `stop` claim no forward motion: a phase whose
    // Gates failed is precisely the phase that needs to route backwards or park, and demanding the
    // Gates pass first would make the escape hatch reachable only from states that do not need it.
    const requested = await this.requestedTransitionOf(run.runId, phase.id);
    const effected = options.transition ?? requested.transition;
    if (effected !== "advance" && effected !== "branch") {
      return await this.effectNonForward(run, workflow, currentIndex, phaseAudit.findings, requested, effected);
    }

    const startedAt = new Date();
    // A skipped phase never ran, so it has no Gates to answer for; a forced one has to name what it
    // is walking past. Everything else must show a valid verdict per declared Gate.
    const missing = options.skip ? [] : await this.missingGates(run.runId, phase, startedAt);
    const bypassedGates = this.gateIdsOf(missing, phase);
    if (missing.length > 0 && !options.force) {
      throw new ContractError(missing.join("\n"));
    }
    if (missing.length > 0 && !options.reason?.trim()) {
      throw new ContractError(
        `Forcing past gate${bypassedGates.length === 1 ? "" : "s"} ${bypassedGates.join(", ")} requires --reason; ` +
        `a bypass the Run cannot explain is indistinguishable from a bypass that never happened`
      );
    }

    run.blockers = this.mergeBlockers(run.blockers, phaseAudit.findings);
    if (bypassedGates.length > 0) {
      run.blockers = [...new Set([...run.blockers, ...bypassedGates.map(gate => `forced[${phase.id}]: bypassed gate ${gate}`)])];
    }

    const now = startedAt.toISOString();
    const history = run.phaseHistory.findLast(entry => entry.phase === run.currentPhase && !entry.exitedAt);
    if (history) {
      history.exitedAt = now;
      // `forced-past-gates` exists so a reader can tell a bypass from a clean exit without
      // reconstructing it from the Gate files; plain `--force` past nothing stays "advanced".
      history.outcome = options.outcome ?? (options.skip ? "skipped" : bypassedGates.length > 0 ? "forced-past-gates" : "advanced");
      if (bypassedGates.length > 0) {
        history.bypassedGates = bypassedGates;
        history.reason = options.reason!.trim();
      }
    }
    if (bypassedGates.length > 0) {
      await this.appendEvent(run.runId, { type: "phase.forced", phase: phase.id, bypassedGates, reason: options.reason!.trim() });
    }

    const next = workflow.phases[currentIndex + 1];
    if (!next) {
      run.status = "completed";
      run.updatedAt = now;
      await this.saveRun(run);
      await this.appendEvent(run.runId, { type: "run.completed", phase: phase.id, requested: requested.transition, effected: "advance" });
      return run;
    }

    // Resolve the next phase's inputs before persisting the transition. phasePacket() refuses a phase
    // whose required Artifact inputs are missing, and advancing first would leave the Run parked in a
    // phase whose Packet cannot compile — every active phase must have a compilable Packet.
    await this.resolveInputs(run, next);

    run.currentPhase = next.id;
    run.status = "active";
    run.phaseHistory.push({ phase: next.id, enteredAt: now });
    run.updatedAt = now;
    await this.saveRun(run);
    await this.appendEvent(run.runId, {
      type: "phase.advanced",
      from: phase.id,
      to: next.id,
      requested: requested.transition,
      effected: "advance"
    });
    await this.phasePacket(run.runId);
    return run;
  }

  /**
   * The three transitions that do not move the Run forward. Kept out of `advance()`'s body because it
   * shares nothing with the forward path past the phase index: no next-phase Packet, no Gate ledger,
   * and in two of the three cases no phase change at all.
   *
   * `escalate` and `stop` leave `currentPhase` where it is deliberately. The phase is what a human
   * resumes into or a reader inspects afterwards, and moving it would erase where the Run gave up.
   */
  private async effectNonForward(
    run: RunContract,
    workflow: WorkflowDefinition,
    currentIndex: number,
    findings: RunFinding[],
    requested: { transition: RequestedTransition; target?: string },
    effected: RequestedTransition
  ): Promise<RunContract> {
    const phase = workflow.phases[currentIndex]!;
    // `return` validates its target before anything is written, so a bad target leaves the Run in the
    // state it was in rather than half-transitioned.
    const targetIndex = effected === "return" ? this.returnIndex(workflow, currentIndex, requested.target) : -1;

    run.blockers = this.mergeBlockers(run.blockers, findings);
    const now = new Date().toISOString();
    const history = run.phaseHistory.findLast(entry => entry.phase === run.currentPhase && !entry.exitedAt);
    if (history) {
      history.exitedAt = now;
      history.outcome = effected;
    }

    if (effected === "return") {
      const target = workflow.phases[targetIndex]!;
      run.currentPhase = target.id;
      run.status = "active";
      run.phaseHistory.push({ phase: target.id, enteredAt: now });
      run.updatedAt = now;
      await this.saveRun(run);
      await this.appendEvent(run.runId, {
        type: "phase.returned",
        from: phase.id,
        to: target.id,
        requested: requested.transition,
        effected,
        // How many times this phase has been entered beyond the first. The Repair budget is stated in
        // cycles ("two repair cycles is the normal ceiling"), and phaseHistory already records every
        // entry, so the count is derived rather than tracked in a field that could disagree with it.
        repairCycle: run.phaseHistory.filter(entry => entry.phase === target.id).length - 1
      });
      await this.phasePacket(run.runId);
      return run;
    }

    run.status = effected === "escalate" ? "awaiting-human" : "cancelled";
    run.updatedAt = now;
    await this.saveRun(run);
    await this.appendEvent(run.runId, {
      type: effected === "escalate" ? "run.escalated" : "run.stopped",
      phase: phase.id,
      requested: requested.transition,
      effected
    });
    return run;
  }

  /**
   * Transitions Decisions and Artifacts from `proposed` to `approved` or `locked`. A Coordinator act:
   * it draws its authority from an attestation, a Handoff another agent already persisted in a completed
   * phase, so no single agent can both produce a thing and approve it.
   */
  async approve(runId: string | undefined, options: ApproveOptions): Promise<ApprovalResult> {
    const run = await this.getRun(runId);
    if (run.status !== "active" && run.status !== "blocked") throw new ContractError(`Run ${run.runId} is not accepting approvals from ${run.status}`);

    const decisionIds = options.decisions ?? [];
    const artifactIds = options.artifacts ?? [];
    if (decisionIds.length === 0 && artifactIds.length === 0) throw new ContractError("approve requires at least one Decision or Artifact target");

    const separator = options.attestation.indexOf("/");
    if (separator <= 0 || separator === options.attestation.length - 1) {
      throw new ContractError(`Attestation ${options.attestation} must be "<phase>/<agentId>"`);
    }
    const attestingPhase = options.attestation.slice(0, separator);
    const attestingAgentId = options.attestation.slice(separator + 1);

    if (attestingPhase === run.currentPhase) {
      throw new ContractError(`Attestation phase ${attestingPhase} is the phase in flight; approval draws on completed work`);
    }
    if (!run.phaseHistory.some(entry => entry.phase === attestingPhase && entry.exitedAt)) {
      throw new ContractError(`Attestation phase ${attestingPhase} has not completed in Run ${run.runId}`);
    }

    const attestation = await this.readHandoff(run.runId, attestingPhase, attestingAgentId);
    if (!attestation) throw new ContractError(`Attestation ${options.attestation} has no persisted Handoff in Run ${run.runId}`);
    if (attestation.agentId !== attestingAgentId) {
      throw new ContractError(`Attestation ${options.attestation} names ${attestingAgentId} but the persisted Handoff reports ${attestation.agentId}`);
    }

    const status: "approved" | "locked" = options.lock ? "locked" : "approved";
    const approvedAt = (options.now ?? new Date()).toISOString();

    const decisions: DecisionRecord[] = [];
    for (const id of decisionIds) {
      if (!run.decisionRefs.includes(id)) throw new ContractError(`Run ${run.runId} records no Decision ${id}`);
      const producer = await this.decisionProducer(run.runId, id);
      if (!producer) throw new ContractError(`Decision ${id} has no producing Handoff in Run ${run.runId} and cannot be approved`);
      if (producer === attestingAgentId) throw new ContractError(`Decision ${id} was produced by ${producer} and cannot be approved by the same agent`);
      const decision = JSON.parse(await this.workspace.readText(this.decisionPath(run.runId, id))) as DecisionRecord;
      decisions.push({ ...decision, status, approvedBy: attestingAgentId, approvedAt } as DecisionRecord);
    }

    const artifacts: ArtifactRef[] = [];
    for (const id of artifactIds) {
      const recorded = run.artifactRefs.find(entry => entry.id === id);
      if (!recorded) throw new ContractError(`Run ${run.runId} records no Artifact ${id}`);
      const producer = recorded.agentId ?? await this.phaseAgentId(run.runId, recorded.phase);
      if (!producer) throw new ContractError(`Artifact ${id} has no traceable producer in Run ${run.runId} and cannot be approved`);
      if (producer === attestingAgentId) throw new ContractError(`Artifact ${id} was produced by ${producer} and cannot be approved by the same agent`);
      artifacts.push(recorded);
    }

    for (const decision of decisions) {
      await this.workspace.writeText(this.decisionPath(run.runId, decision.id), this.json(decision));
      if (status === "locked" && decision.scope !== "run" && !run.lockedDecisions.includes(decision.id)) {
        run.lockedDecisions.push(decision.id);
      }
    }
    for (const artifact of artifacts) artifact.status = status;

    run.updatedAt = approvedAt;
    await this.saveRun(run);
    for (const decision of decisions) {
      await this.appendEvent(run.runId, { type: "decision.approved", id: decision.id, status, approvedBy: attestingAgentId, approvedAt, attestation: options.attestation });
    }
    for (const artifact of artifacts) {
      await this.appendEvent(run.runId, { type: "artifact.approved", id: artifact.id, status, approvedBy: attestingAgentId, approvedAt, attestation: options.attestation });
    }
    // Rewrite the Packet of the phase in flight so it sees the fresh locks rather than advance()'s copy.
    await this.phasePacket(run.runId);

    return {
      runId: run.runId,
      approvedBy: attestingAgentId,
      approvedAt,
      status,
      decisions: decisions.map(decision => decision.id),
      artifacts: artifacts.map(artifact => artifact.id)
    };
  }

  /** Reads every persisted Handoff of a Run and reports the findings its specialists declared. Read-only. */
  async auditRun(runId?: string): Promise<RunAudit> {
    const run = await this.getRun(runId);
    const workflow = this.registry.workflows[run.workflow];
    const findings: RunFinding[] = [];
    let handoffsRead = 0;
    for (const phase of workflow.phases) {
      const phaseAudit = await this.phaseFindings(run.runId, phase.id);
      handoffsRead += phaseAudit.fileCount;
      findings.push(...phaseAudit.findings);
    }
    const notices = new Set<string>();
    for (const finding of findings) {
      if (finding.severity === "notice") notices.add(finding.rendered);
    }
    return {
      runId: run.runId,
      handoffsRead,
      findings,
      blockers: this.mergeBlockers(run.blockers, findings),
      notices: [...notices]
    };
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

  /**
   * A phase that declares Gates cannot be left satisfied by silence. The requirement carries on
   * `claims` and their per-claim `evidenceRefs`, which bind a specific assertion to what backs it;
   * the top-level `evidence` bag cannot answer "is *this* claim supported?" and is not consulted.
   */
  private assertGatesAddressed(phase: WorkflowPhaseDefinition, handoff: SpecialistHandoff): void {
    if (phase.gates.length === 0) return;
    const gates = `[${phase.gates.join(", ")}]`;
    if (handoff.claims.length === 0) {
      throw new ContractError(`Phase ${phase.id} declares gates ${gates} and requires at least one claim`);
    }
    const unsupported = handoff.claims.find(claim => claim.evidenceRefs.length === 0);
    if (unsupported) {
      const quoted = unsupported.claim.length > 60 ? `${unsupported.claim.slice(0, 60)}…` : unsupported.claim;
      throw new ContractError(
        `Phase ${phase.id} declares gates ${gates}; every claim must carry at least one evidenceRef (offending: "${quoted}")`
      );
    }
  }

  /** Reads every persisted Handoff of one phase and classifies the declared findings. */
  private async phaseFindings(runId: string, phaseId: string): Promise<{ fileCount: number; findings: RunFinding[] }> {
    const handoffDir = `${this.runRoot(runId)}/handoffs/${phaseId}`;
    const fileNames = await this.workspace.list(handoffDir);
    const findings: RunFinding[] = [];
    for (const fileName of fileNames) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(await this.workspace.readText(`${handoffDir}/${fileName}`));
      } catch {
        findings.push(this.unreadableFinding(phaseId, fileName));
        continue;
      }
      findings.push(...this.collectHandoffFindings(parsed, phaseId, fileName));
    }
    return { fileCount: fileNames.length, findings };
  }

  /** Pure classification of one parsed Handoff. Never throws on bad content. */
  private collectHandoffFindings(handoff: unknown, phaseId: string, fileName: string): RunFinding[] {
    if (typeof handoff !== "object" || handoff === null) return [this.unreadableFinding(phaseId, fileName)];
    const record = handoff as Record<string, unknown>;
    const agentId = typeof record["agentId"] === "string" && record["agentId"].trim().length > 0 ? record["agentId"] : fileName;
    const findings: RunFinding[] = [];

    const unresolved = record["unresolved"];
    if (!Array.isArray(unresolved)) return [this.unreadableFinding(phaseId, fileName)];
    for (const entry of unresolved) {
      if (typeof entry !== "string") return [this.unreadableFinding(phaseId, fileName)];
      const detail = entry.trim();
      if (detail.length === 0) continue;
      findings.push({ severity: "blocker", kind: "unresolved", phase: phaseId, agentId, detail, rendered: `unresolved[${phaseId}/${agentId}]: ${detail}` });
    }

    const confidence = record["confidence"];
    if (confidence !== "low" && confidence !== "medium" && confidence !== "high") return [this.unreadableFinding(phaseId, fileName)];
    if (confidence === "low") {
      findings.push({ severity: "blocker", kind: "handoff-confidence", phase: phaseId, agentId, detail: "handoff confidence is low", rendered: `confidence[${phaseId}/${agentId}]: handoff confidence is low` });
    }

    const claims = record["claims"];
    if (Array.isArray(claims)) {
      for (const claim of claims) {
        if (typeof claim !== "object" || claim === null) continue;
        const claimRecord = claim as Record<string, unknown>;
        if (claimRecord["confidence"] !== "low") continue;
        const text = typeof claimRecord["claim"] === "string" ? claimRecord["claim"].trim().slice(0, 160) : "";
        findings.push({ severity: "notice", kind: "claim-confidence", phase: phaseId, agentId, detail: text, rendered: `claim-confidence[${phaseId}/${agentId}]: ${text}` });
      }
    }

    return findings;
  }

  private decisionPath(runId: string, decisionId: string): string {
    return `${this.runRoot(runId)}/decisions/${this.safeSegment(decisionId)}.json`;
  }

  private gateResultPath(runId: string, phase: string, gate: string): string {
    return `${this.runRoot(runId)}/gate-results/${this.safeSegment(phase)}/${this.safeSegment(gate)}.json`;
  }

  /** One recorded verdict, or undefined when none exists or the file cannot be parsed. */
  private async readGateResult(runId: string, phase: string, gate: string): Promise<GateResult | undefined> {
    const filePath = this.gateResultPath(runId, phase, gate);
    if (!(await this.workspace.exists(filePath))) return undefined;
    try {
      return JSON.parse(await this.workspace.readText(filePath)) as GateResult;
    } catch {
      return undefined;
    }
  }

  /**
   * Whether an evidence reference points at something on disk. Accepted relative to the Run root
   * first, then to the workspace root, because both are natural: a detector report lives under the
   * Run, while a build log or a source file the Gate inspected lives in the repository.
   */
  private async resolveEvidence(runId: string, reference: string): Promise<boolean> {
    const candidate = reference.trim();
    try {
      if (await this.workspace.exists(`${this.runRoot(runId)}/${candidate}`)) return true;
      return await this.workspace.exists(candidate);
    } catch {
      // A reference that escapes the workspace root is not evidence this Run can point at.
      return false;
    }
  }

  private waivedBlocker(result: GateResult & { status: "waived" }): string {
    return `waived[${result.phase}/${result.gate}]: ${result.waiver.reason} (approvedBy ${result.waiver.approvedBy}, revisit when ${result.waiver.revisitWhen})`;
  }

  /** The gate ids behind the human-readable lines `missingGates` produced, in declaration order. */
  private gateIdsOf(missing: string[], phase: WorkflowPhaseDefinition): string[] {
    return phase.gates.filter(gate => missing.some(line => line.includes(`declares gate ${gate} `)));
  }

  /** Reads one persisted Handoff, or undefined when no such file exists or it cannot be parsed. */
  private async readHandoff(runId: string, phase: string, agentId: string): Promise<SpecialistHandoff | undefined> {
    const filePath = `${this.runRoot(runId)}/handoffs/${this.safeSegment(phase)}/${this.safeSegment(agentId)}.json`;
    if (!(await this.workspace.exists(filePath))) return undefined;
    try {
      return JSON.parse(await this.workspace.readText(filePath)) as SpecialistHandoff;
    } catch {
      return undefined;
    }
  }

  /** The agentId of the Handoff that first recorded a Decision id. `run.decisionRefs` holds ids only. */
  private async decisionProducer(runId: string, decisionId: string): Promise<string | undefined> {
    for (const handoff of await this.eachHandoff(runId)) {
      if (handoff.decisions?.some(decision => decision.id === decisionId)) return handoff.agentId;
    }
    return undefined;
  }

  /** The agentId behind a phase, for Artifacts persisted without one. */
  private async phaseAgentId(runId: string, phase: string): Promise<string | undefined> {
    for (const handoff of await this.eachHandoff(runId)) {
      if (handoff.phase === phase) return handoff.agentId;
    }
    return undefined;
  }

  /** Every parseable Handoff of a Run, in phase then agent order. Runs hold at most a few dozen. */
  private async eachHandoff(runId: string): Promise<SpecialistHandoff[]> {
    const handoffRoot = `${this.runRoot(runId)}/handoffs`;
    const collected: SpecialistHandoff[] = [];
    for (const phase of await this.workspace.list(handoffRoot)) {
      for (const fileName of await this.workspace.list(`${handoffRoot}/${phase}`)) {
        try {
          collected.push(JSON.parse(await this.workspace.readText(`${handoffRoot}/${phase}/${fileName}`)) as SpecialistHandoff);
        } catch {
          continue;
        }
      }
    }
    return collected;
  }

  /**
   * Whether `agentId` persisted a Handoff in this Run, in a completed phase other than `excludePhase`.
   * This is what turns `approvedBy` from a free string into a claim about state another agent wrote.
   */
  private async hasAttested(run: RunContract, agentId: string, excludePhase: string): Promise<boolean> {
    const handoffRoot = `${this.runRoot(run.runId)}/handoffs`;
    for (const phase of await this.workspace.list(handoffRoot)) {
      if (phase === excludePhase) continue;
      if (!run.phaseHistory.some(entry => entry.phase === phase && entry.exitedAt)) continue;
      if (await this.workspace.exists(`${handoffRoot}/${phase}/${this.safeSegment(agentId)}.json`)) return true;
    }
    return false;
  }

  private unreadableFinding(phaseId: string, fileName: string): RunFinding {
    return {
      severity: "blocker",
      kind: "unreadable",
      phase: phaseId,
      agentId: fileName,
      detail: "handoff could not be parsed for audit",
      rendered: `unreadable[${phaseId}/${fileName}]: handoff could not be parsed for audit`
    };
  }

  private mergeBlockers(existing: string[], findings: RunFinding[]): string[] {
    const merged = new Set(existing);
    for (const finding of findings) {
      if (finding.severity === "blocker") merged.add(finding.rendered);
    }
    return [...merged];
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
    return `.chromarelay/runs/${this.safeSegment(runId)}`;
  }

  private safeSegment(value: string): string {
    const safe = value.replaceAll(/[^a-zA-Z0-9._-]/g, "-");
    if (!safe || safe === "." || safe === "..") throw new ContractError(`Unsafe path segment: ${value}`);
    return safe;
  }
  /**
   * Whether an Artifact path sits inside this Run's typed layout: under the Run root (accepted both
   * Run-relative, e.g. `context/PRODUCT.md`, and workspace-style,
   * `.chromarelay/runs/<id>/context/PRODUCT.md`) with the first segment one of the five layout
   * folders. Guards mirror resolveEvidence containment: the path is normalized, `..` escaping the
   * layout is rejected, and every remaining segment survives safeSegment unchanged.
   */
  private isArtifactLayoutPath(runId: string, artifactPath: string): boolean {
    const trimmed = artifactPath.trim();
    const root = this.runRoot(runId);
    const relative = trimmed.startsWith(root) ? trimmed.slice(root.length).replace(/^\/+/, "") : trimmed;
    const within = this.normalizeWithin(relative);
    if (within === undefined || within.length === 0) return false;
    const [first, ...rest] = within.split("/");
    if (!(ARTIFACT_LAYOUT_DIRS as readonly string[]).includes(first ?? "")) return false;
    return rest.length > 0 && rest.every(segment => this.isSafePathSegment(segment));
  }
  /** An Artifact path expressed relative to the Run root, for resolveEvidence-style lookups. */
  private workspaceRelative(runId: string, artifactPath: string): string {
    const root = this.runRoot(runId);
    const trimmed = artifactPath.trim();
    return trimmed.startsWith(root) ? trimmed.slice(root.length).replace(/^\/+/, "") : trimmed;
  }
  /** An Artifact path expressed workspace-relative, for reads and writes. */
  private workspacePath(runId: string, artifactPath: string): string {
    const relative = this.workspaceRelative(runId, artifactPath);
    return relative.length === 0 ? this.runRoot(runId) : `${this.runRoot(runId)}/${relative}`;
  }
  /** Workspace-style path under the Run root, so stored refs resolve however they were written. */
  private canonicalArtifactPath(runId: string, artifactPath: string): string {
    const relative = this.workspaceRelative(runId, artifactPath);
    return `${this.runRoot(runId)}/${this.normalizeWithin(relative) ?? relative}`;
  }
  /** Normalized with `/` separators, or undefined when the value escapes its root. */
  private normalizeWithin(value: string): string | undefined {
    const normalized = path.posix.normalize(value.replaceAll("\\", "/"));
    if (path.posix.isAbsolute(normalized) || normalized === ".." || normalized.startsWith("../")) return undefined;
    return normalized === "." ? "" : normalized;
  }
  /** One segment safe to persist: non-empty, no traversal, safeSegment-unchanged. */
  private isSafePathSegment(segment: string): boolean {
    if (segment.length === 0 || segment === "." || segment === "..") return false;
    return this.safeSegment(segment) === segment;
  }

  private async activeRunId(): Promise<string> {
    const active = JSON.parse(await this.workspace.readText(".chromarelay/active-run.json")) as { runId?: string };
    if (!active.runId) throw new ContractError("No active ChromaRelay Run");
    return active.runId;
  }

  private async saveRun(run: RunContract): Promise<void> {
    this.validateRun(run);
    await this.workspace.writeText(`${this.runRoot(run.runId)}/run.json`, this.json(run));
    await this.workspace.writeText(".chromarelay/active-run.json", this.json({ runId: run.runId, updatedAt: run.updatedAt }));
  }

  private async appendEvent(runId: string, event: Record<string, unknown>): Promise<void> {
    await this.workspace.appendText(`${this.runRoot(runId)}/events.jsonl`, `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`);
  }

  private json(value: unknown): string {
    return `${JSON.stringify(value, null, 2)}\n`;
  }
}
