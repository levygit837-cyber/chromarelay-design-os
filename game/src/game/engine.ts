import { FIGHTERS, OTHER, type AnimClip, type FighterDef, type FighterId } from './fighters';
import {
  CALDERA_IGNITE_S,
  CALDERA_LIT,
  CALDERA_METER_BONUS_PCT,
  CALDERA_PERIOD_S,
  CALDERA_TELEGRAPH_S,
  CALDERA_TICK_DPS,
  MAPS,
  ROOFTOP_DIM_IN_S,
  ROOFTOP_HOLD_S,
  ROOFTOP_PERIOD_S,
  ROOFTOP_RESTORE_S,
  STAGE_H,
  STAGE_W,
  laneOf,
  type CoverRect,
  type MapId,
} from './maps';
import { aiTick, type AIView, type FighterInput } from './ai';
import { StrokeStore } from './strokes';

export type MatchMode = 'duel' | 'dummy' | 'ember';
export type RoundPhase = 'entrance' | 'countdown' | 'fighting' | 'ko' | 'done';
export type CalderaPhase = 'idle' | 'telegraph' | 'ignite';
export type RooftopPhase = 'idle' | 'dim' | 'hold' | 'restore';

export const STEP = 1 / 60;
export const CAST_S = 0.3;
export const ULT_FREEZE_S = 0.25;
export const BASIC_CD_S = 0.5;
export const DUEL_ROUND_S = 60;
export const EMBER_MATCH_S = 90;
export const DEADEYE_RANGE = 260;
export const DEADEYE_MULT = 1.2;
export const BLADE_HUNGER_MULT = 1.15;

export interface Projectile {
  alive: boolean;
  kind: number;
  owner: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dmg: number;
  life: number;
}

export interface Floater {
  alive: boolean;
  x: number;
  y: number;
  val: number;
  age: number;
}

export interface Ring {
  alive: boolean;
  x: number;
  y: number;
  age: number;
  maxR: number;
  vermilion: boolean;
}

export interface FighterState {
  def: FighterDef;
  side: number;
  x: number;
  y: number;
  facing: 1 | -1;
  hp: number;
  meter: number;
  activeCd: number;
  basicCd: number;
  castT: number;
  castKind: number;
  lockT: number;
  hitstunT: number;
  anim: AnimClip;
  animT: number;
  idleT: number;
  moving: boolean;
  running: boolean;
  prevBasic: boolean;
  prevActive: boolean;
  prevUlt: boolean;
  activeSeen: number;
  ultSeen: number;
  dmgDealt: number;
  meterGained: number;
  mapTicks: number;
  lastDmg: number;
  calderaAcc: number;
  passiveProcs: number;
}

export interface Snapshot {
  hpA: number;
  hpB: number;
  maxA: number;
  maxB: number;
  meterA: number;
  meterB: number;
  cdA: number;
  cdB: number;
  ultA: boolean;
  ultB: boolean;
  phase: RoundPhase;
  countdownN: number;
  timerS: number;
  winsA: number;
  winsB: number;
  roundN: number;
  targetWins: number;
  mapKind: MapId;
  mapPhase: string;
  mapCountdownS: number;
  litMask: number;
  koWinner: number;
  version: number;
}

function makeFighter(def: FighterDef, side: number): FighterState {
  return {
    def, side, x: 0, y: 0,
    facing: side === 0 ? 1 : -1,
    hp: def.hp, meter: 0, activeCd: 0, basicCd: 0,
    castT: 0, castKind: 0, lockT: 0, hitstunT: 0,
    anim: 'entrance', animT: 0, idleT: 0,
    moving: false, running: false,
    prevBasic: false, prevActive: false, prevUlt: false,
    activeSeen: 1, ultSeen: 1,
    dmgDealt: 0, meterGained: 0, mapTicks: 0,
    lastDmg: 0, calderaAcc: 0, passiveProcs: 0,
  };
}

export class Engine {
  readonly mode: MatchMode;
  readonly mapId: MapId;
  readonly playerFighter: FighterId;
  readonly fighters: [FighterState, FighterState];
  readonly strokes = new StrokeStore();
  readonly covers: CoverRect[];

