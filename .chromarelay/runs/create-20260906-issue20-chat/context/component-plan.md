# Component Plan — Work-Order-Rail Chat Surface

Run: `create-20260906-issue20-chat` | Phase: `component-plan` | Status: `proposed` | Producer: `component-architect` | Date: 2026-09-06 | Language: EN-US
Selected Direction: `direction-work-order`. Specimen markup is visual reference only and is NOT ported.

## 0. Inventory sweep (single sweep serving the whole Phase)

Swept once: Run `context/` (surface-brief, information-architecture, responsive-model, state-matrix, design-draft, tokens.component.json, tokens.semantic.json), `directions/selected-direction.md`, repo root `package.json`, `src/**`, `.chromarelay/project/**` (absent — greenfield Run).

- **Rung 1 — native HTML:** fully available (`main`, `nav`, `article`, `section`, `aside`, `button`, `textarea`, `form`, `ul`/`ol`/`li`, `a`, `span`, `p`, `h1`/`h2`, `progress`, `dialog`, `div[role=status/alert]`, `tablist` pattern via native buttons + ARIA). Preferred wherever honest.
- **Rungs 2–4 — project components / compositions / variants:** NONE. No canonical DESIGN.md registry exists in this Run; `src/` holds harness code only (workspace, design-manager, domain, evals, registry, cli — no UI components, no stories, no call sites). Nothing to reuse, compose, or extend. This is recorded, not invented.
- **Rung 5 — installed accessible primitives:** ABSENT. `package.json` dependencies = `ajv` only; no Radix/Headless/React-Aria or equivalent is installed. Tab semantics, dialog focus-trap, and disclosure keyboard behavior must therefore be specified by hand against native elements and flagged as audit load (see Risks). No primitive is claimed.
- **Rung 6 — creation:** justified per record below with rungs 1–5 rejections.

Consequence: every resolution in this plan is `native`, `create`, or `extend` (StripSpine as a variant of the newly-planned SpineNavigator). No `reuse`, `compose` (of pre-existing components), or `primitive` record appears; that absence is inventory truth, not an omission.

Conventions binding on all records: status is always color + glyph + word (never hue alone); kind chips stay neutral; 44px minimum targets; 3px `focus.ring` on keyboard focus; no toasts, no auto-dismiss, no auto-scroll yank; token citations are semantic role names only.

---

## 1. SpineNavigator — `create`

- **requirement:** Session index rail: one node per assistant turn (chronological) plus slim user ticks, carriage marker, collapse note + jump-to-failure at 20+ turns; scrub selects ticket and mirrors wing cite-back (Brief §8, IA §3, Matrix C1–C6).
- **resolution:** `create`
- **components involved:** new `SpineNavigator` wrapping native `nav` + native `button` nodes + native `button` collapse/jump controls. No registry id; no primitive (absent).
- **rejected alternatives:** rung 1 native `nav`+`button`s alone fails — static list cannot own compression grouping (failures + current bypass), carriage tracking without viewport yank, single-selection mirror, or step announcements; rung 2/3/4 no candidate in inventory (greenfield, sweep §0); rung 5 no installed primitive (package.json = ajv only).
- **token roles:** `spine.rail`, `text.primary`, `text.muted`, `status.ok-edge`, `status.warn-edge`, `status.bad-edge`, `surface.ticket` (idle node), `focus.ring` (selected ring), `spine.carriage-bg`, `spine.carriage-text`, `type.micro`, `type.meta`, `surface.wing`, `text.secondary` (collapse note), `feel.pulse`, `feel.reduce`, `feel.snap`, `target.node`, `target.min`, `gap.cluster`.
- **required states:** default, hover, focus, active, loading (domain: running), success (domain: ok/done), error (domain: bad/failure), empty (zero nodes — stub session), long content (20+ turns → compressed), overflow (label truncation, never page h-scroll), domain-specific: idle, running, ok, bad, selected, compressed.
- **responsive behavior:** 1440 docked full rail with labels + status words + counts + durations + carriage; ≤1180 labels + status words kept, spine durations hidden; ≤820 narrowed rail, labels kept, durations hidden, carriage visible; ≤480 variant owned by StripSpine record (strip visuals, carriage hidden, counts hidden, status words persist).
- **accessibility behavior:** role `navigation` with accessible name `Session progress`; nodes are native `button`s in DOM order named `Turn NN, STATUS, Title`; ticks are non-focusable markers exposed as list text; keyboard ArrowUp/Down/Home/End move between nodes, Enter/Space activates (scroll + select + mirror wing); focus visible 3px ring + selected ring exactly-one; announcements polite step text (`Working — step N of M in stub.`), turn-done, grouped/expanded; assertive only on failure creation.
- **owner and scope:** component-architect; covers spine column at all breakpoints, all Surfaces in this single-Surface Run.

## 2. WorkOrderTicket — `create`

