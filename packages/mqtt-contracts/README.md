# `@oee/mqtt-contracts`

Contratos MQTT (JSON Schema) compartilhados.

## Responsabilidade

Versionar schemas `*.v1` (telemetria, estado, parada, produção) com `event_id` obrigatório para idempotência. Consumido por testes e, no desenho, por `mqtt-ingestion`. Ver [ADR-002](../../docs/adr/002-mqtt-qos-event-id.md).

## Status do MVP

| Item | Status |
|------|--------|
| Schemas JSON em `schemas/` | Feito |
| Validação Ajv + `withEventId` / `idempotencyKey` | Feito |
| Vitest (válido, inválido, dedup) | Feito |
| Exemplos da banca em `data/exemplos-mqtt/` | Intactos (opção A) |

## Como executar

```bash
npm run test -w @oee/mqtt-contracts
npm run typecheck -w @oee/mqtt-contracts
```

## TODO consciente

Runtime de publish/subscribe MQTT não pertence a este pacote — fica em `mqtt-ingestion`.
