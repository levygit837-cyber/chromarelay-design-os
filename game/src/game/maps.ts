/**
 * Map data — numbers from State Matrix §4 + tokens maps.*.
 * Sim and bounds are defined in 1280x720 units; spawns mirrored.
 */
export type MapId = 'caldera' | 'rooftop';

export const STAGE_W = 1280;
export const STAGE_H = 720;

/* Caldera — Ember Surge: 18s cycle, 1s telegraph, 4s ignite, 6 HP/s, +60% meter. */
export const CALDERA_LANES = 5;
export const CALDERA_LIT = 2;
export const CALDERA_PERIOD_S = 18;
export const CALDERA_TELEGRAPH_S = 1;
export const CALDERA_IGNITE_S = 4;
export const CALDERA_TICK_DPS = 6;
export const CALDERA_METER_BONUS_PCT = 60;

/* Rooftop — Blackout Pulse: 20s cycle, 6s blackout (1.2 dim-in + 3.6 hold + 1.2 restore). */
export const ROOFTOP_PERIOD_S = 20;
export const ROOFTOP_BLACKOUT_S = 6;
export const ROOFTOP_DIM_IN_S = 1.2;
export const ROOFTOP_HOLD_S = 3.6;
export const ROOFTOP_RESTORE_S = 1.2;

export interface CoverRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MapDef {
  id: MapId;
  name: string;
  rule: string;
  ruleShort: string;
  ruleText: string;
  spawnA: { x: number; y: number };
  spawnB: { x: number; y: number };
  covers: CoverRect[];
}

export const MAPS: Record<MapId, MapDef> = {
  caldera: {
    id: 'caldera',
    name: 'Caldera',
    rule: 'Ember Surge',
    ruleShort: 'Surge 18s · 2 of 5 lanes · 4s',
    ruleText:
      'Every 18s, 2 of 5 lanes ignite for 4s (1s telegraph). ' +
      'Standing in a lit fissure ticks 6 HP/s but grants +60% meter rate.',
    spawnA: { x: 320, y: 360 },
    spawnB: { x: 960, y: 360 },
    covers: [],
  },
  rooftop: {
    id: 'rooftop',
    name: 'Rooftop',
    rule: 'Blackout Pulse',
    ruleShort: 'Blackout 20s · 6s in the dark',
    ruleText:
      'Every 20s, a 6s blackout (1.2s dim-in + 3.6s hold + 1.2s restore). ' +
      'In the dark, trails and muzzle flashes carry the read; AC cover blocks Gunslinger line-of-sight.',
    spawnA: { x: 320, y: 360 },
    spawnB: { x: 960, y: 360 },
    covers: [
      { x: 600, y: 120, w: 80, h: 150 },
      { x: 600, y: 450, w: 80, h: 150 },
    ],
  },
};

export function laneOf(x: number): number {
  const w = STAGE_W / CALDERA_LANES;
  const i = Math.floor(x / w);
  return i < 0 ? 0 : i >= CALDERA_LANES ? CALDERA_LANES - 1 : i;
}

export function laneCenterX(i: number): number {
  const w = STAGE_W / CALDERA_LANES;
  return w * i + w / 2;
}
