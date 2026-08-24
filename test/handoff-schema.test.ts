import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { DesignManager } from "../src/design-manager.js";
import type { RegistryBundle, SpecialistHandoff, WorkflowDefinition, WorkflowId } from "../src/domain.js";
import { loadHandoffValidator } from "../src/handoff-schema.js";
import { loadRegistryBundle } from "../src/registry.js";
import { MemoryWorkspace } from "../src/workspace.js";

/** The repo's own framework root, resolved from this file rather than from cwd. */
const systemRoot = fileURLToPath(new URL("../../framework", import.meta.url));

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

/** A registry whose Handoff validator is the real compiled framework schema. */
async function conformanceRegistry(): Promise<RegistryBundle> {
  return {
    workflows: Object.fromEntries(Object.entries(phases).map(([id, workflowPhases]) => [id, { id, version: "test", purpose: id, phases: workflowPhases }])) as Record<WorkflowId, WorkflowDefinition>,
    roles: {
      coordinator: { id: "coordinator", purpose: "coordinate", modelRole: "coordinator", primarySkill: "manager", maySpawn: true, mayWrite: [], mustNot: ["critique"] },
      "product-strategist": { id: "product-strategist", purpose: "ground", modelRole: "product", primarySkill: "grounding", maySpawn: false, mayWrite: [], mustNot: ["implement"] }
    },
    kits: { grounding: { id: "grounding", primary: "createive-grounding", supporting: [], roles: ["product-strategist"] } },
    gates: new Set(["grounding-completeness"]),
    handoffValidator: await loadHandoffValidator(systemRoot)
  };
}

/** A Run sitting on `grounding`, the phase that declares `grounding-completeness`. */
async function runOnGroundingPhase(runId: string): Promise<{ manager: DesignManager; workspace: MemoryWorkspace }> {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, await conformanceRegistry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId });
  await manager.advance(runId, { force: true });
  return { manager, workspace };
}

/** An honest, schema-conformant, gate-satisfying Handoff for `grounding`. */
function honestHandoff(runId: string, overrides: Record<string, unknown> = {}): SpecialistHandoff {
  return {
    version: "1.0",
    runId,
    phase: "grounding",
    role: "product-strategist",
    agentId: "strategist-a",
    summary: "Grounding complete",
    claims: [{ claim: "The product truth is grounded in the request", status: "inferred", confidence: "medium", evidenceRefs: [`.createive/runs/${runId}/artifacts/PRODUCT.md`] }],
    evidence: [`.createive/runs/${runId}/artifacts/PRODUCT.md`],
    artifacts: [],
    decisions: [],
    risks: [],
    confidence: "high",
    requestedTransition: "advance",
    unresolved: [],
    ...overrides
  } as SpecialistHandoff;
}

test("Handoff schema accepts an honest Handoff on a gate-declaring phase", async () => {
  const { manager, workspace } = await runOnGroundingPhase("schema-run-001");
  await manager.recordHandoff(honestHandoff("schema-run-001"));
  assert.equal(await workspace.exists(".createive/runs/schema-run-001/handoffs/grounding/strategist-a.json"), true);
});

test("Handoff schema rejects an undeclared top-level field and names it", async () => {
  const { manager, workspace } = await runOnGroundingPhase("schema-run-002");
  await assert.rejects(
    () => manager.recordHandoff(honestHandoff("schema-run-002", { rubric: "createive-visual-quality" })),
    /handoff\.schema\.json[\s\S]*additional propert[\s\S]*rubric/i
  );
  assert.equal(await workspace.exists(".createive/runs/schema-run-002/handoffs/grounding/strategist-a.json"), false);
});

test("Handoff schema rejects a Handoff missing a required field", async () => {
  const { manager } = await runOnGroundingPhase("schema-run-003");
  const handoff = honestHandoff("schema-run-003");
  delete (handoff as unknown as Record<string, unknown>)["unresolved"];
  await assert.rejects(() => manager.recordHandoff(handoff), /required property 'unresolved'/);
});

test("Handoff schema rejects an out-of-enum confidence", async () => {
  const { manager } = await runOnGroundingPhase("schema-run-004");
  await assert.rejects(
    () => manager.recordHandoff(honestHandoff("schema-run-004", { confidence: "certain" })),
    /\/confidence must be equal to one of the allowed values/
  );
});

test("Handoff schema rejects claims that are not an array", async () => {
  const { manager } = await runOnGroundingPhase("schema-run-005");
  await assert.rejects(
    () => manager.recordHandoff(honestHandoff("schema-run-005", { claims: "none" })),
    /\/claims must be array/
  );
});

test("Handoff schema rejects an artifact createdAt that is not a date-time", async () => {
  const { manager } = await runOnGroundingPhase("schema-run-006");
  const artifact = {
    id: "product-brief",
    kind: "Product Brief",
    path: ".createive/runs/schema-run-006/artifacts/PRODUCT.md",
    status: "proposed",
    producerRole: "product-strategist",
    agentId: "strategist-a",
    runId: "schema-run-006",
    phase: "grounding",
    createdAt: "yesterday",
    sourceRefs: []
  };
  await assert.rejects(
    () => manager.recordHandoff(honestHandoff("schema-run-006", { artifacts: [artifact] })),
    /createdAt must match format "date-time"/
  );
});

