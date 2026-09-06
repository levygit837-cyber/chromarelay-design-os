/**
 * SpineNavigator + StripSpine variant (SC-4). One node per assistant turn,
 * user turns as non-focusable ticks, compression at 20+ turns.
 */
import { useCallback } from 'react';
import type { Turn } from '../model';
import { pad } from '../fixtures';

export interface SpineNode {
  no: number;
  title: string;
  status: 'ok' | 'running' | 'failed' | 'idle';
}

interface Props {
  turns: Turn[];
  userTicks: number[];
  selectedNo: number | null;
  carriageNo: number | null;
  expanded: boolean;
  onScrub: (no: number) => void;
  onExpandAll: () => void;
  onJumpToFailure: () => void;
  announce: (msg: string, assertive?: boolean) => void;
}

function statusWordOf(s: SpineNode['status']): string {
  return s === 'ok' ? 'Done' : s === 'running' ? 'Running' : s === 'failed' ? 'Failed' : 'Queued';
}

export function SpineNavigator({
  turns,
  userTicks,
  selectedNo,
  carriageNo,
  expanded,
  onScrub,
  onExpandAll,
  onJumpToFailure,
  announce,
}: Props) {
  const failures = turns.filter((t) => t.status === 'failed' && !t.dismissed).map((t) => t.no);

  // Compression: consecutive succeeded runs collapse; failures + current bypass.
  const currentNo = turns.length > 0 ? turns[turns.length - 1].no : null;
  let groups: Array<{ kind: 'node'; turn: Turn } | { kind: 'group'; from: number; to: number; count: number }> = [];
  if (turns.length >= 20 && !expanded) {
    let runStart: number | null = null;
    let runEnd: number | null = null;
    const flush = () => {
      if (runStart != null && runEnd != null) groups.push({ kind: 'group', from: runStart, to: runEnd, count: runEnd - runStart + 1 });
      runStart = runEnd = null;
    };
    for (const t of turns) {
      const compressible = t.status === 'ok' && t.no !== currentNo;
      if (compressible) {
        if (runStart == null) runStart = t.no;
        runEnd = t.no;
      } else {
        flush();
        groups.push({ kind: 'node', turn: t });
      }
    }
    flush();
  } else {
    groups = turns.map((t) => ({ kind: 'node' as const, turn: t }));
  }

  const onKey = useCallback(
    (e: React.KeyboardEvent, no: number) => {
      const nodeNos = groups.flatMap((g) => (g.kind === 'node' ? [g.turn.no] : []));
      const idx = nodeNos.indexOf(no);
      let next: number | null = null;
      if (e.key === 'ArrowDown') next = nodeNos[Math.min(idx + 1, nodeNos.length - 1)];
      else if (e.key === 'ArrowUp') next = nodeNos[Math.max(idx - 1, 0)];
      else if (e.key === 'Home') next = nodeNos[0];
      else if (e.key === 'End') next = nodeNos[nodeNos.length - 1];
      if (next != null) {
        e.preventDefault();
        document.getElementById(`spine-node-${next}`)?.focus();
      }
    },
    [groups],
  );

  const scrub = (no: number) => {
    onScrub(no);
    const t = turns.find((x) => x.no === no);
    const kind = t && t.tools.length > 0 ? t.tools[0].kind : 'Summary';
    const target = t && t.tools.length > 0 ? t.tools[0].target : '';
    announce(`Turn ${pad(no)} selected. ${kind} ${target} cited.`);
  };

  return (
    <nav className="spine" aria-label="Session progress">
      <ol className="spine-list">
        {groups.map((g, i) =>
          g.kind === 'group' ? (
            <li key={`g${g.from}-${g.to}`} className="spine-group">
              <button
                type="button"
                className="collapse-note"
                onClick={() => {
                  onExpandAll();
                  announce('Full turn list shown.');
                }}
                aria-label={`Turns ${g.from} to ${g.to} grouped. ${failures.length} failures still listed.`}
              >
                Turns {pad(g.from)}–{pad(g.to)} · {g.count} done
              </button>
              {i === 0 && <span className="spine-ticks" aria-hidden="true" />}
            </li>
          ) : (
            <li key={g.turn.no} className="spine-item">
              <button
                type="button"
                id={`spine-node-${g.turn.no}`}
                className={`spine-node node-${g.turn.status}${g.turn.no === selectedNo ? ' is-selected' : ''}${
                  g.turn.no === carriageNo ? ' is-carriage' : ''
                }`}
                aria-current={g.turn.no === selectedNo ? 'true' : undefined}
                aria-label={`Turn ${pad(g.turn.no)}, ${statusWordOf(g.turn.status)}, ${g.turn.title}`}
                onClick={() => scrub(g.turn.no)}
                onKeyDown={(e) => onKey(e, g.turn.no)}
              >
                <span className="node-dot" aria-hidden="true" />
                <span className="node-label">
                  <span className="node-no">{pad(g.turn.no)}</span>{' '}
                  <span className="node-status">{statusWordOf(g.turn.status)}</span>
                </span>
              </button>
              {userTicks.includes(g.turn.no) && (
                <span className="user-tick" aria-hidden="true" title="User message" />
              )}
            </li>
          ),
        )}
      </ol>
      {turns.length >= 20 && expanded && (
        <button
          type="button"
          className="btn btn-secondary spine-expand"
          onClick={() => {
            onExpandAll();
            announce(`Turns regrouped. ${failures.length} failures still listed. Jump to failure available.`);
          }}
        >
          Regroup completed runs
        </button>
      )}
      {failures.length > 0 && (
        <button type="button" className="btn btn-secondary jump-failure" onClick={onJumpToFailure}>
          Jump to failure (Turn {pad(failures[0])})
        </button>
      )}
      {carriageNo != null && (
        <p className="carriage" aria-hidden="true">
          <span className="carriage-label">Viewing</span> Turn {pad(carriageNo)}
        </p>
      )}
    </nav>
  );
}
