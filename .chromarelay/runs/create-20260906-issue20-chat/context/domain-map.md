# Domain Map — Agentic Model Chat Surface

Run: `create-20260906-issue20-chat` | Phase: domain-exploration | Status: `proposed` | Producer: `art-director` | Date: 2026-09-06 | Language: EN-US

Sources: `.chromarelay/runs/create-20260906-issue20-chat/context/product-brief.md`; `.chromarelay/runs/create-20260906-issue20-chat/context/constraint-draft.md`.

This map is generative material, not a picture to copy. Each section ends with a *crossing* — the structural, proportional, rhythmic, or behavioral mechanism the finding suggests. Where a crossing risks literal depiction, it is translated one level further into mechanism.

---

## 1. Objects and instruments

The work is done through: a **composer** (multiline input, follow-up suggestions, mode toggles such as plan/act); **sessions and projects** (the unit of resumption); a **conversation column** (user instructions, assistant prose); an attached **tool trace** (`Write`, `Read`, `Edit`, `Bash`, `WebSearch` calls, each with status `running / succeeded / failed`, summary, expandable detail, duration); and three per-session **verification views** (integrated browser excerpt, file tree + diff, GitHub repo/ref summary). Instruments of control: send, stop/interrupt, retry/dismiss, mode switch, follow-up pick, tool-row expand, sidebar-view switch, session/project switch.

Secondary objects: diffs and patches, file paths, shell commands and exit codes, search excerpts, URLs and titles, commit refs, test outcomes, checkpoint markers, empty/error/loading placeholders.

- **Crossing →** tiered information architecture: Tier 1 conversation + composer, Tier 2 session switcher + tool summaries, Tier 3 tool detail + verification content; progressive disclosure (summary → detail) as the load-bearing interaction, not decoration.

## 2. Materials and light

Real materials of the practice: **screen glow in a dim room**, phosphor-terminal heritage (green/amber on black), paper printouts of diffs marked up by hand, the cold aluminum of laptops, server-room steel, browser-white glass. Light behaviors: the **blinking caret**, syntax highlighting as small stained-glass windows inside dark planes, the streaming shimmer of tokens arriving, status lamps (green nominal / amber working / red failed). Shadows are shallow; separation comes from rules, wells, and inset panels more often than from elevation.

- **Crossing →** surface logic of *wells and rules rather than card piles*: live regions read as inset wells, completed work as ruled ledger rows, only world-changing controls (send, interrupt, retry) earn elevation. Light means status, never ambient glow. (One level further: no literal terminal-green theme; instead, a restrained status-pip + label system that works in light and dark.)

## 3. Environments and spatial relationships

Practitioners work in three overlapping rooms: the **bench** (editor + terminal where change happens), the **library** (files, history, GitHub, docs where truth is checked), and the **mission wall** (browsers, previews, dashboards where effects are seen). Spatially the user sits *over the shoulder* of the agent: directing from the center, glancing left to resume ("where was I"), glancing right to verify ("prove it"). The center is a reading desk; the wings are tool walls. At narrow widths the wings become drawers that slide over the desk rather than crushing it; the desk (composer + current answer) is never allowed to become illegible.

- **Crossing →** a **three-pane workbench with session-scoped wings**: left wing = resumption (projects group sessions), center = reading + steering, right wing = evidence scoped to the active `Session.id`. Collapse semantics (docked → overlaid → drawer, 1440px → 375px) are architectural, with the composer persistently reachable and no horizontal page scroll.

## 4. Vocabulary and metaphors practitioners already use

Verbs and nouns in daily use: *agent, session, thread, context, memory; plan, act, run, loop, trace, call; Read, Write, Edit, Bash, WebSearch; diff, patch, checkpoint, rollback; steer, interrupt, retry, resume; follow-up, mode.* Working metaphors: **pilot and co-pilot** (shared control, abort authority), **junior engineer / intern** (fast but needs review), **pair programmer** (shoulder-to-shoulder), **conductor / orchestrator** (many tools, one score), **flight recorder** (every consequential step leaves a retrievable entry), **sandbox** (safe place to try), **pipeline** (staged flow from instruction to verified change).

- **Crossing →** language of the surface stays operational and auditable: turns labeled by role and order, tools labeled by kind + target + status, views labeled by session scope. Metaphors authorize mechanisms (flight-recorder trace, steering console, evidence bench) — never mascots, never chatty anthropomorphism.

## 5. Colors that occur naturally in the work

Drawn from the bench, not from branding: **paper white and ink black** (reading ground), **steel gray** (chrome), **diff green and diff red** (added / removed), **command amber** (running, caution), **link blue** (reference, browser), **syntax accents** (keyword blue, string amber, type violet, comment gray), **status triad** (success green, running amber, failed red). GitHub and browser views bring their own near-black headers and white document grounds. The palette pressure is toward desaturated structure with small saturated signals.

- **Crossing →** color strategy of *quiet grounds + signal color*: desaturated continuous surfaces carry reading; saturated color is rationed to status and diff semantics and always paired with label + icon so it survives grayscale and meets AA contrast. No ambient AI gradient as identity.

## 6. Rhythms and behavior over time

The core loop is **burst → pause → verify**: the user types (slow, deliberate), the agent works (fast burst of tool calls with mixed durations — `Read` in milliseconds, `Bash`/tests over seconds), prose streams, the user verifies, steers, or interrupts. Superimposed rhythms: session resumption (return after hours, "what changed"), long idle monitoring punctured by failure alerts, retry stutter (fail → inspect → retry), follow-up cadence (cheap steer beats retyping). Time signatures: the conversation accretes downward, the trace expands and collapses in place, the sidebar re-scopes on every session switch, streaming flickers then settles.

- **Crossing →** motion as *narration of the loop*: distinct streaming states for prose (caret) vs. tool work (row skeletons, staged progress from stub durations); optimistic composer echo under ~300ms with staged reveal for longer runs; interrupt and retry feel immediate; reduced-motion fallbacks make every state change legible statically. No decorative motion.

## 7. The human task and the emotional pressure around it

The task: **delegate consequential work to a fast, non-deterministic junior while remaining accountable for the result** — compose intent, steer cheaply, and verify every consequential step without leaving the surface. Emotional pressure: *trust-but-verify anxiety* (did it really edit the right file?), *damage fear* (runaway `Bash`, silent overwrite), *hallucination vigilance* (invented APIs, plausible-but-wrong diffs), *context-loss dread* (will it remember my session tomorrow?), *vigilance fatigue* (watching every tool call is exhausting), *interruption guilt* (stopping a running agent feels rude or wasteful), *flow hunger* (the desire to stay in the reading path without being yanked by auto-scroll or toasts).

- **Crossing →** design for *accountable delegation*: every assistant turn that claims work carries its tool evidence or an explicit empty-trace state; failures render in place with retry (never an auto-dismissing toast); session switching restores full scope including the right-wing view; steering (follow-ups, modes) looks obvious and safe to try; the reading column stays calm under a dense workbench so vigilance costs less.

---

## Confidence

High that the seven dimensions above are grounded in the brief's observed vocabulary (tool kinds, dual sidebars, follow-ups, mode toggles, three verification views) and the constraints' hard floors (frontend-only stubs, real states, 375–1440px, keyboard/contrast/live-region floors). Medium on exact mode taxonomy and long-session navigation needs, left open for Directions.
