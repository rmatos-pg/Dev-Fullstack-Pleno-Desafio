# AGENTS.md

Contexto operacional para agentes de IA (e novos contribuidores) neste repositório.

## Objetivo do repositório

Entrega do desafio técnico: arquitetura event-driven para ingestão MQTT e dashboard operacional de **OEE** em indústria têxtil. Prioridade: decisões justificadas no contexto do desafio, contratos versionados e núcleo de regra de negócio testável — não um produto completo.

## Arquitetura (microsserviços lógicos)

| Unidade | Papel no MVP |
|---------|----------------|
| `packages/mqtt-contracts` | JSON Schema MQTT `*.v1` + `event_id` (Ajv, Vitest) |
| `services/mqtt-ingestion` | Ingestão — **só documentação** |
| `services/oee-service` | `calculateOee` + Vitest (**núcleo executável**) |
| `services/dashboard-api` | `openapi.yaml` (OpenAPI 3.1) |
| `services/dashboard-ui` | Aponta ao wireframe Mermaid/Markdown |

Fluxo: MQTT → ingestion → oee-service → store (desenho) → dashboard-api → UI.

## Escopo do MVP

**Implementar / manter**
- Contratos MQTT e OpenAPI
- Cálculo OEE (produto D × P × Q, clamp, `dados_inconsistentes`)
- Testes, lint, typecheck, coverage ≥ 85%, CI
- Documentação em `docs/` (ARQUITETURA, ADRs, DECISOES, TRADEOFFS, wireframe)

**Não implementar sem pedido explícito**
- Runtime dos quatro serviços / `docker-compose` completo
- Broker MQTT real / AWS provisionada / deploy automático
- UI React (ou similar)
- Autenticação na API
- Alterar arquivos originais em `data/exemplos-mqtt/` (usar fixtures derivadas com `event_id`)

## Comandos

Node.js **22+**.

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run coverage
npm run validate:schemas
npm run validate:openapi
```

## Organização

```text
docs/           # arquitetura, ADRs, wireframe, AI_ASSISTED
packages/       # contratos compartilhados
services/       # microsserviços lógicos
data/           # exemplos MQTT da banca (intactos)
.github/        # CI + template de PR
```

## Regras para agentes de IA

1. Justifique escolhas pelo **problema deste desafio**, não por “boa prática” genérica.
2. OEE = **produto** dos fatores — nunca média aritmética.
3. Preserve `data/exemplos-mqtt/`; injete `event_id` só em fixtures de teste.
4. Não expanda escopo (HTTP handlers, Timescale runtime, SSE, etc.) sem alinhamento.
5. Mantenha coerência com ADRs e `docs/ARQUITETURA.md`.
6. Prefira poucos arquivos focados a documentação duplicada.

## Referências

- [docs/ARQUITETURA.md](docs/ARQUITETURA.md)
- [docs/DECISOES.md](docs/DECISOES.md)
- [docs/TRADEOFFS.md](docs/TRADEOFFS.md)
- [docs/adr/](docs/adr/)
- [docs/wireframe/dashboard.md](docs/wireframe/dashboard.md)
- [docs/AI_ASSISTED.md](docs/AI_ASSISTED.md)
- [docs/ENTREGAVEIS.md](docs/ENTREGAVEIS.md)