- **requirement:** Numbered work-order ticket per assistant turn: head (numeral + role + title + subline + pill + duration + edge bar), prose, tool rows, at most one well, footer actions; exactly one elevated per viewport (Brief §8, IA §1, Matrix A1–A4).
- **resolution:** `create`
- **components involved:** new `WorkOrderTicket` (`article`) composing `StatusPill` (native), `ToolTraceRow` (create), `ExpandedWell` (create), `RetryDismissActions` (native buttons). No registry id; no primitive.
- **rejected alternatives:** rung 1 native `article`+`h2`+`span`s fails — cannot own edge-state machine (idle/running/active/failed), one-elevation discipline, one-well-open rule, attempt-keeping retry wiring, or streaming skeleton + caret; rungs 2–4 none in inventory; rung 5 absent.
- **token roles:** `surface.ticket`, `surface.well`, `border.rule`, `status.ok-edge`, `status.warn-edge`, `status.bad-edge`, `border.strong` (idle edge), `action.accent-edge` (active edge), `lift.active`, `lift.none`, `type.numeral`, `type.numeral-strip`, `type.header`, `type.meta`, `type.eyebrow`, `type.body`, `type.mono` (cite line), `type.duration`, `gap.card-padding`, `gap.stack`, `gap.content-measure`, `text.primary`, `text.secondary`, `text.muted`.
- **required states:** default, hover, focus, active, disabled (actions locked during run), loading (domain: streaming/running), empty (domain: no-tools → empty-trace box, not empty ticket), error (domain: failed + errorbox), success (domain: all-succeeded), long content (prose at measure, targets wrap), overflow (mono wraps/ellipsizes, I-1), domain-specific: populated, streaming, failed, selected, echo-docked adjacency.
- **responsive behavior:** 1440 full heads (pill + duration) and full prose measure; ≤1180 cite line doubles as drawer-opener label, structure unchanged; ≤820 full width, footnotes below stack; ≤480 rollup head (pill + rollup line, durations hidden), prose unshrunk at body size, gutters narrow, numerals switch to `type.numeral-strip`.
- **accessibility behavior:** role `article` (within `main`), title is `h2` named `Turn NN: Title`; edge/pill status exposed as text (color + glyph + word); footer controls are native buttons; focus order head → prose links (if any) → tool chevrons → well → footer; announcements via LiveRegion (turn-done polite, failure assertive); streaming announces step text only, never per-token.
- **owner and scope:** component-architect; center ticket column, all breakpoints.

## 3. ToolTraceRow — `create`

- **requirement:** Ruled tool summary row: kind chip + target + status glyph/word + duration + 44px chevron opening the well (IA §1 order fixed; Matrix B1–B5).
- **resolution:** `create`
- **components involved:** new `ToolTraceRow` (`li` + native `button` chevron + native `span` status). No registry id; no primitive.
- **rejected alternatives:** rung 1 native `details`/`summary` fails honestly — cannot enforce at-most-one-open-per-ticket, cite-line stamping, staged/errorbox variant bodies, or keep-status/hide-duration rule; bare `li`+`button` repeats status/duration/chevron wiring per row without a contract; rungs 2–4 none; rung 5 absent (no disclosure primitive installed).
- **token roles:** `border.hair`, `target.row`, `surface.ticket` (kind bg), `border.strong` (kind border), `text.primary` (kind text), `type.mono` (target), `status.ok-ink`, `status.warn-ink`, `status.bad-ink`, `text.muted` (idle), `type.duration`, `target.min` (chevron), `gap.cluster`, `focus.ring`.
- **required states:** default, hover, focus, active, disabled (chevron locked only while ticket sending <300ms), loading (domain: running/staged), success (domain: succeeded/Done), error (domain: failed), empty (not applicable — zero tools renders empty-trace box, never a row; see exclusion), long content (long targets wrap), overflow (truncate with ellipsis inside row, never page h-scroll), domain-specific: queued, running, staged, succeeded, failed, expanded/collapsed.
- **responsive behavior:** 1440 full row (status + duration); ≤1180 unchanged; ≤820 unchanged; ≤480 status glyph + word kept, durations hidden; chevron stays 44px at every width.
- **accessibility behavior:** row is `listitem`; chevron is `button` with `aria-expanded` and accessible name `Show detail for KIND target, Turn NN` / `Hide detail…`; status is text (`Done`/`Running`/`Failed`/`Queued` + glyph, never hue alone); keyboard Tab to chevron, Enter/Space toggles; announcements polite `Detail for KIND target shown. Cites Turn NN.` / `Detail hidden.`
- **owner and scope:** component-architect; inside WorkOrderTicket at all breakpoints.

## 4. ExpandedWell — `create`

- **requirement:** Inset detail well for the expanded row: cite line + variant body (diff / cmdout / excerpt / errorbox / staged) + footer (copy target, cite in wing, retry if failed); at most one open per ticket (Matrix B7).
- **resolution:** `create`
- **components involved:** new `ExpandedWell` (`section`) with variant bodies + `CiteBackStamp` (native) + native `button` footer. No registry id; no primitive.
- **rejected alternatives:** rung 1 native `details` content or plain `div` fails — cannot own variant switching (diff/cmdout/excerpt/errorbox/staged), cite-back stamping discipline, honest stub labels, or footer action wiring (copy/cite/retry) under one contract; rungs 2–4 none; rung 5 absent.
- **token roles:** `surface.well`, `type.mono` (cite line), `text.secondary` (scope), `diff.add-bg`, `diff.add-ink`, `diff.del-bg`, `diff.del-ink`, `diff.ctx-ink`, `surface.cmdout-bg` (cmdout block), `surface.cmdout-text`, `status.bad-bg`, `status.bad-border`, `status.bad-ink` (errorbox), `surface.ticket` (staged bg/track), `status.warn-border`, `status.warn-ink`, `status.warn-edge` (bar fill), `type.meta` (honest label), `gap.card-padding`, `gap.stack`, `border.hair`.
- **required states:** default, focus, active, loading (domain: staged progress), error (domain: errorbox), success (domain: diff/cmdout/excerpt of succeeded step), empty (excluded — well never renders for empty-trace; see state contracts), long content (diff/cmdout scroll internally, page never scrolls sideways), overflow (mono wraps/ellipsizes), domain-specific: diff, cmdout, excerpt, errorbox, staged, queued-placeholder (`Queued — detail lands when the step starts.`).
- **responsive behavior:** identical structure at 1440/≤1180/≤820; ≤480 mono bodies wrap, footer buttons stack full-width-minus-gutters, internal scroll for wide diff/cmdout (page h-scroll forbidden).
- **accessibility behavior:** role `region` (or `group`) labelled by its cite line `Turn NN / Kind target`; chevron controls `aria-controls` to well id; keyboard Tab through footer actions, Esc does NOT close well (Esc is drawer-only); announcements polite show/hide; errorbox content exposed as text, not alert (ticket-level assertive covers failure).
- **owner and scope:** component-architect; inside WorkOrderTicket, all breakpoints.