  acc = 0;
  time = 0;
  phase: RoundPhase = 'entrance';
  phaseT = 0;
  countdownN = 3;
  timerS = DUEL_ROUND_S;
  roundN = 1;
  targetWins = 2;
  wins: [number, number] = [0, 0];
  koWinner = -1;
  koT = 0;
  shakeT = 0;
  version = 0;
  reducedMotion = false;
  private tickCount = 0;
  private dummySoak = 0;

  calderaPhase: CalderaPhase = 'idle';
  calderaT = 0;
  calderaCycle = 0;
  litA = 0;
  litB = 1;
  rooftopPhase: RooftopPhase = 'idle';
  rooftopT = 0;

  readonly playerInput: FighterInput = { mx: 0, my: 0, run: false, basic: false, active: false, ult: false };
  private readonly aiIn: FighterInput = { mx: 0, my: 0, run: false, basic: false, active: false, ult: false };
  private readonly aiView: AIView = {
    kind: 'samurai', sx: 0, sy: 0, fx: 0, fy: 0,
    basicReady: true, activeReady: true, meter: 0, losBlocked: false, t: 0,
  };

  private readonly projs: Projectile[] = [];
  private readonly floaters: Floater[] = [];
  private readonly rings: Ring[] = [];
  private readonly reached: Record<AnimClip, boolean> = {
    entrance: false, idle: false, walk: false, run: false, basic: false,
    skill: false, ultimate: false, hitstun: false, ko: false,
  };
  private ultZone = { alive: false, x: 0, y: 0, t: 0, ticks: 0, owner: 0 };
  private listeners = new Set<(snap: Snapshot) => void>();
  readonly snap: Snapshot;

  constructor(opts: { player: FighterId; map: MapId; mode: MatchMode }) {
    this.mode = opts.mode;
    this.mapId = opts.map;
    this.playerFighter = opts.player;
    const ai: FighterId = OTHER[opts.player];
    this.fighters = [makeFighter(FIGHTERS[opts.player], 0), makeFighter(FIGHTERS[ai], 1)];
    this.covers = MAPS[opts.map].covers;
    this.targetWins = opts.mode === 'duel' ? 2 : 1;
    this.timerS = opts.mode === 'ember' ? EMBER_MATCH_S : DUEL_ROUND_S;
    this.snap = {
      hpA: 0, hpB: 0, maxA: 0, maxB: 0, meterA: 0, meterB: 0,
      cdA: 0, cdB: 0, ultA: false, ultB: false, phase: 'entrance',
      countdownN: 3, timerS: this.timerS, winsA: 0, winsB: 0,
      roundN: 1, targetWins: this.targetWins, mapKind: opts.map,
      mapPhase: 'idle', mapCountdownS: 0, litMask: 0, koWinner: -1, version: 0,
    };
    this.resetPositions();
  }

