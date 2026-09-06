# Information Architecture — Work-Order-Rail Chat Surface

Run: `create-20260906-issue20-chat` | Phase: `surface-architecture` | Status: `proposed` | Producer: `product-strategist` | Date: 2026-09-06 | Language: EN-US
Selected Direction: `direction-work-order` (spine-and-tickets workbench). Specimen markup is visual reference only and is NOT ported.

Token citations name component tokens from `context/tokens.component.json`. Semantic primitives behind them (e.g. `{surface.well}`, `{status.bad-ink}`, `{target.min}`, `{focus.ring}`) are resolved by the token files, never redefined here.

---

## 1. Hierarchy (reading and build order)

The Surface is one scroll region (the center ticket stack) plus two session-scoped wings and one index rail. Build and tab order follow this hierarchy; visual placement per breakpoint is fixed in the Responsive Model.

```
workbench (main landmark, session scope = active Session.id)
├── left resume wing (complementary/nav landmark)
│   ├── project group(s): heading + session items
│   └── new-session control
├── spine rail (navigation landmark, aria-label "Session progress")
│   ├── node per assistant turn (chronological) + tick per user turn
│   ├── carriage marker (viewport position)
│   └── collapse note + jump-to-failure (at 20+ turns)
├── center ticket column (one article per assistant turn + slim user rows)
│   ├── ticket head: numeral + role + title + status pill + duration + edge bar
│   ├── user interleave row (slim, never a ticket)
│   ├── assistant prose (measure-limited)
│   ├── tool rows (ruled list: kind chip + target + status + duration + chevron)
│   ├── well (at most one open per ticket: diff / cmdout / excerpt / errorbox / staged)
│   ├── ticket footer actions (expand, cite in wing, retry/dismiss when failed)
│   └── composer (form landmark at stack end; sticky below 820px)
│       ├── mode toggles + session-scoped hint
│       ├── textarea + send
│       └── follow-ups (pre-use buttons; post-use collapsed)
└── right evidence wing (complementary landmark, session scope = active Session.id)
    ├── cite-back header: kicker + cite line + scope line
    ├── view tabs: Browser / Files / GitHub (tablist semantics)
    └── view panel: browser excerpt | file tree | GitHub summary (+ footnotes <=820px)
```

Ordering rules (no invention):

1. Exactly one spine per active session (`spine-nav.rail`). Exactly one node per assistant turn, chronological top-to-bottom. User turns are ticks on the rail, never nodes.
2. Exactly one ticket per assistant turn in the center column (`trace-ticket.bg`, `trace-ticket.border`, `trace-ticket.card-padding`, `trace-ticket.stack-gap`). User messages are slim interleave rows between tickets, never tickets.
3. Ticket internal order is fixed: head (numeral `trace-ticket.numeral`, role `trace-ticket.role-label`, title `trace-ticket.title`, subline `trace-ticket.subline`, status pill, duration `trace-ticket.tool-duration`) → prose (`trace-ticket.prose`, measure `trace-ticket.prose-measure`) → tool rows (`trace-ticket.tool-row-border`, `trace-ticket.tool-row-min-height`) → well (`trace-ticket.bg-well`) → footer actions. No reordering.
4. Tool-row internal order is fixed: kind chip (`trace-ticket.tool-kind-bg/border/text`, neutral graphite, never status-tinted) → target (`trace-ticket.tool-target`, mono) → status glyph plus word (`trace-ticket.tool-status-ok/run/bad/idle`) → duration (`trace-ticket.tool-duration`, hidden <=480px) → disclosure chevron (`trace-ticket.disclosure-size`, 44px hit area).
5. CARD-SOUP GUARD: exactly one ticket per viewport carries elevation (`trace-ticket.elevation-active` plus `trace-ticket.edge-active`); all others use `trace-ticket.elevation-rest` with `trace-ticket.border`. Tool rows are never cards. The spine is never elevated (`spine-nav.rail` plain rule). The right wing is tethered by shared citation (`evidence-wing.cite-line`), never a floating panel.
6. State edge bars: ticket spine-side 5px edge is exactly one of `trace-ticket.edge-idle` / `edge-running` / `edge-active` / `edge-failed`. Session items echo selection with `sidebar.item-active-edge` (5px accent edge, never tint).

