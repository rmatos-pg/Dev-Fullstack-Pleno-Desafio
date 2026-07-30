# `@oee/mqtt-ingestion`

Microsserviço lógico de ingestão MQTT.

## Responsabilidade

Validar contratos (`@oee/mqtt-contracts`), deduplicar por `event_id`, enviar inválidos à DLQ e publicar evento interno para `oee-service`. Ver [ADR-001](../../docs/adr/001-microsservicos-logicos.md) e [ADR-002](../../docs/adr/002-mqtt-qos-event-id.md).

## Status do MVP

| Item | Status |
|------|--------|
| Bounded context documentado | Feito |
| Runtime (broker, SQS, consumer) | Fora do MVP |
| Simulador/publisher | Fora do MVP (recomendado no edital, não obrigatório) |

## Como executar

Não há processo executável neste serviço no MVP. Contratos e testes relacionados:

```bash
npm run test -w @oee/mqtt-contracts
```

## TODO consciente

- MQTT Bridge na borda, AWS IoT Core e SQS — [ARQUITETURA.md](../../docs/ARQUITETURA.md).
- Implementação do consumidor e (opcional) simulador a partir de `data/exemplos-mqtt/`.
