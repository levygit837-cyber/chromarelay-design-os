# Direction — Control Room (T2)

**ID:** `direction-control-room` · Run `create-20260906-issue20-chat` · Phase `direction-divergence` · Lens T2 Control Room

## Thesis

The agentic chat is a night-shift mission-control board where every pixel answers a status question and the operator's abort switch is always within reach.

## Product interpretation

Through this lens the product is not a conversation that happens to have tools; it is a supervised operation where chat is the steering console for consequential tool work. The user is the night-shift operator, the agent is the crew executing bursts of Reads, Writes, Edits, Bash runs, and searches, and the Surface is the wall of status boards answering what is running, what failed, and what needs the operator's hand right now. Prose is the shift-log summary; the board is the truth. Success means the operator trusts the boards enough to look away from the reading path and cheaply grabs the abort switch — interrupt, retry, mode flip — the instant a board disagrees with the log.

## Domain world

- Operators sit over the shoulder of a fast junior across three overlapping rooms — the bench where change happens, the library where truth is checked, the mission wall where effects are seen — so directing, doing, and proving must share one glance, not three tabs.
- The bench reads by wells and rules, not card piles: screen glow in a dim room, status lamps (green nominal / amber working / red failed), stained-glass syntax windows inside dark planes; light means status, never ambience.
- The loop is burst → pause → verify with mixed-duration tool bursts (Reads in milliseconds, Bash and tests over seconds), retry stutter (fail → inspect → retry), and resumption after hours as first-class rhythms.
- The pressure is accountable delegation under vigilance fatigue: trust-but-verify anxiety, damage fear of runaway Bash, hallucination vigilance over diffs, interruption guilt — so failures persist in place with retry and interruption looks safe and immediate.
- Practitioner language is already operational — plan, act, run, trace, call, checkpoint, steer, interrupt, retry, resume; pilot/co-pilot with abort authority — authorizing a steering-console register and forbidding mascot or chatty mechanisms.

## Composition

Operations board: a narrower center reading column (Tier 1 conversation plus composer) flanked by two persistent high-signal rails — left resumption rail with state badges per session, right evidence rail scoped to the active Session.id. The tool trace renders as a status board docked under each assistant turn with fixed kind / target / status / duration columns, tabular numerals, exit codes inline, summary-first with in-place expansion. The right wing defaults to the most anomalous view, not a fixed tab. Density is deliberately high everywhere as the capability signal. Responsive per C-T6/C-P3: three panes docked at 1440px, one docked plus one overlaid at mid widths, single column with both wings as drawers and a persistently pinned composer at 375px, never any horizontal page scroll.

## Typography

Console tabular: mono-forward throughout the trace and sidebars with uppercase micro-labels sharing fixed columns so scanning is vertical; proportional reading face quarantined strictly to assistant prose summaries and empty-state guidance in the center column. Hierarchy from position, weight, and column discipline; tabular lining figures mandatory; sizes and weights hold 4.5:1 on dark grounds with visible focus pairs.

## Color

Quiet dark grounds with rationed signal: deep matte bench plus lifted inset wells, the only saturated pixels being status and diff semantics (success green, running amber, failed red, diff green/red, link blue). Every status ships as pip plus text label plus icon (C-A2), tuned to pass AA on near-black and legible in grayscale. No ambient AI gradient or glow identity.

## Surfaces

Dark instrument bench: continuous deep matte ground, inset wells for live regions (streaming, running tools, skeletons), ruled flat ledger for settled work, elevation rationed to exactly two raised caps — the composer and the interrupt/retry control. Verification views are inset wells with stamped session-and-turn headers; expanded tool detail is a deeper well inside its row, never a floating card.

## Motion

Motion as signal: running rows pulse in place with a low-amplitude opacity step; failures flash exactly once then settle to a persistent labeled badge with inline retry; right-wing view switches cut without travel; streaming is a quiet caret plus staged skeleton-to-row reveal with optimistic composer echo under ~300ms. Every state carries a reduced-motion twin (static badges, skipped flash, cuts stay cuts) plus live-region announcements per C-A4.

## Signature

The anomaly-first wing: the right sidebar promotes whichever view holds the newest failure or running tool and pins a labeled reason chip to the wing header (e.g. “Showing Files: newest failure — Edit src/auth.ts failed with exit 1”). It recurs on every tool-bearing turn and every session switch. Regulation: promotion only on new failure or newly running work, operator tab choice otherwise persists, at most one promotion per turn, never steals focus, reason label mandatory, announced once via live region with the prior tab one keypress away.

## Anti-defaults

- Single lonely chat column → persistent three-pane ops board.
- Bubbly card soup → ruled status-board ledger, elevation only for world-changing controls.
- Ambient AI gradient/glow → matte ground with rationed labeled status color.
- Color-only status dots → pip plus label plus icon plus duration/exit code in a fixed column.
- Auto-dismissing failure toasts → in-place persistent failure rows with retry plus wing promotion.
- Decorative streaming shimmer with scroll yank → in-place pulse, staged reveal, cuts, and quiet caret with reduced-motion fallbacks.

## System potential

Rows, wells, and caps extend to every length, state, and viewport: long sessions collapse settled turns to header rows with status counts while the anomalous turn stays expanded; empty states render as ruled placeholder rows in the same wells; loading, failure, and empty forms are board-native per C-T5; 1440px docks all panes, mid widths overlay the wing, 375px draws both wings over a single column with pinned composer. Future surfaces (queues, history, session compare) reuse the same board grammar.

## Risks

Tier 1 drowns in Tier 2 density; dark-ground amber/red misses AA; perpetual pulse reintroduces vigilance fatigue; 375px drawers bury content without exact focus semantics; density without column discipline collapses into clutter theater.

## Divergence axes

Ops-board composition; high-everywhere density; signal motion; dark-well-plus-cap surfaces; console-tabular voice — each structural against the dossier (T1), editorial (T3), and spine (T4) alternatives.

## Evidence plan

A. First view at 1440px (hierarchy and density). B. Signature promotion chip in place. C. Status-board turn at working density with expansion. D. Streaming, failure-with-retry, and empty states. E. Type-and-surface density sheet with AA pairs. F. 375px drawer behavior with pinned composer.
