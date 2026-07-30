# Trade-offs arquiteturais

Este documento registra as principais alternativas consideradas e o motivo da descarte **no contexto deste desafio**. As decisões adotadas estão consolidadas em [DECISOES.md](./DECISOES.md); o detalhamento das escolhas arquiteturais centrais está nos [ADRs](./adr/).

| # | Trade-off | Escolha | Alternativas |
|---|-----------|---------|--------------|
| 1 | Forma de entrega | Wireframe + OpenAPI + núcleo executável | Walking skeleton completo |
| 2 | Organização da solução | Microsserviços lógicos | Monólito, múltiplos runtimes, polyrepo |
| 3 | Estratégia MQTT | QoS 0/1/1/1 | QoS 2 em todos os tópicos |
| 4 | Idempotência | `event_id` + fallback | Apenas chave composta |
| 5 | Persistência | PostgreSQL + TimescaleDB | Amazon Timestream, PostgreSQL puro, Data Lake |

---

## 1. Forma de entrega

**Escolha:** Wireframe + OpenAPI + núcleo executável.

**Alternativa descartada:** Walking skeleton completo (vários serviços e UI rodando ponta a ponta).

**Motivo:** O edital prioriza profundidade arquitetural e justificativa das decisões. Essa abordagem concentra o esforço na modelagem, contratos e regras de negócio (OEE), reduzindo complexidade de infraestrutura no MVP.

**Custo aceito:** Menor capacidade de demonstração ponta a ponta em runtime.

**Referência:** [ARQUITETURA.md](./ARQUITETURA.md).

---

## 2. Organização da solução

**Escolha:** Microsserviços lógicos (`mqtt-ingestion`, `oee-service`, `dashboard-api`, `dashboard-ui`) em um único repositório de entrega.

**Alternativas descartadas:** Monólito único; quatro serviços com runtime completo no MVP; polyrepo.

**Motivo:** O eixo de avaliação exige limites de serviço explícitos. Microsserviços lógicos demonstram separação de responsabilidades e evolução independente sem exigir múltiplos deploys no prazo do desafio; o fork único pedido pelo edital desencoraja polyrepo.

**Custo aceito:** Ingestão e UI ficam mais evidentes na documentação do que em processos em execução.

**Referência:** [ADR-001](./adr/001-microsservicos-logicos.md).

---

## 3. Estratégia MQTT (QoS)

**Escolha:** QoS 0 para telemetria; QoS 1 para estado, parada e produção.

**Alternativa descartada:** QoS 2 em todos os tópicos.

**Motivo:** No cenário industrial do desafio, telemetria é de alta frequência e menor criticidade pontual para o OEE; estado, parada e produção alimentam o indicador e precisam de ao menos uma entrega, com idempotência na aplicação. QoS 2 eleva custo/latência sem eliminar a necessidade de deduplicação.

**Custo aceito:** A perda eventual de mensagens de telemetria é aceitável no MVP enquanto os eventos de negócio permanecem em QoS 1.

**Referência:** [ADR-002](./adr/002-mqtt-qos-event-id.md).

---

## 4. Idempotência

**Escolha:** `event_id` como chave principal, com fallback `maquina_id + ts_sensor + tipo_evento`.

**Alternativa descartada:** Apenas chave composta, sem `event_id`.

**Motivo:** As fixtures do desafio incluem duplicatas e fora de ordem. Um identificador explícito torna a deduplicação auditável, testável e evolutiva; a chave composta sozinha é ambígua sob retransmissão.

**Custo aceito:** Extensão controlada do contrato mínimo de mensagem (documentada e versionada em `*.v1`).

**Referência:** [ADR-002](./adr/002-mqtt-qos-event-id.md).

---

## 5. Persistência

**Escolha:** PostgreSQL + TimescaleDB em Amazon RDS.

**Alternativas descartadas:** Amazon Timestream; PostgreSQL sem extensão temporal; data lake (S3) como fonte primária do dashboard.

**Motivo:** O dashboard exige consultas por máquina/turno sobre dados temporais e agregações de OEE. Timescale cobre a dimensão temporal com SQL portável; Timestream aumenta lock-in; Postgres puro encarece janelas longas; S3 não atende bem leitura operacional quase em tempo real.

**Custo aceito:** Operação da extensão Timescale no RDS e política de retenção de raw a detalhar quando houver runtime.

**Referência:** [ADR-003](./adr/003-persistencia-timescaledb.md).
