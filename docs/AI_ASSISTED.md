# Desenvolvimento Assistido por IA, Harness e Otimização de Contexto

Este eixo é **parte central** da avaliação. Queremos entender como você usa IA de
forma **profissional e rastreável**, não apenas como autocomplete. Preencha as
seções abaixo no seu fork.

---

## 1. O que é "Harness" aqui

_Harness_ é o conjunto de mecanismos que **prendem a IA (e o humano) ao trilho da
qualidade**: testes automatizados, _linters_, _type checkers_, _contract tests_,
_self-checks_, _pre-commit hooks_ e _quality gates_ de CI. Eles garantem que
código gerado (por você ou por IA) só entra se **passar em verificações
objetivas**.

Esperamos ver **pelo menos um mecanismo de harness real e executável** no repo
(ex.: um `pytest`/`vitest`/`go test` que roda, um _linter_ configurado, um
_contract test_ de schema MQTT, ou um _self-check_ do cálculo de OEE).

### Harness real utilizado neste repositório

| Mecanismo | Papel |
|-----------|--------|
| TypeScript (`tsc --noEmit`) | Validação estática |
| ESLint | Padrões e qualidade de código |
| Vitest | Testes unitários e regras de domínio (OEE + contratos MQTT) |
| Coverage (threshold ≥ 85%) | Critério objetivo no CI |
| Ajv + JSON Schema | Contract tests MQTT |
| Redocly | Validação do OpenAPI |
| GitHub Actions | Quality gates automatizados |
| SonarCloud (S1) | Análise quando `SONAR_TOKEN` está configurado |

A IA **não** é uma etapa de validação: ela auxilia na produção e revisão; o harness executável determina a aceitação técnica.

---

## 2. Otimização de contexto

Ferramentas de IA rendem mais quando o repositório é **legível para máquinas**.
Demonstre isso com artefatos como:

- `AGENTS.md` / `.github/copilot-instructions.md` - convenções, comandos, arquitetura.
- `CONVENTIONS.md` - padrões de código, nomenclatura, _boundaries_.
- Prompts versionados (ex.: `prompts/` ou `.prompts/`) para tarefas repetíveis.
- Documentação estruturada e _links_ cruzados (como este repositório).
- READMEs por módulo/serviço que explicam propósito e contratos.

> Objetivo: um agente de IA (ou um novo dev) deveria conseguir **se orientar
> sozinho** no seu projeto.

Neste fork, o contexto persistente está em `AGENTS.md`, ADRs, `docs/`, contratos versionados e READMEs por serviço. Prompts decisivos ficam registrados na seção 3.5 abaixo (sem coleção extensa em diretório separado).

---

## 3. Registro de uso de IA

A seção abaixo registra o histórico real de uso de IA durante a construção da solução. A ferramenta foi utilizada como apoio de engenharia, revisão e exploração de alternativas; as decisões finais permaneceram sob responsabilidade arquitetural do projeto.

O objetivo é demonstrar uso profissional e rastreável: contexto fornecido, hipóteses avaliadas, decisões tomadas, correções realizadas e mecanismos de validação utilizados.

### 3.1 Ferramentas utilizadas

| Ferramenta | Para quê usei | Modelo/versão (se souber) |
|------------|---------------|---------------------------|
| Cursor (Agent) | Apoio na arquitetura, documentação, contratos, modelagem do OEE, organização do repositório e revisão técnica | Composer / agente da sessão |

### 3.2 Decisões em que a IA ajudou — e onde eu discordei dela

Exemplos reais de validação arquitetural neste desafio:

**QoS MQTT**  
Sugestão inicial: garantia máxima de entrega de forma uniforme (ex.: QoS 2 em tudo).  
**Decisão adotada:** QoS diferenciado (0/1/1/1), conforme a natureza dos eventos, combinado com `event_id` e idempotência.

