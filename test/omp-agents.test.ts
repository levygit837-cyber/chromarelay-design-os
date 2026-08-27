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

test("the memory-curator may only reach canonical state through chromarelay_state", async () => {
  const agentsDirectory = path.join(await repositoryRoot(), ".omp", "agents");
  const declarations = frontmatter(await readFile(path.join(agentsDirectory, "chromarelay-memory-curator.md"), "utf8"));
  const tools = /^tools:\s*(\[.+\])\s*$/m.exec(declarations)?.[1];
  assert.ok(tools, "memory-curator declares no tools list");
  const declared = JSON.parse(tools) as string[];
  assert.ok(declared.includes("chromarelay_state"), `Promotion needs chromarelay_state, declared: ${declared.join(", ")}`);
  assert.equal(declared.includes("bash"), false, "bash would let Promotion bypass chromarelay_state");
  assert.equal(declared.includes("edit"), false, "edit would let Promotion rewrite canonical state in place");
});

/** Words a body might reach for that read as transitions but are not members of the enum. */
const NEAR_MISS_TRANSITIONS = ["loop", "retry", "repeat", "redo", "rerun", "abort", "pause"];

/**
 * Every word in an agent body that reads as a transition value, whether marked up or bare. Marked-up
 * words are collected anywhere; a near-miss is collected only from a sentence that already talks
 * about transitions, since `loop` in isolation is ordinary English and only becomes a defect when it
 * is offered to the agent as a route. The prose form is the one that actually shipped: "the
 * Coordinator decides whether to loop, branch, or escalate" hands an agent a value `ajv` rejects,
 * which turns a wording slip into a failed Phase.
 */
function transitionWordsIn(body: string): Set<string> {
  const markedUp = new Set([...ENUM_TRANSITIONS, ...NEAR_MISS_TRANSITIONS, "block", "reject", "hold", "fail"]);
  const found = new Set<string>();
  for (const match of body.matchAll(/`([a-z-]+)`|"([a-z-]+)"/g)) {
    const word = match[1] ?? match[2]!;
    if (markedUp.has(word)) found.add(word);
  }
  for (const sentence of body.split(/(?<=[.:;!?])\s|\n/)) {
    const aboutTransitions = /transition/i.test(sentence) || ENUM_TRANSITIONS.some(value => new RegExp(`\\b${value}\\b`).test(sentence));
    if (!aboutTransitions) continue;
    for (const word of NEAR_MISS_TRANSITIONS) {
      if (new RegExp(`\\b${word}\\b`).test(sentence)) found.add(word);
    }
  }
  return found;
}

const ENUM_TRANSITIONS = ["advance", "branch", "return", "escalate", "stop"] as const;

test("every OMP agent body names transition values the Handoff schema accepts", async () => {
  const root = await repositoryRoot();
  const schema = JSON.parse(await readFile(path.join(root, "framework", "schemas", "handoff.schema.json"), "utf8"));
  const permitted = new Set<string>(schema.properties.requestedTransition.enum);
  assert.deepEqual([...permitted].sort(), ["advance", "branch", "escalate", "return", "stop"]);

  const agentsDirectory = path.join(root, ".omp", "agents");
  const definitions = (await readdir(agentsDirectory)).filter(entry => entry.endsWith(".md") && entry !== "README.md");
  assert.ok(definitions.length >= 12, `expected the agent definitions to be found, saw ${definitions.length}`);

  const offending: string[] = [];
  const withoutSuccess: string[] = [];
  for (const definition of definitions) {
    const body = await readFile(path.join(agentsDirectory, definition), "utf8");
    const words = transitionWordsIn(body);
    // A Role that never names its success value is a Role whose only stated route is a failure one.
    if (!words.has("advance")) withoutSuccess.push(definition);
    for (const word of words) {
      if (!permitted.has(word)) offending.push(`${definition}: ${word}`);
    }
  }
  assert.deepEqual(offending, [], `transition values outside the schema enum: ${offending.join(", ")}`);
  assert.deepEqual(withoutSuccess, [], `agent bodies naming no success transition: ${withoutSuccess.join(", ")}`);
});
