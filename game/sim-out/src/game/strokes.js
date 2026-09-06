"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrokeStore = exports.STROKE_FADE_S = exports.STROKE_MAX = void 0;
exports.STROKE_MAX = 6;
exports.STROKE_FADE_S = 1.2;
class StrokeStore {
    constructor() {
        this.strokes = [];
        for (let i = 0; i < exports.STROKE_MAX; i++) {
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
    add(kind, x1, y1, x2, y2, vermilion, width) {
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
        if (slot === -1)
            slot = oldest;
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
    update(dt, frozen) {
        if (frozen)
            return;
        for (let i = 0; i < this.strokes.length; i++) {
            const s = this.strokes[i];
            if (!s.alive)
                continue;
            s.age += dt;
            if (s.age >= exports.STROKE_FADE_S)
                s.alive = false;
        }
    }
    clear() {
        for (let i = 0; i < this.strokes.length; i++)
            this.strokes[i].alive = false;
    }
    liveCount() {
        let n = 0;
        for (let i = 0; i < this.strokes.length; i++)
            if (this.strokes[i].alive)
                n++;
        return n;
    }
}
exports.StrokeStore = StrokeStore;
