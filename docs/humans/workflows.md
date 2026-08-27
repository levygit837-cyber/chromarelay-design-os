# Workflows do ChromaRelay

Cada Workflow é uma state machine reutilizável. O Coordinator pode pular fases somente quando a política da fase e o nível da decisão justificarem.

## CREATE

Use quando existe uma ideia de produto, mas não existe direção visual canônica.

```text
intake
-> grounding
-> domain exploration
-> independent directions
-> visual specimens
-> blind tournament
-> canonization
-> information architecture
-> component plan
-> lighthouse implementation
-> deterministic audit
-> blind visual critique
-> bounded repair
-> promotion
```

Saída: produto documentado, Direction selecionada, `DESIGN.md`, tokens, contratos de Surface, implementação piloto e Evidence.

Não use CREATE para uma pequena alteração em projeto já consistente.

## DOCUMENT

Use quando há design ou código existente, mas não existe representação operacional confiável.

```text
freeze baseline
-> code inventory
-> render inventory
-> as-is model
-> fidelity validation
-> canonical analysis
-> opportunity map
-> route to maintenance, REFINE or REDESIGN
```

A documentação distingue `observed`, `inferred`, `proposed`, `approved`, `locked` e `deprecated`. Frequência não vira intenção automaticamente.

Saída: `AS_IS_DESIGN`, inventários de tokens/componentes/estados, Drift Report e Opportunity Map.

## REDESIGN

Use quando o problema é sistêmico, composicional, estrutural ou identitário.

```text
preserve product truths
-> root-cause diagnosis
-> redesign charter
-> target-world divergence
-> lighthouse pilot
-> baseline comparison
-> design system v2
-> migration waves
-> full verification
-> promotion
```

O sistema antigo permanece disponível até o piloto vencer a Baseline. Migração usa expand-contract quando uma troca ampla não pode permanecer verde em um único slice.

## EXPLORE

Use quando a decisão principal ainda é criativa, não implementacional.

```text
frame the creative question
-> define exploration axes
-> independent generation
-> eligibility gate
-> visual prototypes
-> pairwise tournament
-> system-potential review
-> select or preserve finalists
```

As Directions devem divergir em pelo menos três eixos materiais: composição, tipografia, navegação, densidade, superfícies, ritmo, motion ou assinatura.

O mesmo agente não deve gerar todas as opções quando diversidade for crítica. Use contextos independentes e, de preferência, mais de um modelo.

## REFINE

Use quando existe uma base razoável e o alvo é localizado.

```text
bound scope
-> capture baseline
-> diagnose
-> form hypothesis
-> explore only uncertain decisions
-> coherent change batch
-> blind before/after
-> deterministic audit
-> promote or revert
```

Cada mudança deve responder a uma hipótese observável. Se o diagnóstico exigir trocar identidade, shell e arquitetura de informação, o trabalho deve ser reclassificado como REDESIGN.

## Composição

Workflows podem encadear:

- `DOCUMENT -> REFINE`;
- `DOCUMENT -> REDESIGN`;
- `CREATE -> EXPLORE -> canonization`;
- `REDESIGN -> EXPLORE -> pilot`;
- `REFINE -> REDESIGN` quando a causa raiz for sistêmica.

## Processo proporcional

| Nível | Exemplo | Processo mínimo |
| --- | --- | --- |
| 0 | typo, label, alinhamento óbvio | corrigir e verificar |
| 1 | componente ou seção | Baseline, hipótese, mudança, comparação |
| 2 | página ou Surface central | brief, 2-3 Directions, seleção, auditoria |
| 3 | sistema ou produto | Workflow completo, piloto e promoção controlada |