  subscribe(fn: (snap: Snapshot) => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  setReducedMotion(b: boolean): void {
    this.reducedMotion = b;
  }

  setPlayerInput(mx: number, my: number, run: boolean, basic: boolean, active: boolean, ult: boolean): void {
    const p = this.playerInput;
    p.mx = mx; p.my = my; p.run = run; p.basic = basic; p.active = active; p.ult = ult;
  }

  resetPositions(): void {
    const m = MAPS[this.mapId];
    const a = this.fighters[0];
    const b = this.fighters[1];
    a.x = m.spawnA.x; a.y = m.spawnA.y;
    b.x = m.spawnB.x; b.y = m.spawnB.y;
    a.facing = 1;
    b.facing = -1;
  }

  startMatch(): void {
    this.wins[0] = 0;
    this.wins[1] = 0;
    this.roundN = 1;
    this.strokes.clear();
    this.startRound();
  }

  startRound(): void {
    const a = this.fighters[0];
    const b = this.fighters[1];
    const fighters = [a, b];
    for (const f of fighters) {
      f.hp = f.def.hp;
      f.meter = 0;
      f.activeCd = 0;
      f.basicCd = 0;
      f.castT = 0;
      f.castKind = 0;
      f.lockT = 0;
      f.hitstunT = 0;
      f.anim = 'entrance';
      f.animT = 0;
      f.idleT = 0;
      f.lastDmg = 0;
      f.calderaAcc = 0;
      f.prevBasic = false;
      f.prevActive = false;
      f.prevUlt = false;
      f.activeSeen = 1;
      f.ultSeen = 1;
    }
    for (const f of this.floaters) f.alive = false;
    for (const r of this.rings) r.alive = false;
    this.ultZone.alive = false;
    this.resetPositions();
    this.phase = 'entrance';
    this.phaseT = 0;
    this.countdownN = 3;
    this.koWinner = -1;
    this.koT = 0;
    this.timerS = this.mode === 'ember' ? EMBER_MATCH_S : DUEL_ROUND_S;
    this.calderaPhase = 'idle';
    this.calderaT = 0;
    this.rooftopPhase = 'idle';
    this.rooftopT = 0;
    if (this.mode === 'dummy') this.dummySoak = 3;
    this.emit();
  }
  /** Test seam: pula entrance+countdown (só o sim-check usa; App nunca chama). */
  forceFighting(): void {
    this.phase = 'fighting';
    this.phaseT = 0;
    for (const f of this.fighters) {
      if (f.anim === 'entrance') {
        f.anim = 'idle';
        f.animT = 0;
      }
    }
    this.emit();
  }

  update(dtRaw: number): void {
    let dt = dtRaw;
    if (dt > 0.25) dt = 0.25;
    if (this.phase === 'ko') dt *= 0.35;
    this.acc += dt;
    let n = 0;
    while (this.acc >= STEP && n < 5) {
      this.acc -= STEP;
      n++;
      this.step(STEP);
    }
    if (n === 5) this.acc = 0;
  }

  get litMask(): number {
    return (1 << this.litA) | (1 << this.litB);
  }

  get blackoutActive(): boolean {
    return this.mapId === 'rooftop' && this.rooftopPhase !== 'idle';
  }

  losBlocked(x1: number, y1: number, x2: number, y2: number): boolean {
    if (this.mapId !== 'rooftop' || !this.blackoutActive) return false;
    for (let i = 0; i < this.covers.length; i++) {
      if (segHitsRect(x1, y1, x2, y2, this.covers[i])) return true;
    }
    return false;
  }

  pointInCover(x: number, y: number): boolean {
    for (let i = 0; i < this.covers.length; i++) {
      const c = this.covers[i];
      if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) return true;
    }
    return false;
  }

  private step(dt: number): void {
    this.time += dt;
    this.phaseT += dt;

    if (this.phase === 'entrance') {
      this.trackAnims(dt);
      if (this.phaseT >= 1.2) {
        this.phase = 'countdown';
        this.phaseT = 0;
        this.countdownN = 3;
      }
      this.afterTick();
      return;
    }
    if (this.phase === 'countdown') {
      this.trackAnims(dt);
      if (this.phaseT >= 0.6) {
        this.phaseT = 0;
        this.countdownN--;
        if (this.countdownN <= 0) {
          this.phase = 'fighting';
          this.phaseT = 0;
        }
      }
      this.afterTick();
      return;
    }
    if (this.phase === 'ko') {
      this.koT -= dt / 0.35;
      this.trackAnims(dt);
      this.strokes.update(dt, this.reducedMotion);
      this.updateCosmetics(dt);
      if (this.koT <= 0) this.resolveKo();
      this.afterTick();
      return;
    }
    if (this.phase === 'done') {
      this.afterTick();
      return;
    }

    this.timerS -= dt;
    this.updateMap(dt);
    const scripted = this.playerInput.basic || this.playerInput.active || this.playerInput.ult;
    this.fightFighter(0, this.playerInput, dt);
    if (this.mode === 'dummy') {
      const n = this.aiIn;
      n.mx = 0; n.my = 0; n.run = false; n.basic = false; n.active = false; n.ult = false;
      this.fightFighter(1, n, dt);
    } else {
      const me = this.fighters[1];
      const foe = this.fighters[0];
      const v = this.aiView;
      v.kind = me.def.id;
      v.sx = me.x; v.sy = me.y; v.fx = foe.x; v.fy = foe.y;
      v.basicReady = me.basicCd <= 0 && me.castT <= 0 && me.hitstunT <= 0;
      v.activeReady = me.activeCd <= 0 && me.castT <= 0 && me.hitstunT <= 0;
      v.meter = me.meter;
      v.losBlocked = me.def.id === 'gunslinger' && this.losBlocked(me.x, me.y, foe.x, foe.y);
      v.t = this.time;
      if (!scripted) aiTick(v, this.aiIn);
      else { const n = this.aiIn; n.mx = 0; n.my = 0; n.run = false; n.basic = false; n.active = false; n.ult = false; }
      this.fightFighter(1, this.aiIn, dt);
    }
    this.updateProjectiles(dt);
    this.updateUltZone(dt);
    this.updateCalderaDot(dt);
    this.trackAnims(dt);
    this.strokes.update(dt, this.reducedMotion);
    this.updateCosmetics(dt);

    if (this.timerS <= 0 && this.phase === 'fighting') {
      this.timerS = 0;
      this.timeoutRound();
    }
    this.afterTick();
  }

