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
# REPO pode vir do ambiente (watcher fora de ~/Documents); cai para o
# diretorio do script quando executado a mao dentro do repo.
REPO="${REPO:-$(dirname "$0")}"
cd "$REPO"

MIRROR="$REPO/mirror"
# trava anti-loop: o proprio mirror/ nunca entra no wanted (o case acima
# filtra pelo nome) e arquivos do sync sao dotfiles rastreados — nunca
# listados como origem porque so dotdirs + .gitignore sao espelhados.
mkdir -p "$MIRROR"

wanted=()

for e in .[^.]*; do
  # shell sem dotglob e sem nullglob: pula o padrao literal quando nada casa
  [ -e "$e" ] || continue
  case "$e" in
    .git|.DS_Store|mirror) continue ;;
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
    if [ "$base" = "$w" ]; then keep=1; break; fi
  done
  if [ "$keep" = "0" ]; then rm -rf "$m"; fi
done

