# Component State Contracts — Work-Order-Rail Chat Surface

Run: `create-20260906-issue20-chat` | Phase: `component-plan` | Status: `proposed` | Producer: `component-architect` | Date: 2026-09-06 | Language: EN-US

How to read: per component — props in, reachable state-matrix rows as the contract table (trigger → rendering → tokens → announcement), then explicit exclusions with reasons. Unreachable rows stay out of the build; inventing them is a defect. Global H (reduced-motion) and I (offline stub) rows follow each component where motion/network applies.

Conventions: status = color + glyph + word; 44px targets; 3px `focus.ring`; polite `status` vs assertive `alert`; no toasts/yank/dismiss.

---

## SC-1 WorkOrderTicket (covers A1–A4)

Props in: `turnNo, title, subline, status: idle|running|ok|failed, selected: boolean, tools: ToolCall[], prose: string, attempt: number, onRetry, onDismiss, onSelect, openWellId | null`.

| State (Matrix) | Trigger | Rendering | Token refs | Announcement |
|---|---|---|---|---|
| A1 Populated | ≥1 turn | Ticket card, full head (numeral/title/subline/pill/duration/edge), prose at measure, tool rows; one ticket `lift.active` + `action.accent-edge` | `surface.ticket`, `border.rule`, `type.numeral/header/meta/body/duration`, `lift.active/none`, `action.accent-edge`, `gap.card-padding/stack/content-measure` | none on load; `Session TITLE loaded with N turns.` (polite) on switch |
| A2 Empty session | zero messages | Center empty panel (heading + line + suggestion buttons + focused composer); spine zero nodes; wings empty | `text.secondary`, `surface.ticket/base`, `target.min`, `feel.echo` | polite `Empty session. Composer ready. Two suggestions listed.` |
| A3 Streaming | send dispatched | Ticket with `status.warn-edge` edge + `Running` pill + skeleton lines + caret (no shimmer) + staged block `Working — step N of M in stub`; spine pulse | `status.warn-edge/bg/ink/border`, `surface.ticket/well`, `type.meta`, `feel.pulse/echo` | polite `Working — step N of M in stub.` then `Turn NN done: X succeeded.` (never per-token) |
| A4 Failed | exit non-zero / interrupt | Ticket persists, `status.bad-edge` edge + `Failed` pill + errorbox (message + exit code); spine bad node; wing cites failed ticket | `status.bad-edge/bg/ink/border`, `surface.well` | assertive `Turn NN failed: KIND target exited CODE. Retry available in the ticket.` |

H: pulse→stepped icon swap; skeleton→caret-chunks; echo→instant dock; announcements unchanged. I: ticket arrives via stub <300ms perceived (echo→staged→dock); retry deterministic, attempt label increments.

Excluded: `permission` — no role check in brief; `disabled` as ticket-level state — locking lives on actions (composer send, modes, chevron), ticket itself never disables.

## SC-2 ToolTraceRow (covers B1–B5 + chevron half of B7)

Props in: `kind, target, status: queued|running|staged|succeeded|failed, durationMs | null, expanded: boolean, onToggle`.

| State | Trigger | Rendering | Token refs | Announcement |
|---|---|---|---|---|
| B1 Queued | accepted, not started | Neutral kind chip + mono target + `Queued` idle + duration `—`; spine base entry | `surface.ticket`, `border.strong`, `text.primary`, `type.mono`, `text.muted`, `target.row` | none (covered by A3 start) |
| B2 Running | step started | `Running` + amber spine pulse + staged block + ticking duration (hidden ≤480) | `status.warn-ink/edge`, `type.duration`, `feel.pulse` | polite `KIND target started.` once per step |
| B3 Staged | multi-step stub | Bar (track/fill) + `Step N of M` + honest suffix; never claims real progress | `surface.ticket`, `status.warn-border/ink/edge`, `type.meta` | polite `Step N of M` |
| B4 Succeeded | exit 0 | `Done` + duration (hidden ≤480); collapsible to well | `status.ok-ink`, `type.duration`, `diff.*`, `type.mono` | polite on turn completion only |
| B5 Failed | exit non-zero | `Failed` + well errorbox; footer retry/dismiss | `status.bad-ink/bg/border` | assertive per A4 |
| B7 chevron | activated | `aria-expanded=true`, 44px hit | `target.min`, `focus.ring` | polite `Detail for KIND target shown. Cites Turn NN.` / `Detail hidden.` |

