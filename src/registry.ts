import path from "node:path";
import { readFile } from "node:fs/promises";
import type { AgentRoleDefinition, RegistryBundle, SkillKitDefinition, WorkflowDefinition, WorkflowId } from "./domain.js";
import { ContractError, WORKFLOW_IDS } from "./domain.js";
import { loadHandoffValidator } from "./handoff-schema.js";

interface WorkflowIndex {
  workflows: Array<{ id: WorkflowId; definition: string }>;
}
interface AgentIndex { roles: AgentRoleDefinition[] }
interface KitIndex { kits: SkillKitDefinition[] }
interface GateIndex { gates: Array<{ id: string }> }

async function readJson<T>(filePath: string): Promise<T> {
  const text = await readFile(filePath, "utf8");
  return JSON.parse(text) as T;
}

export async function loadRegistryBundle(systemRoot: string): Promise<RegistryBundle> {
  const root = path.resolve(systemRoot);
  const workflowIndex = await readJson<WorkflowIndex>(path.join(root, "registry/workflows.json"));
  const agentIndex = await readJson<AgentIndex>(path.join(root, "registry/agents.json"));
  const kitIndex = await readJson<KitIndex>(path.join(root, "registry/kits.json"));
  const gateIndex = await readJson<GateIndex>(path.join(root, "registry/gates.json"));

  const workflows = {} as Record<WorkflowId, WorkflowDefinition>;
  for (const item of workflowIndex.workflows) {
    const relativeDefinition = item.definition.replace(/^framework\//, "");
    workflows[item.id] = await readJson<WorkflowDefinition>(path.join(root, relativeDefinition));
  }

  return {
    workflows,
    roles: Object.fromEntries(agentIndex.roles.map(role => [role.id, role])),
    kits: Object.fromEntries(kitIndex.kits.map(kit => [kit.id, kit])),
    gates: new Set(gateIndex.gates.map(gate => gate.id)),
    handoffValidator: await loadHandoffValidator(root)
  };
}

export function validateRegistryBundle(bundle: RegistryBundle): string[] {
  const errors: string[] = [];
  for (const workflowId of WORKFLOW_IDS) {
    const workflow = bundle.workflows[workflowId];
    if (!workflow) {
      errors.push(`Missing workflow ${workflowId}`);
      continue;
    }
    if (workflow.phases.length === 0) errors.push(`Workflow ${workflowId} has no phases`);
    const seen = new Set<string>();
    for (const phase of workflow.phases) {
      if (seen.has(phase.id)) errors.push(`Workflow ${workflowId} repeats phase ${phase.id}`);
      seen.add(phase.id);
      if (!bundle.roles[phase.role]) errors.push(`Workflow ${workflowId}/${phase.id} references unknown role ${phase.role}`);
      if (phase.kit && !bundle.kits[phase.kit]) errors.push(`Workflow ${workflowId}/${phase.id} references unknown kit ${phase.kit}`);
      for (const gate of phase.gates) {
        if (!bundle.gates.has(gate)) errors.push(`Workflow ${workflowId}/${phase.id} references unknown gate ${gate}`);
      }
    }
  }
  for (const kit of Object.values(bundle.kits)) {
    if (kit.supporting.length > 2) errors.push(`Kit ${kit.id} exceeds supporting-skill budget`);
    if (!kit.primary) errors.push(`Kit ${kit.id} has no primary skill`);
  }
  return errors;
}

export function assertValidRegistry(bundle: RegistryBundle): void {
  const errors = validateRegistryBundle(bundle);
  if (errors.length > 0) throw new ContractError(`Invalid ChromaRelay framework:\n- ${errors.join("\n- ")}`);
}
