# Surface Brief — Work-Order-Rail Chat Surface

Run: `create-20260906-issue20-chat` | Phase: `surface-architecture` | Status: `proposed` | Producer: `product-strategist` | Date: 2026-09-06 | Language: EN-US
Selected Direction: `direction-work-order` (spine-and-tickets workbench). Specimen markup is visual reference only and is NOT ported.

Token citations name component tokens from `context/tokens.component.json` (e.g. `trace-ticket.bg`, `spine-nav.rail`, `composer.sticky-rule`). Semantic values behind them live in the token files and are never redefined here.

---

## 1. Focal outcome

The focal outcome is the **current assistant answer with its tool trace**: the numbered work-order ticket for the latest assistant turn — head (numeral + title + status pill), prose, and the ruled tool rows that prove the work — plus the cite-back mirror in the evidence wing. Everything else (session switching, composer, drawers, footnotes) serves reaching, reading, or verifying that ticket.

Resume rule: opening or resuming a session lands selection on the latest unfinished job (running turn, else first unretried failure, else latest turn), with the spine carriage (`spine-nav.carriage-bg/text/label`) marking the viewport. The wing header cites that ticket (`evidence-wing.cite-line` `Turn NN / Kind target`) so evidence never detaches.

## 2. Primary actions

| Action | Definition | Entry points | Key tokens |
|---|---|---|---|
| Send | Dispatch textarea content as a user echo; optimistic echo docks within `composer.echo-ceiling` (300ms ceiling), then a running ticket starts | Composer send button (`button.primary-bg/text`, `composer.send-bg/text`, `button.min-height` 44px), Cmd/Ctrl+Enter | `composer.bg/border`, `field.input-bg/text`, `button.focus-ring` |
| Follow-up pick | Send a suggested next action without typing; strip collapses after use per turn; used labels never re-offered | Composer follow-up buttons (`composer.followup-bg/border/min-height` 44px), mirrored on latest ticket only | `composer.followup-*`, `field.min-target` |
| Mode toggle | Flip exactly one active composer mode; affects the stub behavior label only (e.g. honest staged text names the mode); never clears the draft | Composer toggle group (`composer.mode-off-bg/border`, `composer.mode-on-bg/text`, `composer.mode-min-height` 44px) | `composer.header-label/hint`, `trace-ticket.staged-honest` |
| Session switch | Atomically re-scope spine + center + wing + composer draft/mode/follow-ups to the new `Session.id`; focus moves to the stack heading | Left wing items (`sidebar.item-bg/border`, `sidebar.item-active-edge`, `sidebar.item-min-height`), sessions drawer <=820px | `sidebar.*`, `spine-nav.label-bg` |

## 3. Secondary actions

| Action | Definition | Entry points | Key tokens |
|---|---|---|---|
| Project switch | Collapse/expand project groups in the left wing; the active session auto-expands its group | Project group buttons (`sidebar.heading`, `sidebar.meta` counts) | `sidebar.section-gap`, `table.row-min-height` |
| Wing-view switch | Change Browser / Files / GitHub panel for the selected ticket; never changes ticket selection | Wing tablist (`evidence-wing.tab-bg/text`, `tab-active-edge`, `tab-min-height` 44px) with full tab semantics | `evidence-wing.panel-bg/border/url` |
| Tool expand | Open the inset well for one tool row (at most one open per ticket) with cite line `Turn NN / Kind target` | Row chevron (`trace-ticket.disclosure-size` 44px, `aria-expanded`) | `trace-ticket.bg-well/cite-line`, `diff-*`, `errorbox-*`, `staged-*` |
| Retry / dismiss | Retry a failed turn keeping attempt history (`Retry Turn NN (attempt K)`); dismiss requires a reason (obsolete / duplicate / wont-fix) and persists the red node until resolved | Failed ticket footer (`button.danger-text/border/bg`, `button.secondary-*`), dismiss sheet (`dialog.sheet-bg/border`) | `trace-ticket.edge-failed`, `errorbox-*`, `spine-nav.node-bad` |

No other actions exist. No dead buttons: every rendered control resolves to one of the eight actions above or to drawer open/close.

## 4. Information tiers

- **T1 — Conversation + composer.** Ticket stack (heads `trace-ticket.title/subline/numeral`, prose `trace-ticket.prose` at `trace-ticket.prose-measure`) plus composer (`composer.bg/border`). Always visible at every breakpoint; the reading path stays calm while the workbench stays dense around it.
- **T2 — Session switcher + tool summaries.** Left wing items (`sidebar.item-bg/meta`) plus per-ticket tool rows (kind `trace-ticket.tool-kind-*`, target `trace-ticket.tool-target`, status `trace-ticket.tool-status-*`). Summaries are always visible; detail is never in T2.
- **T3 — Tool detail + wing content.** Wells (`trace-ticket.bg-well`, `diff-*`, `errorbox-*`, `staged-*`) plus wing panels (`evidence-wing.panel-bg/border`, `table.*`). Reached only by explicit expand / tab / drawer actions; T3 never overlays T1 uninvited (no toasts, no auto-dismiss, no scroll yank).

Tier precedence: T1 wins every conflict (space, focus, announcement). T2 stays glanceable. T3 is opt-in per ticket/view.

## 5. Progressive disclosure rules

