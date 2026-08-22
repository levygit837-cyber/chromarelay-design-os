#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { DesignManager } from "./design-manager.js";
import type { DesignRequest, SpecialistHandoff } from "./domain.js";
import { FileWorkspace } from "./workspace.js";
import { loadRegistryBundle, validateRegistryBundle } from "./registry.js";

interface ParsedArgs {
  command?: string;
  positional: string[];
  flags: Map<string, string | true>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const positional: string[] = [];
  const flags = new Map<string, string | true>();
  for (let index = 0; index < rest.length; index += 1) {
    const current = rest[index]!;
    if (!current.startsWith("--")) {
      positional.push(current);
      continue;
    }
    const name = current.slice(2);
    const next = rest[index + 1];
    if (next && !next.startsWith("--")) {
      flags.set(name, next);
      index += 1;
    } else {
      flags.set(name, true);
    }
  }
  return { ...(command ? { command } : {}), positional, flags };
}

function flag(args: ParsedArgs, name: string, fallback?: string): string | undefined {
  const value = args.flags.get(name);
  return typeof value === "string" ? value : fallback;
}

async function jsonFile<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(path.resolve(filePath), "utf8")) as T;
}

function usage(): never {
  console.error(`Createive CLI

Commands:
  route <request.json> [--system framework]
  start <request.json> [--root .] [--system framework] [--run-id id]
  status [run-id] [--root .] [--system framework]
  phase [run-id] [--root .] [--system framework]
  handoff <run-id> <handoff.json> [--root .] [--system framework]
  advance [run-id] [--root .] [--system framework] [--force] [--skip]
  validate [run-id] [--root .] [--system framework]
  validate-framework [--system framework]
`);
  process.exit(2);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!args.command) usage();

  const root = path.resolve(flag(args, "root", ".")!);
  const system = path.resolve(flag(args, "system", path.join(root, ".createive/system"))!);
  const registry = await loadRegistryBundle(system);

  if (args.command === "validate-framework") {
    const errors = validateRegistryBundle(registry);
    if (errors.length > 0) {
      console.error(errors.join("\n"));
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify({ valid: true, workflows: Object.keys(registry.workflows).length, roles: Object.keys(registry.roles).length, kits: Object.keys(registry.kits).length }, null, 2));
    return;
  }

  const manager = new DesignManager(new FileWorkspace(root), registry);

  switch (args.command) {
    case "route": {
      const requestPath = args.positional[0];
      if (!requestPath) usage();
      const request = await jsonFile<DesignRequest>(requestPath);
      console.log(JSON.stringify(manager.route(request), null, 2));
      return;
    }
    case "start": {
      const requestPath = args.positional[0];
      if (!requestPath) usage();
      const request = await jsonFile<DesignRequest>(requestPath);
      const runId = flag(args, "run-id");
      const run = await manager.start(request, runId ? { runId } : {});
      console.log(JSON.stringify(run, null, 2));
      return;
    }
    case "status": {
      console.log(JSON.stringify(await manager.status(args.positional[0]), null, 2));
      return;
    }
    case "phase": {
      console.log(JSON.stringify(await manager.phasePacket(args.positional[0]), null, 2));
      return;
    }
    case "handoff": {
      const runId = args.positional[0];
      const handoffPath = args.positional[1];
      if (!runId || !handoffPath) usage();
      const handoff = await jsonFile<SpecialistHandoff>(handoffPath);
      if (handoff.runId !== runId) throw new Error(`Handoff Run ${handoff.runId} does not match ${runId}`);
      await manager.recordHandoff(handoff);
      console.log(JSON.stringify({ recorded: true, runId, phase: handoff.phase, agentId: handoff.agentId }, null, 2));
      return;
    }
    case "advance": {
      const run = await manager.advance(args.positional[0], { force: args.flags.has("force"), skip: args.flags.has("skip") });
      console.log(JSON.stringify(run, null, 2));
      return;
    }
    case "validate": {
      const run = await manager.getRun(args.positional[0]);
      manager.validateRun(run);
      console.log(JSON.stringify({ valid: true, runId: run.runId, workflow: run.workflow, phase: run.currentPhase }, null, 2));
      return;
    }
    default:
      usage();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
