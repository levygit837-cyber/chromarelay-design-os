# Audit Report — create-20260906-issue20-chat / deterministic-audit

## Target and environment

- Target: `.chromarelay/runs/create-20260906-issue20-chat/prototype/chat-prototype` (read-only; nothing written).
- Commit (pinned before first command): `7890496a2503f47ca475e9f7e80c6ee949d09516`; working tree clean (`git status --porcelain` empty in repo root and prototype dir).
- Toolchain: node v24.19.0, npm 12.0.2, `package-lock.json` present. Build: `npm run build` = `tsc -p tsconfig.json && vite build`. Targeted test: `node ./check.mjs`.
- Server: hub-managed `preview-4179` serving prototype `dist/` at `http://127.0.0.1:4179` (auditor started and stopped no server). Bundle `dist/assets/index-DhEUt5WJ.js` (186339 B served), CSS `dist/assets/index-8Wx6gRn_.css` (19950 B served), 40 modules transformed.
- Browser: none available — all runtime assertions via curl + served-bundle/stylesheet reads. Viewport/device-scale: not-run (no rendered capture). Fonts: system stacks only (grotesk/mono/Arial-Narrow condensed chain, Impact excluded); no webfonts to resolve. Theme: light workbench grounds + single dark cmdout block. Locale: EN-US (`index.html` lang `en-US`). Seed data: stub fixtures (`s-checkout` 4 turns, `s-long` 30 turns, `s-empty` 0 turns; `p-atlas` / empty `p-sidecar`). Reduced motion: `prefers-reduced-motion` block present in CSS; live value not-run.

## Build and runtime

Gate `build-health`: **pass**.

- `npm run build` re-run by the auditor in the prototype dir: tsc clean (no type errors), vite built 40 modules, EXIT 0. Output bytes identical to the prior build log (`index-DhEUt5WJ.js` 186.19 kB, `index-8Wx6gRn_.css` 19.95 kB).
- `node ./check.mjs`: CHECK OK on dist bundle reference, boot seams, README commands, component seams, no-specimen guard. EXIT 0. No `*.test.*` / `*.spec.*` files exist; `check.mjs` is the target's only configured check and it passes.
- Runtime routes on preview-4179, all HTTP 200: `/`, `?state=default`, `?state=empty`, `?state=streaming`, `?state=failed`, `?state=long`, `?state=narrow` (plus `?state=nosessions` and unknown `?state=bogus`, both 200, SPA fallback).
- Served-bundle seam assertions (curl + grep, all PASS): spine landmark (`Session progress`), all 5 tool kinds (Write/Read/Edit/Bash/WebSearch), retry + dismiss with reasons (obsolete/duplicate/wont-fix, attempt labels), live regions (`Turn status`/`Turn errors` with `role=status`/`role=alert` verified in minified encoding), cite-back (`Attachment`, `tethered`), empty-trace (`No tools ran this turn`), composer modes (`Message composer`), tabs (Browser/Files/GitHub), 30-turn compression (`batch-`, `Turns `, `grouped`), jump-to-failure, suggestions, step text, `aria-expanded`/`aria-pressed`/`aria-selected`/`aria-current`/`aria-modal`, sheet tethers, footnotes, empty/error/recovery strings (`No browser excerpt`, `No files cited`, `No GitHub activity`, `Retry view`, `Show ticket`). (Exact-case probes `Turns 03` / `Step 2 of 4` miss on case/format only; content verified present as `Turns 03–11`-style padded labels and `step 2 of 4` stub text.)
- Browser console: not captured (no driver). No failed requests observed (every probed route and both hashed assets 200). Recorded under unresolved, not as a pass.

## Semantics and accessibility

Gate `accessibility`: **warning** (2 automated-from-source findings; manual checklist not-run).

