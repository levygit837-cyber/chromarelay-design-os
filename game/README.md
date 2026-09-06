# Emberfall Arena — Ink and Gunsmoke

A formal duel — Samurai (brush) vs Gunslinger (puncture) — on a sheet of paper.
Bootable Vite + React 18 + TypeScript (strict) app. Zero UI dependencies.

## Boot

```sh
cd game
npm install
npm run dev
```

Open http://localhost:5191 (dev server defaults to port 5191).

Production build:

```sh
npm run build
```

Headless logic check (engine only, no DOM):

```sh
npm run sim
```

## Controls

| Keys | Action |
|---|---|
| WASD / Arrows | Move |
| Shift | Run modifier (speed 340 vs 220) |
| J | Basic attack (Samurai: 8 dmg slash, 90px · Gunslinger: 7 dmg shot, 420px) |
| 1 | Active skill (Dash-Slash 18 dmg, 8s cd · Fan-Fire 3×6 dmg, 10s cd) |
| U or R | Ultimate at 100 meter (Falling-Ember 45 dmg · Lead Tempest 5×9 zone) |
| P or Esc | Pause |
| M | Mute (audio only — no audio ships; state only) |
| H | Help |
| Enter / Space | Confirm menu · rematch on result |
| Esc | Back / close |

Pointer fallback: click-to-move on the stage + on-screen Basic / Key-1 / Ult buttons.

## Modes

- **Pit Duel vs AI** — first to 2 rounds. You pick a fighter; the AI plays the other.
- **Training Dummy** — non-retaliating dummy; it soaks the first hits so you can practice.
- **Timed Ember** — 90 seconds; highest HP at the horn wins (ties stand).

## Map rules

- **Caldera · Ember Surge** — every 18s, 2 of 5 lanes telegraph (1s, vermilion △) then
  ignite (4s): standing inside ticks 6 HP/s but grants +60% meter rate.
- **Rooftop · Blackout Pulse** — every 20s a 6s blackout (1.2s dim-in + 3.6s hold +
  1.2s restore). Trails and muzzle flashes carry the read; the two AC cover blocks
  break Gunslinger line-of-sight during the blackout and eat projectiles.

## Animation / skill state reachability

Every animation clip is assigned in `Engine.trackAnims()` by priority
(ko › hitstun › ultimate › skill › basic › run › walk › entrance › idle) and recorded
in `Engine.clipsReached()`:

- `entrance` — round start, 900ms stamp, sim locked.
- `idle` — no input; breathing bob.
- `walk` / `run` — move input below/above the Shift threshold (speed 340 run).
- `basic` — J: Samurai arc glyph, Gunslinger rect+barrel glyph + muzzle blink.
- `skill` — key 1 + ready: committed cast pose 300ms, then cooldown (8s/10s).
- `ultimate` — U/R + meter 100: 250ms freeze pose, then resolution.
- `hitstun` — any hit lands, 120–180ms snap + vermilion flash (shape/text paired).
- `ko` — HP ≤ 0: fallen stroke, then result.

Skill state cycles (State Matrix §3) are tracked per fighter as bitmasks
(`activeSeen`: ready→casting→cooling→ready; `ultSeen`: locked→ready→casting→resolved)
and printed in the result stats table. Passives are always-on and counted:
Blade Hunger (+15% meter per hit, Samurai) and Deadeye (+20% damage beyond 260px,
Gunslinger) increment `passiveProcs`. Run `npm run sim` to exercise every row
headlessly — clips, cycles, both map events, KO, dummy, and ember timeout.

## Tokens

Palette, type roles, HUD geometry, stage bounds, and motion values live in
`src/tokens.ts` + `src/tokens.css`, mirrored from the Run `tokens.json`
(paper `#FDFBF6`, ink `#131212`, wash `#E8E2D6`/`#9A958C`, vermilion `#C73E1D`
accent-only; serif display + grotesque data; 1280×720 letterboxed stage;
6-stroke regulator, 1.2s fade, 250ms ult freeze).
