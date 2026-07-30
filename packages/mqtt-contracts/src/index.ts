/**
 * Contratos MQTT versionados (`*.v1`) com `event_id` (ADR-002).
 *
 * Os exemplos em `data/exemplos-mqtt/` permanecem intactos (payload original do
 * desafio). Fixtures de teste injetam `event_id` para validar o contrato evoluído.
 */
export {
  idempotencyKey,
  withEventId,
  type EventTipo,
  type IdempotencyInput,
} from "./idempotency.js";
export {
  isMqttSchemaName,
  validateMqttMessage,
  type MqttSchemaName,
  type ValidationResult,
} from "./validate.js";
