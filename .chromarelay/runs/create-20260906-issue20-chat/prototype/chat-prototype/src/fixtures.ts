import type { Project, Session, Turn, TurnEvidence } from './model';

/** Zero-padded turn label, e.g. 4 -> "04". */
export function pad(no: number): string {
  return String(no).padStart(2, '0');
}

export function citeLine(no: number, kind: string, target: string): string {
  return `Turn ${pad(no)} / ${kind} ${target}`;
}
function defaultEvidence(no: number, kind: string, target: string): TurnEvidence {
  return {
    browser: {
      state: 'populated',
      data: {
        title: 'Checkout flow — design reference',
        url: 'https://example.test/docs/checkout-flow',
        excerpt: 'The retry helper wraps the payment call with capped backoff and keeps the attempt count on the ticket.',
        excerptRange: `Turn ${pad(no)} / ${kind} ${target} — excerpt lines 12–18`,
      },
    },
    files: {
      state: 'populated',
      data: [
        { path: 'src/routes/checkout.ts', kind: 'file', change: 'edited', status: 'ok' },
        { path: 'src/lib/retry.ts', kind: 'file', change: 'added', status: 'ok' },
        { path: 'src/lib/', kind: 'dir', change: 'none', status: 'ok' },
      ],
    },
    github: {
      state: 'populated',
      data: {
        repo: 'atlas/checkout',
        ref: 'pr-4821 · retry-helper',
        summary: '2 checks passing, 1 pending review from payments owners.',
      },
    },
  };
}

const checkoutTurns: Turn[] = [
  {
    no: 1,
    title: 'Inventory the checkout flow',
    subline: 'Assistant · 2 tools · 4.1s',
    status: 'ok',
    prose:
      'I read the checkout route and pulled one external reference. The payment call has no retry helper yet, so the next turn drafts it.',
    durationMs: 4100,
    tools: [
      {
        id: 't1-read',
        kind: 'Read',
        target: 'src/routes/checkout.ts',
        status: 'succeeded',
        durationMs: 240,
        detail: {
          variant: 'diff',
          diff: [
            { kind: 'ctx', text: 'export async function checkout(cart: Cart) {' },
            { kind: 'del', text: '  return charge(cart);' },
            { kind: 'add', text: '  return chargeWithRetry(cart, { attempts: 3 });' },
            { kind: 'ctx', text: '}' },
          ],
        },
      },
      {
        id: 't1-web',
        kind: 'WebSearch',
        target: 'payment retry backoff guidance',
        status: 'succeeded',
        durationMs: 3860,
        detail: {
          variant: 'excerpt',
          excerpt: 'Cap retries at three attempts with jittered backoff; surface the attempt count to the caller.',
          excerptRange: 'Turn 01 / WebSearch payment retry backoff guidance — excerpt lines 4–6',
        },
      },
    ],
    attempt: 1,
    dismissed: null,
    userPrompt: 'Map the checkout flow and find retry guidance.',
    followUps: null,
  },
  {
    no: 2,
    title: 'Draft the retry helper',
    subline: 'Assistant · 2 tools · 6.8s',
    status: 'ok',
    prose:
      'The helper is written and the route now calls it. One edit, one verification read — both clean.',
    durationMs: 6800,
    tools: [
      {
        id: 't2-write',
        kind: 'Write',
        target: 'src/lib/retry.ts',
        status: 'succeeded',
        durationMs: 5120,
        detail: {
          variant: 'diff',
          diff: [
            { kind: 'add', text: 'export async function chargeWithRetry(cart: Cart, opts: RetryOpts) {' },
            { kind: 'add', text: '  for (let attempt = 1; attempt <= opts.attempts; attempt++) {' },
            { kind: 'ctx', text: '    try { return await charge(cart); }' },
            { kind: 'ctx', text: '    catch (err) { if (attempt === opts.attempts) throw err; }' },
            { kind: 'add', text: '  }' },
            { kind: 'add', text: '}' },
          ],
        },
      },
      {
        id: 't2-edit',
        kind: 'Edit',
        target: 'src/routes/checkout.ts',
        status: 'succeeded',
        durationMs: 1680,
        detail: {
          variant: 'diff',
          diff: [
            { kind: 'ctx', text: "import { charge } from './payments';" },
            { kind: 'add', text: "import { chargeWithRetry } from '../lib/retry';" },
            { kind: 'del', text: '  return charge(cart);' },
            { kind: 'add', text: '  return chargeWithRetry(cart, { attempts: 3 });' },
          ],
        },
      },
    ],
    attempt: 1,
    dismissed: null,
    userPrompt: 'Write the retry helper and wire it into the route.',
    followUps: null,
  },
  {
    no: 3,
    title: 'Confirm the plan before tests',
    subline: 'Assistant · no tools',
    status: 'ok',
    prose:
      'No tools ran this turn — this is a planning note only. The test command is staged for the next turn.',
    durationMs: 300,
    tools: [],
    attempt: 1,
    dismissed: null,
    userPrompt: 'Pause and confirm the plan before running tests.',
    followUps: null,
  },
  {
    no: 4,
    title: 'Run the checkout tests',
    subline: 'Assistant · 1 tool · failed · attempt 1',
    status: 'failed',
    prose:
      'The test run failed on the payment stub. The attempt is kept on the ticket — retry or dismiss with a reason.',
    durationMs: 9200,
    tools: [
      {
        id: 't4-bash',
        kind: 'Bash',
        target: 'npm test -- checkout',
        status: 'failed',
        durationMs: 9200,
        detail: {
          variant: 'errorbox',
          error: 'payment stub rejected the third attempt: expected chargeWithRetry to catch, got unhandled rejection.',
          exitCode: 1,
        },
      },
    ],
    attempt: 1,
    dismissed: null,
    userPrompt: 'Run the checkout test suite.',
    followUps: ['Retry the test run', 'Show the failing stub'],
  },
];