**Cálculo de OEE**  
Sugestões simplificadas (incluindo lógica próxima à “média dos fatores”) foram descartadas quando não representavam a métrica industrial.  
**Decisão adotada:** produto Disponibilidade × Performance × Qualidade, com clamp e `dados_inconsistentes`.

**Escopo arquitetural**  
Alternativa inicial: implementar múltiplos serviços com runtime completo.  
**Decisão adotada:** microsserviços lógicos, com núcleo executável do OEE e contratos documentados (OpenAPI + JSON Schema).

**Persistência**  
Alternativa considerada: time-series totalmente gerenciada (ex.: Amazon Timestream).  
**Decisão adotada:** PostgreSQL + TimescaleDB (RDS), equilibrando consultas operacionais, séries temporais e portabilidade.

**Forma de entrega**  
Alternativa: walking skeleton com vários serviços executáveis.  
**Decisão adotada:** wireframe + OpenAPI + núcleo OEE executável.

**Sonar no CI**  
Alternativa: Sonar obrigatório em todos os ambientes.  
**Decisão adotada:** integração condicional (S1) via `SONAR_TOKEN`, sem bloquear forks sem credenciais.

### 3.3 O que eu revisei/corrigi no que a IA gerou

Principais revisões:

- Ajustes no modelo de OEE para evitar cálculos incorretos e mascaramento de perdas.
- Inclusão de clamp nos fatores e sinalização de `dados_inconsistentes`.
- Revisão de cenários de teste (incluindo regressão produto ≠ média e inconsistências).
- Estratégia de fixtures MQTT **opção A**: exemplos em `data/exemplos-mqtt/` **não foram alterados**; `event_id` só em fixtures derivadas de teste.
- Validação de contratos MQTT via JSON Schema (Ajv).
- Revisão do OpenAPI: YAML válido, metadados (`license`), `security: []` explícito, lint Redocly.
- Ajustes de coverage para quality real (branches), não apenas linhas superficiais.

### 3.4 Como otimizei o repositório para IA

O repositório foi organizado para que agentes e novos desenvolvedores recuperem contexto sem depender da conversa original:

- `AGENTS.md` — convenções, comandos e regras do MVP;
- ADRs — decisões arquiteturais;
- READMEs por serviço;
- documentação estruturada em `docs/`;
- contratos versionados separados da implementação (`mqtt-contracts`, `openapi.yaml`).

Objetivo: transformar conhecimento implícito em contexto persistente e reutilizável.

### 3.5 Prompts relevantes

Não foi criada uma coleção extensa em `prompts/`. Seguem apenas os prompts com impacto direto nas decisões.

**Prompt 1 — Revisão arquitetural**  
Racional: validar coerência com o desafio e trade-offs antes da implementação.

> Atue como arquiteto de software revisando uma solução OEE industrial. Avalie arquitetura, limites de serviço, contratos MQTT, persistência e riscos. Não proponha código antes de validar as decisões.

**Prompt 2 — Auditoria de escopo**  
Racional: evitar overengineering e manter foco nos critérios avaliados.

> Analise esta solução considerando um desafio técnico com prazo limitado. Identifique o que deve ser implementado, documentado ou explicitamente deixado fora do MVP, justificando cada decisão.

**Prompt 3 — Revisão crítica de domínio**  
Racional: questionar regras de negócio e evitar respostas genéricas.

> Revise este modelo de cálculo OEE como especialista industrial. Procure simplificações incorretas, casos extremos, inconsistências matemáticas e pontos que precisam ser auditáveis.

---

## 4. Como isso é avaliado (objetivo)

| Sub-critério | Atende quando... |
|--------------|------------------|
| Harness executável presente | Há teste/linter/contract-test que roda e falha se algo quebra |
| Uso de IA documentado | `AI_ASSISTED.md` preenchido com decisões e revisões reais |
| Otimização de contexto | Existe ≥1 artefato (AGENTS.md/instructions/prompts) útil e coerente |
| Pensamento crítico sobre IA | Há ao menos um caso em que o candidato **discordou/corrigiu** a IA |
