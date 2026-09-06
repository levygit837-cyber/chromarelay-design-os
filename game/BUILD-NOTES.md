# BUILD-NOTES — Emberfall Arena · Run cr21-battleground-a1 · lighthouse-build

Fresh implementation in `game/` (Vite + React 18 + TS strict, zero UI deps).
No specimen markup copied — specimens were never opened; stage/HUD/menus were
implemented fresh from the DESIGN draft + tokens + Component Plan
(`grep -ri specimen src/` → zero hits). Single `<canvas>` owns the stage;
DOM owns menus/HUD/strip/result/overlays; the engine never touches the DOM.

## What renders

- S1 ModeSelect (Pit Duel* / Dummy / Timed Ember), S2 FighterSelect (Samurai* with
  Tier-2 kit disclose), S3 MapSelect (Caldera* with rule text), S4 Battle
  (letterboxed 1280×720 canvas + CartoucheHUD + MapStrip + touch fallback),
  S5 Result (KO word + winner + stroke story + stats incl. skill cycles),
  S6 Pause (frozen sim + Tier-2 + meter/cooldown snapshot + toggles), S7 Help.
- Fighters: Samurai arc glyph vs Gunslinger rect+barrel glyph, per-clip poses
  (idle bob, walk/run offsets, basic lunge/blink, skill/ult cast, entrance stamp,
  hitstun vermilion flash, ko fallen stroke), muzzle blink + smoke rings,
  6-stroke brush trails (1.2s fade; stamps under reduced-motion).
- Map events: Caldera surge (18s/1s telegraph/4s ignite, 6HP/s, +60% meter);
  Rooftop blackout (20s/6s dim-hold-restore, cover blocks Gunslinger LOS).

## How to boot

```sh
cd game
npm install
npm run dev     # http://localhost:5191
npm run build   # tsc --noEmit + vite build → dist/
npm run sim     # headless engine suite (tsc -p tsconfig.sim.json + node sim-out/sim-check.js)
```

## Check outputs (2026-09-06, captured verbatim)

### npm run build (tail)

```text
npm notice run emberfall-arena@1.0.0 build
npm notice run tsc --noEmit && vite build
vite v5.4.21 building for production...
transforming...
✓ 42 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.42 kB │ gzip:  0.30 kB
dist/assets/index-qtSWwZaG.css    5.71 kB │ gzip:  1.82 kB
dist/assets/index-BD_HFt1E.js   186.49 kB │ gzip: 59.35 kB
✓ built in 412ms
```

### dev boot + curl

```text
VITE v5.4.21  ready in 123 ms
➜  Local:   http://localhost:5191/
curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:5191/  →  HTTP 200
```

### npm run sim (headless, exit 0 — full output)

```text
ok   entrance phase on start
ok   reaches fighting
ok   samurai clip entrance
ok   samurai clip idle
ok   samurai clip walk
ok   samurai clip run
ok   samurai clip basic
ok   samurai clip skill
ok   samurai clip ultimate
ok   samurai clip hitstun
ok   samurai active cycle ready→casting→cooling — mask 111
ok   samurai ult resolved
ok   samurai passive procs
ok   gunslinger dealt ranged damage
ok   deadeye procs beyond 260px — 4 procs
ok   fan-fire on cooldown
ok   lead tempest resolved
ok   gunslinger clip basic
ok   gunslinger clip skill
ok   gunslinger clip ultimate
ok   caldera telegraph — telegraph
ok   caldera ignite — ignite
ok   caldera 2 lit lanes — mask 1001
ok   caldera dot ticks
ok   rooftop dim — dim
ok   rooftop hold — hold
ok   cover blocks LOS in blackout
ok   blackout resolves to idle — idle
ok   ko phase
ok   duel advances or ends after KO — fighting
ok   ko clip reached
ok   dummy never retaliates — took 0
ok   ember timeout → done
ok   ember winner is HP leader — winner 0
ok   stroke cap 6 — 6 alive

All sim checks passed.
```

(Captured 2026-09-06 via `npm run sim`; 37 `ok` rows + summary, exit 0.)

### Animation-state grep (engine.ts, code-path assertion)

```text
'basic' x2, 'entrance' x10, 'hitstun' x2, 'idle' x17, 'ko' x7,
'run' x2, 'skill' x1, 'ultimate' x1, 'walk' x2
```

Single assignment site `Engine.trackAnims()` (+ explicit `basic` stamp in
`doBasic()` so held-J repeats register). Coverage recorded at runtime in
`Engine.clipsReached()` and asserted per-fighter by the sim.

## Files

```text
game/package.json, vite.config.ts, tsconfig.json, tsconfig.sim.json,
tsconfig.node.json, index.html, README.md, SMOKE.md, BUILD-NOTES.md, sim-check.ts
game/src/main.tsx, tokens.ts, tokens.css, app.css, App.tsx, vite-env.d.ts
game/src/game/fighters.ts, maps.ts, ai.ts, strokes.ts, engine.ts
game/src/components/StageCanvas.tsx, CartoucheHUD.tsx, MapStrip.tsx,
ResultPanel.tsx, Overlays.tsx
```

## Decisions / deviations

- No token exceptions: all color/type/stage/motion values are canonical roles
  (post-repair-02: the three audit drift hexes were replaced by tokens — see Repair batch 02).
  Display/data type uses system serif/grotesque stacks (no webfont fetch) with
  the specified sizes/tracking — accepted exception br-01 (perf/offline), stacks retained as fallback.
