# State Matrix — Work-Order-Rail Chat Surface

Run: `create-20260906-issue20-chat` | Phase: `surface-architecture` | Status: `proposed` | Producer: `product-strategist` | Date: 2026-09-06 | Language: EN-US

How to read: each row is a binding build contract. Columns: **Trigger** (what puts the Surface here) → **Rendering** (exact visible structure + tokens) → **Actions available** (nothing else is enabled) → **Live-region announcement** (polite `status` unless marked assertive `alert`) → **Token refs**. A builder implements every row; no row may be invented around or left as a dead control. Reduced-motion and offline rows apply globally.

Conventions: status is always color + glyph + word (never hue alone). Kind chips are neutral graphite (hue means status or diff only). 44px minimum targets throughout. Focus ring 3px (`focus.ring`) always visible on keyboard focus. No toasts, no auto-dismiss, no auto-scroll yank anywhere.

---

## A. Conversation (center ticket stack)

| State | Trigger | Rendering | Actions available | Announcement | Token refs |
|---|---|---|---|---|---|
| A1 Populated | >=1 turn in active session | Tickets in order (`trace-ticket.bg/border/card-padding/stack-gap`); user interleave rows slim; one ticket carries `trace-ticket.elevation-active` + `trace-ticket.edge-active`; numerals `trace-ticket.numeral`, titles `trace-ticket.title`, sublines `trace-ticket.subline` | All primary/secondary actions | None on load; `Session TITLE loaded with N turns.` polite on session switch | `trace-ticket.*`, `spine-nav.*`, `sidebar.item-active-edge` |
| A2 Empty (no messages) | New/empty stub session | Empty-message panel in center: heading + one-line explanation + `Start with a suggestion` follow-up buttons + focused composer; spine shows zero nodes with idle rail; wings show empty states (see F/G) | Send, follow-up pick, mode toggle, session switch | Polite `Empty session. Composer ready. Two suggestions listed.` | `trace-ticket.empty-trace-border/text`, `composer.*`, `field.*`, `button.*` |
| A3 Streaming / running turn | Send dispatched, stub streaming | New ticket appended with running edge (`trace-ticket.edge-running`), pill `Running` (`pill-run-bg/ink/border`), prose skeleton lines + caret (never shimmer), staged progress block (`staged-bg/border/title/bar-track/fill`) with honest label `staged-honest` (`Working — step N of M in stub`); spine node pulses (`spine-nav.node-run`, `spine-nav.pulse`) | Interrupt turn; expand rows as they land; modes locked during run; send disabled until dock | Polite step text only: `Working — step N of M in stub.` then `Turn NN done: X succeeded.` Never per-token | `trace-ticket.edge-running`, `pill-run-*`, `staged-*`, `spine-nav.node-run/pulse`, `composer.echo-ceiling` |
| A4 Failed turn | Stub failure fixture or interrupted run | Ticket persists in place with `trace-ticket.edge-failed`, pill `Failed` (`pill-bad-bg/ink/border`), inline errorbox (`errorbox-bg/border/title`) with message + exited-code line; spine node `spine-nav.node-bad`; wing cites the failed ticket | Retry (attempt-keeping label `Retry Turn NN (attempt K)`), dismiss-with-reason, expand well, cite in wing | Assertive `Turn NN failed: KIND target exited CODE. Retry available in the ticket.` | `trace-ticket.edge-failed`, `pill-bad-*`, `errorbox-*`, `button.danger-text/border/bg`, `spine-nav.node-bad` |

## B. Tool trace (inside one ticket)