  private fightFighter(i: number, inp: FighterInput, dt: number): void {
    const fighters = this.fighters;
    const f = fighters[i];
    const foe = fighters[1 - i];
    if (f.hp <= 0) return;

    if (f.basicCd > 0) f.basicCd -= dt;
    if (f.activeCd > 0) {
      f.activeCd -= dt;
      if (f.activeCd <= 0) {
        f.activeCd = 0;
        f.activeSeen |= 8;
      }
    }
    if (f.lockT > 0) { f.lockT -= dt; if (f.lockT < 0) f.lockT = 0; }
    if (f.hitstunT > 0) { f.hitstunT -= dt; if (f.hitstunT < 0) f.hitstunT = 0; }

    // Nível (não borda): segurar J repete no cooldown; segurar 1/U dispara ao liberar.
    f.prevBasic = inp.basic;
    f.prevActive = inp.active;
    f.prevUlt = inp.ult;

    if (f.castT > 0) {
      f.castT -= dt;
      if (f.castT <= 0) {
        f.castT = 0;
        this.resolveCast(i, foe);
      }
      return;
    }
    if (f.hitstunT > 0 || f.lockT > 0) {
      f.moving = false;
      f.running = false;
      return;
    }

    if (inp.ult && f.meter >= f.def.meterMax) {
      f.castT = ULT_FREEZE_S;
      f.castKind = 2;
      f.ultSeen |= 4;
      foe.lockT = Math.max(foe.lockT, ULT_FREEZE_S);
      f.moving = false;
      f.running = false;
      return;
    }
    if (inp.active && f.activeCd <= 0) {
      f.castT = CAST_S;
      f.castKind = 1;
      f.activeSeen |= 2;
      f.activeSeen &= ~8;
      f.moving = false;
      f.running = false;
      return;
    }
    if (inp.basic && f.basicCd <= 0) this.doBasic(i, foe);

    let mx = inp.mx;
    let my = inp.my;
    const len = Math.sqrt(mx * mx + my * my);
    if (len > 1) {
      mx /= len;
      my /= len;
    }
    f.moving = len > 0.05;
    f.running = f.moving && inp.run;
    const spd = f.running ? f.def.runSpeed : f.def.walkSpeed;
    f.x += mx * spd * dt;
    f.y += my * spd * dt;
    if (f.x < 60) f.x = 60;
    if (f.x > STAGE_W - 60) f.x = STAGE_W - 60;
    if (f.y < 80) f.y = 80;
    if (f.y > STAGE_H - 80) f.y = STAGE_H - 80;
    const dx = foe.x - f.x;
    if (dx > 4) f.facing = 1;
    else if (dx < -4) f.facing = -1;
  }

  private doBasic(i: number, foe: FighterState): void {
    const f = this.fighters[i];
    f.basicCd = BASIC_CD_S;
    f.anim = 'basic';
    f.animT = 0;
    this.reached.basic = true;
    const dx = foe.x - f.x;
    const dy = foe.y - f.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (f.def.id === 'samurai') {
      const reach = f.def.basicRange + 30;
      const facingOk = dx * f.facing >= -20;
      this.strokes.add('slash', f.x, f.y - 10, f.x + f.facing * 95, f.y + 14, false, 7);
      if (dist <= reach && facingOk) this.dealDamage(1 - i, f.def.basicDamage, i);
    } else {
      const ang = Math.atan2(dy, dx);
      let dmg = f.def.basicDamage;
      if (dist > DEADEYE_RANGE) {
        dmg = Math.round(dmg * DEADEYE_MULT);
        f.passiveProcs++;
      }
      this.spawnProj(i, f.x + Math.cos(ang) * 30, f.y - 6, Math.cos(ang) * 950, Math.sin(ang) * 950, dmg, 1.2, 0);
      this.spawnRing(f.x + Math.cos(ang) * 34, f.y - 6, 46, false);
      this.strokes.add('shot', f.x, f.y - 6, f.x + Math.cos(ang) * 120, f.y - 6 + Math.sin(ang) * 120, true, 3);
    }
  }

