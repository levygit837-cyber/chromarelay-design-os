import assert from "node:assert/strict";
import test from "node:test";
import { DesignManager } from "../src/design-manager.js";
import type { RegistryBundle, SpecialistHandoff, WorkflowDefinition, WorkflowId } from "../src/domain.js";
import { ContractError } from "../src/domain.js";
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
    gates: new Set(["grounding-completeness"])
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
    claims: [],
    evidence: [],
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
