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
    { id: "intake", role: "coordinator", kit: null, purpose: "route", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" },
    { id: "grounding", role: "product-strategist", kit: "grounding", purpose: "ground", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Product Brief"], gates: ["grounding-completeness"], parallelism: "single", exit: "complete" }
  ],
  DOCUMENT: [{ id: "intake", role: "coordinator", kit: null, purpose: "document", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  REDESIGN: [{ id: "intake", role: "coordinator", kit: null, purpose: "redesign", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  EXPLORE: [{ id: "frame", role: "product-strategist", kit: "grounding", purpose: "frame", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Question"], gates: ["grounding-completeness"], parallelism: "single", exit: "valid" }],
  REFINE: [{ id: "scope", role: "coordinator", kit: null, purpose: "scope", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }]
} satisfies Record<WorkflowId, WorkflowDefinition["phases"]>;

function registry(): RegistryBundle {
  return {
    workflows: Object.fromEntries(Object.entries(phases).map(([id, workflowPhases]) => [id, { id, version: "test", purpose: id, phases: workflowPhases }])) as Record<WorkflowId, WorkflowDefinition>,
    roles: {
      coordinator: { id: "coordinator", purpose: "coordinate", modelRole: "coordinator", primarySkill: "manager", maySpawn: true, mayWrite: [], mustNot: ["critique"] },
      "product-strategist": { id: "product-strategist", purpose: "ground", modelRole: "product", primarySkill: "grounding", maySpawn: false, mayWrite: [], mustNot: ["implement"] }
    },
    kits: {
      grounding: { id: "grounding", primary: "chromarelay-grounding", supporting: [], roles: ["product-strategist"] }
    },
    gates: new Set(["grounding-completeness"]),
    handoffValidator: noopHandoffValidator()
  };
}

/**
 * Records the Gate `grounding` declares, so a test about something else can leave that phase. These
 * tests are about routing, audit, and authority; the Gate ledger has its own suite in
 * `gate-ledger.test.ts`, and satisfying it here keeps each test asserting one thing.
 */
async function passGroundingGate(manager: DesignManager, workspace: MemoryWorkspace, runId: string, phase = "grounding"): Promise<void> {
  await workspace.writeText(`.chromarelay/runs/${runId}/reports/grounding.json`, "{}\n");
  await manager.recordGateResult({
    version: "1.0",
    runId,
    phase,
    gate: "grounding-completeness",
    status: "pass",
    summary: "Every required Product Brief field is present",
    recordedBy: "strategist-a",
    recordedAt: "2026-08-24T10:00:00.000Z",
    evidenceRefs: ["reports/grounding.json"]
  });
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
  assert.equal(await workspace.exists(".chromarelay/runs/create-test-001/run.json"), true);
  assert.equal(await workspace.exists(".chromarelay/runs/create-test-001/phase-packets/intake.json"), true);
  assert.equal(JSON.parse(await workspace.readText(".chromarelay/active-run.json")).runId, "create-test-001");
});

test("starts a Run with the canonical project root available for Promotion", async () => {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, registry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId: "create-test-003" });
  assert.equal(await workspace.exists(".chromarelay/project"), true);
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
    claims: [{ claim: "Product truth is grounded", status: "inferred", confidence: "medium", evidenceRefs: [".chromarelay/runs/create-test-002/artifacts/PRODUCT.md"] }],
    evidence: [".chromarelay/runs/create-test-002/artifacts/PRODUCT.md"],
    artifacts: [{ id: "product-brief", kind: "Product Brief", path: ".chromarelay/runs/create-test-002/artifacts/PRODUCT.md", status: "proposed", producerRole: "product-strategist", agentId: "strategist-a", runId: "create-test-002", phase: "grounding", createdAt: new Date().toISOString(), sourceRefs: [] }],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: []
  };
  await manager.recordHandoff(handoff);
  await passGroundingGate(manager, workspace, "create-test-002");
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
  await passGroundingGate(manager, workspace, "create-test-003");

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
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, registry());
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
  await passGroundingGate(manager, workspace, runId);
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
    evidence: [".chromarelay/runs/approval-run-001/reports/visual-review.json"],
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
    claims: [{ claim: "The surface renders and basic health passes", status: "observed", confidence: "medium", evidenceRefs: [".chromarelay/runs/approval-run-001/reports/build-health.json"] }],
    evidence: [".chromarelay/runs/approval-run-001/reports/build-health.json"],
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
        path: ".chromarelay/runs/approval-run-001/artifacts/surface.html",
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
    { id: "intake", role: "coordinator", kit: null, purpose: "route", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" },
    { id: "grounding", role: "product-strategist", kit: "grounding", purpose: "ground", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Product Brief"], gates: ["grounding-completeness"], parallelism: "single", exit: "complete" },
    { id: "deterministic-audit", role: "deterministic-auditor", kit: null, purpose: "audit", inputs: [{ name: "Surface", source: "run", path: "artifacts/surface.html" }], outputs: ["Detector Report"], gates: [], parallelism: "single", exit: "reported" },
    { id: "visual-critique", role: "visual-critic", kit: null, purpose: "critique", inputs: [{ name: "Surface", source: "run", path: "artifacts/surface.html" }], outputs: ["Visual Review"], gates: [], parallelism: "single", exit: "verdict" },
    { id: "promotion", role: "memory-curator", kit: null, purpose: "promote", inputs: [{ name: "Run Contract", source: "run", path: "run.json" }], outputs: ["Promotion"], gates: [], parallelism: "none", exit: "promoted" }
  ],
  DOCUMENT: [{ id: "intake", role: "coordinator", kit: null, purpose: "document", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  REDESIGN: [{ id: "intake", role: "coordinator", kit: null, purpose: "redesign", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  EXPLORE: [{ id: "frame", role: "product-strategist", kit: "grounding", purpose: "frame", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Question"], gates: ["grounding-completeness"], parallelism: "single", exit: "valid" }],
  REFINE: [{ id: "scope", role: "coordinator", kit: null, purpose: "scope", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }]
} satisfies Record<WorkflowId, WorkflowDefinition["phases"]>;

function approvalRegistry(): RegistryBundle {
  const base = registry();
  return {
    workflows: Object.fromEntries(Object.entries(approvalPhases).map(([id, workflowPhases]) => [id, { id, version: "test", purpose: id, phases: workflowPhases }])) as Record<WorkflowId, WorkflowDefinition>,
    roles: {
      ...base.roles,
      "deterministic-auditor": { id: "deterministic-auditor", purpose: "measure", modelRole: "auditor", primarySkill: "detectors", maySpawn: false, mayWrite: [], mustNot: ["author Directions"] },
      "visual-critic": { id: "visual-critic", purpose: "judge", modelRole: "critic", primarySkill: "critique", maySpawn: false, mayWrite: [], mustNot: ["create"] },
      "memory-curator": { id: "memory-curator", purpose: "promote", modelRole: "curator", primarySkill: "promotion", maySpawn: false, mayWrite: [".chromarelay/project"], mustNot: ["critique"] }
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
  await passGroundingGate(manager, workspace, runId);
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

  const persisted = JSON.parse(await workspace.readText(".chromarelay/runs/approval-run-006/decisions/d-direction.json"));
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
  assert.equal(await workspace.exists(".chromarelay/runs/approval-run-008/decisions/d-canonical.json"), false);
  assert.equal(await workspace.exists(".chromarelay/runs/approval-run-008/handoffs/grounding/strategist-a.json"), false);
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

// --- Resolvable Phase Packet inputs ----------------------------------------------------------
//
// A specialist runs as a child session with no conversation history: an input named "Product Brief"
// is unactionable unless the Packet also carries its address. These fixtures declare inputs in the
// four sources the Packet resolves — canonical, framework, run, and runtime artifact.
const critiquePhases = {
  CREATE: [
    { id: "intake", role: "coordinator", kit: null, purpose: "route", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" },
    { id: "lighthouse-build", role: "builder", kit: null, purpose: "build", inputs: [{ name: "Constraints", source: "canonical", path: "CONSTRAINTS.md" }], outputs: ["Surface"], gates: [], parallelism: "single", exit: "renders" },
    {
      id: "visual-critique",
      role: "visual-critic",
      kit: null,
      purpose: "critique",
      inputs: [
        { name: "anonymous screenshots", source: "artifact", kind: "Screenshot Set" },
        { name: "DESIGN excerpt", source: "canonical", path: "DESIGN.md" },
        { name: "reference pack", source: "artifact", kind: "Reference Pack", required: false },
        { name: "Handoff schema", source: "framework", path: "schemas/handoff.schema.json" },
        { name: "request", source: "run", path: "request.json" }
      ],
      outputs: ["Visual Review"],
      gates: [],
      parallelism: "single",
      exit: "verdict"
    }
  ],
  DOCUMENT: [{ id: "intake", role: "coordinator", kit: null, purpose: "document", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  REDESIGN: [{ id: "intake", role: "coordinator", kit: null, purpose: "redesign", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  EXPLORE: [{ id: "frame", role: "product-strategist", kit: "grounding", purpose: "frame", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Question"], gates: ["grounding-completeness"], parallelism: "single", exit: "valid" }],
  REFINE: [{ id: "scope", role: "coordinator", kit: null, purpose: "scope", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }]
} satisfies Record<WorkflowId, WorkflowDefinition["phases"]>;

function registryWithCritique(): RegistryBundle {
  const base = registry();
  return {
    workflows: Object.fromEntries(Object.entries(critiquePhases).map(([id, workflowPhases]) => [id, { id, version: "test", purpose: id, phases: workflowPhases }])) as Record<WorkflowId, WorkflowDefinition>,
    roles: {
      ...base.roles,
      builder: { id: "builder", purpose: "build", modelRole: "builder", primarySkill: "build", maySpawn: false, mayWrite: [], mustNot: ["critique"] },
      "visual-critic": { id: "visual-critic", purpose: "judge", modelRole: "critic", primarySkill: "critique", maySpawn: false, mayWrite: [], mustNot: ["create"] }
    },
    kits: base.kits,
    gates: base.gates,
    handoffValidator: base.handoffValidator
  };
}

function screenshotHandoff(runId: string): SpecialistHandoff {
  return {
    version: "1.0",
    runId,
    phase: "lighthouse-build",
    role: "builder",
    agentId: "builder-a",
    summary: "Lighthouse surface built",
    claims: [],
    evidence: [],
    artifacts: [{
      id: "surface-render",
      kind: "Screenshot Set",
      path: `.chromarelay/runs/${runId}/evidence/desktop.png`,
      status: "proposed",
      producerRole: "builder",
      agentId: "builder-a",
      runId,
      phase: "lighthouse-build",
      createdAt: "2026-08-24T10:00:00.000Z",
      sourceRefs: []
    }],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: []
  };
}

test("resolves a previous phase Artifact input to the path the producer recorded", async () => {
  const workspace = new MemoryWorkspace({ ".chromarelay/project/DESIGN.md": "# DESIGN\n" });
  const manager = new DesignManager(workspace, registryWithCritique());
  await manager.start({ objective: "Improve the console", hasExistingDesign: false, surfaceClass: "OPERATE" }, { runId: "packet-run-001" });
  await manager.advance("packet-run-001", { force: true });
  await manager.recordHandoff(screenshotHandoff("packet-run-001"));
  await manager.advance("packet-run-001");

  const packet = await manager.phasePacket("packet-run-001");
  assert.equal(packet.phase, "visual-critique");

  const shots = packet.inputs.find(input => input.name === "anonymous screenshots");
  assert.equal(shots?.status, "resolved");
  assert.equal(shots?.path, ".chromarelay/runs/packet-run-001/evidence/desktop.png");
});

test("resolves a canonical contract input under the project root", async () => {
  const workspace = new MemoryWorkspace({ ".chromarelay/project/DESIGN.md": "# DESIGN\n" });
  const manager = new DesignManager(workspace, registryWithCritique());
  await manager.start({ objective: "Improve the console", hasExistingDesign: false }, { runId: "packet-run-002" });
  await manager.advance("packet-run-002", { force: true });
  await manager.recordHandoff(screenshotHandoff("packet-run-002"));
  await manager.advance("packet-run-002");

  const packet = await manager.phasePacket("packet-run-002");
  const design = packet.inputs.find(input => input.name === "DESIGN excerpt");
  assert.equal(design?.path, ".chromarelay/project/DESIGN.md");
  assert.equal(design?.status, "canonical");
});

test("reports a canonical contract that does not exist yet as absent instead of claiming it", async () => {
  const manager = new DesignManager(new MemoryWorkspace(), registryWithCritique());
  await manager.start({ objective: "Improve the console", hasExistingDesign: false }, { runId: "packet-run-003" });
  await manager.advance("packet-run-003", { force: true });
  await manager.recordHandoff(screenshotHandoff("packet-run-003"));
  await manager.advance("packet-run-003");

  const packet = await manager.phasePacket("packet-run-003");
  const design = packet.inputs.find(input => input.name === "DESIGN excerpt");
  assert.equal(design?.status, "absent-canonical");
  assert.equal(design?.path, ".chromarelay/project/DESIGN.md");
  assert.ok(packet.unresolvedInputs.includes("DESIGN excerpt"));
});

test("refuses to compile a Packet when a required Artifact input is missing", async () => {
  const manager = new DesignManager(new MemoryWorkspace(), registryWithCritique());
  await manager.start({ objective: "Improve the console", hasExistingDesign: false }, { runId: "packet-run-004" });
  await manager.advance("packet-run-004", { force: true });
  // Leaving lighthouse-build with --force and no Handoff means no Screenshot Set was ever recorded.
  await assert.rejects(() => manager.advance("packet-run-004", { force: true }), /anonymous screenshots/);
  // The refusal happens before the transition is persisted, so the Run keeps a compilable Packet.
  const run = await manager.getRun("packet-run-004");
  assert.equal(run.currentPhase, "lighthouse-build");
  const packet = await manager.phasePacket("packet-run-004");
  assert.equal(packet.phase, "lighthouse-build");
});

test("emits an optional Artifact input as absent instead of failing", async () => {
  const workspace = new MemoryWorkspace({ ".chromarelay/project/DESIGN.md": "# DESIGN\n" });
  const manager = new DesignManager(workspace, registryWithCritique());
  await manager.start({ objective: "Improve the console", hasExistingDesign: false }, { runId: "packet-run-005" });
  await manager.advance("packet-run-005", { force: true });
  await manager.recordHandoff(screenshotHandoff("packet-run-005"));
  await manager.advance("packet-run-005");

  const packet = await manager.phasePacket("packet-run-005");
  const optional = packet.inputs.find(input => input.name === "reference pack");
  assert.equal(optional?.status, "absent-optional");
  assert.equal(optional?.path, null);
  assert.ok(packet.unresolvedInputs.includes("reference pack"));
});

test("resolves framework and run inputs against their own roots", async () => {
  const workspace = new MemoryWorkspace({
    ".chromarelay/project/DESIGN.md": "# DESIGN\n",
    ".chromarelay/system/schemas/handoff.schema.json": "{}\n"
  });
  const manager = new DesignManager(workspace, registryWithCritique());
  await manager.start({ objective: "Improve the console", hasExistingDesign: false }, { runId: "packet-run-006" });
  await manager.advance("packet-run-006", { force: true });
  await manager.recordHandoff(screenshotHandoff("packet-run-006"));
  await manager.advance("packet-run-006");

  const packet = await manager.phasePacket("packet-run-006");
  const schema = packet.inputs.find(input => input.name === "Handoff schema");
  assert.equal(schema?.status, "framework");
  assert.equal(schema?.path, ".chromarelay/system/schemas/handoff.schema.json");

  const request = packet.inputs.find(input => input.name === "request");
  assert.equal(request?.status, "run");
  assert.equal(request?.path, ".chromarelay/runs/packet-run-006/request.json");
});

test("no Packet input is a concept name without an address", async () => {
  const workspace = new MemoryWorkspace({
    ".chromarelay/project/DESIGN.md": "# DESIGN\n",
    ".chromarelay/system/schemas/handoff.schema.json": "{}\n"
  });
  const manager = new DesignManager(workspace, registryWithCritique());
  await manager.start({ objective: "Improve the console", hasExistingDesign: false }, { runId: "packet-run-007" });
  await manager.advance("packet-run-007", { force: true });
  await manager.recordHandoff(screenshotHandoff("packet-run-007"));
  await manager.advance("packet-run-007");

  const packet = await manager.phasePacket("packet-run-007");
  for (const input of packet.inputs) {
    assert.ok("path" in input, `input ${input.name} has no path field`);
    if (input.status === "absent-optional") continue;
    assert.ok(input.path?.startsWith(".chromarelay/"), `input ${input.name} is not addressable`);
  }
  // Every declared input is accounted for: resolved or explicitly named as unresolved.
  assert.equal(packet.inputs.length, 5);
  assert.deepEqual(packet.unresolvedInputs, ["reference pack"]);

  // The Packet on disk carries the same resolved addresses the caller received.
  const persisted = JSON.parse(await workspace.readText(".chromarelay/runs/packet-run-007/phase-packets/visual-critique.json"));
  assert.deepEqual(persisted.inputs, packet.inputs);
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

// --- Non-linear transitions: advance() honours what the Handoff requested ----------------------
//
// A four-phase Workflow, because `return` is only expressible against a phase that exists behind
// the one in flight. `intake` is the Coordinator's, so it advances without a Handoff.
const transitionPhases = {
  CREATE: [
    { id: "intake", role: "coordinator", kit: null, purpose: "route", inputs: [], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" },
    { id: "grounding", role: "product-strategist", kit: "grounding", purpose: "ground", inputs: [], outputs: ["Product Brief"], gates: [], parallelism: "single", exit: "complete" },
    { id: "direction", role: "art-director", kit: null, purpose: "direct", inputs: [], outputs: ["Direction"], gates: [], parallelism: "independent", exit: "candidates exist" },
    { id: "critique", role: "visual-critic", kit: null, purpose: "judge", inputs: [], outputs: ["Verdict"], gates: [], parallelism: "independent", exit: "verdict recorded" }
  ],
  DOCUMENT: [{ id: "intake", role: "coordinator", kit: null, purpose: "document", inputs: [], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  REDESIGN: [{ id: "intake", role: "coordinator", kit: null, purpose: "redesign", inputs: [], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  EXPLORE: [{ id: "intake", role: "coordinator", kit: null, purpose: "explore", inputs: [], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  REFINE: [{ id: "intake", role: "coordinator", kit: null, purpose: "refine", inputs: [], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }]
} satisfies Record<WorkflowId, WorkflowDefinition["phases"]>;

function transitionRegistry(): RegistryBundle {
  const base = registry();
  return {
    ...base,
    workflows: Object.fromEntries(Object.entries(transitionPhases).map(([id, workflowPhases]) => [id, { id, version: "test", purpose: id, phases: workflowPhases }])) as unknown as Record<WorkflowId, WorkflowDefinition>,
    roles: {
      ...base.roles,
      "art-director": { id: "art-director", purpose: "direct", modelRole: "creative", primarySkill: "art-direction", maySpawn: false, mayWrite: [], mustNot: ["critique own work"] },
      "visual-critic": { id: "visual-critic", purpose: "judge", modelRole: "critic", primarySkill: "critique", maySpawn: false, mayWrite: [], mustNot: ["create"] }
    }
  };
}

function transitionHandoff(runId: string, phase: string, role: string, overrides: Partial<SpecialistHandoff> = {}): SpecialistHandoff {
  return {
    version: "1.0",
    runId,
    phase,
    role,
    agentId: `${role}-a`,
    summary: `${phase} reported`,
    claims: [],
    evidence: [],
    artifacts: [],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: [],
    ...overrides
  };
}

/** A Run parked in `direction` with `grounding` behind it, both phases already attested. */
async function runAtDirection(runId: string): Promise<{ manager: DesignManager; workspace: MemoryWorkspace }> {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, transitionRegistry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId });
  await manager.advance(runId, { force: true });
  await manager.recordHandoff(transitionHandoff(runId, "grounding", "product-strategist"));
  await manager.advance(runId);
  return { manager, workspace };
}

async function events(workspace: MemoryWorkspace, runId: string): Promise<Record<string, unknown>[]> {
  const raw = await workspace.readText(`.chromarelay/runs/${runId}/events.jsonl`);
  return raw.split("\n").filter(line => line.trim().length > 0).map(line => JSON.parse(line) as Record<string, unknown>);
}

test("a Handoff requesting return sends the Run back to the phase it named", async () => {
  const { manager } = await runAtDirection("transition-run-001");
  await manager.recordHandoff(transitionHandoff("transition-run-001", "direction", "art-director", {
    requestedTransition: "return",
    requestedTarget: "grounding"
  }));
  const run = await manager.advance("transition-run-001");
  assert.equal(run.currentPhase, "grounding");
  assert.equal(run.status, "active");
  assert.equal(run.phaseHistory.filter(entry => entry.phase === "grounding").length, 2);
});

test("a return naming a phase outside the Workflow is refused by name", async () => {
  const { manager } = await runAtDirection("transition-run-002");
  await manager.recordHandoff(transitionHandoff("transition-run-002", "direction", "art-director", {
    requestedTransition: "return",
    requestedTarget: "canonization"
  }));
  await assert.rejects(() => manager.advance("transition-run-002"), /canonization/);
  assert.equal((await manager.getRun("transition-run-002")).currentPhase, "direction");
});

test("a return naming a phase ahead of the one in flight is refused", async () => {
  const { manager } = await runAtDirection("transition-run-003");
  await manager.recordHandoff(transitionHandoff("transition-run-003", "direction", "art-director", {
    requestedTransition: "return",
    requestedTarget: "critique"
  }));
  await assert.rejects(() => manager.advance("transition-run-003"), /critique/);
});

test("a Handoff requesting escalate parks the Run for a human", async () => {
  const { manager } = await runAtDirection("transition-run-004");
  await manager.recordHandoff(transitionHandoff("transition-run-004", "direction", "art-director", {
    requestedTransition: "escalate"
  }));
  const run = await manager.advance("transition-run-004");
  assert.equal(run.status, "awaiting-human");
  assert.equal(run.currentPhase, "direction");
});

test("a Handoff requesting stop cancels the Run", async () => {
  const { manager } = await runAtDirection("transition-run-005");
  await manager.recordHandoff(transitionHandoff("transition-run-005", "direction", "art-director", {
    requestedTransition: "stop"
  }));
  const run = await manager.advance("transition-run-005");
  assert.equal(run.status, "cancelled");
});

test("two returns to the same phase count as two repair cycles", async () => {
  const { manager, workspace } = await runAtDirection("transition-run-006");
  for (let cycle = 0; cycle < 2; cycle += 1) {
    await manager.recordHandoff(transitionHandoff("transition-run-006", "direction", "art-director", {
      requestedTransition: "return",
      requestedTarget: "grounding"
    }));
    await manager.advance("transition-run-006");
    await manager.recordHandoff(transitionHandoff("transition-run-006", "grounding", "product-strategist"));
    await manager.advance("transition-run-006");
  }
  const run = await manager.getRun("transition-run-006");
  assert.equal(run.currentPhase, "direction");
  assert.equal(run.phaseHistory.filter(entry => entry.phase === "grounding").length, 3);
  const returned = (await events(workspace, "transition-run-006")).filter(event => event["type"] === "phase.returned");
  assert.deepEqual(returned.map(event => event["repairCycle"]), [1, 2]);
});

test("the event log records the transition requested alongside the one effected", async () => {
  const { manager, workspace } = await runAtDirection("transition-run-007");
  await manager.recordHandoff(transitionHandoff("transition-run-007", "direction", "art-director", {
    requestedTransition: "return",
    requestedTarget: "grounding"
  }));
  await manager.advance("transition-run-007", { transition: "advance" });
  const log = await events(workspace, "transition-run-007");
  const transitioned = log.filter(event => typeof event["requested"] === "string");
  const divergent = transitioned.filter(event => event["requested"] !== event["effected"]);
  assert.equal(divergent.length, 1);
  assert.equal(divergent[0]?.["requested"], "return");
  assert.equal(divergent[0]?.["effected"], "advance");
  assert.equal((await manager.getRun("transition-run-007")).currentPhase, "critique");
});

test("branch is recorded as requested and effected as an advance", async () => {
  const { manager, workspace } = await runAtDirection("transition-run-008");
  await manager.recordHandoff(transitionHandoff("transition-run-008", "direction", "art-director", {
    requestedTransition: "branch"
  }));
  const run = await manager.advance("transition-run-008");
  assert.equal(run.currentPhase, "critique");
  const advanced = (await events(workspace, "transition-run-008")).find(event => event["to"] === "critique");
  assert.equal(advanced?.["requested"], "branch");
  assert.equal(advanced?.["effected"], "advance");
});

test("the gravest transition among parallel Handoffs is the one honoured", async () => {
  const { manager } = await runAtDirection("transition-run-009");
  await manager.recordHandoff(transitionHandoff("transition-run-009", "direction", "art-director", { agentId: "director-a" }));
  await manager.recordHandoff(transitionHandoff("transition-run-009", "direction", "art-director", {
    agentId: "director-b",
    requestedTransition: "return",
    requestedTarget: "grounding"
  }));
  const run = await manager.advance("transition-run-009");
  assert.equal(run.currentPhase, "grounding");
});

test("a return with no target names the field it is missing", async () => {
  const { manager } = await runAtDirection("transition-run-010");
  await manager.recordHandoff(transitionHandoff("transition-run-010", "direction", "art-director", {
    requestedTransition: "return"
  }));
  await assert.rejects(() => manager.advance("transition-run-010"), /requestedTarget/);
});

// --- Resource observability: telemetry on Handoffs aggregates per Phase and per Role ------------
//
// What is under test is the read path and the degrade-to-unknown rule: an aggregate is present only
// when some Handoff reported that resource, and nothing here can block advance() because nothing
// here is consulted by it.

async function runWithTelemetryHandoff(runId: string, telemetry: SpecialistHandoff["telemetry"]): Promise<DesignManager> {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, registry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId });
  await manager.advance(runId, { force: true });
  await manager.recordHandoff({
    version: "1.0",
    runId,
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-a",
    summary: "Grounding reported",
    claims: [{ claim: "margin is outside noise", status: "inferred", confidence: "medium", evidenceRefs: ["e1"] }],
    evidence: [],
    artifacts: [],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: [],
    ...(telemetry ? { telemetry } : {})
  });
  return manager;
}

test("aggregates tool calls, tokens, and skill use per Phase and per Role", async () => {
  const manager = await runWithTelemetryHandoff("resources-run-001", {
    tools: { read: 4, grep: 2 },
    inputTokens: 1200,
    outputTokens: 300
  });
  await manager.recordHandoff({
    version: "1.0",
    runId: "resources-run-001",
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-b",
    summary: "Grounding corroborated",
    claims: [{ claim: "corroborated independently", status: "observed", confidence: "medium", evidenceRefs: ["e2"] }],
    evidence: [],
    artifacts: [],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: [],
    skill: { primary: "chromarelay-grounding", supporting: ["chromarelay-research"] },
    telemetry: { tools: { read: 1 }, inputTokens: 500, outputTokens: 100 }
  });

  const audit = await manager.auditRun("resources-run-001");
  const phase = audit.resources.byPhase["grounding"];
  assert.ok(phase);
  assert.equal(phase.role, "product-strategist");
  assert.deepEqual(phase.tools, { read: 5, grep: 2 });
  assert.deepEqual(phase.tokens, { input: 1700, output: 400 });
  // Per-agent attribution survives the aggregation, so a reader can see who consumed what.
  assert.deepEqual(phase.agents?.["strategist-a"]?.tools, { read: 4, grep: 2 });
  assert.deepEqual(phase.agents?.["strategist-a"]?.tokens, { input: 1200, output: 300 });
  assert.deepEqual(phase.agents?.["strategist-b"]?.tools, { read: 1 });
  assert.deepEqual(phase.agents?.["strategist-b"]?.skill, { primary: "chromarelay-grounding", supporting: ["chromarelay-research"] });
  // The kit offered one primary plus its supporting references; two agents, one reporting, so counts
  // are per reporting agent in the offered shape.
  assert.deepEqual(phase.skill, {
    offered: { primary: "chromarelay-grounding", supporting: [] },
    used: { primary: { "chromarelay-grounding": 1 }, supporting: { "chromarelay-research": 1 } }
  });

  const role = audit.resources.byRole["product-strategist"];
  assert.ok(role);
  assert.deepEqual(role.tools, { read: 5, grep: 2 });
  assert.deepEqual(role.tokens, { input: 1700, output: 400 });
  assert.deepEqual(role.skills, { primary: { "chromarelay-grounding": 1 }, supporting: { "chromarelay-research": 1 } });
});

test("a phase whose Handoffs carry no telemetry aggregates nothing rather than zeros", async () => {
  const manager = await runWithTelemetryHandoff("resources-run-002", undefined);
  const audit = await manager.auditRun("resources-run-002");
  const phase = audit.resources.byPhase["grounding"];
  assert.ok(phase);
  assert.equal(phase.role, "product-strategist");
  assert.equal(phase.tools, undefined);
  assert.equal(phase.tokens, undefined);
  assert.equal(phase.skill, undefined);
  const role = audit.resources.byRole["product-strategist"];
  assert.ok(role);
  assert.equal(role.tools, undefined);
  assert.deepEqual(role.skills, undefined);
});

test("a partially reported Handoff aggregates what it reported and leaves the rest unknown", async () => {
  const manager = await runWithTelemetryHandoff("resources-run-003", { tools: { write: 3 } });
  const audit = await manager.auditRun("resources-run-003");
  const phase = audit.resources.byPhase["grounding"];
  assert.deepEqual(phase?.tools, { write: 3 });
  assert.equal(phase?.tokens, undefined);
});

test("rejects telemetry with a non-positive tool count", () => {
  const handoff: SpecialistHandoff = {
    version: "1.0",
    runId: "resources-run-004",
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-a",
    summary: "Grounding reported",
    claims: [{ claim: "c", status: "inferred", confidence: "medium", evidenceRefs: ["e1"] }],
    evidence: [],
    artifacts: [],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: [],
    telemetry: { tools: { read: 0 } }
  };
  assert.throws(() => validateHandoff(handoff), /tool count for read must be a positive integer/);
});

test("rejects telemetry with a negative token total", () => {
  const handoff: SpecialistHandoff = {
    version: "1.0",
    runId: "resources-run-005",
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-a",
    summary: "Grounding reported",
    claims: [{ claim: "c", status: "inferred", confidence: "medium", evidenceRefs: ["e1"] }],
    evidence: [],
    artifacts: [],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: [],
    telemetry: { inputTokens: -1 }
  };
  assert.throws(() => validateHandoff(handoff), /inputTokens must be a non-negative integer/);
});

test("missing telemetry never blocks advancing a phase", async () => {
  // passGroundingGate needs the workspace, so this helper builds the run inline instead.
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, registry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId: "resources-run-006" });
  await manager.advance("resources-run-006", { force: true });
  await manager.recordHandoff({
    version: "1.0",
    runId: "resources-run-006",
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-a",
    summary: "Grounding reported",
    claims: [{ claim: "margin is outside noise", status: "inferred", confidence: "medium", evidenceRefs: ["e1"] }],
    evidence: [],
    artifacts: [],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: []
  });
  await passGroundingGate(manager, workspace, "resources-run-006");
  // advance() consults Handoffs and Gates only; with telemetry absent everywhere the phase still
  // leaves and the Run completes.
  const completed = await manager.advance("resources-run-006");
  assert.equal(completed.status, "completed");
});
