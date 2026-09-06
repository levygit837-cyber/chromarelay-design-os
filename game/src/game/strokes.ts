/**
 * BrushStrokeLayer (lógica) — regulador de no máx. 6 traços vivos, fade de 1.2s.
 * Arrays pré-alocados; update sem alocar. Opacidade/idade codificam o envelhecimento.
 */
export type StrokeKind = 'slash' | 'shot' | 'ult';

export interface Stroke {
  alive: boolean;
  kind: StrokeKind;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  age: number;
  vermilion: boolean;
  width: number;
}

export const STROKE_MAX = 6;
export const STROKE_FADE_S = 1.2;

export class StrokeStore {
  readonly strokes: Stroke[] = [];

  constructor() {
    for (let i = 0; i < STROKE_MAX; i++) {
      this.strokes.push({
        alive: false,
        kind: 'slash',
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        age: 0,
        vermilion: false,
        width: 6,
      });
    }
  }

  add(
    kind: StrokeKind,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    vermilion: boolean,
    width: number,
  ): void {
    let slot = -1;
    let oldest = -1;
    let oldestAge = -1;
    for (let i = 0; i < this.strokes.length; i++) {
      const s = this.strokes[i];
      if (!s.alive) {
        slot = i;
        break;
      }
      if (s.age > oldestAge) {
        oldestAge = s.age;
        oldest = i;
      }
    }
    // Regulador: cheia, a mais velha seca primeiro (sobrescreve).
    if (slot === -1) slot = oldest;
    const s = this.strokes[slot];
    s.alive = true;
    s.kind = kind;
    s.x1 = x1;
    s.y1 = y1;
    s.x2 = x2;
    s.y2 = y2;
    s.age = 0;
    s.vermilion = vermilion;
    s.width = width;
  }

  /** Congelado = reduced-motion: vira carimbo estático. */
  update(dt: number, frozen: boolean): void {
    if (frozen) return;
    for (let i = 0; i < this.strokes.length; i++) {
      const s = this.strokes[i];
      if (!s.alive) continue;
      s.age += dt;
      if (s.age >= STROKE_FADE_S) s.alive = false;
    }
  }

  clear(): void {
    for (let i = 0; i < this.strokes.length; i++) this.strokes[i].alive = false;
  }

  liveCount(): number {
    let n = 0;
    for (let i = 0; i < this.strokes.length; i++) if (this.strokes[i].alive) n++;
    return n;
  }
}
