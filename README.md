# ChromaRelay Design OS

ChromaRelay é um sistema portátil de gerenciamento de trabalho criativo para agentes. Ele coordena descoberta, documentação, exploração de direções, criação de sistemas de design, implementação, auditoria, crítica visual, reparo e promoção de decisões aprovadas.

O objetivo não é impor um estilo. O objetivo é preservar liberdade durante a exploração e aumentar consistência depois que uma direção é escolhida.

## Princípios

1. **Divergir antes de decidir.** Direções criativas são produzidas em contextos independentes e comparadas antes da implementação.
2. **Convergir depois da escolha.** A direção selecionada vira contrato, tokens, componentes e regras de superfície.
3. **Criador não é juiz final.** Auditoria determinística e crítica visual são responsabilidades separadas.
4. **Skills são orientação, não verdade.** Requisitos, decisões bloqueadas e contratos do projeto têm precedência.
5. **Contexto mínimo por fase.** Cada agente recebe apenas o necessário para sua responsabilidade atual.
6. **Evidência antes de promoção.** Experimentos permanecem em Runs; apenas decisões aprovadas entram no estado canônico.
7. **Processo proporcional.** Mudanças triviais não passam por um torneio criativo; decisões sistêmicas não são tratadas como pequenos patches.

## Workflows

| Workflow | Uso principal |
| --- | --- |
| `CREATE` | Criar uma direção e uma implementação do zero |
| `DOCUMENT` | Transformar um design existente sem documentação em um modelo operacional confiável |
| `REDESIGN` | Substituir uma expressão visual fraca preservando verdades e comportamentos do produto |
| `EXPLORE` | Gerar e selecionar direções criativas independentes |
| `REFINE` | Melhorar uma base localizada por hipótese, comparação e verificação |

Os workflows compartilham o mesmo núcleo, mas entram e saem em fases diferentes. Consulte [docs/humans/workflows.md](docs/humans/workflows.md).

## Arquitetura

ChromaRelay usa um **Coordinator** como único dono do estado canônico. Especialistas trabalham em Runs isolados, devolvem Handoffs estruturados e não promovem diretamente decisões para o projeto.

```text
Request
  -> Workflow Router
  -> Run Contract
  -> Phase Packet
  -> Specialist Agent(s)
  -> Structured Handoff
  -> Coordinator Transition
  -> Deterministic Audit + Blind Visual Critique
  -> Bounded Repair
  -> Promotion to Canonical Project State
```

O núcleo é portátil. O adapter principal incluído neste repositório é para [OMP / oh-my-pi](https://omp.sh), com agentes especializados, model roles, prompt templates, slash commands, hooks, custom tools, isolamento e coordenação por `hub`/IRC.

## Estrutura do repositório

```text
.agents/skills/       Skills portáveis e carregadas sob demanda
.omp/                 Adapter OMP: agentes, comandos, prompts, hook e custom tool
framework/            Registries, workflows, schemas, templates e rubrics
src/                  Núcleo TypeScript e CLI
scripts/              Instalador do Project Overlay
examples/             Exemplos mínimos
evals/                Playground de evals, isolado por seam
docs/humans/          Instruções para pessoas
docs/agents/          Contratos para agentes
docs/architecture/    Arquitetura do sistema
docs/adr/             Decisões difíceis de reverter
```

## Início rápido

```bash
npm install
npm run build
npm test
node scripts/install.mjs --target /caminho/do/projeto --omp
```

No projeto de destino:

```text
/chromarelay <descreva o trabalho>
```

O Coordinator classificará o pedido, criará um Run Contract e carregará apenas o kit necessário para a primeira fase.

Leia [docs/humans/quickstart.md](docs/humans/quickstart.md) e [docs/humans/omp-integration.md](docs/humans/omp-integration.md).

## Evals

O playground de evals fica neste repositório porque os contracts, rubrics e fixtures precisam evoluir junto com o sistema. Ele está atrás de interfaces próprias e poderá ser separado quando tiver ciclo de release, volume de artefatos ou custo de CI independentes. Veja [ADR-0002](docs/adr/0002-keep-evals-in-this-repository-initially.md).

## Estado

Esta base define o sistema operacional, os contratos, o adapter OMP e o harness inicial. Integrações visuais específicas, registries externos de componentes e runners multimodais podem ser adicionados sem ampliar a interface do Coordinator.
