# Anti-Default Ledger — Agentic Model Chat Surface

Run: `create-20260906-issue20-chat` | Phase: domain-exploration | Status: `proposed` | Producer: `art-director` | Date: 2026-09-06 | Language: EN-US

Sources: `.chromarelay/runs/create-20260906-issue20-chat/context/product-brief.md`; `.chromarelay/runs/create-20260906-issue20-chat/context/constraint-draft.md`.

How to read: each entry names a category default, why it is likely here, when it remains the right answer, and one alternative mechanism that does the same job. The ledger is a record of examination, not a ban list. A default earns its place only by surviving on its merits.

---

## D1 — Centered single-column chatbot with left/right rounded bubbles and avatars

- **The default:** one narrow centered column; user bubbles right-aligned tinted, assistant bubbles left-aligned gray/white, small circular avatars, generous bubble padding, tail corners.
- **Why likely here:** every commodity chatbot ships this; it is the fastest way to signal "chat" and it handles one-shot Q&A well. Templates, component libraries, and stakeholder expectations all push toward it.
- **When it remains right:** if the Run ever ships a casual single-turn surface with no tool trace and no verification views, bubbles are the honest answer — they mark speaker alternation and nothing else.
- **Alternative mechanism:** a **ledger transcript** — full-width rows on a quiet baseline grid, speaker marked by a narrow rail label (`YOU` / `AGENT`) and alignment-neutral indentation, tool trace attached as sub-rows under the assistant row. Same job (who said what) without shrinking the reading measure or pretending tool work is dialogue.

## D2 — Purple/blue AI gradient glow plus sparkle icon as the brand signal

- **The default:** violet-to-cyan gradient avatar, glowing composer border, ✦ sparkle glyph on every AI element, animated gradient on streaming.
- **Why likely here:** it is the category shorthand for "AI inside"; it photographs well in marketing and requires no product-specific idea. Design tools ship it as a snippet.
- **When it remains right:** if the product needs an at-a-glance "this text was machine-generated" marker inside a mixed human/machine feed, a small consistent spark glyph next to the `AGENT` rail label is defensible — as annotation, not as atmosphere.
- **Alternative mechanism:** an **instrument signal** — status and provenance carried by a restrained mono label plus a position-stable status pip (running / succeeded / failed) with text, never by ambient glow. Identity comes from the trace structure, not from a magic aura.

## D3 — Linear auto-scroll transcript where streaming markdown is the only structure

- **The default:** every turn is an undifferentiated markdown blob; streaming appends tokens to the bottom; auto-scroll yanks the viewport; long turns push evidence off screen.
- **Why likely here:** it is what streaming APIs make trivial — append text, scroll to bottom. No information architecture required.
- **When it remains right:** for genuinely prose-only answers (explanations, summaries) with no tool claims, a calm markdown block with a streaming caret is correct and should be kept.
- **Alternative mechanism:** a **tiered turn** — assistant prose renders as the Tier-1 reading block, tool claims render as Tier-2 summary rows docked to the turn with expand-to-Tier-3 detail, and streaming states (prose caret vs. tool skeleton vs. progress row) are visually distinct so the user can tell *what kind* of work is in flight without reading.

## D4 — Tool activity hidden behind a "Thinking…" disclosure or dumped as raw JSON/logs

- **The default (two poles, same failure):** either a collapsed "Chain of thought / Thinking" spinner that hides everything, or an unstyled monospace dump of raw tool JSON, ANSI logs, and stack traces.
- **Why likely here:** hiding is easy and looks clean; dumping is easy and looks technical. Both avoid the real design work of summarizing machine action for a human verifier.
- **When it remains right:** raw detail MUST remain available one expansion down — the Tier-3 detail pane legitimately contains paths, commands, diffs, durations, and exit codes in mono. Hiding is right only as a second level, never as the only level.
- **Alternative mechanism:** **summary-first trace rows** — every `ToolCall` (Write / Read / Edit / Bash / WebSearch) renders as one scannable row: kind icon + plain-language summary + status label + duration, expandable to full detail. The trace reads as an audit list, not as a diary and not as a log firehose.

## D5 — Left nav as generic channel list; right verification panel as an afterthought modal or tab-stripped drawer