## 2. Entity map (per Product Brief section 5)

All entities are synthetic stub data (no network, no real secrets). Fixture strings live in one isolatable stub module.

| Entity | Fields | Where it renders | Token anchors |
|---|---|---|---|
| Project | `id, name, sessions[]` | Left wing groups (`sidebar.session-bg`, heading `sidebar.heading`, items `sidebar.item-bg/border/meta`) | `sidebar.*`, `table.*` for counts |
| Session | `id, projectId, title, updatedAt, messages[]` | Left wing item; scope owner of spine + center + right wing; composer draft is stored per session | `sidebar.item-bg`, `sidebar.item-active-edge`, `spine-nav.label-bg/text` |
| Message | `id, role: user \| assistant \| tool, body, toolCalls?, followUps?, createdAt` | User interleave row (slim) or ticket prose (`trace-ticket.prose`); tool-role content renders only inside wells, never as free prose | `trace-ticket.prose`, `trace-ticket.prose-measure`, `field.hint` for stub labels |
| ToolCall | `id, kind: Write \| Read \| Edit \| Bash \| WebSearch, status: queued \| running \| staged \| succeeded \| failed, summary, detail, durationMs?` | Tool row (summary always visible) + well (detail on expansion); kind chips neutral, status carries color+glyph+word | `trace-ticket.tool-kind-*`, `tool-status-*`, `tool-row-border`, `tool-duration`, `cite-line`, `diff-*`, `errorbox-*`, `staged-*` |
| FollowUp | `id, label` | Composer follow-up strip pre-use; collapsed post-use; also mirrored on latest ticket only | `composer.followup-bg/border/min-height`, `field.min-target` |
| Mode | `id, label, active` | Composer mode toggles; exactly one active at a time; affects stub behavior label only (no backend) | `composer.mode-off-bg/border`, `composer.mode-on-bg/text`, `composer.mode-min-height`, `composer.header-label` |
| BrowserView | `url, title, excerpt` | Right wing Browser tab panel; static mock, never live fetch; excerpt cites back to its ticket | `evidence-wing.panel-bg/border/url`, `evidence-wing.cite-line`, `evidence-wing.cite-kicker/scope` |
| FileNode | `path, kind: file \| dir, children?` | Right wing Files tab as ruled tree rows; edited/added markers via change dots | `table.row-min-height/border`, `table.target-text`, `table.change-marker`, `evidence-wing.panel-*` |
| GitHubView | `repo, ref, summary` | Right wing GitHub tab as summary rows; static mock, nominative labels only, no logos | `table.row-min-height/border`, `evidence-wing.panel-*`, `evidence-wing.empty-border` for empty |

Contract rules:

- Sessions belong to exactly one project; switching sessions switches spine + center + right-wing scope together (atomic scope switch, never partial).
- Every assistant turn claiming work MUST carry >=1 tool row or an explicit empty-trace box (`trace-ticket.empty-trace-border` dashed, `trace-ticket.empty-trace-text`); prose alone never stands in for work.
- Fixtures MUST cover: populated session, empty session list, empty message list, streaming/running tool state, tool failure state, sidebar-view empty states.
- Fixture content is synthetic (invented paths, commands, repos, URLs).

## 3. Navigation model

Three navigators, one authority each; the spine is the only session index.

