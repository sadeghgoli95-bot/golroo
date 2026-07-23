"use client";

import { toCsv } from "@/lib/analytics/export/toCsv";

type ExportBarProps = {
  filename: string;
  csvRows: Record<string, string | number | boolean | null>[];
  jsonData: unknown;
};

function downloadBlob(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * The one export UI every dashboard page reuses. CSV/JSON are generated
 * client-side from data the page already fetched — no server round-trip,
 * no new dependency. "PDF" is the browser's own print-to-PDF (Ctrl+P),
 * styled by the print stylesheet in dashboard.css — no PDF-generation
 * library, per the reduced-scope export decision for this dashboard.
 */
export default function ExportBar({ filename, csvRows, jsonData }: ExportBarProps) {
  return (
    <div className="dashboard-export-bar" data-print-hide>
      <button type="button" onClick={() => downloadBlob(toCsv(csvRows), "text/csv;charset=utf-8", `${filename}.csv`)}>
        خروجی CSV
      </button>
      <button
        type="button"
        onClick={() => downloadBlob(JSON.stringify(jsonData, null, 2), "application/json", `${filename}.json`)}
      >
        خروجی JSON
      </button>
      <button type="button" onClick={() => window.print()}>
        چاپ / PDF
      </button>
    </div>
  );
}
