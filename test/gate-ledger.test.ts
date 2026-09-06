import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DesignManager } from "../src/design-manager.js";
import type { GateResult, RegistryBundle, SpecialistHandoff, WorkflowDefinition, WorkflowId } from "../src/domain.js";
import { noopHandoffValidator } from "../src/handoff-schema.js";
import { MemoryWorkspace } from "../src/workspace.js";

const phases = {
  CREATE: [
    { id: "intake", role: "coordinator", kit: null, purpose: "route", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" },
    { id: "grounding", role: "product-strategist", kit: "grounding", purpose: "ground", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Product Brief"], gates: ["grounding-completeness"], parallelism: "single", exit: "complete" },
    { id: "handover", role: "coordinator", kit: null, purpose: "close", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Summary"], gates: [], parallelism: "none", exit: "valid" }
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
    kits: { grounding: { id: "grounding", primary: "chromarelay-grounding", supporting: [], roles: ["product-strategist"] } },
    gates: new Set(["grounding-completeness", "accessibility"]),
    handoffValidator: noopHandoffValidator()
  };
}

const EVIDENCE = "audit/grounding-completeness.json";

/**
 * A Run parked on `grounding` — the one phase that declares a Gate — with the evidence file the
 * ledger will be asked to point at already on disk.
 */
async function runOnGroundingPhase(runId: string): Promise<{ manager: DesignManager; workspace: MemoryWorkspace }> {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, registry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId });
  await manager.advance(runId, { force: true });
  await workspace.writeText(`.chromarelay/runs/${runId}/${EVIDENCE}`, "{}\n");
  await manager.recordHandoff(handoffFixture(runId));
  return { manager, workspace };
}

function handoffFixture(runId: string, overrides: Partial<SpecialistHandoff> = {}): SpecialistHandoff {
  return {
    version: "1.0",
    runId,
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-a",
    summary: "Grounding complete",
    claims: [{ claim: "Product truth is grounded", status: "inferred", confidence: "medium", evidenceRefs: [EVIDENCE] }],
    evidence: [EVIDENCE],
    artifacts: [],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: [],
    ...overrides
  };
}

function gateResult(runId: string, overrides: Partial<GateResult> = {}): GateResult {
  return {
    version: "1.0",
    runId,
    phase: "grounding",
    gate: "grounding-completeness",
    status: "pass",
    summary: "All required Product Brief fields are present",
    recordedBy: "strategist-a",
    recordedAt: "2026-08-24T10:00:00.000Z",
    evidenceRefs: [EVIDENCE],
    validUntil: "2099-01-01T00:00:00.000Z",
    ...overrides
  } as GateResult;
}

test("advance refuses to leave a phase that declares a Gate with no recorded result", async () => {
  const { manager } = await runOnGroundingPhase("gate-ledger-001");
  await assert.rejects(
    () => manager.advance("gate-ledger-001"),
    /Phase grounding declares gate grounding-completeness with no recorded result/
  );
});

test("advance leaves a phase that declares a Gate once a result is recorded", async () => {
  const { manager } = await runOnGroundingPhase("gate-ledger-002");
  await manager.recordGateResult(gateResult("gate-ledger-002"));
  const run = await manager.advance("gate-ledger-002");
  assert.equal(run.currentPhase, "handover");
});

test("advance leaves a phase that declares no Gate without any recorded result", async () => {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, registry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId: "gate-ledger-003" });
  const run = await manager.advance("gate-ledger-003", { force: true });
  assert.equal(run.currentPhase, "grounding");
});

test("a Gate result whose evidenceRefs name a file that does not exist is rejected", async () => {
  const { manager, workspace } = await runOnGroundingPhase("gate-ledger-004");
  await assert.rejects(
    () => manager.recordGateResult(gateResult("gate-ledger-004", { evidenceRefs: ["I ran axe, honest"] })),
    /Gate grounding-completeness names evidence "I ran axe, honest", which does not exist in Run gate-ledger-004/
  );
  assert.equal(await workspace.exists(".chromarelay/runs/gate-ledger-004/gate-results/grounding/grounding-completeness.json"), false);
});

test("a Gate result carrying no evidenceRefs is rejected", async () => {
  const { manager } = await runOnGroundingPhase("gate-ledger-005");
  await assert.rejects(
    () => manager.recordGateResult(gateResult("gate-ledger-005", { evidenceRefs: [] })),
    /Gate grounding-completeness requires at least one evidenceRef/
  );
});

test("a waived Gate approved by the agent that recorded it is rejected", async () => {
  const { manager } = await runOnGroundingPhase("gate-ledger-006");
  await assert.rejects(
    () => manager.recordGateResult(gateResult("gate-ledger-006", {
      status: "waived",
      waiver: { scope: "run", reason: "no browser available in this environment", approvedBy: "strategist-a", approvedAt: "2026-08-24T10:00:00.000Z", revisitWhen: "a browser is available" }
    })),
    /Gate grounding-completeness is self-waived by strategist-a/
  );
});

test("a waived Gate with project scope is rejected", async () => {
  const { manager } = await runOnGroundingPhase("gate-ledger-007");
  await assert.rejects(
    () => manager.recordGateResult(gateResult("gate-ledger-007", {
      status: "waived",
      waiver: { scope: "project", reason: "grounding is not needed here", approvedBy: "coordinator-a", approvedAt: "2026-08-24T10:00:00.000Z", revisitWhen: "never" }
    })),
    /Waiver of gate grounding-completeness declares scope project; a waiver is an exception, not policy/
  );
});