test("Handoff schema rejects an artifact missing sourceRefs", async () => {
  const { manager } = await runOnGroundingPhase("schema-run-007");
  const artifact = {
    id: "product-brief",
    kind: "Product Brief",
    path: ".createive/runs/schema-run-007/artifacts/PRODUCT.md",
    status: "proposed",
    producerRole: "product-strategist",
    agentId: "strategist-a",
    runId: "schema-run-007",
    phase: "grounding",
    createdAt: "2026-08-24T10:00:00.000Z"
  };
  await assert.rejects(
    () => manager.recordHandoff(honestHandoff("schema-run-007", { artifacts: [artifact] })),
    /required property 'sourceRefs'/
  );
});

test("Handoff schema rejects a Decision with empty rationale", async () => {
  const { manager } = await runOnGroundingPhase("schema-run-008");
  const decision = {
    id: "d-direction",
    scope: "run",
    status: "proposed",
    choice: "Adopt Direction B",
    rationale: [],
    alternatives: [],
    evidence: [],
    risks: [],
    revisitWhen: []
  };
  await assert.rejects(
    () => manager.recordHandoff(honestHandoff("schema-run-008", { decisions: [decision] })),
    /rationale must NOT have fewer than 1 items/
  );
});

test("a phase that declares gates rejects a Handoff with no claims", async () => {
  const { manager, workspace } = await runOnGroundingPhase("gate-run-001");
  await assert.rejects(
    () => manager.recordHandoff(honestHandoff("gate-run-001", { claims: [], evidence: [] })),
    /Phase grounding declares gates \[grounding-completeness\] and requires at least one claim/
  );
  assert.equal(await workspace.exists(".createive/runs/gate-run-001/handoffs/grounding/strategist-a.json"), false);
});

test("a phase that declares gates rejects a claim carrying no evidenceRef", async () => {
  const { manager } = await runOnGroundingPhase("gate-run-002");
  await assert.rejects(
    () => manager.recordHandoff(honestHandoff("gate-run-002", {
      claims: [{ claim: "The decisive action on this surface is copy, and nothing else competes with it", status: "inferred", confidence: "medium", evidenceRefs: [] }]
    })),
    /every claim must carry at least one evidenceRef \(offending: "The decisive action on this surface is copy, and nothing els…"\)/
  );
});

test("a phase that declares no gates accepts a Handoff with no claims", async () => {
  const workspace = new MemoryWorkspace();
  const manager = new DesignManager(workspace, await conformanceRegistry());
  await manager.start({ objective: "Create a console", hasExistingDesign: false }, { runId: "gate-run-003" });
  await manager.recordHandoff(honestHandoff("gate-run-003", {
    phase: "intake",
    role: "coordinator",
    agentId: "coordinator-a",
    claims: [],
    evidence: []
  }));
  assert.equal(await workspace.exists(".createive/runs/gate-run-003/handoffs/intake/coordinator-a.json"), true);
});

test("Handoff schema reports every violation in one error", async () => {
  const { manager } = await runOnGroundingPhase("schema-run-009");
  const handoff = honestHandoff("schema-run-009", { rubric: "createive-visual-quality", confidence: "certain" });
  delete (handoff as unknown as Record<string, unknown>)["unresolved"];
  await assert.rejects(() => manager.recordHandoff(handoff), (error: unknown) => {
    const message = (error as Error).message;
    assert.match(message, /required property 'unresolved'/);
    assert.match(message, /additional propert/i);
    assert.match(message, /\/confidence/);
    return true;
  });
});

/**
 * Regression floor: the Handoffs of the real Run must satisfy both rules. A rule that rejects
 * honest work is a stall, not a fix. `.createive/` is gitignored, so this walks read-only and
 * skips where the Run is absent — the check only ever fails on a real regression.
 */
test("every Handoff of the real Run satisfies both the schema and the gate rule", async t => {
  const runRoot = fileURLToPath(new URL("../../.createive/runs/run-cli-landing-001/handoffs", import.meta.url));
  let phaseDirs: string[];
  try {
    phaseDirs = await readdir(runRoot);
  } catch {
    t.skip("run-cli-landing-001 is not present in this checkout");
    return;
  }

  const validate = await loadHandoffValidator(systemRoot);
  const bundle = await loadRegistryBundle(systemRoot);
  const failures: string[] = [];
  let read = 0;

  for (const phaseDir of phaseDirs) {
    for (const fileName of await readdir(path.join(runRoot, phaseDir))) {
      if (!fileName.endsWith(".json")) continue;
      read += 1;
      const handoff = JSON.parse(await readFile(path.join(runRoot, phaseDir, fileName), "utf8")) as SpecialistHandoff;
      try {
        validate(handoff);
      } catch (error) {
        failures.push(`${phaseDir}/${fileName} schema: ${(error as Error).message}`);
      }
      const phase = Object.values(bundle.workflows).flatMap(workflow => workflow.phases).find(candidate => candidate.id === phaseDir);
      if (!phase || phase.gates.length === 0) continue;
      if (handoff.claims.length === 0) failures.push(`${phaseDir}/${fileName} gate: no claims`);
      for (const claim of handoff.claims) {
        if (claim.evidenceRefs.length === 0) failures.push(`${phaseDir}/${fileName} gate: claim without evidenceRefs`);
      }
    }
  }

  assert.deepEqual(failures, [], `honest Handoffs rejected:\n${failures.join("\n")}`);
  assert.ok(read > 0, "expected at least one Handoff to be read");
});