## 5. CiteBackStamp — `native`

- **requirement:** Tether header fragment (kicker + cite line + scope) shared by wells, wing header, drawer tethers, footnotes so evidence never detaches (Brief §8 invariant I-6, IA §4).
- **resolution:** `native`
- **components involved:** native `p` + native `span`s (kicker `ATTACHMENT`, mono cite `Turn NN / Kind target`, scope `Session TITLE · View`). No new component, no primitive.
- **rejected alternatives:** none — rung 1 satisfies; rungs 2–5 not considered per resolution order (first rung wins). No behavior beyond text stamping exists to justify a component.
- **token roles:** `type.eyebrow` (kicker), `type.mono` (cite line), `text.secondary` (scope), `text.muted` (tether label context), `type.label` (drawer tether), `gap.content-measure` (wrap width).
- **required states:** default, long content (long targets wrap), overflow (ellipsis inside row, never h-scroll). No hover/focus/loading/empty/error — static text.
- **responsive behavior:** wraps at every breakpoint; ≤1180 repeated as drawer-sheet tether + header; ≤820 mirrored into FootnoteBlock as static text; ≤480 counts hidden in strip but cite words persist.
- **accessibility behavior:** no role (plain text; part of parent's accessible name where needed); never focusable; announcement is the parent's (well shown / view shown / sheet open); long targets exposed in full via wrapping, never truncated away from AT.
- **owner and scope:** component-architect; cross-cutting fragment used by well, wing, drawers, footnotes.

## 6. StatusPill — `native`

- **requirement:** Ticket/head status word with color + glyph + word (Running / Done / Failed / Queued); survives grayscale and strip widths (Matrix A3–A4, IA §5).
- **resolution:** `native`
- **components involved:** native `span` (+ text glyph) with pill tokens. No new component, no primitive.
- **rejected alternatives:** none — rung 1 satisfies; rungs 2–5 not considered. A pill is presentational text; any component would be a prop pass-through (shallow interface, refused).
- **token roles:** `status.ok-bg`, `status.ok-ink`, `status.ok-border`, `status.warn-bg`, `status.warn-ink`, `status.warn-border`, `status.bad-bg`, `status.bad-ink`, `status.bad-border`, `text.secondary`, `text.muted` (idle), `type.meta` (pill text), `gap.inline`.
- **required states:** default; domain-specific: ok/done, running, bad/failed, idle/queued. No hover/focus/loading/empty/error — non-interactive.
- **responsive behavior:** never hidden at any breakpoint (keep-status invariant); ≤480 persists in rollup head while duration hides.
- **accessibility behavior:** no role (text within ticket heading context); name is its word (`Running`); never focusable; announced via parent ticket/step text, never independently.
- **owner and scope:** component-architect; ticket heads, spine labels, table statuses, all breakpoints.

## 7. SessionSidebar (left resume wing) — `create`

- **requirement:** Project groups + session items + new-session control; atomic scope switch (center + spine + wing + composer draft/mode/follow-ups) with focus to stack heading (Brief §2, Matrix E1–E4).
- **resolution:** `create`
- **components involved:** new `SessionSidebar` (`nav`/`complementary` landmark + native `button` groups/items). No registry id; no primitive.
- **rejected alternatives:** rung 1 native `ul`+`button`s fails — cannot own atomic re-scope (draft/mode/follow-up restore per session), collapsed-group persistence with active auto-expand, or switch announcements; rungs 2–4 none; rung 5 absent (no tree primitive installed).
- **token roles:** `surface.wing`, `surface.ticket` (item bg), `border.rule`, `action.accent-edge` (active edge), `type.eyebrow` (headings), `type.meta` (meta/counts), `target.row`, `gap.card-padding`, `gap.section-gap`, `text.primary`, `text.secondary`, `focus.ring`.
- **required states:** default, hover, focus, active, disabled (switch locked mid-send <300ms), empty (domain: empty project / no sessions at all), loading (excluded — local fixtures, no fetch; switching is instant atomic swap), error (excluded — no fetch to fail; missing fixture is build defect per Matrix §I), long content (long titles wrap), overflow (meta truncates), domain-specific: populated, empty-project, no-sessions, switching, collapsed-group.
- **responsive behavior:** 1440 + ≤1180 docked unchanged; ≤820 undocks to DrawerSheet sessions drawer (tether `DRAWER — SESSIONS (project NAME)`), opens via header sessions button; ≤480 same drawer full-width-minus-gutters.
- **accessibility behavior:** role `navigation` (or `complementary` with nav inside) named `Sessions`; groups are buttons with `aria-expanded`, items are buttons with `aria-current` on active; keyboard Tab + Enter/Space, arrows optional within list; focus moves to stack heading on switch; announcements polite (`Session TITLE loaded with N turns.`, `Project NAME has no sessions yet.`, `No sessions yet. Start your first session.`).
- **owner and scope:** component-architect; left wing docked + sessions drawer content, all breakpoints.

## 8. EvidenceWing (right wing tab controller) — `create`

- **requirement:** Per-session evidence wing: cite-back header + Browser/Files/GitHub tablist + panel; tethered drawer ≤1180px; footnotes ≤820px (Brief §3, Matrix F1–F9).
- **resolution:** `create`
- **components involved:** new `EvidenceWing` (native `tablist` pattern + `tabpanel`s) hosting `BrowserView`, `FileTreeView`, `GitHubChecksView` (all create) + `CiteBackStamp` (native) + `EmptyFrame` (create) for empty/error slots. No registry id; no primitive.
- **rejected alternatives:** rung 1 native buttons + divs fails — cannot own full tab semantics (aria-selected/controls, ArrowLeft/Right/Home/End, activation-selects), per-session tether discipline (untethered panel is a defect), or drawer/footnote handoff; rungs 2–4 none; rung 5 absent — hand-rolled tab keyboard behavior is specified here and flagged for audit (see Risks).
- **token roles:** `surface.wing`, `surface.ticket` (tab/panel bg), `border.rule`, `text.primary`, `action.accent-edge` (active edge), `target.min` (tab hits), `type.eyebrow` (kicker), `type.mono` (cite line), `text.secondary` (scope/footnote), `action.accent` (panel URL), `gap.card-padding`, `gap.section-gap`, `focus.ring`.
- **required states:** default, hover, focus, active, disabled (tabs never disabled — empty/error panels keep tabs live), loading (domain: staged retry-view re-run), empty (domain: per-view empty), error (domain: per-view error), long content (excerpts/paths wrap), overflow (mono truncates inside panel), domain-specific: browser/files/github × populated/empty/error, tab-selected, tethered-drawer, footnote-mirror.
- **responsive behavior:** 1440 docked panel; ≤1180 tethered DrawerSheet (`DRAWER — ATTACHMENT SHEET (tethered to Turn NN)`) with full cite header + tabs, opens on ticket select/Cite action; ≤820 same sheet (right-over-left) + FootnoteBlock mirror below stack; ≤480 sheet full-width-minus-gutters, footnotes static.
- **accessibility behavior:** roles `complementary` (wing, named `Evidence`) containing `tablist`/`tab`/`tabpanel`; tabs `aria-selected` + `aria-controls`, panels labelled by tabs; keyboard ArrowLeft/Right/Home/End move + activate, Tab enters panel; focus trap only in drawer mode (owned by DrawerSheet); announcements polite `VIEW view shown for Turn NN.`, empty/error variants as specified (error assertive).
- **owner and scope:** component-architect; right wing + attachment sheet + footnote source, all breakpoints.

## 9. BrowserView — `create`

- **requirement:** Browser tab panel: title + URL link + excerpt citing back to its ticket; empty and error variants with recovery (Matrix F1–F3).
- **resolution:** `create`
- **components involved:** new `BrowserView` (`section`/`tabpanel` content) + `CiteBackStamp` (native) + `EmptyFrame` (create) for F2/F3 + native `a` (URL) + native `button` (retry/show-ticket). No registry id; no primitive.
- **rejected alternatives:** rung 1 native `div`+`a` fails — cannot own populated/empty/error tri-state with honestly-labelled deterministic retry + show-ticket recovery under one contract; rungs 2–4 none; rung 5 absent.
- **token roles:** `surface.ticket`, `border.rule`, `type.header` (title), `action.accent` (URL), `type.body` (excerpt), `type.mono` (cite excerpt range), `text.secondary`, `text.muted` (empty border), `status.bad-ink` (error), `gap.card-padding`, `gap.stack`.
- **required states:** default, focus, active, loading (domain: retry-view re-run), empty (domain: no excerpt), error (domain: error fixture), long content (long URLs/excerpts wrap), overflow (URL truncates with full href retained), domain-specific: populated, empty, error.
- **responsive behavior:** 1440 docked panel; ≤1180/≤820 inside attachment sheet; ≤480 full-width sheet, excerpt wraps, URL truncates (no h-scroll).
- **accessibility behavior:** role `tabpanel` labelled by `Browser` tab; title is heading; URL is native link with full href; retry/show-ticket are native buttons; announcements polite `Browser view for Turn NN shown.` / `No browser excerpt for Turn NN.`; error assertive `Browser view failed to load. Retry available.`
- **owner and scope:** component-architect; Browser tab at all breakpoints.

## 10. FileTreeView — `create`

- **requirement:** Files tab panel: ruled tree rows (mono paths, change dots, status), expandable dirs, file select cites ticket (Matrix F4–F6).
- **resolution:** `create`
- **components involved:** new `FileTreeView` (`ul` tree + native `button` dir chevrons/rows) + `EmptyFrame` (create) for F5/F6. No registry id; no primitive.
- **rejected alternatives:** rung 1 native nested `ul`+`button`s fails — cannot own change-dot semantics, per-row status (ok/run/bad), 44px row discipline, or select-cites-ticket wiring under one contract; rungs 2–4 none; rung 5 absent (no tree primitive installed).
- **token roles:** `target.row`, `border.hair`, `type.mono` (paths), `status.ok-ink`, `status.warn-ink`, `status.bad-ink`, `action.accent` (change dots), `surface.ticket`, `text.primary`, `text.secondary`, `gap.cluster`, `focus.ring`.
- **required states:** default, hover, focus, active, empty (domain: no files), error (domain: error fixture), loading (domain: retry-view re-run), long content (deep paths wrap/indent), overflow (paths truncate inside row), domain-specific: populated (N changed), dir-expanded/collapsed, file-selected.
- **responsive behavior:** docked 1440; sheet at ≤1180/≤820; ≤480 rows keep status glyph + word, paths truncate (no h-scroll), chevrons stay 44px.
- **accessibility behavior:** role `tabpanel` labelled by `Files` tab containing `tree` (or list) semantics: dirs are buttons with `aria-expanded`, files are buttons (or treeitems) named by path + status; keyboard Tab + Enter/Space, arrows within tree; announcements polite `Files for Turn NN shown: N changed.` / `No files for Turn NN.`; error assertive.
- **owner and scope:** component-architect; Files tab at all breakpoints.

## 11. GitHubChecksView — `create`

- **requirement:** GitHub tab panel: summary rows (repo + ref + summary, nominative text, no logos); empty and error variants (Matrix F7–F9).
- **resolution:** `create`
- **components involved:** new `GitHubChecksView` (`ul` summary rows) + `EmptyFrame` (create) for F8/F9 + native `button` (retry/show-ticket). No registry id; no primitive.
- **rejected alternatives:** rung 1 native `ul`+`li` fails — cannot own populated/empty/error tri-state with deterministic retry + show-ticket under one contract and keep nominative-text discipline; rungs 2–4 none; rung 5 absent.
- **token roles:** `target.row`, `border.hair`, `surface.ticket`, `type.mono` (repo/ref), `type.body` (summary), `text.primary`, `text.secondary`, `text.muted` (empty border), `status.bad-ink` (error), `gap.cluster`, `gap.card-padding`.
- **required states:** default, focus, active, loading (domain: retry-view re-run), empty (domain: no summary), error (domain: error fixture), long content (long refs wrap), overflow (refs truncate inside row), domain-specific: populated, empty, error.
- **responsive behavior:** docked 1440; sheet at ≤1180/≤820; ≤480 full-width sheet, rows wrap (no h-scroll).
- **accessibility behavior:** role `tabpanel` labelled by `GitHub` tab; rows are list items (static text, no fake buttons); retry/show-ticket are native buttons; announcements polite `GitHub summary for Turn NN shown.` / `No GitHub summary for Turn NN.`; error assertive.
- **owner and scope:** component-architect; GitHub tab at all breakpoints.

## 12. EmptyFrame (shared empty/error frames) — `create`

- **requirement:** Dashed in-place placeholder with message + recovery action, reused by empty-trace box, both wing empty/error slots, and no-sessions states — replacing content in place, never overlaying (Brief §5.4, Matrix B6/F2/F3/F5/F6/F8/F9/E2/E3).
- **resolution:** `create`
- **components involved:** new `EmptyFrame` (`section` + native `p` + native `button`). One shared contract, nine call sites. No registry id; no primitive.
- **rejected alternatives:** rung 1 bare native `div`+`p`+`button` per call site fails — nine hand-set copies drift in border style, wording, and recovery wiring (show-ticket vs start-session vs retry-view); a shared contract is the deep-interface move (one prop surface hiding consistent dashed styling + action slot); rungs 2–4 none; rung 5 absent (no primitive for placeholders).
- **token roles:** `text.muted` (dashed border), `text.secondary` (body text), `type.body`, `type.hint`, `surface.ticket`, `surface.base`, `action.primary-bg`, `action.primary-text` (primary recovery), `border.strong` (secondary recovery border), `target.min`, `gap.card-padding`, `gap.stack`.
- **required states:** default, focus, active, disabled (retry locked mid-rerun), loading (domain: retry re-run), empty (the state itself), error (the state itself), long content (messages wrap). No hover-only decoration beyond button states.
- **responsive behavior:** identical at every breakpoint; ≤480 full-width-minus-gutters inside sheets, buttons meet 44px, text wraps.
- **accessibility behavior:** role `group` (or `status` where the message is the confirmation) labelled by its heading/message; recovery is a native button with verb + object (`Show ticket`, `Start first session`, `Retry view`); announcements are the owning view's (polite empty, assertive error); never focus-steals on render.
- **owner and scope:** component-architect; all empty/error slots across center, both wings, all breakpoints.

## 13. Composer — `create`

- **requirement:** End-of-stack message form: mode toggles + session-scoped hint, textarea + send, follow-up strip; per-session draft/mode/follow-up scoping; optimistic echo <300ms then dock; modes locked during run (Brief §2, Matrix D1–D7).
- **resolution:** `create`
- **components involved:** new `Composer` (native `form` landmark) hosting `ModeToggle` (native) + `FollowUpList` (native) + native `textarea` + native `button` send. No registry id; no primitive.
- **rejected alternatives:** rung 1 native `form`+`textarea`+`button`s fails — cannot own per-session draft restore/clear-on-dock-only, send-enable iff non-whitespace, optimistic-echo-then-dock within echo ceiling, run-time locking, or single-announcement discipline; rungs 2–4 none; rung 5 absent.
- **token roles:** `surface.ticket`, `border.strong`, `type.eyebrow` (header label), `type.body` (input text), `text.primary`, `text.muted` (placeholder), `border.rule`, `type.hint` (hint/honest labels), `action.primary-bg`, `action.primary-text` (send/mode-on), `surface.base` (followup bg), `target.min`, `gap.control-padding-x`, `gap.control-padding-y`, `gap.sticky-composer`, `feel.echo`, `feel.reduce`, `focus.ring`.
- **required states:** default (idle), focus (textarea ring), active, disabled (send empty/whitespace; all locked during run/sending), loading (domain: sending + echo-docked), empty (empty draft is the normal idle state), error (excluded — send failure surfaces on the ticket errorbox, not the composer; see state contracts), long content (textarea grows to max then scrolls internally), overflow (draft never overflows page), domain-specific: idle, focused, sending, echo-docked, modes-active, follow-ups pre-use/post-use, session-scoped.
- **responsive behavior:** 1440 + ≤1180 in-flow at stack end; ≤820 + ≤480 sticky-bottom pinned (`gap.sticky-composer`), stack gets bottom padding = composer height so last ticket is never obscured; follow-ups collapse to one internally-scrolling row (page never h-scrolls); all targets stay 44px.
- **accessibility behavior:** role `form` named `Message composer`; textarea labelled (visible label + placeholder, never placeholder-only); send is native button enabled iff non-empty, shortcut Cmd/Ctrl+Enter; modes are `group` with `aria-pressed`; follow-ups are buttons; announcements polite (`Message sent. Working — step 1 of M in stub.`, `MODE mode on.`, `N suggestions listed.`, `Suggestion sent.`); background inert while any sheet open.
- **owner and scope:** component-architect; stack end at all breakpoints; draft/mode/follow-ups scoped per session.

## 14. ModeToggle — `native`

- **requirement:** Exactly-one-active composer mode group; toggling never clears draft; active label mirrors into hint + staged honest text (Matrix D5).
- **resolution:** `native`
- **components involved:** native `div[role=group]` + native `button`s with `aria-pressed`. Owned by Composer. No primitive.
- **rejected alternatives:** none — rung 1 satisfies (two-to-three toggle buttons need no component shell); rungs 2–5 not considered. Composer owns the exactly-one invariant and hint mirroring.
- **token roles:** `surface.ticket` (off bg), `text.muted` (off border), `action.primary-bg`, `action.primary-text` (on), `type.control` (labels), `type.eyebrow` (group label), `target.min`, `gap.control-padding-x`, `gap.control-padding-y`, `focus.ring`.
- **required states:** default, hover, focus, active, disabled (locked during run); domain-specific: mode-on/mode-off (exactly one on).
- **responsive behavior:** unchanged at every breakpoint; 44px hits persist in sticky composer; group may wrap, never h-scrolls page.
- **accessibility behavior:** group labelled (e.g. `Mode`); buttons use `aria-pressed`, named by mode label; keyboard Tab + Enter/Space; announcement polite `MODE mode on.`
- **owner and scope:** component-architect; inside Composer, all breakpoints.

## 15. FollowUpList — `native`

- **requirement:** Pre-use suggestion strip under textarea (latest turn only); pick sends as echo; strip collapses post-use, used labels never re-offered (Matrix D6–D7).
- **resolution:** `native`
- **components involved:** native `div` + native `button`s. Owned by Composer. No primitive.
- **rejected alternatives:** none — rung 1 satisfies (a list of send-buttons with collapse needs no shell); rungs 2–5 not considered. Composer owns pre/post-use state and per-session scoping.
- **token roles:** `surface.base`, `border.rule`, `type.control`, `text.primary`, `target.min`, `gap.cluster`, `gap.control-padding-x`, `gap.control-padding-y`, `focus.ring`.
- **required states:** default, hover, focus, active, disabled (locked during run/sending), empty (domain: post-use collapsed — strip absent, not a placeholder), long content (labels wrap to two lines max), overflow (≤820 single internally-scrolling row), domain-specific: pre-use/post-use.
- **responsive behavior:** 1440/≤1180 wrapped strip under textarea; ≤820/≤480 one horizontally scrolling row inside composer (page never h-scrolls); 44px hits everywhere.
- **accessibility behavior:** group labelled `Suggestions`; buttons named by suggestion label; keyboard Tab + Enter/Space; announcements polite `N suggestions listed.` / `Suggestion sent.`
- **owner and scope:** component-architect; inside Composer, all breakpoints.

## 16. RetryDismissActions — `native`

- **requirement:** Failed-ticket footer: attempt-keeping retry (`Retry Turn NN (attempt K)`) + dismiss-with-reason trigger; red node persists until resolved (Brief §3, Matrix A4/B5/G4).
- **resolution:** `native`
- **components involved:** native `div` + native `button`s (retry `button.danger`, dismiss secondary); dismiss sheet itself owned by DrawerSheet record. No primitive.
- **rejected alternatives:** none — rung 1 satisfies for the footer buttons (two labelled buttons need no shell); rungs 2–5 not considered. Attempt counting and dismiss-sheet validation live in ticket/sheet contracts.
- **token roles:** `status.bad-ink`, `status.bad-border`, `surface.ticket` (danger bg), `surface.ticket` (secondary bg), `text.primary`, `border.strong`, `type.control`, `target.min`, `gap.control-padding-x`, `gap.control-padding-y`, `focus.ring`.
- **required states:** default, hover, focus, active, disabled (retry locked while its retried run is active), loading (domain: retried run staged), error (domain: still-failed after retry, attempt label increments), long content (labels wrap, attempt count persists), domain-specific: failed-retryable, dismissed-terminal.
- **responsive behavior:** unchanged all breakpoints; ≤480 buttons stack full-width, 44px preserved.
- **accessibility behavior:** buttons named `Retry Turn NN (attempt K)` and `Dismiss Turn NN…`; keyboard Tab + Enter/Space; focus returns to ticket on sheet confirm; announcements assertive on failure, polite `Turn NN dismissed: REASON.` on confirm, assertive `Choose a reason to dismiss.` on invalid confirm.
- **owner and scope:** component-architect; failed-ticket footers, all breakpoints.

## 17. DrawerSheet (sessions / attachment / dismiss-with-reason) — `create`

- **requirement:** Modal sheets over scrim with tether labels: left sessions drawer ≤820px, right attachment sheet ≤1180px, topmost dismiss-with-reason; Esc closes exactly one layer, scrim closes topmost, background inert, focus trap + return, right-over-left stacking (Matrix G2–G5, Responsive §5).
- **resolution:** `create`
- **components involved:** new `DrawerSheet` wrapping native `dialog` (showModal) + scrim `div` + native heading/buttons; content slots: session list / evidence tabs / dismiss radios+note. Three instances, one contract. No primitive (absent).
- **rejected alternatives:** rung 1 bare native `dialog` per call site fails — three hand-wired copies would repeat tether/cite headers, stacking order (dismiss > attachment > sessions), one-layer-per-Esc, opener-return, scrim-topmost-only, and reduced-motion-instant discipline; the shared wrapper is the deep interface (props: tether, title, content, opener); rungs 2–4 none; rung 5 absent.
- **token roles:** `surface.ticket` (sheet bg), `border.strong`, `surface.scrim`, `type.header` (title), `type.body`, `type.label` (tether), `type.hint`, `text.primary`, `text.secondary`, `text.muted`, `status.bad-ink`, `status.bad-border` (dismiss confirm), `gap.card-padding`, `feel.base` (open), `feel.reduce` (instant), `focus.ring`, `target.min`.
- **required states:** default, focus, active, disabled (confirm disabled until dismiss reason chosen), loading (excluded — sheets open instantly from local fixtures), empty (content-owned: sessions-empty / view-empty render inside open sheet), error (content-owned: view-error renders inside sheet), long content (sheet scrolls internally), overflow (sheet width = viewport − gutters, never h-scroll), domain-specific: sessions-open, attachment-open (tethered to Turn NN), dismiss-open (topmost, radios required + optional note), all-closed.
- **responsive behavior:** sheets exist only at/≤their breakpoints (attachment ≤1180, sessions ≤820, dismiss any width when triggered); ≤480 all sheets full-width-minus-gutters; right-over-left stacking when both wing sheets open; z-order scrim < sheets < dismiss < live regions < focus rings; open sheet covers sticky composer and traps focus.
- **accessibility behavior:** role `dialog` with `aria-modal=true`, accessible name = tether + title (`DRAWER — ATTACHMENT SHEET (tethered to Turn NN)`, `DRAWER — SESSIONS (project NAME)`, `Dismiss Turn NN with reason`); focus moves to heading on open, trap holds, Esc closes topmost only, scrim click closes topmost only, focus returns to opener; dismiss radios are native `input[type=radio]` required + optional `textarea` note; announcements polite (`Sessions drawer open. N sessions listed.`, `Attachment sheet for Turn NN open.`, `Sheet closed.` when ambiguous).
- **owner and scope:** component-architect; all three sheets, all breakpoints where each applies.

## 18. StripSpine (≤480px strip variant) — `extend`

- **requirement:** Spine as sticky-top progress strip at strip widths: tappable count-chip compression, carriage hidden, status words persist, counts/durations hidden, prose unshrunk (Responsive §1/§4, Matrix C6).
- **resolution:** `extend`
- **components involved:** variant presentation of `SpineNavigator` (same props/state/selection): strip visuals `spine-nav.node-strip-size` + `target.min` hits + count chip button. Not a second component.
- **rejected alternatives:** rung 1 separate native strip fails — would duplicate node/selection/compression/announcement logic under a second name (the exact two-resolutions-for-one-requirement hazard); rung 2/3 no other candidate; rung 4 variant-of-SpineNavigator is the first rung that satisfies (chosen). Rung 5 absent; rung 6 new component refused — duplication rejected.
- **token roles:** `spine.rail`, `status.ok-edge`, `status.warn-edge`, `status.bad-edge`, `surface.ticket` (idle), `text.primary` (status words), `text.muted` (hidden counts context), `surface.strip` (count chip slab), `text.inverse`, `type.numeral-strip`, `type.micro`, `target.node-strip`, `target.min`, `focus.ring`, `feel.reduce`.
- **required states:** default, hover, focus, active; domain-specific: idle/running/ok/bad/selected/compressed-as-count-chip. Empty (zero nodes → strip shows idle rail + zero count) inherited; loading/running shows amber pulse-or-stepped-icon.
- **responsive behavior:** applies ONLY ≤480px down to 375px: sticky top, rail visuals at node-strip size with 44px hits, carriage hidden, collapse note becomes count chip (same action), ticket-head durations hidden globally, prose unshrunk.
- **accessibility behavior:** inherits SpineNavigator: `navigation` named `Session progress`; nodes remain `button`s named `Turn NN, STATUS`; count chip is a button named `Turns A to B grouped. F failures still listed.`; keyboard same arrows + Enter/Space; announcements same (`Turns A to B grouped…`, `Full turn list shown.`).
- **owner and scope:** component-architect; spine column at ≤480px only; shares SpineNavigator props and tests.

## 19. FootnoteBlock — `native`

- **requirement:** ≤820px static translation of selected-ticket wing meta below the stack (browser URL, file change dots, GitHub ref), each citing back; never interactive tabs (Responsive §7).
- **resolution:** `native`
- **components involved:** native `aside`/`footer` + native `p`s + native `a` links + `CiteBackStamp` (native). No new component, no primitive.
- **rejected alternatives:** none — rung 1 satisfies (static text + links need no behavior shell); rungs 2–5 not considered. Full interaction stays in the drawer sheet by contract.
- **token roles:** `text.secondary` (footnote text), `type.hint`, `type.mono` (cite fragments), `action.accent` (links), `gap.stack`, `gap.content-measure`.
- **required states:** default, empty (domain: no cited views → block absent, never an empty box), long content (footnotes wrap), overflow (links truncate inside measure). No hover/focus/loading/error — static.
- **responsive behavior:** renders ONLY ≤820px (absent at 1440/≤1180 where wing is docked/drawer); ≤480 same, above sticky-composer offset.
- **accessibility behavior:** no landmark (or `contentinfo`-adjacent note, never a second evidence authority); static text, links natively keyboardable; never steals focus; no announcement (drawer/tab announcements cover selection).
- **owner and scope:** component-architect; below-stack mirror of selected ticket at ≤820px/≤480px.

## 20. LiveRegion announcer — `native`

- **requirement:** Two visually-hidden regions carrying every Matrix announcement: polite `status` (progress/scope/tabs/disclosure/session) + assertive `alert` (failures/errors); step text never per-token; no toasts (IA §5, Matrix all rows).
- **resolution:** `native`
- **components involved:** native `div[role=status]` (polite) + native `div[role=alert]` (assertive), visually hidden, always present. No new component, no primitive.
- **rejected alternatives:** none — rung 1 satisfies (two live divs + disciplined call sites need no shell); rungs 2–5 not considered. A wrapper would be a pass-through (shallow, refused).
- **token roles:** none visual (visually hidden); contract refs `feel.reduce` (announcements unchanged under reduced motion) and `type.hint` (honest stub wording persists).
- **required states:** default (present-but-silent); domain-specific: polite-step, polite-scope, polite-tabs, polite-disclosure, assertive-failure, assertive-error. No hover/focus/empty — always mounted.
- **responsive behavior:** identical at every breakpoint; visually hidden everywhere; z-order above sheets (always announced), paint never competes with focus rings.
- **accessibility behavior:** roles `status` (implicit polite) and `alert` (implicit assertive) with accessible names where tooling needs (`Turn status`, `Turn errors`); never focusable; never auto-dismissed (persistent nodes, text swapped); streaming writes step text only; failures write `Turn NN failed: KIND target exited CODE. Retry available in the ticket.`
- **owner and scope:** component-architect; global announcer for all Surfaces in this Run.

---

## 21. Dependency graph + build waves (greenfield CREATE — no migration; expand-contract N/A, no legacy)

No legacy form exists, so no expand-contract migration. Build order still sequences dependencies first:

- **Wave 0 — tokens (landed):** semantic + component tokens; all records consume role names only.
- **Wave 1 — native primitives-in-contract:** `StatusPill`, `CiteBackStamp`, `LiveRegion`, `ModeToggle`, `FollowUpList`, `RetryDismissActions`, `FootnoteBlock` (document + prove in isolation; no dependencies).
- **Wave 2 — leaf creates:** `EmptyFrame`, `ExpandedWell` variants (diff/cmdout/excerpt/errorbox/staged), `BrowserView`, `FileTreeView`, `GitHubChecksView` (depend on Wave 1 fragments only).
- **Wave 3 — composites:** `ToolTraceRow` → `WorkOrderTicket` → `SpineNavigator` (+ `StripSpine` variant) → `SessionSidebar` → `EvidenceWing` (tab controller) → `Composer`.
- **Wave 4 — shell:** `DrawerSheet` + workbench layout + z-order + sticky/strip rules + reduced-motion + offline fixtures (depends on Waves 1–3).
- **Wave 5 — proof:** builder fixtures (populated, empty, streaming, failed + retry/dismiss, empty-trace, per-tab empty/error, 30-turn compression, 375px + reduced-motion passes) with every Matrix row reachable and no dead controls.

Dependency graph: tokens → Wave 1 fragments → Wave 2 leaves → Wave 3 composites → Wave 4 shell → Wave 5 proof. `DrawerSheet` depends on sidebar + wing + ticket (content slots); `EvidenceWing` depends on the three views + `EmptyFrame`; `WorkOrderTicket` depends on rows + well + pill + retry buttons; `StripSpine` depends on `SpineNavigator` (variant, same props).
