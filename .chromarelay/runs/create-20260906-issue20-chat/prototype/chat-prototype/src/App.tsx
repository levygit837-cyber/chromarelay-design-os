/**
 * Workbench shell: banner + left wing + spine + center stack + right wing +
 * composer + sheets. All stub traffic is local; zero network after install.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComposerMode, DemoStateId, Session, ToolCall, Turn, WingView } from './model';
import { projects as baseProjects, sessions as baseSessions, pad, resumeTurn } from './fixtures';
import { SpineNavigator } from './components/SpineNavigator';
import { WorkOrderTicket } from './components/Ticket';
import { SessionSidebar } from './components/SessionSidebar';
import { EvidenceWing } from './components/EvidenceWing';
import { Composer } from './components/Composer';
import { DrawerSheet, type SheetKind } from './components/DrawerSheet';
import { EmptyFrame, FootnoteBlock, LiveRegion } from './components/shared';

const DEMO_STATES: Array<{ id: DemoStateId | 'nosessions'; label: string }> = [
  { id: 'default', label: 'Default' },
  { id: 'empty', label: 'Empty session' },
  { id: 'streaming', label: 'Streaming' },
  { id: 'failed', label: 'Failed' },
  { id: 'long', label: 'Long session (30)' },
  { id: 'narrow', label: 'Narrow-mode demo' },
  { id: 'nosessions', label: 'No sessions' },
];

function initialDemo(): DemoStateId | 'nosessions' {
  const q = new URLSearchParams(window.location.search).get('state');
  return DEMO_STATES.some((d) => d.id === q) ? (q as DemoStateId) : 'default';
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

let turnSeq = 100;

export default function App() {
  const [demo, setDemo] = useState(initialDemo);
  const [projects, setProjects] = useState(() => clone(baseProjects));
  const [sessions, setSessions] = useState<Record<string, Session>>(() => clone(baseSessions));
  const [activeId, setActiveId] = useState<string | null>(
    initialDemo() === 'empty' ? 's-empty' : initialDemo() === 'long' ? 's-long' : 's-checkout',
  );
  const [selected, setSelected] = useState<Record<string, number | null>>(() => ({
    's-checkout': 4,
    's-long': 27,
    's-empty': null,
  }));
  const [wingView, setWingView] = useState<Record<string, WingView>>({
    's-checkout': 'browser',
    's-long': 'browser',
    's-empty': 'browser',
  });
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [modes, setModes] = useState<Record<string, ComposerMode>>({});
  const [usedFollowUps, setUsedFollowUps] = useState<Record<string, string[]>>({});
  const [openWells, setOpenWells] = useState<Record<string, string | null>>({
    's-checkout:1': 't1-read',
    's-checkout:4': 't4-bash',
  });
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [spineExpanded, setSpineExpanded] = useState(false);
  const [sending, setSending] = useState(false);
  const [echo, setEcho] = useState<string | null>(null);
  const [running, setRunning] = useState<{ sessionId: string; turnNo: number } | null>(null);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [dismissTurn, setDismissTurn] = useState<number | null>(null);
  const [dismissReason, setDismissReason] = useState<string | null>(null);
  const [dismissNote, setDismissNote] = useState('');
  const [retryTick, setRetryTick] = useState(0);
  const [narrowPreview, setNarrowPreview] = useState(initialDemo() === 'narrow');
  const [noSessionsMode, setNoSessionsMode] = useState(initialDemo() === 'nosessions');
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  const stackHeadingRef = useRef<HTMLHeadingElement>(null);
  const timers = useRef<number[]>([]);

  const announce = useCallback((msg: string, isAssertive = false) => {
    if (isAssertive) setAssertive(msg);
    else setPolite(msg);
  }, []);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  // Background (banner + wings + spine + stack + composer) is inert + untabbable
  // while any sheet is open (G5). The sheet itself and live regions stay live.
  useEffect(() => {
    const scope = document.querySelectorAll('.banner, .workbench');
    scope.forEach((el) => {
      if (sheet) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  }, [sheet]);

  const active: Session | null = activeId && !noSessionsMode ? (sessions[activeId] ?? null) : null;
  const selectedNo = active ? (selected[active.id] ?? null) : null;
  const selectedTurn: Turn | null = active ? (active.turns.find((t) => t.no === selectedNo) ?? null) : null;
  const citedTool: ToolCall | null =
    selectedTurn && selectedTurn.tools.length > 0
      ? (selectedTurn.tools.find((t) => t.id === openWells[`${active?.id}:${selectedTurn.no}`]) ?? selectedTurn.tools[0])
      : null;

  const evidence = active && selectedTurn ? (active.evidence[selectedTurn.no] ?? null) : null;
  const narrowActive = narrowPreview || (typeof window !== 'undefined' && window.innerWidth <= 1180);

  const scrollToTicket = (no: number) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(`ticket-${no}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const switchSession = useCallback(
    (id: string) => {
      const s = sessions[id];
      if (!s) return;
      setActiveId(id);
      const target = resumeTurn(s);
      setSelected((m) => ({ ...m, [id]: target }));
      setSheet(null);
      announce(`Session ${s.title} loaded with ${s.turns.length} turns.`);
      window.setTimeout(() => stackHeadingRef.current?.focus(), 0);
    },
    [sessions, announce],
  );

  const dockRun = useCallback(
    (sessionId: string, turnNo: number, label: string) => {
      setSessions((prev) => {
        const s = prev[sessionId];
        if (!s) return prev;
        const turns = s.turns.map((t) =>
          t.no === turnNo
            ? {
                ...t,
                status: 'ok' as const,
                subline: `Assistant · 2 tools · 5.4s · ${label}`,
                durationMs: 5400,
                prose: `Done — ${label.toLowerCase()} landed. One read plus one verification run, both clean.`,
                tools: [
                  {
                    id: `run${turnNo}-read`,
                    kind: 'Read' as const,
                    target: 'src/routes/checkout.ts',
                    status: 'succeeded' as const,
                    durationMs: 310,
                    detail: {
                      variant: 'diff' as const,
                      diff: [
                        { kind: 'ctx' as const, text: 'export async function checkout(cart: Cart) {' },
                        { kind: 'add' as const, text: `  // ${label}` },
                        { kind: 'ctx' as const, text: '  return chargeWithRetry(cart, { attempts: 3 });' },
                        { kind: 'ctx' as const, text: '}' },
                      ],
                    },
                  },
                  {
                    id: `run${turnNo}-bash`,
                    kind: 'Bash' as const,
                    target: 'npm test -- checkout',
                    status: 'succeeded' as const,
                    durationMs: 5090,
                    detail: {
                      variant: 'cmdout' as const,
                      cmdout: ['PASS src/routes/checkout.test.ts', '  14 passed in 5.09s'],
                      cmdoutExit: 0,
                    },
                  },
                ],
                followUps: ['Summarize the open risks', 'Show the passing run'],
              }
            : t,
        );
        return { ...prev, [sessionId]: { ...s, turns } };
      });
      setRunning(null);
      setSelected((m) => ({ ...m, [sessionId]: turnNo }));
      announce(`Turn ${pad(turnNo)} done: 2 succeeded.`);
    },
    [announce],
  );

  const startRun = useCallback(
    (sessionId: string, prompt: string) => {
      const s = sessions[sessionId];
      if (!s || running) return;
      setSending(true);
      setEcho(prompt);
      announce('Message sent. Working — step 1 of 4 in stub.');
      const mode = modes[sessionId] ?? 'Plan';
      timers.current.push(
        window.setTimeout(() => {
          // Echo docks (<300ms perceived); running ticket follows.
          setSending(false);
          setEcho(null);
          const no = Math.max(0, ...s.turns.map((t) => t.no)) + 1;
          const ticket: Turn = {
            no,
            title: prompt.length > 42 ? `${prompt.slice(0, 42)}…` : prompt,
            subline: `Assistant · running · step 1 of 4 in stub · ${mode} mode`,
            status: 'running',
            prose: '',
            durationMs: null,
            tools: [
              {
                id: `run${no}-read`,
                kind: 'Read',
                target: 'src/routes/checkout.ts',
                status: 'staged',
                durationMs: null,
                detail: { variant: 'staged', step: 1, steps: 4 },
              },
              {
                id: `run${no}-bash`,
                kind: 'Bash',
                target: 'npm test -- checkout',
                status: 'queued',
                durationMs: null,
                detail: { variant: 'queued-note' },
              },
            ],
            attempt: 1,
            dismissed: null,
            userPrompt: prompt,
            followUps: null,
          };
          setSessions((prev) => ({ ...prev, [sessionId]: { ...prev[sessionId], turns: [...prev[sessionId].turns, ticket] } }));
          setSelected((m) => ({ ...m, [sessionId]: no }));
          setRunning({ sessionId, turnNo: no });
          announce('Working — step 2 of 4 in stub.');
          timers.current.push(window.setTimeout(() => dockRun(sessionId, no, prompt), 1500));
        }, 180),
      );
    },
    [sessions, running, modes, announce, dockRun],
  );

  // Streaming demo route: kick a live stub run once on mount.
  const streamedRef = useRef(false);
  useEffect(() => {
    if (initialDemo() === 'streaming' && !streamedRef.current) {
      streamedRef.current = true;
      const id = window.setTimeout(() => startRun('s-checkout', 'Stream the checkout summary'), 350);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [startRun]);

  const interrupt = useCallback(
    (sessionId: string, turnNo: number) => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      setRunning(null);
      setSending(false);
      setEcho(null);
      setSessions((prev) => {
        const s = prev[sessionId];
        if (!s) return prev;
        const turns = s.turns.map((t) =>
          t.no === turnNo
            ? {
                ...t,
                status: 'failed' as const,
                subline: `Assistant · 1 tool · failed · attempt ${t.attempt}`,
                tools: t.tools.map((tool, i) =>
                  i === 0
                    ? {
                        ...tool,
                        status: 'failed' as const,
                        durationMs: 1200,
                        detail: {
                          variant: 'errorbox' as const,
                          error: 'Turn interrupted by the user before the staged steps finished.',
                          exitCode: 130,
                        },
                      }
                    : tool,
                ),
              }
            : t,
        );
        return { ...prev, [sessionId]: { ...s, turns } };
      });
      announce(`Turn ${pad(turnNo)} failed: Bash npm test -- checkout exited 130. Retry available in the ticket.`, true);
    },
    [announce],
  );

  const retry = useCallback(
    (sessionId: string, turnNo: number) => {
      setSessions((prev) => {
        const s = prev[sessionId];
        if (!s) return prev;
        const turns = s.turns.map((t) =>
          t.no === turnNo
            ? {
                ...t,
                status: 'running' as const,
                attempt: t.attempt + 1,
                subline: `Assistant · running · attempt ${t.attempt + 1} · step 1 of 4 in stub`,
                dismissed: null,
                tools: t.tools.map((tool) => ({ ...tool, status: 'staged' as const, detail: { variant: 'staged' as const, step: 1, steps: 4 } })),
              }
            : t,
        );
        return { ...prev, [sessionId]: { ...s, turns } };
      });
      setRunning({ sessionId, turnNo });
      announce(`Working — step 1 of 4 in stub. Retry Turn ${pad(turnNo)} (attempt ${(selectedTurn?.attempt ?? 1) + 1}).`);
      timers.current.push(window.setTimeout(() => dockRun(sessionId, turnNo, `Retry turn ${pad(turnNo)}`), 1500));
    },
    [announce, dockRun, selectedTurn],
  );

  const confirmDismiss = useCallback(() => {
    if (activeId == null || dismissTurn == null || !dismissReason) return;
    const reason = dismissReason;
    const note = dismissNote;
    setSessions((prev) => {
      const s = prev[activeId];
      if (!s) return prev;
      const turns = s.turns.map((t) => (t.no === dismissTurn ? { ...t, dismissed: { reason, note } } : t));
      return { ...prev, [activeId]: { ...s, turns } };
    });
    setSheet(null);
    setDismissTurn(null);
    setDismissReason(null);
    setDismissNote('');
    announce(`Turn ${pad(dismissTurn)} dismissed: ${reason}.`);
  }, [activeId, dismissTurn, dismissReason, dismissNote, announce]);

  const newSession = useCallback(
    (projectId: string) => {
      turnSeq += 1;
      const id = `s-new-${turnSeq}`;
      const s: Session = {
        id,
        projectId,
        title: `Untitled session ${turnSeq - 100}`,
        updatedAt: 'just now',
        turns: [],
        evidence: {},
        suggestions: ['Summarize the open risks', 'Draft the checkout retry plan'],
      };
      setSessions((prev) => ({ ...prev, [id]: s }));
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, sessionIds: [...p.sessionIds, id] } : p)));
      setSelected((m) => ({ ...m, [id]: null }));
      setNoSessionsMode(false);
      switchSession(id);
    },
    [switchSession],
  );

  const pickDemo = (id: DemoStateId | 'nosessions') => {
    setDemo(id);
    window.history.replaceState(null, '', `?state=${id}`);
    setSheet(null);
    setNarrowPreview(id === 'narrow');
    setNoSessionsMode(id === 'nosessions');
    if (id === 'empty') switchSession('s-empty');
    else if (id === 'long') switchSession('s-long');
    else if (id === 'narrow' || id === 'default' || id === 'failed') {
      setActiveId('s-checkout');
      setSelected((m) => ({ ...m, ['s-checkout']: 4 }));
      if (id === 'failed') announce('Turn 04 failed: Bash npm test -- checkout exited 1. Retry available in the ticket.', true);
    } else if (id === 'streaming') {
      setActiveId('s-checkout');
      startRun('s-checkout', 'Stream the checkout summary');
    }
  };

  const sessionDraft = active ? (drafts[active.id] ?? '') : '';
  const sessionMode = active ? (modes[active.id] ?? 'Plan') : 'Plan';
  const sessionFollowUps: string[] = useMemo(() => {
    if (!active) return [];
    const used = usedFollowUps[active.id] ?? [];
    const latest = selectedTurn?.followUps ?? active.suggestions;
    return (latest ?? []).filter((f) => !used.includes(f));
  }, [active, selectedTurn, usedFollowUps]);

  const openSheet = (kind: SheetKind, turnNo?: number) => {
    if (kind === 'dismiss' && turnNo != null) {
      setDismissTurn(turnNo);
      setDismissReason(null);
      setDismissNote('');
    }
    setSheet(kind);
    announce(
      kind === 'sessions'
        ? `Sessions drawer open. ${Object.keys(sessions).length} sessions listed.`
        : kind === 'attachment' && turnNo != null
          ? `Attachment sheet for Turn ${pad(turnNo)} open.`
          : '',
    );
  };

  const citeInWing = (turnNo: number | null, toolId: string | null) => {
    if (!active || turnNo == null) return;
    setSelected((m) => ({ ...m, [active.id]: turnNo }));
    const t = active.turns.find((x) => x.no === turnNo);
    const tool = t?.tools.find((x) => x.id === toolId) ?? t?.tools[0];
    if (t) announce(`Turn ${pad(turnNo)} selected. ${tool ? `${tool.kind} ${tool.target}` : 'Summary'} cited.`);
    if (narrowActive) openSheet('attachment', turnNo);
  };

  const copyTarget = (text: string) => {
    try {
      void navigator.clipboard?.writeText(text);
    } catch {
      /* clipboard unavailable in stub context; announcement below still confirms */
    }
  };

  const projectName = active ? (projects.find((p) => p.id === active.projectId)?.name ?? '') : '';
  const wingProps = {
    turnNo: selectedNo,
    kind: citedTool?.kind ?? 'Summary',
    target: citedTool?.target ?? '',
    sessionTitle: active?.title ?? '',
    evidence,
    view: (active ? wingView[active.id] : 'browser') ?? 'browser',
    retryTick,
    onTab: (v: WingView) => active && setWingView((m) => ({ ...m, [active.id]: v })),
    onRetryView: () => {
      setRetryTick((n) => n + 1);
      announce('Stub re-ran deterministically; the view script is unchanged.');
    },
    onShowTicket: () => selectedNo != null && scrollToTicket(selectedNo),
    announce,
  };

  return (
    <div className={`page${narrowPreview ? ' force-narrow' : ''}`}>
      <a className="skip-link" href="#ticket-stack">
        Skip to tickets
      </a>
      <header className="banner">
        <div className="banner-main">
          <p className="banner-eyebrow">Work-order rail · stubbed prototype</p>
          <h1 className="banner-title">Agentic chat — {active ? active.title : 'no session'}</h1>
        </div>
        <button
          type="button"
          className="btn btn-secondary sessions-btn"
          onClick={() => openSheet('sessions')}
          aria-haspopup="dialog"
        >
          Sessions
        </button>
        <nav className="demo-bar" aria-label="Demo states">
          <span className="demo-label" id="demo-label">
            Demo states:
          </span>
          <div className="demo-btns" role="group" aria-labelledby="demo-label">
            {DEMO_STATES.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`demo-btn${demo === d.id ? ' is-on' : ''}`}
                aria-pressed={demo === d.id}
                onClick={() => pickDemo(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <div className="workbench">
        <aside className="wing wing-left" aria-label="Sessions" data-testid="sessions-wing">
          <h2 className="wing-heading">Resume</h2>
          {noSessionsMode ? (
            <div className="sidebar-empty" role="group" aria-label="No sessions yet">
              <p>No sessions yet.</p>
              <button type="button" className="btn btn-primary" onClick={() => pickDemo('default')}>
                Start first session
              </button>
            </div>
          ) : (
            <SessionSidebar
              projects={projects}
              sessions={sessions}
              activeSessionId={activeId}
              collapsed={collapsed}
              onSwitch={switchSession}
              onToggleProject={(id) => setCollapsed((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))}
              onNewSession={newSession}
            />
          )}
        </aside>

        <div className="spine-col">
          {active ? (
            <SpineNavigator
              turns={active.turns}
              userTicks={active.turns.map((t) => t.no)}
              selectedNo={selectedNo}
              carriageNo={selectedNo}
              expanded={spineExpanded}
              onScrub={(no) => {
                setSelected((m) => ({ ...m, [active.id]: no }));
                scrollToTicket(no);
                const t = active.turns.find((x) => x.no === no);
                const tool = t?.tools[0];
                announce(`Turn ${pad(no)} selected. ${tool ? `${tool.kind} ${tool.target}` : 'Summary'} cited.`);
              }}
              onExpandAll={() => setSpineExpanded((v) => !v)}
              onJumpToFailure={() => {
                const f = active.turns.find((t) => t.status === 'failed' && !t.dismissed);
                if (f) {
                  setSelected((m) => ({ ...m, [active.id]: f.no }));
                  scrollToTicket(f.no);
                  announce(`Turn ${pad(f.no)} selected. Jumped to failure.`);
                }
              }}
              announce={announce}
            />
          ) : (
            <nav className="spine" aria-label="Session progress">
              <p className="spine-idle">No turns — the rail is idle.</p>
            </nav>
          )}
        </div>

        <main className="center" aria-label="Conversation">
          <h2 className="stack-heading" ref={stackHeadingRef} tabIndex={-1} id="ticket-stack">
            {active ? `Ticket stack — ${active.title}` : 'Ticket stack'}
          </h2>
          {!active || active.turns.length === 0 ? (
            <section className="empty-session" aria-label="Empty session">
              <h3 className="empty-session-title">Start the job wall</h3>
              <p>No messages yet. Send the first instruction below, or start with a suggestion.</p>
              <div className="empty-suggestions" role="group" aria-label="Start with a suggestion">
                {(active?.suggestions ?? ['Summarize the open risks', 'Draft the checkout retry plan']).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => active && startRun(active.id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <ol className="stack">
              {active.turns.map((t) => (
                <li key={t.no} className="stack-item">
                  <p className="user-row">
                    <span className="user-role">You</span> {t.userPrompt}
                  </p>
                  <WorkOrderTicket
                    turn={t}
                    selected={t.no === selectedNo}
                    openWellId={openWells[`${active.id}:${t.no}`] ?? null}
                    streaming={running?.turnNo === t.no}
                    onSelect={() => citeInWing(t.no, openWells[`${active.id}:${t.no}`] ?? null)}
                    onToggleWell={(toolId) => setOpenWells((m) => ({ ...m, [`${active.id}:${t.no}`]: toolId }))}
                    onRetry={() => retry(active.id, t.no)}
                    onDismiss={() => openSheet('dismiss', t.no)}
                    onInterrupt={() => interrupt(active.id, t.no)}
                    onCite={(toolId) => citeInWing(t.no, toolId)}
                    onCopy={copyTarget}
                    announce={announce}
                  />
                </li>
              ))}
              {echo && (
                <li className="stack-item">
                  <p className="user-row user-echo">
                    <span className="user-role">You</span> {echo}
                  </p>
                </li>
              )}
            </ol>
          )}
          {active && selectedTurn && selectedTurn.no != null && (
            <FootnoteBlock
              turnNo={selectedTurn.no}
              sessionTitle={active.title}
              view={wingView[active.id] ?? 'browser'}
              browserUrl={evidence?.browser.state === 'populated' ? evidence.browser.data.url : undefined}
              fileDots={evidence?.files.state === 'populated' ? `${evidence.files.data.filter((f) => f.change !== 'none').length} changed` : undefined}
              githubRef={evidence?.github.state === 'populated' ? evidence.github.data.ref : undefined}
            />
          )}
          {active && (
            <Composer
              draft={sessionDraft}
              mode={sessionMode}
              followUps={sessionFollowUps}
              running={running?.sessionId === active.id}
              sending={sending}
              onType={(v) => setDrafts((m) => ({ ...m, [active.id]: v }))}
              onSend={() => {
                if (sessionDraft.trim().length === 0) return;
                setDrafts((m) => ({ ...m, [active.id]: '' }));
                startRun(active.id, sessionDraft.trim());
              }}
              onMode={(m) => {
                setModes((prev) => ({ ...prev, [active.id]: m }));
                announce(`${m} mode on.`);
              }}
              onPickFollowUp={(label) => {
                setUsedFollowUps((m) => ({ ...m, [active.id]: [...(m[active.id] ?? []), label] }));
                announce('Suggestion sent.');
                startRun(active.id, label);
              }}
            />
          )}
          {!active && (
            <EmptyFrame
              title="No session open."
              body="Start your first session to cite evidence."
              actionLabel="Start first session"
              onAction={() => pickDemo('default')}
            />
          )}
        </main>

        <aside className="wing wing-right" aria-label="Evidence" data-testid="evidence-wing">
          <h2 className="wing-heading">Evidence</h2>
          <EvidenceWing {...wingProps} />
        </aside>
      </div>

      <DrawerSheet
        open={sheet}
        tether={
          sheet === 'sessions'
            ? `DRAWER — SESSIONS (project ${projectName})`
            : sheet === 'attachment' && selectedNo != null
              ? `DRAWER — ATTACHMENT SHEET (tethered to Turn ${pad(selectedNo)})`
              : sheet === 'dismiss' && dismissTurn != null
                ? `Dismiss Turn ${pad(dismissTurn)} with reason`
                : 'Sheet'
        }
        title={
          sheet === 'sessions'
            ? 'Sessions'
            : sheet === 'attachment' && selectedNo != null
              ? `Attachment — Turn ${pad(selectedNo)}`
              : sheet === 'dismiss' && dismissTurn != null
                ? `Dismiss Turn ${pad(dismissTurn)} with reason`
                : ''
        }
        turnNo={dismissTurn}
        dismissReason={dismissReason}
        dismissNote={dismissNote}
        onReason={setDismissReason}
        onNote={setDismissNote}
        onConfirmDismiss={confirmDismiss}
        onClose={() => setSheet(null)}
        announce={announce}
      >
        {sheet === 'sessions' ? (
          <SessionSidebar
            projects={projects}
            sessions={sessions}
            activeSessionId={activeId}
            collapsed={collapsed}
            onSwitch={switchSession}
            onToggleProject={(id) => setCollapsed((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))}
            onNewSession={newSession}
          />
        ) : sheet === 'attachment' ? (
          <EvidenceWing {...wingProps} />
        ) : null}
      </DrawerSheet>

      <LiveRegion polite={polite} assertive={assertive} />
    </div>
  );
}
