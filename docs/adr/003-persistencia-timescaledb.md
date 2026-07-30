# ADR-003: Persistência PostgreSQL + TimescaleDB (RDS)

- **Status:** Aceito
- **Data:** 2026-07-30
- **Decisores:** Rodrigo Matos

## Contexto

O dashboard exige consultas por **máquina** e **turno** sobre dados temporais (OEE, fatores, evolução), com agregações futuras por linha/galpão. Há distinção entre eventos brutos (alta cardinalidade) e agregações materializadas para consulta operacional.

A nuvem escolhida é AWS, mas o modelo de leitura deve permitir evolução da solução **sem dependência forte de serviços proprietários** de time-series, preservando portabilidade dos dados de negócio.

## Decisão

- Usar **Amazon RDS com PostgreSQL + TimescaleDB** como store de leitura/escrita das agregações de OEE.
- `oee-service` é o escritor das agregações (máquina × turno); `dashboard-api` apenas lê.
- Manter **raw/eventos** com retenção limitada (política a detalhar na implementação futura); priorizar agregações para o dashboard.
- Late events **reabrem e recalculam** a janela afetada, com auditoria de revisão.

**Por que neste desafio:** atende consultas temporais e agregações de OEE com SQL familiar, reduz lock-in em relação ao Amazon Timestream e separa claramente dono do dado de domínio da API de leitura.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não |
|-------------|------|---------|-------------|
| Amazon Timestream | Integração nativa AWS | Lock-in; SQL/consultas de negócio menos portáveis | Portabilidade e flexibilidade pesaram para o modelo OEE |
| PostgreSQL sem Timescale | Simples | Janelas e séries longas ficam manuais/caras | OEE é inerentemente temporal |
| Data lake / só objetos S3 | Barato para raw | Ruim como fonte primária do dashboard operacional | Latência e modelo não batem com máquina/turno ao vivo |

## Consequências

- **Positivas:** Centraliza dados relacionais e séries temporais em uma única plataforma, simplificando consultas operacionais e agregações de OEE; alinhado a agregações máquina/turno; migração futura para outro Postgres/Timescale possível.
- **Negativas / dívidas:** Operar extensão Timescale no RDS; política de retenção raw precisa ser implementada quando houver runtime.
- **Como reavaliar:** Se o volume raw explodir além do previsível, separar cold storage (S3) mantendo Timescale para agregações quentes. Esta decisão poderá ser revisada caso os requisitos funcionais ou não funcionais da solução se alterem significativamente.
