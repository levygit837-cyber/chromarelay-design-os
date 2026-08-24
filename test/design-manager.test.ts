import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DesignManager } from "../src/design-manager.js";
import type { DecisionRecord, RegistryBundle, SpecialistHandoff, WorkflowDefinition, WorkflowId } from "../src/domain.js";
import { ContractError, validateHandoff } from "../src/domain.js";
import { noopHandoffValidator } from "../src/handoff-schema.js";
import { MemoryWorkspace } from "../src/workspace.js";

const phases = {
  CREATE: [
    { id: "intake", role: "coordinator", kit: null, purpose: "route", inputs: ["request"], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" },
    { id: "grounding", role: "product-strategist", kit: "grounding", purpose: "ground", inputs: ["request"], outputs: ["Product Brief"], gates: ["grounding-completeness"], parallelism: "single", exit: "complete" }
  ],
  DOCUMENT: [{ id: "intake", role: "coordinator", kit: null, purpose: "document", inputs: ["request"], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  REDESIGN: [{ id: "intake", role: "coordinator", kit: null, purpose: "redesign", inputs: ["request"], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  EXPLORE: [{ id: "frame", role: "product-strategist", kit: "grounding", purpose: "frame", inputs: ["request"], outputs: ["Question"], gates: ["grounding-completeness"], parallelism: "single", exit: "valid" }],
  REFINE: [{ id: "scope", role: "coordinator", kit: null, purpose: "scope", inputs: ["request"], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }]
} satisfies Record<WorkflowId, WorkflowDefinition["phases"]>;

function registry(): RegistryBundle {
  return {
    workflows: Object.fromEntries(Object.entries(phases).map(([id, workflowPhases]) => [id, { id, version: "test", purpose: id, phases: workflowPhases }])) as Record<WorkflowId, WorkflowDefinition>,
    roles: {
      coordinator: { id: "coordinator", purpose: "coordinate", modelRole: "coordinator", primarySkill: "manager", maySpawn: true, mayWrite: [], mustNot: ["critique"] },
      "product-strategist": { id: "product-strategist", purpose: "ground", modelRole: "product", primarySkill: "grounding", maySpawn: false, mayWrite: [], mustNot: ["implement"] }
    },
    kits: {
      grounding: { id: "grounding", primary: "createive-grounding", supporting: [], roles: ["product-strategist"] }
    },
    gates: new Set(["grounding-completeness"]),
    handoffValidator: noopHandoffValidator()
  };
}

test("routes new design work to CREATE", () => {
  const manager = new DesignManager(new MemoryWorkspace(), registry());
  const decision = manager.route({ objective: "Design a new agent console", hasExistingDesign: false });
  assert.equal(decision.workflow, "CREATE");
  assert.equal(decision.decisionLevel, 3);
});

test("routes undocumented existing work through DOCUMENT with continuation", () => {
  const manager = new DesignManager(new MemoryWorkspace(), registry());
  const decision = manager.route({ objective: "Improve the dashboard", hasExistingDesign: true, documentationTrusted: false, existingQuality: "mixed" });
  assert.equal(decision.workflow, "DOCUMENT");
  assert.equal(decision.continuation, "REFINE");
});

test("routes poor documented system to REDESIGN", () => {
  const manager = new DesignManager(new MemoryWorkspace(), registry());
  const decision = manager.route({ objective: "Replace the weak UI", hasExistingDesign: true, documentationTrusted: true, existingQuality: "poor" });
  assert.equal(decision.workflow, "REDESIGN");
});

test("rejects incompatible explicit workflow", () => {
  const manager = new DesignManager(new MemoryWorkspace(), registry());
  assert.throws(() => manager.route({ objective: "Refine new work", explicitWorkflow: "REFINE", hasExistingDesign: false }), ContractError);
});

test("starts a Run and persists a Phase Packet", async () => {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, registry());
  const run = await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId: "create-test-001", now: new Date("2026-08-21T12:00:00.000Z") });
  assert.equal(run.currentPhase, "intake");
  assert.equal(await workspace.exists(".createive/runs/create-test-001/run.json"), true);
  assert.equal(await workspace.exists(".createive/runs/create-test-001/phase-packets/intake.json"), true);
  assert.equal(JSON.parse(await workspace.readText(".createive/active-run.json")).runId, "create-test-001");
});

test("starts a Run with the canonical project root available for Promotion", async () => {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, registry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId: "create-test-003" });
  assert.equal(await workspace.exists(".createive/project"), true);
});

