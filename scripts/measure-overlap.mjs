#!/usr/bin/env node
// Measures term overlap between an OMP agent body and the skill it autoloads.
//
// Method (fixed so every measurement is comparable):
//   1. Strip YAML frontmatter from the agent file -> BODY. Skill file is used whole.
//   2. Tokenize: lowercase, split on non-alphanumeric, keep tokens of length >= 4,
//      drop a fixed English stopword list. Backtick-quoted identifiers are kept.
//   3. Reduce each token to a crude stem (strip trailing 's', 'es', 'ed', 'ing')
//      so "implements"/"implement"/"implementing" count as one term.
//   4. overlapSkill  = |BODY_terms  n  SKILL_terms|  / |BODY_terms|
//      overlapWithRegistry = |BODY_terms n (SKILL_terms u MUSTNOT_terms)| / |BODY_terms|
//
// Reported as a percentage of the AGENT BODY's substantive vocabulary that the
// agent will read again in the skill it tells the harness to load.
//
// Usage:
//   node scripts/measure-overlap.mjs                      # all 12 pairs
//   node scripts/measure-overlap.mjs <agentFile> <skillFile> [roleId]

import { readFileSync } from 'node:fs';

const STOPWORDS = new Set([
  'that', 'this', 'with', 'from', 'they', 'them', 'then', 'than', 'have', 'has',
  'been', 'were', 'will', 'would', 'your', 'yours', 'when', 'what', 'which',
  'while', 'into', 'only', 'also', 'more', 'most', 'much', 'each', 'both',
  'other', 'their', 'there', 'these', 'those', 'such', 'some', 'any', 'all',
  'not', 'and', 'but', 'for', 'the', 'you', 'are', 'its', 'was', 'can',
  'does', 'done', 'doing', 'make', 'made', 'must', 'need', 'needs', 'should',
  'shall', 'may', 'might', 'ever', 'never', 'always', 'once', 'over', 'under',
  'before', 'after', 'during', 'without', 'within', 'through', 'because',
  'about', 'against', 'between', 'upon', 'onto', 'unless', 'until', 'else',
  'here', 'very', 'just', 'even', 'like', 'else', 'rather', 'else', 'itself',
  'yourself', 'anything', 'something', 'nothing', 'every', 'else',
]);

function stem(t) {
  if (t.length > 6 && t.endsWith('ing')) return t.slice(0, -3);
  if (t.length > 5 && t.endsWith('ed')) return t.slice(0, -2);
  if (t.length > 5 && t.endsWith('es')) return t.slice(0, -2);
  if (t.length > 4 && t.endsWith('s')) return t.slice(0, -1);
  return t;
}

export function terms(text) {
  const out = new Set();
  for (const raw of text.toLowerCase().split(/[^a-z0-9_]+/)) {
    if (raw.length < 4) continue;
    if (STOPWORDS.has(raw)) continue;
    if (/^\d+$/.test(raw)) continue;
    out.add(stem(raw));
  }
  return out;
}

export function stripFrontmatter(src) {
  if (!src.startsWith('---')) return src;
  const end = src.indexOf('\n---', 3);
  return end === -1 ? src : src.slice(end + 4);
}

export function measure(agentPath, skillPath, mustNot = []) {
  const agentSrc = readFileSync(agentPath, 'utf8');
  const body = stripFrontmatter(agentSrc);
  const skill = readFileSync(skillPath, 'utf8');

  const bodyTerms = terms(body);
  const skillTerms = terms(skill);
  const mustNotTerms = terms(mustNot.join(' '));

  const inSkill = [...bodyTerms].filter((t) => skillTerms.has(t));
  const inEither = [...bodyTerms].filter((t) => skillTerms.has(t) || mustNotTerms.has(t));
  const unique = [...bodyTerms].filter((t) => !skillTerms.has(t) && !mustNotTerms.has(t));

  const pct = (n) => (bodyTerms.size === 0 ? 0 : Math.round((n / bodyTerms.size) * 100));

  return {
    bodyLines: body.trim().split('\n').filter((l) => l.trim()).length,
    agentFileLines: agentSrc.trim().split('\n').length,
    skillFileLines: skill.trim().split('\n').length,
    bodyTermCount: bodyTerms.size,
    skillTermCount: skillTerms.size,
    sharedWithSkill: inSkill.length,
    overlapSkill: pct(inSkill.length),
    overlapWithRegistry: pct(inEither.length),
    uniqueTerms: unique.sort(),
  };
}

const PAIRS = [
  ['visual-critic', '.omp/agents/chromarelay-visual-critic.md', '.agents/skills/chromarelay-critique/SKILL.md'],
  ['memory-curator', '.omp/agents/chromarelay-memory-curator.md', '.agents/skills/chromarelay-memory/SKILL.md'],
  ['deterministic-auditor', '.omp/agents/chromarelay-auditor.md', '.agents/skills/chromarelay-audit/SKILL.md'],
  ['builder', '.omp/agents/chromarelay-builder.md', '.agents/skills/chromarelay-build/SKILL.md'],
  ['repairer', '.omp/agents/chromarelay-repairer.md', '.agents/skills/chromarelay-repair/SKILL.md'],
  ['system-architect', '.omp/agents/chromarelay-system-architect.md', '.agents/skills/chromarelay-systemize/SKILL.md'],
  ['art-director', '.omp/agents/chromarelay-art-director.md', '.agents/skills/chromarelay-art-direction/SKILL.md'],
  ['coordinator', '.omp/agents/chromarelay-coordinator.md', '.agents/skills/chromarelay-design-manager/SKILL.md'],
  ['reference-analyst', '.omp/agents/chromarelay-reference-analyst.md', '.agents/skills/chromarelay-reference-analysis/SKILL.md'],
  ['component-architect', '.omp/agents/chromarelay-component-architect.md', '.agents/skills/chromarelay-components/SKILL.md'],
  ['inspector', '.omp/agents/chromarelay-inspector.md', '.agents/skills/chromarelay-inspect/SKILL.md'],
  ['product-strategist', '.omp/agents/chromarelay-product-strategist.md', '.agents/skills/chromarelay-grounding/SKILL.md'],
];

function registryMustNot(roleId) {
  const reg = JSON.parse(readFileSync('framework/registry/agents.json', 'utf8'));
  const role = reg.roles.find((r) => r.id === roleId);
  return role ? role.mustNot : [];
}

const [, , argAgent, argSkill, argRole] = process.argv;

if (argAgent && argSkill) {
  const r = measure(argAgent, argSkill, argRole ? registryMustNot(argRole) : []);
  console.log(JSON.stringify(r, null, 2));
} else {
  const rows = PAIRS.map(([role, a, s]) => ({ role, ...measure(a, s, registryMustNot(role)) }));
  console.log(
    ['role', 'bodyLines', 'agentLines', 'skillLines', 'bodyTerms', 'shared', 'overlapSkill%', 'overlap+registry%']
      .join('\t'),
  );
  for (const r of rows) {
    console.log([
      r.role, r.bodyLines, r.agentFileLines, r.skillFileLines,
      r.bodyTermCount, r.sharedWithSkill, r.overlapSkill, r.overlapWithRegistry,
    ].join('\t'));
  }
  console.log('\n--- terms in body that are in NEITHER skill nor registry mustNot ---');
  for (const r of rows) {
    console.log(`${r.role} (${r.uniqueTerms.length}/${r.bodyTermCount}): ${r.uniqueTerms.join(', ')}`);
  }
}