| Navigator | Controls | Behavior | Tokens |
|---|---|---|---|
| Spine scrub | Nodes (buttons), ticks (non-focusable markers, exposed as list text), collapse note, jump-to-failure | Click, Enter/Space, or ArrowUp/Down when rail focused moves viewport to the ticket, sets selection (one `lift.active` ticket), mirrors cite-back in wing header; cross-highlight ticket + node + wing header uses instant snap (no smooth-scroll yank under reduced motion) | `spine-nav.node-size`, `node-ok/run/bad/idle`, `node-selected-ring`, `carriage-bg/text/label`, `collapse-note-bg/text` |
| Session switch | Left wing items (buttons), project headings (group labels), new-session control | Atomic scope switch: center stack + spine + wing + composer draft/mode/follow-ups all re-scope to the new `Session.id`; wing header re-cites the newly selected ticket; focus moves to the ticket-stack heading; polite announcement states the new session title | `sidebar.item-bg/border`, `item-active-edge`, `item-min-height`, `meta`, `section-gap` |
| Wing tabs | Browser / Files / GitHub tablist | Full tab semantics (see section 5): ArrowLeft/Right/Home/End move between tabs, activation selects panel; tabs are per-session; switching tabs never changes ticket selection | `evidence-wing.tab-bg/text`, `tab-active-edge`, `tab-min-height`, `panel-bg/border` |
| Drawers | Left sessions drawer (<=820px), right attachment sheet (<=1180px), dismiss-with-reason sheet | Modal sheets over scrim (`dialog.scrim`); tether label (`dialog.label`) names the source; focus trap while open; Esc closes topmost only; focus returns to the opener; drawers stack right-over-left | `dialog.sheet-bg/border/padding/title/body/label`, `dialog.scrim`, `button.*`, `field.*` |

Additional navigation rules:

- Spine keyboard: rail is a `navigation` landmark; nodes are `button`s in DOM order; ArrowUp/Down/Home/End move between nodes; Enter/Space activates (scrolls + selects + mirrors wing).
- No auto-scroll yank: streaming content never steals viewport; a discreet new-content marker appears and the spine carriage advances; the user opts into following.
- New-session control creates a deterministic empty stub session (empty message list state) and focuses the composer.
- Project switching is selection within the left wing (group collapse/expand), not a separate page: collapsing a project hides its session items behind an expandable group button.

## 4. Disclosure model

| Level | Closed rendering | Open rendering | Rule |
|---|---|---|---|
| Tool row → well | Summary row only (kind + target + status + duration + chevron) | Inset well (`trace-ticket.bg-well`) inside the same ticket with cite line (`trace-ticket.cite-line` `Turn NN / Kind target`), body (diff `diff-add-bg/ink/del-bg/ink/ctx-ink`, cmdout dark block, excerpt, errorbox `errorbox-bg/border/title`, or staged progress `staged-bg/border/title/bar-track/fill` + honest label `staged-honest`), and footer actions | At most ONE well open per ticket; opening a second well in the same ticket closes the first; wells in different tickets are independent; chevron hit area `trace-ticket.disclosure-size` (44px); `aria-expanded` on the chevron button |
| Ticket → wing mirror | Wing shows currently selected ticket | Wing header re-cites (`evidence-wing.cite-kicker` + `cite-line` + `cite-scope`) on every selection change including scrub, tab switch never re-cites | Wing never shows a ticket other than the selected one; at <=1180px the drawer sheet repeats the same cite line as its tether |
| Follow-ups | Button strip (`composer.followup-bg/border/min-height`) under the textarea | On pick: the label becomes the user echo, strip collapses for that turn, next-turn suggestions render with the new assistant ticket | Follow-ups collapse after use per turn; used labels are never re-offered in the same session |
| Modes | Toggle group with one active (`composer.mode-on-bg/text`) | Active mode label appears in the composer hint (`composer.hint`) and in staged honest text (e.g. `Working — step 2 of 4 in stub · Plan mode`) | Exactly one mode active; toggling never clears the draft |
| Session groups | Project heading + items | Collapsed group hides items behind a count button (`sidebar.meta`) | Group state persists per session-switch; collapsed groups still expose the active session (auto-expand on selection) |
| Spine compression (20+ turns) | Completed runs collapse to counted groups (`spine-nav.collapse-note-bg/text`) | Expand control restores full node list; failures + current job bypass compression always | Jump-to-failure jumps to first unretried failure and selects it |
| Keep-status/hide-duration (<=480px) | Durations hidden (`trace-ticket.tool-duration` off, `spine-nav.label-sub` counts off) | Status glyph + word always on (`tool-status-*`, pill inks, `spine-nav.label-text`) | Hide duration first; never hide status; ticket heads add a rollup line instead of dropping the pill |