test("requires a specialist Handoff before advancing a specialist phase", async () => {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, registry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId: "create-test-002" });
  await manager.advance("create-test-002", { force: true });
  await assert.rejects(() => manager.advance("create-test-002"), /requires at least one persisted Handoff/);

  const handoff: SpecialistHandoff = {
    version: "1.0",
    runId: "create-test-002",
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-a",
    summary: "Grounding complete",
    claims: [{ claim: "Product truth is grounded", status: "inferred", confidence: "medium", evidenceRefs: [".createive/runs/create-test-002/artifacts/PRODUCT.md"] }],
    evidence: [".createive/runs/create-test-002/artifacts/PRODUCT.md"],
    artifacts: [{ id: "product-brief", kind: "Product Brief", path: ".createive/runs/create-test-002/artifacts/PRODUCT.md", status: "proposed", producerRole: "product-strategist", agentId: "strategist-a", runId: "create-test-002", phase: "grounding", createdAt: new Date().toISOString(), sourceRefs: [] }],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: []
  };
  await manager.recordHandoff(handoff);
  const completed = await manager.advance("create-test-002");
  assert.equal(completed.status, "completed");
});

test("reads unresolved and confidence from a persisted Handoff", async () => {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, registry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId: "create-test-003" });
  await manager.advance("create-test-003", { force: true });

  await manager.recordHandoff({
    version: "1.0",
    runId: "create-test-003",
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-a",
    summary: "Grounding partially complete",
    claims: [{ claim: "margin is inside noise", status: "inferred", confidence: "low", evidenceRefs: ["e1"] }],
    evidence: [],
    artifacts: [],
    decisions: [],
    risks: [],
    confidence: "low",
    requestedTransition: "advance",
    unresolved: ["pricing model", "brand assets"]
  });

  const advanced = await manager.advance("create-test-003");
  assert.equal(advanced.status, "completed");
  assert.equal(advanced.blockers.length, 3);
  assert.ok(advanced.blockers.includes("unresolved[grounding/strategist-a]: pricing model"));
  assert.ok(advanced.blockers.includes("confidence[grounding/strategist-a]: handoff confidence is low"));

  const audit = await manager.auditRun("create-test-003");
  assert.equal(audit.handoffsRead, 1);
  assert.equal(audit.blockers.length, 3);
  assert.equal(audit.notices.length, 1);
  assert.ok(audit.notices[0]?.startsWith("claim-confidence[grounding/strategist-a]:"));
});

test("emits the Surface rubric path for a PERSUADE Run", async () => {
  const manager = new DesignManager(new MemoryWorkspace(), registry());
  await manager.start({ objective: "Persuade", hasExistingDesign: false, surfaceClass: "PERSUADE" }, { runId: "rubric-test-001" });
  const packet = await manager.phasePacket("rubric-test-001");
  assert.equal(packet.rubric, "rubrics/persuade.json");
});

test("falls back to the common rubric when the Run has no Surface class", async () => {
  const manager = new DesignManager(new MemoryWorkspace(), registry());
  await manager.start({ objective: "No surface class", hasExistingDesign: false }, { runId: "rubric-test-002" });
  const packet = await manager.phasePacket("rubric-test-002");
  assert.equal(packet.rubric, "rubrics/common.json");
});

test("every Phase Packet field is declared in the Phase Packet schema", async () => {
  const manager = new DesignManager(new MemoryWorkspace(), registry());
  await manager.start({ objective: "Schema check", hasExistingDesign: false, surfaceClass: "OPERATE" }, { runId: "rubric-test-003" });
  const packet = await manager.phasePacket("rubric-test-003");
  assert.equal(packet.rubric, "rubrics/operate.json");
  const schema = JSON.parse(await readFile("framework/schemas/phase-packet.schema.json", "utf8"));
  const declared = new Set(Object.keys(schema.properties));
  const undeclared = Object.keys(packet).filter(key => !declared.has(key));
  assert.deepEqual(undeclared, [], `packet fields missing from schema: ${undeclared.join(", ")}`);
  for (const required of schema.required) assert.ok(required in packet, `schema requires ${required}, packet omits it`);
});

async function runWithGroundingHandoff(runId: string, overrides: Partial<SpecialistHandoff> = {}): Promise<DesignManager> {
  const manager = new DesignManager(new MemoryWorkspace(), registry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId });
  await manager.advance(runId, { force: true });
  await manager.recordHandoff({
    version: "1.0",
    runId,
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-a",
    summary: "Grounding reported",
    claims: [{ claim: "margin is inside noise", status: "inferred", confidence: "low", evidenceRefs: ["e1"] }],
    evidence: [],
    artifacts: [],
    decisions: [],
    risks: [],
    confidence: "low",
    requestedTransition: "advance",
    unresolved: ["pricing model", "brand assets"],
    ...overrides
  });
  return manager;
}

