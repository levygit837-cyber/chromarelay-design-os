#!/bin/bash
# Espelha dot entries do topo do repo para nomes visiveis em mirror/,
# para o painel de arquivos do Factory desktop (que oculta dotfiles).
# Dinamico: qualquer .*/ novo no topo entra no espelho; entries que
# sumirem da origem saem do espelho.
#
# Regras:
#   .git            -> ignorado (ruido/tamanho)
#   .DS_Store       -> ignorado em todos os niveis
#   arquivos exceto .gitignore -> ignorados (ex.: .env, .mcp.json)
#   demais dotdirs  -> espelhados 1:1 com rsync -a --delete
set -euo pipefail
cd "$(dirname "$0")"

MIRROR=./mirror
mkdir -p "$MIRROR"

wanted=()

for e in .[^.]*; do
  # shell sem dotglob e sem nullglob: pula o padrao literal quando nada casa
  [ -e "$e" ] || continue
  case "$e" in
    .git|.DS_Store|"$MIRROR") continue ;;
  esac
  name="${e#.}"
  if [ -d "$e" ]; then
    wanted+=("$name")
    mkdir -p "$MIRROR/$name"
    rsync -a --delete --exclude '.DS_Store' "$e/" "$MIRROR/$name/"
  elif [ "$e" = ".gitignore" ]; then
    wanted+=("$name")
    cp "$e" "$MIRROR/$name"
  fi
done

# remove entradas do espelho cuja origem sumiu (rename/apagado)
for m in "$MIRROR"/*; do
  [ -e "$m" ] || continue
  base="$(basename "$m")"
  keep=0
  for w in ${wanted[@]+"${wanted[@]}"}; do
    [ "$base" = "$w" ] && { keep=1; break; }
  done
  [ "$keep" = "0" ] && rm -rf "$m"
done
