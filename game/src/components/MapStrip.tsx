import { MAPS, type MapId } from '../game/maps';

interface Props {
  mapId: MapId;
  phase: string;
  countdownS: number;
  litMask: number;
}

/** MapStrip 40px sob o palco: nome da regra + estado vivo, forma/texto, nunca só cor. */
export function MapStrip({ mapId, phase, countdownS, litMask }: Props): JSX.Element {
  const rule = MAPS[mapId].rule;
  const secs = Math.ceil(countdownS);
  let state = '';
  if (mapId === 'caldera') {
    if (phase === 'telegraph') state = `SURGE △ telegraph — lanes ${lanesOf(litMask)}`;
    else if (phase === 'ignite') state = `IGNITE ● lanes ${lanesOf(litMask)} — 6/s +60% meter`;
    else state = `Surge in ${secs}s`;
  } else {
    if (phase === 'dim') state = 'BLACKOUT ◐ dimming';
    else if (phase === 'hold') state = 'BLACKOUT ● hold — trails carry the read';
    else if (phase === 'restore') state = 'BLACKOUT ◑ restoring';
    else state = `Blackout in ${secs}s`;
  }
  return (
    <div className="map-strip" aria-live="polite">
      <span className="map-rule">{rule}</span>
      <span className="map-state">{state}</span>
    </div>
  );
}

function lanesOf(mask: number): string {
  const out: number[] = [];
  for (let i = 0; i < 5; i++) {
    if ((mask & (1 << i)) !== 0) out.push(i + 1);
  }
  return out.join('+');
}
