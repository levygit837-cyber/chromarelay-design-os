# Arquitetura do Createive Design OS

## Objetivo arquitetural

O sistema deve esconder orquestração, transições, autoridade, contexto e persistência atrás de uma interface pequena. O Coordinator trabalha com Runs, Phase Packets e Handoffs; ele não precisa conhecer detalhes de cada adapter de harness.

## Módulos profundos

### Design Manager

Interface externa:

- classificar um Design Work;
- iniciar ou retomar um Run;
- compilar o Phase Packet atual;
- registrar um Handoff;
- validar e executar uma transição;
- promover decisões e Artifacts aprovados.

A implementação esconde routing, state machine, skill budgets, políticas de autoridade, schemas e persistência. Este é o principal módulo profundo.

### Workspace

Interface externa:

- ler e escrever texto de forma atômica;
- verificar existência;
- listar paths;
- criar diretórios.

Adapters iniciais:

- filesystem para uso real;
- memória para testes.

A existência de dois adapters torna o seam real. Testes do Design Manager usam o adapter em memória e observam comportamento pela mesma interface.

### Harness Adapter

Converte Phase Packets em execução de agentes e Handoffs. O adapter OMP usa `task`, model roles, isolamento, output schemas e `hub`.

O núcleo não importa OMP. O adapter pode ser substituído por Codex, Claude Code ou execução própria sem alterar o modelo do Run.

### Gate Runner

Executa gates determinísticos ou prepara pacotes para críticos qualitativos. Um gate sempre produz Evidence; ele nunca promove decisões.

### Eval Harness

Consome os mesmos Run Contracts, Handoffs, Directions e rubrics do núcleo, mas possui seu próprio seam. O eval harness pode migrar para outro repositório sem alterar os Workflows.

## Estado

```text
.createive/
├── system/                 framework instalado; somente setup/upgrade escreve
├── project/                estado canônico; Coordinator promove
│   ├── PRODUCT.md
│   ├── CONSTRAINTS.md
│   ├── DESIGN.md
│   ├── DECISIONS.md
│   ├── EXCEPTIONS.md
│   ├── tokens/
│   └── components/
├── runs/
│   └── <run-id>/
│       ├── run.json
│       ├── request.json
│       ├── events.jsonl
│       ├── phase-packets/
│       ├── handoffs/
│       ├── evidence/
│       ├── candidates/
│       └── reports/
└── active-run.json
```

## Proteção contra corrupção de contexto

1. Especialistas começam sem histórico de conversa.
2. O Coordinator compila Phase Packets mínimos.
3. Art Directors independentes não veem as propostas uns dos outros na divergência inicial.
4. O crítico visual recebe screenshots e contratos, não reasoning do criador.
5. Especialistas escrevem apenas no Run ou em worktree isolada.
6. O estado canônico é alterado apenas por Promotion.
7. Compaction e retomada usam artifacts, não memória informal de chat.

## Fluxo de execução

```text
Design Work
  -> route()
  -> Run Contract
  -> compilePhasePacket()
  -> dispatch specialist(s)
  -> Handoff
  -> recordHandoff()
  -> evaluate exit policy
  -> advance | branch | return | request human decision | stop
```

## Liberdade e autoridade

Fases de divergência possuem grande espaço criativo. Depois da seleção, a Direction vira Lock de escopo apropriado. O sistema não bloqueia escolhas incomuns; ele exige que mudanças em Locks sejam explícitas, justificadas e avaliadas.

## Granularidade proporcional

O Router classifica o nível da decisão:

- `0`: correção trivial;
- `1`: refinamento localizado;
- `2`: direção de Surface;
- `3`: mudança sistêmica.

Níveis baixos pulam fases sem valor. Níveis altos exigem comparação e Evidence antes de compromisso.
