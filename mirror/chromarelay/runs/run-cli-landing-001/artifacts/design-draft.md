# DESIGN draft — watchtest landing (Direction A, Instrument)

Note on inputs: the packet named `Selected Direction`, `Product Brief` and `Constraints` and
supplied `locks: []` — the Direction decision recorded one phase earlier arrived as neither a
lock nor a path. It was read from `decisions/DEC-001-selected-direction.json` by searching.

## Design thesis
The page is a measuring instrument. One number carries the composition; everything else is
subordinate, small, and aligned to a single column.

## Tokens

### Color — three values, no more
| Token | Value | Function |
|---|---|---|
| `--paper` | `#F4F2ED` | ground |
| `--ink` | `#14161A` | all text |
| `--signal` | `#0B7A4B` | pass state, and only that |

Derived, not new values: `--ink-dim: color-mix(in oklab, var(--ink) 55%, var(--paper))`.

### Type — one family, three sizes
| Token | Value | Function |
|---|---|---|
| `--font-mono` | `"JetBrains Mono", ui-monospace, monospace` | everything |
| `--size-hero` | `clamp(3.5rem, 14vw, 8rem)` | latency number only |
| `--size-body` | `0.9375rem` | prose |
| `--size-label` | `0.8125rem` | labels, install line |

`font-variant-numeric: tabular-nums` on the hero.

### Space — 4px base, five steps only
`--s1: 0.25rem`, `--s2: 0.5rem`, `--s3: 1rem`, `--s4: 3rem`, `--s5: 12.5rem`.

### Layout
`--measure: 40rem` (640px). Single column, centered, `padding-inline: var(--s3)`.

## Contract terms carried from the tournament (mandatory)
1. **Hero clamp:** `--size-hero` is a `clamp()` and must never be a fixed px value.
2. **Maximum four characters** in the hero number. If the real median exceeds four
   characters (e.g. `1240ms`), the unit moves to the label line and the number loses `ms`.

## Component contracts
- **Hero metric:** label (13px, `--ink-dim`) / number (`--size-hero`, `--ink`, tabular) /
  caption (15px, `--ink-dim`). No border, no background.
- **Install line:** monospace, selectable, `--ink` on a `--paper` ground one step darker via
  `color-mix`. Copy affordance is the word `copy`, 13px, not an icon. Focus-visible ring in
  `--signal`.
- **Prose block:** measure capped at 68ch, three paragraphs, no headings, no cards.

## Responsive model
- 375-767px: single column, hero at clamp floor (56px), `--s5` reduced to `5rem`.
- 768-1439px: unchanged structure, `--s5` at full `12.5rem`.
- 1440px+: column stays 640px and centers; no new breakpoint behaviour.

## State matrix
Install line: rest / hover / focus-visible / copied. `copied` swaps the word `copy` for
`copied` for 1.4s in `--signal`, and is announced via `aria-live="polite"`.

## Anti-defaults held from the ledger
No purple gradient, no glassmorphism, no fake browser chrome, no three-column feature grid.

## Unresolved conflict
None. The one tension — hero size against the 375px viewport — is resolved by the clamp plus
the four-character rule, both of which are contract terms above.
