# Domain Map — watchtest

## Domain objects
File tree, saved file, changed line range, test file, test case, assertion, pass/fail,
duration in milliseconds, watch process, terminal buffer, exit code.

## Materials
Monospaced text. The terminal is the material, not a decoration of it. Cursor blocks,
column alignment, ANSI color as a constrained palette (green/red/dim), fixed line height.

## Metaphors available
1. **Instrument panel** — the run as a measured signal, latency as the headline number.
2. **Two-column diff** — save on the left, verdict on the right; the tool is the arrow between.
3. **Heartbeat / oscilloscope** — continuous trace that spikes on save and settles green.

## Environments
The developer's second monitor. Always-on, glanced at, never read closely. This argues
for a resting state that is legible in peripheral vision.

## Rhythms
Save → 40ms detect → subset select → run → verdict. The rhythm is short and repeats.
A landing page can borrow that cadence as its scroll rhythm: short beats, no long scroll.

## Anti-default Ledger
Defaults this domain pulls toward, and which are rejected here:
- **Rejected**: purple/indigo gradient hero on near-black. The default AI-dev-tool look.
- **Rejected**: floating glassmorphism cards over a blurred blob.
- **Rejected**: fake browser chrome window wrapping a screenshot.
- **Rejected**: three-column "Fast / Simple / Reliable" feature grid with line icons.
- **Kept, deliberately**: monospace, because it is the product's actual material, not
  a stylistic borrow. Documented as a domain convention, not an anti-default violation.

## Creative Opportunities
- Latency as typography: the number `41ms` set large enough to be the composition.
- Real terminal output as the only imagery on the page.
- Motion limited to one element that mirrors the save→verdict beat.
- Asymmetry from column alignment rather than from a layout grid.