Automated-from-source verification (all observed in source):
- Landmarks: top-level `header.banner` (implicit banner), `nav` spine named `Session progress`, `main` named `Conversation`, `aside`s named `Sessions`/`Evidence`, `form` named `Message composer`, `tablist`/`tab`/`tabpanel` with `aria-selected`/`aria-controls`/`aria-labelledby`, `dialog` with `aria-modal=true` named by tether + title, `progressbar` with value/label, `div[role=status]` + `div[role=alert]` always mounted, skip link to `#ticket-stack`.
- Keyboard/focus machinery: spine ArrowUp/Down/Home/End; wing tabs ArrowLeft/Right/Home/End with activation-selects; Esc closes the sheet; Tab focus trap in sheets; focus returns to opener (`openerRef`); background `.banner`/`.workbench` set `inert` while any sheet is open; session switch moves focus to the stack heading; every button/chevron/tab/session-item/mode/follow-up meets 44px min-height; `:focus-visible` 3px ring plus selected-ring; dismiss radios grouped in `fieldset`/`legend` with required-reason gate; composer textarea has a visible label (never placeholder-only) with Cmd/Ctrl+Enter.
- Contrast (computed from primitive values, WCAG 2.x formula): body ink/paper 15.85; ink-2/paper 9.18, ink-2/card 10.09, ink-2/wing 8.48; muted/paper 6.78, muted/card 7.46, muted/well 7.08; ok-ink/ok-bg 8.03; warn-ink/warn-bg 7.33; bad-ink/bad-bg 7.47; inverse 15.85; cmdout text/bg 13.69; accent/paper 7.04, accent/card 7.74; diff-add 7.74, diff-del 8.39; status edges on card 5.30–6.43 (non-text UI). Minimum over all pairs 5.30 — every pair clears AA.
- Status is color + glyph + word everywhere (pills, tool rows, file rows, spine labels); kind chips neutral; no `<img>` (no alt needed); no fetch/XHR/WebSocket (offline stub holds); no specimen vocabulary in CSS/App.
- W-A11Y1 (warning): duplicate tab/panel IDs when the attachment sheet is open — `wing-tab-browser/files/github` and `wing-panel-*` render in both the docked wing and the sheet (EvidenceWing §onKeyTab/aria). Rule: unique IDs backing tab wiring. Location: EvidenceWing.tsx:261/:276 via App.tsx:622 + sheet slot. Observation: `querySelectorAll('#wing-tab-browser').length === 2` with ambiguous `aria-controls`. Reproduction: open the attachment sheet (?state=narrow + ticket select) and count the IDs.
- W-A11Y2 (warning): `ul.tool-list > div.tool-slot > li` — div wrappers break the ul content model. Rule: list semantics. Location: Ticket.tsx tool-slot wrapper (display:contents, styles.css:233). Observation: visual output unchanged, AT list semantics broken. Reproduction: read Ticket.tsx ToolRow call site.
- Manual checklist (all manual-not-run, no browser): keyboard reachability/order, focus visibility against actual backgrounds, focus-trap behavior under Tab, Esc layering, heading outline in a live tree, accessible-name quality in SR, error association, reduced-motion live behavior, live-region announcement flooding. Listed under unresolved.

## Tokens and component contracts

Gate `token-drift`: **warning** (no contradicting literal; only missing-token warnings).