  private resolveCast(i: number, foe: FighterState): void {
    const f = this.fighters[i];
    const kind = f.castKind;
    f.castKind = 0;
    const dx = foe.x - f.x;
    const dy = foe.y - f.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    if (kind === 1) {
      f.activeCd = f.def.activeCooldownS;
      f.activeSeen |= 4;
      if (f.def.id === 'samurai') {
        const dash = Math.min(200, Math.max(0, dist - 50));
        f.x += (dx / dist) * dash;
        f.y += (dy / dist) * dash * 0.5;
        this.strokes.add('slash', f.x - f.facing * 120, f.y, f.x + f.facing * 60, f.y - 8, true, 9);
        const d2 = Math.abs(foe.x - f.x) + Math.abs(foe.y - f.y) * 0.5;
        if (d2 <= 150) this.dealDamage(1 - i, f.def.activeDamage, i);
      } else {
        const ang = Math.atan2(dy, dx);
        for (let k = -1; k <= 1; k++) {
          const a = ang + k * 0.12;
          this.spawnProj(i, f.x + Math.cos(a) * 30, f.y - 6, Math.cos(a) * 900, Math.sin(a) * 900, 6, 1.1, 1);
        }
        this.spawnRing(f.x + (dx / dist) * 34, f.y - 6, 60, true);
        this.strokes.add('shot', f.x, f.y - 6, f.x + (dx / dist) * 200, f.y + (dy / dist) * 200, true, 4);
      }
    } else if (kind === 2) {
      f.meter = 0;
      f.ultSeen |= 8;
      if (!this.reducedMotion) this.shakeT = 0.4;
      if (f.def.id === 'samurai') {
        this.strokes.add('ult', f.x - 200, f.y + 60, foe.x + 100, foe.y - 80, true, 14);
        this.spawnRing(foe.x, foe.y, 220, true);
        if (dist <= 340) this.dealDamage(1 - i, f.def.ultDamage, i);
      } else {
        this.ultZone.alive = true;
        this.ultZone.x = foe.x;
        this.ultZone.y = foe.y;
        this.ultZone.t = 0;
        this.ultZone.ticks = 5;
        this.ultZone.owner = i;
        this.strokes.add('ult', f.x, f.y - 6, this.ultZone.x, this.ultZone.y, true, 10);
        this.spawnRing(this.ultZone.x, this.ultZone.y, 170, true);
      }
    }
  }

  dealDamage(target: number, base: number, dealer: number): number {
    const fighters = this.fighters;
    const t = fighters[target];
    const d = fighters[dealer];
    if (t.hp <= 0 || this.phase !== 'fighting') return 0;
    let dmg = Math.max(1, Math.round(base));
    if (this.mode === 'dummy' && target === 1 && this.dummySoak > 0) {
      this.dummySoak--;
      if (t.hp - dmg <= 0) dmg = Math.max(1, t.hp - 1);
    }
    t.hp -= dmg;
    t.lastDmg = dmg;
    t.hitstunT = Math.min(0.18, Math.max(0.12, 0.12 + dmg * 0.002));
    let gain = dmg * 1.1;
    if (d.def.id === 'samurai') {
      gain *= BLADE_HUNGER_MULT;
      d.passiveProcs++;
    }
    if (this.mapId === 'caldera' && this.calderaPhase === 'ignite') {
      const lane = laneOf(d.x);
      if ((this.litMask & (1 << lane)) !== 0) gain *= 1 + CALDERA_METER_BONUS_PCT / 100;
    }
    d.meter = Math.min(d.def.meterMax, d.meter + gain);
    d.meterGained += gain;
    t.meter = Math.min(t.def.meterMax, t.meter + dmg * 0.5);
    d.dmgDealt += dmg;
    this.spawnFloater(t.x, t.y - 70, dmg);
    if (!this.reducedMotion) this.shakeT = Math.max(this.shakeT, Math.min(0.35, 0.12 + dmg * 0.005));
    if (t.hp <= 0) {
      t.hp = 0;
      this.beginKo(dealer);
    }
    this.emit();
    return dmg;
  }

  private beginKo(winner: number): void {
    this.phase = 'ko';
    this.phaseT = 0;
    this.koWinner = winner;
    this.koT = 1.5;
  }