test("a waived Gate is recorded as a blocker and an event, and lets the phase advance", async () => {
  const { manager, workspace } = await runOnGroundingPhase("gate-ledger-008");
  await manager.recordGateResult(gateResult("gate-ledger-008", {
    status: "waived",
    waiver: { scope: "run", reason: "no browser available in this environment", approvedBy: "coordinator-a", approvedAt: "2026-08-24T10:00:00.000Z", revisitWhen: "a browser is available" }
  }));
  const run = await manager.advance("gate-ledger-008");
  assert.equal(run.currentPhase, "handover");
  assert.ok(run.blockers.some(blocker => blocker.includes("waived[grounding/grounding-completeness]")), `blockers were ${JSON.stringify(run.blockers)}`);
  const events = await workspace.readText(".chromarelay/runs/gate-ledger-008/events.jsonl");
  assert.match(events, /"type":"gate\.waived"/);
});

test("a Gate result whose validUntil has passed does not satisfy the phase", async () => {
  const { manager } = await runOnGroundingPhase("gate-ledger-009");
  await manager.recordGateResult(gateResult("gate-ledger-009", { validUntil: "2026-08-23T00:00:00.000Z" }));
  await assert.rejects(
    () => manager.advance("gate-ledger-009"),
    /Phase grounding declares gate grounding-completeness whose recorded result expired at 2026-08-23T00:00:00\.000Z/
  );
});

test("re-recording a Gate result refreshes it and unblocks the phase", async () => {
  const { manager } = await runOnGroundingPhase("gate-ledger-010");
  await manager.recordGateResult(gateResult("gate-ledger-010", { validUntil: "2026-08-23T00:00:00.000Z" }));
  await assert.rejects(() => manager.advance("gate-ledger-010"), /expired at/);
  await manager.recordGateResult(gateResult("gate-ledger-010", { recordedAt: "2026-08-24T12:00:00.000Z" }));
  const run = await manager.advance("gate-ledger-010");
  assert.equal(run.currentPhase, "handover");
});

test("a Gate result for a gate the phase does not declare is rejected", async () => {
  const { manager } = await runOnGroundingPhase("gate-ledger-011");
  await assert.rejects(
    () => manager.recordGateResult(gateResult("gate-ledger-011", { gate: "accessibility" })),
    /Phase grounding does not declare gate accessibility/
  );
});

test("a Gate result naming a gate outside the registry is rejected", async () => {
  const { manager } = await runOnGroundingPhase("gate-ledger-012");
  await assert.rejects(
    () => manager.recordGateResult(gateResult("gate-ledger-012", { gate: "vibes-check" })),
    /Unknown gate vibes-check/
  );
});

test("force records which Gates it bypassed and an outcome distinguishable from advanced", async () => {
  const { manager, workspace } = await runOnGroundingPhase("gate-ledger-013");
  const run = await manager.advance("gate-ledger-013", { force: true, reason: "shipping the demo before the review window closes" });
  const exited = run.phaseHistory.find(entry => entry.phase === "grounding" && entry.exitedAt);
  assert.equal(exited?.outcome, "forced-past-gates");
  assert.deepEqual(exited?.bypassedGates, ["grounding-completeness"]);
  assert.equal(exited?.reason, "shipping the demo before the review window closes");
  assert.ok(run.blockers.some(blocker => blocker.includes("forced[grounding]: bypassed gate grounding-completeness")), `blockers were ${JSON.stringify(run.blockers)}`);
  const events = await workspace.readText(".chromarelay/runs/gate-ledger-013/events.jsonl");
  assert.match(events, /"type":"phase\.forced"/);
});

test("force past a missing Gate requires a reason", async () => {
  const { manager } = await runOnGroundingPhase("gate-ledger-014");
  await assert.rejects(
    () => manager.advance("gate-ledger-014", { force: true }),
    /Forcing past gate grounding-completeness requires --reason/
  );
});

test("every Gate result field the code persists is declared in the Gate result schema", async () => {
  const { manager, workspace } = await runOnGroundingPhase("gate-ledger-016");
  await manager.recordGateResult(gateResult("gate-ledger-016", {
    status: "waived",
    waiver: { scope: "surface", reason: "no browser available", approvedBy: "coordinator-a", approvedAt: "2026-08-24T10:00:00.000Z", revisitWhen: "a browser is available", reusable: false }
  }));
  const persisted = JSON.parse(await workspace.readText(".chromarelay/runs/gate-ledger-016/gate-results/grounding/grounding-completeness.json"));
  const schema = JSON.parse(await readFile("framework/schemas/gate-result.schema.json", "utf8"));

  const declared = new Set(Object.keys(schema.properties));
  assert.deepEqual(Object.keys(persisted).filter(key => !declared.has(key)), []);
  for (const required of schema.required) assert.ok(required in persisted, `schema requires ${required}, the result omits it`);

  const declaredWaiver = new Set(Object.keys(schema.properties.waiver.properties));
  assert.deepEqual(Object.keys(persisted.waiver).filter(key => !declaredWaiver.has(key)), []);
});

test("force on a phase that declares no Gate needs no reason", async () => {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, registry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId: "gate-ledger-015" });
  const run = await manager.advance("gate-ledger-015", { force: true });
  const exited = run.phaseHistory.find(entry => entry.phase === "intake" && entry.exitedAt);
  assert.equal(exited?.outcome, "advanced");
});
