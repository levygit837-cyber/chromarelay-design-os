"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTHER = exports.FIGHTERS = exports.GUNSLINGER = exports.SAMURAI = void 0;
exports.SAMURAI = {
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
exports.GUNSLINGER = {
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
exports.FIGHTERS = {
    samurai: exports.SAMURAI,
    gunslinger: exports.GUNSLINGER,
};
exports.OTHER = {
    samurai: 'gunslinger',
    gunslinger: 'samurai',
};
