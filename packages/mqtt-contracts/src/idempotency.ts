export type EventTipo = "telemetria" | "estado" | "parada" | "producao";

export type IdempotencyInput = {
  event_id?: string;
  maquina_id: string;
  ts_sensor: string;
  tipo_evento: EventTipo;
};

/**
 * Chave de deduplicação (ADR-002):
 * 1) event_id quando presente
 * 2) fallback maquina_id + ts_sensor + tipo_evento
 */
export function idempotencyKey(input: IdempotencyInput): string {
  if (input.event_id && input.event_id.length > 0) {
    return `event_id:${input.event_id}`;
  }

  return `fallback:${input.maquina_id}|${input.ts_sensor}|${input.tipo_evento}`;
}

export function withEventId<T extends object>(
  payload: T,
  eventId: string,
): T & { event_id: string } {
  return { ...payload, event_id: eventId };
}
