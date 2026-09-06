# Constraint Draft — Agentic Model Chat Surface

Run: `create-20260906-issue20-chat` | Phase: grounding | Status: `proposed` | Producer: `product-strategist` | Date: 2026-09-06 | Language: EN-US

Sources: base prompt `.chromarelay/runs/create-20260906-issue20-chat/context/issue-20-base-prompt.txt`; Run Contract `.chromarelay/runs/create-20260906-issue20-chat/run.json`; request `.chromarelay/runs/create-20260906-issue20-chat/request.json`.

How to read: each constraint names its **Source** and its **Type**: `HARD FLOOR` (non-negotiable; later Roles MUST obey, override requires a Run decision) or `ASSUMPTION` (current working rule; later Roles MAY override with cited evidence). Run hard constraints are carried verbatim and are all HARD FLOOR.

---

## Technical constraints

- **C-T1 — Kit-only Skill loading; global skills disabled.** Source: `run.json` `hardConstraints` + `request.hardConstraints`. Type: HARD FLOOR. Implication: later Roles load only the kit primary skill; no global/harness skills.
- **C-T2 — HTML Direction specimens are reference-only visual artifacts; do-not-port-specimen-markup in the build.** Source: `run.json` `hardConstraints` + base-prompt acceptance criteria. Type: HARD FLOOR. Implication: specimens are recorded as artifacts and judged blind; the React+TS build is written fresh from the selected Direction.
- **C-T3 — Frontend only; no backend orchestration; model traffic stubbed.** Source: `run.json` `hardConstraints` (frontend only) + `scope.nonGoals` (backend orchestration, real model traffic stubbed) + base prompt. Type: HARD FLOOR. Implication: deterministic in-browser fixtures; no servers, handlers, or live model calls.
- **C-T4 — Bootable React plus TypeScript prototype in the Run folder via README plus npm install and dev command, with stubbed sessions, tool trace, and both sidebars present.** Source: base-prompt acceptance criteria. Type: HARD FLOOR. Implication: builder proves boot instructions; smoke test before handoff.
- **C-T5 — Real loading, empty, and error states ship in the prototype.** Source: `run.json` `hardConstraints`. Type: HARD FLOOR. Implication: fixtures MUST include running/streaming skeleton, empty session/message/view states, and a stub-failure state with retry; no dead controls.
- **C-T6 — Responsive 375px to 1440px.** Source: `run.json` `hardConstraints`. Type: HARD FLOOR. Implication: single-column drawer/tab behavior at 375px scaling to docked three-pane at 1440px; no horizontal page scroll; composer persistently reachable.
- **C-T7 — Run stays local: Run-local manifest only; no canonical promotion, no pull request, no merge.** Source: `run.json` `scope.nonGoals` + base prompt. Type: HARD FLOOR. Implication: all artifacts and code stay in the Run folder.
- **C-T8 — No billing surface or metering logic.** Source: `run.json` `scope.nonGoals` (billing). Type: HARD FLOOR. Implication: no paywalls, quotas, or usage accounting.
- **C-T9 — Typed artifact layout and timing observability dependencies respected (#16, #18) before specimens and code.** Source: base-prompt Blocked-by notes. Type: HARD FLOOR. Implication: coordinator sequences orchestration contract, timing, and artifact layout before build output.

## Legal constraints

- **C-L1 — Synthetic fixtures only; no real secrets, tokens, PII, or proprietary repo content.** Source: inferred from C-T3 stubbed-traffic + frontend-only (confidence: high). Type: ASSUMPTION (treat as floor unless a Run decision states otherwise). Implication: file paths, diffs, commands, and GitHub views use invented data.
- **C-L2 — Mock GitHub and browser views are static representations, not live integrations; avoid reproducing third-party brand assets beyond nominative labels.** Source: inferred from base-prompt GitHub/browser views + C-T3 (confidence: high). Type: ASSUMPTION. Implication: text/structural mocks only; no live API, no scraped content, no logo files.

## Accessibility constraints

- **C-A1 — Full keyboard operability: composer, follow-ups, mode toggles, session/project switching, sidebar-view tabs, and tool-trace disclosure are reachable and operable by keyboard with visible focus.** Source: proposed WCAG 2.2 AA practice for an OPERATE Surface (confidence: high). Type: ASSUMPTION (adopt as floor). Implication: semantic buttons/tabs, focus-visible styles, no keyboard traps in drawers.
- **C-A2 — Contrast floor: text and status indicators meet WCAG AA (4.5:1 body text, 3:1 large/status-adjacent graphics).** Source: proposed legal-usability floor (confidence: high). Type: ASSUMPTION (adopt as floor). Implication: tool status never conveyed by color alone; add label plus icon/text.
- **C-A3 — Screen-reader semantics: landmarks for the three panes, tab semantics for right-sidebar views, live-region announcement for streaming/failure status.** Source: proposed WCAG practice (confidence: medium). Type: ASSUMPTION. Implication: later Roles name regions and live behavior in surface architecture.
- **C-A4 — Reduced-motion support and 44px minimum touch targets for composer and disclosure controls.** Source: proposed platform practice (confidence: medium). Type: ASSUMPTION. Implication: Directions animate streaming/disclosure only with a reduced-motion fallback.

## Localization constraints

- **C-Loc1 — EN-US only for this Run; no i18n plumbing required.** Source: assignment (EN-US artifacts) + absence of locale requirements in the Run contract (confidence: high). Type: ASSUMPTION. Implication: hard-coded EN-US strings acceptable.
- **C-Loc2 — Fixture strings kept in isolatable stub data (not scattered literals) so future localization is not structurally blocked.** Source: proposed maintainability practice (confidence: medium). Type: ASSUMPTION. Implication: central stub/fixture module owns display strings.

## Performance constraints

- **C-P1 — Perceived stub latency under ~300ms for sends and view switches; longer fake streaming uses skeleton/progressive disclosure, never a frozen frame.** Source: proposed OPERATE-Surface responsiveness practice (confidence: medium). Type: ASSUMPTION. Implication: optimistic composer echo plus staged tool-trace reveal.
- **C-P2 — Zero network dependency at runtime; prototype boots and runs offline after `npm install`.** Source: inferred from C-T3 + C-T4 (confidence: high). Type: ASSUMPTION (extends hard floors). Implication: no CDN fonts/scripts required for function; no fetch paths in the build.
- **C-P3 — No horizontal page scroll at any width 375px–1440px; sidebars collapse to drawers/tabs rather than squeezing the reading column below legibility.** Source: extends HARD FLOOR C-T6 (confidence: high). Type: ASSUMPTION (behavior detail). Implication: surface architecture MUST specify the collapse rules per breakpoint.

## Constraint summary

| ID | Area | Type | One-line rule |
|---|---|---|---|
| C-T1 | technical | HARD FLOOR | Kit-only skills, globals disabled |
| C-T2 | technical | HARD FLOOR | Specimens reference-only, do not port markup |
| C-T3 | technical | HARD FLOOR | Frontend only, stubbed traffic, no backend/billing |
| C-T4 | technical | HARD FLOOR | Bootable React+TS prototype via README + npm install + dev |
| C-T5 | technical | HARD FLOOR | Real loading/empty/error states |
| C-T6 | technical | HARD FLOOR | Responsive 375-1440, no page h-scroll |
| C-T7 | technical | HARD FLOOR | Run-local, no promotion/PR/merge |
| C-T8 | technical | HARD FLOOR | No billing |
| C-T9 | technical | HARD FLOOR | Honor #15/#16/#18 sequencing |
| C-L1 | legal | ASSUMPTION | Synthetic fixtures only |
| C-L2 | legal | ASSUMPTION | Static GitHub/browser mocks, nominative use |
| C-A1 | accessibility | ASSUMPTION | Keyboard + visible focus throughout |
| C-A2 | accessibility | ASSUMPTION | AA contrast, status never color-only |
| C-A3 | accessibility | ASSUMPTION | Landmarks, tabs, live regions |
| C-A4 | accessibility | ASSUMPTION | Reduced motion, 44px targets |
| C-Loc1 | localization | ASSUMPTION | EN-US only |
| C-Loc2 | localization | ASSUMPTION | Strings isolated in fixtures |
| C-P1 | performance | ASSUMPTION | Under 300ms perceived stub response |
| C-P2 | performance | ASSUMPTION | Offline-capable after install |
| C-P3 | performance | ASSUMPTION | Collapse rules preserve reading column |

Overall constraint confidence: **high** — all HARD FLOORs are directly cited; ASSUMPTIONs are labeled with confidence and are reversible with evidence. No acceptance-blocking constraint question remains.
