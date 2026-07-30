# Decisões técnicas (MVP)

Este documento consolida as principais decisões técnicas da solução, incluindo tecnologias, ferramentas e bibliotecas adotadas no MVP. O objetivo é registrar o motivo de cada escolha no contexto deste desafio. As decisões arquiteturais detalhadas estão documentadas nos [ADRs](./adr/), enquanto as alternativas consideradas encontram-se em [TRADEOFFS.md](./TRADEOFFS.md).

## Decisões da solução

| Tema | Escolha | Justificativa | Referência |
|------|---------|---------------|------------|
| Entrega | Wireframe + OpenAPI + núcleo executável | Prioriza arquitetura, contratos e regras de negócio conforme o escopo do desafio. | [ARQUITETURA.md](./ARQUITETURA.md) |
| Organização | Microsserviços lógicos | Separa responsabilidades sem exigir múltiplos runtimes no MVP. | [ADR-001](./adr/001-microsservicos-logicos.md) |
| MQTT | QoS 0/1/1/1 + `event_id` | Equilibra desempenho e confiabilidade para o cálculo do OEE. | [ADR-002](./adr/002-mqtt-qos-event-id.md) |
| Persistência | PostgreSQL + TimescaleDB | Atende consultas temporais reduzindo lock-in. | [ADR-003](./adr/003-persistencia-timescaledb.md) |
| Nuvem | AWS | Serviços gerenciados compatíveis com arquitetura orientada a eventos. | [ARQUITETURA.md](./ARQUITETURA.md) |
| CI/CD | GitHub Actions | Automatiza validações e quality gates do projeto. | [ARQUITETURA.md](./ARQUITETURA.md) |
| Harness | Vitest + Ajv + Redocly | Valida regras de negócio e contratos da solução. | [AI_ASSISTED.md](./AI_ASSISTED.md) |

## Stack e ferramentas

| Ferramenta | Uso | Justificativa |
|------------|-----|---------------|
| Node.js | Runtime | Ecossistema único para o núcleo do MVP. |
| TypeScript | Linguagem | Tipagem estática e melhor manutenção das regras de negócio. |
| Vitest | Testes | Cobertura do cálculo de OEE e testes rápidos no CI. |
| Ajv | JSON Schema | Validação dos contratos MQTT. |
| Redocly CLI | OpenAPI | Validação automática da especificação da API. |
| ESLint | Qualidade | Padronização e prevenção de erros comuns. |
| TypeScript Compiler (`tsc`) | Typecheck | Validação estática antes da execução dos testes. |
| GitHub Actions | CI | Execução automática dos quality gates. |
| Mermaid | Diagramas | Diagramas versionados diretamente no repositório. |
| SonarCloud | Qualidade contínua | Quality Gate condicional quando configurado no ambiente (estratégia S1). |
