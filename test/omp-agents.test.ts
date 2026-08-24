import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

async function repositoryRoot(): Promise<string> {
  let directory = import.meta.dirname;
  for (;;) {
    try {
      await stat(path.join(directory, "package.json"));
      return directory;
    } catch {
      const parent = path.dirname(directory);
      if (parent === directory) throw new Error(`No package.json above ${import.meta.dirname}`);
      directory = parent;
    }
  }
}

function frontmatter(source: string): string {
  const lines = source.split("\n");
  if (lines[0] !== "---") throw new Error("Agent definition does not open with frontmatter");
  const end = lines.indexOf("---", 1);
  if (end === -1) throw new Error("Agent frontmatter is not terminated");
  return lines.slice(1, end).join("\n");
}

test("every OMP specialist agent declares a tools list", async () => {
  const agentsDirectory = path.join(await repositoryRoot(), ".omp", "agents");
  const entries = await readdir(agentsDirectory);
  const definitions = entries.filter(entry => entry.endsWith(".md") && entry !== "README.md");
  assert.ok(definitions.length >= 12, `expected the agent definitions to be found, saw ${JSON.stringify(entries)}`);

  const missing: string[] = [];
  let specialists = 0;
  for (const definition of definitions) {
    const declarations = frontmatter(await readFile(path.join(agentsDirectory, definition), "utf8"));
    // The Coordinator is the only spawning Role; its tool surface is the harness's, not a Role allowlist.
    if (/^spawns:/m.test(declarations)) continue;
    specialists += 1;
    if (!/^tools:\s*\[.+\]\s*$/m.test(declarations)) missing.push(definition);
  }
  assert.equal(specialists, definitions.length - 1, "exactly one agent definition may declare spawns");
  assert.deepEqual(missing, [], `specialists without a declared tools list: ${missing.join(", ")}`);
});

test("the memory-curator may only reach canonical state through createive_state", async () => {
  const agentsDirectory = path.join(await repositoryRoot(), ".omp", "agents");
  const declarations = frontmatter(await readFile(path.join(agentsDirectory, "createive-memory-curator.md"), "utf8"));
  const tools = /^tools:\s*(\[.+\])\s*$/m.exec(declarations)?.[1];
  assert.ok(tools, "memory-curator declares no tools list");
  const declared = JSON.parse(tools) as string[];
  assert.ok(declared.includes("createive_state"), `Promotion needs createive_state, declared: ${declared.join(", ")}`);
  assert.equal(declared.includes("bash"), false, "bash would let Promotion bypass createive_state");
  assert.equal(declared.includes("edit"), false, "edit would let Promotion rewrite canonical state in place");
});