- All color literals live in `:root` and match primitives exactly (paper/paper-deep/card/well/ink/ink-2/muted/line/hair/graphite/ok triad/warn triad/bad triad/accent/cmdout/diff/scrim, lowercase form of the same values); `tokens.ts` mirrors them. Elevation shadow `0 10px 30px rgba(26,24,21,0.16)` equals `elevation.active`; pulse `1600ms cubic-bezier(0.2,0.7,0.3,1)` with opacity steps 1→0.45→1 equals `motion.pulse`; radii 0/2px/999px equal none/sm/round; numeral 52px/strip 38px with condensed stretch; letter-spacing 0.14/0.10/0.08/−0.01em match eyebrow/pill/meta/numeral tracks; type sizes 16/15/14/13/12/11.5/11/10.5 match header/body/body-sm/control/mono/eyebrow/meta/micro/label/hint; 44px floors, 5px edges, 2px rail/composer frame, 3px ring, 30/26px nodes, 268/340px wings, 92/76px spine columns, 70ch measure all resolve. Echo dock timer 180ms sits under the 300ms `feel.echo` ceiling. 18px gaps (stack, project groups, composer offset) sit inside the `gap.section-gap` 18–24 range. `--focus-ring` is declared twice with the identical value (harmless).
- W-TD1 (warning, missing-token class): z-index literals (60/40/42/41/20/15), 420px sheet cap, 16px chevron glyph, 55% skeleton width, 6px spine/carriage paddings have no canonical equivalent; observed order matches the contract z-order. Rule it would need: `z.*` / `dialog.sheet-max-width` / chrome-metric tokens. Locations in findings. Reproduction via the grep command recorded there.
- W-TD2 (warning): `.btn` vertical padding 10px vs `button.padding-y`→12px; 44px floor preserved, no contract breach.
- Component contracts (facts for owning phases; no gate decision here): all 20 plan records resolve to implemented code — SpineNavigator (+ strip as CSS variant, matching the `extend` resolution), WorkOrderTicket, ToolTraceRow, ExpandedWell (diff/cmdout/excerpt/errorbox/staged/queued-note), StatusPill, SessionSidebar, EvidenceWing + Browser/Files/GitHub views, EmptyFrame (9 call sites), Composer + ModeToggle + FollowUpList, RetryDismissActions, DrawerSheet (sessions/attachment/dismiss), FootnoteBlock, LiveRegion. No near-duplicates (one implementation per requirement; no registry existed to collide with). Two contract-consistency observations: (a) `CiteBackStamp` (SC-9 shared fragment) is exported with zero call sites — wells, wing header, and footnotes stamp cite lines inline in three wordings instead of through it; (b) `void changed;` dead statement in EvidenceWing FilesPanel and the `≤1180px` rule hiding `.spine .tool-duration/.node-duration` classes that do not exist in markup (vacuously satisfied, rule ineffective). Single-sheet state means dismiss replaces rather than stacks over the attachment sheet (SC-8 stacking never manifests with more than one layer).

## Responsive geometry

Gate `responsive-geometry`: **pass** (asserted from stylesheet rules + served HTML; live viewport measurement unresolved).

- Breakpoints present: default 1440 docked grid `268px 92px minmax(0,1fr) 340px`; `@media 1180px` evidence drawer (right wing off, grid `268px 76px 1fr`); `@media 820px` left drawer + sticky composer + footnotes + right-over-left sheet z-order; `@media 480px` strip-spine (sticky top, carriage hidden, 26px dots, rollup heads, durations hidden, prose unshrunk at body size, sheets full-width-minus-gutters) down to 375px; `force-narrow` class mirrors the strip rules for the `?state=narrow` demo, which serves HTTP 200.
- Invariants present: I-1 no h-scroll (`overflow-wrap:anywhere` on targets/cites/footnotes, ellipsis file paths, internal `overflow-x:auto` on diff/cmdout, internally-scrolling follow-up row, sheets `100vw − 24px`); I-2 keep-status/hide-duration (durations/subline/head-side pill off ≤480px while rollup pill + status words persist); I-3 sticky composer ≤820px (sticky bottom, z-20 under sheets); I-4 compression + jump-to-failure at 20+ turns (implemented in SpineNavigator, fixture-proven by the 30-turn session); I-5 one elevation (single `selectedNo` per session); I-6 tethered evidence (cite kicker/line/scope in well, wing, sheet tether, footnotes); I-7 44px targets at every width (chevrons/tabs/modes/follow-ups/session items/strip nodes keep 44px hits).
- No rendered-viewport measurement exists (no browser automation); geometry is asserted from rules, not measured boxes. Recorded under unresolved.

## State coverage

Gate `state-coverage`: **warning** (2 findings; all other rows triggered).