test("--force does not suppress the Handoff audit", async () => {
  const manager = await runWithGroundingHandoff("create-test-004");
  const advanced = await manager.advance("create-test-004", { force: true });
  assert.equal(advanced.blockers.length, 3);
  assert.ok(advanced.blockers.includes("unresolved[grounding/strategist-a]: brand assets"));
});

test("a clean Handoff produces no blocker and no notice", async () => {
  const manager = await runWithGroundingHandoff("create-test-005", {
    claims: [{ claim: "margin is outside noise", status: "inferred", confidence: "medium", evidenceRefs: ["e1"] }],
    confidence: "high",
    unresolved: []
  });
  const advanced = await manager.advance("create-test-005");
  assert.deepEqual(advanced.blockers, []);
  const audit = await manager.auditRun("create-test-005");
  assert.equal(audit.handoffsRead, 1);
  assert.deepEqual(audit.blockers, []);
  assert.deepEqual(audit.notices, []);
});

test("auditing and advancing twice does not duplicate declared blockers", async () => {
  const manager = await runWithGroundingHandoff("create-test-006");
  const first = await manager.auditRun("create-test-006");
  assert.equal(first.blockers.length, 3);
  const second = await manager.auditRun("create-test-006");
  assert.deepEqual(second.blockers, first.blockers);
  assert.deepEqual(second.notices, first.notices);

  await manager.advance("create-test-006", { force: true });
  const afterTwoAdvances = await manager.auditRun("create-test-006");
  assert.equal(afterTwoAdvances.blockers.length, first.blockers.length);
});

// --- Authority separation: approval requires two parties -------------------------------------
//
// The `overrides` type is deliberately loose. These fixtures construct shapes the DecisionRecord
// union forbids at compile time (a `proposed` Decision carrying `approvedBy`, an `approved` one
// carrying none), because what is under test is the runtime guard. A legitimately-typed caller
// cannot express vectors 1-4 at all; the single `as DecisionRecord` says so honestly.
function approvedDecision(overrides: Record<string, unknown> = {}): DecisionRecord {
  return {
    id: "d-canonical",
    scope: "project",
    status: "approved",
    choice: "Adopt Direction B",
    rationale: ["won the tournament"],
    alternatives: ["Direction A"],
    evidence: [".createive/runs/approval-run-001/reports/visual-review.json"],
    risks: [],
    revisitWhen: [],
    approvedBy: "critic-a",
    approvedAt: "2026-08-22T10:00:00.000Z",
    ...overrides
  } as DecisionRecord;
}

function handoffFixture(overrides: Partial<SpecialistHandoff> = {}): SpecialistHandoff {
  return {
    version: "1.0",
    runId: "approval-run-001",
    phase: "lighthouse-build",
    role: "builder",
    agentId: "builder-a",
    summary: "Lighthouse surface built",
    // Every gate-declaring phase requires an evidence-bearing claim, so the shared fixture carries
    // one. These tests are about authority separation; an unsupported claim would fail earlier.
    claims: [{ claim: "The surface renders and basic health passes", status: "observed", confidence: "medium", evidenceRefs: [".createive/runs/approval-run-001/reports/build-health.json"] }],
    evidence: [".createive/runs/approval-run-001/reports/build-health.json"],
    artifacts: [],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: [],
    ...overrides
  };
}

test("rejects a specialist Handoff that self-approves a Decision", () => {
  assert.throws(
    () => validateHandoff(handoffFixture({ decisions: [approvedDecision({ approvedBy: "builder-a" })] })),
    /may not submit Decision .* with status approved/
  );
});

test("rejects a specialist Handoff that self-locks a Decision", () => {
  assert.throws(
    () => validateHandoff(handoffFixture({ decisions: [approvedDecision({ status: "locked", approvedBy: "builder-a" })] })),
    /may not submit Decision .* with status locked/
  );
});

test("rejects an approved Decision with no approvedBy", () => {
  assert.throws(
    () => validateHandoff(handoffFixture({
      role: "memory-curator",
      agentId: "curator-a",
      phase: "promotion",
      decisions: [approvedDecision({ approvedBy: undefined, approvedAt: undefined })]
    })),
    /without naming approvedBy/
  );
});