| State | Trigger | Rendering | Actions available | Announcement | Token refs |
|---|---|---|---|---|---|
| B1 Queued | Turn accepted, tool not started | Tool row with neutral kind chip (`tool-kind-bg/border/text`) + target (`tool-target` mono) + status `Queued` idle (`tool-status-idle`) + duration `—`; spine base entry | Expand (shows `Queued — detail lands when the step starts.`), interrupt | None (covered by A3 start) | `trace-ticket.tool-kind-*`, `tool-status-idle`, `tool-row-border/min-height` |
| B2 Running | Step started | Row status `Running` (`tool-status-run`) + amber pulse on spine node; staged block with honest label; duration ticks (`tool-duration`) except <=480px | Interrupt, expand | Polite `KIND target started.` (once per step, not per tick) | `tool-status-run`, `staged-*`, `tool-duration`, `spine-nav.pulse` |
| B3 Staged (determinate-feeling stub) | Multi-step stub fixture | Progress bar (`staged-bar-track/fill`) + step text `Step N of M` + honest stub suffix (`staged-honest`); never claims real progress | Interrupt, expand | Polite step text `Step N of M` | `staged-bg/border/title/bar-track/fill/honest` |
| B4 Succeeded | Step exit 0 | Status `Done` (`tool-status-ok`) + duration shown (hidden <=480px); row collapsible to well with diff/cmdout/excerpt | Expand well, cite in wing | Polite on turn completion only (not per row): `Turn NN done: X succeeded.` | `tool-status-ok`, `tool-duration`, `diff-add-bg/ink/del-bg/ink/ctx-ink`, `cite-line` |
| B5 Failed | Step exit non-zero | Status `Failed` (`tool-status-bad`) + errorbox in well with message; retry/dismiss in ticket footer | Retry, dismiss-with-reason, expand, cite | Assertive per A4 | `tool-status-bad`, `errorbox-*`, `button.danger-*` |
| B6 No-tools (empty trace) | Assistant turn with zero tool calls | Dashed box (`empty-trace-border/text`): `No tools ran this turn. Nothing to cite.` No well, no cite action | None for trace (composer + navigation remain) | Polite `Turn NN has no tool activity.` | `empty-trace-border/text` |
| B7 Expanded well | Chevron activated | Inset well (`bg-well`) with cite line (`cite-line` `Turn NN / Kind target`) + body + footer; at most one open per ticket; chevron `aria-expanded=true`, hit `disclosure-size` 44px | Collapse, copy target, cite in wing, retry (if failed) | Polite `Detail for KIND target shown. Cites Turn NN.` / `Detail hidden.` | `bg-well`, `cite-line`, `disclosure-size`, `diff-*`, `errorbox-*`, `staged-*` |

## C. Spine

| State | Trigger | Rendering | Actions available | Announcement | Token refs |
|---|---|---|---|---|---|
| C1 Idle (no run) | Session loaded, nothing running | Neutral rail (`spine-nav.rail`), nodes `node-ok/idle`, labels `label-text` + sub `label-sub`; carriage at viewport (`carriage-bg/text/label`) except <=480px | Scrub (click/keys), jump-to-failure (if failures) | None | `spine-nav.rail/label-bg/text/sub`, `node-ok/idle`, `carriage-*` |
| C2 Running | Any step running | Running node `node-run` + pulse (`pulse`); carriage advances without yanking viewport | Interrupt, scrub | Polite step text (see A3) | `node-run`, `pulse` |
| C3 OK node | Turn all-succeeded | Green node `node-ok` + label status word `Done` | Scrub/select | None per node; turn completion polite | `node-ok` |
| C4 Bad node | Turn has unretried failure | Red node `node-bad` + count badge until retried/dismissed; persists across session switches | Scrub/select, retry (in ticket), jump-to-failure | Assertive on creation (see A4) | `node-bad` |
| C5 Selected | Node/ticket selected | Ring `node-selected-ring` + ticket `elevation-active` + `edge-active` + wing re-cite; exactly one selected | All ticket actions | Polite `Turn NN selected. KIND target cited.` | `node-selected-ring`, `elevation-active`, `edge-active`, `evidence-wing.cite-line` |
| C6 Compressed (20+ turns) | Threshold reached | Completed runs grouped to count nodes (`collapse-note-bg/text`); failures + current bypass; note/chip button + jump-to-failure button | Expand full list, jump-to-failure | Polite `Turns A to B grouped. F failures still listed. Jump to failure available.` | `collapse-note-bg/text`, `node-strip-size`, `target.min` |

## D. Composer

