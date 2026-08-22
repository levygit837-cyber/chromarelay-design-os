# Issue tracker: GitHub

Issues, implementation specs, Wayfinder maps, and tracer-bullet tickets for this repository live in GitHub Issues.

## Use by work shape

- **Known implementation route:** use `to-tickets` to create vertical tracer-bullet issues with explicit blocking edges.
- **Fog of war:** use Wayfinder only when the destination is known but material decisions cannot yet be specified. The map is a planning artifact; normal Createive Runs do not create a map by default.
- **Current conversation already contains the complete decision:** use `to-spec` to synthesize it without restarting discovery.
- **Small work that fits one context:** implement directly from a Run Contract or approved issue; do not create ceremonial tickets.

## Ticket conventions

Each implementation ticket must:

- deliver a narrow but complete and verifiable behavior;
- fit one fresh agent context;
- name genuine blockers only;
- use Createive domain vocabulary from `CONTEXT.md`;
- respect relevant ADRs and Locks;
- avoid stale file-path prescriptions unless a prototype encodes a decision more precisely than prose.

Use expand-contract for wide mechanical migrations that cannot land as independent green vertical slices.

## Wayfinder conventions

- map label: `wayfinder:map`;
- child labels: `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task`;
- claim a frontier ticket before work;
- use native sub-issues and issue dependencies when available;
- store each decision in its child issue and only a linked gist in the map;
- never resolve more than one non-research decision ticket in one session.

## Pull requests

Pull requests are implementation and review surfaces, not the primary request queue. Reference the parent Run or issue when one exists. Preserve the Run's Evidence and Promotion records in the repository rather than only in PR discussion.
