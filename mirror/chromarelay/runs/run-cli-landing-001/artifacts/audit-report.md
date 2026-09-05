# Audit Report — watchtest landing page

**Scope:** `artifacts/index.html`. Every row below is a command that ran; where a declared
gate had no executable method available, that is stated rather than scored.

## Tooling reality

The Phase Packet's skill kit names `axe-core` with `authority: deterministic-evidence` and
`class: ["TOOL", "GATE"]`. It is **not installed**: `ls node_modules/axe-core` → no such
directory, and `package.json` has zero runtime dependencies. So the automated accessibility
pass that the `accessibility` gate is built around could not run. What follows is DOM and
computed-style measurement via Chromium, which covers a real but narrower set of checks.

`framework/registry/skills.json` declares axe-core with `source:` pointing at GitHub, so this
is graceful degradation by design, not a broken reference. The consequence is still that the
strongest gate in the workflow ran on the weaker instrument.

## build-health — PASS (measured)

| Check | Result |
|---|---|
| Tag balance | all balanced |
| External resources | zero CSS/JS/font; one `href` to the repo |
| Renders 1440x900 | valid PNG, correct dimensions |
| Render determinism | 3/3 identical md5 |

## token-drift — PASS (measured)

- 3 hex literals in the file, **3 of 3 inside custom property declarations**. Zero drift.
- 15 custom properties declared.
- 7 literal px values, all of them structural rather than color or type: `767` (breakpoint),
  `3`/`2`/`1` (outline width, underline offset, hairlines). None duplicates a token.
- Spacing values in use: exactly the five declared steps plus `--measure` and the clamp bounds.

Verdict: the palette and type scale are genuinely enforced by the token layer, not merely
declared. This is the one place the design honoured its declared contract mechanically.

## responsive-geometry — PASS with one caveat (measured)

Measured in a real 375px container (see the instrument note below):

| Element | 375px | overflow |
|---|---|---|
| `main` | 375.0 | 0 |
| `.install` | 343.0 | 0 |
| `.output pre` | 343.0 clientW / 384 scrollW | **41px, by design** (x-scroll) |
| `.hero__metric` | 343.0 | 0 |
| copy button right edge | 343.0 | fits |

Hero clamp resolves 70px at narrow and 128px at 1440. Contract honoured.

**Instrument note, and it matters more than the result.** The first capture used
`--headless=new --window-size=375,812`. The PNG is 375px wide, but `window.innerWidth` inside
it measured **500**: Chromium's new headless mode pins window width at a ~500px floor, so the
page was laid out at 500 and the image cropped. Swept `--window-size` from 320 to 600 —
`innerWidth` stayed at 500 until 600. The resulting screenshot showed apparent horizontal
overflow that does not exist at real 375px. Stable, repeatable, and wrong.

`shot-375.png` in this Run is therefore **not valid mobile evidence** and is retained only as
the exhibit for this failure mode.

## accessibility — PARTIAL, one real failure (measured)

Structure and ARIA:

| Check | Result |
|---|---|
| `lang` attribute | `en` |
| `<title>` | present |
| viewport meta | present |
| copy affordance is a real `<button>` | yes |
| `aria-live` region | `polite` |
| output block `role="img"` + `aria-label` | both present |
| images without `alt` | 0 |
| `:focus-visible` rule | present |
| `prefers-reduced-motion` rule | present |

**FAILURE — heading structure.** `h1 count = 0`, `headings total = 0`. The page has no heading
element at all. The product name and the primary claim are both `<p>`. A screen-reader user
gets no document outline and no way to jump to the page's subject. Cost: the surface is
navigable only by linear read. Decision needed: `.hero__label` or the metric becomes an `<h1>`
with the visual treatment unchanged.

**Contrast — measured by rasterising computed colors to pixels** (the computed values resolve
to `oklab()`, so parsing them as RGB gives nonsense; a first pass reported 1.00 and 1.16 ratios
before this was caught):

| Pair | Ratio | AA verdict |
|---|---|---|
| `--ink` on `--paper` | 16.19 | pass |
| `.install__code` on inset | 14.13 | pass |
| `--signal` on `--paper` | 4.81 | pass |
| **`--ink-dim` on `--paper`** (label, caption, footer) | **4.49** | **fails by 0.01** |
| `.install__copy` on inset | 3.92 | fails for body text |
| `.output .pass` on inset | 4.20 | fails for body text |
| `.output .dim` on inset | 3.92 | fails for body text |

`--ink-dim` is `color-mix(in oklab, var(--ink) 55%, var(--paper))` and lands at 4.49:1 — one
hundredth below the 4.5 threshold, applied to 13px and 15px text. Raising the mix to 60%
resolves it. Cost as it stands: the caption, label and footer are non-compliant for their size.

## state-coverage — PASS as scoped (measured)

Declared states in the Component Plan: install line rest/hover/focus-visible/copied, hero
count-up, output x-scroll, reduced-motion suppression. All have a corresponding CSS rule or
script branch, verified in the stylesheet and script. The surface has no data dependency, so
loading/empty/error states do not apply — the Surface Brief states this and the audit accepts it.

## Screenshots and state captures

| File | Status |
|---|---|
| `shot-1440.png` | valid, 1440x900, deterministic |
| `shot-375.png` | **invalid as mobile evidence** — see instrument note |

State captures (copied, focus-visible, reduced-motion) were **not produced**. Producing them
needs scripted interaction before capture, which `--screenshot` alone cannot do. The phase
declares `state captures` as a required output; this output is missing and no mechanism in the
system would have noticed.

## Objective blockers

1. **No heading element** — accessibility, must fix before promotion.
2. **`--ink-dim` at 4.49:1** — accessibility, one-line fix.
3. **State captures not produced** — declared output absent; capability gap, not a design defect.
