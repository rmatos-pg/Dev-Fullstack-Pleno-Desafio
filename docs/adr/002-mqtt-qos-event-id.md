# ADR-002: Estratégia MQTT (QoS, event_id e idempotência)

- **Status:** Aceito
- **Data:** 2026-07-30
- **Decisores:** Rodrigo Matos

## Contexto

A especificação técnica exige topologia previsível, QoS justificado, tratamento de ordem/duplicidade, backpressure, schema versionado e dead-letter. O chão de fábrica do cenário apresenta conectividade instável; as fixtures do repositório incluem duplicatas e eventos fora de ordem de propósito.

O cálculo de OEE depende de eventos de **estado**, **parada** e **produção**; telemetria é de alta frequência e menor criticidade pontual. É preciso definir a confiabilidade do fluxo de eventos de forma que o OEE permaneça consistente, sem complexidade desnecessária no MVP.

## Decisão

1. **Topologia** (mantida do enunciado):
   `fabrica/{galpao}/{linha}/{maquina}/{telemetria|estado|parada|producao}`
2. **QoS:** telemetria **0**; estado, parada e produção **1**.
3. **Idempotência:** chave principal `event_id` nos schemas `*.v1`; fallback `maquina_id + ts_sensor + tipo_evento`.
4. **Processamento:** validação JSON Schema em `mqtt-ingestion`; inválidos → DLQ; após aceitar, publicar em fila interna (SQS no desenho AWS) para `oee-service` (backpressure).
5. **Relógio:** `ts_sensor` para domínio; `ts_ingestao` para auditoria/lag.

**Por que neste desafio:** equilibra desempenho (telemetria) e confiabilidade (eventos que alimentam OEE), torna a deduplicação explícita perante retransmissões e atende idempotência/backpressure sem QoS 2 universal.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| QoS 2 em todos os tópicos | Entrega exatamente uma vez no protocolo | Custo e latência altos; ainda exige idempotência na aplicação | Pouco ganho frente a `event_id` + QoS 1 nos eventos críticos |
| Só chave composta (sem `event_id`) | Não estende o payload de exemplo | Ambígua sob reenvio/reordenação; pior evolução de contrato | `event_id` deixa a regra auditável e testável |
| Consumir OEE direto do MQTT (sem fila) | Menos componentes | Sem backpressure claro; picos derrubam o cálculo | O volume 200→1000+ máquinas e 1–5 s pede desacoplamento |

## Consequências

- **Positivas:** Contract tests com fixtures reais; matriz QoS defensável na entrevista; DLQ isolada do caminho quente.
- **Negativas / dívidas:** Extensão do contrato mínimo com `event_id` (documentada). A perda eventual de mensagens de telemetria é considerada aceitável para o cálculo de OEE no escopo deste MVP, uma vez que eventos de estado, parada e produção permanecem protegidos por QoS 1 e idempotência.
- **Como reavaliar:** Se telemetria passar a alimentar alarmística crítica, elevar QoS ou amostragem na borda; se publishers não gerarem `event_id`, o fallback composto permanece. Esta decisão poderá ser revisada caso os requisitos funcionais ou não funcionais da solução se alterem significativamente.
