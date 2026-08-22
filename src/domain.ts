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

export interface RegistryBundle {
  workflows: Record<WorkflowId, WorkflowDefinition>;
  roles: Record<string, AgentRoleDefinition>;
  kits: Record<string, SkillKitDefinition>;
  gates: Set<string>;
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

export interface DecisionRecord {
  id: string;
  scope: "project" | "system" | "surface" | "component" | "run";
  status: Exclude<ArtifactStatus, "observed">;
  choice: string;
  rationale: string[];
  alternatives: string[];
  evidence: string[];
  risks: string[];
  revisitWhen: string[];
  supersedes?: string[];
  approvedBy?: string;
  approvedAt?: string;
}

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
}
