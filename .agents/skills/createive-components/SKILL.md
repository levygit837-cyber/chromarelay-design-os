---
name: createive-components
description: Resolve component requirements against the existing codebase and component registry. Prefer reuse, composition, and extension before justified creation; define states, accessibility, tokens, responsive behavior, and provenance. Use before implementation or during system migration.
---

# Component Architecture

Do not invent a new component before understanding what exists.

## Resolution order

For each requirement:

1. use native HTML when sufficient;
2. reuse an existing project component;
3. compose existing components;
4. add a documented variant;
5. use an installed accessible primitive;
6. create a new component with justification.

Search code, Storybook/registry, props, stories, and usage before deciding.

## Resolution record

Record:

- requirement;
- chosen resolution: reuse, compose, extend, create;
- components/primitives involved;
- why alternatives were rejected;
- token roles;
- required states;
- responsive behavior;
- accessibility behavior;
- owner and scope.

## States

Consider default, hover, focus, active, disabled, loading, empty, error, success, permission, long content, overflow, and domain-specific states. Only require states relevant to the component contract.

## Interface quality

Prefer a small component interface hiding substantial correct behavior. Do not expose internal seams merely for tests. Test through the same interface callers use.

## Migration

For broad component replacements, use expand-contract:

- add new form beside old;
- migrate bounded call-site batches;
- remove legacy after no caller remains.

## Output

Produce Component Plan and contracts. Do not implement unless assigned Builder Role. Do not promote directly.