| State | Trigger | Rendering | Actions available | Announcement | Token refs |
|---|---|---|---|---|---|
| D1 Idle | Ready, empty draft | Frame (`composer.bg/border`), textarea (`field.input-bg/text`, placeholder `field.placeholder`), send enabled iff non-empty, modes (`mode-off-bg/border`), hint (`composer.hint` + `field.hint`) | Type, toggle mode, pick follow-up, send when non-empty | None | `composer.bg/border/header-label/hint`, `field.*`, `button.*` |
| D2 Focused | Textarea focused | 3px ring (`field.focus-ring`), hint persists; send enables on first non-whitespace char | Type, send, toggles | None | `field.focus-ring`, `field.min-target` |
| D3 Sending | Send activated (<300ms) | Optimistic user echo row appended instantly; send disabled + spinner label `Sending`; modes/follow-ups locked | Interrupt (once run starts) | Polite `Message sent. Working — step 1 of M in stub.` | `composer.echo-ceiling`, `button.primary-bg/text`, `button.min-height` |
| D4 Echo docked | Stub acknowledges | Echo docks to its spine position (ticket adjacency); new running ticket follows; draft cleared for this session only after dock (draft preserved per session on switch, cleared on successful send) | Interrupt, expand-as-lands | See D3 (single announcement, no double) | `composer.echo-ceiling`, `trace-ticket.stack-gap` |
| D5 Modes | Toggle activated | Exactly one active (`mode-on-bg/text`); inactive `mode-off-bg/border`; hit `mode-min-height` 44px; active label mirrored in hint + staged honest text | Toggle (never clears draft) | Polite `MODE mode on.` | `mode-on/off-*`, `mode-min-height`, `header-label` |
| D6 Follow-ups pre-use | Assistant turn lands with suggestions | Button strip under textarea (`followup-bg/border/min-height` 44px); only latest turn offers them | Pick (sends as echo), dismiss strip | Polite `N suggestions listed.` | `followup-bg/border/min-height` |
| D7 Follow-ups post-use | Pick or new send | Strip collapses for that turn; used label never re-offered; next-turn suggestions render with new ticket | Send/type as normal | Polite `Suggestion sent.` | `followup-*` |

## E. Left wing (resume)

| State | Trigger | Rendering | Actions available | Announcement | Token refs |
|---|---|---|---|---|---|
| E1 Populated | Projects + sessions exist | Groups (`sidebar.session-bg/padding/section-gap`, headings `sidebar.heading`); items (`item-bg/border`, `item-min-height` 44px, meta `sidebar.meta`); active `sidebar.item-active-edge` | Switch session, collapse/expand project, new session | Polite `Session TITLE loaded with N turns.` on switch | `sidebar.*`, `table.row-min-height` |
| E2 Empty project | Project with zero sessions | Group with `No sessions yet.` line + inline `Start first session` button (same as new-session, scoped to project) | Start first session, switch project | Polite `Project NAME has no sessions yet.` | `sidebar.*`, `button.secondary-*` |
| E3 No sessions at all | Zero sessions everywhere | Wing shows `No sessions yet.` + `Start first session` + preserved project list if any; center shows A2; spine idle with zero nodes | Start first session | Polite `No sessions yet. Start your first session.` | `sidebar.*`, `button.primary-*` |
| E4 Switching | Session item activated | Atomic re-scope: center + spine + wing + composer draft/mode/follow-ups switch to new `Session.id`; focus moves to stack heading; wing re-cites | Cancel via second switch (no intermediate state persists) | Polite `Session TITLE loaded with N turns.` | `sidebar.item-active-edge`, `spine-nav.label-bg` |

Composer drafts and mode selection are stored per session and restored on switch; toggling mode or typing never leaks across sessions.

## F. Right wing tabs (per-session evidence)

Header in every sub-state: kicker (`cite-kicker` e.g. `ATTACHMENT`) + cite line (`cite-line` `Turn NN / Kind target`) + scope (`cite-scope` `Session TITLE · View`). An untethered panel is a defect.