H: bar→step text only (`Step N of M`); pulse→static amber. I: durations from fixtures; deterministic.

Excluded: `empty` — zero-tool turns render EmptyFrame (B6), never a row; `permission` — no role check; `success` as separate visual — `succeeded/Done` is the success form.

## SC-3 ExpandedWell (covers B6–B7 bodies)

Props in: `turnNo, kind, target, variant: queued-note|diff|cmdout|excerpt|errorbox|staged, body: fixture, failed: boolean, onCopy, onCite, onRetry?`.

| State | Trigger | Rendering | Token refs | Announcement |
|---|---|---|---|---|
| B6 No-tools | zero tool calls | Dashed box `No tools ran this turn. Nothing to cite.` No well, no cite action | `text.muted` (border), `text.secondary` | polite `Turn NN has no tool activity.` |
| B7 diff | Write/Read/Edit success | Cite line + unified diff (add/del/ctx) + footer | `surface.well`, `type.mono`, `diff.add-bg/ink`, `diff.del-bg/ink`, `diff.ctx-ink` | polite show/hide |
| B7 cmdout | Bash success | Cite line + dark cmdout block + footer | `surface.cmdout-bg/text`, `type.mono` | polite show/hide |
| B7 excerpt | WebSearch success | Cite line + excerpt lines A–B + footer | `surface.well`, `type.body/mono` | polite show/hide |
| B7 errorbox | failed step | Cite line + errorbox (message + exit code) + retry in footer | `status.bad-bg/border/ink` | assertive per A4 |
| B7 staged | running/staged | Progress + honest label | `surface.ticket`, `status.warn-border/ink/edge`, `type.meta` | polite step text |
| B7 queued-note | queued expand | `Queued — detail lands when the step starts.` | `text.secondary`, `type.hint` | none new |

H: staged bar static; prose streams caret-only. I: bodies from fixtures only.

Excluded: `empty` as well-variant — B6 explicitly renders no well; `permission`, `disabled` — well content never disables (footer buttons may).

## SC-4 SpineNavigator + StripSpine variant (covers C1–C6)

Props in: `turns: {no, title, status}[], selectedNo, carriageNo, collapsed: {from,to,count}[], failures: no[], onScrub, onExpandAll, onJumpToFailure`.

| State | Trigger | Rendering | Token refs | Announcement |
|---|---|---|---|---|
| C1 Idle | loaded, nothing running | Neutral rail, nodes ok/idle, labels + sub, carriage at viewport (except ≤480) | `spine.rail`, `status.ok-edge`, `surface.ticket`, `text.primary/muted`, `spine.carriage-bg/text`, `type.micro` | none |
| C2 Running | any step running | Running node + pulse; carriage advances w/o yank | `status.warn-edge`, `feel.pulse/snap` | polite step text |
| C3 OK | turn all-succeeded | Green node + `Done` word | `status.ok-edge` | none per node |
| C4 Bad | unretried failure | Red node + count badge until retried/dismissed; persists across switches | `status.bad-edge` | assertive on creation (A4) |
| C5 Selected | scrub/select | Selected ring + ticket `lift.active` + edge-active + wing re-cite; exactly one | `focus.ring`, `lift.active`, `action.accent-edge`, `type.mono` | polite `Turn NN selected. KIND target cited.` |
| C6 Compressed | 20+ turns | Completed runs grouped (`Turns A–B · N done`); failures + current bypass; expand + jump buttons (≤480: count chip) | `surface.wing`, `text.secondary`, `target.node/strip/min` | polite grouped / `Full turn list shown.` |

