import type { FighterDef } from '../game/fighters';

interface PipProps {
  ready: boolean;
  cdS: number;
}

/** Key-1 circle-pip 18px: anel vazio + segundos = recarga; sólido + tick = pronto. */
export function KeyPip({ ready, cdS }: PipProps): JSX.Element {
  return (
    <span className={`pip ${ready ? 'ready' : 'cooling'}`} role="img" aria-label={ready ? 'Key 1 ready' : `Key 1 cooling, ${Math.ceil(cdS)} seconds`}>
      {ready ? '●' : '○'}
      <span className="pip-text">{ready ? '✓' : `${Math.ceil(cdS)}`}</span>
    </span>
  );
}

interface FighterHudProps {
  def: FighterDef;
  hp: number;
  max: number;
  meter: number;
  cd: number;
  cdTotal: number;
  ultReady: boolean;
  tag: string;
}

/** CartoucheHUD por lutador: regra de HP + selo de medidor + pip da key-1. Máx. 3 marcas. */
export function FighterHud({ def, hp, max, meter, cd, cdTotal, ultReady, tag }: FighterHudProps): JSX.Element {
  const frac = Math.max(0, Math.min(1, hp / max));
  const m = Math.max(0, Math.min(100, meter));
  const ready = cd <= 0;
  void cdTotal;
  return (
    <div className={`hud-side ${ultReady ? 'ult-ready' : ''}`}>
      <div className="hud-name">
        {def.name} <span className="hud-tag">{tag}</span>
      </div>
      <div className="hud-row">
        <div
          className="health-rule"
          role="meter"
          aria-label={`${def.name} health ${Math.ceil(hp)} of ${max}`}
          aria-valuenow={Math.ceil(hp)}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div className="health-fill" style={{ transform: `scaleX(${frac})` }} />
        </div>
        <span className="hp-num">{Math.ceil(hp)}</span>
        <span
          className={`seal ${ultReady ? 'full' : ''} ${!ultReady && m >= 75 ? 'near' : ''}`}
          role="meter"
          aria-label={`${def.name} meter ${Math.floor(m)} of 100${ultReady ? ', Ultimate ready' : ''}`}
          aria-valuenow={Math.floor(m)}
          aria-valuemin={0}
          aria-valuemax={100}
          title={ultReady ? 'Ultimate ready — U' : `Meter ${Math.floor(m)}`}
        >
          <span className="seal-fill" style={{ transform: `scaleY(${m / 100})` }} />
          <span className="seal-text">{ultReady ? 'U!' : `${Math.floor(m)}`}</span>
        </span>
        <KeyPip ready={ready} cdS={cd} />
      </div>
    </div>
  );
}
