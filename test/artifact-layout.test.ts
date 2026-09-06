import assert from "node:assert/strict";
import test from "node:test";
import { ARTIFACT_KIND_TO_DIR, ARTIFACT_LAYOUT_DIRS, DesignManager } from "../src/design-manager.js";
import type { RegistryBundle, SpecialistHandoff, WorkflowDefinition, WorkflowId } from "../src/domain.js";
import { noopHandoffValidator } from "../src/handoff-schema.js";
import { MemoryWorkspace } from "../src/workspace.js";

// Typed Run Artifact layout (issue #18): five folders under the Run root, one kind-to-folder
// registry, prefix plus file-existence validation on recordHandoff, and one flat-to-typed
// migration. Prototype boot itself (README plus install/dev) is owned by the evaluation
// orchestration contract; this suite asserts the layout rule only.

const phases = {
  CREATE: [
    { id: "intake", role: "coordinator", kit: null, purpose: "route", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" },
    {
      id: "grounding",
      role: "product-strategist",
      kit: "grounding",
      purpose: "ground",
      inputs: [{ name: "request", source: "run", path: "request.json" }],
      outputs: ["Product Brief"],
      gates: [],
      parallelism: "single",
      exit: "complete"
    },
    {
      id: "critique",
      role: "visual-critic",
      kit: null,
      purpose: "judge",
      inputs: [{ name: "Product Brief", source: "artifact", kind: "Product Brief" }],
      outputs: ["Visual Review"],
      gates: [],
      parallelism: "single",
      exit: "verdict"
    }
  ],
  DOCUMENT: [{ id: "intake", role: "coordinator", kit: null, purpose: "document", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  REDESIGN: [{ id: "intake", role: "coordinator", kit: null, purpose: "redesign", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }],
  EXPLORE: [{ id: "frame", role: "product-strategist", kit: "grounding", purpose: "frame", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Question"], gates: [], parallelism: "none", exit: "valid" }],
  REFINE: [{ id: "scope", role: "coordinator", kit: null, purpose: "scope", inputs: [{ name: "request", source: "run", path: "request.json" }], outputs: ["Run Contract"], gates: [], parallelism: "none", exit: "valid" }]
} satisfies Record<WorkflowId, WorkflowDefinition["phases"]>;

function registry(): RegistryBundle {
  return {
    workflows: Object.fromEntries(Object.entries(phases).map(([id, workflowPhases]) => [id, { id, version: "test", purpose: id, phases: workflowPhases }])) as unknown as Record<WorkflowId, WorkflowDefinition>,
    roles: {
      coordinator: { id: "coordinator", purpose: "coordinate", modelRole: "coordinator", primarySkill: "manager", maySpawn: true, mayWrite: [], mustNot: ["critique"] },
      "product-strategist": { id: "product-strategist", purpose: "ground", modelRole: "product", primarySkill: "grounding", maySpawn: false, mayWrite: [], mustNot: ["implement"] },
      "visual-critic": { id: "visual-critic", purpose: "judge", modelRole: "critic", primarySkill: "critique", maySpawn: false, mayWrite: [], mustNot: ["create"] }
    },
    kits: { grounding: { id: "grounding", primary: "chromarelay-grounding", supporting: [], roles: ["product-strategist"] } },
    gates: new Set<string>(),
    handoffValidator: noopHandoffValidator()
  };
}

function briefHandoff(runId: string, artifactPath: string): SpecialistHandoff {
  return {
    version: "1.0",
    runId,
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-a",
    summary: "Grounding complete",
    claims: [],
    evidence: [],
    artifacts: [{
      id: "product-brief",
      kind: "Product Brief",
      path: artifactPath,
      status: "proposed",
      producerRole: "product-strategist",
      agentId: "strategist-a",
      runId,
      phase: "grounding",
      createdAt: "2026-09-06T10:00:00.000Z",
      sourceRefs: []
    }],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: []
  };
}

async function runOnGrounding(runId: string, seed: Record<string, string> = {}): Promise<{ manager: DesignManager; workspace: MemoryWorkspace }> {
  const workspace = new MemoryWorkspace(seed);
  const manager = new DesignManager(workspace, registry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId });
  await manager.advance(runId, { force: true });
  return { manager, workspace };
}

test("start creates the five typed layout folders under the Run root", async () => {
  const { workspace } = await runOnGrounding("layout-run-001");
  for (const dir of ARTIFACT_LAYOUT_DIRS) {
    assert.equal(await workspace.exists(`.chromarelay/runs/layout-run-001/${dir}`), true);
  }
});

test("the kind registry covers every typed folder the layout promises", () => {
  assert.deepEqual([...ARTIFACT_LAYOUT_DIRS].sort(), ["audit", "context", "directions", "prototype", "specimens"]);
  for (const dir of ARTIFACT_LAYOUT_DIRS) {
    assert.ok(Object.values(ARTIFACT_KIND_TO_DIR).includes(dir), `no kind maps to ${dir}`);
  }
  assert.equal(ARTIFACT_KIND_TO_DIR["visual specimens"], "specimens");
  assert.equal(ARTIFACT_KIND_TO_DIR["renderable surface"], "prototype");
  assert.equal(ARTIFACT_KIND_TO_DIR["direction candidates"], "directions");
  assert.equal(ARTIFACT_KIND_TO_DIR["product brief"], "context");
  assert.equal(ARTIFACT_KIND_TO_DIR["audit report"], "audit");
});

test("a Handoff path outside the typed layout is rejected", async () => {
  const { manager, workspace } = await runOnGrounding("layout-run-002");
  await workspace.writeText(".chromarelay/runs/layout-run-002/artifacts/PRODUCT.md", "# Product Brief\n");
  await assert.rejects(
    () => manager.recordHandoff(briefHandoff("layout-run-002", ".chromarelay/runs/layout-run-002/artifacts/PRODUCT.md")),
    /outside the typed layout/
  );
  assert.equal(await workspace.exists(".chromarelay/runs/layout-run-002/handoffs/grounding/strategist-a.json"), false);
});

test("a layout-conformant path with traversal escaping the Run is rejected", async () => {
  const { manager } = await runOnGrounding("layout-run-003");
  await assert.rejects(
    () => manager.recordHandoff(briefHandoff("layout-run-003", ".chromarelay/runs/layout-run-003/context/../../project/DESIGN.md")),
    /outside the typed layout/
  );
});

test("a layout-conformant path pointing at no file is rejected", async () => {
  const { manager } = await runOnGrounding("layout-run-004");
  await assert.rejects(
    () => manager.recordHandoff(briefHandoff("layout-run-004", ".chromarelay/runs/layout-run-004/context/PRODUCT.md")),
    /does not exist in Run layout-run-004/
  );
});

test("one migration moves flat Artifacts into the typed folder without rewriting content", async () => {
  // A pre-existing flat Run predates the layout: run.json points at artifacts/PRODUCT.md on disk.
  const { manager, workspace } = await runOnGrounding("layout-run-005");
  await workspace.writeText(".chromarelay/runs/layout-run-005/artifacts/PRODUCT.md", "# Product Brief\n");
  const stale = await manager.getRun("layout-run-005");
  stale.artifactRefs.push({
    id: "product-brief",
    kind: "Product Brief",
    path: ".chromarelay/runs/layout-run-005/artifacts/PRODUCT.md",
    status: "proposed",
    producerRole: "product-strategist",
    agentId: "strategist-a",
    runId: "layout-run-005",
    phase: "grounding",
    createdAt: "2026-09-06T10:00:00.000Z",
    sourceRefs: []
  });
  await workspace.writeText(".chromarelay/runs/layout-run-005/run.json", JSON.stringify({ ...JSON.parse(await workspace.readText(".chromarelay/runs/layout-run-005/run.json")), artifactRefs: stale.artifactRefs }));

  const moved = await manager.migrateArtifactsToTypedLayout("layout-run-005");
  assert.equal(moved.length, 1);
  assert.equal(moved[0]?.to, ".chromarelay/runs/layout-run-005/context/PRODUCT.md");
  assert.equal(await workspace.readText(".chromarelay/runs/layout-run-005/context/PRODUCT.md"), "# Product Brief\n");
  const migrated = await manager.getRun("layout-run-005");
  assert.equal(migrated.artifactRefs[0]?.path, ".chromarelay/runs/layout-run-005/context/PRODUCT.md");
});

test("resolveInput still matches by kind after the migration moved the file", async () => {
  const { manager, workspace } = await runOnGrounding("layout-run-006");
  await workspace.writeText(".chromarelay/runs/layout-run-006/artifacts/PRODUCT.md", "# Product Brief\n");
  const stale = await manager.getRun("layout-run-006");
  stale.artifactRefs.push({
    id: "product-brief",
    kind: "Product Brief",
    path: ".chromarelay/runs/layout-run-006/artifacts/PRODUCT.md",
    status: "proposed",
    producerRole: "product-strategist",
    agentId: "strategist-a",
    runId: "layout-run-006",
    phase: "grounding",
    createdAt: "2026-09-06T10:00:00.000Z",
    sourceRefs: []
  });
  await workspace.writeText(".chromarelay/runs/layout-run-006/run.json", JSON.stringify({ ...JSON.parse(await workspace.readText(".chromarelay/runs/layout-run-006/run.json")), artifactRefs: stale.artifactRefs }));
  await manager.migrateArtifactsToTypedLayout("layout-run-006");
  await manager.recordHandoff({ ...briefHandoff("layout-run-006", ".chromarelay/runs/layout-run-006/context/PRODUCT.md"), agentId: "strategist-b" });

  await manager.advance("layout-run-006");
  const packet = await manager.phasePacket("layout-run-006");
  assert.equal(packet.phase, "critique");
  const brief = packet.inputs.find(input => input.name === "Product Brief");
  assert.equal(brief?.status, "resolved");
  assert.equal(brief?.path, ".chromarelay/runs/layout-run-006/context/PRODUCT.md");
});
