# `@oee/oee-service`

Núcleo de regras de negócio do OEE.

## Responsabilidade

Calcular Disponibilidade × Performance × Qualidade (produto), com clamp em `[0,1]` e sinalização `dados_inconsistentes` + `motivos`. Fonte da verdade do indicador. Ver [ARQUITETURA.md](../../docs/ARQUITETURA.md).

## Status do MVP

| Item | Status |
|------|--------|
| `calculateOee` (função pura) | Feito |
| Vitest (válido, produto ≠ média, clamp, inconsistências, ÷0) | Feito |
| Agregação por turno / late events / persistência | Fora do MVP de código |

## Como executar

```bash
npm run test -w @oee/oee-service
npm run typecheck -w @oee/oee-service
```

## TODO consciente

- Agregações máquina/turno e recomputação de late events.
- Persistência PostgreSQL + TimescaleDB ([ADR-003](../../docs/adr/003-persistencia-timescaledb.md)).
- Consumo de eventos vindos de `mqtt-ingestion`.
