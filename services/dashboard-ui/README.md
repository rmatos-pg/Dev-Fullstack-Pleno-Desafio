# `@oee/dashboard-ui`

Microsserviço lógico da experiência operacional.

## Responsabilidade

Atender as personas (operador, supervisor, gestor, manutenção) com as telas do dashboard. No MVP a entrega é wireframe (Mermaid + Markdown), não uma aplicação frontend.

## Status do MVP

| Item | Status |
|------|--------|
| Wireframe em `docs/wireframe/dashboard.md` | Feito |
| Mapeamento tela → endpoints OpenAPI | Feito |
| App frontend (React etc.) | Fora do MVP (opção B da especificação) |

## Como executar

Não há build de UI. Consulte o artefato:

- [docs/wireframe/dashboard.md](../../docs/wireframe/dashboard.md)
- Contrato: [dashboard-api/openapi.yaml](../dashboard-api/openapi.yaml)

## TODO consciente

Implementação visual da interface e escolha do mecanismo de atualização quase em tempo real (desacoplado no wireframe).
