export const WORKFLOW_IDS = ["CREATE", "DOCUMENT", "REDESIGN", "EXPLORE", "REFINE"] as const;
export type WorkflowId = (typeof WORKFLOW_IDS)[number];

export const SURFACE_CLASSES = ["PERSUADE", "OPERATE", "READ", "EXPERIENCE"] as const;
export type SurfaceClass = (typeof SURFACE_CLASSES)[number];

export type AutonomyMode = "assisted" | "guarded" | "full";
export type RunStatus = "planned" | "active" | "blocked" | "awaiting-human" | "completed" | "cancelled";
export type DecisionLevel = 0 | 1 | 2 | 3;
export type ArtifactStatus = "observed" | "inferred" | "proposed" | "approved" | "locked" | "deprecated" | "rejected";
/**
 * Ordered from least to most withholding of forward motion. The order is the tie-break `advance()`
 * applies when a phase worked in parallel produces several requests, so it is data, not decoration.
 */
export const REQUESTED_TRANSITIONS = ["advance", "branch", "return", "escalate", "stop"] as const;
export type RequestedTransition = (typeof REQUESTED_TRANSITIONS)[number];

export interface DesignRequest {
  objective: string;
  explicitWorkflow?: WorkflowId;
  scopeKind?: "project" | "system" | "flow" | "surface" | "section" | "component";
  targets?: string[];
  nonGoals?: string[];
  autonomy?: AutonomyMode;
  surfaceClass?: SurfaceClass;
  hasExistingDesign?: boolean;
  documentationTrusted?: boolean;
  existingQuality?: "good" | "mixed" | "poor";
  changeMagnitude?: "trivial" | "localized" | "surface" | "systemic";
  explorationOnly?: boolean;
  needsCreativeExploration?: boolean;
  hardConstraints?: string[];
  lockedDecisions?: string[];
  openDecisions?: string[];
}

export interface RouteDecision {
  workflow: WorkflowId;
  decisionLevel: DecisionLevel;
  rationale: string[];
  continuation?: WorkflowId;
}

/**
 * Where an input lives, declared in the workflow JSON. This is the *intent* of an input: a human-
 * reviewable statement of which root holds it and under what name, resolved to an address only when
 * a Phase Packet is compiled. `path` addresses the static sources; `kind` is matched against
 * `ArtifactRef.kind` for what only exists once an earlier phase has produced it.
 */
export interface PhaseInput {
  name: string;
  source: "canonical" | "artifact" | "run" | "framework";
  /** For canonical | run | framework: relative to that source's root. */
  path?: string;
  /** For artifact: matched against ArtifactRef.kind. */
  kind?: string;
  /** Defaults to true when absent. */
  required?: boolean;
}

/**
 * The resolved *address* of an input, emitted in the Phase Packet. A specialist runs as a child
 * session with no conversation history, so a bare name like "Product Brief" is unactionable: its
 * only options are to scan the repository, which contaminates the context the system deliberately
 * withheld, or to invent. `status` reports which root answered and whether the file is present.
 */
export interface ResolvedInput {
  name: string;
  path: string | null;
  status: "resolved" | "canonical" | "framework" | "run" | "absent-optional" | "absent-canonical";
  contentHash?: string;
}

export interface WorkflowPhaseDefinition {
  id: string;
  role: string;
  kit: string | null;
  purpose: string;
  inputs: PhaseInput[];
  outputs: string[];
  gates: string[];
  parallelism: string;
  exit: string;
  skipWhen?: string;
  contextControls?: string[];
}

export interface WorkflowDefinition {
  id: WorkflowId;
  version: string;
  purpose: string;
  phases: WorkflowPhaseDefinition[];
}

export interface AgentRoleDefinition {
  id: string;
  purpose: string;
  modelRole: string;
  primarySkill: string;
  maySpawn: boolean;
  mayWrite: string[];
  mustNot: string[];
}

export interface SkillKitDefinition {
  id: string;
  primary: string;
  supporting: string[];
  roles: string[];
}

/**
 * Rejects a document that does not satisfy the published Handoff schema, listing every violation.
 * Declared structurally here so this module keeps its zero imports; the compiling adapter lives in
 * `handoff-schema.ts` and depends on this file rather than the other way round.
 */
export interface HandoffValidator {
  (handoff: unknown): void;
}

