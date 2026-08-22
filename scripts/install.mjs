#!/usr/bin/env node
import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MARKER_START = "<!-- BEGIN CREATEIVE -->";
const MARKER_END = "<!-- END CREATEIVE -->";

function parseArgs(argv) {
  const result = { target: null, omp: false, minimal: false, force: false, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--target") result.target = argv[++index] ?? null;
    else if (value === "--omp") result.omp = true;
    else if (value === "--minimal") result.minimal = true;
    else if (value === "--force") result.force = true;
    else if (value === "--dry-run") result.dryRun = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!result.target) throw new Error("Usage: node scripts/install.mjs --target <repo> [--omp] [--minimal] [--force] [--dry-run]");
  return result;
}

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function walkFiles(root) {
  const output = [];
  if (!(await exists(root))) return output;
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) output.push(...await walkFiles(full));
    else if (entry.isFile()) output.push(full);
  }
  return output.sort();
}

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const target = path.resolve(options.target);
  await mkdir(target, { recursive: true });

  const planned = [];
  const installed = [];
  const skipped = [];

  async function installText(source, destination, { generatedContent } = {}) {
    const relativeDestination = path.relative(target, destination).replaceAll("\\", "/");
    const content = generatedContent ?? await readFile(source, "utf8");
    const alreadyExists = await exists(destination);
    if (alreadyExists && !options.force) {
      skipped.push(relativeDestination);
      return;
    }
    planned.push(relativeDestination);
    if (!options.dryRun) {
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, content, "utf8");
    }
    installed.push({ path: relativeDestination, sha256: hash(content), replaced: alreadyExists });
  }

  async function installTree(sourceRoot, destinationRoot) {
    for (const sourceFile of await walkFiles(sourceRoot)) {
      const relative = path.relative(sourceRoot, sourceFile);
      await installText(sourceFile, path.join(destinationRoot, relative));
    }
  }

  if (options.minimal) {
    for (const relative of ["registry", "workflows", "schemas", "templates/project", "templates/run/PHASE_PACKET.md"]) {
      const source = path.join(SOURCE_ROOT, "framework", relative);
      const destination = path.join(target, ".createive/system", relative);
      if ((await exists(source)) && (await stat(source)).isDirectory()) await installTree(source, destination);
      else if (await exists(source)) await installText(source, destination);
    }
    await installTree(path.join(SOURCE_ROOT, ".agents/skills/createive-design-manager"), path.join(target, ".agents/skills/createive-design-manager"));
  } else {
    await installTree(path.join(SOURCE_ROOT, "framework"), path.join(target, ".createive/system"));
    await installTree(path.join(SOURCE_ROOT, ".agents/skills"), path.join(target, ".agents/skills"));
  }

  for (const template of await walkFiles(path.join(SOURCE_ROOT, "framework/templates/project"))) {
    const relative = path.relative(path.join(SOURCE_ROOT, "framework/templates/project"), template);
    const destination = path.join(target, ".createive/project", relative);
    const previousForce = options.force;
    options.force = false;
    await installText(template, destination);
    options.force = previousForce;
  }

  if (options.omp) {
    for (const directory of ["agents", "commands", "prompts", "hooks", "tools"]) {
      await installTree(path.join(SOURCE_ROOT, ".omp", directory), path.join(target, ".omp", directory));
    }
    await installText(path.join(SOURCE_ROOT, ".omp/README.md"), path.join(target, ".omp/CREATEIVE.md"));
    await installText(path.join(SOURCE_ROOT, ".omp/config.example.yml"), path.join(target, ".omp/createive.config.example.yml"));
  }

  const agentsPath = path.join(target, "AGENTS.md");
  const existingAgents = await exists(agentsPath) ? await readFile(agentsPath, "utf8") : "# Agent Instructions\n";
  const block = `${MARKER_START}\n## Createive Design Operations\n\nFor multi-stage visual or design-system work, use \`.agents/skills/createive-design-manager/SKILL.md\`. Canonical state lives in \`.createive/project/\`; mutable work lives in \`.createive/runs/\`. Only the Coordinator promotes approved work. Read \`CONTEXT.md\` when present and do not load all Createive Skills at once.\n${MARKER_END}`;
  const markerPattern = new RegExp(`${MARKER_START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${MARKER_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  const nextAgents = markerPattern.test(existingAgents)
    ? existingAgents.replace(markerPattern, block)
    : `${existingAgents.trimEnd()}\n\n${block}\n`;
  const agentsChanged = nextAgents !== existingAgents;
  if (agentsChanged) {
    planned.push("AGENTS.md");
    if (!options.dryRun) await writeFile(agentsPath, nextAgents, "utf8");
    installed.push({ path: "AGENTS.md", sha256: hash(nextAgents), replaced: await exists(agentsPath) });
  }

  if (!options.dryRun) {
    await mkdir(path.join(target, ".createive/runs"), { recursive: true });
    const manifest = {
      createiveVersion: "0.1.0",
      installedAt: new Date().toISOString(),
      source: SOURCE_ROOT,
      mode: options.minimal ? "minimal" : "full",
      omp: options.omp,
      files: installed,
      skipped
    };
    await writeFile(path.join(target, ".createive/install-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  }

  console.log(JSON.stringify({ target, dryRun: options.dryRun, planned, skipped }, null, 2));
}

main().catch(error => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