H: pulse→static amber icon; scrub→instant select+scroll. I: nodes from fixtures; no fetch.

Excluded: `error` as rail state — failures are node states (C4), rail never errors; `permission` — no role check; `empty` rail (zero nodes) renders idle rail, covered by C1/A2.

## SC-5 Composer + ModeToggle + FollowUpList (covers D1–D7)

Props in: `sessionId, draft, mode, modes[], followUps: {id,label}[] | null, running: boolean, onType, onSend, onMode, onPickFollowUp, onDismissFollowUps`.

| State | Trigger | Rendering | Token refs | Announcement |
|---|---|---|---|---|
| D1 Idle | ready, empty draft | Frame + textarea + placeholder; send enabled iff non-whitespace; modes off-style; hint | `surface.ticket`, `border.strong`, `text.primary/muted`, `type.body/hint/eyebrow`, `action.primary-bg/text`, `target.min` | none |
| D2 Focused | textarea focused | 3px ring; hint persists; send enables on first non-whitespace | `focus.ring`, `target.min` | none |
| D3 Sending | send (<300ms) | Optimistic echo row instantly; send disabled + `Sending`; modes/follow-ups locked | `feel.echo`, `action.primary-bg/text` | polite `Message sent. Working — step 1 of M in stub.` |
| D4 Echo docked | stub ack | Echo docks to spine position; running ticket follows; draft cleared only after dock (per-session preserved on switch) | `feel.echo/snap`, `gap.stack` | single (D3, no double) |
| D5 Modes | toggle | Exactly one `action.primary` active; hit 44px; active mirrored in hint + staged text | `action.primary-bg/text`, `text.muted`, `type.meta` | polite `MODE mode on.` |
| D6 Follow-ups pre-use | suggestions land | Strip under textarea, 44px; latest turn only | `surface.base`, `border.rule`, `target.min` | polite `N suggestions listed.` |
| D7 Follow-ups post-use | pick / new send | Strip collapses for that turn; used label never re-offered | same | polite `Suggestion sent.` |

H: echo instant dock; same announcements. I: send resolves via stub <300ms; draft/mode/follow-ups per-session, never leak.

Excluded: `error` as composer state — send failure surfaces on ticket errorbox (A4), composer stays idle with draft intact; `permission` — no role check; `empty` as error — empty draft is normal D1.

## SC-6 SessionSidebar (covers E1–E4)

Props in: `projects: {id,name,sessions:{id,title,updatedAt,turns}[]}[], activeSessionId, collapsed: projectId[], onSwitch, onToggleProject, onNewSession(projectId?)`.

| State | Trigger | Rendering | Token refs | Announcement |
|---|---|---|---|---|
| E1 Populated | projects+sessions exist | Groups + headings + items (44px, meta) + active edge | `surface.wing/ticket`, `border.rule`, `action.accent-edge`, `type.eyebrow/meta`, `target.row`, `gap.card-padding/section-gap` | polite on switch |
| E2 Empty project | project, zero sessions | `No sessions yet.` + inline `Start first session` (scoped) | `text.secondary`, `surface.ticket`, `border.strong` | polite `Project NAME has no sessions yet.` |
| E3 No sessions | zero everywhere | `No sessions yet.` + start + project list if any; center A2; spine idle | same + `action.primary-bg/text` | polite `No sessions yet. Start your first session.` |
| E4 Switching | item activated | Atomic re-scope (center+spine+wing+draft/mode/follow-ups); focus to stack heading; wing re-cites | `action.accent-edge`, `surface.base` | polite `Session TITLE loaded with N turns.` |

H/I: switching instant; no animation; fixtures local; no fetch.

Excluded: `loading`, `error` — local fixtures, atomic instant swap; missing fixture = build defect, not runtime state (Matrix §I); `permission` — no role check.

## SC-7 EvidenceWing + BrowserView + FileTreeView + GitHubChecksView (covers F1–F9 + tab switching)