| State | Trigger | Rendering | Actions available | Announcement | Token refs |
|---|---|---|---|---|---|
| F1 Browser populated | Browser mock has excerpt | Panel (`panel-bg/border`) with title + URL link (`panel-url`) + excerpt citing back (`Turn NN / Bash ... — excerpt lines A–B`) | Switch tabs, cite in ticket (selects source ticket), open drawer (narrow) | Polite `Browser view for Turn NN shown.` | `evidence-wing.*`, `table.*` |
| F2 Browser empty | No excerpt for ticket/session | Dashed frame (`empty-border`): `No browser excerpt for this turn.` + `Show ticket` recovery button | Show ticket (selects source), switch tabs | Polite `No browser excerpt for Turn NN.` | `empty-border`, `button.secondary-*` |
| F3 Browser error | Error fixture | Error panel with message + `Retry view` (re-runs stub fetch, honestly labelled) + `Show ticket` | Retry view, show ticket, switch tabs | Assertive `Browser view failed to load. Retry available.` | `empty-border`, `button.secondary-*`, `status.bad-ink` |
| F4 Files populated | Tree has nodes | Ruled tree rows (`table.row-min-height/border`, mono `table.target-text`, change dots `table.change-marker`, status `table.status-ok/run/bad`); dirs expandable (44px chevrons) | Expand dir, select file (cites ticket), switch tabs | Polite `Files for Turn NN shown: N changed.` | `table.*`, `evidence-wing.panel-*` |
| F5 Files empty | No files for ticket/session | Dashed frame: `No files cited this turn.` + `Show ticket` | Show ticket, switch tabs | Polite `No files for Turn NN.` | `empty-border` |
| F6 Files error | Error fixture | Error panel + `Retry view` + `Show ticket` | Retry view, show ticket | Assertive `Files view failed to load. Retry available.` | `empty-border`, `status.bad-ink` |
| F7 GitHub populated | Summary mock present | Summary rows (`table.row-min-height/border`): repo + ref + summary; nominative text only, no logos | Switch tabs, show ticket | Polite `GitHub summary for Turn NN shown.` | `table.*`, `evidence-wing.panel-*` |
| F8 GitHub empty | No summary | Dashed frame: `No GitHub activity cited this turn.` + `Show ticket` | Show ticket, switch tabs | Polite `No GitHub summary for Turn NN.` | `empty-border` |
| F9 GitHub error | Error fixture | Error panel + `Retry view` + `Show ticket` | Retry view, show ticket | Assertive `GitHub view failed to load. Retry available.` | `empty-border`, `status.bad-ink` |

Tab switching itself: `tab-bg/text` + active `tab-active-edge`, hits `tab-min-height` 44px; ArrowLeft/Right/Home/End move, activation selects; polite `VIEW view shown for Turn NN.` Footnotes (<=820px) mirror the selected ticket meta in `footnote-text` as static text, never tabs.

## G. Session switching, drawers, and sheets

| State | Trigger | Rendering | Actions available | Announcement | Token refs |
|---|---|---|---|---|---|
| G1 Session switching | Any switch | Atomic scope swap (see E4); drafts/modes/follow-ups re-scope; focus to stack heading; no partial scope ever | All actions in new scope | Polite `Session TITLE loaded with N turns.` | `sidebar.*`, `spine-nav.*`, `evidence-wing.cite-*` |
| G2 Left drawer open (<=820px) | Sessions button | Sheet (`dialog.sheet-bg/border/padding`, title `dialog.title`, body `dialog.body`, tether `dialog.label` `DRAWER — SESSIONS (project NAME)`) over scrim (`dialog.scrim`); focus to heading, trap holds | Switch, new session, close (button/Esc/scrim) | Polite `Sessions drawer open. N sessions listed.` | `dialog.*`, `sidebar.*`, `button.*` |
| G3 Attachment sheet open (<=1180px) | Ticket select / Cite action | Sheet tethered `DRAWER — ATTACHMENT SHEET (tethered to Turn NN)` with full cite header + tabs + panel; focus to heading, trap holds; right-over-left stacking | Tabs, retry view, show ticket, close | Polite `Attachment sheet for Turn NN open.` | `dialog.*`, `evidence-wing.*` |
| G4 Dismiss-with-reason open | Dismiss activated on failed ticket | Topmost sheet: `Dismiss Turn NN with reason`; required radios (obsolete / duplicate / wont-fix) + optional note; confirm disabled until reason chosen; `dialog.motion-reduced` instant under reduced motion | Confirm dismiss, cancel (Esc) | Polite `Turn NN dismissed: REASON.` Assertive if confirm without reason: `Choose a reason to dismiss.` | `dialog.*`, `button.danger-text/border/bg`, `field.*` |
| G5 All drawers closed | Esc / close / scrim | Focus returns to opener; scrim removed; composer reachability restored | All page actions | Polite `Sheet closed.` (only if focus return is ambiguous) | `dialog.scrim`, `button.focus-ring` |

