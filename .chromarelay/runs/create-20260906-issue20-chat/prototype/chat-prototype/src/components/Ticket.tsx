/**
 * WorkOrderTicket + ToolTraceRow + ExpandedWell (SC-1/2/3).
 * Ticket internal order: head -> prose -> tool rows -> well -> footer.
 */
import type { ToolCall, Turn } from '../model';
import { formatDuration, pad } from '../fixtures';
import type { StatusKind } from '../tokens';
import { StatusPill } from './shared';

function toolStatusKind(s: ToolCall['status']): StatusKind {
  return s === 'succeeded' ? 'ok' : s === 'running' || s === 'staged' ? 'run' : s === 'failed' ? 'bad' : 'idle';
}

function toolStatusWord(s: ToolCall['status']): string {
  return s === 'succeeded' ? 'Done' : s === 'running' ? 'Running' : s === 'staged' ? 'Staged' : s === 'failed' ? 'Failed' : 'Queued';
}

function toolGlyph(s: ToolCall['status']): string {
  return s === 'succeeded' ? '●' : s === 'running' || s === 'staged' ? '◐' : s === 'failed' ? '■' : '○';
}

function turnKind(t: Turn): StatusKind {
  return t.status === 'ok' ? 'ok' : t.status === 'running' ? 'run' : t.status === 'failed' ? 'bad' : 'idle';
}

export function ToolRow({
  turn,
  tool,
  expanded,
  onToggle,
  announce,
}: {
  turn: Turn;
  tool: ToolCall;
  expanded: boolean;
  onToggle: () => void;
  announce: (msg: string) => void;
}) {
  const wellId = `well-${turn.no}-${tool.id}`;
  return (
    <li className="tool-row">
      <span className="kind-chip">{tool.kind}</span>
      <span className="tool-target">{tool.target}</span>
      <span className={`tool-status status-${toolStatusKind(tool.status)}`}>
        <span aria-hidden="true">{toolGlyph(tool.status)}</span> {toolStatusWord(tool.status)}
      </span>
      <span className="tool-duration">{formatDuration(tool.durationMs)}</span>
      <button
        type="button"
        className="chevron"
        aria-expanded={expanded}
        aria-controls={wellId}
        aria-label={`${expanded ? 'Hide' : 'Show'} detail for ${tool.kind} ${tool.target}, Turn ${pad(turn.no)}`}
        onClick={() => {
          onToggle();
          announce(
            expanded ? 'Detail hidden.' : `Detail for ${tool.kind} ${tool.target} shown. Cites Turn ${pad(turn.no)}.`,
          );
        }}
      >
        <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
      </button>
    </li>
  );
}

function WellBody({ turn, tool }: { turn: Turn; tool: ToolCall }) {
  const d = tool.detail;
  switch (d.variant) {
    case 'queued-note':
      return <p className="queued-note">Queued — detail lands when the step starts.</p>;
    case 'staged':
      return (
        <div className="staged-block">
          <p className="staged-title">Working — step {d.step} of {d.steps} in stub</p>
          <div className="staged-bar" role="progressbar" aria-valuenow={d.step} aria-valuemin={0} aria-valuemax={d.steps} aria-label={`Step ${d.step} of ${d.steps}`}>
            <span className="staged-fill" style={{ width: `${((d.step ?? 0) / (d.steps ?? 1)) * 100}%` }} />
          </div>
        </div>
      );
    case 'diff':
      return (
        <pre className="diff-block">
          {(d.diff ?? []).map((l, i) => (
            <code key={i} className={`diff-${l.kind}`}>
              {l.kind === 'add' ? '+' : l.kind === 'del' ? '−' : ' '} {l.text}
              {'\n'}
            </code>
          ))}
        </pre>
      );
    case 'cmdout':
      return (
        <pre className="cmdout-block" aria-label={`Command output, exit ${d.cmdoutExit}`}>
          {(d.cmdout ?? []).join('\n')}
        </pre>
      );
    case 'excerpt':
      return (
        <figure className="excerpt-block">
          <blockquote>{d.excerpt}</blockquote>
          <figcaption>{d.excerptRange}</figcaption>
        </figure>
      );
    case 'errorbox':
      return (
        <div className="errorbox" role="group" aria-label={`Error for Turn ${pad(turn.no)}`}>
          <p className="errorbox-title">Failed — exit code {d.exitCode}</p>
          <p className="errorbox-msg">{d.error}</p>
        </div>
      );
  }
}

export function ExpandedWell({
  turn,
  tool,
  onCopy,
  onCite,
  onRetry,
  announce,
}: {
  turn: Turn;
  tool: ToolCall;
  onCopy: () => void;
  onCite: () => void;
  onRetry?: () => void;
  announce: (msg: string) => void;
}) {
  return (
    <section className="well" id={`well-${turn.no}-${tool.id}`} aria-label={`Turn ${pad(turn.no)} / ${tool.kind} ${tool.target}`}>
      <p className="cite-line">
        Turn {pad(turn.no)} / {tool.kind} {tool.target}
      </p>
      <WellBody turn={turn} tool={tool} />
      <div className="well-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            onCopy();
            announce(`Target ${tool.target} copied.`);
          }}
        >
          Copy target
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCite}>
          Cite in wing
        </button>
        {onRetry && (
          <button type="button" className="btn btn-danger" onClick={onRetry}>
            Retry Turn {pad(turn.no)} (attempt {turn.attempt + 1})
          </button>
        )}
      </div>
    </section>
  );
}

