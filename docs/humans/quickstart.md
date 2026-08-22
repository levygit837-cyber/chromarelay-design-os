# Início rápido para humanos

## 1. Instalar o sistema em um projeto

No repositório Createive:

```bash
npm install
npm run build
node scripts/install.mjs --target /caminho/do/projeto --omp
```

O instalador faz merge, sem apagar arquivos existentes:

- copia o framework para `.createive/system/`;
- cria o estado inicial de `.createive/project/`;
- instala Skills portáveis em `.agents/skills/`;
- instala agentes, comandos, prompts, hook e custom tool em `.omp/`;
- adiciona um bloco delimitado ao `AGENTS.md` do projeto.

Use `--minimal` para instalar apenas o núcleo e a Skill do Coordinator. Use `--force` somente para atualizar arquivos Createive que você já revisou.

## 2. Abrir OMP no projeto de destino

Configure model roles conforme `docs/humans/omp-integration.md`, abra o OMP no root e invoque:

```text
/createive Quero criar uma central para gerenciar agentes de pesquisa...
```

Também é possível declarar o Workflow:

```text
/createive workflow=DOCUMENT documente o design atual antes de sugerir mudanças
/createive workflow=REDESIGN transforme o site mantendo conteúdo e comportamento
/createive workflow=EXPLORE gere direções para uma interface de orquestração
/createive workflow=REFINE melhore a primeira dobra sem alterar a identidade
```

## 3. O que o humano precisa fornecer

A entrada ideal possui:

```text
O que estou construindo:
Quem usa:
Tarefa principal:
O que precisa parecer ou comunicar:
O que não pode mudar:
O que está aberto:
Referências opcionais:
Escopo:
Modo de autonomia:
```

Não é necessário escolher grid, fonte, cor ou layout. Esses são problemas do sistema quando ainda estiverem abertos.

## 4. Modos de autonomia

- `assisted`: o humano aprova brief, Direction, sistema, piloto e resultado;
- `guarded`: recomendado; o sistema interrompe apenas para decisões ambíguas, irreversíveis ou de alto impacto;
- `full`: o sistema escolhe e executa decisões reversíveis sozinho, reportando Evidence.

## 5. Como acompanhar

```text
/createive-status
```

O status mostra Workflow, Phase atual, Artifacts necessários, agentes ativos, blockers e próxima decisão.

No OMP, use `Alt+A` para acompanhar subagentes. O Coordinator continua sendo o único interlocutor humano padrão.

## 6. Como retomar

```text
/createive-resume
```

A retomada lê `active-run.json`, o Run Contract e o último Phase Packet. Ela não injeta todo o transcript anterior.

## 7. Quando intervir

Intervenha quando:

- duas Directions finalistas representam produtos diferentes;
- um Lock de identidade precisa ser reaberto;
- críticos competentes discordam de forma material;
- uma decisão possui alto custo de reversão;
- o sistema não consegue distinguir requisito de preferência.

Não intervenha apenas para escolher valores de CSS que o sistema consegue testar e comparar.
