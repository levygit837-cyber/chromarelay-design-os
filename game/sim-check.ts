/**
 * Headless logic check — runs with `npm run sim`.
 * Steps the real Engine without DOM/canvas and asserts every acceptance row:
 * animation clips, skill cycles, both map events, both fighters, both ultimates.
 */
import { Engine, STEP } from './src/game/engine';

let failures = 0;

function check(name: string, cond: boolean, extra = ''): void {
  if (cond) {
    console.log(`ok   ${name}${extra ? ` — ${extra}` : ''}`);
  } else {
    failures++;
    console.log(`FAIL ${name}${extra ? ` — ${extra}` : ''}`);
  }
}

function stepN(e: Engine, n: number): void {
  for (let i = 0; i < n; i++) e.update(STEP);
}

function toFighting(e: Engine): void {
  for (let i = 0; i < 200 && e.phase !== 'fighting'; i++) e.update(STEP);
}

function drive(e: Engine, frames: number, fn: (f: number) => void): void {
  for (let f = 0; f < frames; f++) {
    fn(f);
    e.update(STEP);
    if (e.phase === 'done' || e.phase === 'ko') break;
  }
}

// 1. Duel, Samurai player on Caldera — reach walk/run/basic/skill/ult/hitstun.
{
  const e = new Engine({ player: 'samurai', map: 'caldera', mode: 'duel' });
  e.startMatch();
  check('entrance phase on start', e.phase === 'entrance');
  toFighting(e);
  check('reaches fighting', e.phase === 'fighting');
  const p = e.playerInput;
  drive(e, 60, () => {
    p.mx = 1; p.my = 0; p.run = false;
  });
  drive(e, 60, () => {
    p.mx = 1; p.my = 0; p.run = true;
  });
  p.mx = 0; p.my = 0; p.run = false;
  stepN(e, 70);
  const foe = e.fighters[1];
  const pin = (): void => {
    foe.x = e.fighters[0].x + 60;
    foe.y = e.fighters[0].y;
    foe.hitstunT = 0;
  };
  drive(e, 40, () => {
    p.basic = true;
    pin();
  });
  p.basic = false;
  e.fighters[0].hp = e.fighters[0].def.hp;
  e.fighters[1].hp = e.fighters[1].def.hp;
  e.fighters[0].hitstunT = 0;
  e.fighters[1].hitstunT = 0;
  stepN(e, 40);
  drive(e, 60, (f) => {
    p.active = f >= 2 && f < 30;
    if (f < 25) pin();
  });
  p.active = false;
  e.fighters[0].hp = e.fighters[0].def.hp;
  e.fighters[1].hp = e.fighters[1].def.hp;
  e.fighters[0].x = 640;
  e.fighters[0].y = 360;
  e.fighters[1].x = 740;
  e.fighters[1].y = 360;
  e.fighters[0].meter = 100;
  stepN(e, 3);
  drive(e, 60, (f) => {
    p.ult = f === 2;
    e.fighters[1].x = 740;
    e.fighters[1].y = 360;
  });
  p.ult = false;
  stepN(e, 120);
  e.dealDamage(0, 5, 1);
  stepN(e, 5);
  const me = e.fighters[0];
  const clips = e.clipsReached();
  for (const c of ['entrance', 'idle', 'walk', 'run', 'basic', 'skill', 'ultimate', 'hitstun'] as const) {
    check('samurai clip ' + c, clips[c] === true);
  }
  check('samurai active cycle ready→casting→cooling', (me.activeSeen & 7) === 7, 'mask ' + me.activeSeen.toString(2));
  check('samurai ult resolved', (me.ultSeen & 8) !== 0);
  check('samurai passive procs', me.passiveProcs > 0);
}

