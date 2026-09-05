# Component Plan — watchtest landing page

Note on inputs: the packet declares `component inventory` as an input. No inventory exists —
this is a greenfield single-file surface, and nothing in the packet says what to do when a
declared input has no referent. Treated as empty, which makes the `component-reuse` gate
vacuous for this Run rather than failed.

## Components — four, and no more

### 1. `MetricHero`
- **Structure:** `<header>` containing label / number / caption.
- **Props (as data attributes, no framework):** `label`, `value`, `unit`, `caption`.
- **Contract:** `value` renders with `font-variant-numeric: tabular-nums` and
  `--size-hero` as a `clamp()`. Total characters of `value` + `unit` must not exceed four;
  above that, `unit` moves into `caption`.
- **States:** initial (0), counting (400ms), settled. Reduced motion renders settled directly.

### 2. `InstallLine`
- **Structure:** `<div>` with a `<code>` and a `<button>`.
- **Contract:** the `<code>` text is selectable and is the single source for the clipboard
  write — the button reads from the DOM, never from a duplicated string literal.
- **States:** rest, hover, focus-visible, copied.
- **Accessibility:** `<button>` with a visible text label (`copy`), `aria-live="polite"`
  region for the `copied` announcement, focus-visible ring in `--signal` 2px.

### 3. `OutputBlock`
- **Structure:** `<figure>` with `<pre>`, plus `role="img"` and a summarising `aria-label`.
- **Contract:** never wraps. `overflow-x: auto` at narrow widths. Pass lines use `--signal`;
  all other lines use `--ink` or `--ink-dim`. No syntax colouring beyond that.
- **States:** rest, x-scrolled.

### 4. `ProseBlock`
- **Structure:** `<section>` with three `<p>`.
- **Contract:** measure capped at 68ch, no headings, no cards, no borders.
- **States:** none.

## Component state contracts summary
| Component | States | Keyboard | Reduced motion |
|---|---|---|---|
| MetricHero | initial, counting, settled | n/a | skips to settled |
| InstallLine | rest, hover, focus-visible, copied | yes — button | copied swap is instant |
| OutputBlock | rest, x-scrolled | scrollable region focusable | n/a |
| ProseBlock | none | n/a | n/a |

## Reuse position
Nothing to reuse. Of the four, `MetricHero` and `OutputBlock` are the two with reuse
potential across future metric and process surfaces; `InstallLine` is specific to this
product; `ProseBlock` is a primitive not worth naming twice.

## Critical requirements and their resolution
1. Copy must work without a build step → clipboard API with a `document.execCommand`
   fallback removed; instead, on failure the text stays selected so manual copy works.
2. Output alignment must survive narrow viewports → x-scroll, decided above.
3. Hero must not break at 375px → clamp plus the four-character rule, inherited as contract.
