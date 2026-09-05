# Portabilidade e Project Overlay

## Objetivo

ChromaRelay deve entrar em um projeto existente sem assumir controle de sua arquitetura, dependências ou documentação.

## Conteúdo instalado

```text
.chromarelay/system/       cópia versionada do framework
.chromarelay/project/      documentos canônicos do projeto
.chromarelay/runs/         execuções locais
.agents/skills/          Skills portáveis
.omp/                    adapter OMP opcional
AGENTS.md                bloco delimitado, sem apagar conteúdo existente
```

## Modos

### Completo com OMP

```bash
node scripts/install.mjs --target ../produto --omp
```

### Portátil sem harness

```bash
node scripts/install.mjs --target ../produto
```

Instala framework, Skills e contrato para agentes genéricos, mas não agentes/comandos/tools OMP.

### Mínimo

```bash
node scripts/install.mjs --target ../produto --minimal
```

Instala apenas Coordinator Skill, schemas, Workflows e templates essenciais.

## Merge seguro

O instalador:

- nunca remove arquivos do projeto;
- escreve somente paths ChromaRelay;
- não sobrescreve por padrão;
- atualiza o bloco `BEGIN CHROMARELAY`/`END CHROMARELAY` em `AGENTS.md`;
- produz manifest com versão e hashes;
- permite dry-run.

## Atualização

Faça backup ou commit antes de atualizar. Execute:

```bash
node scripts/install.mjs --target ../produto --omp --dry-run
node scripts/install.mjs --target ../produto --omp --force
```

Compare `install-manifest.json` e reveja mudanças em Skills, hook e schemas.

## Remoção

Remover ChromaRelay significa apagar apenas:

- `.chromarelay/`;
- arquivos `chromarelay-*` em `.omp/`;
- Skills `chromarelay-*` em `.agents/skills/`;
- bloco delimitado em `AGENTS.md`.

Nunca use uma rotina de remoção baseada em glob sem conferir o manifest.

## Distribuição futura

O núcleo poderá ser publicado como pacote npm e o adapter OMP como extensão. Até esse momento, o instalador do repositório é a fonte de distribuição.
