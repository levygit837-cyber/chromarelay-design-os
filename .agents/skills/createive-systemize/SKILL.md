---
name: createive-systemize
description: Convert a selected creative Direction into a draft design contract — DESIGN.md grammar, DTCG-style primitive/semantic/component tokens, scopes, proposed Locks, motion, responsive rules, exceptions, validation. Use when canonizing a fresh Direction, drafting a versioned v2 system, or separating canonical core from drift in an existing system.
---

# Design System Canonization

Translate creative intent into a system that still reads as that intent. The Direction is the input specification, not a starting suggestion.

## Preconditions

Work from these inputs:

- the **selected** Direction, named as selected in the Phase Packet;
- Product and Constraints;
- Surface class and known variants;
- existing tokens and components, when the Run has them;
- tournament and risk notes.

If the Packet names no selected Direction, or names more than one, stop and return that as the unresolved item. Canonizing a candidate the tournament did not select spends the Run's whole selection step for nothing.

If the Run carries an existing system (REDESIGN, DOCUMENT, or any Run with tokens already on disk), read [`references/existing-systems.md`](references/existing-systems.md) before drafting.

## Output contract

Your Phase produces exactly these parts, in this order:

1. **Draft artifacts** under the Run: DESIGN draft, token files, component principles.
2. **Proposed Decisions** — each one states the choice, the Direction attribute it serves, and its scope.
3. **Proposed Locks** — each one states scope and reopening conditions.
4. **Token paths** — where each drafted file lives, so the next Role reads rather than guesses.
5. **Validation Evidence** — the report from the checklist below, errors and warnings both.
6. **Exceptions** — every value that departs from the system, each with the reason it departs.
7. **Unresolved risks** — each with a confidence value.

Everything you write lands under the Run. Canonical state changes later, by Promotion, performed by the Memory Curator — your parts 2 and 3 are the input to that, which is why an exception you leave out of part 6 becomes an invisible precedent the moment it is promoted.

## Three token layers

1. **Primitive**: raw color, space, size, radius, typography, elevation, motion.
2. **Semantic**: purpose — `text-muted`, `action-primary`, `surface-elevated`, `stack-section`.
3. **Component**: button, dialog, sidebar, table, field, and the domain component roles this product actually has.

Components consume semantic and component tokens. A raw primitive reaching a component is a defect the validation step reports.

## Semantic spacing

A numeric scale gives sizes; these roles give spatial behavior. Fill every slot:

- inline;
- stack;
- cluster;
- control padding;
- card padding;
- section gap;
- page gutter;
- content measure.

## DESIGN.md draft

Prose explains why and where to apply. Exact canonical values live in tokens, cited from the prose by token name. Fill every slot:

- thesis;
- product relationship;
- composition grammar;
- typography roles;
- color and surfaces;
- shape and spacing;
- motion;
- signature — the one element that makes this system recognizable;
- Surface variants;
- contextual do/avoid guidance;
- exceptions.

## Locks and ranges

Lock what defines identity or cross-Surface consistency. Leave a range or a principle where local creativity improves the result — a range says which axis is free and how far.

Every proposed Lock carries scope and reopening conditions. A Lock without reopening conditions cannot be honored later, because the next Run cannot tell a violation from an expiry.

## Validation

Run the checks and report each one by name, including the ones that pass:

- broken token references;
- contrast pairs;
- light and dark intent;
- token orphans;
- missing typography roles;
- component state completeness;
- conflicts with existing Locks;
- exportability.

Zero errors is the gate. Warnings pass only when the report says accepted or resolved, with which.

## Under pressure

The Direction survives contact with implementation difficulty. When drafting gets hard, these are the arguments that show up:

| The thought | What it actually costs |
|---|---|
| "This spacing is unusual, the 8pt scale is safer" | The Direction won the tournament on its composition; averaging it to defaults discards the evidence that selected it |
| "An external Skill recommends a different stack" | A valid existing system is the Run's baseline; replacing it on a Skill's stack preference invalidates every component already built against it |
| "This exception is small, it needs no record" | An unrecorded exception is promoted as intentional, and the next Run reads it as the rule |
| "The contract is close enough to validate later" | The next Role builds against your draft; a conflict you leave in becomes their rework, discovered at audit |

Red flags in your own draft: a token value that appears in no Direction attribute; a Lock with no reopening condition; a spacing slot filled with the primitive scale instead of a role; "TBD" where a Decision belongs; a validation report with only passes listed.
