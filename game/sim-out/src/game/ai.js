"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NEUTRAL = void 0;
exports.aiTick = aiTick;
exports.NEUTRAL = {
    mx: 0,
    my: 0,
    run: false,
    basic: false,
    active: false,
    ult: false,
};
/** Preenche `out` com a decisão do tick. Pura e determinística. */
function aiTick(v, out) {
    const dx = v.fx - v.sx;
    const dy = v.fy - v.sy;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    out.mx = 0;
    out.my = 0;
    out.run = false;
    out.basic = false;
    out.active = false;
    out.ult = false;
    if (v.kind === 'samurai') {
        // Rushdown: fecha até 70px, corre além de 300px.
        if (dist > 80) {
            out.mx = nx;
            out.my = ny * 0.6;
            out.run = dist > 300;
        }
        else if (dist < 40) {
            out.mx = -nx * 0.5;
        }
        if (v.basicReady && dist < 95)
            out.basic = true;
        if (v.activeReady && dist >= 100 && dist < 260)
            out.active = true;
        if (v.meter >= 100 && dist < 320)
            out.ult = true;
    }
    else {
        // Zona: segura 260–420px, recua perto, flanqueia longe.
        if (dist < 220) {
            out.mx = -nx;
            out.my = -ny * 0.5;
            out.run = dist < 150;
        }
        else if (dist > 400) {
            out.mx = nx;
            out.my = ny * 0.5;
            out.run = true;
        }
        else {
            // Strafe determinístico para não virar estátua.
            out.my = Math.sin(v.t * 1.3) > 0 ? 0.7 : -0.7;
            if (v.losBlocked) {
                out.mx = 0;
                out.my = v.sy < 360 ? 1 : -1;
            }
        }
        const canShoot = !v.losBlocked && dist < 420;
        if (v.basicReady && canShoot)
            out.basic = true;
        if (v.activeReady && canShoot && dist < 380)
            out.active = true;
        if (v.meter >= 100 && dist < 420)
            out.ult = true;
    }
}
