# Repair evidence — before / after

Baseline preserved as `index.before-repair.html` and `shot-before-repair.png`.
Result: `index.html` and `shot-after-repair.png`.

Note on inputs: the packet declares `approved findings` as an input. **No finding in this Run
was ever approved.** Every decision record carries `status: "proposed"`, and no phase, gate or
mechanism exists that turns a proposed finding into an approved one. This role applied the six
findings on its own reading of the audit report and visual review.

## Batch applied — six findings, one coherent pass

| # | Source | Finding | Change |
|---|---|---|---|
| 1 | audit | no heading element | `.hero__label` is now `<h1>`, visual treatment unchanged (`font-weight: 400`, same size and colour) |
| 2 | audit | `--ink-dim` at 4.49:1 | mix raised 55% → 62% |
| 3 | critique | unit competes with the number | `.hero__unit` at `0.45em` in `--ink-dim` |
| 4 | critique | three identical 200px voids | `--s5` split into three role-differentiated steps (5/8/11rem), smallest before the primary action |
| 5 | critique | ~700px of trailing blank | `padding-block-end: var(--s4)` on footer, and the gap chain no longer accumulates |
| 6 | critique | count-up damages the artifact's own evidence | animation now also suppressed by `data-static` on `<html>` |

Additional finding found during repair verification, not in either report: `.output .pass`
measured **4.20:1** on the inset ground. `--signal` darkened `#0B7A4B` → `#08693F`.

## Measured before / after

| Measure | Before | After | Method |
|---|---|---|---|
| `h1` count | 0 | 1 | DOM query |
| headings total | 0 | 1 | DOM query |
| `--ink-dim` on paper | 4.49 FAIL | **5.63 PASS AA** | computed colour rasterised to pixels |
| copy button on inset | 3.92 FAIL | **4.91 PASS AA** | same |
| `.output .dim` on inset | 3.92 FAIL | **4.91 PASS AA** | same |
| `.output .pass` on inset | 4.20 FAIL | **5.28 PASS AA** | same |
| `--signal` on paper | 4.81 | 6.05 | same |
| hero unit size | 128px | 57.6px vs hero 128px | computed style |
| document height | ~2400 (content ended ~1740, ~700px trailing) | **1547**, footer bottom 1499 | `scrollHeight` |
| token drift | 0 | **0** | 3 hex literals, all inside custom property declarations |
| custom properties | 15 | 20 | CSS parse |
| capture determinism | **3 distinct hashes in 6 runs** | **1 hash in 4 runs** with `data-static` | md5 of PNG |
| tag balance | balanced | balanced | node parse |

## Measurement correction

My first token-drift count after the repair reported **1 drift**. It was counting the old
`#0B7A4B` inside the explanatory CSS comment. Stripping comments before matching gives 3 hex
literals in real code, all of them inside `--paper`, `--ink` and `--signal`. Drift is zero.

## build-health after repair — PASS (measured)
Tags balanced, zero external CSS/JS/font, renders 1440x900, 4/4 identical captures with
`data-static`.

## visual-quality after repair
Cannot be scored by this role — the Repairer is not the critic, and `creatorMayFinalCritique`
is `false` in the Run Contract. The rendered result is at `shot-after-repair.png` for whoever
does score it. What is verifiable here: all four critique findings have a corresponding
measured change, and the hero now renders `41ms` rather than a mid-animation value.

## Not repaired, deliberately

**State captures** (`copied`, `focus-visible`, reduced-motion) are still absent. Producing them
requires driving interaction before capture, which `--screenshot` cannot do. Out of scope for a
repair; it is a capability gap in the system.
