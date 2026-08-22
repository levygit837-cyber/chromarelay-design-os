import { createHash } from "node:crypto";
import { access, appendFile, copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CustomToolFactory } from "@oh-my-pi/pi-coding-agent";

async function exists(filePath: string): Promise<boolean> {
  try { await access(filePath); return true; } catch { return false; }
}

function within(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function atomicWrite(destination: string, content: string): Promise<void> {
  await mkdir(path.dirname(destination), { recursive: true });
  const temporary = `${destination}.tmp-${process.pid}-${Date.now()}`;
  await writeFile(temporary, content, "utf8");
  await rename(temporary, destination);
}

const factory: CustomToolFactory = pi => ({
  name: "createive_state",
  label: "Createive State",
  description: "Read Createive Run status, append Run events, validate protected paths, or promote an approved Run artifact into canonical project state.",
  parameters: pi.zod.object({
    op: pi.zod.enum(["status", "record_event", "validate_paths", "promote"]),
    runId: pi.zod.string().optional(),
    eventJson: pi.zod.string().optional(),
    source: pi.zod.string().optional(),
    destination: pi.zod.string().optional(),
    approvalRef: pi.zod.string().optional()
  }),

  async execute(_toolCallId, params, onUpdate, _ctx, signal) {
    if (signal?.aborted) throw new Error("Createive state operation cancelled");
    const root = path.resolve(pi.cwd);
    const createiveRoot = path.join(root, ".createive");
    const runsRoot = path.join(createiveRoot, "runs");
    const projectRoot = path.join(createiveRoot, "project");
    const activePath = path.join(createiveRoot, "active-run.json");

    onUpdate?.({ content: [{ type: "text", text: `Createive ${params.op}...` }], details: { phase: "validate" } });

    if (params.op === "validate_paths") {
      const source = params.source ? path.resolve(root, params.source) : null;
      const destination = params.destination ? path.resolve(root, params.destination) : null;
      const details = {
        sourceInsideRuns: source ? within(runsRoot, source) : null,
        destinationInsideProject: destination ? within(projectRoot, destination) : null,
        systemProtected: destination ? within(path.join(createiveRoot, "system"), destination) : null
      };
      return { content: [{ type: "text", text: JSON.stringify(details, null, 2) }], details };
    }

    const active = await exists(activePath) ? JSON.parse(await readFile(activePath, "utf8")) as { runId?: string } : {};
    const runId = params.runId ?? active.runId;
    if (!runId) throw new Error("No runId supplied and no active Createive Run exists");
    const safeRunId = runId.replaceAll(/[^a-zA-Z0-9._-]/g, "-");
    const runRoot = path.join(runsRoot, safeRunId);
    const runPath = path.join(runRoot, "run.json");

    if (params.op === "status") {
      if (!(await exists(runPath))) throw new Error(`Createive Run not found: ${runId}`);
      const run = JSON.parse(await readFile(runPath, "utf8"));
      const status = {
        runId: run.runId,
        workflow: run.workflow,
        status: run.status,
        currentPhase: run.currentPhase,
        blockers: run.blockers ?? [],
        openDecisions: run.openDecisions ?? [],
        artifactCount: Array.isArray(run.artifactRefs) ? run.artifactRefs.length : 0,
        updatedAt: run.updatedAt
      };
      return { content: [{ type: "text", text: JSON.stringify(status, null, 2) }], details: status };
    }

    if (params.op === "record_event") {
      if (!params.eventJson) throw new Error("eventJson is required for record_event");
      const event = JSON.parse(params.eventJson);
      await mkdir(runRoot, { recursive: true });
      await appendFile(path.join(runRoot, "events.jsonl"), `${JSON.stringify({ at: new Date().toISOString(), source: "createive_state", ...event })}\n`, "utf8");
      return { content: [{ type: "text", text: `Event recorded for ${runId}` }], details: { runId, event } };
    }

    if (!params.source || !params.destination || !params.approvalRef) {
      throw new Error("promote requires source, destination, and approvalRef");
    }
    const source = path.resolve(root, params.source);
    const destination = path.resolve(root, params.destination);
    const approvalPath = path.resolve(root, params.approvalRef);
    if (!within(runRoot, source)) throw new Error("Promotion source must be inside the selected Run");
    if (!within(projectRoot, destination)) throw new Error("Promotion destination must be inside .createive/project");
    if (!within(runRoot, approvalPath)) throw new Error("approvalRef must be inside the selected Run");
    if (!(await exists(source))) throw new Error(`Promotion source not found: ${params.source}`);
    if (!(await exists(approvalPath))) throw new Error(`Approval record not found: ${params.approvalRef}`);

    const approval = JSON.parse(await readFile(approvalPath, "utf8"));
    const approved = approval.status === "approved" || approval.status === "locked" || approval.approved === true || approval.verdict === "approve";
    if (!approved) throw new Error("Approval record does not authorize Promotion");

    const content = await readFile(source);
    const relativeDestination = path.relative(projectRoot, destination);
    let backup: string | null = null;
    if (await exists(destination)) {
      backup = path.join(runRoot, "promotion-backups", relativeDestination);
      await mkdir(path.dirname(backup), { recursive: true });
      await copyFile(destination, backup);
    }
    await mkdir(path.dirname(destination), { recursive: true });
    const temporary = `${destination}.tmp-${process.pid}-${Date.now()}`;
    await writeFile(temporary, content);
    await rename(temporary, destination);

    const manifest = {
      runId,
      source: path.relative(root, source),
      destination: path.relative(root, destination),
      approvalRef: path.relative(root, approvalPath),
      backup: backup ? path.relative(root, backup) : null,
      sha256: createHash("sha256").update(content).digest("hex"),
      promotedAt: new Date().toISOString()
    };
    const manifestPath = path.join(runRoot, "reports", "promotions", `${Date.now()}.json`);
    await atomicWrite(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await appendFile(path.join(runRoot, "events.jsonl"), `${JSON.stringify({ at: manifest.promotedAt, type: "artifact.promoted", ...manifest })}\n`, "utf8");

    return {
      content: [{ type: "text", text: `Promoted ${manifest.source} -> ${manifest.destination}` }],
      details: manifest
    };
  }
});

export default factory;