- `Engine.forceFighting()` is a test-only seam (sim-check skips entrance);
  the App never calls it — real play always runs entrance → countdown.
- Timed Ember tie at the horn stands as "Nobody" (equal HP) rather than a
  coin-flip; duel timeout still picks HP-then-meter so Pit Duel always advances.
- Training Dummy soaks the first 3 would-be killing blows to 1 HP (practice
  rail, never a KO); damage/meter accounting is unaffected.
- `npm run sim` compiles to `sim-out/` with a local `{"type":"commonjs"}` shim
  (package root is `type: module`); `sim-out/` and `dist/` are build artifacts,
  not sources.

## Risks

- AI is a fixed-default tick heuristic (approach/retreat/strafe by range); high-level
  play can bait it — accepted per contract (no learning, no netplay).
- Canvas glyphs are drawn, not sprite-tested: visual proof needs eyes on
  http://localhost:5191 (SMOKE.md checklist); headless suite covers sim only.
- Manual playtest rows in SMOKE.md (keyboard flow, both maps live, HUD reads,
  pause/help, reduced-motion, 375px) were not executed in this pass — needs a
  human or browser-driven run before the audit gate.

## Repair batch 02 (2026-09-06, repairCycle 1 — audit FAILs + critic verdict `repairable`)

### 1. Token drift — StageCanvas.tsx
Before: `StageCanvas.tsx:60` ground `#EFE7D6` (caldera) / `#E4E1D8` (rooftop);
`StageCanvas.tsx:104` cover fill `#3A3835`.
After: `StageCanvas.tsx:62` ground `WASH_WARM #E2D8C6` / `WASH_COOL #D8D5CC`
(constants `WASH_WARM`/`WASH_COOL`, lines 10-11); `StageCanvas.tsx:106` cover fill `INK #131212`
(choice: auditor-preferred `#131212` over `inkSoft #2A2928` so covers read as heavy ink masses
against the wash ground; stroke `INK` unchanged).
Check: `grep -rn "EFE7D6\|E4E1D8\|3A3835" src/` → no matches (exit 1).

### 2. Contrast — app.css
Before: `.muted` (app.css:11), `.card-blurb` (app.css:34), `.hud-tag` (app.css:59)
used `var(--wash-dark)` = `#9A958C` on paper `#FDFBF6` = 2.88:1 (< 4.5:1) at 12–14px.
After: all three use `var(--ink-soft)` = `#2A2928` on paper = 14.04:1 (≥ 4.5:1).
`var(--wash-dark)` remains only for large/decorative: `.stats` table borders
(app.css:118) and smoke-ring strokes (`StageCanvas.tsx:150`, canvas pixels, never small text).
Check: `grep -rn "color:.*wash-dark" src/app.css` → no matches (exit 1).

### 3. Focus trap — Overlays.tsx (critic blocker)
Before: `PauseOverlay`/`HelpOverlay` autofocused but Tab escaped into the frozen
background; focus lost on close.
After: `useSheetFocus()` (Overlays.tsx:54-89) autofocuses the primary button,
traps Tab/Shift+Tab over focusables inside `.sheet`, and restores focus to the
invoker on unmount. Esc/Enter/R/Q shortcuts unchanged.

### 4. Critic minors
(a) Footer mute label: `App.tsx:126,551` — before `'Sound on (M)'` (overpromised,
no audio ships); after `'Unmuted — state only (M)'` / `'Muted (M)'`.
(b) Live announcer: `App.tsx:306-327` `Announcer` — visually-hidden `aria-live=polite`
`role=status` paragraph mirroring countdown numerals (`Countdown 3/2/1`), `KO`,
entrance map name, and map phases (Surge telegraph / Ignite / Blackout
dimming-hold-restoring). CSS `.visually-hidden` (app.css:13).
(c) Pointer hint: `App.tsx:448` one-liner under `MapStrip` —
`Click or tap the stage to steer your fighter toward the pointer.` (`.pointer-hint`, app.css:14).
(d) Entrance/countdown legibility: countdown (160px) + entrance stamp (40px) now paint
at full `INK` over a paper pill with ink border (`StageCanvas.tsx:210-239`);
entrance hold extended 0.9s → 1.2s (`engine.ts:342`).
(e) Strip wrap: `MapStrip` keeps one flex row at desktop; at ≤700px the state line
drops to a second centered line (`.map-strip .map-state { flex-basis: 100% }`,
app.css:126-132). Canvas label sizes unchanged relative to the 1280 grid
(12px lane/zone/blackout, 11px AC, 20px damage, 40/160/96px stamps).
(f) Display/data faces: NO webfont download — accepted exception br-01
(zero-dep offline prototype; `--font-display`/`--font-data` stacks already specified
in tokens.css:14-15 as fallback). No perf/offline regression.

### Outputs (post-fix, captured verbatim)
`npm run build` exit 0 — 42 modules, css 5.96 kB, js 188.18 kB, built in ~400ms
(full tail pasted in REPAIR-REPORT).
`npm run sim` exit 0 — 35 ok + `All sim checks passed.`
(entrance 1.2s still reaches fighting via `toFighting` loop; full tail pasted in REPAIR-REPORT).
`curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:5194/` → `HTTP 200`.

## Decisions / deviations (appended)

- br-01 (accepted exception, critic minor f): retain system font stacks; no webfont
  download. Rationale: zero-dep offline prototype; fallback stacks already specified
  (`--font-display`/`--font-data`). Alternative considered: bundle faces. Risk: display
  contrast flatter than Direction. Revisit when canonical promotion funds fonts.
