import { useEffect, useRef, type RefObject } from 'react';
import { FIGHTERS, type FighterId } from '../game/fighters';
import { MAPS, type MapId } from '../game/maps';

export const CONTROLS: Array<[string, string]> = [
  ['WASD / Arrows', 'move'],
  ['Shift', 'run modifier'],
  ['J', 'basic attack'],
  ['1', 'active skill'],
  ['U or R', 'Ultimate (needs 100 meter)'],
  ['P or Esc', 'pause'],
  ['M', 'mute (audio only)'],
  ['H', 'help'],
  ['Enter / Space', 'confirm'],
];

export function KitBlock({ id }: { id: FighterId }): JSX.Element {
  const d = FIGHTERS[id];
  return (
    <div className="kit">
      <h4>{d.name} <span className="muted">· {d.tag} · HP {d.hp}</span></h4>
      <p><strong>{d.basicName}</strong> — {d.basicDamage} dmg, range {d.basicRange}px, {d.basicMs}ms.</p>
      <p><strong>Passive · {d.passiveName}</strong> — {d.passiveText}</p>
      <p><strong>Key 1 · {d.activeName}</strong> — {d.activeText}</p>
      <p><strong>Ult · {d.ultName}</strong> — {d.ultText}</p>
    </div>
  );
}

export function MapRuleBlock({ id }: { id: MapId }): JSX.Element {
  const m = MAPS[id];
  return (
    <div className="kit">
      <h4>{m.name} <span className="muted">· {m.rule}</span></h4>
      <p>{m.ruleText}</p>
    </div>
  );
}

export function ControlsTable(): JSX.Element {
  return (
    <table className="stats">
      <thead>
        <tr><th>Keys</th><th>Action</th></tr>
      </thead>
      <tbody>
        {CONTROLS.map(([k, a]) => (
          <tr key={k}><td>{k}</td><td>{a}</td></tr>
        ))}
      </tbody>
    </table>
  );
}
/** Focus trap mínimo p/ sheets modais: autofocus inicial, Tab cicla dentro, foco volta ao invoker. */
function useSheetFocus(sheetRef: RefObject<HTMLDivElement>, initialRef: RefObject<HTMLButtonElement>): void {
  useEffect(() => {
    const invoker = document.activeElement as HTMLElement | null;
    initialRef.current?.focus();
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key !== 'Tab') return;
      const root = sheetRef.current;
      if (!root) return;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (items.length === 0) {
        ev.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (ev.shiftKey && (active === first || !root.contains(active))) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && (active === last || !root.contains(active))) {
        ev.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      invoker?.focus?.();
    };
  }, [sheetRef, initialRef]);
}

interface PauseProps {
  meterLine: string;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  muted: boolean;
  onMute: () => void;
  reduced: boolean;
  onReduced: () => void;
  player: FighterId;
  map: MapId;
}

/** Pause overlay: sim congelada + Tier-2 (kits, regra, controles, snapshot). */
export function PauseOverlay(p: PauseProps): JSX.Element {
  const resumeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  useSheetFocus(sheetRef, resumeRef);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape' || ev.key === 'p' || ev.key === 'P' || ev.key === 'Enter') {
        ev.preventDefault();
        p.onResume();
      } else if (ev.key === 'r' || ev.key === 'R') {
        p.onRestart();
      } else if (ev.key === 'q' || ev.key === 'Q') {
        p.onQuit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [p]);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Paused">
      <div className="sheet" ref={sheetRef}>
        <h2 className="display">Paused</h2>
        <p className="muted">{p.meterLine}</p>
        <div className="btn-row">
          <button ref={resumeRef} className="btn primary" onClick={p.onResume}>Resume (⏎)</button>
          <button className="btn" onClick={p.onRestart}>Restart (R)</button>
          <button className="btn" onClick={p.onQuit}>Quit (Q)</button>
        </div>
        <div className="btn-row">
          <button className="btn" onClick={p.onMute}>{p.muted ? 'Unmute (M)' : 'Mute (M)'}</button>
          <button className="btn" onClick={p.onReduced}>{p.reduced ? 'Motion: reduced ✓' : 'Motion: full'}</button>
        </div>
        <KitBlock id={p.player} />
        <KitBlock id={p.player === 'samurai' ? 'gunslinger' : 'samurai'} />
        <MapRuleBlock id={p.map} />
        <ControlsTable />
      </div>
    </div>
  );
}

interface HelpProps {
  onClose: () => void;
}

/** Help overlay: keymap + kits + regras; fechar não muda estado. */
export function HelpOverlay({ onClose }: HelpProps): JSX.Element {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  useSheetFocus(sheetRef, closeRef);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape' || ev.key === 'Enter') {
        ev.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Help">
      <div className="sheet" ref={sheetRef}>
        <h2 className="display">Help</h2>
        <ControlsTable />
        <KitBlock id="samurai" />
        <KitBlock id="gunslinger" />
        <MapRuleBlock id="caldera" />
        <MapRuleBlock id="rooftop" />
        <p className="muted">Mute (M) kills audio only. Reduced-motion freezes trails to stamps and disables shake/flash.</p>
        <div className="btn-row">
          <button ref={closeRef} className="btn primary" onClick={onClose}>Close (Esc)</button>
        </div>
      </div>
    </div>
  );
}
