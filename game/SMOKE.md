# SMOKE — Emberfall Arena (manual playtest checklist + headless evidence)

Headless suite: `npm run sim` — **All sim checks passed** (37 rows, exit 0).
Output is pasted in BUILD-NOTES.md. It drives the real `Engine` (no DOM) and asserts:

- Menu/round flow: entrance on start → fighting via real entrance+countdown ticks.
- Both fighters playable (Samurai block + Gunslinger block).
- All 9 animation clips reached and recorded in `Engine.clipsReached()`:
  entrance, idle, walk, run, basic, skill, ultimate, hitstun, ko
  (ko asserted in the KO block; `node sim-check.cjs` prints each `ok samurai clip …`).
- All skill cells (State Matrix §3):
  - passive always-on counted (`passiveProcs`: Blade Hunger +15% meter, Deadeye +20% dmg >260px),
  - key-1 ready→casting→cooling→ready (`activeSeen` mask 111 + `activeCd > 0` → `ready-again` bit 8),
  - Ult locked→ready→casting→resolved (`ultSeen` mask with resolved bit 8; locked→ready set in `afterTick`).
- Both map events: Caldera telegraph→ignite with 2 lit lanes + 6HP/s dot;
  Rooftop dim→hold→restore + cover blocks LOS during blackout.
- Modes: duel KO→next round/done, dummy never retaliates, ember timeout picks HP leader.
- Stroke regulator: 10 adds → ≤6 alive.

Code-path assertion (grep, run 2026-09-06, engine.ts):

```
'basic' x2, 'entrance' x10, 'hitstun' x2, 'idle' x17, 'ko' x7,
'run' x2, 'skill' x1, 'ultimate' x1, 'walk' x2
```

Single assignment site: `Engine.trackAnims()` (+ `doBasic()` sets `basic`
explicitly so held-J repeats register). No specimen markup copied —
`grep -ri specimen src/` returns zero hits (fresh canvas implementation).

## Manual playtest (do once against `npm run dev`, http://localhost:5191)

- [ ] Menu flow keyboard-only: Enter preselects Pit Duel → Fighter (Samurai*) →
      Map (Caldera*) → Battle; visible focus ring on every card; Esc backs out.
- [ ] Battle HUD: two 320px ink rules + HP numerals, 44px seal meter 0–100,
      18px key-1 pip (○+seconds cooling / ●+✓ ready), timer, round line.
- [ ] Move with WASD/arrows (walk), hold Shift (run, visibly faster + lean);
      J basic (slash arc / muzzle blink + smoke ring); 1 active (cast pose + cooldown);
      U/R at 100 meter (250ms freeze + full stroke); P/Esc pause; M mute; H help.
- [ ] Caldera: every ~18s lanes telegraph (△ outline + strip text) then ignite
      (● + `IGNITE −6/s`); stand inside → HP ticks + faster meter.
- [ ] Rooftop: every ~20s blackout dims stage (◐ dimming → ● hold → ◑ restoring);
      shots stop at AC cover blocks; trails/flash stay readable.
- [ ] Hit feedback: vermilion numeral + stroke stamp + snap (shape/text, never color alone).
- [ ] KO: slow-mo + vermilion KO word → Result (winner, score, stroke story, stats table);
      Enter = rematch (one key), F = change, Esc = menu.
- [ ] Pause: sim frozen, Tier-2 kits + map rule + controls + meter/cooldown snapshot,
      resume/restart/quit, mute + reduced-motion toggles.
- [ ] Reduced motion (toggle or OS setting): trails freeze to stamps, no shake/flash;
      state changes snap by shape/text.
- [ ] Narrow viewport (~375px): stage letterboxes (never crops), HUD compresses,
      touch buttons appear (Basic / Key-1 / Ult / Pause), no horizontal scroll.

## Repair batch 02 verification (2026-09-06)

`npm run build` exit 0 (42 modules, ✓ built in 403ms) · `npm run sim` exit 0
(35 ok, `All sim checks passed.`) · drift-hex grep zero hits · wash-dark small-text
grep zero hits · `curl http://localhost:5194/` → HTTP 200. Full tails in BUILD-NOTES.md
`Repair batch 02` + REPAIR-REPORT. Manual playtest rows above still apply (unchanged).
