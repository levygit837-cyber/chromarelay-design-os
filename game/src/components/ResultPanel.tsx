import { useEffect, useRef } from 'react';

export interface ResultRow {
  name: string;
  damage: number;
  meter: number;
  mapTicks: number;
  passiveProcs: number;
  activeCycle: string;
  ultCycle: string;
}

interface Props {
  winner: string;
  subtitle: string;
  score: string;
  rows: ResultRow[];
  strokes: string;
  onRematch: () => void;
  onChange: () => void;
  onExit: () => void;
}

/** ResultPanel: vencedor + história em sequência de traços + stats; rematch a uma tecla. */
export function ResultPanel({ winner, subtitle, score, rows, strokes, onRematch, onChange, onExit }: Props): JSX.Element {
  const rematchRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    rematchRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        onRematch();
      } else if (ev.key === 'f' || ev.key === 'F') {
        onChange();
      } else if (ev.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onRematch, onChange, onExit]);

  return (
    <section className="panel result" aria-label="Duel result">
      <div className="ko-word">KO</div>
      <h2 className="display">{winner} wins</h2>
      <p className="muted">{subtitle}</p>
      <p className="score">{score}</p>
      <p className="strokes-line">{strokes}</p>
      <table className="stats">
        <thead>
          <tr>
            <th>Fighter</th>
            <th>Damage</th>
            <th>Meter</th>
            <th>Map ticks</th>
            <th>Passive procs</th>
            <th>Key-1 cycle</th>
            <th>Ult cycle</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td>{r.name}</td>
              <td>{r.damage}</td>
              <td>{r.meter}</td>
              <td>{r.mapTicks}</td>
              <td>{r.passiveProcs}</td>
              <td>{r.activeCycle}</td>
              <td>{r.ultCycle}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="btn-row">
        <button ref={rematchRef} className="btn primary" onClick={onRematch}>
          Rematch ⏎
        </button>
        <button className="btn" onClick={onChange}>
          Change (F)
        </button>
        <button className="btn" onClick={onExit}>
          Menu (Esc)
        </button>
      </div>
    </section>
  );
}