Props in: `turnNo, kind, target, sessionTitle, view: browser|files|github, browser?: {title,url,excerpt} | null | {error}, files?: FileNode[] | null | {error}, github?: {repo,ref,summary} | null | {error}, onTab, onRetryView, onShowTicket`.

Header invariant (every sub-state): kicker + cite line `Turn NN / Kind target` + scope `Session TITLE · View`. Untethered panel = defect.

| State | Trigger | Rendering | Token refs | Announcement |
|---|---|---|---|---|
| F1 Browser populated | excerpt present | Panel: title + URL link + excerpt w/ cite-back | `surface.ticket`, `border.rule`, `type.header/body/mono`, `action.accent`, `text.secondary` | polite `Browser view for Turn NN shown.` |
| F2 Browser empty | no excerpt | Dashed `No browser excerpt for this turn.` + `Show ticket` | `text.muted`, `surface.ticket`, `border.strong` | polite `No browser excerpt for Turn NN.` |
| F3 Browser error | error fixture | Message + `Retry view` (honest) + `Show ticket` | same + `status.bad-ink` | assertive `Browser view failed to load. Retry available.` |
| F4 Files populated | tree nodes | Ruled rows (mono, change dots, status), 44px chevrons | `target.row`, `border.hair`, `type.mono`, `status.ok/warn/bad-ink`, `action.accent` | polite `Files for Turn NN shown: N changed.` |
| F5 Files empty | no files | Dashed `No files cited this turn.` + `Show ticket` | `text.muted` | polite `No files for Turn NN.` |
| F6 Files error | error fixture | Message + `Retry view` + `Show ticket` | `status.bad-ink` | assertive `Files view failed to load. Retry available.` |
| F7 GitHub populated | summary present | Summary rows (repo+ref+summary, nominative, no logos) | `target.row`, `border.hair`, `type.mono/body` | polite `GitHub summary for Turn NN shown.` |
| F8 GitHub empty | no summary | Dashed `No GitHub activity cited this turn.` + `Show ticket` | `text.muted` | polite `No GitHub summary for Turn NN.` |
| F9 GitHub error | error fixture | Message + `Retry view` + `Show ticket` | `status.bad-ink` | assertive `GitHub view failed to load. Retry available.` |
| Tabs | switch | Active `action.accent-edge`, 44px; arrows move, activation selects; tabs never change ticket | `surface.ticket`, `text.primary`, `action.accent-edge`, `target.min` | polite `VIEW view shown for Turn NN.` |

H: no animated content in wing; sheet open instant under reduce. I: all content fixtures; `Retry view` re-runs stub deterministically (failure fixture keeps attempt history).

Excluded: `permission` — no role check; `loading` as skeleton — retry re-run is brief staged/instant, covered by owning view's loading row where rendered; `disabled` — tabs/actions never disable (empty/error keep recovery live).

## SC-8 DrawerSheet (covers G2–G5; hosts G1/G4 content)

Props in: `open: null|sessions|attachment|dismiss, tether: string, title: string, content: slot, openerRef, onCloseTop, dismiss?: {reason | null, note, onReason, onConfirm}`.

| State | Trigger | Rendering | Token refs | Announcement |
|---|---|---|---|---|
| G1 Session switching | any switch | Atomic scope swap; drafts/modes/follow-ups re-scope; focus to stack heading; no partial scope | `surface.wing/ticket/base`, `spine.rail`, `type.mono` | polite `Session TITLE loaded with N turns.` |
| G2 Sessions drawer | sessions btn ≤820 | Sheet + tether `DRAWER — SESSIONS (project NAME)` + scrim; focus to heading, trap | `surface.ticket/scrim`, `border.strong`, `type.header/body/label`, `gap.card-padding` | polite `Sessions drawer open. N sessions listed.` |
| G3 Attachment sheet | select/Cite ≤1180 | Sheet tethered `DRAWER — ATTACHMENT SHEET (tethered to Turn NN)` + cite header + tabs + panel; right-over-left | same + `type.mono/eyebrow`, `text.secondary` | polite `Attachment sheet for Turn NN open.` |
| G4 Dismiss sheet | dismiss on failed | Topmost: `Dismiss Turn NN with reason`; required radios (obsolete/duplicate/wont-fix) + optional note; confirm disabled until reason | same + `status.bad-ink/border`, `type.body` | polite `Turn NN dismissed: REASON.`; assertive `Choose a reason to dismiss.` on invalid confirm |
| G5 Closed | Esc/close/scrim | Focus to opener; scrim removed; composer reachability restored | `surface.scrim`, `focus.ring` | polite `Sheet closed.` only if ambiguous |

