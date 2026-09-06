import { useCallback, useEffect, useRef, useState } from 'react';
import { Engine, type Snapshot } from './game/engine';
import { FIGHTERS, OTHER, type FighterId } from './game/fighters';
import { MAPS, type MapId } from './game/maps';
import { StageCanvas } from './components/StageCanvas';
import { FighterHud } from './components/CartoucheHUD';
import { MapStrip } from './components/MapStrip';
import { ResultPanel, type ResultRow } from './components/ResultPanel';
import { HelpOverlay, KitBlock, MapRuleBlock, PauseOverlay } from './components/Overlays';

export type Screen = 'mode' | 'fighter' | 'map' | 'battle' | 'result';
export type Mode = 'duel' | 'dummy' | 'ember';

const MODES: Array<{ id: Mode; title: string; blurb: string }> = [
  { id: 'duel', title: 'Pit Duel vs AI', blurb: 'First to 2 rounds against the AI.' },
  { id: 'dummy', title: 'Training Dummy', blurb: 'A non-retaliating dummy. Practice combos.' },
  { id: 'ember', title: 'Timed Ember', blurb: '90 seconds — highest HP at the horn wins.' },
];

const MODE_SUB: Record<Mode, string> = {
  duel: 'First to 2',
  dummy: 'No retaliation',
  ember: 'Timed Ember · 90s',
};

export function App(): JSX.Element {
  const [screen, setScreen] = useState<Screen>('mode');
  const [mode, setMode] = useState<Mode>('duel');
  const [player, setPlayer] = useState<FighterId>('samurai');
  const [map, setMap] = useState<MapId>('caldera');
  const [muted, setMuted] = useState(false);
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [engine, setEngine] = useState<Engine | null>(null);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  const toggleReduced = useCallback(() => setReduced((r) => !r), []);

  useEffect(() => {
    engine?.setReducedMotion(reduced);
  }, [engine, reduced]);

  const startBattle = useCallback(
    (m: Mode, p: FighterId, mp: MapId) => {
      const e = new Engine({ player: p, map: mp, mode: m });
      e.setReducedMotion(reduced);
      e.startMatch();
      setEngine(e);
      setScreen('battle');
    },
    [reduced],
  );

  return (
    <div className="page">
      <header className="masthead">
        <h1 className="display title">Emberfall Arena</h1>
        <p className="muted tagline">Ink and Gunsmoke — a duel is a blank page interrupted by violence.</p>
      </header>

      {screen === 'mode' && (
        <ModeSelect
          mode={mode}
          onPick={setMode}
          onConfirm={(m) => {
            setMode(m);
            setScreen('fighter');
          }}
          muted={muted}
          onMute={toggleMute}
          onHelp={() => setHelpOpen(true)}
        />
      )}
      {screen === 'fighter' && (
        <FighterSelect
          player={player}
          onPick={setPlayer}
          onConfirm={(p) => {
            setPlayer(p);
            setScreen('map');
          }}
          onBack={() => setScreen('mode')}
          onHelp={() => setHelpOpen(true)}
        />
      )}
      {screen === 'map' && (
        <MapSelect
          map={map}
          onPick={setMap}
          onConfirm={(mp) => startBattle(mode, player, mp)}
          onBack={() => setScreen('fighter')}
          onHelp={() => setHelpOpen(true)}
        />
      )}
      {screen === 'battle' && engine && (
        <Battle
          key={`${mode}-${player}-${map}`}
          engine={engine}
          mode={mode}
          map={map}
          player={player}
          muted={muted}
          reduced={reduced}
          onMute={toggleMute}
          onReduced={toggleReduced}
          onEnd={() => setScreen('result')}
          onQuit={() => setScreen('mode')}
        />
      )}
      {screen === 'result' && engine && (
        <ResultView
          engine={engine}
          mode={mode}
          muted={muted}
          onMute={toggleMute}
          onRematch={() => startBattle(mode, player, map)}
          onChange={() => setScreen('fighter')}
          onExit={() => setScreen('mode')}
        />
      )}

      {helpOpen && screen !== 'battle' && <HelpOverlay onClose={() => setHelpOpen(false)} />}
      <footer className="foot muted">
        {muted ? 'Muted (M) · ' : 'Unmuted — state only (M) · '}
        {reduced ? 'Reduced motion ✓' : 'Full motion'} · Press H for help
      </footer>
    </div>
  );
}

