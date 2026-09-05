---
name: chromarelay-art-direction
description: Generate coherent, product-specific creative Directions and visual specimens. Derive from domain, choose a compositional thesis, define typography, color, surfaces, motion, and a signature, examine category defaults, and hold divergence across candidates. Use during creative exploration, not final critique.
---

# Art Direction

A Direction is one thesis carried through every visual decision. A list of fashionable ingredients is not a Direction.

Your Phase Packet names which phase of this skill you are in. Phase-by-phase inputs, outputs, and exit conditions live in [`references/phases.md`](references/phases.md) — read it when the Packet's `phase` is anything other than a full Direction.

## Derive from the product

The domain comes before any visual choice. Explore, and write down what you find:

- objects and instruments the work uses;
- materials and light;
- environments and spatial relationships;
- vocabulary and metaphors practitioners already use;
- colors that occur naturally in the work;
- rhythms and behavior over time;
- the human task, and the emotional pressure around it.

This world is generative material, not a picture to copy. Carry it across as structure, proportion, rhythm, and behavior — the reading should feel like the domain before anyone can name why. When the crossing produces a literal depiction of a domain object, translate it one level further into a mechanism.

Exit: at least three materially different creative territories are on the table.

## Declare one coherent thesis

State the thesis in one sentence, then let it decide each field below. When a field cannot be traced back to the thesis, the field is wrong or the thesis is.

Difference without coherence is noise.

## Fill every field of the Direction

The output contract is `framework/schemas/direction.schema.json`. Each required field is a slot you fill from your own work:

| Field | What it holds |
|---|---|
| `thesis` | One sentence the rest of the Direction obeys |
| `productInterpretation` | What this product is, read through the lens |
| `domainWorld` | Three or more findings from the domain exploration |
| `composition` | Compositional model, hierarchy, and density |
| `typography` | Strategy: roles, scale logic, what carries voice |
| `color` | Strategy: what each value means, not a palette dump |
| `surfaces` | Surface and depth: how planes separate and why |
| `motion` | Motion thesis: what movement communicates |
| `signature` | The one identifying element (below) |
| `antiDefaults` | The ledger (below) |
| `systemPotential` | How this scales (below) |
| `risks` | What breaks if this Direction wins |
| `divergenceAxes` | Three or more axes on which this candidate differs (below) |
| `evidencePlan` | Which specimens will make each claim judgeable |

When the Packet's `inputs` include a reference analysis, also fill `referencePrinciples` with the transferable mechanisms and `nonTransferableReferenceElements` with what stays behind. References supply mechanisms; the product supplies the reason.

## Anti-default ledger

Name the choices this product category defaults to, before you design. For each one, record three things:

- why it is likely here;
- the conditions under which it remains the right answer;
- one alternative mechanism that serves the same job.

A common choice earns its place when the ledger shows it was examined and it is executed well. The ledger is a record of examination, not a ban list.

## Divergence

Your Packet assigns one lens. Commit to it for the whole phase, including the parts where another lens looks easier.

Peer candidates are withheld on purpose: 3-5 Directions are produced in isolated contexts so the comparison downstream measures the lenses rather than the order they were written in. Reading a peer candidate — from a run directory, a shared file, anything on disk — collapses the divergence the Run was built to buy, and it collapses silently, because the contamination is invisible in the artifact.

`divergenceAxes` is the check: name three or more axes on which this candidate differs from the category default and from the other assigned lenses. Axis means a structural dimension — compositional model, information density, motion role, surface logic, typographic voice. Five palettes over one layout is one axis, written five times.

## Signature

Define one identifying structural, visual, or interaction element that could belong only to this product. Say where it recurs, and what regulates its frequency so recurrence reads as a system rather than a tic.

## Visual specimens

Render the smallest set that lets someone else judge the thesis. Each specimen shows real structure at real density:

- the first view, with its hierarchy resolved;
- the signature, in place and in use;
- one central component;
- at least one non-happy state (empty, error, loading, or overflow);
- the typography and surface relationship at working density;
- responsive behavior, when the Surface makes it material.

Specimens carry the load that mood boards cannot: they are the evidence a critic will read instead of your reasoning. Real content, real lengths, real states.

## System potential

Show how the Direction extends to other Surfaces, longer and shorter content, every state, and each viewport. A strong hero with no component language is a poster, not a system yet.

## Output

Return the filled Direction, its `evidencePlan`, and the specimens the plan names. The Direction goes to a visual critic who sees the artifact without your identity or reasoning, and to a Coordinator who owns what happens next — so the artifact has to stand alone, and unsettled questions travel as text in the Handoff rather than as assumptions inside a field.
