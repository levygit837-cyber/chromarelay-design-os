# Tournament Report - Blind Visual Critic Two

## Verdict
**Repairable** - for the overall winner, **Candidate A** (Work-Order Rail). No common.json blocker applies to any candidate: A has an identifiable focal system (spine plus elevated ticket), obscures no product-critical task, supports every required state, has no major responsive failure, nothing generic, nothing incoherent. C's dead mode controls come closest to a blocker; steering stays available via composer and follow-ups, so it is a should-fix, not a blocker.

## Confidence
**Medium.** A and D tie on raw dimension counts (41 vs 41); the OPERATE priorities list (task clarity, hierarchy, state completeness) breaks the tie toward A - it exists for exactly this. A-vs-B is a genuine trade-off (operation vs refinement), not a measurement error.

## Per-candidate scores (scored alone, viewing order B, D, C, A as assigned)

| Dimension | B | D | C | A |
|---|---|---|---|---|
| productFit | 4 | 5 | 4 | 5 |
| hierarchy | 5 | 4 | 4 | 5 |
| specificity | 5 | 5 | 4 | 5 |
| composition | 5 | 4 | 4 | 4 |
| typography | 5 | 5 | 4 | 4 |
| coherence | 5 | 5 | 4 | 5 |
| responsiveness | 5 | 4 | 4 | 4 |
| craft | 4 | 4 | 3 | 4 |
| taskAndStates | 4 | 5 | 4 | 5 |

**Whole-before-parts.** B: attention flows headline, numbered claims, margin; reading order matches the task; the 72ch-article-plus-ruled-margin composition is the most refined whole of the four. D: WHO chips and failure board win attention; cite-back stamps make per-session evidence scoping visible; density deliberately split (calm center, dense wings). C: amber INTERRUPT and red failure counts win attention, correct for ops; mono-everywhere flattens levels; recognizable ops-board genre. A: 52px numerals and the spine win attention ('agentic time becomes navigable space'); exactly one ticket carries elevation, guarded explicitly.

**antiBias applied:** 'Do not punish deliberate density or reward empty marketing spaciousness in an operational tool.' Where it changed scores: kept **C composition at 4 not 3** (the ledger and inset wells are deliberate operational density; the deduction is for the colspan-hack failed row, not density) and held **B productFit at 4 not 5** (its near-empty 60px evidence rail is an operational cost, not spaciousness to reward). It also protected A's dense wings from a spurious deduction.

## Blockers
**None.** See verdict.

## Should-fix (winner A, ranked by cost)
1. **Claim-vs-built responsive details.** Note promises 44px targets but nodes are 26px (about 34px with padding), chevrons 40px, small buttons 40px; 'composer stays docked' is in-flow, not pinned. Cost: at 375px the primary steering control needs scrolling to find. Decision: pin composer bottom-sticky below 820px; raise all disclosure targets to 44px.
2. **Font-stack hazard in the signature.** The condensed stack falls back through Impact/Haettenschweiler; without Arial Narrow the 52px numerals - the ordering device - change voice. Decision: pin a real condensed webfont (offline-bundleable per C-P2) before build.
3. **No empty-session center rendering.** 'Empty kickoff draft' exists only as a rail entry. Cost: required empty state (T7) has no designed treatment in the strongest candidate. Decision: adopt B's colophon pattern (one line of intent, one next action).
4. **Compression rule stated, not demonstrated.** The 30-turn collapse note is a promise; six nodes are shown. Decision: build must render the collapsed state (counts plus addressable failures) before the pattern ships.

Loser should-fixes for the record: B - failed 'Note 5' lives only in the article body, never as a margin note, breaking B's own numbering rule; its three right views never render docked. D - responsive note contradicts itself (claims conversation-first at 375px; CSS stacks the left wing first). C - mode toggles are spans in topbar and composer: a product-truth control (T3) modeled as decoration.

## Pairwise winners
See comparisonTable. Evaluated in contract order, implementation risk last.

## Overall winner, confidence, trade-off
**Winner: A. Confidence: medium** (A/D tie on dimension counts, broken by priorities). **Trade-off accepted:** A's plain-grotesk register is less refined than B's editorial paper and less atmospheric than D's dossier; I accept spending B's superior surface craft in exchange for A's operational task clarity, hierarchy, and designed-for-scale resumption - the qualities OPERATE names first.

## What each loser did better (candidates to carry)
- **B:** gutter-to-footnote narrow-width translation; colophon empty-session state; tri-voice type discipline.
- **D:** cite-back stamping on every evidence view (A stamps only one); attempt-keeping on retry; widest in-place state coverage; kv-table GitHub annex.
- **C:** sticky-pinned composer at every width; inline exit codes; duration-column hiding to protect reading measure; promotion noise cap.

## Hybrid
**One identified move:** import C's sticky-bottom composer into A below 820px - it fixes A's top should-fix, is one mechanism, and does not touch A's signature. Beyond that, no hybrid: A's spine and B's margin are two different theories of where evidence lives; averaging them yields an incoherent third.

## System-potential risks
A: spine compression at 30+ turns unbuilt; tool-dense turns need grouped rows; elevation is a scroll state; 44px strip nodes must survive compression. B: summon fatigue under sustained verification; gutter overflow on tool-heavy turns. D: annex and ruled-paper noise grows with views. C: promotion logic is real behavior to build; dark-theme AA must survive theming.

## Unresolved
- No rendered 375px/1020px viewport in the packet; narrow-width behavior is described in notes plus media queries only. Would settle: rendered screenshots at 375 and 1020.
- B's docked evidence views (outside the sheet) never shown. Would settle: one wide render with a docked Files view.
- Live interaction (focus order, streaming pacing, retry timing) not observable statically. Would settle: prototype smoke run.
- Availability of a condensed numeral face across target platforms. Would settle: font-pinning decision in build.

## Blindness statement
No creator identity, creator reasoning, direction file, mapping, or eligibility report was opened; verdicts rest solely on the four rendered specimens plus product brief, constraints, and rubric. Transparency note: each specimen self-labels a direction name in its own banner/title - that is content of the judged artifacts, not a leak into my packet.