export interface RegistryBundle {
  workflows: Record<WorkflowId, WorkflowDefinition>;
  roles: Record<string, AgentRoleDefinition>;
  kits: Record<string, SkillKitDefinition>;
  gates: Set<string>;
  handoffValidator: HandoffValidator;
}

export interface ArtifactRef {
  id: string;
  kind: string;
  path: string;
  status: ArtifactStatus;
  producerRole: string;
  agentId?: string;
  runId: string;
  phase: string;
  createdAt: string;
  contentHash?: string;
  sourceRefs: string[];
  evidenceRefs?: string[];
  canonicalDestination?: string;
}

export interface DecisionCore {
  id: string;
  scope: "project" | "system" | "surface" | "component" | "run";
  choice: string;
  rationale: string[];
  alternatives: string[];
  evidence: string[];
  risks: string[];
  revisitWhen: string[];
  supersedes?: string[];
}

/** Status a specialist may self-declare in a Handoff. */
export type ProposedDecisionStatus = "inferred" | "proposed" | "deprecated" | "rejected";
/** Status only approve() or an APPROVAL_ROLES Handoff may carry. */
export type ApprovedDecisionStatus = "approved" | "locked";

/**
 * A Decision is either proposed by its producer, carrying no approver, or approved by a second party,
 * carrying one. The union makes the middle ground — a self-declared approval with no approver, or a
 * proposal that names one — inexpressible at compile time.
 */
export type DecisionRecord =
  | (DecisionCore & { status: ProposedDecisionStatus; approvedBy?: never; approvedAt?: never })
  | (DecisionCore & { status: ApprovedDecisionStatus; approvedBy: string; approvedAt: string });

/** Roles whose Handoff may carry an already-approved Decision. One member today, so a constant, not a registry field. */
export const APPROVAL_ROLES = new Set(["memory-curator"]);

export interface HandoffClaim {
  claim: string;
  status: "observed" | "inferred" | "proposed";
  confidence: "low" | "medium" | "high";
  evidenceRefs: string[];
}

/**
 * Which Skills the specialist actually used, in the shape the Phase Packet offers them
 * (`PhasePacket["skillKit"]`). Mirroring that shape is the point: offered and used become
 * directly comparable, so a kit of three whose Handoff reports one is a readable signal
 * rather than an absence. `primary: null` reports a phase worked without a primary Skill.
 */
export interface HandoffSkillUse {
  primary: string | null;
  supporting: string[];
}

/**
 * Quantitative resource report a specialist may attach to its Handoff. Every field is optional so a
 * harness that cannot observe a resource reports nothing rather than a fabricated zero: absence is
 * read downstream as an explicit "unknown", never as an empty measurement.
 */
export interface HandoffTelemetry {
  /** Tool name -> invocation count for this agent during this phase. */
  tools?: Record<string, number>;
  /** Input tokens consumed by this agent during this phase, when the harness reports them. */
  inputTokens?: number;
  /** Output tokens produced by this agent during this phase, when the harness reports them. */
  outputTokens?: number;
}

export interface SpecialistHandoff {
  version: "1.0";
  runId: string;
  phase: string;
  role: string;
  agentId: string;
  summary: string;
  claims: HandoffClaim[];
  evidence: string[];
  artifacts: ArtifactRef[];
  decisions: DecisionRecord[];
  risks: string[];
  confidence: "low" | "medium" | "high";
  requestedTransition: RequestedTransition;
  requestedTarget?: string;
  unresolved: string[];
  /** Optional only so Handoffs already on disk stay readable; every new Handoff should carry it. */
  skill?: HandoffSkillUse;
  /** Optional quantitative resource report; absent means the harness observed nothing, not zero. */
  telemetry?: HandoffTelemetry;
}

/** Verdict a Gate result may carry. `fail` is a recorded evaluation, not a pass — see `GateResult`. */
export type GateStatus = "pass" | "fail" | "waived";

/**
 * A named, approved exception to one Gate on one Phase, in the vocabulary
 * `framework/templates/project/EXCEPTIONS.md` already uses: scope, reason, Evidence (on the
 * enclosing `GateResult`), owner (`approvedBy`), revisit condition, and whether it is reusable.
 * `scope` reuses `DecisionCore["scope"]` so the two speak the same language; `project` is
 * representable but rejected at record time, because a waiver that applies project-wide is a
 * policy change and belongs in a Lock, not in a Run's exception ledger.
 */
export interface GateWaiver {
  scope: DecisionCore["scope"];
  reason: string;
  approvedBy: string;
  approvedAt: string;
  revisitWhen: string;
  reusable?: boolean;
}

