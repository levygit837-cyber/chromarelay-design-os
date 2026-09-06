# Responsive Model — Work-Order-Rail Chat Surface

Run: `create-20260906-issue20-chat` | Phase: `surface-architecture` | Status: `proposed` | Producer: `product-strategist` | Date: 2026-09-06 | Language: EN-US
Selected Direction: `direction-work-order`. Specimen markup is visual reference only and is NOT ported.

This is the binding breakpoint contract. A builder implements exactly these four states; anything between them interpolates gutters only, never structure. Widths are CSS viewport widths. No horizontal page scroll at any width (invariant I-1).

---

## 1. Breakpoint table (normative)

| Breakpoint | Layout | Spine | Center column | Left wing | Right wing | Composer |
|---|---|---|---|---|---|---|
| **1440px (docked workbench, >=1181px)** | Three panes + spine docked: left wing + 92px spine column + center measure + right wing | Full rail (`spine-nav.rail` 2px, `spine-nav.node-size` nodes) with labels (`spine-nav.label-text`) + status words + counts + durations; carriage visible (`spine-nav.carriage-bg/text/label`) | Tickets full (`trace-ticket.card-padding`, `trace-ticket.stack-gap`, prose `trace-ticket.prose` at `trace-ticket.prose-measure` 70ch); full ticket heads (pill + duration `trace-ticket.tool-duration`); tool rows full (status + duration) | Docked (`sidebar.session-bg`, `sidebar.padding`, `sidebar.section-gap`); items `sidebar.item-bg/border` with `sidebar.item-active-edge` on active; meta `sidebar.meta` | Docked (`evidence-wing.bg`); cite header (`cite-kicker` + `cite-line` + `cite-scope`); tabs docked (`tab-bg/text` + `tab-active-edge`); panel `panel-bg/border` | In-flow at stack end (`composer.bg`, `composer.border` 2px frame); modes + textarea + follow-ups + hint (`composer.hint`) |
| **<=1180px (evidence drawer)** | Left wing + spine + center docked; right wing undocks | Rail keeps labels + status words; durations hide on spine labels only (`spine-nav.label-sub` counts stay, durations off) | Unchanged structure; cite line (`trace-ticket.cite-line`) doubles as drawer opener label | Docked (unchanged) | Tethered drawer sheet (`dialog.sheet-bg/border/padding`, title `dialog.title`, body `dialog.body`) over scrim (`dialog.scrim`); tether label `dialog.label` reads `DRAWER — ATTACHMENT SHEET (tethered to Turn NN)`; sheet header repeats `evidence-wing.cite-line` `Turn NN / Kind target`; opens on ticket select / Cite-in-wing action; Esc closes; focus trap + return | In-flow (unchanged) |
| **<=820px (left drawer + sticky composer + footnotes)** | Spine (narrowed) + center only docked; both wings undocked | Narrowed rail, labels kept, durations hidden; carriage stays visible | Tickets full width; wing meta translates to footnotes below the stack (`evidence-wing.footnote-text`); footnote per selected ticket cites `Turn NN / Kind target` + scope | Drawer sheet (`dialog.sheet-bg/border`) with tether `SESSIONS drawer`; opens via sessions button in the workbench header; Esc closes; focus trap + return | Same tethered sheet as <=1180px (right-over-left when both open) | Sticky-bottom (`composer.sticky-rule`): textarea + send + modes remain reachable while the stack scrolls beneath; follow-ups collapse to one horizontally scrolling row (no page h-scroll; the row itself scrolls internally with visible affordance) |
| **<=480px down to 375px (strip-spine + stacked drawers)** | Single column: strip-spine (sticky top) + ticket stack + sticky composer; wings as stacked drawers | Strip: sticky top progress strip; rail visuals `spine-nav.node-strip-size` with `target.min` 44px hit areas; carriage hidden; collapse note hidden (compression still applies, note becomes a count chip in the strip); nodes tappable; status words persist in strip labels, counts hide (`spine-nav.label-sub` off) | Prose stays `trace-ticket.prose` body size (never shrunk); gutters 12px; ticket heads roll up status (pill + rollup line, durations hidden `trace-ticket.tool-duration` off); tool rows keep status glyph + word, hide durations; numerals use `trace-ticket.numeral-strip`; cite lines wrap without h-scroll | Drawer (same as <=820px) | Drawer (same as <=1180px), full-width sheet minus 12px gutters | Sticky-bottom (`composer.sticky-rule`); send + textarea + one mode row visible; follow-ups one internal-scroll row; hint (`composer.hint`) shortens to one line |

## 2. What interpolates vs. what snaps

- Interpolate: page gutters (26px desktop → 12px strip), ticket padding within `trace-ticket.card-padding`, prose measure capped at `trace-ticket.prose-measure` (70ch) then fluid.
- Snap at the breakpoint: docked ↔ drawer, rail ↔ strip, in-flow ↔ sticky composer, meta ↔ footnotes, full head ↔ rollup head. Never animate structure across the breakpoint; content reflows instantly, motion covers only state (pulse/settle/echo/snap) per the Motion section of the design draft.

## 3. Invariants (hold at every breakpoint)

