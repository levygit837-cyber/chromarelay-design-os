import { useEffect, useRef } from 'react';
import { Engine } from '../game/engine';
import { STAGE_H, STAGE_W, MAPS } from '../game/maps';
import { CALDERA_LANES } from '../game/maps';
import type { FighterState } from '../game/engine';

const PAPER = '#FDFBF6';
const INK = '#131212';
const WASH = '#E8E2D6';
const WASH_WARM = '#E2D8C6';
const WASH_COOL = '#D8D5CC';
const WASH_DARK = '#9A958C';
const VERMILION = '#C73E1D';

interface Props {
  engine: Engine;
  paused: boolean;
}

export function StageCanvas({ engine, paused }: Props): JSX.Element {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number): void => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!pausedRef.current) engine.update(dt);
      draw(ctx, engine, now / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [engine]);

  return (
    <div className="stage-frame">
      <canvas ref={ref} width={STAGE_W} height={STAGE_H} role="img" aria-label="Arena stage" />
    </div>
  );
}

function draw(ctx: CanvasRenderingContext2D, e: Engine, t: number): void {
  const shake = e.reducedMotion || e.shakeT <= 0 ? 0 : Math.min(6, e.shakeT * 18);
  const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  ctx.save();
  ctx.translate(sx, sy);

  // Paper ground + wash density per map.
  ctx.fillStyle = PAPER;
  ctx.fillRect(-8, -8, STAGE_W + 16, STAGE_H + 16);
  ctx.fillStyle = e.mapId === 'caldera' ? WASH_WARM : WASH_COOL;
  ctx.fillRect(0, 0, STAGE_W, STAGE_H);

  const laneW = STAGE_W / CALDERA_LANES;
  if (e.mapId === 'caldera') {
    for (let i = 0; i < CALDERA_LANES; i++) {
      const lit = (e.litMask & (1 << i)) !== 0;
      const x = laneW * i;
      if (e.calderaPhase === 'ignite' && lit) {
        ctx.fillStyle = 'rgba(199,62,29,0.16)';
        ctx.fillRect(x + 4, 60, laneW - 8, STAGE_H - 120);
        ctx.strokeStyle = VERMILION;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 14, 90);
        ctx.lineTo(x + laneW / 2, STAGE_H / 2);
        ctx.lineTo(x + laneW - 14, STAGE_H - 90);
        ctx.stroke();
        ctx.fillStyle = VERMILION;
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('IGNITE −6/s', x + 16, 110);
      } else if (e.calderaPhase === 'telegraph' && lit) {
        ctx.strokeStyle = VERMILION;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(x + 8, 70, laneW - 16, STAGE_H - 140);
        ctx.setLineDash([]);
        ctx.fillStyle = VERMILION;
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('SURGE △', x + 16, 110);
      } else {
        ctx.strokeStyle = 'rgba(19,18,18,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + laneW / 2, 90);
        ctx.lineTo(x + laneW / 2, STAGE_H - 90);
        ctx.stroke();
      }
    }
  }

  // Rooftop cover blocks — heavy ink masses.
  if (e.mapId === 'rooftop') {
    for (const c of e.covers) {
      ctx.fillStyle = INK;
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = PAPER;
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('AC', c.x + 30, c.y + c.h / 2);
    }
  }

  // Ult zone (Lead Tempest).
  const z = e.readUltZone();
  if (z.alive) {
    ctx.strokeStyle = VERMILION;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(z.x, z.y, 150, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = VERMILION;
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('TEMPEST ZONE', z.x - 52, z.y - 156);
  }

  // Brush strokes — tapered lines, opacity encodes age.
  for (const s of e.strokes.strokes) {
    if (!s.alive) continue;
    const k = 1 - s.age / 1.2;
    ctx.strokeStyle = s.vermilion ? VERMILION : INK;
    ctx.globalAlpha = e.reducedMotion ? 0.75 : 0.25 + 0.65 * k;
    ctx.lineWidth = Math.max(1.5, s.width * (e.reducedMotion ? 0.9 : 0.4 + 0.6 * k));
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s.x1, s.y1);
    ctx.lineTo(s.x2, s.y2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Smoke rings.
  for (const r of e.readRings()) {
    if (!r.alive) continue;
    const k = r.age / 0.6;
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = r.vermilion ? VERMILION : WASH_DARK;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r.x, r.y, 8 + (r.maxR - 8) * k, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Projectiles — ink dots + vermilion blink head.
  for (const p of e.readProjectiles()) {
    if (!p.alive) continue;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = VERMILION;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const fighters = e.fighters;
  drawFighter(ctx, fighters[0], t, e);
  drawFighter(ctx, fighters[1], t, e);

  // Damage numerals float at hit point, fade ~1.2s with stroke.
  ctx.textAlign = 'center';
  for (const fl of e.readFloaters()) {
    if (!fl.alive) continue;
    const k = 1 - fl.age / 1.2;
    ctx.globalAlpha = k;
    ctx.fillStyle = VERMILION;
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText(`−${Math.round(fl.val)}`, fl.x, fl.y);
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'start';

  // Ink frame — drawn bounds, not walls.
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, STAGE_W - 8, STAGE_H - 8);
  ctx.strokeStyle = WASH;
  ctx.lineWidth = 8;
  ctx.strokeRect(-4, -4, STAGE_W + 8, STAGE_H + 8);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, STAGE_W - 8, STAGE_H - 8);

  // Rooftop blackout dim — trails/flash stay readable on top.
  if (e.mapId === 'rooftop' && e.rooftopPhase !== 'idle') {
    const a = e.rooftopPhase === 'hold' ? 0.55 : e.rooftopPhase === 'dim' ? 0.3 : 0.25;
    ctx.fillStyle = `rgba(19,18,18,${a})`;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);
    ctx.fillStyle = PAPER;
    ctx.font = '12px Inter, sans-serif';
    const label = e.rooftopPhase === 'dim' ? 'BLACKOUT ◐ dimming' : e.rooftopPhase === 'hold' ? 'BLACKOUT ● hold' : 'BLACKOUT ◑ restoring';
    ctx.fillText(label, 24, 40);
  }

  // Countdown giant numerals + entrance stamp: full ink over a paper pill (legibility on wash/lanes/covers).
  if (e.phase === 'countdown') {
    ctx.font = '160px Georgia, serif';
    ctx.textAlign = 'center';
    const label = String(e.countdownN);
    const w = ctx.measureText(label).width;
    ctx.fillStyle = PAPER;
    ctx.fillRect(STAGE_W / 2 - w / 2 - 28, STAGE_H / 2 - 132, w + 56, 196);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.strokeRect(STAGE_W / 2 - w / 2 - 28, STAGE_H / 2 - 132, w + 56, 196);
    ctx.globalAlpha = 1;
    ctx.fillStyle = INK;
    ctx.fillText(label, STAGE_W / 2, STAGE_H / 2 + 60);
    ctx.textAlign = 'start';
  } else if (e.phase === 'entrance') {
    ctx.font = '40px Georgia, serif';
    ctx.textAlign = 'center';
    const label = MAPS[e.mapId].name;
    const w = ctx.measureText(label).width;
    ctx.fillStyle = PAPER;
    ctx.fillRect(STAGE_W / 2 - w / 2 - 24, STAGE_H / 2 - 56, w + 48, 76);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.strokeRect(STAGE_W / 2 - w / 2 - 24, STAGE_H / 2 - 56, w + 48, 76);
    ctx.globalAlpha = 1;
    ctx.fillStyle = INK;
    ctx.fillText(label, STAGE_W / 2, STAGE_H / 2);
    ctx.textAlign = 'start';
  }
  if (e.phase === 'ko') {
    ctx.fillStyle = VERMILION;
    ctx.font = '96px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('KO', STAGE_W / 2, STAGE_H / 2 + 30);
    ctx.textAlign = 'start';
  }

  ctx.restore();
}

function drawFighter(ctx: CanvasRenderingContext2D, f: FighterState, t: number, e: Engine): void {
  const flash = f.anim === 'hitstun' && !e.reducedMotion ? (Math.floor(t * 30) % 2 === 0) : false;
  const body = flash ? VERMILION : INK;
  const bob = f.anim === 'idle' ? Math.sin(t * 2 + f.side) * 2 : 0;
  const stepOff = f.anim === 'walk' ? Math.sin(t * 8) * 4 : f.anim === 'run' ? Math.sin(t * 12) * 7 : 0;
  const lean = f.anim === 'run' ? f.facing * 8 : 0;
  let alpha = 1;
  let scale = 1;
  if (f.anim === 'entrance') {
    const k = Math.min(1, f.animT / 0.9);
    scale = 0.6 + 0.4 * k;
    alpha = k;
  }
  if (f.anim === 'ko') {
    // Fallen: lying stroke + clearing ring.
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.translate(f.x, f.y + 18);
    ctx.rotate(f.facing * 0.12);
    ctx.strokeStyle = body;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-42, 0);
    ctx.lineTo(42, 0);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(f.x, f.y + bob);
  ctx.scale(f.facing * scale, scale);

  const flinch = f.anim === 'hitstun' ? -8 : 0;
  ctx.translate(flinch, 0);

  if (f.def.id === 'samurai') {
    // Grounded shadow puddle.
    ctx.fillStyle = 'rgba(19,18,18,0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 30, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Legs — walk/run cycle offsets.
    ctx.strokeStyle = body;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8 + stepOff, 22);
    ctx.moveTo(0, 0);
    ctx.lineTo(8 - stepOff, 22);
    ctx.stroke();
    // Torso.
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(lean * 0.4, -18);
    ctx.stroke();
    // Head knot.
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(lean * 0.4 + 2, -28, 7, 0, Math.PI * 2);
    ctx.fill();
    // Blade — tapered arc; per-clip pose.
    ctx.strokeStyle = f.anim === 'skill' || f.anim === 'ultimate' ? VERMILION : body;
    if (f.anim === 'basic') {
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(14, -10, 34, -1.2, 1.1);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(14, -10, 44, -1.0, 0.9);
      ctx.stroke();
    } else if (f.anim === 'skill') {
      // Dash-Slash: committed lunge silhouette.
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-30, 6);
      ctx.lineTo(46, -16);
      ctx.stroke();
    } else if (f.anim === 'ultimate') {
      // Falling-Ember: raised arc + ember dots.
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.arc(0, -34, 30, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = VERMILION;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-24 + i * 12, -52 - (i % 2) * 8, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Idle/walk/run: blade low.
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(6, -2, 26, 0.3, 1.9);
      ctx.stroke();
    }
    // Cast marker: vermilion tick above head during skill/ult.
    if (f.anim === 'skill' || f.anim === 'ultimate') {
      ctx.fillStyle = VERMILION;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText(f.anim === 'skill' ? '1' : 'U', -4, -58);
    }
  } else {
    // Gunslinger: rect torso + barrel glyph.
    ctx.fillStyle = 'rgba(19,18,18,0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 22, 28, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = body;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-7 + stepOff, 22);
    ctx.moveTo(0, 0);
    ctx.lineTo(7 - stepOff, 22);
    ctx.stroke();
    // Long coat rect.
    ctx.fillStyle = body;
    ctx.fillRect(-9 + lean * 0.3, -22, 18, 26);
    ctx.beginPath();
    ctx.arc(lean * 0.3 + 1, -30, 7, 0, Math.PI * 2);
    ctx.fill();
    // Hat brim.
    ctx.fillRect(-12 + lean * 0.3, -38, 26, 4);
    // Barrel — per-clip pose + muzzle blink.
    const aim = f.anim === 'skill' ? -4 : f.anim === 'ultimate' ? -14 : -12;
    ctx.strokeStyle = body;
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (f.anim === 'skill') {
      // Fan-Fire: three barrels.
      for (const off of [-8, 0, 8]) {
        ctx.moveTo(8, aim + off * 0.4);
        ctx.lineTo(44, aim + off);
      }
    } else {
      ctx.moveTo(8, aim);
      ctx.lineTo(46, aim);
    }
    ctx.stroke();
    if (f.anim === 'basic' || f.anim === 'skill') {
      // Muzzle blink: vermilion star, 120ms read.
      ctx.fillStyle = VERMILION;
      ctx.save();
      ctx.translate(50, aim);
      ctx.rotate(Math.PI / 4);
      const r = f.anim === 'skill' ? 12 : 9;
      ctx.fillRect(-r, -2, r * 2, 4);
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(-r, -2, r * 2, 4);
      ctx.restore();
    }
    if (f.anim === 'ultimate') {
      ctx.strokeStyle = VERMILION;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(30, aim, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = VERMILION;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('U', 24, -52);
    } else if (f.anim === 'skill') {
      ctx.fillStyle = VERMILION;
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('1', 24, -48);
    }
  }

  ctx.restore();

  void STAGE_H;
}