Empty-trace rule: a ticket with zero tool calls renders the dashed empty-trace box (`trace-ticket.empty-trace-border/text`) stating no tools ran and citing nothing — it never renders an empty well and never cites the wing.

## 5. Live-region and keyboard contracts (binding)

Landmarks:

- `banner` (workbench title + session scope label), `navigation` (spine rail, aria-label `Session progress`), `main` (ticket stack + composer), `complementary` (left resume wing, right evidence wing each with accessible names), `form` (composer, aria-label `Message composer`), `tablist`/`tab`/`tabpanel` for Browser/Files/GitHub views.
- Exactly one `h1` (workbench + session title); ticket titles are `h2`s (`trace-ticket.title`); tool rows are list items with heading-free buttons.

Live regions:

- Polite `status` region: streaming start/progress/done, staged step text (`Step N of M`), session-switch confirmation, tab-switch confirmation, well expand/collapse confirmation. Assertive `alert` region: tool failure, send failure, drawer error states. Regions are visually hidden, never toasts, never auto-dismissed.
- Streaming announces step text, never every token: `Working — step 2 of 4 in stub`, then `Turn 07 done: 3 succeeded`. Failures announce `Turn 07 failed: Bash npm test exited 1. Retry available in the ticket.`
- No auto-scroll yank, no toast, no auto-dismiss anywhere (anti-defaults from the direction).

Keyboard:

- Everything operable by keyboard: composer, follow-ups, modes, session/project switching, wing tabs, tool chevrons, retry/dismiss, drawers, spine nodes, jump-to-failure. All are native `button`s, tabs, or links — no div-click handlers.
- Tab semantics: `tablist` with `aria-selected`, `aria-controls`; ArrowLeft/Right/Home/End between tabs; Tab enters the panel; `tabpanel` labelled by its tab.
- Drawers trap focus while open (`dialog.motion-reduced` behavior: focus moves to sheet heading, trap holds, Esc closes topmost, focus returns to opener). Sheets stack: dismiss-with-reason over attachment sheet over page. Esc closes exactly one layer per press.
- Visible focus: 3px ring (`button.focus-ring`, `field.focus-ring`, `spine-nav.node-selected-ring`) on every interactive element; focus never hidden; `:focus-visible` minimum.
- Targets: 44px minimum on composer send, mode toggles (`composer.mode-min-height`), follow-ups (`composer.followup-min-height`), chevrons (`trace-ticket.disclosure-size`), tabs (`evidence-wing.tab-min-height`), session items (`sidebar.item-min-height`), spine strip nodes (`target.min` hit areas with `spine-nav.node-strip-size` visuals), all buttons (`button.min-height`, `field.min-target`). Table/tree rows meet `table.row-min-height`.
- Contrast: text and status meet AA; status is always color plus glyph plus word (`status.ok/warn/bad-ink` on `ok/warn/bad-bg` with borders), so the rail survives grayscale. Kind chips stay neutral (`trace-ticket.tool-kind-bg/border/text`) — hue means status or diff only.

## 6. Confidence and unresolved

Overall IA confidence: **high** — hierarchy, entities, and contracts derive directly from the brief, the selected direction, and the carry-ins recorded in the tournament report.

Unresolved: none. Open styling (typeface, palette values, motion curves) belongs to later roles and is already tokenized; no product question blocks the builder.