export interface GateResultCore {
  version: "1.0";
  runId: string;
  phase: string;
  gate: string;
  summary: string;
  /** The agent that evaluated the Gate. Compared against `waiver.approvedBy` to forbid self-waiver. */
  recordedBy: string;
  recordedAt: string;
  /**
   * Paths, relative to the Run root or the workspace root, that back this verdict. Checked for
   * existence when the result is recorded: this is what separates a ledger from a form.
   */
  evidenceRefs: string[];
  /**
   * When this verdict stops counting. Evidence is perishable — a gate result expires because the
   * world moved (the code, the token, the browser), not because the Run ended, so expiry is the
   * result's own property rather than the Run's. Absent means the verdict does not expire on its own.
   */
  validUntil?: string;
}

/**
 * One evaluated Gate, recorded against the Phase that declared it.
 *
 * WHAT THIS STRUCTURE GUARANTEES: that a Phase declaring Gates cannot be left without a verdict on
 * each one; that the verdict names who claimed it, when, and which files back it; that those files
 * exist; and that skipping a Gate is a named, second-party-approved, blocker-raising act.
 *
 * WHAT IT DOES NOT GUARANTEE: that the Gate was actually executed. A recorded `pass` is
 * self-attestation — an agent can write `{gate: "accessibility", status: "pass"}` without ever
 * running axe, as long as it points at a file that exists. The ledger converts "the system does not
 * know whether this Gate was evaluated" into "the system knows what was claimed, by whom, against
 * which evidence". That is an auditable trail and the end of silent passage; it is not proof of
 * execution. Proof requires a runner that produces the evidence itself, which this does not do.
 */
export type GateResult =
  | (GateResultCore & { status: "pass" | "fail"; waiver?: never })
  | (GateResultCore & { status: "waived"; waiver: GateWaiver });

export interface PhaseHistoryEntry {
  phase: string;
  enteredAt: string;
  exitedAt?: string;
  outcome?: string;
  /** Gates left without a valid result when the phase was forced. Present only on `forced-past-gates`. */
  bypassedGates?: string[];
  /** Why the phase was forced. Required whenever `bypassedGates` is non-empty. */
  reason?: string;
}

