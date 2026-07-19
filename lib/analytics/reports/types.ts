import type { ReportFormat } from "../types";

export type ReportDefinition = {
  id: string;
  title: string;
  formats: ReportFormat[];
};

export type ReportGenerator = {
  definition: ReportDefinition;
  generate: (format: ReportFormat) => Promise<Blob>;
};
