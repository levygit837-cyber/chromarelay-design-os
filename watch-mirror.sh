#!/bin/bash
# Watcher em tempo real do mirror/: dispara o sync a cada lote de eventos
# do FSEvents na raiz do repo. Roda via LaunchAgent do usuario.
# Exige REPO e SYNC no ambiente (definidos no plist).
set -euo pipefail
: "${REPO:?REPO precisa apontar para a raiz do repositorio}"
: "${SYNC:?SYNC precisa apontar para o sync-mirror.sh}"
cd /tmp || exit 1
/opt/homebrew/bin/fswatch -o -r -l 0.5 "$REPO" 2>/dev/null | while IFS= read -r _; do
  REPO="$REPO" bash "$SYNC" >/dev/null 2>&1 || true
done
