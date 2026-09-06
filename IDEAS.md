# Idea Inbox

Capture raw ideas with enough context to reproduce them weeks later.
Discussion and decisions happen in GitHub Issues; this directory is memory,
not a tracker.

## Layout

- `ideas/inbox/` — new captures, one file per idea.
- `ideas/considering/` — under discussion or scoped, one file per idea.
- `ideas/archive/` — closed (done/dropped) with a recorded reason.
- This file (`IDEAS.md`) — the index. One line per active idea, nothing more.

## Reading rules (context hygiene)

- Default: read only this index. It is one line per idea.
- Read a single idea file only when the user names it or triage reaches it.
- Search active ideas by filename/title (`ls` or `grep` over
  `ideas/inbox/` + `ideas/considering/` only). Never bulk-read idea files.
- `ideas/archive/` is excluded from default search. Consult it explicitly
  only when triaging a possibly-duplicate idea, and read just the
  Decision section.

## Capture template

New idea → `ideas/inbox/YYYY-MM-DD-slug.md` (slug from the title), then
append one line to the Active index below.

```markdown
# <Short title>

- Date: YYYY-MM-DD
- Status: inbox
- Context: what you were doing when the idea came up
- Problem: what hurts or could be better (before any solution)
- Idea: what, in 2-3 lines
- Sketch: how it could be done (or "unknown yet")
- Worth doing if: the criterion that would turn this into real work
- Open questions: unanswered questions
- Decision: (filled on close: done/dropped + reason + date)
```

## Lifecycle

`inbox → considering → scoped → doing → done | dropped`

- Move the file between directories on `inbox → considering` and on
  close (`→ archive/`). Track `scoped`/`doing` in the Status field and link
  the issue once real work starts.
- Close by moving to `ideas/archive/` with Decision filled (reason + date)
  and removing the index line. Never delete a closed idea: the recorded
  reason is what stops the same idea from being re-debated later.
- Triage ritual: at the start of a work session, read the index top to
  bottom. Each item has three exits: promote to a GitHub issue
  (`idea` label), keep with a review date, or close with a reason.

## Active index

### Inbox

| Date | Idea |
| ---- | ---- |
| _empty_ | _No ideas yet._ |

### Considering

| Date | Idea | Status |
| ---- | ---- | ------ |
| 2026-09-06 | [Pre-declared deliverable format on DesignRequest](ideas/considering/2026-09-06-deliverable-format-decision.md) | issue #26 |
