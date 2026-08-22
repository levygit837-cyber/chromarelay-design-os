---
name: createive-systemize
description: Convert a selected creative direction into an operational design contract: DESIGN.md grammar, DTCG-style primitive/semantic/component tokens, scopes, Locks, motion, responsive rules, exceptions, and validation. Preserve the chosen direction rather than averaging it into generic defaults.
---

# Design System Canonization

Translate creative intent into a system without flattening it.

## Inputs

Require:

- selected Direction;
- Product and Constraints;
- Surface class and known variants;
- existing tokens/components when applicable;
- tournament and risk notes.

Do not canonize an unselected candidate.

## Three token layers

1. **Primitive**: raw color, space, size, radius, typography, elevation, motion.
2. **Semantic**: purpose such as text-muted, action-primary, surface-elevated, stack-section.
3. **Component**: button, dialog, sidebar, table, field, and domain component roles.

Components consume semantic/component tokens, not arbitrary raw values.

## Semantic spacing

In addition to primitive scales, define roles:

- inline;
- stack;
- cluster;
- control padding;
- card padding;
- section gap;
- page gutter;
- content measure.

Do not use one numeric scale as the complete explanation of spatial behavior.

## DESIGN.md

Record thesis, product relationship, composition grammar, typography roles, color/surfaces, shape/spacing, motion, signature, Surface variants, contextual do/avoid guidance, and exceptions.

Exact canonical values belong in tokens; prose explains why and application.

## Locks and ranges

Lock decisions that define identity or consistency. Prefer ranges and principles where local creativity is valuable. A Lock states scope and reopening conditions.

## Existing systems

Extend a valid existing system. Do not replace it because an external Skill prefers another stack. Preserve deliberate exceptions.

## Validation

Check:

- broken references;
- contrast pairs;
- light/dark intent;
- token orphans;
- missing typography roles;
- component state completeness;
- conflicts with Locks;
- exportability.

## Output

Produce Run drafts only. Return proposed Decisions, token paths, validation Evidence, exceptions, and unresolved risks. The Coordinator handles Promotion.
