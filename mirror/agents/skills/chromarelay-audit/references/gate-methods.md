# Gate methods

Per-Gate measurement recipes. Gate definitions, evidence lists, and pass policies
are in `framework/registry/gates.json` — that file is authoritative on pass
policy; this one describes how to take the measurement.

## Environment capture

Capture once per Run, and re-capture whenever a rendered Gate runs in a different
context. Every field appears in the report's `environment` object.

| Field | How to obtain it |
|---|---|
| `commit` | `git rev-parse HEAD`, pinned before the first command |
| `dirty` | `git status --porcelain` — record the output when non-empty |
| `command` | The literal command string, per check |
| `node` / `packageManager` | `node -v`, and the lockfile present in the target |
| `browser` | Engine and version from the driver |
| `viewport` | Width x height, per capture |
| `deviceScale` | Device pixel ratio used |
| `fonts` | Loaded families, and whether webfonts resolved |
| `theme` | Named theme or color scheme |
| `locale` | Locale and text direction |
| `data` | Seed or fixture identifier |
| `reducedMotion` | The `prefers-reduced-motion` value in effect |

A capture missing viewport, device scale, font load state, theme, or seed data is
`not-run`, not a soft `pass`.

## build-health

Read the target's own scripts (`package.json`, `Makefile`, task config) rather
than assuming command names. Run build, typecheck, and the tests the acceptance
contract names.

Capture the browser console and network for each audited Surface: uncaught
errors, unhandled rejections, framework warnings, failed requests, hydration
mismatches. Each becomes its own finding with the emitting file and line where
the stack gives one.

An error the Run has accepted needs an `exceptionRef`. Everything else is `fail`.

## token-drift

Canonical tokens live in the promoted project state. Resolve them first, then
search the implementation for hard-coded visual values: colors in any notation,
font families and sizes, spacing, radii, shadows, z-index, breakpoints,
durations, easings.

Two distinct findings, kept distinct:

- a raw literal where a token exists;
- a token used outside its declared scope.

Report path, line, the literal, and the canonical token it should resolve to. A
value with no canonical equivalent is a `warning` naming the missing token, which
is a gap in the system rather than a builder defect.

## responsive-geometry

Run every viewport the acceptance contract requires, and both the narrowest and
widest supported widths regardless.

Assert per viewport and per required state: no horizontal overflow at the
document root, no clipped text or focus ring, no overlapping interactive
targets, interactive targets at or above the contract's minimum size, sticky and
fixed elements not covering content or each other, layout reorganization actually
occurring where the contract specifies it.

Assert on measured geometry — bounding boxes, scroll widths, computed styles —
and attach a screenshot as corroboration. A screenshot alone is not an assertion.

Also sweep continuously between breakpoints where you can: defects live at the
transition more often than at the named widths.

## state-coverage

Required states, unless the contract narrows them: loading, empty, error,
permission-denied, long-content, disabled, and success.

Each state needs a reproducible trigger recorded with it — the fixture, route,
or interaction that produces it. A state you observed once but cannot re-trigger
is `not-run`.

Long-content means the overflow case the contract does not promise to prevent:
the longest realistic string, the largest realistic collection.

## accessibility

Automated pass first (axe-core or the target's configured equivalent), on each
audited Surface in each required state, since violations appear and vanish with
state. Record rule id, impact, selector, and node count.

Manual checks, each labeled manual in the report:

- reach every interactive element by keyboard, in an order matching visual order;
- focus visible at every stop, against its actual background;
- no focus trap outside an intentional modal, and modals return focus on close;
- Escape and expected keys work where the pattern implies them;
- headings form a coherent outline with no skipped level;
- landmarks and lists convey real structure;
- accessible name present and meaningful for every control, icon button, and image;
- form errors programmatically associated with their fields;
- `prefers-reduced-motion` honored;
- live regions announce without flooding.

Critical and serious automated violations are `fail` without an `exceptionRef`.
A manual check you did not perform is `not-run` for that check — never absorbed
into an automated `pass`.

## component-reuse and contract-consistency

These Gates are owned by other Phases (`component-architect` and
`system-architect`). Measure the facts and report them; the Gate decision is not
yours.

- new components lacking a recorded resolution against the existing registry;
- near-duplicates of existing components;
- accessible primitives hand-rolled where the registry provides one;
- component props used but undeclared in the contract, or declared states missing;
- broken token references and schema errors.

## visual regression

Compare against the frozen Baseline in an environment identical on every capture
field. Report the diff, its region, and its magnitude.

Do not label a diff an improvement or a regression. Which one it is depends on
the Direction, and the blind comparison Phase decides that.