// 2. Gunslinger player — ranged basics, Fan-Fire, Lead Tempest, Deadeye.
{
  const e = new Engine({ player: 'gunslinger', map: 'caldera', mode: 'duel' });
  e.startMatch();
  toFighting(e);
  e.fighters[1].x = e.fighters[0].x + 300;
  e.fighters[1].y = e.fighters[0].y;
  const p = e.playerInput;
  drive(e, 120, () => {
    p.basic = true;
    e.fighters[1].x = e.fighters[0].x + 300;
    e.fighters[1].y = e.fighters[0].y;
  });
  p.basic = false;
  stepN(e, 60);
  const me = e.fighters[0];
  check('gunslinger dealt ranged damage', me.dmgDealt > 0);
  check('deadeye procs beyond 260px', me.passiveProcs > 0, `${me.passiveProcs} procs`);
  drive(e, 60, (f) => {
    p.active = f === 2;
  });
  p.active = false;
  stepN(e, 60);
  check('fan-fire on cooldown', me.activeCd > 0);
  me.meter = 100;
  me.hp = me.def.hp;
  e.fighters[1].hp = e.fighters[1].def.hp;
  stepN(e, 3);
  drive(e, 30, (f) => {
    p.ult = f === 2;
    e.fighters[1].x = e.fighters[0].x + 100;
    e.fighters[1].y = e.fighters[0].y;
  });
  p.ult = false;
  check('lead tempest resolved', (me.ultSeen & 8) !== 0);
  const clips = e.clipsReached();
  check('gunslinger clip basic', clips.basic === true);
  check('gunslinger clip skill', clips.skill === true);
  check('gunslinger clip ultimate', clips.ultimate === true);
}

// 3. Caldera surge fires: telegraph → ignite, 2 lit lanes.
{
  const e = new Engine({ player: 'samurai', map: 'caldera', mode: 'duel' });
  e.startMatch();
  toFighting(e);
  e.calderaT = 17.9;
  stepN(e, 30);
  check('caldera telegraph', e.calderaPhase === 'telegraph', e.calderaPhase);
  stepN(e, 90);
  check('caldera ignite', e.calderaPhase === 'ignite', e.calderaPhase);
  const mask = e.litMask;
  let bits = 0;
  for (let i = 0; i < 5; i++) if (mask & (1 << i)) bits++;
  check('caldera 2 lit lanes', bits === 2, `mask ${mask.toString(2)}`);
  const before = e.fighters[0].hp;
  e.fighters[0].x = 1280 * ((e.litA + 0.5) / 5);
  stepN(e, 120);
  check('caldera dot ticks', e.fighters[0].hp < before || e.phase !== 'fighting');
}

// 4. Rooftop blackout fires: dim → hold → restore; cover blocks LOS in blackout.
{
  const e = new Engine({ player: 'gunslinger', map: 'rooftop', mode: 'duel' });
  e.startMatch();
  toFighting(e);
  e.rooftopT = 19.9;
  stepN(e, 30);
  check('rooftop dim', e.rooftopPhase === 'dim', e.rooftopPhase);
  stepN(e, 90);
  check('rooftop hold', e.rooftopPhase === 'hold' || e.rooftopPhase === 'restore', e.rooftopPhase);
  const blocked = e.losBlocked(300, 200, 980, 200);
  check('cover blocks LOS in blackout', blocked === true);
  stepN(e, 600);
  check('blackout resolves to idle', e.rooftopPhase === 'idle' || e.phase !== 'fighting', e.rooftopPhase);
}

// 5. KO → done in duel; dummy never retaliates; ember timeout picks HP leader.
{
  const e = new Engine({ player: 'samurai', map: 'caldera', mode: 'duel' });
  e.startMatch();
  toFighting(e);
  e.dealDamage(1, 999, 0);
  check('ko phase', e.phase === 'ko');
  stepN(e, 400);
  check('duel advances or ends after KO', e.phase === 'fighting' || e.phase === 'done', e.phase);
  check('ko clip reached', e.clipsReached().ko === true);
}
{
  const e = new Engine({ player: 'samurai', map: 'caldera', mode: 'dummy' });
  e.startMatch();
  toFighting(e);
  const hpBefore = e.fighters[0].hp;
  stepN(e, 600);
  check('dummy never retaliates', e.fighters[0].hp >= hpBefore - 30, `took ${hpBefore - e.fighters[0].hp}`);
}
{
  const e = new Engine({ player: 'samurai', map: 'caldera', mode: 'ember' });
  e.startMatch();
  toFighting(e);
  e.fighters[0].hp = 80;
  e.fighters[1].hp = 40;
  e.timerS = 0.05;
  stepN(e, 30);
  check('ember timeout → done', e.phase === 'done', e.phase);
  check('ember winner is HP leader', e.koWinner === 0, `winner ${e.koWinner}`);
}

// 6. Stroke regulator: max 6 alive.
{
  const e = new Engine({ player: 'samurai', map: 'caldera', mode: 'duel' });
  e.startMatch();
  toFighting(e);
  for (let i = 0; i < 10; i++) {
    e.strokes.add('slash', 0, 0, 100, 100, false, 6);
  }
  check('stroke cap 6', e.strokes.liveCount() <= 6, `${e.strokes.liveCount()} alive`);
}

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED`);
  process.exit(1);
} else {
  console.log('\nAll sim checks passed.');
}
