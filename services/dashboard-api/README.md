# `@oee/dashboard-api`

API de leitura do dashboard operacional.

## Responsabilidade

Expor OEE, status, perdas, tendência e sumários derivados (linha/galpão) para o backoffice. Apenas leitura; escrita de agregações é do `oee-service`. Alinhada ao [wireframe](../../docs/wireframe/dashboard.md).

## Status do MVP

| Item | Status |
|------|--------|
| `openapi.yaml` (OpenAPI 3.1, v0.1.0) | Feito |
| Validação Redocly | Feito |
| Handlers HTTP | Fora do MVP |
| Autenticação | Fora do MVP (`security: []`) |

## Como executar

```bash
npm run validate:openapi
```

## Endpoints (contrato)

| Operação | Path |
|----------|------|
| OEE | `GET /machines/{machineId}/oee` |
| Status | `GET /machines/{machineId}/status` |
| Perdas | `GET /machines/{machineId}/losses` |
| Tendência | `GET /machines/{machineId}/timeline` |
| Linha | `GET /lines/{lineId}/summary` |
| Galpão | `GET /sites/{siteId}/summary` |

## TODO consciente

Implementação HTTP e mecanismo de atualização quase em tempo real — decisão futura (ver wireframe).
