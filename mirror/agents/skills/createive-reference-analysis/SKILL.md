---
name: createive-reference-analysis
description: Analyze websites, screenshots, videos, HTML, or design outputs as evidence. Extract transferable design grammar, interactions, assets, typography, spacing, motion, and composition while separating non-transferable identity and originality risks.
---

# Reference Intelligence

A reference is evidence and a source of possibilities. It is a specimen to explain, not a brief to satisfy and not a layout to reproduce.

Two failures define the work. **Under-extraction** ships an adjective ("clean", "premium") where a mechanism belongs. **Over-transfer** carries the source's identity along with its grammar. The Reference Pack is the artifact that resists both: every principle in it names a mechanism, and every principle carries an originality classification.

## Capture

Capture first, claim second. A claim whose artifact you never captured is `proposed`, not `observed`.

Each line below is conditional on an observable property of the source. Take the ones whose predicate holds:

- full-page render — always;
- section-level crops at readable scale — always, one per distinct compositional region;
- responsive states — if the source reflows, at the breakpoints where it changes;
- interaction states — if an element responds to hover, focus, press, or input;
- motion frames or timeline — if anything animates or transitions;
- source HTML/CSS/JS — if the source is reachable live or shipped as code;
- asset map — if the source carries images, icons, video, or fonts;
- original prompt and generation metadata — if the source is a generated design output.

When a predicate holds and the capture fails anyway, that failure is an `unresolved` entry naming what stayed unobserved. A gap you declare bounds the Run's confidence; a gap you leave silent inflates it.

## Extract transferable grammar

For each dimension below, state the mechanism and the condition under which it works. "Generous whitespace" is an observation; "single-column measure held near 65ch so the eye returns to a predictable left edge" is a mechanism.

- information hierarchy;
- compositional model;
- spatial rhythm and density;
- typography roles and relationships;
- color and surface strategy;
- component relationships;
- motion mechanisms and timing roles;
- responsive transformations;
- content realism;
- recurring invariants versus stochastic choices.

Distinguish the invariants from the stochastic choices explicitly. An invariant repeats across sections and survives transfer. A one-off that appears in a single hero is a choice the source made, and reporting it as grammar sends the next phase chasing an accident.

## Separate non-transferable elements

Record, for each, why reuse would read as the source rather than as your product:

- brand and copy;
- distinctive assets;
- full compositions strongly identifying the source;
- unique sequences;
- proprietary interaction or content;
- elements whose reuse would become imitation.

## Originality matrix

Classify every proposed transfer into exactly one band:

| Band | Meaning | Consequence for the Run |
|---|---|---|
| common grammar | conventional across the category | transfer freely |
| adapted principle | mechanism kept, expression rebuilt | transfer with the adaptation recorded |
| distinctive overlap | recognizable as the source | transfer only with an explicit accepted trade-off |
| identical asset/content | the source's own material | not transferable |
| unresolved risk | evidence insufficient to place it | escalate as `unresolved` |

A strong originality claim in either direction needs evidence from the source *and* from the candidate. With evidence from only one side, the band is `unresolved risk`.

## Output contract

Produce a Reference Pack with these parts, in this order. Every part is a required slot; a slot with nothing in it says "none found", never nothing.

1. **Source inventory** — each reference, its type, what was captured, what was not.
2. **Transferable principles** — mechanism plus operating condition, one entry per principle.
3. **Invariants versus stochastic choices** — the split, with the evidence that decided each.
4. **Non-transferable list** — the source's identity, with the reason reuse would read as imitation.
5. **Interaction map** — states and transitions observed, and the trigger for each.
6. **Asset map** — assets by kind and licensing or provenance status where observable.
7. **Originality risks** — the matrix, every proposed transfer banded.

The Pack expands the Run's option space; it does not narrow it. Ranking references or naming a favored Direction costs the Run its blind tournament — a Direction that arrives pre-endorsed by the reference evidence can no longer be judged independently against its peers. Report what each reference makes possible and let the tournament decide.