  private resolveKo(): void {
    this.wins[this.koWinner]++;
    if (this.mode === 'ember' || this.wins[this.koWinner] >= this.targetWins) {
      this.phase = 'done';
    } else {
      this.roundN++;
      this.startRound();
    }
    this.emit();
  }

  private timeoutRound(): void {
    const fighters = this.fighters;
    const a = fighters[0];
    const b = fighters[1];
    if (this.mode === 'ember') {
      this.koWinner = a.hp === b.hp ? -1 : a.hp > b.hp ? 0 : 1;
      this.phase = 'done';
      this.emit();
      return;
    }
    this.koWinner = a.hp === b.hp ? (a.meter >= b.meter ? 0 : 1) : a.hp > b.hp ? 0 : 1;
    this.phase = 'ko';
    this.phaseT = 0;
    this.koT = 1.2;
    this.emit();
  }

  private updateMap(dt: number): void {
    if (this.mapId === 'caldera') {
      this.calderaT += dt;
      if (this.calderaPhase === 'idle' && this.calderaT >= CALDERA_PERIOD_S) {
        this.calderaPhase = 'telegraph';
        this.calderaT = 0;
        this.calderaCycle++;
        this.litA = (this.calderaCycle * 2 + 1) % 5;
        this.litB = (this.calderaCycle * 2 + 3) % 5;
        if (this.litB === this.litA) this.litB = (this.litA + 2) % 5;
      } else if (this.calderaPhase === 'telegraph' && this.calderaT >= CALDERA_TELEGRAPH_S) {
        this.calderaPhase = 'ignite';
        this.calderaT = 0;
      } else if (this.calderaPhase === 'ignite' && this.calderaT >= CALDERA_IGNITE_S) {
        this.calderaPhase = 'idle';
        this.calderaT = 0;
      }
    } else {
      this.rooftopT += dt;
      if (this.rooftopPhase === 'idle' && this.rooftopT >= ROOFTOP_PERIOD_S) {
        this.rooftopPhase = 'dim';
        this.rooftopT = 0;
      } else if (this.rooftopPhase === 'dim' && this.rooftopT >= ROOFTOP_DIM_IN_S) {
        this.rooftopPhase = 'hold';
        this.rooftopT = 0;
      } else if (this.rooftopPhase === 'hold' && this.rooftopT >= ROOFTOP_HOLD_S) {
        this.rooftopPhase = 'restore';
        this.rooftopT = 0;
      } else if (this.rooftopPhase === 'restore' && this.rooftopT >= ROOFTOP_RESTORE_S) {
        this.rooftopPhase = 'idle';
        this.rooftopT = 0;
      }
    }
  }

  private updateCalderaDot(dt: number): void {
    if (this.mapId !== 'caldera' || this.calderaPhase !== 'ignite') return;
    for (let i = 0; i < 2; i++) {
      const f = this.fighters[i];
      if (f.hp <= 0) continue;
      if ((this.litMask & (1 << laneOf(f.x))) === 0) continue;
      const tick = CALDERA_TICK_DPS * dt;
      f.hp -= tick;
      f.calderaAcc += tick;
      f.mapTicks += tick;
      const bonus = tick * 0.5 * (CALDERA_METER_BONUS_PCT / 100);
      f.meter = Math.min(f.def.meterMax, f.meter + tick * 0.5 + bonus);
      if (f.calderaAcc >= 6) {
        f.calderaAcc -= 6;
        this.spawnFloater(f.x, f.y - 70, 6);
        f.lastDmg = 6;
      }
      if (f.hp <= 0) {
        f.hp = 0;
        this.beginKo(1 - i);
        return;
      }
    }
  }

  private spawnProj(owner: number, x: number, y: number, vx: number, vy: number, dmg: number, life: number, kind: number): void {
    let slot: Projectile | undefined;
    for (const p of this.projs) {
      if (!p.alive) {
        slot = p;
        break;
      }
    }
    if (slot === undefined) {
      if (this.projs.length >= 24) return;
      slot = { alive: false, kind: 0, owner: 0, x: 0, y: 0, vx: 0, vy: 0, dmg: 0, life: 0 };
      this.projs.push(slot);
    }
    slot.alive = true;
    slot.kind = kind;
    slot.owner = owner;
    slot.x = x;
    slot.y = y;
    slot.vx = vx;
    slot.vy = vy;
    slot.dmg = dmg;
    slot.life = life;
  }

