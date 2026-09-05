# Changelog

Todas as mudanças notáveis neste projeto são documentadas neste arquivo.

O formato segue de perto o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.1.0] - 2026-09-05

Versão inicial de base do ChromaRelay Design OS: o núcleo portátil de
gerenciamento de trabalho de design para times de agentes, instalável como
Project Overlay em outro repositório.

### Added

- Núcleo `DesignManager`: roteamento entre os cinco workflows (`CREATE`,
  `DOCUMENT`, `REDESIGN`, `EXPLORE`, `REFINE`), máquina de estados de fases,
  Handoffs estruturados e Promotion para o estado canônico do projeto.
- CLI (`route`, `start`, `status`, `phase`, `handoff`, `advance`, `validate`,
  `validate-framework`) para operar Runs a partir do terminal.
- Instalador do Project Overlay (`scripts/install.mjs --target ... --omp`,
  com `--minimal`, `--force` e `--dry-run`).
- Framework declarativo em `framework/`: registries de workflows, agentes,
  kits, gates, skills e surfaces, além de schemas, templates e rubricas.
- Skills de agente por papel e adapter OMP (agentes, comandos, prompts,
  hook de guarda e custom tool `chromarelay_state`).
- Phase Packets com entradas resolvíveis, livro-razão de resultados de Gate
  e transições honradas entre fases.
- Atribuição de Skill em cada Handoff (rastreabilidade de qual Skill
  produziu o trabalho).
- Invariantes de autoridade e orçamento de contexto: o Coordinator é o
  único dono do estado canônico, o criador nunca é o juiz final do próprio
  trabalho, e cada fase recebe no máximo 1 skill primária e 2 de apoio.

### Changed

- Renomeação do sistema de Createive para ChromaRelay em todo o
  repositório, framework, skills e documentação.
- Corpos de agente alinhados aos contratos das skills, sem duplicação, e
  falando o enum de transições do Coordinator.

### Fixed

- Fechamento dos sete gaps de conformidade P-0/P-1 (incluindo a Skill de
  crítica referenciando um campo de rubrica existente).
- Validação cruzada do framework (`validate-framework`) cobrindo
  referências de fases a papéis, kits e gates conhecidos.

[Unreleased]: https://github.com/levygit837-cyber/chromarelay-design-os/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/levygit837-cyber/chromarelay-design-os/releases/tag/v0.1.0
