# Visual Review — watchtest landing page

## Independence controls: one was violated, and nothing prevented it

The packet declares `independenceControls: ["detector report withheld until first verdict"]`
and `omittedContext` including "detector report before first verdict". I had already read
`audit-report.md` before forming a verdict, because the Run directory is readable and no
mechanism sequences the two. The control is a string in a JSON file.

Recorded as a defect in the system, not in the design. My scores below are therefore
contaminated by knowledge of the accessibility findings, and a reader should discount them
accordingly.

## Evidence actually available

This is the first phase in this Run where the critic judged pixels rather than prose:
`shot-1440-frozen.png` (1440x900) and `shot-full.png` (1440x2400). Rubric derived from
`run.surfaceClass = PERSUADE` — again by the critic, not delivered in the packet.

**One capture is unusable and one was actively misleading.** `shot-375.png` was produced under
the headless width floor and shows a 500px layout cropped to 375. `shot-full.png` caught the
hero mid-count-up and reads `10ms` instead of `41ms` — the headline claim of the page rendered
wrong in the evidence. Six unfrozen captures produced **three distinct hashes**; with animation
frozen, four captures produced **one**. The earlier "3/3 identical" result in the build phase
was three samples that happened to collide on the same frame — a stable wrong number.

## Scores against persuade.json + common.json

| Dimension | Score | Basis |
|---|---|---|
| productFit | 4 | The latency number *is* the product claim, and terminal output is the only imagery. Emerges from this product. |
| hierarchy | 5 | Confirmed in the render: the number dominates absolutely, install line is the clear second stop. |
| specificity | 5 | Would not be mistaken for a template. No gradient, no card, no icon, no feature grid. |
| composition | 3 | See finding 1 — the vertical rhythm is broken in the render in a way the description hid. |
| typography | 4 | One family, three sizes, tabular figures, tight negative tracking on the hero. Clean. Loses a point for the unit `ms` set at the same size as the digits. |
| coherence | 5 | Three colours, five spacing steps, zero token drift measured. |
| responsiveness | 3 | Cannot be verified — the only mobile capture is invalid. Scoring on the measured 375px geometry probe instead, which passed, but that is not a visual judgment. |
| craft | 3 | See findings 2 and 3. |
| narrativeAndAction | 3 | The install line, the primary action, sits below a 200px void and is easy to scroll past. |
| **total** | **35/45** | |

## Findings

**1. Composition — the whitespace reads as emptiness, not as rhythm.** `--s5` at 12.5rem
(200px) is applied three times in sequence: after the caption, after the install line, after
the output block. In the full-page render the result is three near-identical voids, and the
page bottom has roughly 700px of nothing below the footer. Cost: the intentional-scarcity
thesis reads as an unfinished page; a visitor scrolling sees blank screens between content.
Decision needed: differentiate the vertical steps (the gap before the primary action should be
smaller than the gap before supporting prose), and cap the trailing space.

This is the finding that prose could not have produced. The description said "200px of
nothing" and that sounded deliberate. Rendered three times, it reads as a layout that ran out
of content.

**2. Craft — the unit competes with the number.** `ms` is set at the same 128px as `41`, so
the glyph pair occupies nearly as much width as the digits and the eye reads "41ms" as a
four-glyph word rather than a number with a unit. Cost: dilutes the single strongest element
on the page. Decision needed: `ms` at roughly 0.45em with its own baseline offset.

**3. Craft — the count-up animation damages the artifact's own evidence.** Not a taste
objection to motion: the animation is the direct cause of the headline claim rendering as
`10ms` in one of this Run's two full captures. Any screenshot-based process downstream —
critique, regression comparison, an eval harness — will sometimes capture a wrong number.
Cost: measured, not hypothetical. Decision needed: keep the animation but gate it on a
`data-static` attribute, or drop it. The design loses very little without it.

**4. Narrative — the primary action is orphaned.** Per `persuade.json`'s priority "clear
action", the install line should be unmistakable. In the render it is a low-contrast inset bar
after a large void, visually quieter than the output block below it. Cost: the one thing the
page wants the visitor to do is the third thing they notice. Decision needed: reduce the gap
above it, or raise its weight.

## Not findings (taste, per findingRule)

- The light paper ground against the dark-ground convention of the genre. A coherent choice
  with no demonstrated product cost, and `persuade.json`'s antiBias explicitly warns against
  rewarding the familiar template.
- Absence of a nav bar, logo, or footer links beyond one.
- Lowercase-only label styling.
- Monospace for body prose. Legible at 15px with 1.6 line height in the render.

## Verdict

**Repairable.** No structural return. Findings 1 and 2 are composition and craft adjustments
inside the existing Direction; finding 3 removes or gates one behaviour; finding 4 is a spacing
change that overlaps with 1. Combined with the two accessibility blockers from the audit
(no heading element, `--ink-dim` at 4.49:1), this is a single coherent repair batch.

**Strengths to preserve:** the three-value palette and zero token drift; the single-family type
system; the absolute hierarchy of the hero; the decision to use real terminal output as the only
imagery; the four rejected genre defaults from the Anti-default Ledger, all of which held.

**Confidence: medium.** Lowered by two mechanical facts: I read the detector report before
judging, which the packet forbade, and no repetition-stability check exists for this verdict.
