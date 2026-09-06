# Product Brief — Agentic Model Chat Surface

Run: `create-20260906-issue20-chat` | Phase: grounding | Status: `proposed` | Producer: `product-strategist` | Date: 2026-09-06 | Language: EN-US

Sources:

- Base prompt (authoritative product ask): `.chromarelay/runs/create-20260906-issue20-chat/context/issue-20-base-prompt.txt`
- Run Contract: `.chromarelay/runs/create-20260906-issue20-chat/run.json`
- Request plus route: `.chromarelay/runs/create-20260906-issue20-chat/request.json`

Evidence discipline: every material statement ends with one of `[observed — ...]`, `[inferred (confidence: high/medium) — source: ...]`, or `[proposed — ...]`. Statuses persist for the life of the Run; an `inferred` statement becomes `observed` only by acquiring a citation, never by restatement.

---

## 1. Actual user and context of use

- The user is a software builder (developer or technical operator) driving an agentic coding assistant through multi-turn chat to advance a real coding task. [observed — base prompt: project/session sidebar, input bar with follow-ups and mode toggles, integrated browser, file navigation, GitHub views, visible Write/Read/Edit/Bash/WebSearch tool calls]
- Context of use is a sustained desktop work session: the user directs the agent, monitors what it does, and verifies its work without leaving the Surface. Switching and resuming sessions and projects is part of the normal flow, not an edge case. [inferred (confidence: high) — source: dual sidebars plus per-session right panel in the base prompt imply session-scoped work, not one-shot Q&A]
- The user alternates attention between three things: the conversation, the agent's tool activity, and verification surfaces (files, browser, GitHub). Interruption and resumption are expected. [inferred (confidence: high) — source: base prompt three-pane layout plus visible tool trace]
- No anonymous casual-chat persona applies: there is no evidence for entertainment, companionship, or general-knowledge Q&A use. [inferred (confidence: medium) — source: absence of such language in the base prompt; tool-call and IDE-adjacent vocabulary throughout]

## 2. Primary task

- Primary verb: **direct an agentic coding assistant and verify its work** — compose instructions, steer with follow-ups and mode toggles, then confirm via the visible tool trace and per-session verification views. [observed — base prompt names the input bar with follow-ups and mode toggles, visible tool calls, and the browser/files/GitHub right sidebar]
- Secondary actions (in priority order): switch and resume sessions and projects; expand and inspect a tool call; switch the right-sidebar view (browser / files / GitHub); retry or dismiss a stubbed turn. [inferred (confidence: high) — source: sidebar plus per-session-panel structure in the base prompt]
- The task is complete when the user can see what was asked, what the agent did (tool by tool), and what changed or was found — all scoped to the active session. [proposed — framing offered so surface architecture can tier information accordingly]

## 3. Desired outcomes

### User outcomes

- Advance a coding task without losing context across sessions and projects. [inferred (confidence: high) — source: left project/session sidebar in the base prompt]
- Trust what the agent did because every consequential step is visible as a tool call, not hidden behind prose. [observed — base prompt requires visible Write, Read, Edit, Bash, WebSearch calls]
- Steer cheaply: pick a follow-up or flip a mode instead of retyping intent. [observed — base prompt requires follow-ups and mode toggles in the input bar]
- Verify without context-switching: check a file, a browser result, or a GitHub view in place, per session. [observed — base prompt requires the right per-session sidebar with those three views]

### Business (Run evaluation) outcomes

