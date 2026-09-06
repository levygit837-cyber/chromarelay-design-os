/**
 * EvidenceWing + BrowserView + FileTreeView + GitHubChecksView (SC-7).
 * Cite-back header invariant: kicker + cite line + scope in every sub-state.
 */
import { useState } from 'react';
import type { TurnEvidence, WingView } from '../model';
import { citeLine } from '../fixtures';
import { EmptyFrame } from './shared';

const TABS: Array<{ id: WingView; label: string }> = [
  { id: 'browser', label: 'Browser' },
  { id: 'files', label: 'Files' },
  { id: 'github', label: 'GitHub' },
];

function BrowserPanel({ turnNo, slot, onRetry, onShowTicket, announce }: BasePanel & { slot: TurnEvidence['browser'] }) {
  if (slot.state === 'empty')
    return (
      <EmptyFrame
        title={`No browser excerpt for Turn ${String(turnNo).padStart(2, '0')}.`}
        body="No browser excerpt for this turn."
        actionLabel="Show ticket"
        onAction={() => {
          onShowTicket();
          announce(`No browser excerpt for Turn ${String(turnNo).padStart(2, '0')}.`);
        }}
      />
    );
  if (slot.state === 'error')
    return (
      <div className="error-panel" role="group" aria-label="Browser view failed">
        <p className="errorbox-title">Browser view failed to load.</p>
        <p>Retry re-runs the local stub deterministically.</p>
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              onRetry();
              announce('Browser view failed to load. Retry available.', true);
            }}
          >
            Retry view
          </button>
          <button type="button" className="btn btn-secondary" onClick={onShowTicket}>
            Show ticket
          </button>
        </div>
      </div>
    );
  const b = slot.data;
  return (
    <div className="browser-panel">
      <h3 className="panel-title">{b.title}</h3>
      <a className="panel-url" href={b.url} onClick={(e) => e.preventDefault()}>
        {b.url}
      </a>
      <blockquote className="panel-excerpt">{b.excerpt}</blockquote>
      <p className="panel-cite">{b.excerptRange}</p>
    </div>
  );
}

function FilesPanel({ turnNo, slot, onRetry, onShowTicket, announce }: BasePanel & { slot: TurnEvidence['files'] }) {
  const [openDirs, setOpenDirs] = useState<string[]>(['src/lib/']);
  if (slot.state === 'empty')
    return (
      <EmptyFrame
        title={`No files for Turn ${String(turnNo).padStart(2, '0')}.`}
        body="No files cited this turn."
        actionLabel="Show ticket"
        onAction={() => {
          onShowTicket();
          announce(`No files for Turn ${String(turnNo).padStart(2, '0')}.`);
        }}
      />
    );
  if (slot.state === 'error')
    return (
      <div className="error-panel" role="group" aria-label="Files view failed">
        <p className="errorbox-title">Files view failed to load.</p>
        <p>Retry re-runs the local stub deterministically.</p>
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              onRetry();
              announce('Files view failed to load. Retry available.', true);
            }}
          >
            Retry view
          </button>
          <button type="button" className="btn btn-secondary" onClick={onShowTicket}>
            Show ticket
          </button>
        </div>
      </div>
    );
  const rows = slot.data;
  const changed = rows.filter((r) => r.change !== 'none').length;
  void changed;
  return (
    <ul className="file-tree">
      {rows.map((r) =>
        r.kind === 'dir' ? (
          <li key={r.path} className="file-row">
            <button
              type="button"
              className="file-dir"
              aria-expanded={openDirs.includes(r.path)}
              onClick={() => setOpenDirs((d) => (d.includes(r.path) ? d.filter((x) => x !== r.path) : [...d, r.path]))}
            >
              <span aria-hidden="true">{openDirs.includes(r.path) ? '▾' : '▸'}</span> {r.path}
            </button>
          </li>
        ) : (
          <li key={r.path} className="file-row">
            <button type="button" className="file-item" onClick={onShowTicket} aria-label={`${r.path}, ${r.change}, ${r.status}`}>
              <span className={`change-dot change-${r.change}`} aria-hidden="true" />
              <span className="file-path">{r.path}</span>
              <span className={`file-status status-${r.status}`}>
                {r.status === 'ok' ? '● Done' : r.status === 'run' ? '◐ Running' : '■ Failed'}
              </span>
            </button>
          </li>
        ),
      )}
    </ul>
  );
}