export function WorkOrderTicket({
  turn,
  selected,
  openWellId,
  streaming,
  onSelect,
  onToggleWell,
  onRetry,
  onDismiss,
  onInterrupt,
  onCite,
  onCopy,
  announce,
}: {
  turn: Turn;
  selected: boolean;
  openWellId: string | null;
  streaming: boolean;
  onSelect: () => void;
  onToggleWell: (toolId: string | null) => void;
  onRetry: () => void;
  onDismiss: () => void;
  onInterrupt: () => void;
  onCite: (toolId: string | null) => void;
  onCopy: (text: string) => void;
  announce: (msg: string, assertive?: boolean) => void;
}) {
  const edge = turn.status === 'failed' ? 'edge-failed' : turn.status === 'running' ? 'edge-running' : selected ? 'edge-active' : 'edge-idle';
  return (
    <article
      className={`ticket ${edge}${selected ? ' is-selected' : ''}`}
      aria-labelledby={`ticket-title-${turn.no}`}
      id={`ticket-${turn.no}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, a, input, textarea')) return;
        onSelect();
      }}
    >
      <header className="ticket-head">
        <span className="numeral" aria-hidden="true">
          {pad(turn.no)}
        </span>
        <div className="head-main">
          <h2 className="ticket-title" id={`ticket-title-${turn.no}`}>
            Turn {pad(turn.no)}: {turn.title}
          </h2>
          <p className="ticket-subline">{turn.subline}</p>
          <p className="ticket-rollup">
            <StatusPill status={turnKind(turn)} /> <span className="rollup-sub">{turn.subline}</span>
          </p>
        </div>
        <div className="head-side">
          <StatusPill status={turnKind(turn)} />
          <span className="ticket-duration">{formatDuration(turn.durationMs)}</span>
        </div>
      </header>
      <p className="ticket-role">Assistant</p>
      {streaming ? (
        <div className="streaming-block">
          <p className="skeleton" aria-hidden="true">
            <span className="sk-line" /> <span className="sk-line short" />
          </p>
          <p className="streaming-honest">
            Working — step 2 of 4 in stub <span className="caret" aria-hidden="true">▍</span>
          </p>
          <button type="button" className="btn btn-secondary" onClick={onInterrupt}>
            Interrupt turn
          </button>
        </div>
      ) : (
        <p className="ticket-prose">{turn.prose}</p>
      )}
      {turn.tools.length === 0 ? (
        <div className="empty-trace" role="group" aria-label={`Turn ${pad(turn.no)} has no tool activity`}>
          <p>No tools ran this turn. Nothing to cite.</p>
        </div>
      ) : (
        <ul className="tool-list">
          {turn.tools.map((tool) => (
            <div key={tool.id} className="tool-slot">
              <ToolRow
                turn={turn}
                tool={tool}
                expanded={openWellId === tool.id}
                onToggle={() => onToggleWell(openWellId === tool.id ? null : tool.id)}
                announce={announce}
              />
              {openWellId === tool.id && (
                <ExpandedWell
                  turn={turn}
                  tool={tool}
                  onCopy={() => onCopy(tool.target)}
                  onCite={() => onCite(tool.id)}
                  onRetry={turn.status === 'failed' && !turn.dismissed ? onRetry : undefined}
                  announce={announce}
                />
              )}
            </div>
          ))}
        </ul>
      )}
      {turn.status === 'failed' && !turn.dismissed && (
        <div className="errorbox ticket-errorbox" role="group" aria-label={`Turn ${pad(turn.no)} failure`}>
          <p className="errorbox-title">Turn {pad(turn.no)} failed — retry keeps this attempt</p>
          <p className="errorbox-msg">{turn.tools.find((t) => t.status === 'failed')?.detail.error}</p>
        </div>
      )}
      {turn.dismissed && (
        <p className="dismissed-note">
          Dismissed: {turn.dismissed.reason}
          {turn.dismissed.note ? ` — ${turn.dismissed.note}` : ''}
        </p>
      )}
      <footer className="ticket-footer">
        {turn.status === 'failed' && !turn.dismissed ? (
          <>
            <button type="button" className="btn btn-danger" onClick={onRetry}>
              Retry Turn {pad(turn.no)} (attempt {turn.attempt + 1})
            </button>
            <button type="button" className="btn btn-secondary" onClick={onDismiss}>
              Dismiss Turn {pad(turn.no)}…
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={() => onCite(openWellId)}>
            Cite in wing
          </button>
        )}
      </footer>
    </article>
  );
}