- Deliver end to end in one isolated Run: adapted Run Contract archived beside the base text; HTML Direction specimens recorded as reference-only artifacts; a blind single-pass Direction selection; a bootable React plus TypeScript prototype in its own Run folder. [observed — base prompt acceptance criteria]
- Prove the orchestration rules hold: CREATE under full autonomy, per-Run folder, Role sandboxes, Skill Kit budget, HTML-as-reference, typed artifact layout, timing observability, Run-local manifest with no PR and no merge. [observed — base prompt Blocked-by notes referencing issues #15, #16, #18]
- This grounding phase succeeds when later Roles can design and build without inventing the product. [proposed — grounding success criterion]

## 4. Product truths (cannot change without breaking the ask)

1. **T1 — Stubbed model traffic, frontend only.** No real model calls, no backend orchestration, no billing. [observed — request `nonGoals`: backend orchestration, real model traffic (stubbed), billing; run `hardConstraints`: frontend only]
2. **T2 — Left project/session sidebar is present.** Projects contain sessions; the user switches and resumes from here. [observed — base prompt: left project and session sidebar]
3. **T3 — Central customizable input bar with follow-ups and mode toggles.** Steering controls live in the composer, not in a settings page. [observed — base prompt: central customizable input bar with follow-ups and mode toggles]
4. **T4 — Right per-session sidebar with three views: integrated browser, file navigation, GitHub views.** It follows the active session. [observed — base prompt: right per-session sidebar with integrated browser, file navigation, and GitHub views]
5. **T5 — Visible agent tool calls including Write, Read, Edit, Bash, WebSearch.** The trace is part of the conversation, attached to assistant turns. [observed — base prompt: visible agent tool calls such as Write, Read, Edit, Bash, and WebSearch]
6. **T6 — HTML specimens are reference-only; do-not-port-specimen-markup in the build.** [observed — run `hardConstraints`; request `hardConstraints`; base prompt acceptance criteria]
7. **T7 — Real loading, empty, and error states ship in the prototype.** No dead buttons, no lorem fixtures pretending to be states. [observed — run `hardConstraints`: real loading/empty/error states]
8. **T8 — Responsive from 375px to 1440px.** [observed — run `hardConstraints`: responsive 375px to 1440px]
9. **T9 — Bootable React plus TypeScript prototype via README plus npm install and dev command, with stubbed sessions, tool trace, and both sidebars present.** [observed — base prompt: Bootable React plus TypeScript prototype runs via README plus npm install and dev command, with stubbed sessions, tool trace, and both sidebars present]
10. **T10 — Kit-only Skill loading with global skills disabled; Run stays local (Run-local manifest only, no canonical promotion, no pull request, no merge).** [observed — run `hardConstraints` and `scope.nonGoals`]

## 5. Content and data contracts

Stubbed domain (all synthetic, deterministic, no network): [proposed — contract framing so builders share one stub model; entity names derived from observed base-prompt vocabulary]

- `Project { id, name, sessions[] }` — left sidebar grouping. [proposed]
- `Session { id, projectId, title, updatedAt, messages[] }` — the unit of resumption; the right sidebar is scoped to the active `Session.id`. [proposed]
- `Message { id, role: user | assistant | tool, body, toolCalls?, followUps?, createdAt }` — conversation units in the center column. [proposed]
- `ToolCall { id, kind: Write | Read | Edit | Bash | WebSearch, status: running | succeeded | failed, summary, detail, durationMs? }` — attached to an assistant turn; summary always visible, detail on expansion. [observed kinds — base prompt; statuses proposed]
- `FollowUp { id, label }` — suggested next actions rendered with the input bar or the latest assistant turn. [observed — base prompt: follow-ups]
- `Mode { id, label, active }` — composer toggle affecting stubbed behavior label (exact taxonomy left to Directions; e.g. plan vs. act style modes). [observed that toggles exist — base prompt; taxonomy proposed]
- `BrowserView { url, title, excerpt }`, `FileNode { path, kind: file | dir, children? }`, `GitHubView { repo, ref, summary }` — the three right-sidebar views; all static mock representations, never live fetches. [observed that the three views exist — base prompt; static-mock rule proposed]

Contract rules:

- Sessions belong to exactly one project; switching sessions switches the right-sidebar scope. [proposed]
- Every assistant turn that claims work MUST carry at least one tool call or an explicit empty-trace state; prose alone never stands in for work. [proposed]
- Fixtures MUST cover: populated session, empty session list, empty message list, streaming/running tool state, tool failure state, and sidebar-view empty states. [proposed — implements observed hard constraint T7]
- Fixture content MUST be synthetic (no real secrets, tokens, or user data). [proposed — implements legal constraint C-L1]

## 6. Constraints pointer

Binding constraints live in the companion artifact: `.chromarelay/runs/create-20260906-issue20-chat/context/constraint-draft.md`. Every constraint there names its source and whether it is a hard floor or a current assumption. Later Roles treat hard floors as non-negotiable and assumptions as overridable only with evidence. [observed — pointer; content in the cited file]

## 7. Desired perception (operational qualities)

Each term pairs a concrete referent with what it excludes. Bare terms like clean, modern, or intuitive are deliberately absent.

- **Trustworthy like a flight recorder** — every agent action leaves a visible, expandable tool entry; excludes black-box chat where prose asserts work with no trace. [proposed]
- **Focused like a reading instrument** — the central conversation column stays calm and scannable under a dense workbench; excludes control-room clutter leaking into the reading path. [proposed]
- **Capable like a control room** — both sidebars read information-dense and operable at a glance; excludes toy-like emptiness or a single lonely chat column. [proposed]
- **Precise but not sterile** — technical detail (paths, commands, diffs, statuses) is legible and exact; excludes both cold log-dump aesthetics and bubbly casual-chat softness. [proposed]
- **Approachable without toy-like softness** — steering (follow-ups, modes, session switching) looks obvious and safe to try; excludes playful chatbot ornament and intimidating IDE complexity. [proposed]

Styling boundary: no typeface, palette, spacing scale, motion curve, or ornament is specified here — those belong to the art-director. The density and legibility requirements above are product truths (three-pane OPERATE Surface, exact tool trace), not styling choices. [observed — run `openDecisions` reserve creative direction, composition, typography, motion for later]

## 8. Differentiation

- Versus generic single-column chatbots: this Surface is a **session-scoped workbench**, not a blank prompt box — dual sidebars plus per-session verification views keep project context and evidence in frame. [inferred (confidence: high) — source: base-prompt layout vs. commodity chatbot layout]
- Versus IDEs and terminal agents: the conversation stays primary and the tool trace is **human-readable audit**, not a debug console — summary-first, expandable, status-labelled. [proposed]
- Versus GitHub/file/browser tabs: verification views are **scoped to the session that produced them**, so evidence never detaches from the turn that cites it. [inferred (confidence: medium) — source: per-session qualifier in the base prompt]

## 9. Open creative space (intentionally left open)

Owned by later Roles per run `openDecisions` (creative direction, composition, typography, motion, further surfaces): [observed — `run.json` `openDecisions`]

- How the three panes compose, collapse, and overlay across 375px–1440px (drawer vs. tab vs. docked semantics). [proposed — open for Directions]
- Visual language of the tool trace (timeline, grouped card, inline chips) provided summary-first disclosure holds. [proposed — open]
- Exact mode taxonomy and follow-up presentation in the customizable input bar. [proposed — open]
- Character and intensity of motion (streaming, disclosure, view transitions), within reduced-motion and performance constraints. [proposed — open]
- Whether further surfaces beyond the chat Surface are proposed, and the Further-Surface Decision rationale. [observed — base prompt acceptance requires a Further-Surface Decision; outcome open]

## 10. Information architecture (guidance, not implementation)

- Focal outcome: the current assistant answer **with its tool trace**. [proposed]
- Primary actions: send message; pick a follow-up; toggle a mode; switch session. [proposed]
- Secondary actions: switch project; switch right-sidebar view; expand a tool call; retry/dismiss a stubbed turn. [proposed]
- Information tiers: Tier 1 — conversation plus composer; Tier 2 — session switcher plus tool summaries; Tier 3 — tool detail plus browser/files/GitHub content. [proposed]
- Progressive disclosure: tool summary then expanded detail; sidebar view tabs; follow-ups collapse after use; empty/error placeholders replace, never overlay, content. [proposed]
- Required states: loading (stub delay/streaming skeleton), empty (no sessions; no messages; empty sidebar view), error (stub failure with retry), populated. [proposed — implements T7]
- Responsive transformations: at 1440px three panes docked; mid widths one sidebar docked and the other overlaid; at 375px a single column with sidebars as drawers/tabs and the composer persistently reachable. Exact mechanics are a Direction decision. [proposed — implements T8]

## 11. Confidence per inferred field

| Field | Confidence | Basis |
|---|---|---|
| User is a builder in a sustained work session | high | Dual sidebars, per-session scope, and tool vocabulary in the base prompt |
| Casual/entertainment use out of scope | medium | Absence of such language; narrow technical vocabulary |
| Secondary-action priority order | high | Layout structure implies the order, but exact ranking awaits usage |
| Per-session evidence scoping as differentiator | medium | Rests on the two-word qualifier per-session |
| Stub entity model and contract rules | medium | Framing proposed from observed vocabulary; builder-tested in later phases |
| Perception terms and differentiation | medium | Candidate framings for Direction discipline, not user-validated claims |

Overall grounding confidence: **high** — the product ask is explicit and every hard constraint is cited; remaining uncertainty is reversible Direction-level choice, not product truth. [proposed]

## 12. Non-blocking notes (not Run blockers)

No acceptance-blocking question remains: the Run `unresolved` list is intentionally empty per the grounding packet. The open items in section 9 are owned by the art-director and surface-architecture Roles and do not block this gate. [proposed]
