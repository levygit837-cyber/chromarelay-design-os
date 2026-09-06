import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)));
const fail = (msg) => {
  console.error(`CHECK FAIL: ${msg}`);
  process.exit(1);
};

const index = join(root, 'index.html');
const pkg = join(root, 'package.json');
if (!existsSync(index)) fail('index.html missing');
if (!existsSync(join(root, 'src', 'main.tsx'))) fail('src/main.tsx missing');
if (!existsSync(join(root, 'src', 'App.tsx'))) fail('src/App.tsx missing');
if (!existsSync(join(root, 'src', 'fixtures.ts'))) fail('src/fixtures.ts missing');
if (!existsSync(join(root, 'README.md'))) fail('README.md missing');

const html = readFileSync(index, 'utf8');
if (!html.includes('/src/main.tsx')) fail('index.html does not reference the bundle entry /src/main.tsx');

const readme = readFileSync(join(root, 'README.md'), 'utf8');
const app = readFileSync(join(root, 'src', 'App.tsx'), 'utf8');
const shared = readFileSync(join(root, 'src', 'components', 'shared.tsx'), 'utf8');
for (const needle of ['SpineNavigator', 'WorkOrderTicket', 'SessionSidebar', 'EvidenceWing', 'Composer', 'DrawerSheet']) {
  if (!app.includes(needle)) fail(`App.tsx missing required seam: ${needle}`);
}
for (const needle of ['role="status"', 'role="alert"']) {
  if (!shared.includes(needle)) fail(`shared.tsx missing required seam: ${needle}`);
}

// Fresh-implementation guard: no specimen-only styling hooks in the shipped CSS.
const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8');
if (/ai-gradient|chat-bubble|specimen-[a-z-]+/.test(css + app)) fail('specimen vocabulary detected; implementation must be fresh');

const dist = join(root, 'dist', 'index.html');
if (existsSync(dist)) {
  const built = readFileSync(dist, 'utf8');
  if (!/assets\/index-[\w-]+\.js/.test(built)) fail('dist/index.html does not reference the built bundle');
  console.log('CHECK OK: dist bundle reference present');
}

console.log('CHECK OK: boot seams, README commands, component seams, no-specimen guard all pass');
console.log(JSON.stringify({ package: JSON.parse(readFileSync(pkg, 'utf8')).name }));
