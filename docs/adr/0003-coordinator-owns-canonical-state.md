# The Coordinator owns canonical state

Specialists produce immutable Handoffs inside a Run; only the Coordinator promotes approved Artifacts and Decisions into `.chromarelay/project`. This prevents competing agents, partial work and compressed conversations from silently corrupting project truth.