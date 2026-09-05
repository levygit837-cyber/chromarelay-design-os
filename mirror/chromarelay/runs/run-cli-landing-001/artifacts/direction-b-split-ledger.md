# Direction B — Split Ledger

**Lens:** the page is the diff between "you saved" and "it passed".

- **Composition:** asymmetrical two-column split 45/55, held to the viewport on desktop,
  stacking at 768px. Left column is cause (the file you saved), right is effect (the run).
  A single hairline rule runs the full height between them.
- **Typography:** two families with contrasting function — `Inter` for prose in the left
  column, `IBM Plex Mono` for everything machine-produced on the right. Prose never appears
  in mono; output never appears in sans.
- **Color:** warm dark ground `#191714`, parchment text `#E8E2D6`, one amber accent
  `#D98E32` used only on the boundary rule and the copy button.
- **Surfaces:** the right column has a subtle inset ground, one step darker, no border radius.
- **Motion:** on scroll into view, the right column types 3 lines of output at 22ms/char,
  once. Respects `prefers-reduced-motion`.
- **Signature:** the full-height hairline with the amber tick where the two columns meet.
- **System potential:** cause/effect split generalizes to any before/after documentation surface.

**Divergence axes vs peers:** dark warm ground, two-column asymmetry, two type families.