Trigger map (route or in-app trigger): A1 default / A2 `?state=empty` / A3 `?state=streaming` (live stub run on mount) / A4 `?state=failed` + fixture turn 4; B1 queued + B3 staged + B7 queued-note via streaming/long running tickets / B4 succeeded / B5 failed + errorbox / B6 empty-trace (turn 3, zero tools) / B7 diff+excerpt wells pre-opened + errorbox/cmdout/staged bodies in fixtures; C1 idle / C2 running pulse (turn 30) / C3 ok / C4 bad + count persistence / C5 selected ring + re-cite / C6 compression groups + Regroup + jump-to-failure (`?state=long`); D1 idle / D2 focused (textarea focus → ring; in-app) / D3 sending (`Sending…`, 180ms echo) / D4 echo dock / D5 modes with hint mirror / D6 pre-use strip / D7 post-use collapse with used-label filtering; E1 populated / E2 empty project Sidecar + inline start / E3 `?state=nosessions` (200) / E4 atomic switch + focus to stack heading; F1/F4/F7 populated (turn 1) / F2/F5/F8 empty (turns 2–3) / F3/F6/F9 error with honestly-labelled retry + Show ticket (turn 4); G1 switch / G2 sessions drawer via Sessions button (≤820px/force-narrow) / G3 attachment sheet via ticket select or Cite in wing at narrow widths with exact tether strings / G4 dismiss-with-reason (required radios, disabled confirm, note) / G5 Esc/scrim/Close with focus return; H reduced-motion static equivalents in CSS; I offline stub (no network primitives in source).
- W-SC1 (warning): B2 Running tool-row word has no fixture trigger — full detail in gate findings.
- W-SC2 (warning): D6 latest-only rule vs selection-keyed follow-ups — full detail in gate findings.

## Visual regression

Step `visual-regression`: **not-run** — no frozen Baseline exists in a CREATE run; there is nothing to diff against. This step is outside the 5 packet gates and carries no gate status.

## Blockers

None. Zero `fail` gates; no finding holds the Phase exit.

## Warnings

- W-TD1: un-tokenized literals (z-index scale, 420px sheet cap, skeleton/chrome metrics) — missing-token class, order/behavior contract-conformant.
- W-TD2: button vertical padding 10px vs tokenized 12px; 44px floor intact.
- W-A11Y1: duplicate wing tab/panel IDs while the attachment sheet is open.
- W-A11Y2: div wrappers inside `ul.tool-list`.
- W-SC1: no trigger renders the B2 Running tool-row word distinctly from B3 Staged.
- W-SC2: composer follow-ups keyed to selection, not to latest turn (D6).

## Accepted exceptions

None invoked. EX-01–EX-07 departures named in the design draft (darkened AA inks, neutral kind chips, Impact-free numeral stack, 44px floor, strip simplification, cmdout dark block, footnote translation) are all honored in the implementation; no `EXCEPTIONS.md` file exists in the Run and no finding required one.

## Evidence index

- `audit/audit-report.md` — this report (coordinator-persisted from `reportMarkdown`).
- `audit/audit-report.json` — typed report (coordinator-persisted from `auditReport`).
- Pre-existing: `audit/build-log.md`, `audit/implementation-notes.md`.
- Prototype sources read (all under `prototype/chat-prototype/`): `package.json`, `check.mjs`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src/App.tsx`, `src/model.ts`, `src/fixtures.ts`, `src/tokens.ts`, `src/styles.css`, `src/main.tsx`, `src/components/{SpineNavigator,Ticket,EvidenceWing,DrawerSheet,Composer,SessionSidebar,shared}.tsx`.
- Served artifacts probed: `http://127.0.0.1:4179/` + `?state=default|empty|streaming|failed|long|narrow|nosessions|bogus`, `dist/assets/index-DhEUt5WJ.js`, `dist/assets/index-8Wx6gRn_.css`.
- Context contracts: `surface-brief.md`, `state-matrix.md`, `responsive-model.md`, `design-draft.md`, `tokens.{primitive,semantic,component}.json`, `component-plan.md`, `component-state-contracts.md`.

This report contains objective findings only. It issues no aesthetic verdict and edits nothing.