- **I-1 No page h-scroll.** Nothing overflows the viewport: mono targets/commands (`trace-ticket.tool-target`, `evidence-wing.cite-line`, `table.target-text`) wrap or truncate with ellipsis inside their row; drawers are viewport-width minus gutters; the follow-up row scrolls internally, never the page.
- **I-2 Keep-status/hide-duration.** Status (color + glyph + word via `trace-ticket.tool-status-*`, pill `pill-*-ink/bg/border`, `table.status-ok/run/bad`, `spine-nav.node-ok/run/bad/idle`) is never hidden. Duration (`trace-ticket.tool-duration`, spine durations) hides first at <=1180px (spine only) and everywhere else at <=480px.
- **I-3 Sticky composer.** At <=820px and <=480px the composer (`composer.bg/border`, `composer.sticky-rule`) stays pinned to the viewport bottom and never scrolls away; the ticket stack scrolls beneath it with bottom padding equal to composer height so the last ticket is never obscured.
- **I-4 Spine compression.** At 20+ assistant turns, completed runs compress to counted groups (`spine-nav.collapse-note-bg/text`) at every breakpoint; failures and the current job stay individually addressable; jump-to-failure appears whenever any unretried failure exists. At <=480px the collapse note becomes a count chip inside the strip (same action, smaller visual).
- **I-5 One elevation.** `trace-ticket.elevation-active` on exactly one ticket per viewport at every width; drawers (`dialog.sheet-bg`) never confer elevation on background tickets.
- **I-6 Tethered evidence.** The wing/drawer always names its ticket: docked header (`evidence-wing.cite-kicker` + `cite-line` + `cite-scope`), drawer tether (`dialog.label`), footnote (`evidence-wing.footnote-text`). An untethered evidence view is a defect.
- **I-7 Reachable composer.** Send (`button.primary-bg/text`, `composer.send-bg/text`), textarea (`field.input-bg/text`), modes (`composer.mode-min-height`), and follow-ups (`composer.followup-min-height`) meet 44px targets at every width.

## 4. Spine compression rule (exact)

- Threshold: 20 assistant turns. Below 20, all nodes render individually.
- At 20+: consecutive `succeeded` runs compress to one group node showing the count (e.g. `Turns 03–11 · 9 done`); `running`, `failed`, and the current (latest) turn never compress; user ticks inside a compressed range compress with it.
- Controls: the collapse note (or strip count chip at <=480px) is a button toggling full expansion; `jump-to-failure` is a button appearing iff >=1 failure is unretried/undismissed, jumping to and selecting the first such failure.
- Tokens: group visuals `spine-nav.collapse-note-bg/text`; nodes `spine-nav.node-ok/run/bad/idle`; selection ring `spine-nav.node-selected-ring`; strip visuals `spine-nav.node-strip-size` with `target.min` hits.
- Announcement: polite `Turns 3 to 11 grouped. 2 failures still listed. Jump to failure available.` Expanding announces `Full turn list shown.`

## 5. Z-order (exact, all breakpoints)

Bottom to top: page grounds (`surface.base/wing/ticket`) < strip-spine (sticky top, <=480px) < drawer scrims (`dialog.scrim`) < drawer sheets (`dialog.sheet-bg`; right attachment sheet above left sessions sheet when both open) < dismiss-with-reason sheet (topmost) < sticky composer (`composer.bg/border` above sheets only in the sense that it remains visible and operable when no sheet covers it; an open sheet covers the composer and traps focus, so the composer is unreachable until the sheet closes) < live regions (visually hidden, always present) < visible focus rings (`focus.ring`, topmost paint).

Focus follows z-order: opening any sheet moves focus into it, traps it, and on close returns focus to the opener. Only one sheet traps at a time; Esc closes the topmost sheet only.

## 6. Drawer tether labels with cite-back (exact strings)

- Right attachment sheet: tether `dialog.label` = `DRAWER — ATTACHMENT SHEET (tethered to Turn NN)`; sheet header cite `evidence-wing.cite-line` = `Turn NN / Kind target` plus scope `evidence-wing.cite-scope` (e.g. `Session checkout-flow · Browser`). NN is the zero-padded selected turn number; Kind is the selected tool kind (or `Summary` when the ticket has no tools / empty-trace).
- Left sessions drawer: tether = `DRAWER — SESSIONS (project GroupName)`; lists session items with `sidebar.meta` counts; active item carries `sidebar.item-active-edge`.
- Dismiss-with-reason sheet: title = `Dismiss Turn NN with reason`; reason is a required radio group (obsolete / duplicate / wont-fix) plus optional note; confirming announces politely and returns focus to the ticket.
- Cite lines use `trace-ticket.cite-line` (mono) in wells and `evidence-wing.cite-line` (mono) in wing/sheets/footnotes; long targets wrap, never cause h-scroll.

## 7. Footnote translation (<=820px, exact)

When the right wing undocks, wing meta does not vanish: below the ticket stack (above the sticky composer offset) render footnotes in `evidence-wing.footnote-text` — one footnote per cited view of the selected ticket (browser URL, file change dots `table.change-marker`, GitHub ref). Each footnote cites back (`Turn 07 / Bash npm test — excerpt lines 12–18`). Footnotes are static text plus links, never interactive tabs; full interaction lives in the drawer sheet.

## 8. Builder checklist per breakpoint

- 1440: prove three panes + spine docked, composer in-flow, full heads, carriage visible, no h-scroll.
- <=1180: prove evidence drawer opens tethered with cite line, spine durations hidden but statuses kept, left wing still docked, Esc + focus return work.
- <=820: prove left drawer, sticky composer (`composer.sticky-rule`), footnotes (`evidence-wing.footnote-text`), right-over-left stacking, no h-scroll.
- <=480–375: prove strip-spine (carriage hidden, `node-strip-size` visuals + `target.min` hits), rollup heads, durations hidden everywhere, prose unshrunk, drawers full-width-minus-gutters, sticky composer, no h-scroll.
- All: prove 20+ turn compression + jump-to-failure, keep-status everywhere, one elevation, tethered evidence, 44px targets, visible focus, reduced-motion equivalents.
