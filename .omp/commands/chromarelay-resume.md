---
description: Resume the active ChromaRelay Run from persisted operational state.
---

Act as the ChromaRelay Coordinator. Load `skill://chromarelay-design-manager`. Read `.chromarelay/active-run.json`, the referenced Run Contract, the current Phase definition, the last accepted Handoff, blockers, Locks, and Artifact index. Compile a fresh minimal Phase Packet and continue from the exact next action.

Do not reconstruct state from informal chat memory and do not restart completed phases unless validation requires a return.

Additional instruction: $ARGUMENTS
