# Exceptions — Work-Order Rail canonization

Run: `create-20260906-issue20-chat` | Status: `proposed` | Producer: `system-architect` | Date: 2026-09-06

Every value below departs from the specimen or from a Run default. Reason is mandatory; an unrecorded departure promoted later would read as the rule.

## EX-01 — Darkened status text inks for AA (specimen departure)

- Departs from: specimen `--ok:#1d7a3a` used as text on `--ok-bg`, `--warn:#8a5a00` on `--warn-bg`, `--bad:#b3261e` on `--bad-bg`; specimen `--muted:#6f675b` and `--ink-2:#4a443b` as text on paper.
- Canonical instead: `color.ok-ink #14522A`, `color.warn-ink #6A4500`, `color.bad-ink #8C1D17`, `color.muted #5B5346`, `color.ink-2 #45403A`.
- Reason: specimen pairs are borderline at small sizes (ok-on-tint ≈ 4.3:1 by author computation); the darkened inks clear 4.5:1 for 11–12px status/meta text per C-A2 while keeping specimen hues. Grounds and edge colors are unchanged, so the workshop voice is intact.
- Serves: Direction attribute rationed-signal color + constraint C-A2; Lock L-03.

## EX-02 — Neutral kind chips (specimen departure)

- Departs from: specimen per-kind tinted chips (write blue, edit purple, bash amber, read gray, web green grounds).
- Canonical instead: all kinds use `trace-ticket.tool-kind-bg` (white) + `trace-ticket.tool-kind-border` (graphite) + `trace-ticket.tool-kind-text` (ink).
- Reason: tournament critic should-fix (reserve hue for status; D triplet discipline as model). Tinted kinds let category masquerade as state and break the grayscale-survival rule.
- Serves: Direction attribute saturated-color-means-status-or-diff; Decision D-10; Lock L-07.

## EX-03 — Impact-free numeral stack (specimen departure)

- Departs from: specimen `--cond` chain containing `Impact, Haettenschweiler`.
- Canonical instead: `font.numeral` system-condensed chain (Arial Narrow, HelveticaNeue-CondensedBold, Franklin Gothic Condensed, DIN Condensed, system-ui) with `font-stretch: condensed` on the grotesk stack as the primary mechanism.
- Reason: tournament repairable defect (condensed numeral fallback hazard) + C-P2 offline boot with zero network dependency; Impact is absent on Linux and inconsistent across macOS/Windows weights, so voice cannot depend on it.
- Serves: Direction typographic voice (jobs shout numbers) without a hostage face; Decision D-09.

## EX-04 — 44px floor on small controls (specimen departure)

- Departs from: specimen `.btn--small` 40px and `.chev` 40px.
- Canonical instead: `target.min` 44px applies to ALL interactive controls including small buttons and chevrons (`button.min-height`, `trace-ticket.disclosure-size`).
- Reason: approved carry-in from B (44px target discipline) + C-A4. Density comes from information compression, never target compression.
- Serves: Direction density attribute; Decision D-07; Lock L-08.

## EX-05 — Strip-spine label simplification at ≤480px (Direction detailing)

- Departs from: full spine labels (status word + counts + durations) shown at all widths in the specimen's desktop composition.
- Canonical instead: at ≤480px spine labels keep the status word, hide counts/durations (`spine-nav.label-sub` rule, D-03); carriage marker and collapse-note hidden; nodes remain tappable.
- Reason: repairs the 375px collision defect within a 375px column: status is state and persists, counts/durations are metadata and hide. The ticket-head rollup (D-11) carries the full state one tap away.
- Serves: Direction responsive attribute + repairable defect #1; Lock L-08 range.

## EX-06 — cmdout dark block retained as the single dark intent (scope clarification)

- Departs from: a reading of the system as strictly light-only.
- Canonical instead: `surface.cmdout-bg #211F1B` with `surface.cmdout-text #F0EAD9` is retained for Bash/test output blocks inside wells; there is NO full dark theme in this Run.
- Reason: the Direction explicitly reserves mono command output as the terminal-heritage accent (anti-default #5: light-capable grounds with mono rationed to evidence); scoping dark to the cmdout block preserves that accent while keeping the light-capable contract honest (validation warning W-1, accepted).
- Serves: Direction domain world (bench colors, command amber) and anti-default #5.

## EX-07 — Wing meta translated to footnotes ≤820px (composition detailing)

- Departs from: specimen behavior where right-wing meta sections simply stack below at narrow widths without a named pattern.
- Canonical instead: `evidence-wing.footnote-text` — density proof, static-mock disclaimers and capture notes re-render as labelled footnotes below the ticket stack (D-08).
- Reason: approved carry-in from B (margin-to-footnote translation); narrow widths translate chrome, they do not delete audit context.
- Serves: Direction system-potential responsive attribute; Decision D-08.

## Non-exceptions (explicitly NOT departures)

- Warm-neutral grounds, graphite rail, single accent edge, hairline tool rows, single expanded well, cite-back stamps, honest stub labels, sticky composer, jump-to-failure: all carried verbatim from the Direction and specimen grammar into tokens; no record needed because no value departs.
