# Direction Work-Order (T4 Work-Order Rail)

## Thesis
The session is a job wall where agentic time becomes navigable space: every assistant turn is a numbered work order clipped to a persistent progress spine, so resumption starts with where-was-I instead of scrolling.

## Product interpretation
This product is a workshop job wall for accountable delegation: a builder hands consequential coding work to a fast, non-deterministic junior and must see, in one glance, what was asked, what the agent did tool by tool, and what changed — scoped to the session that produced it. The conversation is not a chat log but a sequence of numbered jobs moving along a rail from queued to done, with evidence clipped to the job that cites it.

## Domain world
- Workshop job boards: tickets clipped to a vertical rail with number, handler, target, and state; the wall tells the day at a glance and resumption starts with scanning the rail.
- Burst-pause-verify rhythm: slow typing, fast mixed-duration tool bursts (Read in ms, Bash/tests over seconds), then verification; uneven time needs spatial compression.
- Over-the-shoulder supervision with trust-but-verify anxiety: every claim carries tool evidence or an explicit empty-trace state; failures persist in place with retry.
- Bench-library-mission-wall practice: center desk for directing, left glance to resume, right glance to verify — center plus session-scoped wings.
- Bench colors and status lamps: paper, ink, steel, diff green/red, command amber, link blue, green/amber/red triad — desaturated structure, small saturated signals.

## Composition
Spine-and-tickets. A persistent vertical time/progress spine left of the center column: continuous 2px rule, one node per assistant turn. Each assistant turn is a numbered work order (numeral + role + status pill + duration, prose, bundled tool-ticket rows with kind/target/status/duration). User turns are slim interleave rows, never tickets. Right wing mirrors the selected ticket with a cite-back header (Turn 04 / Bash npm test). Medium rhythmic density: compact 44px rows, exactly one expanded well per work order, history compressed to counted spine nodes. 1440px docked plus spine; mid widths right wing overlays; 375px spine becomes a top strip and wings become drawers, composer persistently docked, no h-scroll.

## Typography
Workmanlike grotesk. Sturdy neo-grotesk for tickets, spine, chrome, composer; mono strictly for targets/commands/durations; large condensed turn numerals (4x body) as the ordering device. Scale: numeral >> header 15-17px semibold > body 14-15px > meta 11-12px uppercase letterspaced. Jobs shout numbers, tools whisper targets.

## Color
Quiet workshop grounds carry reading; saturated color means status or diff only. Warm-neutral grounds, deeper sidebar grounds. Green/amber/red triad always with label plus icon (AA, grayscale-safe). Diff green/red only inside the well. Spine neutral graphite, nodes carry status. Active ticket gets one accent edge, never a tint. No AI gradient.

## Surfaces
Ticket stack — cards are structural here because a work order is a bounded job with attachments. CARD-SOUP GUARD (absolute): exactly one elevated ticket per viewport (active/selected); all others flat with 1px rules; tool rows never cards (ruled rows, inset well expansion); spine never elevated; right wing tethered by citation, not floating; emphasis via numerals/labels/pips, never extra shadows. Depth means job state.

## Motion
Motion is progress along the rail. Queued enters at spine base, running shows amber pulse plus staged stub-duration progress, succeeded settles green, failed settles red with inline error. Composer echoes optimistically under 300ms then docks to its spine position. Scrub cross-highlights ticket, node, and wing. Interrupt/retry instant. Reduced-motion static equivalents for all; prose streaming is caret-only, never shimmer.

## Signature
The spine navigator: the time rail doubles as session navigation — continuous rule, one node per turn, status-coded, failures as red nodes with counts, carriage marker for viewport, click/keyboard scrub jumps to any turn and mirrors in the right wing. Recurs on every multi-turn session (docked rail at desktop, top strip at 375px). Regulated: one spine per session, one node per assistant turn chronologically, at most one well open per work order, failures persist until retried or dismissed with reason, 20+ turns compress completed runs while failures and current job stay addressable.

## Anti-defaults
Bubbles become numbered work orders; card soup is banned by absolute elevation rules; AI gradients are replaced by rationed signal color; auto-scroll plus toasts are replaced by spine-anchored in-place failures with live regions; dark-only mono console is replaced by light-capable grounds with mono rationed to evidence.

## System potential
The ticket anatomy scales to any length, all states (streaming skeleton, running progress, inline failure with retry, empty-trace box, empty session starter, empty attachment frame), all widths (1440 docked, 1024 overlay sheet, 768 drawer left, 375 strip-spine plus drawers with docked composer), and all three right views as attachment variants. Further surfaces inherit the rail.

## Risks
Spine-as-chrome crowding; card-soup regression if elevation rules slip; over-mechanized short sessions; fake-determinism staged progress; narrow-viewport rail collision.

## Divergence axes
Time-as-space spine composition; medium rhythmic compression density; progress-along-rail motion; structural ticket stack with active-only elevation; grotesk-plus-numeral typographic voice.

## Evidence plan
A: 1440px first view. B: spine scrub. C: ticket anatomy plus empty-trace. D: running/failed/empty states. E: density crop plus 375px strip.