Rules: Esc closes exactly one (topmost) layer per press. Scrim click closes the topmost sheet only. While any sheet is open the background (including sticky composer) is inert and untabbable. Focus returns to the opener on close. Sheets stack: dismiss > attachment > sessions.

## H. Reduced-motion equivalents (global, override any animated row above)

| Animated behavior | Reduced-motion equivalent (`feel.reduce` / `dialog.motion-reduced` / `spine-nav.pulse-reduced`) | Announcement change |
|---|---|---|
| Spine pulse (`spine-nav.pulse`) | Stepped icon swap (static amber node, no opacity animation) | Same step text, no change |
| Staged progress bar | Step text only (`Step N of M`), bar renders as static filled-to-N segments | Same |
| Composer echo (`composer.echo-ceiling`) | Instant dock, no slide | Same single announcement |
| Scrub cross-highlight | Instant select + scroll (no smooth scroll, no highlight fade) | Same |
| Settle green/red flash | Single static terminal color, no flash beyond one settle | Same |
| Drawer open (`dialog.motion-open`) | Instant appear; focus still moves to heading, trap + Esc unchanged | Same |
| Prose streaming | Caret-only append in chunks, never shimmer | Step text only, never per-token |

Honest stub labels (`staged-honest`, `field.hint`) persist under reduced motion; nothing is hidden to compensate.

## I. Offline stub behavior (global)

Zero network dependency after `npm install`: no CDN fonts (offline-safe numeral stack), no fetches, no live browser/GitHub/API calls. Every view above renders from local fixtures. The composer send path resolves through the stub in <300ms perceived (`composer.echo-ceiling`): optimistic echo → staged steps → docked ticket. `Retry view` re-runs the local stub deterministically (same fixture may succeed or fail per its script; repeated retry on a failure fixture keeps attempt history and increments the attempt label). Offline is not an error state — there is no offline banner because there is nothing to be offline from. A missing fixture module is a build defect, not a runtime state.

## J. Token reference index (all rows)

Tickets: `trace-ticket.bg/border/bg-well/edge-idle/edge-running/edge-active/edge-failed/elevation-active/elevation-rest/numeral/numeral-strip/role-label/title/subline/prose/prose-measure/card-padding/stack-gap`. Pills: `pill-ok/run/bad/idle-bg/ink/border`. Tool rows: `tool-row-border/min-height/kind-bg/border/text/target/status-ok/run/bad/idle/duration/disclosure-size/cite-line`. Detail: `diff-add-bg/ink/del-bg/ink/ctx-ink`, `errorbox-bg/border/title`, `staged-bg/border/title/bar-track/fill/honest`, `empty-trace-border/text`. Spine: `spine-nav.rail/label-bg/text/sub/node-size/node-strip-size/node-ok/run/bad/idle/node-selected-ring/carriage-bg/text/label/collapse-note-bg/text/pulse/pulse-reduced`. Composer: `composer.bg/border/header-label/mode-off-bg/border/mode-on-bg/text/mode-min-height/input-text/followup-bg/border/min-height/hint/send-bg/text/echo-ceiling/sticky-rule`. Wings: `sidebar.session-bg/evidence-bg/border/padding/section-gap/heading/item-bg/border/active-edge/min-height/meta`, `evidence-wing.bg/cite-kicker/cite-line/cite-scope/tab-active-edge/tab-bg/text/min-height/panel-bg/border/url/footnote-text/empty-border`. Dialogs/buttons/fields/tables: `dialog.sheet-bg/border/scrim/padding/title/body/label/motion-open/motion-reduced`, `button.primary-bg/text/border/secondary-bg/text/border/danger-text/border/bg/min-height/padding-x/y/text/focus-ring`, `field.input-bg/text/placeholder/border/padding/text/hint/min-target/focus-ring`, `table.row-min-height/border/target-text/status-ok/run/bad/change-marker/padding-x`.

---

Builder proof: fixtures MUST include a populated session, an empty session, a streaming run, a failed turn with retry + dismiss-with-reason, an empty-trace ticket, empty + error states for each wing tab, a 30-turn session proving compression + jump-to-failure, and strip-width (375px) plus reduced-motion passes. Every state above is reachable from fixtures with no dead controls.
