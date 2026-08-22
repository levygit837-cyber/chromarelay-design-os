# Contexto, autonomia e consistência

## Regra central

O Coordinator conhece o mapa. Cada especialista conhece apenas sua região atual.

Carregar toda a documentação e todas as Skills em todos os agentes reduz clareza, mistura autoridades e aumenta convergência para respostas medianas.

## O que fica permanente

No contexto do Coordinator:

- glossário;
- índice dos Workflows;
- registry de Roles, Skill Kits e Gates;
- Run Contract ativo;
- Locks e constraints relevantes;
- ponteiros para Artifacts.

No contexto de um especialista:

- contrato da Role;
- Phase Packet;
- uma Skill primária;
- até duas referências estreitas;
- schemas de saída;
- paths e non-goals explícitos.

## O que nunca deve ser injetado por padrão

- todos os transcripts;
- todas as Skills de design;
- todas as Directions concorrentes antes da divergência terminar;
- reasoning de criadores no crítico cego;
- relatórios antigos sem relação com a Phase;
- arquivos canônicos inteiros quando apenas um trecho é necessário.

## Phase Packet

Todo Phase Packet contém:

```text
Goal
Scope
Inputs
Locks
Open decisions
Role authority
Primary skill
Supporting references
Output schema
Acceptance evidence
Exit policy
Non-goals
```

Ele não contém instruções contraditórias. O Context Compiler resolve precedência e registra conflitos antes do dispatch.

## Sandboxes

- Roles de leitura não recebem ferramentas de edição.
- Builders e Repairers usam worktree isolada quando disponível.
- Handoffs são persistidos antes de qualquer merge.
- O Coordinator avalia patches e aplica apenas depois dos gates exigidos.
- `.createive/project` não é área de rascunho.

## Locks

Um Lock não elimina criatividade. Ele declara que uma decisão já foi tomada em determinado escopo. Um agente pode propor reabertura, mas não substituir silenciosamente.

Uma proposta de reabertura precisa informar:

- Lock afetado;
- motivo;
- Evidence nova;
- impacto;
- alternativas;
- custo de reversão.

## Escolhas reversíveis

Em modo `guarded`, o sistema decide automaticamente escolhas reversíveis quando:

- respeitam Locks;
- possuem Evidence suficiente;
- não alteram identidade global;
- não geram desacordo material entre críticos.

## Escalonamento humano

O Coordinator pede uma decisão humana somente quando o valor da decisão supera o custo da interrupção. A pergunta deve apresentar no máximo três opções, diferenças materiais, Evidence e recomendação.
