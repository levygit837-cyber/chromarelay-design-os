# Playground de Evals

## Decisão

O playground começa neste repositório, sob `evals/`, porque precisa compartilhar schemas, rubrics e versões do Workflow. Ele usa um seam próprio para permitir extração posterior.

## Pergunta principal

O sistema melhora designs em relação a um agente forte sem ChromaRelay?

A resposta não deve depender apenas de um score do mesmo modelo que criou o design.

## Comparação básica

Para cada Eval Case:

1. congele brief, assets, stack e seed quando aplicável;
2. execute Baseline sem ChromaRelay;
3. execute Candidate com ChromaRelay;
4. normalize ambiente, viewport e dados;
5. aplique gates determinísticos;
6. faça comparação visual pareada e cega;
7. use críticos de modelos diferentes;
8. registre custo, latência, iterações e intervenção humana.

## Métricas

### Qualidade

- product fit;
- hierarquia;
- especificidade;
- composição;
- tipografia;
- coerência;
- responsividade;
- craft;
- qualidade fora do happy path.

### Consistência

- drift de tokens;
- reutilização de componentes;
- variação não justificada entre Surfaces;
- fidelidade a Locks.

### Criatividade

- distância material entre Directions;
- memorabilidade;
- ausência de default template;
- system potential;
- originalidade sem cópia.

### Operacional

- tokens e custo;
- wall time;
- número de Runs/fases;
- reparos necessários;
- taxa de falha de schema;
- quantidade de decisões humanas.

## Blindagem

- remova nomes `baseline` e `candidate` dos pacotes de julgamento;
- randomize lado A/B;
- não forneça reasoning do criador;
- mantenha detector report oculto até o primeiro parecer visual;
- registre discordância, não force consenso artificial.

## Quando separar o repositório

Extraia o eval harness quando pelo menos uma condição ocorrer:

- fixtures e screenshots dominarem o tamanho do repo;
- CI de evals tiver ciclo e credenciais próprios;
- outros sistemas consumirem o runner sem consumir ChromaRelay;
- releases de rubrics precisarem de versionamento independente.