const checkoutEvidence: Record<number, TurnEvidence> = {
  1: defaultEvidence(1, 'Read', 'src/routes/checkout.ts'),
  2: {
    browser: { state: 'empty' },
    files: {
      state: 'populated',
      data: [{ path: 'src/lib/retry.ts', kind: 'file', change: 'added', status: 'ok' }],
    },
    github: { state: 'empty' },
  },
  3: {
    browser: { state: 'empty' },
    files: { state: 'empty' },
    github: { state: 'empty' },
  },
  4: {
    browser: { state: 'error' },
    files: { state: 'error' },
    github: { state: 'error' },
  },
};

function longSessionTurns(): { turns: Turn[]; evidence: Record<number, TurnEvidence> } {
  const turns: Turn[] = [];
  const evidence: Record<number, TurnEvidence> = {};
  for (let n = 1; n <= 30; n++) {
    if (n === 27) {
      turns.push({
        no: n,
        title: 'Migrate the ledger writer',
        subline: 'Assistant · 1 tool · failed · attempt 1',
        status: 'failed',
        prose: 'The ledger migration failed on a locked row. Retry keeps this attempt on record.',
        durationMs: 7400,
        tools: [
          {
            id: `tl${n}-bash`,
            kind: 'Bash',
            target: 'npm run migrate -- ledger',
            status: 'failed',
            durationMs: 7400,
            detail: {
              variant: 'errorbox',
              error: 'row lock timeout on ledger_entries after 5000ms; migration rolled back.',
              exitCode: 1,
            },
          },
        ],
        attempt: 1,
        dismissed: null,
        userPrompt: 'Migrate the ledger writer.',
        followUps: n === 27 ? ['Retry the migration', 'Show the lock holder'] : null,
      });
    } else if (n === 30) {
      turns.push({
        no: n,
        title: 'Verify the migrated reads',
        subline: 'Assistant · running · step 2 of 4 in stub',
        status: 'running',
        prose: 'Verification is running against the migrated reads. Progress is staged stub output, honestly labelled.',
        durationMs: null,
        tools: [
          {
            id: `tl${n}-read`,
            kind: 'Read',
            target: 'src/ledger/reads.ts',
            status: 'staged',
            durationMs: null,
            detail: { variant: 'staged', step: 2, steps: 4 },
          },
          {
            id: `tl${n}-bash`,
            kind: 'Bash',
            target: 'npm run verify -- ledger',
            status: 'queued',
            durationMs: null,
            detail: { variant: 'queued-note' },
          },
        ],
        attempt: 1,
        dismissed: null,
        userPrompt: 'Verify the migrated reads.',
        followUps: null,
      });
    } else {
      turns.push({
        no: n,
        title: `Migrate batch ${pad(n)}`,
        subline: 'Assistant · 1 tool · done',
        status: 'ok',
        prose: `Batch ${pad(n)} migrated cleanly with a single verification read.`,
        durationMs: 1200 + n * 37,
        tools: [
          {
            id: `tl${n}-read`,
            kind: 'Read',
            target: `src/ledger/batch-${pad(n)}.ts`,
            status: 'succeeded',
            durationMs: 1200 + n * 37,
            detail: {
              variant: 'excerpt',
              excerpt: `Batch ${pad(n)} checksum matched; no rows rewritten.`,
              excerptRange: `Turn ${pad(n)} / Read src/ledger/batch-${pad(n)}.ts — excerpt lines 1–3`,
            },
          },
        ],
        attempt: 1,
        dismissed: null,
        userPrompt: `Migrate batch ${pad(n)}.`,
        followUps: null,
      });
    }
    evidence[n] = defaultEvidence(n, 'Read', `src/ledger/batch-${pad(n)}.ts`);
  }
  return { turns, evidence };
}

const long = longSessionTurns();

export const projects: Project[] = [
  { id: 'p-atlas', name: 'Atlas', sessionIds: ['s-checkout', 's-long', 's-empty'] },
  { id: 'p-sidecar', name: 'Sidecar', sessionIds: [] },
];

export const sessions: Record<string, Session> = {
  's-checkout': {
    id: 's-checkout',
    projectId: 'p-atlas',
    title: 'Checkout retry work',
    updatedAt: 'Sep 6, 09:41',
    turns: checkoutTurns,
    evidence: checkoutEvidence,
    suggestions: ['Summarize the open risks', 'Draft the checkout retry plan'],
  },
  's-long': {
    id: 's-long',
    projectId: 'p-atlas',
    title: 'Ledger migration (30 turns)',
    updatedAt: 'Sep 6, 08:15',
    turns: long.turns,
    evidence: long.evidence,
    suggestions: ['Summarize the migration so far'],
  },
  's-empty': {
    id: 's-empty',
    projectId: 'p-atlas',
    title: 'Empty planning session',
    updatedAt: 'Sep 6, 07:58',
    turns: [],
    evidence: {},
    suggestions: ['Summarize the open risks', 'Draft the checkout retry plan'],
  },
};

/** First unretried failure, else the running turn, else the latest turn. */
export function resumeTurn(session: Session): number | null {
  if (session.turns.length === 0) return null;
  const failed = session.turns.find((t) => t.status === 'failed' && !t.dismissed);
  if (failed) return failed.no;
  const running = [...session.turns].reverse().find((t) => t.status === 'running');
  if (running) return running.no;
  return session.turns[session.turns.length - 1].no;
}

export function formatDuration(ms: number | null): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
