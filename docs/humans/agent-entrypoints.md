# Como iniciar cada conversa e qual agente usar

## Regra padrão

Comece sempre com o Coordinator, não com um especialista:

```text
/createive <objetivo e contexto>
```

O Coordinator roteia, compila contexto e chama a Role correta. Invocar especialistas diretamente é útil apenas para debugging ou um trabalho já delimitado por Phase Packet.

## Cenários

| Situação | Entrada | Primeira Role especialista |
| --- | --- | --- |
| Ideia nova sem design | `/createive workflow=CREATE ...` | Product Strategist |
| Design existente sem docs | `/createive workflow=DOCUMENT ...` | Inspector |
| Design ruim e mudança ampla | `/createive workflow=REDESIGN ...` | Product Strategist + Inspector em fases separadas |
| Precisa de ideias criativas | `/createive workflow=EXPLORE ...` | Product Strategist, depois Art Directors independentes |
| Melhorar seção/componente | `/createive workflow=REFINE ...` | Inspector, depois Visual Critic |
| Retomar trabalho | `/createive-resume` | Role da Phase ativa |
| Ver estado | `/createive-status` | nenhuma; leitura determinística |
| Criar experimento | `/createive-eval ...` | Coordinator de eval |

## Entradas úteis

### CREATE

```text
/createive workflow=CREATE
Produto: central de agentes de pesquisa.
Usuário: pessoa técnica acompanhando trabalho paralelo.
Tarefa: entender estado e intervir.
Percepção: preciso, vivo, avançado; não um dashboard SaaS genérico.
Não pode mudar: arquitetura de dados.
Aberto: direção, composição, tipografia e motion.
Autonomia: guarded.
```

### DOCUMENT

```text
/createive workflow=DOCUMENT
Inspecione todas as rotas públicas e estados críticos. Gere documentação as-is com Evidence e confiança. Não sugira correções até a fidelity validation.
```

### REDESIGN

```text
/createive workflow=REDESIGN
Preserve conteúdo, comportamento e SEO. Diagnostique causa raiz antes de gerar três mundos substitutos e valide um lighthouse pilot contra a Baseline.
```

### EXPLORE

```text
/createive workflow=EXPLORE
Pergunta: como comunicar atividade paralela e controle sem cards de dashboard genéricos? Gere Directions independentes e selecione por torneio cego.
```

### REFINE

```text
/createive workflow=REFINE
Alvo: primeira dobra da página X. Preserve identidade e conteúdo. Capture Baseline, formule hipótese e compare before/after de forma cega.
```

## Invocação direta de especialistas

Só faça quando já existir Phase Packet e output schema:

```text
Use createive-inspector com .createive/runs/<id>/phase-packets/<phase>.json
```

Nunca envie um pedido aberto diretamente ao Builder ou Repairer.