export interface RunContract {
  version: "1.0";
  runId: string;
  workflow: WorkflowId;
  objective: string;
  scope: {
    kind: NonNullable<DesignRequest["scopeKind"]>;
    targets: string[];
    nonGoals: string[];
  };
  autonomy: AutonomyMode;
  status: RunStatus;
  currentPhase: string;
  decisionLevel: DecisionLevel;
  surfaceClass?: SurfaceClass;
  hardConstraints: string[];
  lockedDecisions: string[];
  openDecisions: string[];
  authority: {
    canonicalOwner: "coordinator";
    promotionRole: "memory-curator";
    creatorMayFinalCritique: false;
  };
  skillBudget: {
    primary: 1;
    supporting: 2;
  };
  phaseHistory: PhaseHistoryEntry[];
  artifactRefs: ArtifactRef[];
  decisionRefs: string[];
  blockers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PhasePacket {
  runId: string;
  workflow: WorkflowId;
  phase: string;
  role: string;
  goal: string;
  scope: string[];
  inputs: ResolvedInput[];
  /**
   * Names of the inputs the Packet could not point at a present file — every `absent-optional` and
   * `absent-canonical`. Carried separately so a reader sees what is missing without walking `inputs`.
   */
  unresolvedInputs: string[];
  locks: string[];
  openDecisions: string[];
  /** Path to the Surface rubric, relative to the installed framework root. */
  rubric: string;
  authority: string[];
  skillKit: {
    primary: string | null;
    supporting: string[];
  };
  outputSchema: string;
  acceptance: string[];
  exitPolicy: string;
  nonGoals: string[];
  omittedContext: string[];
  independenceControls: string[];
}

export interface RunStatusView {
  runId: string;
  workflow: WorkflowId;
  status: RunStatus;
  currentPhase: string;
  phasePurpose: string;
  role: string;
  requiredOutputs: string[];
  gates: string[];
  blockers: string[];
  openDecisions: string[];
}

export type RunFindingKind = "unresolved" | "handoff-confidence" | "claim-confidence" | "unreadable";

export interface RunFinding {
  severity: "blocker" | "notice";
  kind: RunFindingKind;
  phase: string;
  agentId: string;
  detail: string;
  /** Canonical one-line rendering; this exact string is what lands in run.blockers. */
  rendered: string;
}

export interface RunAudit {
  runId: string;
  handoffsRead: number;
  findings: RunFinding[];
  /** Deduplicated `rendered` of every blocker-severity finding, merged with run.blockers already on disk. */
  blockers: string[];
  /** Deduplicated `rendered` of every notice-severity finding. Never persisted. */
  notices: string[];
  /** Resource consumption aggregated per Phase and per Role. Absent sub-fields mean unknown, not zero. */
  resources: RunResourceReport;
}

/**
 * Resource telemetry aggregated from the `telemetry` blocks Handoffs persisted for this Run. Any
 * `undefined` total means no Handoff reported that resource — an explicit unknown, so a coordinator
 * comparing Runs can tell "never measured" from "measured zero". Read-only; never persisted and
 * never consulted by `advance()`.
 */
export interface RunResourceReport {
  /** Per Phase: tool calls by name, Skill use, and token totals, summed over the phase's agents. */
  byPhase: Record<string, PhaseResourceUsage>;
  /** Per Role, summed across every Phase the Role worked in this Run. */
  byRole: Record<string, RoleResourceUsage>;
}

export interface PhaseResourceUsage {
  /** Role that owns the Phase, so a reader needs no registry lookup to join the two views. */
  role: string;
  /** Tool name -> total invocations across the Phase's agents. Absent when no agent reported tools. */
  tools?: Record<string, number>;
  /**
   * Offered-versus-used Skill Kit shape, aggregated across the Phase's agents: each skill name maps
   * to how many agents reported using it, in the primary/supporting split the kit offered. Absent
   * when no agent reported its Skill use.
   */
  skill?: {
    offered: { primary: string | null; supporting: string[] };
    used: { primary: Record<string, number>; supporting: Record<string, number> };
  };
  /** Absent when no agent reported tokens for the Phase. */
  tokens?: { input: number; output: number };
  /** What each agent of the Phase reported, keyed by agentId. Absent means the agent reported nothing. */
  agents?: Record<string, AgentResourceUsage>;
}

/** One agent's reported resources inside one Phase. Each field absent when that resource is unknown. */
export interface AgentResourceUsage {
  /** Tool name -> invocation count as the agent reported it. */
  tools?: Record<string, number>;
  /** Skill use in the offered-versus-used shape, as reported. Absent when the agent reported none. */
  skill?: { primary: string | null; supporting: string[] };
  tokens?: { input: number; output: number };
}

export interface RoleResourceUsage {
  /** Tool name -> total invocations across every Phase this Role worked. Absent when none reported. */
  tools?: Record<string, number>;
  /** How many agents of this Role reported using each Skill, split the same way. Absent when none reported. */
  skills?: { primary: Record<string, number>; supporting: Record<string, number> };
  /** Absent when no agent of this Role reported tokens. */
  tokens?: { input: number; output: number };
}

export class ContractError extends Error {
  override readonly name = "ContractError";
}

export function assertNonEmpty(value: string, label: string): void {
  if (value.trim().length === 0) throw new ContractError(`${label} must not be empty`);
}

export function isWorkflowId(value: string): value is WorkflowId {
  return (WORKFLOW_IDS as readonly string[]).includes(value);
}

export function validateRequest(request: DesignRequest): void {
  assertNonEmpty(request.objective, "objective");
  if (request.explicitWorkflow && !isWorkflowId(request.explicitWorkflow)) {
    throw new ContractError(`Unknown workflow: ${request.explicitWorkflow}`);
  }
  if (request.targets?.some(target => target.trim().length === 0)) {
    throw new ContractError("targets must not contain empty values");
  }
}

/**
 * Everything about a Gate result that can be judged without touching the workspace. Kept sync and
 * pure for the same reason `validateHandoff` is: it is the shape check, callable from a test with no
 * adapter. Whether `evidenceRefs` point at files that exist is a question about the world, answered
 * in `DesignManager.recordGateResult`.
 */
export function validateGateResult(result: GateResult): void {
  if (result.version !== "1.0") throw new ContractError("gate result version must be 1.0");
  for (const [label, value] of [["runId", result.runId], ["phase", result.phase], ["gate", result.gate], ["summary", result.summary], ["recordedBy", result.recordedBy], ["recordedAt", result.recordedAt]] as const) {
    assertNonEmpty(value, label);
  }
  if (result.evidenceRefs.length === 0) {
    throw new ContractError(`Gate ${result.gate} requires at least one evidenceRef; a verdict with nothing behind it is a form, not a result`);
  }
  if (result.evidenceRefs.some(reference => reference.trim().length === 0)) {
    throw new ContractError(`Gate ${result.gate} carries an empty evidenceRef`);
  }
  if (result.validUntil !== undefined && Number.isNaN(Date.parse(result.validUntil))) {
    throw new ContractError(`Gate ${result.gate} declares an unparseable validUntil: ${result.validUntil}`);
  }
  if (result.status !== "waived") return;

  // A waiver follows the same second-party rule the system already applies to an approved Decision:
  // the agent that recorded the verdict may not be the one that excuses it.
  const waiver = result.waiver;
  for (const [label, value] of [["waiver.reason", waiver.reason], ["waiver.approvedBy", waiver.approvedBy], ["waiver.approvedAt", waiver.approvedAt], ["waiver.revisitWhen", waiver.revisitWhen]] as const) {
    assertNonEmpty(value, label);
  }
  if (waiver.approvedBy === result.recordedBy) {
    throw new ContractError(`Gate ${result.gate} is self-waived by ${result.recordedBy}; a waiver needs a second party`);
  }
  if (waiver.scope === "project") {
    throw new ContractError(`Waiver of gate ${result.gate} declares scope project; a waiver is an exception, not policy — record a Lock instead`);
  }
}

/** Whether a recorded verdict still counts at `at`. A result with no `validUntil` never expires on its own. */
export function isGateResultValid(result: GateResult, at: Date): boolean {
  if (result.validUntil === undefined) return true;
  const expiry = Date.parse(result.validUntil);
  return Number.isNaN(expiry) ? false : expiry > at.getTime();
}

export function validateHandoff(handoff: SpecialistHandoff): void {
  if (handoff.version !== "1.0") throw new ContractError("handoff version must be 1.0");
  for (const [label, value] of [["runId", handoff.runId], ["phase", handoff.phase], ["role", handoff.role], ["agentId", handoff.agentId], ["summary", handoff.summary]] as const) {
    assertNonEmpty(value, label);
  }
  for (const artifact of handoff.artifacts) {
    if (artifact.runId !== handoff.runId) throw new ContractError(`Artifact ${artifact.id} belongs to another Run`);
    if (artifact.phase !== handoff.phase) throw new ContractError(`Artifact ${artifact.id} belongs to another Phase`);
  }

  for (const artifact of handoff.artifacts) {
    if (artifact.status !== "approved" && artifact.status !== "locked") continue;
    if (!APPROVAL_ROLES.has(handoff.role)) {
      throw new ContractError(
        `Role ${handoff.role} may not submit Artifact ${artifact.id} with status ${artifact.status}; ` +
        `specialists produce proposed Artifacts and approval is recorded through approve()`
      );
    }
  }

  for (const decision of handoff.decisions) {
    if (decision.status !== "approved" && decision.status !== "locked") continue;
    if (!APPROVAL_ROLES.has(handoff.role)) {
      throw new ContractError(
        `Role ${handoff.role} may not submit Decision ${decision.id} with status ${decision.status}; ` +
        `specialists propose Decisions and the Memory Curator approves them during Promotion`
      );
    }
    if (!decision.approvedBy?.trim()) {
      throw new ContractError(`Decision ${decision.id} claims ${decision.status} without naming approvedBy`);
    }
    if (decision.approvedBy === handoff.agentId) {
      throw new ContractError(`Decision ${decision.id} is self-approved by ${handoff.agentId}`);
    }
  }

  // Telemetry is quantitative, so a wrong shape is a corrupted report rather than a missing one.
  // Absence stays legal — an unknown measurement is honest — but what IS present must add up.
  const telemetry = handoff.telemetry;
  if (telemetry !== undefined) {
    if (typeof telemetry !== "object" || telemetry === null) {
      throw new ContractError("handoff telemetry must be an object when present");
    }
    for (const [tool, count] of Object.entries(telemetry.tools ?? {})) {
      if (!Number.isInteger(count) || count <= 0) {
        throw new ContractError(`Telemetry tool count for ${tool} must be a positive integer, got ${count}`);
      }
    }
    for (const [label, value] of [["inputTokens", telemetry.inputTokens], ["outputTokens", telemetry.outputTokens]] as const) {
      if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
        throw new ContractError(`Telemetry ${label} must be a non-negative integer, got ${value}`);
      }
    }
  }
}