- **The default:** left sidebar copied from Slack/Discord (workspace icon rail + #channel list with unread dots); right side implemented as a modal overlay or a single cramped tab strip that covers the conversation.
- **Why likely here:** sidebar templates are abundant; treating verification views (browser / files / GitHub) as secondary pages avoids resolving the three-pane responsive problem.
- **When it remains right:** at 375px the sidebars MUST become drawers/tabs over a single column (constraint C-T6/C-P3) — overlay behavior at the narrow end is required, not a compromise.
- **Alternative mechanism:** **session-scoped wings** — the left wing is a resumption instrument (projects group sessions; recency + title + state carry the hierarchy, not unread dots), and the right wing is a docked evidence bench scoped to the active `Session.id` with three persistent views. Collapse rules are architectural (docked → overlaid → drawer) rather than an apology modal.

## D6 — Floating pill composer with mic/sparkle ornaments and a lone send arrow

- **The default:** a centered floating rounded-full input, placeholder "Ask anything…", mic and sparkle buttons, circular send arrow; follow-ups and modes (if present) bolted on as chips that wrap unpredictably.
- **Why likely here:** it signals approachability and ports directly from consumer chat apps. It minimizes the composer to a single control.
- **When it remains right:** the composer MUST stay persistently reachable with a large send target (C-A4, C-P3) — the reachable-docked-bottom pattern is worth keeping.
- **Alternative mechanism:** a **steering console** — the composer is a grounded, full-measure instrument: multiline field on top, a dedicated follow-up rail (suggested next actions as real buttons), and mode toggles as a segmented control with visible active state. Steering is the primary action of this product (brief §2), so it gets permanent structured space instead of ornament slots.

## D7 — Soft SaaS card soup: everything is a white rounded-2xl card with drop shadows on a gray wash

- **The default:** messages, tools, files, browser, GitHub views all rendered as identical elevated white cards with soft shadows and 16px radii, separated only by whitespace.
- **Why likely here:** card systems compose quickly, look inoffensive in reviews, and hide unresolved hierarchy decisions behind uniform containers.
- **When it remains right:** uniform cards are right inside genuinely peer collections — e.g., a grid of session entries or a list of file nodes at one level. Peer content deserves peer containers.
- **Alternative mechanism:** **differentiated planes with jobs** — conversation surface (calm, continuous, shadowless), trace surface (inset/ledger rows, ruled not elevated), and verification surface (instrument panel with its own header/tab grammar). Separation is carried by surface logic and rules, not by stacking shadows on everything.

## D8 — Toasts for errors and spinner-only loading states

- **The default:** failures surface as auto-dismissing toasts in a corner; loading is a lone spinner or three bouncing dots with no skeleton of what is coming.
- **Why likely here:** toasts and spinners are one-line implementations and satisfy a cursory "states" checklist.
- **When it remains right:** transient confirmations (e.g., "Session renamed") may still use a polite toast with a live-region announcement — that is their proper scope.
- **Alternative mechanism:** **in-place state surfaces** — stub failure renders where the work was claimed (failed tool row with retry, failed turn with retry/dismiss), empty states replace their pane with a named illustration-plus-action (no sessions / no messages / empty sidebar view), and streaming renders as structured skeletons (prose shimmer block + tool-row skeletons) so the user learns the shape of the answer before it arrives. Satisfies hard floor C-T5 directly.

---

## Ledger summary

| # | Default | Verdict for this Surface |
|---|---------|--------------------------|
| D1 | Chat bubbles | Replace with ledger transcript, except prose-only answers |
| D2 | AI gradient + sparkle | Replace with instrument signal; keep tiny provenance mark only |
| D3 | Undifferentiated streaming blob | Replace with tiered turn (prose / trace / detail) |
| D4 | Hidden thinking or raw dump | Replace with summary-first trace rows; raw detail one level down |
| D5 | Generic nav + modal panel | Replace with session-scoped wings + specified collapse rules |
| D6 | Pill composer | Replace with steering console; keep persistent reachability |
| D7 | Card soup | Replace with differentiated planes; cards only for peer lists |
| D8 | Toasts + spinners | Replace with in-place states; toasts only for transient confirmations |

No default is banned. Any row may return if a Direction candidate shows, with evidence, that it serves Tier-1 reading, Tier-2 audit, or Tier-3 verification better than the alternative under the 375–1440px, keyboard, contrast, and reduced-motion constraints.
