# Surface Brief — watchtest landing page

## Surface
One page, one viewport-height hero plus a short below-fold section. Self-contained HTML file.

## Primary action
Copy the install command. Everything on the page is either evidence for that action or
subordinate to it.

## Information Architecture
Reading order, top to bottom, single column:

1. **Label** — `watchtest` and one clause naming what it does.
2. **Hero metric** — the latency number. This is the claim.
3. **Caption** — what the number measures, one line.
4. **Install line** — the primary action, with copy affordance.
5. **Evidence block** — five lines of real terminal output. The only imagery.
6. **Prose** — three paragraphs: what it watches, how it picks tests, what it does not do.
7. **Footer** — one line: license and repo.

Nothing else. No nav, no feature grid, no testimonials, no pricing.

## Responsive Model
| Range | Behaviour |
|---|---|
| 375-767px | single column, hero at clamp floor 56px, breathing space `--s5` reduced to 5rem, output block scrolls horizontally rather than wrapping |
| 768-1439px | full structure, `--s5` at 12.5rem |
| 1440px+ | column stays at 640px measure and centers; no new behaviour |

The output block never reflows: terminal output is column-aligned, so wrapping destroys its
meaning. It scrolls on the x-axis at narrow widths.

## State Matrix
| Element | States |
|---|---|
| Install line | rest, hover, focus-visible, copied |
| Copy affordance | rest, hover, focus-visible, copied (1.4s), keyboard-activated |
| Hero number | static after one 400ms count-up on load; no state after |
| Output block | rest, x-scrolled (narrow viewports) |
| Reduced motion | count-up suppressed, number renders at final value |

No loading, empty or error states: the page has no data dependency.

## Accessibility contract
- Copy affordance is a `<button>`, reachable by keyboard, with `aria-live="polite"` on the
  status change.
- Focus-visible ring uses `--signal` at 2px, never removed.
- Output block gets `role="img"` with an `aria-label` summarising the run, since column
  alignment is meaningless to a screen reader read linearly.
- Contrast: `--ink` on `--paper` and `--signal` on `--paper` must both clear 4.5:1.

## Non-goals restated
Pricing, docs site, backend. Also: no dark mode in this Run — the light ground is the
Direction's thesis, and a dark variant is a separate decision.
