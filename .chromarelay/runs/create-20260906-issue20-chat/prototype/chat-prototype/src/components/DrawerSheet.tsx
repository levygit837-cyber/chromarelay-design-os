/** DrawerSheet (SC-8): sessions / attachment / dismiss-with-reason sheets over a scrim. */
import { useEffect, useRef } from 'react';
import { pad } from '../fixtures';

export type SheetKind = 'sessions' | 'attachment' | 'dismiss' | null;

const DISMISS_REASONS = ['obsolete', 'duplicate', 'wont-fix'] as const;

export function DrawerSheet({
  open,
  tether,
  title,
  turnNo,
  dismissReason,
  dismissNote,
  onReason,
  onNote,
  onConfirmDismiss,
  onClose,
  announce,
  children,
}: {
  open: SheetKind;
  tether: string;
  title: string;
  turnNo: number | null;
  dismissReason: string | null;
  dismissNote: string;
  onReason: (r: string) => void;
  onNote: (v: string) => void;
  onConfirmDismiss: () => void;
  onClose: () => void;
  announce: (msg: string) => void;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement | null;
      sheetRef.current?.querySelector<HTMLElement>('h2, button, input, textarea, [tabindex]')?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
          announce('Sheet closed.');
        }
        // Focus trap: wrap Tab at the sheet edges.
        if (e.key === 'Tab' && sheetRef.current) {
          const focusables = [...sheetRef.current.querySelectorAll<HTMLElement>('button, input, textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter(
            (el) => !el.hasAttribute('disabled'),
          );
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      document.addEventListener('keydown', onKey, true);
      return () => {
        document.removeEventListener('keydown', onKey, true);
        openerRef.current?.focus();
      };
    }
    return undefined;
  }, [open, onClose, announce]);

  if (!open) return null;
  return (
    <div className="sheet-root">
      <div
        className="scrim"
        aria-hidden="true"
        onClick={() => {
          onClose();
          announce('Sheet closed.');
        }}
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${tether}: ${title}`}
        className={`sheet sheet-${open}`}
      >
        <p className="sheet-tether">{tether}</p>
        <h2 className="sheet-title" tabIndex={-1}>
          {title}
        </h2>
        {open === 'dismiss' && turnNo != null ? (
          <div className="sheet-body">
            <p>Dismiss Turn {pad(turnNo)} with reason. The red spine node stays until resolved.</p>
            <fieldset className="dismiss-reasons">
              <legend>Reason (required)</legend>
              {DISMISS_REASONS.map((r) => (
                <label key={r} className="dismiss-option">
                  <input
                    type="radio"
                    name="dismiss-reason"
                    value={r}
                    checked={dismissReason === r}
                    onChange={() => onReason(r)}
                  />{' '}
                  {r}
                </label>
              ))}
            </fieldset>
            <label className="dismiss-note-label" htmlFor="dismiss-note">
              Note (optional)
            </label>
            <textarea
              id="dismiss-note"
              className="dismiss-note"
              rows={2}
              value={dismissNote}
              onChange={(e) => onNote(e.target.value)}
            />
            <div className="row-actions">
              <button
                type="button"
                className="btn btn-danger"
                disabled={!dismissReason}
                onClick={() => {
                  if (!dismissReason) announce('Choose a reason to dismiss.');
                  else onConfirmDismiss();
                }}
              >
                Confirm dismiss
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  announce('Sheet closed.');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="sheet-body">{children}</div>
        )}
        <button
          type="button"
          className="btn btn-secondary sheet-close"
          onClick={() => {
            onClose();
            announce('Sheet closed.');
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
