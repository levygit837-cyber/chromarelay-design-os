/**
 * Fighter data — numbers from State Matrix §3 + §7.
 * Samurai HP100 (rushdown, melee arc) vs Gunslinger HP85 (zoner, projectiles).
 */
export type FighterId = 'samurai' | 'gunslinger';

/**
 * Animation clips — every name must be reachable in a real round:
 * walk, run, basic, skill (active), ultimate, entrance, idle (+ hitstun, ko).
 */
export type AnimClip =
  | 'entrance'
  | 'idle'
  | 'walk'
  | 'run'
  | 'basic'
  | 'skill'
  | 'ultimate'
  | 'hitstun'
  | 'ko';

export interface FighterDef {
  id: FighterId;
  name: string;
  tag: string;
  hp: number;
  walkSpeed: number;
  runSpeed: number;
  basicName: string;
  basicDamage: number;
  basicRange: number;
  basicMs: number;
  passiveName: string;
  passiveText: string;
  activeName: string;
  activeText: string;
  activeDamage: number;
  activeCooldownS: number;
  ultName: string;
  ultText: string;
  ultDamage: number;
  meterMax: number;
}

export const SAMURAI: FighterDef = {
  id: 'samurai',
  name: 'Samurai',
  tag: 'rushdown · brush arc',
  hp: 100,
  walkSpeed: 220,
  runSpeed: 340,
  basicName: 'Iai Slash',
  basicDamage: 8,
  basicRange: 90,
  basicMs: 120,
  passiveName: 'Blade Hunger',
  passiveText: 'Always on: +15% meter on every hit landed.',
  activeName: 'Dash-Slash',
  activeText: 'Key 1: dashing cut, 18 damage. 8s cooldown.',
  activeDamage: 18,
  activeCooldownS: 8,
  ultName: 'Falling-Ember',
  ultText: 'Key U or R at 100 meter: area ember, 45 damage.',
  ultDamage: 45,
  meterMax: 100,
};

export const GUNSLINGER: FighterDef = {
  id: 'gunslinger',
  name: 'Gunslinger',
  tag: 'zoner · puncture',
  hp: 85,
  walkSpeed: 220,
  runSpeed: 340,
  basicName: 'Deadeye Shot',
  basicDamage: 7,
  basicRange: 420,
  basicMs: 120,
  passiveName: 'Deadeye',
  passiveText: 'Always on: +20% damage beyond 260px.',
  activeName: 'Fan-Fire',
  activeText: 'Key 1: fan of 3 shots, 6 damage each. 10s cooldown.',
  activeDamage: 18,
  activeCooldownS: 10,
  ultName: 'Lead Tempest',
  ultText: 'Key U or R at 100 meter: zone of 5 pulses, 9 damage each.',
  ultDamage: 45,
  meterMax: 100,
};

export const FIGHTERS: Record<FighterId, FighterDef> = {
  samurai: SAMURAI,
  gunslinger: GUNSLINGER,
};

export const OTHER: Record<FighterId, FighterId> = {
  samurai: 'gunslinger',
  gunslinger: 'samurai',
};
