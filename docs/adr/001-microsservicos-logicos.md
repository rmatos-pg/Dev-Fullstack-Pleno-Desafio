# ADR-001: Microsserviços lógicos

- **Status:** Aceito
- **Data:** 2026-07-30
- **Decisores:** Rodrigo Matos

## Contexto

O desafio pede arquitetura event-driven para ingestão MQTT e dashboard de OEE, com avaliação explícita de limites de serviço (monorepo vs microsserviços) e de coerência entre decisão e entrega. A especificação permite walking skeleton **ou** wireframe + contrato de API; o MVP adotado prioriza contratos e o núcleo de OEE.

É necessário separar responsabilidades de **ingestão**, **cálculo de OEE**, **exposição da API** e **interface**, mantendo uma implementação compatível com o escopo do MVP — sem exigir vários runtimes para demonstrar a arquitetura.

## Decisão

Adotar **microsserviços lógicos** em um único repositório de entrega:

| Serviço | Responsabilidade |
|---------|------------------|
| `mqtt-ingestion` | Validação, idempotência, DLQ, emissão de evento interno |
| `oee-service` | Fonte da verdade do OEE (D × P × Q) |
| `dashboard-api` | API de leitura (OpenAPI) |
| `dashboard-ui` | Experiência operacional (wireframe no MVP) |

O MVP implementa o núcleo de negócio em `oee-service` e materializa os contratos por meio dos JSON Schemas MQTT e da especificação OpenAPI. Os demais serviços permanecem documentados e preparados para evolução futura, com unidade de deploy independente prevista na AWS.

**Por que neste desafio:** demonstra separação de responsabilidades e evolução independente dos componentes, preservando um MVP compatível com o que a banca pede (profundidade arquitetural, não produto completo).

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| Monólito único | Menos moving parts no código | Enfraquece o eixo de limites de serviço; mistura ingestão, regra e API | Não evidencia bounded contexts exigidos na avaliação |
| Monorepo modular sem fronteira de deploy | Organização simples | Risco de “pastas sem contrato”; deploy futuro ambíguo | Microsserviços lógicos deixam ownership e deploy explícitos |
| Quatro serviços runtime no MVP | Demo ponta a ponta | Alto custo de glue; foge do foco em ADRs/contratos/OEE | Overengineering para a opção Wireframe + OpenAPI + núcleo |
| Polyrepo (vários GitHub) | Isolamento máximo | Dificulta avaliação do fork único pedido pelo edital | Um fork público é o formato de entrega |

## Consequências

- **Positivas:** C4 Contêiner mapeia 1:1 aos serviços; contratos viram a integração; `oee-service` permanece testável isoladamente.
- **Negativas / dívidas:** Avaliador precisa ler docs para ver ingestão/UI; mitigado por schemas, OpenAPI, wireframe e TODOs explícitos.
- **Como reavaliar:** Quando houver necessidade real de escala/time por domínio, promover cada serviço a pipeline/deploy próprio sem redesenhar os bounded contexts. Esta decisão poderá ser revisada caso os requisitos funcionais ou não funcionais da solução se alterem significativamente.
