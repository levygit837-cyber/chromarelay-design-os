"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAPS = exports.ROOFTOP_RESTORE_S = exports.ROOFTOP_HOLD_S = exports.ROOFTOP_DIM_IN_S = exports.ROOFTOP_BLACKOUT_S = exports.ROOFTOP_PERIOD_S = exports.CALDERA_METER_BONUS_PCT = exports.CALDERA_TICK_DPS = exports.CALDERA_IGNITE_S = exports.CALDERA_TELEGRAPH_S = exports.CALDERA_PERIOD_S = exports.CALDERA_LIT = exports.CALDERA_LANES = exports.STAGE_H = exports.STAGE_W = void 0;
exports.laneOf = laneOf;
exports.laneCenterX = laneCenterX;
exports.STAGE_W = 1280;
exports.STAGE_H = 720;
/* Caldera — Ember Surge: 18s cycle, 1s telegraph, 4s ignite, 6 HP/s, +60% meter. */
exports.CALDERA_LANES = 5;
exports.CALDERA_LIT = 2;
exports.CALDERA_PERIOD_S = 18;
exports.CALDERA_TELEGRAPH_S = 1;
exports.CALDERA_IGNITE_S = 4;
exports.CALDERA_TICK_DPS = 6;
exports.CALDERA_METER_BONUS_PCT = 60;
/* Rooftop — Blackout Pulse: 20s cycle, 6s blackout (1.2 dim-in + 3.6 hold + 1.2 restore). */
exports.ROOFTOP_PERIOD_S = 20;
exports.ROOFTOP_BLACKOUT_S = 6;
exports.ROOFTOP_DIM_IN_S = 1.2;
exports.ROOFTOP_HOLD_S = 3.6;
exports.ROOFTOP_RESTORE_S = 1.2;
exports.MAPS = {
    caldera: {
        id: 'caldera',
        name: 'Caldera',
        rule: 'Ember Surge',
        ruleShort: 'Surge 18s · 2 of 5 lanes · 4s',
        ruleText: 'Every 18s, 2 of 5 lanes ignite for 4s (1s telegraph). ' +
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
        ruleText: 'Every 20s, a 6s blackout (1.2s dim-in + 3.6s hold + 1.2s restore). ' +
            'In the dark, trails and muzzle flashes carry the read; AC cover blocks Gunslinger line-of-sight.',
        spawnA: { x: 320, y: 360 },
        spawnB: { x: 960, y: 360 },
        covers: [
            { x: 600, y: 120, w: 80, h: 150 },
            { x: 600, y: 450, w: 80, h: 150 },
        ],
    },
};
function laneOf(x) {
    const w = exports.STAGE_W / exports.CALDERA_LANES;
    const i = Math.floor(x / w);
    return i < 0 ? 0 : i >= exports.CALDERA_LANES ? exports.CALDERA_LANES - 1 : i;
}
function laneCenterX(i) {
    const w = exports.STAGE_W / exports.CALDERA_LANES;
    return w * i + w / 2;
}
