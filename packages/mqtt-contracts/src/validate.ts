import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

export type MqttSchemaName =
  | "telemetria.v1"
  | "estado.v1"
  | "parada.v1"
  | "producao.v1";

const SCHEMA_FILES: Record<MqttSchemaName, string> = {
  "telemetria.v1": "telemetria.v1.json",
  "estado.v1": "estado.v1.json",
  "parada.v1": "parada.v1.json",
  "producao.v1": "producao.v1.json",
};

const here = dirname(fileURLToPath(import.meta.url));
const schemasDir = join(here, "..", "schemas");

function loadJsonSchema(fileName: string): object {
  return JSON.parse(readFileSync(join(schemasDir, fileName), "utf8")) as object;
}

const ajv = new Ajv({
  allErrors: true,
  strict: true,
  removeAdditional: false,
});
addFormats(ajv);

const validators = new Map<MqttSchemaName, ValidateFunction>();

for (const [name, file] of Object.entries(SCHEMA_FILES) as [
  MqttSchemaName,
  string,
][]) {
  validators.set(name, ajv.compile(loadJsonSchema(file)));
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: ErrorObject[] };

export function validateMqttMessage(
  schemaName: MqttSchemaName,
  payload: unknown,
): ValidationResult {
  const validate = validators.get(schemaName);
  if (!validate) {
    return {
      ok: false,
      errors: [
        {
          keyword: "schema",
          instancePath: "",
          schemaPath: "",
          params: {},
          message: `Unknown schema: ${schemaName}`,
        },
      ],
    };
  }

  if (validate(payload)) {
    return { ok: true };
  }

  // Ajv populates `errors` whenever validation fails.
  return { ok: false, errors: [...(validate.errors as ErrorObject[])] };
}

export function isMqttSchemaName(value: string): value is MqttSchemaName {
  return value in SCHEMA_FILES;
}
