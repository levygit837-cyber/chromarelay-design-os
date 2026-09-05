#!/bin/bash
# Espelha as entradas ocultas do repo para nomes visiveis em mirror/,
# para o painel de arquivos do Factory desktop (que oculta dotfiles).
# Rodado pelo launchd a cada 3s; rsync -a --delete = copia exata.
set -euo pipefail
cd "$(dirname "$0")"

DIRS=(.agents .bootstrap .chromarelay .claude .github .omp)
FILES=(.gitignore)

for e in "${DIRS[@]}"; do
  name="${e#.}"
  mkdir -p "mirror/$name"
  rsync -a --delete --exclude '.DS_Store' "$e/" "mirror/$name/" 2>/dev/null || true
done

for f in "${FILES[@]}"; do
  [ -f "$f" ] && cp "$f" "mirror/${f#.}"
done
