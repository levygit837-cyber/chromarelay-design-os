# Work-Order Rail — Agentic Chat Prototype

Bootable React + TypeScript prototype of the **work-order-rail** agentic chat
Surface (spine-and-tickets workbench). Frontend only; all model traffic is
deterministic stub data — zero network after `npm install`.

## What renders

- **Left resume wing**: project groups + switchable sessions (incl. an empty
  project and an empty session), per-session composer draft/mode memory.
- **Spine navigator**: one node per assistant turn, slim ticks for user turns,
  status-coded nodes, scrub-to-turn, carriage marker, compression to counted
  groups at 20+ turns with jump-to-failure (30-turn fixture included).
- **Center work-order tickets**: numeral + role + status pill + duration, prose,
  ruled tool rows for Write / Read / Edit / Bash / WebSearch, one expanded
  inset well per ticket (diff / cmdout / excerpt / errorbox / staged), an
  empty-trace box where no tools ran, a failed ticket with attempt-keeping
  retry + dismiss-with-reason, and a running ticket with honestly-labelled
  staged stub progress.
- **Composer**: textarea + Plan/Act mode toggles + follow-up strip, optimistic
  echo that docks in under 300ms, sticky-bottom below 820px.
- **Right evidence wing**: Browser / Files / GitHub tabs per selected ticket
  with populated + empty + error views and a cite-back header
  (`Turn NN / Kind target`); tethered drawer sheets at narrow widths and
  footnote translation below 820px.

## Commands (from this directory)

```sh
npm install
npm run dev      # serve at http://localhost:5173
npm run build    # tsc + vite build -> dist/
npm run preview  # serve the production build at http://localhost:4173
```

## Stub model note

There is no backend and no live model. Sending a message runs a deterministic
local stub: optimistic echo → staged steps (`Working — step N of M in stub`)
→ docked ticket with succeeded tool rows. `Retry view` in error panels
re-runs the same local stub. A `?state=` query parameter deep-links every
state-matrix state for review (see the in-app state switcher bar).

## Reaching every state

Use the **Demo states** bar at the top of the page, or append `?state=<id>`:

| id | renders |
|---|---|
| `default` | populated session (all tool kinds, empty-trace, failed + retry) |
| `empty` | empty session (no messages, suggestions, focused composer) |
| `streaming` | starts a live stub run on the default session |
| `failed` | selects the failed turn (retry + dismiss-with-reason) |
| `long` | 30-turn session (compression + jump-to-failure) |
| `narrow` | forced 390px strip-spine preview (no viewport resize needed) |

Responsive breakpoints are explicit in `src/styles.css`: `1180px` (evidence
drawer), `820px` (sessions drawer + sticky composer + footnotes), `480px`
(strip-spine + rollup heads). Reduced motion is honored via
`prefers-reduced-motion` (pulse → static step, echo → instant dock).
