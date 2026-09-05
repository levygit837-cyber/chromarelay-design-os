# Como iniciar cada conversa e qual agente usar

## Regra padrão

Comece sempre com o Coordinator, não com um especialista:

```text
/chromarelay <objetivo e contexto>
```

O Coordinator roteia, compila contexto e chama a Role correta. Invocar especialistas diretamente é útil apenas para debugging ou um trabalho já delimitado por Phase Packet.

## Cenários

| Situação | Entrada | Primeira Role especialista |
| --- | --- | --- |
| Ideia nova sem design | `/chromarelay workflow=CREATE ...` | Product Strategist |
| Design existente sem docs | `/chromarelay workflow=DOCUMENT ...` | Inspector |
| Design ruim e mudança ampla | `/chromarelay workflow=REDESIGN ...` | Product Strategist + Inspector em fases separadas |
| Precisa de ideias criativas | `/chromarelay workflow=EXPLORE ...` | Product Strategist, depois Art Directors independentes |
| Melhorar seção/componente | `/chromarelay workflow=REFINE ...` | Inspector, depois Visual Critic |
| Retomar trabalho | `/chromarelay-resume` | Role da Phase ativa |
| Ver estado | `/chromarelay-status` | nenhuma; leitura determinística |
| Criar experimento | `/chromarelay-eval ...` | Coordinator de eval |

## Entradas úteis

### CREATE

```text
/chromarelay workflow=CREATE
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
/chromarelay workflow=DOCUMENT
Inspecione todas as rotas públicas e estados críticos. Gere documentação as-is com Evidence e confiança. Não sugira correções até a fidelity validation.
```

### REDESIGN

```text
/chromarelay workflow=REDESIGN
Preserve conteúdo, comportamento e SEO. Diagnostique causa raiz antes de gerar três mundos substitutos e valide um lighthouse pilot contra a Baseline.
```

### EXPLORE

```text
/chromarelay workflow=EXPLORE
Pergunta: como comunicar atividade paralela e controle sem cards de dashboard genéricos? Gere Directions independentes e selecione por torneio cego.
```

### REFINE

```text
/chromarelay workflow=REFINE
Alvo: primeira dobra da página X. Preserve identidade e conteúdo. Capture Baseline, formule hipótese e compare before/after de forma cega.
```

## Invocação direta de especialistas

Só faça quando já existir Phase Packet e output schema:

```text
Use chromarelay-inspector com .chromarelay/runs/<id>/phase-packets/<phase>.json
```

Nunca envie um pedido aberto diretamente ao Builder ou Repairer.
