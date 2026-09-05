#!/bin/bash
# Watcher em tempo real do mirror/: dispara sync-mirror.sh a cada mudança
# nas dot entries (FSEvents do macOS). Roda via LaunchAgent do usuario.
set -euo pipefail
cd "$(dirname "$0")"

exec /opt/homebrew/bin/fswatch -r -l 0.5 --event Created --event Updated --event Removed --event Renamed --event MovedFrom --event MovedTo \
  .agents .bootstrap .chromarelay .claude .github .omp .gitignore \
  | while IFS= read -r _; do
      ./sync-mirror.sh 2>/dev/null || true
    done
