import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  idempotencyKey,
  isMqttSchemaName,
  validateMqttMessage,
  withEventId,
  type MqttSchemaName,
} from "../src/index.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const exemplosDir = join(repoRoot, "data", "exemplos-mqtt");

function parseNdjson(fileName: string): Record<string, unknown>[] {
  const raw = readFileSync(join(exemplosDir, fileName), "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("//"))
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

function schemaFromPayload(payload: Record<string, unknown>): MqttSchemaName {
  const name = String(payload.schema);
  if (!isMqttSchemaName(name)) {
    throw new Error(`Unexpected schema in fixture: ${name}`);
  }
  return name;
}

describe("MQTT contracts (option A: derived fixtures with event_id)", () => {
  it("detects known and unknown schema names", () => {
    expect(isMqttSchemaName("telemetria.v1")).toBe(true);
    expect(isMqttSchemaName("outro.v1")).toBe(false);
  });

  it("rejects challenge payloads without event_id (original examples untouched)", () => {
    const telemetria = parseNdjson("telemetria.ndjson")[0];
    const result = validateMqttMessage("telemetria.v1", telemetria);
    expect(result.ok).toBe(false);
  });

  it("accepts derived fixtures with injected event_id for all message types", () => {
    const samples: { file: string; pick: (rows: Record<string, unknown>[]) => Record<string, unknown> }[] =
      [
        { file: "telemetria.ndjson", pick: (rows) => rows[0] },
        {
          file: "estado-parada.ndjson",
          pick: (rows) => rows.find((r) => r.schema === "estado.v1")!,
        },
        {
          file: "estado-parada.ndjson",
          pick: (rows) => rows.find((r) => r.schema === "parada.v1")!,
        },
        { file: "producao.ndjson", pick: (rows) => rows[0] },
      ];

    for (const sample of samples) {
      const base = sample.pick(parseNdjson(sample.file));
      const schema = schemaFromPayload(base);
      const derived = withEventId(base, `evt-test-${schema}`);
      const result = validateMqttMessage(schema, derived);
      expect(result.ok, JSON.stringify(result)).toBe(true);
    }
  });

  it("rejects unknown schema names at the validator boundary", () => {
    const result = validateMqttMessage(
      "desconhecido.v1" as MqttSchemaName,
      {},
    );
    expect(result.ok).toBe(false);
  });

  it("rejects invalid enum on estado", () => {
    const base = parseNdjson("estado-parada.ndjson").find(
      (r) => r.schema === "estado.v1",
    )!;
    const derived = withEventId(
      { ...base, estado: "desconhecido" },
      "evt-invalid-estado",
    );
    const result = validateMqttMessage("estado.v1", derived);
    expect(result.ok).toBe(false);
  });

  it("uses event_id as primary idempotency key", () => {
    expect(
      idempotencyKey({
        event_id: "abc-123",
        maquina_id: "TEAR-G1-L2-07",
        ts_sensor: "2026-03-10T13:45:00.000Z",
        tipo_evento: "parada",
      }),
    ).toBe("event_id:abc-123");
  });

  it("falls back to maquina_id + ts_sensor + tipo_evento", () => {
    expect(
      idempotencyKey({
        maquina_id: "TEAR-G1-L2-07",
        ts_sensor: "2026-03-10T13:45:00.000Z",
        tipo_evento: "parada",
      }),
    ).toBe("fallback:TEAR-G1-L2-07|2026-03-10T13:45:00.000Z|parada");
  });

  it("maps duplicate challenge parada lines to the same key when event_id is shared", () => {
    const paradas = parseNdjson("estado-parada.ndjson").filter(
      (r) => r.schema === "parada.v1",
    );
    expect(paradas.length).toBeGreaterThanOrEqual(2);

    const first = withEventId(paradas[0], "evt-parada-dup");
    const second = withEventId(paradas[1], "evt-parada-dup");

    const keyA = idempotencyKey({
      event_id: String(first.event_id),
      maquina_id: String(first.maquina_id),
      ts_sensor: String(first.ts_sensor),
      tipo_evento: "parada",
    });
    const keyB = idempotencyKey({
      event_id: String(second.event_id),
      maquina_id: String(second.maquina_id),
      ts_sensor: String(second.ts_sensor),
      tipo_evento: "parada",
    });

    expect(keyA).toBe(keyB);
    expect(validateMqttMessage("parada.v1", first).ok).toBe(true);
    expect(validateMqttMessage("parada.v1", second).ok).toBe(true);
  });
});
