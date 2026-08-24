export const WORKFLOW_IDS = ["CREATE", "DOCUMENT", "REDESIGN", "EXPLORE", "REFINE"] as const;
export type WorkflowId = (typeof WORKFLOW_IDS)[number];

export const SURFACE_CLASSES = ["PERSUADE", "OPERATE", "READ", "EXPERIENCE"] as const;
export type SurfaceClass = (typeof SURFACE_CLASSES)[number];

export type AutonomyMode = "assisted" | "guarded" | "full";
export type RunStatus = "planned" | "active" | "blocked" | "awaiting-human" | "completed" | "cancelled";
export type DecisionLevel = 0 | 1 | 2 | 3;
export type ArtifactStatus = "observed" | "inferred" | "proposed" | "approved" | "locked" | "deprecated" | "rejected";
export type RequestedTransition = "advance" | "branch" | "return" | "escalate" | "stop";

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

export interface WorkflowPhaseDefinition {
  id: string;
  role: string;
  kit: string | null;
  purpose: string;
  inputs: string[];
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
}

export interface PhaseHistoryEntry {
  phase: string;
  enteredAt: string;
  exitedAt?: string;
  outcome?: string;
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
  inputs: string[];
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
}