/* ---------- menus ---------- */

function useArrowMenu(count: number, initial: number, onConfirm: (i: number) => void): [number, (i: number) => void, (ev: React.KeyboardEvent) => void, (i: number) => (el: HTMLButtonElement | null) => void] {
  const [index, setIndex] = useState(initial);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const pick = useCallback((i: number) => setIndex(i), []);
  const refFor = useCallback(
    (i: number) => (el: HTMLButtonElement | null) => {
      refs.current[i] = el;
    },
    [],
  );
  useEffect(() => {
    refs.current[index]?.focus();
  }, [index]);
  const onKey = useCallback(
    (ev: React.KeyboardEvent) => {
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') {
        ev.preventDefault();
        setIndex((v) => (v + 1) % count);
      } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
        ev.preventDefault();
        setIndex((v) => (v - 1 + count) % count);
      } else if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        onConfirm(index);
      }
    },
    [count, index, onConfirm],
  );
  return [index, pick, onKey, refFor];
}

function ModeSelect(props: {
  mode: Mode;
  onPick: (m: Mode) => void;
  onConfirm: (m: Mode) => void;
  muted: boolean;
  onMute: () => void;
  onHelp: () => void;
}): JSX.Element {
  const ids = MODES.map((m) => m.id);
  const confirm = useCallback((i: number) => props.onConfirm(ids[i]), [ids, props]);
  const [index, pick, onKey, refFor] = useArrowMenu(MODES.length, Math.max(0, ids.indexOf(props.mode)), confirm);
  useEffect(() => {
    props.onPick(ids[index]);
  }, [index, ids, props]);
  return (
    <section className="menu" aria-label="Choose mode">
      <h2 className="display">Choose your duel</h2>
      <div className="cards" onKeyDown={onKey} role="listbox" aria-label="Modes">
        {MODES.map((m, i) => (
          <button
            key={m.id}
            ref={refFor(i)}
            role="option"
            aria-selected={i === index}
            className={`card ${i === index ? 'selected' : ''}`}
            onMouseEnter={() => pick(i)}
            onFocus={() => pick(i)}
            onClick={() => confirm(i)}
          >
            <span className="seal-dot" aria-hidden="true" />
            <span className="card-title">{m.title}</span>
            <span className="card-blurb">{m.blurb}</span>
          </button>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn primary" onClick={() => confirm(index)}>Continue ⏎</button>
        <button className="btn" onClick={props.onHelp}>Help (H)</button>
        <button className="btn" onClick={props.onMute}>{props.muted ? 'Unmute (M)' : 'Mute (M)'}</button>
      </div>
    </section>
  );
}

function FighterSelect(props: {
  player: FighterId;
  onPick: (f: FighterId) => void;
  onConfirm: (f: FighterId) => void;
  onBack: () => void;
  onHelp: () => void;
}): JSX.Element {
  const ids: FighterId[] = ['samurai', 'gunslinger'];
  const confirm = useCallback((i: number) => props.onConfirm(ids[i]), [ids, props]);
  const [index, pick, onKey, refFor] = useArrowMenu(2, Math.max(0, ids.indexOf(props.player)), confirm);
  useEffect(() => {
    props.onPick(ids[index]);
  }, [index, ids, props]);
  return (
    <section className="menu" aria-label="Choose fighter">
      <h2 className="display">Choose your fighter</h2>
      <div className="cards" onKeyDown={onKey} role="listbox" aria-label="Fighters">
        {ids.map((id, i) => {
          const d = FIGHTERS[id];
          return (
            <button
              key={id}
              ref={refFor(i)}
              role="option"
              aria-selected={i === index}
              className={`card ${i === index ? 'selected' : ''}`}
              onMouseEnter={() => pick(i)}
              onFocus={() => pick(i)}
              onClick={() => confirm(i)}
            >
              <span className="seal-dot" aria-hidden="true" />
              <span className="card-title">{d.name}</span>
              <span className="card-blurb">{d.tag} · HP {d.hp}</span>
            </button>
          );
        })}
      </div>
      <KitBlock id={ids[index]} />
      <div className="btn-row">
        <button className="btn primary" onClick={() => confirm(index)}>Continue ⏎</button>
        <button className="btn" onClick={props.onBack}>Back (Esc)</button>
        <button className="btn" onClick={props.onHelp}>Help (H)</button>
      </div>
    </section>
  );
}

function MapSelect(props: {
  map: MapId;
  onPick: (m: MapId) => void;
  onConfirm: (m: MapId) => void;
  onBack: () => void;
  onHelp: () => void;
}): JSX.Element {
  const ids: MapId[] = ['caldera', 'rooftop'];
  const confirm = useCallback((i: number) => props.onConfirm(ids[i]), [ids, props]);
  const [index, pick, onKey, refFor] = useArrowMenu(2, Math.max(0, ids.indexOf(props.map)), confirm);
  useEffect(() => {
    props.onPick(ids[index]);
  }, [index, ids, props]);
  return (
    <section className="menu" aria-label="Choose map">
      <h2 className="display">Choose the ground</h2>
      <div className="cards" onKeyDown={onKey} role="listbox" aria-label="Maps">
        {ids.map((id, i) => {
          const m = MAPS[id];
          return (
            <button
              key={id}
              ref={refFor(i)}
              role="option"
              aria-selected={i === index}
              className={`card ${i === index ? 'selected' : ''}`}
              onMouseEnter={() => pick(i)}
              onFocus={() => pick(i)}
              onClick={() => confirm(i)}
            >
              <span className="seal-dot" aria-hidden="true" />
              <span className="card-title">{m.name}</span>
              <span className="card-blurb">{m.rule} — {m.ruleShort}</span>
            </button>
          );
        })}
      </div>
      <MapRuleBlock id={ids[index]} />
      <div className="btn-row">
        <button className="btn primary" onClick={() => confirm(index)}>To battle ⏎</button>
        <button className="btn" onClick={props.onBack}>Back (Esc)</button>
        <button className="btn" onClick={props.onHelp}>Help (H)</button>
      </div>
    </section>
  );
}

/* ---------- battle ---------- */

/** Live announcer: espelha numerals do countdown + KO + fases de mapa p/ tecnologia assistiva. */
function Announcer({ snap }: { snap: Snapshot }): JSX.Element {
  let phaseMsg = '';
  if (snap.phase === 'entrance') phaseMsg = `${MAPS[snap.mapKind].name} — entrance`;
  else if (snap.phase === 'countdown') phaseMsg = `Countdown ${snap.countdownN}`;
  else if (snap.phase === 'ko') phaseMsg = 'KO';
  else if (snap.phase === 'done') phaseMsg = 'Duel done';
  else phaseMsg = 'Fighting';
  const mapMsg =
    snap.mapPhase === 'telegraph' ? 'Surge telegraph'
    : snap.mapPhase === 'ignite' ? 'Ignite'
    : snap.mapPhase === 'dim' ? 'Blackout dimming'
    : snap.mapPhase === 'hold' ? 'Blackout hold'
    : snap.mapPhase === 'restore' ? 'Blackout restoring'
    : '';
  const text = mapMsg ? `${phaseMsg}. ${mapMsg}.` : `${phaseMsg}.`;
  return (
    <p className="visually-hidden" aria-live="polite" role="status">
      {text}
    </p>
  );
}

function Battle(props: {
  engine: Engine;
  mode: Mode;
  map: MapId;
  player: FighterId;
  muted: boolean;
  reduced: boolean;
  onMute: () => void;
  onReduced: () => void;
  onEnd: () => void;
  onQuit: () => void;
}): JSX.Element {
  const { engine } = props;
  const [snap, setSnap] = useState<Snapshot>({ ...engine.snap });
  const [paused, setPaused] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const keys = useRef({ up: false, down: false, left: false, right: false, run: false, basic: false, active: false, ult: false });
  const tap = useRef<{ dx: number; dy: number } | null>(null);
  const frozen = paused || helpOpen;

  const push = useCallback(() => {
    const k = keys.current;
    let mx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
    let my = (k.down ? 1 : 0) - (k.up ? 1 : 0);
    if (tap.current) {
      mx = tap.current.dx;
      my = tap.current.dy;
    }
    engine.setPlayerInput(mx, my, k.run, k.basic, k.active, k.ult);
  }, [engine]);

  useEffect(() => engine.subscribe((s) => setSnap({ ...s })), [engine]);

  useEffect(() => {
    if (snap.phase === 'done') props.onEnd();
  }, [snap.phase, props]);

  useEffect(() => {
    const down = (ev: KeyboardEvent): void => {
      const k = keys.current;
      switch (ev.key) {
        case 'ArrowUp': case 'w': case 'W': k.up = true; ev.preventDefault(); break;
        case 'ArrowDown': case 's': case 'S': k.down = true; ev.preventDefault(); break;
        case 'ArrowLeft': case 'a': case 'A': k.left = true; ev.preventDefault(); break;
        case 'ArrowRight': case 'd': case 'D': k.right = true; ev.preventDefault(); break;
        case 'Shift': k.run = true; break;
        case 'j': case 'J': k.basic = true; break;
        case '1': k.active = true; break;
        case 'u': case 'U': case 'r': case 'R': k.ult = true; break;
        case 'p': case 'P': case 'Escape':
          ev.preventDefault();
          if (!helpOpen) setPaused((v) => !v);
          else setHelpOpen(false);
          return;
        case 'm': case 'M': props.onMute(); return;
        case 'h': case 'H': setHelpOpen((v) => !v); return;
        default: return;
      }
      push();
    };
    const up = (ev: KeyboardEvent): void => {
      const k = keys.current;
      switch (ev.key) {
        case 'ArrowUp': case 'w': case 'W': k.up = false; break;
        case 'ArrowDown': case 's': case 'S': k.down = false; break;
        case 'ArrowLeft': case 'a': case 'A': k.left = false; break;
        case 'ArrowRight': case 'd': case 'D': k.right = false; break;
        case 'Shift': k.run = false; break;
        case 'j': case 'J': k.basic = false; break;
        case '1': k.active = false; break;
        case 'u': case 'U': case 'r': case 'R': k.ult = false; break;
        default: return;
      }
      push();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [push, helpOpen, props]);

  const canvasTap = useCallback(
    (ev: React.PointerEvent<HTMLDivElement>) => {
      const rect = (ev.currentTarget.querySelector('canvas') as HTMLCanvasElement | null)?.getBoundingClientRect();
      if (!rect) return;
      const px = ((ev.clientX - rect.left) / rect.width) * 1280;
      const py = ((ev.clientY - rect.top) / rect.height) * 720;
      const f = engine.fighters[0];
      const dx = px - f.x;
      const dy = py - f.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      tap.current = { dx: dx / len, dy: dy / len };
      push();
    },
    [engine, push],
  );
  const canvasRelease = useCallback(() => {
    tap.current = null;
    push();
  }, [push]);

  const hold = (name: 'basic' | 'active' | 'ult') => ({
    onPointerDown: (ev: React.PointerEvent): void => {
      ev.preventDefault();
      keys.current[name] = true;
      push();
    },
    onPointerUp: (): void => {
      keys.current[name] = false;
      push();
    },
    onPointerLeave: (): void => {
      keys.current[name] = false;
      push();
    },
  });

  const a = engine.fighters[0];
  const b = engine.fighters[1];
  const aCd = a.activeCd <= 0 ? 'ready' : Math.ceil(a.activeCd) + 's';
  const bCd = b.activeCd <= 0 ? 'ready' : Math.ceil(b.activeCd) + 's';
  const meterLine = a.def.name + ' ' + Math.floor(a.meter) + '/100 key-1 ' + aCd + ' · ' + b.def.name + ' ' + Math.floor(b.meter) + '/100 key-1 ' + bCd;

  return (
    <section className="battle" aria-label="Battle">
      <Announcer snap={snap} />
      <div className="hud-top">
        <FighterHud def={a.def} hp={snap.hpA} max={snap.maxA} meter={snap.meterA} cd={snap.cdA} cdTotal={a.def.activeCooldownS} ultReady={snap.ultA} tag="you" />
        <div className="hud-center">
          <div className="timer" aria-label="Round timer">{fmtTime(snap.timerS)}</div>
          <div className="round-line muted">
            {props.mode === 'ember' ? 'Timed Ember' : `Round ${snap.roundN} · ${snap.winsA}—${snap.winsB}`} · {MODE_SUB[props.mode]}
          </div>
        </div>
        <FighterHud def={b.def} hp={snap.hpB} max={snap.maxB} meter={snap.meterB} cd={snap.cdB} cdTotal={b.def.activeCooldownS} ultReady={snap.ultB} tag={props.mode === 'dummy' ? 'dummy' : 'AI'} />
      </div>
      <div className="stage-wrap" onPointerDown={canvasTap} onPointerUp={canvasRelease} onPointerLeave={canvasRelease}>
        <StageCanvas engine={engine} paused={frozen} />
      </div>
      <MapStrip mapId={snap.mapKind} phase={snap.mapPhase} countdownS={snap.mapCountdownS} litMask={snap.litMask} />
      <p className="muted center pointer-hint">Click or tap the stage to steer your fighter toward the pointer.</p>
      <div className="touch-row" aria-label="Touch controls">
        <button className="btn" {...hold('basic')}>Basic (J)</button>
        <button className="btn" {...hold('active')}>Key-1 (1)</button>
        <button className="btn" {...hold('ult')}>Ult (U)</button>
        <button className="btn" onClick={() => setPaused(true)}>Pause (P)</button>
      </div>
      {paused && (
        <PauseOverlay
          meterLine={meterLine}
          onResume={() => setPaused(false)}
          onRestart={() => {
            engine.startMatch();
            setPaused(false);
          }}
          onQuit={props.onQuit}
          muted={props.muted}
          onMute={props.onMute}
          reduced={props.reduced}
          onReduced={props.onReduced}
          player={props.player}
          map={props.map}
        />
      )}
      {helpOpen && !paused && <HelpOverlay onClose={() => setHelpOpen(false)} />}
    </section>
  );
}

function fmtTime(s: number): string {
  const t = Math.max(0, Math.ceil(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

/* ---------- result ---------- */

function cycleText(mask: number, kind: 'active' | 'ult'): string {
  if (kind === 'active') {
    if (mask & 8) return 'ready→casting→cooling→ready ✓';
    if (mask & 4) return 'ready→casting→cooling…';
    if (mask & 2) return 'ready→casting…';
    return 'ready (held)';
  }
  if (mask & 8) return 'locked→ready→casting→resolved ✓';
  if (mask & 4) return 'locked→ready→casting…';
  if (mask & 2) return 'locked→ready (held)';
  return 'locked (uncharged)';
}

function ResultView(props: {
  engine: Engine;
  mode: Mode;
  muted: boolean;
  onMute: () => void;
  onRematch: () => void;
  onChange: () => void;
  onExit: () => void;
}): JSX.Element {
  const { engine } = props;
  const aiId = OTHER[engine.playerFighter];
  void aiId;
  const rows: ResultRow[] = engine.fighters.map((f) => ({
    name: f.def.name,
    damage: Math.round(f.dmgDealt),
    meter: Math.round(f.meterGained),
    mapTicks: Math.round(f.mapTicks),
    passiveProcs: f.passiveProcs,
    activeCycle: cycleText(f.activeSeen, 'active'),
    ultCycle: cycleText(f.ultSeen, 'ult'),
  }));
  const w = engine.koWinner;
  const winner = w < 0 ? 'Nobody' : engine.fighters[w].def.name;
  const subtitle =
    w < 0
      ? 'Dead heat at the horn — equal HP.'
      : props.mode === 'ember'
        ? `Highest HP at the horn · ${MODE_SUB[props.mode]}`
        : `${MODE_SUB[props.mode]} · rounds ${engine.wins[0]}—${engine.wins[1]}`;
  const strokes = `Round story: ${rows[0].damage} — ${rows[1].damage} damage · ${engine.strokes.liveCount()} strokes still drying on the page.`;
  const score = props.mode === 'ember'
    ? `HP ${Math.ceil(engine.fighters[0].hp)} — ${Math.ceil(engine.fighters[1].hp)}`
    : `Rounds ${engine.wins[0]} — ${engine.wins[1]}`;

  useEffect(() => {
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === 'm' || ev.key === 'M') props.onMute();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [props]);

  return (
    <section aria-label="Result">
      <ResultPanel
        winner={winner}
        subtitle={subtitle}
        score={score}
        rows={rows}
        strokes={strokes}
        onRematch={props.onRematch}
        onChange={props.onChange}
        onExit={props.onExit}
      />
      <p className="muted center">{props.muted ? 'Muted (M)' : 'Unmuted — state only (M)'}</p>
    </section>
  );
}
