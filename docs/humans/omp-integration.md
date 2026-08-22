# Integração com OMP / oh-my-pi

Createive usa OMP como adapter principal de execução. O núcleo continua independente do harness.

## Subagentes e `task.batch`

O Coordinator deve usar um batch para trabalhos independentes, com contexto compartilhado mínimo e uma tarefa específica por agente.

```json
{
  "context": "# Goal\nGerar Directions independentes.\n# Constraints\nNão ver propostas concorrentes.\n# Contract\nRetornar o schema Direction.",
  "tasks": [
    {
      "name": "instrument-direction",
      "agent": "createive-art-director",
      "task": "# Target\nDirection A\n# Change\nExplore o produto como instrumento de precisão.\n# Acceptance\nUma tese coerente, riscos e specimen.",
      "effort": "hi",
      "outputSchema": {},
      "schemaMode": "strict"
    }
  ]
}
```

Sempre forneça `outputSchema` explícito para Handoffs importantes. Agentes começam sem histórico do pai; passe payloads grandes por arquivos ou URIs locais, não por uma mensagem gigantesca.

Use `isolated: true` para Builder e Repairer. Agentes isolados não são revividos depois que o workspace é encerrado, portanto o Handoff precisa ser completo.

## IRC e `hub`

Use `hub` para:

- esclarecer uma constraint durante uma execução;
- pedir Evidence ausente;
- receber progresso sem injetar todo o transcript;
- coordenar finalização de jobs;
- reviver um agente não isolado quando uma continuação pequena for mais barata que novo dispatch.

Não use IRC para criar consenso entre Art Directors durante divergência. Isso destruiria independência. O Coordinator recebe as propostas e controla a comparação.

`Alt+A` abre o Agent Hub para supervisão humana.

## Model roles

Agentes referenciam aliases, não IDs concretos. Exemplo para `~/.omp/agent/config.yml`:

```yaml
modelRoles:
  createive_coordinator: "@slow"
  createive_product: "@slow"
  createive_research: "@task"
  createive_art: "@designer"
  createive_system: "@slow"
  createive_builder: "@default"
  createive_auditor: "@task"
  createive_critic: "@slow"
  createive_repair: "@default"
  createive_advisor: "@slow"

task:
  maxConcurrency: 6
  maxRecursionDepth: 2
  enableEffort: true
```

Mapeie criação e crítica para famílias de modelos diferentes quando a decisão for importante. Alterar `modelRoles` muda o roteamento sem editar agentes.

## Agents

Os agentes de projeto ficam em `.omp/agents/*.md`. Project agents têm precedência sobre user e bundled agents de mesmo nome.

- Coordinator pode spawnar especialistas.
- Especialistas não recebem `task` e não spawnam outros agentes por padrão.
- Tool lists restringem Roles de leitura.
- `autoloadSkills` injeta apenas a Skill primária da Role.

## Skills

As Skills ficam em `.agents/skills/<name>/SKILL.md`, que OMP descobre como capability. O system prompt recebe apenas metadata; o conteúdo é lido sob demanda via `skill://<name>`.

O Coordinator usa o registry para selecionar no máximo uma Skill primária e duas referências estreitas por Phase.

## Prompt templates

Templates em `.omp/prompts/` servem para formatos repetitivos internos, como Direction proposal, audit handoff e blind critique. Eles aceitam argumentos e não devem substituir o Run Contract.

## Slash commands

Comandos em `.omp/commands/` são entry points humanos:

- `/createive` inicia e roteia;
- `/createive-resume` retoma o Run ativo;
- `/createive-status` resume estado sem alterar;
- `/createive-eval` cria um Eval Case.

Eles expandem para instruções do Coordinator; não duplicam a lógica da state machine.

## Hook de proteção

O hook Createive bloqueia raw writes em:

- `.createive/system/`;
- `.createive/project/`.

Promotion normal usa o custom tool/CLI. O hook não bloqueia código do produto nem arquivos de Run.

A variável `CREATEIVE_UNSAFE_CANONICAL_WRITE=1` existe apenas para recuperação manual consciente.

## Custom tool

O custom tool `createive_state` oferece operações determinísticas de status, registro de eventos, validação de paths e Promotion. Ele não decide estética e não executa crítica.

Custom tools são apropriadas aqui porque o modelo precisa chamar código com schema e efeitos controlados. Skills continuam estáticas; hooks continuam interceptores.

## Advisor

Habilite advisor no Coordinator para mudanças de sistema, redesign de alto risco e decisões que reabrem Locks. Não habilite por padrão em cada especialista: custo e opiniões correlacionadas podem aumentar sem melhorar a saída.

## Compaction e retomada

Preserve Run Contract, Decision index, Artifact pointers e Phase Packet atual. Não tente preservar todo reasoning. Artifacts são a memória operacional.