1. Tool summary → expanded detail: every tool row shows kind + target + status + duration; detail opens only via the 44px chevron into an inset well in the same ticket; at most one well open per ticket (`trace-ticket.bg-well`, `trace-ticket.cite-line`).
2. Ticket → wing mirror: selecting a ticket (including spine scrub) re-cites the wing header (`evidence-wing.cite-kicker/cite-line/cite-scope`); switching wing tabs never re-cites.
3. Follow-ups collapse after use per turn; modes persist; session groups persist collapsed except the active session auto-expands.
4. Empty/error placeholders replace content in place (dashed `trace-ticket.empty-trace-border`, `evidence-wing.empty-border`), never overlay it.
5. Narrow widths hide duration first and status never (keep-status/hide-duration): `trace-ticket.tool-duration` off and `spine-nav.label-sub` counts off at <=480px; status glyph + word always on.
6. 20+ turns compress completed runs to counted groups (`spine-nav.collapse-note-bg/text`) while failures + current job stay addressable with jump-to-failure.

## 6. Required states (summary; binding rows in the State Matrix)

Conversation: populated, empty (no messages), streaming/running, failed. Tool trace: queued, running, staged, succeeded, failed, no-tools (empty-trace box), expanded well. Spine: idle, running, ok, bad, selected, compressed (20+). Composer: idle, focused, sending, echo-docked, modes, follow-ups pre-use and post-use. Left wing: populated, empty project, no sessions at all, switching. Right wing: Browser / Files / GitHub each populated, empty, and error. Drawers/sheets: sessions drawer, attachment sheet, dismiss-with-reason, all-closed. Global: reduced-motion equivalents for every animated state; offline stub behavior (zero network, <300ms perceived send, deterministic retry). Each state names its trigger, rendering, enabled actions, live-region announcement, and token refs in the State Matrix — the builder implements exactly those rows.

## 7. Responsive transformations (summary; binding contract in the Responsive Model)

| Breakpoint | Transformation |
|---|---|
| 1440px | Docked workbench: left wing + spine rail + center measure + right wing; composer in-flow; full heads; carriage visible |
| <=1180px | Evidence wing becomes a tethered drawer sheet (`dialog.sheet-bg/border`, `dialog.label` tether, cite-back header); spine keeps labels, hides durations |
| <=820px | Left wing becomes a drawer; composer sticky-bottom (`composer.sticky-rule`); wing meta translates to footnotes (`evidence-wing.footnote-text`) |
| <=480px–375px | Spine becomes a sticky top strip (`spine-nav.node-strip-size` visuals, `target.min` hits, carriage hidden); ticket heads roll up status and hide durations; drawers stack full-width-minus-gutters; prose unshrunk; no h-scroll |

Invariants: no page h-scroll at any width; keep-status/hide-duration; sticky composer <=820px; spine compression with jump-to-failure; z-order strip < drawers < composer (sheets cover composer while open); every drawer tethered with cite-back (`Turn NN / Kind target`).

## 8. Composition snapshot (what the builder lays out)

Left resume wing (`sidebar.session-bg`) + spine rail (`spine-nav.rail`, 92px column desktop) + center ticket column (`surface.base` ground, `trace-ticket.*` cards, `gap.content-measure` prose) + right evidence wing (`evidence-wing.bg`) + end-of-stack composer (`composer.bg/border`). One spine per session, one node per assistant turn, user turns as slim ticks. Exactly one elevated ticket per viewport (`trace-ticket.elevation-active` + `trace-ticket.edge-active`); tool rows hairline-ruled (`trace-ticket.tool-row-border`), never cards; wells inset (`surface.well` via `trace-ticket.bg-well`).

## 9. Binding contracts (detail in the Information Architecture)

- Landmarks: banner / navigation (spine) / main (stack + composer) / complementary (both wings) / form (composer); wing views use tablist semantics.
- Keyboard: everything reachable and operable; arrows on rail and tabs; focus trap in drawers; Esc closes topmost sheet; focus returns to opener.
- Live regions: polite `status` for progress/scope/tabs/disclosure; assertive `alert` for failures; step text (`Step N of M`), never per-token announcements; no toasts.
- Targets: 44px minimum on send, modes, follow-ups, chevrons, tabs, session items, strip nodes (`button.min-height`, `field.min-target`, `composer.mode-min-height/followup-min-height`, `trace-ticket.disclosure-size`, `evidence-wing.tab-min-height`, `sidebar.item-min-height`, `table.row-min-height`). Visible 3px focus ring (`focus.ring`) everywhere.
- Status always color + glyph + word (`status.*` pairs); kind chips neutral; AA contrast; grayscale-safe rail.

## 10. Token citation index

Structure: `trace-ticket.bg/border/bg-well/edge-idle/edge-running/edge-active/edge-failed/elevation-active/elevation-rest/card-padding/stack-gap`, `spine-nav.rail/node-size/node-strip-size/node-ok/run/bad/idle/node-selected-ring/carriage-bg/text/label/collapse-note-bg/text/pulse`, `sidebar.session-bg/evidence-bg/border/padding/section-gap/heading/item-bg/border/active-edge/min-height/meta`, `evidence-wing.bg/cite-kicker/cite-line/cite-scope/tab-bg/text/active-edge/min-height/panel-bg/border/url/footnote-text/empty-border`, `composer.bg/border/header-label/mode-on/off-*/input-text/followup-*/hint/send-*/echo-ceiling/sticky-rule`, `dialog.sheet-bg/border/scrim/padding/title/body/label/motion-open/motion-reduced`, `button.*/field.*/table.*` per the State Matrix index. Any value in build that is neither a token nor a listed exception from the design draft is a defect.

## 11. Confidence and unresolved

Overall surface-brief confidence: **high** — focal outcome, actions, tiers, disclosure, states, and responsive rules all cite the brief, the selected direction with its approved carry-ins, and the canonized token grammar.

Unresolved: none. The builder has no open behavior question for any listed state or breakpoint; styling values are tokenized and belong to later roles.
