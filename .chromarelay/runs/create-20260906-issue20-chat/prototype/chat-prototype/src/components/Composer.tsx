/** Composer + ModeToggle + FollowUpList (SC-5). Per-session draft/mode scoping lives in App. */
import type { ComposerMode } from '../model';

export function Composer({
  draft,
  mode,
  followUps,
  running,
  sending,
  onType,
  onSend,
  onMode,
  onPickFollowUp,
}: {
  draft: string;
  mode: ComposerMode;
  followUps: string[];
  running: boolean;
  sending: boolean;
  onType: (v: string) => void;
  onSend: () => void;
  onMode: (m: ComposerMode) => void;
  onPickFollowUp: (label: string) => void;
}) {
  const canSend = draft.trim().length > 0 && !running && !sending;
  return (
    <form
      className="composer"
      aria-label="Message composer"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSend();
      }}
    >
      <div className="composer-head">
        <span className="composer-label" id="mode-label">
          Mode
        </span>
        <div className="mode-group" role="group" aria-labelledby="mode-label">
          {(['Plan', 'Act'] as ComposerMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`mode-btn${mode === m ? ' is-on' : ''}`}
              aria-pressed={mode === m}
              disabled={running || sending}
              onClick={() => onMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <span className="composer-hint">
          {mode} mode · stubbed replies land in under 300ms
        </span>
      </div>
      <label className="composer-field-label" htmlFor="composer-input">
        Message the assistant
      </label>
      <textarea
        id="composer-input"
        className="composer-input"
        rows={3}
        placeholder="Direct the assistant — e.g. run the checkout tests"
        value={draft}
        disabled={running || sending}
        onChange={(e) => onType(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSend) onSend();
        }}
      />
      {followUps.length > 0 && (
        <div className="followups" role="group" aria-label="Suggestions">
          {followUps.map((f) => (
            <button
              key={f}
              type="button"
              className="followup-btn"
              disabled={running || sending}
              onClick={() => onPickFollowUp(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}
      <div className="composer-foot">
        <button type="submit" className="btn btn-primary send-btn" disabled={!canSend}>
          {sending ? 'Sending…' : running ? 'Working…' : 'Send'}
        </button>
        <span className="composer-meta">Cmd/Ctrl+Enter to send</span>
      </div>
    </form>
  );
}