test("rejects a Memory Curator approving its own agentId", () => {
  assert.throws(
    () => validateHandoff(handoffFixture({
      role: "memory-curator",
      agentId: "curator-a",
      phase: "promotion",
      decisions: [approvedDecision({ approvedBy: "curator-a" })]
    })),
    /is self-approved by curator-a/
  );
});

test("rejects a specialist Handoff that self-approves an Artifact", () => {
  assert.throws(
    () => validateHandoff(handoffFixture({
      artifacts: [{
        id: "surface",
        kind: "Surface",
        path: ".createive/runs/approval-run-001/artifacts/surface.html",
        status: "approved",
        producerRole: "builder",
        agentId: "builder-a",
        runId: "approval-run-001",
        phase: "lighthouse-build",
        createdAt: "2026-08-22T10:00:00.000Z",
        sourceRefs: []
      }]
    })),
    /may not submit Artifact .* with status approved/
  );
});

test("accepts a specialist proposing a Decision", () => {
  validateHandoff(handoffFixture({
    decisions: [approvedDecision({ id: "d-direction", status: "proposed", approvedBy: undefined, approvedAt: undefined })]
  }));
});

// A longer CREATE workflow: the approval path needs a completed specialist phase distinct from
// both the producing phase and the phase in flight. The shared `registry()` factory cannot grow
// to fit — the existing "requires a specialist Handoff before advancing" test asserts that
// leaving `grounding` completes the Run, which holds only while `grounding` is terminal.
const approvalPhases = {
  CREATE: [
    { id: "intake", role: "coordinator", kit: null, purpose: "route", inputs: ["request"], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" },
    { id: "grounding", role: "product-strategist", kit: "grounding", purpose: "ground", inputs: ["request"], outputs: ["Product Brief"], gates: ["grounding-completeness"], parallelism: "single", exit: "complete" },
    { id: "deterministic-audit", role: "deterministic-auditor", kit: null, purpose: "audit", inputs: ["Surface"], outputs: ["Detector Report"], gates: [], parallelism: "single", exit: "reported" },
    { id: "visual-critique", role: "visual-critic", kit: null, purpose: "critique", inputs: ["Surface"], outputs: ["Visual Review"], gates: [], parallelism: "single", exit: "verdict" },
    { id: "promotion", role: "memory-curator", kit: null, purpose: "promote", inputs: ["approved Run Artifacts"], outputs: ["Promotion"], gates: [], parallelism: "none", exit: "promoted" }
  ],
  DOCUMENT: [{ id: "intake", role: "coordinator", kit: null, purpose: "document", inputs: ["request"], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  REDESIGN: [{ id: "intake", role: "coordinator", kit: null, purpose: "redesign", inputs: ["request"], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  EXPLORE: [{ id: "frame", role: "product-strategist", kit: "grounding", purpose: "frame", inputs: ["request"], outputs: ["Question"], gates: ["grounding-completeness"], parallelism: "single", exit: "valid" }],
  REFINE: [{ id: "scope", role: "coordinator", kit: null, purpose: "scope", inputs: ["request"], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }]
} satisfies Record<WorkflowId, WorkflowDefinition["phases"]>;

function approvalRegistry(): RegistryBundle {
  const base = registry();
  return {
    workflows: Object.fromEntries(Object.entries(approvalPhases).map(([id, workflowPhases]) => [id, { id, version: "test", purpose: id, phases: workflowPhases }])) as Record<WorkflowId, WorkflowDefinition>,
    roles: {
      ...base.roles,
      "deterministic-auditor": { id: "deterministic-auditor", purpose: "measure", modelRole: "auditor", primarySkill: "detectors", maySpawn: false, mayWrite: [], mustNot: ["author Directions"] },
      "visual-critic": { id: "visual-critic", purpose: "judge", modelRole: "critic", primarySkill: "critique", maySpawn: false, mayWrite: [], mustNot: ["create"] },
      "memory-curator": { id: "memory-curator", purpose: "promote", modelRole: "curator", primarySkill: "promotion", maySpawn: false, mayWrite: [".createive/project"], mustNot: ["critique"] }
    },
    kits: base.kits,
    gates: base.gates,
    handoffValidator: base.handoffValidator
  };
}

/** Drives an approval Run up to `visual-critique` with a producing and an attesting Handoff behind it. */
async function runReadyForApproval(runId: string, options: { producerAgentId?: string; attesterAgentId?: string; decisionId?: string } = {}) {
  const producerAgentId = options.producerAgentId ?? "strategist-a";
  const attesterAgentId = options.attesterAgentId ?? "auditor-a";
  const decisionId = options.decisionId ?? "d-direction";
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, approvalRegistry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId });
  await manager.advance(runId, { force: true });
  await manager.recordHandoff(handoffFixture({
    runId,
    phase: "grounding",
    role: "product-strategist",
    agentId: producerAgentId,
    decisions: [approvedDecision({ id: decisionId, status: "proposed", approvedBy: undefined, approvedAt: undefined })]
  }));
  await manager.advance(runId);
  await manager.recordHandoff(handoffFixture({ runId, phase: "deterministic-audit", role: "deterministic-auditor", agentId: attesterAgentId }));
  await manager.advance(runId);
  return { manager, workspace, producerAgentId, attesterAgentId, decisionId };
}

test("approves a proposed Decision when a distinct agent attests", async () => {
  const { manager, workspace, attesterAgentId } = await runReadyForApproval("approval-run-006");
  const result = await manager.approve("approval-run-006", {
    attestation: `deterministic-audit/${attesterAgentId}`,
    decisions: ["d-direction"]
  });
  assert.equal(result.approvedBy, attesterAgentId);
  assert.equal(result.status, "approved");
  assert.deepEqual(result.decisions, ["d-direction"]);

  const persisted = JSON.parse(await workspace.readText(".createive/runs/approval-run-006/decisions/d-direction.json"));
  assert.equal(persisted.status, "approved");
  assert.equal(persisted.approvedBy, attesterAgentId);
  assert.equal(persisted.approvedAt, result.approvedAt);
});

test("does not persist a Decision file when the Handoff is rejected", async () => {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, approvalRegistry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId: "approval-run-008" });
  await manager.advance("approval-run-008", { force: true });
  await assert.rejects(() => manager.recordHandoff(handoffFixture({
    runId: "approval-run-008",
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-a",
    decisions: [approvedDecision({ approvedBy: "strategist-a" })]
  })), ContractError);
  assert.equal(await workspace.exists(".createive/runs/approval-run-008/decisions/d-canonical.json"), false);
  assert.equal(await workspace.exists(".createive/runs/approval-run-008/handoffs/grounding/strategist-a.json"), false);
});

test("rejects an approval whose attestation has no persisted Handoff", async () => {
  const { manager } = await runReadyForApproval("approval-run-009");
  await assert.rejects(
    () => manager.approve("approval-run-009", { attestation: "deterministic-audit/ghost-a", decisions: ["d-direction"] }),
    /has no persisted Handoff/
  );
});

test("rejects an approval attested by the producing agent", async () => {
  const { manager } = await runReadyForApproval("approval-run-010", { producerAgentId: "shared-a", attesterAgentId: "shared-a" });
  await assert.rejects(
    () => manager.approve("approval-run-010", { attestation: "deterministic-audit/shared-a", decisions: ["d-direction"] }),
    /produced by shared-a and cannot be approved by the same agent/
  );
});

test("rejects an approval attested by the phase in flight", async () => {
  const { manager } = await runReadyForApproval("approval-run-011");
  await assert.rejects(
    () => manager.approve("approval-run-011", { attestation: "visual-critique/critic-a", decisions: ["d-direction"] }),
    /is the phase in flight/
  );
});

test("rejects a Handoff whose approvedBy never attested in the Run", async () => {
  const { manager } = await runReadyForApproval("approval-run-012");
  await manager.recordHandoff(handoffFixture({ runId: "approval-run-012", phase: "visual-critique", role: "visual-critic", agentId: "critic-a" }));
  await manager.advance("approval-run-012");
  await assert.rejects(() => manager.recordHandoff(handoffFixture({
    runId: "approval-run-012",
    phase: "promotion",
    role: "memory-curator",
    agentId: "curator-a",
    decisions: [approvedDecision({ id: "d-promoted", approvedBy: "critic-who-never-ran" })]
  })), /has no persisted Handoff in Run/);
});

test("locking a project Decision puts it on the Run locks", async () => {
  const { manager, attesterAgentId } = await runReadyForApproval("approval-run-013");
  const result = await manager.approve("approval-run-013", {
    attestation: `deterministic-audit/${attesterAgentId}`,
    decisions: ["d-direction"],
    lock: true
  });
  assert.equal(result.status, "locked");
  const run = await manager.getRun("approval-run-013");
  assert.deepEqual(run.lockedDecisions, ["d-direction"]);
  const packet = await manager.phasePacket("approval-run-013");
  assert.deepEqual(packet.locks, ["d-direction"]);
});
