# Phase Packet

## Goal

## Scope

## Inputs

Every input is an address, never a concept name. One row per input:

| Name | Path | Status | Content hash |
|---|---|---|---|
|  |  |  |  |

`status` reports which root answered and whether a file is present:

- `resolved` — an Artifact an earlier phase of this Run produced; `path` comes from its `ArtifactRef`
- `canonical` — a contract under `.chromarelay/project/`, present
- `framework` — an installed framework file under `.chromarelay/system/`
- `run` — a file under this Run's own root
- `absent-optional` — an optional input with no match; `path` is null, proceed without it
- `absent-canonical` — a canonical contract that does not exist yet; the path is where it will live

## Unresolved inputs

Names of the inputs with no present file. Do not reconstruct them from memory: report the gap.

## Locks

## Open decisions

## Rubric

Path to the Surface rubric for this Run, relative to the framework root.

## Role authority

What this Role may decide and write.

## Skill Kit

- Primary:
- Supporting:

## Output contract

Explicit schema path and strictness.

## Acceptance evidence

## Exit policy

## Non-goals

## Omitted context

List context deliberately withheld for independence or relevance.
