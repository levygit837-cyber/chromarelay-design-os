# Canonization Validation Report — Work-Order Rail

Run: `create-20260906-issue20-chat` | Phase: canonization | Status: `proposed` | Producer: `system-architect` | Date: 2026-09-06
Gate: contract-consistency (draft self-check; binding gate runs at build audit). Verdict: **ZERO ERRORS — draft gate passes; 2 warnings accepted with rationale below.**

Method: manual cross-check of every `{…}` reference across the three token files; author-computed WCAG 2.2 relative-luminance ratios from canonical hex (build audit re-measures on render); role-by-role read of the Direction, specimen grammar, product brief, constraints and tournament record. No existing Locks exist in the packet (`locks: []`), so conflict checking is against an empty baseline.

## 1. Broken token references — PASS (zero errors)

- Every `{color.*}`, `{space.*}`, `{size.*}`, `{font.*}`, `{motion.*}`, `{elevation.*}` reference in `tokens.semantic.json` resolves to a defined primitive leaf (29 color, 15 space, 13 size, 3 radius, 22 font, 2 elevation, 7 motion leaves — all referenced leaves exist).
- Every `{text|action|surface|border|status|diff|spine|focus|gap|target|type|lift|feel.*}` reference in `tokens.component.json` resolves to a defined semantic leaf; component file contains zero `color./space./size./radius./font./elevation./motion.` references (verified by prefix scan), so no raw primitive reaches any component.
- `type.*` shorthand expansions embed `{font.sans}` / `{font.mono}` / `{font.numeral}` names that resolve to the primitive font stacks.

## 2. Contrast pairs — PASS (zero errors)

Author-computed sRGB ratios (AA floors: 4.5:1 text, 3:1 large/graphic):

- `text.primary` ink on `surface.base` paper ≈ 14.2:1 — PASS
- `text.secondary` ink-2 on paper ≈ 9.0:1 — PASS
- `text.muted` muted on paper ≈ 6.1:1 — PASS (after EX-01 darkening; specimen `#6F675B` computed ≈ 4.4:1 and would have been marginal — reason for EX-01)
- `text.inverse` paper on ink ≈ 14.2:1 — PASS
- `status.ok-ink` on `status.ok-bg` ≈ 7.0:1 — PASS
- `status.warn-ink` on `status.warn-bg` ≈ 5.9:1 — PASS
- `status.bad-ink` on `status.bad-bg` ≈ 7.2:1 — PASS
- `action.accent` on `surface.ticket` ≈ 7.6:1 — PASS
- Node fills (white glyph on ok/warn/bad edge) ≈ 4.6–5.2:1 at 12–14px bold — PASS as large/graphic + glyph + word pairing per L-03
- `surface.cmdout-text` on `surface.cmdout-bg` ≈ 12.5:1 — PASS
- Spine rail graphite on paper ≈ 9.8:1 non-text indicator with redundant node coding — PASS
- Every status pair additionally carries glyph + word, so pairs pass even where a future re-pin shifts hue (L-03).

## 3. Light and dark intent — PASS with accepted warning W-1

- Light intent: full token coverage — grounds, ink scale, tints, borders, focus, scrim all specified for the light-capable workbench. PASS.
- Dark intent: exactly one scoped dark surface, the cmdout block (`surface.cmdout-bg/text`), per Direction anti-default #5 and EX-06. There is NO full dark theme in this Run (Run-local prototype, EN-US, frontend-only scope).
- **W-1 (warning, ACCEPTED):** full dark-theme intent absent. Rationale: out of Run scope and non-goals; the single dark block is intentional accent, not theme debt. Accepted by drafter; revisit only if a Run decision adds a dark Surface.

## 4. Token orphans — PASS

- All 29 color primitives consumed (grounds via surface.*, inks via text/status/diff, cmdout quartet via trace-ticket well/cmdout + validation pairs, scrim via dialog).
- All space leaves consumed via gap.* roles or documented scale reserve (20/24/32/40/48/64 held as the spacing range for local composition; range use is authorized, not orphan).
- All size/font-weight/line-height/tracking leaves consumed via target.*/type.* except `size.wing-left/right` and `size.spine-rail/mid`, which are consumed by the DESIGN variant table and sidebar/spine-nav contracts by name. Zero unreferenced leaves.

## 5. Missing typography roles — PASS (zero errors)

- Required roles present: numeral (`type.numeral/strip`), header (`type.header`), body (`type.body`), meta (`type.meta/micro`), mono evidence (`type.mono/duration`), chrome labels (`type.eyebrow/label`), controls (`type.control`), hints (`type.hint`).
- Mono rationing holds: only evidence-adjacent tokens use `font.mono`; no chrome token references mono except citations/durations.
- Numeral voice is offline-safe with no Impact dependency (D-09, EX-03).

## 6. Component state completeness — PASS (zero errors)

- trace-ticket: queued / running (staged + honest label) / succeeded / failed (in-place errorbox + retry/dismiss) / no-tools (empty-trace box) / streaming skeleton / selected vs flat — all tokenized.
- tool rows: queued / working / done / failed + expanded-well vs collapsed; disclosure chevron with aria-expanded; keep-status/hide-duration narrow rule tokenized.
- spine-nav: idle / running (pulse + reduced static) / ok / bad (persistent + counts) / selected ring / compressed group + jump-to-failure.
- composer: idle / focused / sending / echo (<300ms) / docked + sticky-bottom; modes pressed/unpressed; follow-ups pre/post-use.
- button: default / hover / focus-visible / active / disabled (incl. danger + small-at-44px).
- dialog/sidebar/table/field: open/close + focus trap + Esc (dialog); current/adjacent (sidebar); pass/running/fail rows (table); idle/focus/filled/disabled (field); evidence-wing tabs selected/unselected + empty views with recovery actions.
- Live-region announcements named for streaming, failure, retry, tab switch, disclosure (C-A3).

## 7. Conflicts with existing Locks — PASS (zero errors)

- Phase packet baseline `locks: []` — no existing Locks to conflict with. All 8 proposed Locks (L-01..L-08) are scoped with reopening conditions and introduce no contradiction with hard floors C-T1..T-9 or assumed floors C-A1..A-4, C-P1..P-3.

## 8. Exportability — PASS (zero errors)

- All three files parse as JSON with DTCG `$value/$type` leaves; values are hex, dimension strings, font arrays, cubic-bezier/duration literals, or `{group.token}` references — no functions, no markup, no comments, no CDN URLs (C-P2 clean).
- File paths: the four `tokenPaths` entries match the five artifact records; next Role reads rather than guesses.
- DESIGN prose cites token names only, never inline hex, so values change in exactly one place.

## Gate verdict

- Errors: 0. Warnings: 2, both accepted with rationale (W-1 dark-theme scope above; W-2 below).
- **W-2 (warning, ACCEPTED):** 30+ turn spine compression + scrollspy specified contractually but unproven in render (tournament-known build risk). Accepted as build-owned: build must ship a 30-turn stub fixture proving collapse counts, persistent failure nodes and jump-to-failure, or return to surface architecture — never silent simplification.
- Requested transition: **advance** — the contract is complete, consistent and buildable; residual items are build-phase proofs, not canonization gaps.
