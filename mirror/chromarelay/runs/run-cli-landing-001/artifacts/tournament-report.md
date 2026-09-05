# Tournament Report — Directions A / B / C

## What this critic actually received

The Phase Packet supplied `inputs: ["Product Brief", "anonymous specimens", "Direction
contracts"]` as three concept names. No path, no content, no rubric path. To judge at all I
had to locate the artifacts myself by searching the Run directory — which is precisely the
context contamination the system's own `context-policy.md` forbids, and it broke the
anonymization: the specimen file is one document with the three Directions labelled A, B, C
and a shared authorial voice.

The rubric was found at `framework/rubrics/persuade.json` by deriving it from
`run.surfaceClass = PERSUADE`. Nothing in the packet pointed there. Recorded as a defect,
not as a workaround.

**What is being judged is prose.** Of the eight `common.json` dimensions, three (hierarchy,
composition, typography) are properties of a rendered artifact and are being scored from
descriptions of one. Those scores are estimates of intent, not observations.

## Independent scoring, before comparison

Scale from `common.json` (1-5). Priorities from `persuade.json`: memorability, narrative
rhythm, identity, image treatment, clear action.

| Dimension | A Instrument | B Split Ledger | C Trace |
|---|---|---|---|
| productFit | 4 | 4 | 2 |
| hierarchy | 5 | 3 | 3 |
| specificity | 4 | 3 | 4 |
| composition | 4 | 3 | 3 |
| typography | 4 | 4 | 3 |
| coherence | 5 | 4 | 4 |
| responsiveness | 2 | 4 | 3 |
| craft | 4 | 3 | 3 |
| narrativeAndAction (PERSUADE) | 3 | 4 | 3 |
| **total** | **35** | **32** | **28** |

## Findings

**C — blocker, `productFit`.** 280vh of scroll for a surface whose stated task is a
30-second fit decision. Cost: the install command, the primary action, sits at the bottom of
four viewport-height bands. Decision needed: either compress to two bands or drop the
Direction. This matches the `common.json` blocker "product-critical task is obscured".
`direction-eligibility` should have removed C before this tournament; it has no executor, so
C arrived here and I am removing it.

**A — blocker risk, `responsiveness`.** 128px type on a 375px viewport fits roughly four
characters. The composition is load-bearing on the number staying short, and `1240ms` breaks
it. Cost: the hero fails on the smallest required viewport. Decision needed: a declared
clamp and a stated maximum digit count. Not fatal — it is a repairable constraint, not a
structural flaw — but it must become an explicit contract term, not an assumption.

**B — weakness, `specificity`.** A 45/55 split with dark ground is the most conventional
composition of the three; its distinction rests on the sans/mono functional rule, which is a
detail rather than a composition. Per `persuade.json` antiBias I am *not* rewarding B for
being easy to scan, and I am not penalising A for being unusual.

**Not findings (taste, per `findingRule`).** A's light ground against the dark-ground genre
convention. C's lowercase headings. B's amber accent. Each is a coherent choice with no
demonstrated product cost.

## Verdict

**Selected Direction: A — Instrument**, with one mandatory contract term carried forward:
a typographic clamp and a declared maximum digit count for the hero number.

Margin over B is 35 vs 32 on a 45-point scale — 3 points, inside what I would call noise for
prose-based judgment. Per the escalation rule for material ties this is close enough to
warrant a human look. I select A rather than escalate because the deciding factor is not the
aggregate: it is that A's weakness is a bounded repairable constraint while B's is structural
genericness, which repair does not fix.

## Reliability of this verdict

Low. Three reasons, all mechanical rather than about judgment:
1. No render — three of eight dimensions were scored from description.
2. Anonymization failed — one author, one document, shared voice.
3. Repetition stability was never measured. This tournament ran once and no mechanism exists
   to check whether the same input yields the same verdict.