  private updateProjectiles(dt: number): void {
    for (const p of this.projs) {
      if (!p.alive) continue;
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0 || p.x < 0 || p.x > STAGE_W || p.y < 0 || p.y > STAGE_H) {
        p.alive = false;
        continue;
      }
      if (this.pointInCover(p.x, p.y)) {
        p.alive = false;
        this.spawnRing(p.x, p.y, 26, false);
        continue;
      }
      const t = this.fighters[1 - p.owner];
      if (t.hp <= 0) continue;
      const dx = t.x - p.x;
      const dy = t.y - 20 - p.y;
      if (dx * dx + dy * dy < 26 * 26) {
        p.alive = false;
        this.strokes.add('shot', this.fighters[p.owner].x, this.fighters[p.owner].y - 6, t.x, t.y - 20, true, 3);
        this.dealDamage(1 - p.owner, p.dmg, p.owner);
      }
    }
  }

  private updateUltZone(dt: number): void {
    const z = this.ultZone;
    if (!z.alive) return;
    z.t += dt;
    const t = this.fighters[1 - z.owner];
    if (z.ticks > 0 && z.t >= 0.18 * (5 - z.ticks + 1)) {
      z.ticks--;
      const dx = t.x - z.x;
      const dy = t.y - z.y;
      if (t.hp > 0 && dx * dx + dy * dy < 150 * 150 && this.phase === 'fighting') {
        this.dealDamage(1 - z.owner, 9, z.owner);
      }
      this.spawnRing(z.x, z.y, 120 + (5 - z.ticks) * 14, true);
      this.strokes.add('ult', z.x - 120, z.y, z.x + 120, z.y - 30, true, 8);
      if (z.ticks <= 0) z.alive = false;
    }
    if (z.t > 2.5) z.alive = false;
  }

  private spawnFloater(x: number, y: number, val: number): void {
    let slot: Floater | undefined;
    for (const f of this.floaters) {
      if (!f.alive) {
        slot = f;
        break;
      }
    }
    if (slot === undefined) {
      if (this.floaters.length >= 16) return;
      slot = { alive: false, x: 0, y: 0, val: 0, age: 0 };
      this.floaters.push(slot);
    }
    slot.alive = true;
    slot.x = x;
    slot.y = y;
    slot.val = val;
    slot.age = 0;
  }

  private spawnRing(x: number, y: number, maxR: number, vermilion: boolean): void {
    let slot: Ring | undefined;
    for (const r of this.rings) {
      if (!r.alive) {
        slot = r;
        break;
      }
    }
    if (slot === undefined) {
      if (this.rings.length >= 12) return;
      slot = { alive: false, x: 0, y: 0, age: 0, maxR: 0, vermilion: false };
      this.rings.push(slot);
    }
    slot.alive = true;
    slot.x = x;
    slot.y = y;
    slot.age = 0;
    slot.maxR = maxR;
    slot.vermilion = vermilion;
  }

  private updateCosmetics(dt: number): void {
    for (const fl of this.floaters) {
      if (!fl.alive) continue;
      fl.age += dt;
      fl.y -= 30 * dt;
      if (fl.age >= 1.2) fl.alive = false;
    }
    for (const r of this.rings) {
      if (!r.alive) continue;
      r.age += dt;
      if (r.age >= 0.6) r.alive = false;
    }
    if (this.shakeT > 0) this.shakeT -= dt;
  }

  private trackAnims(dt: number): void {
    const mark = (clip: AnimClip): AnimClip => {
      this.reached[clip] = true;
      return clip;
    };
    for (const f of this.fighters) {
      f.animT += dt;
      if (f.hp <= 0) {
        if (f.anim !== 'ko') {
          f.anim = mark('ko');
          f.animT = 0;
        }
        continue;
      }
      if (this.phase === 'entrance' || this.phase === 'countdown') {
        this.reached[f.anim] = true;
        if (this.phase === 'countdown' && f.anim === 'entrance') {
          f.anim = mark('idle');
          f.animT = 0;
        }
        continue;
      }
      if (f.hitstunT > 0) {
        if (f.anim !== 'hitstun') {
          f.anim = mark('hitstun');
          f.animT = 0;
        }
        continue;
      }
      if (f.castT > 0) {
        const want: AnimClip = f.castKind === 2 ? 'ultimate' : 'skill';
        if (f.anim !== want) {
          f.anim = mark(want);
          f.animT = 0;
        }
        continue;
      }
      if (f.anim === 'basic' && f.animT < 0.18) {
        this.reached.basic = true;
        continue;
      }
      if (f.running && f.moving) {
        if (f.anim !== 'run') {
          f.anim = mark('run');
          f.animT = 0;
        }
        f.idleT = 0;
        continue;
      }
      if (f.moving) {
        if (f.anim !== 'walk') {
          f.anim = mark('walk');
          f.animT = 0;
        }
        f.idleT = 0;
        continue;
      }
      f.idleT += dt;
      if (f.anim !== 'idle') {
        f.anim = mark('idle');
        f.animT = 0;
      } else {
        this.reached.idle = true;
      }
    }
  }

  private afterTick(): void {
    for (const f of this.fighters) {
      if (f.meter >= f.def.meterMax) f.ultSeen |= 2;
    }
    this.tickCount++;
    if (this.tickCount % 6 === 0) this.emit();
  }

  private emit(): void {
    const fighters = this.fighters;
    const a = fighters[0];
    const b = fighters[1];
    const s = this.snap;
    s.hpA = a.hp;
    s.hpB = b.hp;
    s.maxA = a.def.hp;
    s.maxB = b.def.hp;
    s.meterA = a.meter;
    s.meterB = b.meter;
    s.cdA = a.activeCd;
    s.cdB = b.activeCd;
    s.ultA = a.meter >= a.def.meterMax;
    s.ultB = b.meter >= b.def.meterMax;
    s.phase = this.phase;
    s.countdownN = this.countdownN;
    s.timerS = this.timerS;
    s.winsA = this.wins[0];
    s.winsB = this.wins[1];
    s.roundN = this.roundN;
    s.targetWins = this.targetWins;
    s.mapKind = this.mapId;
    s.mapPhase = this.mapId === 'caldera' ? this.calderaPhase : this.rooftopPhase;
    s.mapCountdownS = this.mapId === 'caldera' ? this.calderaCountdown() : this.rooftopCountdown();
    s.litMask = this.mapId === 'caldera' ? this.litMask : 0;
    s.koWinner = this.koWinner;
    s.version = ++this.version;
    for (const fn of this.listeners) fn(s);
  }

  private calderaCountdown(): number {
    if (this.calderaPhase === 'telegraph') return Math.max(0, CALDERA_TELEGRAPH_S - this.calderaT);
    if (this.calderaPhase === 'ignite') return Math.max(0, CALDERA_IGNITE_S - this.calderaT);
    return Math.max(0, CALDERA_PERIOD_S - this.calderaT);
  }

  private rooftopCountdown(): number {
    if (this.rooftopPhase !== 'idle') {
      return Math.max(0, ROOFTOP_DIM_IN_S + ROOFTOP_HOLD_S + ROOFTOP_RESTORE_S - this.rooftopT);
    }
    return Math.max(0, ROOFTOP_PERIOD_S - this.rooftopT);
  }

  readProjectiles(): readonly Projectile[] {
    return this.projs;
  }

  readFloaters(): readonly Floater[] {
    return this.floaters;
  }

  readRings(): readonly Ring[] {
    return this.rings;
  }

  readUltZone(): { alive: boolean; x: number; y: number } {
    return this.ultZone;
  }

  clipsReached(): Record<AnimClip, boolean> {
    return { ...this.reached };
  }
}

function segHitsRect(x1: number, y1: number, x2: number, y2: number, c: CoverRect): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  if (Math.abs(dx) < 1e-9) {
    if (x1 < c.x || x1 > c.x + c.w) return false;
  } else {
    let t1 = (c.x - x1) / dx;
    let t2 = (c.x + c.w - x1) / dx;
    if (t1 > t2) {
      const t = t1;
      t1 = t2;
      t2 = t;
    }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return false;
  }
  if (Math.abs(dy) < 1e-9) {
    if (y1 < c.y || y1 > c.y + c.h) return false;
  } else {
    let t1 = (c.y - y1) / dy;
    let t2 = (c.y + c.h - y1) / dy;
    if (t1 > t2) {
      const t = t1;
      t1 = t2;
      t2 = t;
    }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return false;
  }
  return true;
}

export { STAGE_W, STAGE_H, CALDERA_LIT };