function GitHubPanel({ turnNo, slot, onRetry, onShowTicket, announce }: BasePanel & { slot: TurnEvidence['github'] }) {
  if (slot.state === 'empty')
    return (
      <EmptyFrame
        title={`No GitHub summary for Turn ${String(turnNo).padStart(2, '0')}.`}
        body="No GitHub activity cited this turn."
        actionLabel="Show ticket"
        onAction={() => {
          onShowTicket();
          announce(`No GitHub summary for Turn ${String(turnNo).padStart(2, '0')}.`);
        }}
      />
    );
  if (slot.state === 'error')
    return (
      <div className="error-panel" role="group" aria-label="GitHub view failed">
        <p className="errorbox-title">GitHub view failed to load.</p>
        <p>Retry re-runs the local stub deterministically.</p>
        <div className="row-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              onRetry();
              announce('GitHub view failed to load. Retry available.', true);
            }}
          >
            Retry view
          </button>
          <button type="button" className="btn btn-secondary" onClick={onShowTicket}>
            Show ticket
          </button>
        </div>
      </div>
    );
  const g = slot.data;
  return (
    <ul className="github-rows">
      <li className="github-row">
        <span className="github-repo">{g.repo}</span>
        <span className="github-ref">{g.ref}</span>
        <span className="github-summary">{g.summary}</span>
      </li>
    </ul>
  );
}

interface BasePanel {
  turnNo: number;
  onRetry: () => void;
  onShowTicket: () => void;
  announce: (msg: string, assertive?: boolean) => void;
}

export function EvidenceWing({
  turnNo,
  kind,
  target,
  sessionTitle,
  evidence,
  view,
  retryTick,
  onTab,
  onRetryView,
  onShowTicket,
  announce,
}: {
  turnNo: number | null;
  kind: string;
  target: string;
  sessionTitle: string;
  evidence: TurnEvidence | null;
  view: WingView;
  retryTick: number;
  onTab: (v: WingView) => void;
  onRetryView: () => void;
  onShowTicket: () => void;
  announce: (msg: string, assertive?: boolean) => void;
}) {
  const onKeyTab = (e: React.KeyboardEvent, id: WingView) => {
    const idx = TABS.findIndex((t) => t.id === id);
    let next: WingView | null = null;
    if (e.key === 'ArrowRight') next = TABS[(idx + 1) % TABS.length].id;
    else if (e.key === 'ArrowLeft') next = TABS[(idx - 1 + TABS.length) % TABS.length].id;
    else if (e.key === 'Home') next = TABS[0].id;
    else if (e.key === 'End') next = TABS[TABS.length - 1].id;
    if (next) {
      e.preventDefault();
      onTab(next);
      document.getElementById(`wing-tab-${next}`)?.focus();
      if (turnNo != null) announce(`${next[0].toUpperCase()}${next.slice(1)} view shown for Turn ${String(turnNo).padStart(2, '0')}.`);
    }
  };

  const emptyEvidence: TurnEvidence = { browser: { state: 'empty' }, files: { state: 'empty' }, github: { state: 'empty' } };
  const ev = evidence ?? emptyEvidence;
  const base = {
    turnNo: turnNo ?? 0,
    onRetry: onRetryView,
    onShowTicket,
    announce,
  };

  return (
    <div className="wing-body" key={retryTick}>
      {turnNo == null ? (
        <EmptyFrame
          title="No turn selected."
          body="Open a session to cite evidence."
          actionLabel="Show ticket"
          onAction={onShowTicket}
        />
      ) : (
        <>
          <p className="wing-cite">
            <span className="cite-kicker">Attachment</span>
            <span className="cite-line">{citeLine(turnNo, kind, target)}</span>
            <span className="cite-scope">
              Session {sessionTitle} · {view[0].toUpperCase()}
              {view.slice(1)}
            </span>
          </p>
          <div role="tablist" aria-label="Evidence views" className="wing-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`wing-tab-${t.id}`}
                aria-selected={view === t.id}
                aria-controls={`wing-panel-${t.id}`}
                tabIndex={view === t.id ? 0 : -1}
                className={`wing-tab${view === t.id ? ' is-active' : ''}`}
                onClick={() => {
                  onTab(t.id);
                  announce(`${t.label} view shown for Turn ${String(turnNo).padStart(2, '0')}.`);
                }}
                onKeyDown={(e) => onKeyTab(e, t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div role="tabpanel" id={`wing-panel-${view}`} aria-labelledby={`wing-tab-${view}`} className="wing-panel" tabIndex={0}>
            {view === 'browser' && <BrowserPanel {...base} slot={ev.browser} />}
            {view === 'files' && <FilesPanel {...base} slot={ev.files} />}
            {view === 'github' && <GitHubPanel {...base} slot={ev.github} />}
          </div>
        </>
      )}
    </div>
  );
}
