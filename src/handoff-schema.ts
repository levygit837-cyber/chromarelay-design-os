import path from "node:path";
import { readFile } from "node:fs/promises";
import { Ajv2020 } from "ajv/dist/2020.js";
import type { ErrorObject } from "ajv/dist/2020.js";
import { ContractError } from "./domain.js";
import type { HandoffValidator } from "./domain.js";

export type { HandoffValidator } from "./domain.js";

/**
 * `date-time` supplied inline rather than through `ajv-formats`: default strict mode refuses to
 * compile a schema whose format it does not know, and the framework schemas declare exactly one.
 * One dependency instead of two.
 */
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})?$/;

async function readSchema(root: string, name: string): Promise<object> {
  return JSON.parse(await readFile(path.join(root, "schemas", name), "utf8")) as object;
}

/** One violation, rendered so the offending property name survives. `errorsText()` drops it. */
function detail(error: ErrorObject): string {
  const at = error.instancePath || "/";
  const extra = error.params["additionalProperty"];
  const missing = error.params["missingProperty"];
  const suffix = typeof extra === "string" ? ` (${extra})`
    : typeof missing === "string" ? ` (${missing})`
    : "";
  return `${at} ${error.message ?? "is invalid"}${suffix}`;
}

/**
 * Compiles `framework/schemas/handoff.schema.json` once and returns a validator over it. The two
 * `$ref` targets are registered by `$id` first, without which `compile` throws `MissingRefError`.
 */
export async function loadHandoffValidator(systemRoot: string): Promise<HandoffValidator> {
  const root = path.resolve(systemRoot);
  const [handoffSchema, artifactSchema, decisionSchema] = await Promise.all([
    readSchema(root, "handoff.schema.json"),
    readSchema(root, "artifact.schema.json"),
    readSchema(root, "decision.schema.json")
  ]);

  const ajv = new Ajv2020({ allErrors: true, formats: { "date-time": DATE_TIME } });
  ajv.addSchema([artifactSchema, decisionSchema]);
  const validate = ajv.compile(handoffSchema);

  return (handoff: unknown): void => {
    if (validate(handoff)) return;
    const errors = validate.errors ?? [];
    throw new ContractError(
      `Handoff does not satisfy framework/schemas/handoff.schema.json:\n- ${errors.map(detail).join("\n- ")}`
    );
  };
}

/** The second adapter at the seam: for tests whose subject is not schema conformance. */
export function noopHandoffValidator(): HandoffValidator {
  return (): void => {};
}