Rules: Esc closes exactly one (topmost) per press; scrim closes topmost only; background (incl. sticky composer) inert + untabbable while open; stack dismiss > attachment > sessions.

H: open instant (`feel.reduce`); focus/trap/Esc unchanged. I: N/A (chrome, no fetch).

Excluded: `empty`, `error` as sheet states — content-owned (EmptyFrame inside open sheet); `loading` — sheets open instantly; `permission` — no role check.

## SC-9 StatusPill + CiteBackStamp + FootnoteBlock + RetryDismissActions + EmptyFrame + LiveRegion (cross-cutting)

Props in: Pill `{status}`; Stamp `{turnNo, kind, target, sessionTitle?, view?}`; Footnote `{turnNo, cites: {browserUrl?, fileDots?, githubRef?}[]}`; RetryDismiss `{turnNo, attempt, failed, onRetry, onDismiss}`; EmptyFrame `{tone: empty|error, title, body, actionLabel, onAction}`; LiveRegion `{polite, assertive}` (write-only text slots).

| Host state | Rendering | Token refs | Announcement |
|---|---|---|---|
| Pill ok/run/bad/idle | Glyph + word, never hue alone; never hidden (rollup-safe) | `status.ok/warn/bad-bg/ink/border`, `text.secondary/muted`, `type.meta`, `gap.inline` | parent's |
| Stamp everywhere | Kicker + mono cite + scope; wraps, never h-scrolls | `type.eyebrow/mono/label/hint`, `text.secondary/muted`, `gap.content-measure` | parent's |
| Footnotes ≤820 | Static cites below stack (URL, change dots, ref) + scope; links only, never tabs | `text.secondary`, `type.hint/mono`, `action.accent` | none (drawer/tab covers) |
| Retry/dismiss footer | `Retry Turn NN (attempt K)` danger + `Dismiss…` secondary; attempt persists/increments | `status.bad-ink/border`, `surface.ticket`, `text.primary`, `border.strong`, `type.control`, `target.min` | assertive failure; polite dismissed |
| EmptyFrame slot | Dashed in-place frame + message + one recovery button | `text.muted/secondary`, `type.body/hint`, `surface.ticket/base`, `action.primary-bg/text`, `target.min` | owning view's |
| LiveRegion | Two hidden nodes (`status` + `alert`), text swapped, never toasts | (non-visual; `feel.reduce` wording persists) | step text only, never per-token |

Excluded globally: `permission` — no component in this Surface sits behind a role check, so no permission row appears in any contract; `success` as a distinct toast/banner — terminal success is the domain `Done`/`succeeded` rendering, never a separate state; page-level `loading` skeletons beyond ticket staged/sending — fixtures are local and instant; offline-as-error — Matrix §I forbids an offline banner (missing fixture = build defect).

---

## Coverage attestation

- Reachable rows implemented: A1, A2, A3, A4, B1, B2, B3, B4, B5, B6, B7, C1, C2, C3, C4, C5, C6, D1, D2, D3, D4, D5, D6, D7, E1, E2, E3, E4, F1, F2, F3, F4, F5, F6, F7, F8, F9, tab-switching, G1, G2, G3, G4, G5, H-equivalents, I-behavior. No reachable row is left without an owning component above.
- Builder proof fixtures required (Matrix §Builder proof): populated session, empty session, streaming run, failed turn + retry + dismiss-with-reason, empty-trace ticket, per-tab empty + error, 30-turn compression + jump-to-failure, 375px strip + reduced-motion passes.
