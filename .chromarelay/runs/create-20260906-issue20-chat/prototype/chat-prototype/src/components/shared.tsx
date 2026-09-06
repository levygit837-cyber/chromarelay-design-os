/**
 * Shared presentational fragments: StatusPill, CiteBackStamp, EmptyFrame,
 * LiveRegion, FootnoteBlock. Native elements only (Component Plan SC-9).
 */
import type { StatusKind } from '../tokens';
import { statusGlyph, statusWord } from '../tokens';
import { pad } from '../fixtures';

export function StatusPill({ status, id }: { status: StatusKind; id?: string }) {
  return (
    <span className={`pill pill-${status}`} id={id}>
      <span className="pill-glyph" aria-hidden="true">
        {statusGlyph[status]}
      </span>{' '}
      {statusWord[status]}
    </span>
  );
}

export function CiteBackStamp({
  turnNo,
  kind,
  target,
  scope,
}: {
  turnNo: number;
  kind: string;
  target: string;
  scope: string;
}) {
  return (
    <p className="cite-stamp">
      <span className="cite-kicker">Attachment</span>{' '}
      <span className="cite-line">
        Turn {pad(turnNo)} / {kind} {target}
      </span>{' '}
      <span className="cite-scope">{scope}</span>
    </p>
  );
}

export function EmptyFrame({
  title,
  body,
  actionLabel,
  onAction,
  tone = 'empty',
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  tone?: 'empty' | 'error';
}) {
  return (
    <div className={`empty-frame empty-${tone}`} role="group" aria-label={title}>
      <p className="empty-title">{title}</p>
      <p className="empty-body">{body}</p>
      <button type="button" className="btn btn-secondary" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}

export function LiveRegion({ polite, assertive }: { polite: string; assertive: string }) {
  return (
    <>
      <div role="status" aria-label="Turn status" className="visually-hidden">
        {polite}
      </div>
      <div role="alert" aria-label="Turn errors" className="visually-hidden">
        {assertive}
      </div>
    </>
  );
}

export function FootnoteBlock({
  turnNo,
  sessionTitle,
  view,
  browserUrl,
  fileDots,
  githubRef,
}: {
  turnNo: number;
  sessionTitle: string;
  view: string;
  browserUrl?: string;
  fileDots?: string;
  githubRef?: string;
}) {
  if (!browserUrl && !fileDots && !githubRef) return null;
  return (
    <footer className="footnotes" aria-label="Evidence footnotes">
      {browserUrl && (
        <p className="footnote">
          Turn {pad(turnNo)} / Browser {browserUrl} — {sessionTitle} · {view}
        </p>
      )}
      {fileDots && (
        <p className="footnote">
          Turn {pad(turnNo)} / Files {fileDots} — {sessionTitle} · {view}
        </p>
      )}
      {githubRef && (
        <p className="footnote">
          Turn {pad(turnNo)} / GitHub {githubRef} — {sessionTitle} · {view}
        </p>
      )}
    </footer>
  );
}
