# Visual Specimens — three Directions

**Delivery form: prose.** The phase asks for "enough of each Direction to judge hierarchy,
signature, component language, and system potential", and the exit policy asks that
"eligible candidates have comparable evidence". No render capability is reachable from this
phase, so what follows describes how each Direction would look. This is recorded as a risk,
not smuggled in as a specimen.

---

## Specimen A — Instrument

Above the fold: a 640px column on warm paper. At the top, 13px mono label
`watchtest — test feedback loop`. Below it, `41ms` set at 128px in tabular mono, ink black,
baseline-aligned to the column. Under the number, 15px: `median time from save to verdict`.
Then 200px of nothing. Then the install line, selectable, with a copy affordance that is a
word (`copy`) not an icon. Below the fold, three short paragraphs, no headings, no cards.

- **Hierarchy:** extreme. One element carries 90% of the visual weight.
- **Signature:** the number set larger than any landing page normally sets a number.
- **Component language:** almost none — label, number, paragraph, install line. Four things.
- **System potential:** high for metric surfaces, low for surfaces without a headline number.
- **Risk:** on a 375px viewport, 128px type leaves room for four characters. `1240ms` would
  break the composition. The Direction depends on the number staying short.

## Specimen B — Split Ledger

Desktop: viewport-height split, 45/55, warm dark ground. Left column, in Inter: a short
line of prose naming what the developer did (`you saved a test file`), set 32px, and below
it two sentences of explanation at 16px. Right column, inset one step darker, in Plex Mono:
five lines of real `watchtest` output, aligned, with the pass line in amber. A hairline runs
floor to ceiling between the columns with an amber tick at the vertical midpoint. Mobile:
left stacks above right, hairline becomes horizontal, tick stays.

- **Hierarchy:** two co-equal poles held by the rule. No single dominant element.
- **Signature:** the full-height rule with the tick.
- **Component language:** prose block, output block, rule, copy button. Extends cleanly.
- **System potential:** highest of the three — cause/effect is a reusable structure.
- **Risk:** the 45/55 split is the weakest divergence claim; at a glance it reads as a
  conventional two-column hero. The distinction lives in the type-family rule, which is a
  detail, not a composition.

## Specimen C — Trace

Four full-bleed bands, each 70vh, cool near-black. Band 1: lowercase Space Grotesk heading
at 56px, tight tracking, `save the file`. A 2px trace line sits at the top edge of the band,
dim green, brightening left to right as the band enters view. Band 2: `pick the tests`, with
three mono lines showing selection. Band 3: `run them`, output block. Band 4: `41ms`, and
the install line. Content inset 8vw with no max-width, so on 1440px lines run long.

- **Hierarchy:** sequential rather than spatial — no element dominates, the order does.
- **Signature:** the trace line and the dim→live color ramp.
- **Component language:** band, heading, output block, trace. Clean and repeatable.
- **System potential:** high for process surfaces, awkward for dense reference surfaces.
- **Risk:** four bands at 70vh is 280vh of scroll for a page whose stated job is a 30-second
  decision. The structure fights the product task. Also: no max-width means measure exceeds
  90 characters at 1440px.

---

## Risk notes (all Directions)

1. **No render exists.** Every judgment above is about a description. Hierarchy, composition
   and typography — the three heaviest rubric dimensions — cannot be assessed from prose.
2. **Same author for all three.** The eligibility and tournament phases will compare three
   specimens written by one context in one pass. Voice, vocabulary and pacing are shared, so
   anonymization cannot work as designed.
3. **C has a stated conflict with the product task** (280vh vs 30-second decision). This is
   the kind of blocker `direction-eligibility` exists to catch, and it is being reported here
   because no executor for that gate exists.
