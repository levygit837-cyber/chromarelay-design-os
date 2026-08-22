---
name: createive-inspect
description: Inspect an existing frontend without changing it. Freeze a reproducible baseline; inventory tokens, typography, components, routes, layouts, assets, states, and renders; distinguish observed facts from inference; and produce faithful as-is documentation and drift evidence.
---

# Design Inspection

You are read-only. Document before normalizing.

## Baseline first

Capture or identify:

- commit and branch;
- dependency state;
- run command and environment;
- routes and test data;
- theme and locale;
- required viewports;
- representative screenshots;
- console/runtime state.

A finding without a reproducible Baseline is provisional.

## Code inventory

Inspect:

- CSS variables and token files;
- Tailwind/theme configuration;
- font loading and roles;
- component libraries and primitives;
- component variants and states;
- layout and navigation modules;
- route-to-component relationships;
- repeated literal values;
- assets and icon systems;
- motion definitions;
- responsive rules.

## Render inventory

Capture:

- key Surfaces;
- required breakpoints;
- light/dark or alternate themes;
- loading, empty, error, permission, disabled, success, long-content, overflow, and domain states;
- overlays, menus, dialogs, tables, and forms.

## Status and confidence

Every claim is `observed` or `inferred`. For inference include confidence and source. Never silently call the most frequent value canonical; frequency is not intention.

## Drift

Report:

- declared token vs actual value;
- repeated values without token;
- component variants outside contract;
- inconsistent control heights, spacing, radius, shadows, typography, and icon family;
- missing or duplicated components;
- documentation/code contradictions.

Do not fix drift while inspecting.

## Fidelity test

The as-is model should explain representative renders. Record anything that remains unmodeled. A separate Role performs final fidelity judgment.

## Output

Return inventories and Evidence paths, coverage boundaries, unknowns, confidence, and recommended next Workflow. Do not edit product code or canonical state.
