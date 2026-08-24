# Canonizing over an existing system

Reached when the Run already has tokens, components, or a DESIGN document on disk: REDESIGN, DOCUMENT, and any CREATE Run on a codebase with prior design state.

## Extend, do not restart

A valid existing system is the Run's baseline. Extend it: add the layers the Direction needs, rename nothing that components already consume, and keep the existing token names as the public surface even when you would have chosen different ones.

Replace a system only when the Phase Packet says to, or when a recorded Constraint makes the current one unusable. "An external Skill prefers another stack" is not that reason — a stack swap invalidates every component built against the old names, and that cost lands on the builder's Phase, not yours.

## Deliberate exception versus drift

The existing system contains both, and they look identical in the code. Separate them by evidence, and say which kind of evidence you used:

| Kind | Evidence that identifies it | What you do |
|---|---|---|
| Deliberate exception | A comment, a Lock, an ADR, a Decision record, or a repeated pattern with a stated reason | Preserve it, and carry it into the exceptions list with its original reason |
| Drift | A single-site value with no record, inconsistent with its neighbors | Propose the canonical value, and list the drift site so the repair is scoped |
| Historical accident | A value consistent with an older version of the system and nothing else | Propose the canonical value, and record what it used to serve |

Frequency is not intention. A value repeated across twelve files is evidence that it spread, not evidence that someone chose it. When you cannot tell which kind you are looking at, mark the Decision provisional and put the ambiguity in unresolved risks — a provisional Decision the Coordinator can resolve costs less than a wrong canonical value the next three Runs build against.

## Versioned drafts

When the Packet asks for a v2 system, v1 stays on disk intact. Write v2 alongside it, and state for each part of v2 whether it preserves, replaces, or extends the v1 part. That mapping is what makes the v2 system reviewable against the Preserve/Replace Matrix.

## Confidence ledger

For a DOCUMENT Run, every canonical claim you propose carries a confidence value and the evidence behind it. An uncertain choice stays provisional. The point of the Phase is that uncertain choices do not become silently canonical.
