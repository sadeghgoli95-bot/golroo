import type { ReportFormat } from "../types";
import type { ReportDefinition, ReportGenerator } from "./types";

const JSON_MIME_TYPE = "application/json";

/**
 * Only "json" actually works in this phase — pdf/excel/csv remain
 * interface-only (ReportGenerator.generate accepts any ReportFormat, but
 * this implementation rejects the ones it can't produce yet rather than
 * silently returning something wrong).
 */
export function createJsonReportGenerator(definition: ReportDefinition, data: unknown): ReportGenerator {
  return {
    definition,
    generate: async (format: ReportFormat) => {
      if (format !== "json") {
        throw new Error(`Report format "${format}" is not implemented yet`);
      }
      return new Blob([JSON.stringify(data, null, 2)], { type: JSON_MIME_TYPE });
    },
  };
}
